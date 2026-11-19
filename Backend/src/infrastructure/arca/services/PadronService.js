/**
 * Servicio de infraestructura para consultar el padrón AFIP/ARCA (A13).
 * Valida estrictamente el CUIT contra inyección XML/SOAP, aplica timeouts y cachea TA en Redis.
 */
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const ArcaConnection = require('./ArcaConnection');
const RedisClient = require('../../redis/RedisClient');

const CUIT_DIGITS_RE = /^\d{11}$/;

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

class PadronService {
  constructor({ redisClient } = {}) {
    this.service = 'ws_sr_padron_a13';
    this.wsPadronUrl =
      process.env.ARCA_PADRON_URL ||
      'https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA13';
    this.httpTimeoutMs = Number(process.env.ARCA_TIMEOUT_MS || 8000);
    this.connection = new ArcaConnection({
      cuit: process.env.ARCA_CUIT,
      service: this.service,
      redisClient: redisClient || RedisClient.getInstance(),
    });
  }

  async getPadron(rawCuit) {
    const cleanCuit = String(rawCuit ?? '').replace(/\D/g, '');
    if (!CUIT_DIGITS_RE.test(cleanCuit)) {
      const err = new Error('El CUIT debe contener exactamente 11 dígitos numéricos');
      err.status = 400;
      err.code = 'INVALID_CUIT';
      throw err;
    }

    const representedCuit = String(process.env.ARCA_CUIT ?? '').replace(/\D/g, '');
    if (!CUIT_DIGITS_RE.test(representedCuit)) {
      throw new Error('ARCA_CUIT no configurado válidamente en el servidor');
    }

    const { token, sign } = await this.connection.getTA();
    const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:a13="http://a13.soap.ws.server.puc.sr/">
  <soapenv:Header/>
  <soapenv:Body>
    <a13:getPersona>
      <token>${escapeXml(token)}</token>
      <sign>${escapeXml(sign)}</sign>
      <cuitRepresentada>${representedCuit}</cuitRepresentada>
      <idPersona>${cleanCuit}</idPersona>
    </a13:getPersona>
  </soapenv:Body>
</soapenv:Envelope>`;

    try {
      const { data } = await axios.post(this.wsPadronUrl, soapRequest, {
        headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '' },
        timeout: this.httpTimeoutMs,
        maxContentLength: 2 * 1024 * 1024,
      });

      const parser = new XMLParser({ ignoreAttributes: false, processEntities: false });
      const response = parser.parse(data);

      const contribuyente =
        response?.['soap:Envelope']?.['soap:Body']?.['ns2:getPersonaResponse']?.personaReturn?.persona;
      if (!contribuyente) {
        return null;
      }

      const domicilios = Array.isArray(contribuyente.domicilio)
        ? contribuyente.domicilio
        : [contribuyente.domicilio].filter(Boolean);

      const addresses = domicilios.map((domicilio) => ({
        address: domicilio.datoAdicional
          ? `${domicilio.direccion} (${domicilio.datoAdicional})`
          : (domicilio.direccion ?? ''),
        location: domicilio.localidad ?? '',
        province: domicilio.idProvincia ?? '',
        origin: 'PUBLIC',
      }));

      return {
        name: contribuyente.razonSocial
          ? contribuyente.razonSocial
          : `${contribuyente.nombre || ''} ${contribuyente.apellido || ''}`.trim(),
        cuit: String(contribuyente.idPersona),
        type: contribuyente.tipoPersona === 'JURIDICA' ? 'LEGAL' : 'PHYSICAL',
        addresses,
      };
    } catch (error) {
      if (error.response && error.response.status === 500) {
        return null;
      }
      throw new Error('Error al consultar el padrón ARCA');
    }
  }
}

module.exports = PadronService;
