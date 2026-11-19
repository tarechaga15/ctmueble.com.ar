'use strict';

const crypto = require('crypto');
const { canonicalize } = require('./CanonicalJson');

class SnapshotCryptoService {
  constructor(options = {}) {
    this.rsaPrivateKeyPem = options.rsaPrivateKeyPem || this._resolveRsaPrivateKey();
    this.rsaPublicKeyPem = options.rsaPublicKeyPem || this._resolveRsaPublicKey();
    this.hmacSecret = options.hmacSecret || this._resolveHmacSecret();
    this.defaultAlgorithm = options.defaultAlgorithm || (this.rsaPrivateKeyPem ? 'RSA-SHA256' : 'HMAC-SHA256');
  }

  static getInstance() {
    if (!SnapshotCryptoService._instance) {
      SnapshotCryptoService._instance = new SnapshotCryptoService();
    }
    return SnapshotCryptoService._instance;
  }

  _resolveRsaPrivateKey() {
    if (process.env.SYSTEM_SIGNING_PRIVATE_KEY) {
      return process.env.SYSTEM_SIGNING_PRIVATE_KEY;
    }
    if (process.env.ARCA_KEY_BASE64) {
      try {
        const decoded = Buffer.from(process.env.ARCA_KEY_BASE64, 'base64').toString('utf8');
        if (decoded.includes('BEGIN') && decoded.includes('PRIVATE KEY')) {
          return decoded;
        }
      } catch (_) {}
    }
    return null;
  }

  _resolveRsaPublicKey() {
    if (process.env.SYSTEM_SIGNING_PUBLIC_KEY) {
      return process.env.SYSTEM_SIGNING_PUBLIC_KEY;
    }
    if (process.env.ARCA_CERT_BASE64) {
      try {
        const decoded = Buffer.from(process.env.ARCA_CERT_BASE64, 'base64').toString('utf8');
        if (decoded.includes('BEGIN') && (decoded.includes('CERTIFICATE') || decoded.includes('PUBLIC KEY'))) {
          // Extraer public key del certificado si es certificado
          return crypto.createPublicKey(decoded).export({ type: 'spki', format: 'pem' });
        }
      } catch (_) {}
    }
    if (this.rsaPrivateKeyPem) {
      try {
        return crypto.createPublicKey(this.rsaPrivateKeyPem).export({ type: 'spki', format: 'pem' });
      } catch (_) {}
    }
    return null;
  }

  _resolveHmacSecret() {
    const secret =
      process.env.SYSTEM_SIGNING_SECRET ||
      process.env.MASTER_ENCRYPTION_KEY_V1 ||
      process.env.APP_ENCRYPTION_KEY ||
      process.env.JWT_ACCESS_SECRET ||
      process.env.JWT_SECRET;

    if (secret) {
      return secret;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Configuración insegura en producción: defina SYSTEM_SIGNING_SECRET o MASTER_ENCRYPTION_KEY_V1'
      );
    }

    return 'ctm-audit-default-secure-signing-secret-v1';
  }

  /**
   * Genera la representación canónica y su hash SHA-256 en formato hexadecimal.
   */
  hashCanonical(data) {
    const canonicalString = canonicalize(data);
    const hash = crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
    return {
      canonicalString,
      canonicalHash: hash
    };
  }

  /**
   * Firma criptográficamente un hash o digest.
   * Utiliza RSA-SHA256 si la clave RSA está configurada, o HMAC-SHA256 con la clave maestra.
   */
  signHash(hashHex, algorithm = null) {
    const algo = algorithm || this.defaultAlgorithm;

    if (algo === 'RSA-SHA256' && this.rsaPrivateKeyPem) {
      try {
        const signer = crypto.createSign('SHA256');
        signer.update(Buffer.from(hashHex, 'hex'));
        signer.end();
        const signature = signer.sign(this.rsaPrivateKeyPem, 'base64');
        return {
          signature,
          algorithm: 'RSA-SHA256'
        };
      } catch (err) {
        // Fallback a HMAC si falla RSA por formato de clave
        console.warn('[SnapshotCryptoService] Fallback a HMAC-SHA256 por error en firma RSA:', err.message);
      }
    }

    // HMAC-SHA256
    const signature = crypto
      .createHmac('sha256', this.hmacSecret)
      .update(Buffer.from(hashHex, 'hex'))
      .digest('base64');

    return {
      signature,
      algorithm: 'HMAC-SHA256'
    };
  }

  /**
   * Verifica la firma criptográfica sobre el hash.
   */
  verifySignature(hashHex, signatureBase64, algorithm = 'HMAC-SHA256') {
    if (!hashHex || !signatureBase64) return false;

    if (algorithm === 'RSA-SHA256') {
      const pubKey = this.rsaPublicKeyPem || (this.rsaPrivateKeyPem ? crypto.createPublicKey(this.rsaPrivateKeyPem) : null);
      if (!pubKey) return false;
      try {
        const verifier = crypto.createVerify('SHA256');
        verifier.update(Buffer.from(hashHex, 'hex'));
        verifier.end();
        return verifier.verify(pubKey, signatureBase64, 'base64');
      } catch (_) {
        return false;
      }
    }

    if (algorithm === 'HMAC-SHA256') {
      try {
        const expected = crypto
          .createHmac('sha256', this.hmacSecret)
          .update(Buffer.from(hashHex, 'hex'))
          .digest('base64');

        const expectedBuf = Buffer.from(expected, 'base64');
        const incomingBuf = Buffer.from(signatureBase64, 'base64');
        if (expectedBuf.length !== incomingBuf.length) return false;
        return crypto.timingSafeEqual(expectedBuf, incomingBuf);
      } catch (_) {
        return false;
      }
    }

    return false;
  }

  /**
   * Valida la integridad completa de una snapshot almacenada en la base de datos:
   * 1. Recalcula el hash canónico de los datos.
   * 2. Compara con el hash almacenado (detección de manipulación de datos en BD).
   * 3. Verifica la firma digital del hash (autenticidad e infalsificabilidad).
   */
  verifySnapshotIntegrity(snapshot) {
    if (!snapshot) {
      return { valid: false, reason: 'SNAPSHOT_MISSING', message: 'La snapshot no existe' };
    }

    const rawData = snapshot.snapshot_data || snapshot.snapshotData || snapshot.data;
    if (!rawData) {
      return { valid: false, reason: 'DATA_EMPTY', message: 'Los datos de la snapshot están vacíos' };
    }

    const { canonicalHash } = this.hashCanonical(rawData);
    const storedHash = snapshot.canonical_hash || snapshot.canonicalHash;

    if (canonicalHash !== storedHash) {
      return {
        valid: false,
        reason: 'HASH_MISMATCH',
        message: 'Los datos en la base de datos fueron modificados o alterados (integridad rota)',
        expectedHash: canonicalHash,
        storedHash
      };
    }

    const signature = snapshot.signature;
    const algorithm = snapshot.signature_algorithm || snapshot.signatureAlgorithm || 'HMAC-SHA256';

    const isSignatureValid = this.verifySignature(canonicalHash, signature, algorithm);
    if (!isSignatureValid) {
      return {
        valid: false,
        reason: 'SIGNATURE_INVALID',
        message: 'La firma criptográfica no es válida para la clave del sistema',
        canonicalHash,
        algorithm
      };
    }

    return {
      valid: true,
      canonicalHash,
      algorithm,
      message: 'Integridad criptográfica verificada exitosamente'
    };
  }
}

module.exports = SnapshotCryptoService;
