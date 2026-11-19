/**
 * Servicio de infraestructura para manejar la conexión con ARCA/AFIP.
 * Gestiona la autenticación mediante tickets de acceso (TA) usando WSAA en memoria
 * y caché distribuida en Redis para evitar errores coe.alreadyAuthenticated en Vercel.
 */
const fs = require('fs');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const forge = require('node-forge');

const XML_SAFE_SERVICE_RE = /^[a-zA-Z0-9_.-]{1,64}$/;
const CUIT_DIGITS_RE = /^\d{11}$/;

// Caché local de respaldo por instancia cuando Redis no esté disponible
const localTaCache = new Map();

class ArcaConnection {
  /**
   * Soporta tanto llamada por objeto `{ cuit, service, certFile, keyFile, logger, redisClient }`
   * como firma posicional `(cuit, service, certFile, keyFile, logger, redisClient)`.
   */
  constructor(cuitOrOptions, service, certFile, keyFile, logger, redisClient) {
    let opts = {};
    if (cuitOrOptions && typeof cuitOrOptions === 'object' && !Array.isArray(cuitOrOptions)) {
      opts = cuitOrOptions;
    } else {
      opts = { cuit: cuitOrOptions, service, certFile, keyFile, logger, redisClient };
    }

    const certBase64 = process.env.ARCA_CERT_BASE64;
    const keyBase64 = process.env.ARCA_KEY_BASE64;
    const useCertFromEnv = Boolean(certBase64 && keyBase64);
    const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

    this._certBase64 = useCertFromEnv ? certBase64 : null;
    this._keyBase64 = useCertFromEnv ? keyBase64 : null;
    // En producción / Vercel jamás buscar claves privadas empaquetadas en el repo
    this.certFile = useCertFromEnv ? null : (isProd ? null : (opts.certFile || process.env.ARCA_CERT_FILE || null));
    this.keyFile = useCertFromEnv ? null : (isProd ? null : (opts.keyFile || process.env.ARCA_KEY_FILE || null));

    const resolvedCuit = String(opts.cuit || process.env.ARCA_CUIT || '').replace(/\D/g, '');
    const resolvedService = String(opts.service || process.env.ARCA_SERVICE || 'ws_sr_padron_a13').trim();

    if (!XML_SAFE_SERVICE_RE.test(resolvedService)) {
      throw new Error('Nombre de servicio ARCA inválido');
    }

    this.cuit = resolvedCuit;
    this.service = resolvedService;
    this.wsaaUrl = process.env.ARCA_WSAA_URL || 'https://wsaa.afip.gov.ar/ws/services/LoginCms';
    this.httpTimeoutMs = Number(process.env.ARCA_TIMEOUT_MS || 8000);
    this.logger = opts.logger || console;
    this.redisClient = opts.redisClient || null;
  }

  _getCertAndKeyPEM() {
    if (this._certBase64 && this._keyBase64) {
      return {
        certPem: Buffer.from(this._certBase64, 'base64').toString('utf8'),
        keyPem: Buffer.from(this._keyBase64, 'base64').toString('utf8'),
      };
    }

    if (!this.certFile || !this.keyFile) {
      throw new Error('Credenciales ARCA no configuradas (defina ARCA_CERT_BASE64 y ARCA_KEY_BASE64)');
    }

    return {
      certPem: fs.readFileSync(this.certFile, 'utf8'),
      keyPem: fs.readFileSync(this.keyFile, 'utf8'),
    };
  }

  async getTA() {
    if (!CUIT_DIGITS_RE.test(this.cuit)) {
      throw new Error('ARCA_CUIT inválido o no configurado');
    }

    const cacheKey = `afip:ta:${this.cuit}:${this.service}`;
    const safetyMarginMs = 60 * 1000;

    // 1. Intentar leer desde Redis
    if (this.redisClient && this.redisClient.isConfigured?.() !== false) {
      try {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          const ta = JSON.parse(cached);
          if (new Date(ta.expirationTime).getTime() - safetyMarginMs > Date.now()) {
            return ta;
          }
        }
      } catch (error) {
        this.logger.warn?.('[ARCA] Redis TA read fallback:', error.message);
      }
    }

    // 2. Fallback caché en memoria local de la instancia
    const memCached = localTaCache.get(cacheKey);
    if (memCached && new Date(memCached.expirationTime).getTime() - safetyMarginMs > Date.now()) {
      return memCached;
    }

    const rawTaXml = await this.generateTA();
    const parsedTa = await this.parseTA(rawTaXml);

    const ttlSeconds = Math.max(
      60,
      Math.min(
        11 * 3600,
        Math.floor((new Date(parsedTa.expirationTime).getTime() - Date.now() - safetyMarginMs) / 1000)
      )
    );

    localTaCache.set(cacheKey, parsedTa);

    if (this.redisClient && this.redisClient.isConfigured?.() !== false) {
      try {
        await this.redisClient.set(cacheKey, JSON.stringify(parsedTa), 'EX', ttlSeconds);
      } catch (error) {
        this.logger.warn?.('[ARCA] Redis TA write fallback:', error.message);
      }
    }

    return parsedTa;
  }

  async generateTA() {
    const now = new Date();
    const generation = new Date(now.getTime() - 60 * 1000);
    const expiration = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    const tra = `<?xml version="1.0" encoding="UTF-8"?><loginTicketRequest version="1.0"><header><uniqueId>${Math.floor(now.getTime() / 1000)}</uniqueId><generationTime>${generation.toISOString()}</generationTime><expirationTime>${expiration.toISOString()}</expirationTime></header><service>${this.service}</service></loginTicketRequest>`;

    try {
      const { certPem, keyPem } = this._getCertAndKeyPEM();

      const p7 = forge.pkcs7.createSignedData();
      p7.content = forge.util.createBuffer(tra, 'utf8');

      const cert = forge.pki.certificateFromPem(certPem);
      const privateKey = forge.pki.privateKeyFromPem(keyPem);

      p7.addCertificate(cert);
      p7.addSigner({
        key: privateKey,
        certificate: cert,
        digestAlgorithm: forge.pki.oids.sha256,
        authenticatedAttributes: [
          { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
          { type: forge.pki.oids.messageDigest },
          { type: forge.pki.oids.signingTime, value: now },
        ],
      });

      p7.sign();

      const derBytes = forge.asn1.toDer(p7.toAsn1()).getBytes();
      const signedContent = forge.util.encode64(derBytes);

      const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsaa="http://wsaa.afip.gov.ar/ws/services/LoginCms">
  <soapenv:Header/>
  <soapenv:Body>
    <wsaa:loginCms>
      <wsaa:in0>${signedContent}</wsaa:in0>
    </wsaa:loginCms>
  </soapenv:Body>
</soapenv:Envelope>`;

      const { data } = await axios.post(this.wsaaUrl, soapRequest, {
        headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '' },
        timeout: this.httpTimeoutMs,
        maxContentLength: 1024 * 1024,
        maxBodyLength: 1024 * 1024,
      });
      return data;
    } catch (error) {
      throw new Error(`Error generating TA: ${error.message}`);
    }
  }

  async parseTA(ta) {
    const parser = new XMLParser({ processEntities: false });
    const firstTaJSON = parser.parse(ta);
    const body = firstTaJSON?.['soapenv:Envelope']?.['soapenv:Body'] || firstTaJSON?.Envelope?.Body;
    const xmlString = body?.loginCmsResponse?.loginCmsReturn;
    if (!xmlString) {
      throw new Error('Respuesta WSAA inválida');
    }
    const finalTaJSON = parser.parse(xmlString);
    return {
      token: finalTaJSON.loginTicketResponse.credentials.token,
      sign: finalTaJSON.loginTicketResponse.credentials.sign,
      expirationTime: finalTaJSON.loginTicketResponse.header.expirationTime,
    };
  }
}

module.exports = ArcaConnection;
