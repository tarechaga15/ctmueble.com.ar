const crypto = require('crypto');
const ISecretEncryptionProvider = require('./ISecretEncryptionProvider');

/**
 * Proveedor de cifrado autenticado AES-256-GCM con claves maestras versionadas en entorno.
 * Cumple con estándares NIST SP 800-38D (IV aleatorio de 96 bits, tag de 128 bits).
 */
class AesGcmEncryptionProvider extends ISecretEncryptionProvider {
  constructor(options = {}) {
    super();
    this.defaultVersion = options.defaultVersion || process.env.ACTIVE_ENCRYPTION_KEY_VERSION || 'v1';
    this.algorithm = 'aes-256-gcm';
    this.ivLength = 12; // 96 bits recomendado para GCM
    this.tagLength = 16; // 128 bits auth tag
    this.keyCache = new Map();
  }

  /**
   * Obtiene la clave maestra de 256 bits (32 bytes) para la versión solicitada con caché en memoria.
   * En producción falla cerrado si no existe clave maestra ni JWT_ACCESS_SECRET válido.
   */
  _getMasterKey(version) {
    const ver = String(version || this.defaultVersion);
    const envVarName = `MASTER_ENCRYPTION_KEY_${ver.toUpperCase()}`;
    const rawKey = process.env[envVarName] || process.env.APP_ENCRYPTION_KEY;
    const isProd = process.env.NODE_ENV === 'production';

    const sourceTag = rawKey
      ? `env:${rawKey}`
      : isProd
      ? `prod-hkdf:${process.env.JWT_ACCESS_SECRET || ''}`
      : `dev:${process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'default'}`;

    const cached = this.keyCache.get(ver);
    if (cached && cached.sourceTag === sourceTag) {
      return cached.derivedKey;
    }

    let derivedKey;
    if (rawKey) {
      if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
        derivedKey = Buffer.from(rawKey, 'hex');
      } else if (rawKey.length === 32) {
        derivedKey = Buffer.from(rawKey, 'utf8');
      } else {
        derivedKey = crypto.scryptSync(rawKey, `ctm-salt-${ver}`, 32);
      }
    } else if (isProd) {
      const accessSecret = process.env.JWT_ACCESS_SECRET;
      if (accessSecret && accessSecret.length >= 32) {
        derivedKey = Buffer.from(
          crypto.hkdfSync(
            'sha256',
            Buffer.from(accessSecret, 'utf8'),
            Buffer.from(`ctm-aes-salt-${ver}`, 'utf8'),
            Buffer.from('ctm-master-encryption-key-v1', 'utf8'),
            32
          )
        );
      } else {
        throw new Error(
          'Configuración insegura en producción: defina MASTER_ENCRYPTION_KEY_V1 o APP_ENCRYPTION_KEY.'
        );
      }
    } else {
      const fallbackSecret =
        process.env.JWT_ACCESS_SECRET ||
        process.env.JWT_SECRET ||
        'ctm-internal-development-encryption-seed-2026';
      derivedKey = crypto.scryptSync(fallbackSecret, `ctm-dev-salt-${ver}`, 32);
    }

    this.keyCache.set(ver, { sourceTag, derivedKey });
    return derivedKey;
  }

  /**
   * Versión síncrona de encrypt para uso en repositorios/mapeadores sincrónicos.
   */
  encryptSync(plaintext, context = {}) {
    if (typeof plaintext !== 'string' || !plaintext) {
      throw new Error('El valor a cifrar debe ser una cadena no vacía');
    }

    const version = context.keyVersion || this.defaultVersion;
    const key = this._getMasterKey(version);
    const iv = crypto.randomBytes(this.ivLength);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    if (context.aad) {
      cipher.setAAD(Buffer.from(String(context.aad), 'utf8'));
    }

    let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
    ciphertext += cipher.final('base64');

    const tag = cipher.getAuthTag();

    return {
      ciphertext,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      keyVersion: version,
      algorithm: 'AES-256-GCM'
    };
  }

  /**
   * Versión síncrona de decrypt para uso en repositorios/mapeadores sincrónicos.
   */
  decryptSync(payload, context = {}) {
    if (!payload || !payload.ciphertext || !payload.iv || !payload.tag) {
      throw new Error('Payload de descifrado inválido o incompleto');
    }

    const version = payload.keyVersion || context.keyVersion || this.defaultVersion;
    const key = this._getMasterKey(version);
    const iv = Buffer.from(payload.iv, 'base64');
    const tag = Buffer.from(payload.tag, 'base64');

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    if (context.aad || payload.aad) {
      decipher.setAAD(Buffer.from(String(context.aad || payload.aad), 'utf8'));
    }

    let plaintext = decipher.update(payload.ciphertext, 'base64', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
  }

  /**
   * Cifra una cadena usando AES-256-GCM.
   */
  async encrypt(plaintext, context = {}) {
    return this.encryptSync(plaintext, context);
  }

  /**
   * Descifra un payload cifrado con AES-256-GCM y valida su etiqueta de autenticación.
   */
  async decrypt(payload, context = {}) {
    return this.decryptSync(payload, context);
  }
}

module.exports = AesGcmEncryptionProvider;
