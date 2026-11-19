const crypto = require('crypto');

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Codifica un Buffer a Base32 (RFC 4648) sin padding.
 * @param {Buffer} buffer
 * @returns {string}
 */
function base32Encode(buffer) {
  if (!buffer || buffer.length === 0) return '';
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodifica una cadena Base32 (RFC 4648) a Buffer.
 * Tolera espacios y padding opcional '='.
 * @param {string} str
 * @returns {Buffer}
 */
function base32Decode(str) {
  if (!str) return Buffer.alloc(0);
  const cleaned = String(str).toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) {
      throw new Error(`Carácter Base32 inválido: ${cleaned[i]}`);
    }
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Genera un secreto aleatorio criptográficamente seguro en Base32 (por defecto 20 bytes = 32 chars).
 * @param {number} byteLength
 * @returns {string}
 */
function generateSecret(byteLength = 20) {
  return base32Encode(crypto.randomBytes(byteLength));
}

/**
 * Genera un código TOTP numérico (RFC 6238 / RFC 4226) para un momento dado.
 * @param {string|Buffer} secret - Secreto en Base32 o Buffer de bytes crudos
 * @param {number} [time=Date.now()] - Timestamp en milisegundos
 * @param {number} [period=30] - Ventana de tiempo en segundos (por defecto 30)
 * @param {number} [digits=6] - Cantidad de dígitos del código (por defecto 6)
 * @returns {string}
 */
function generateTotp(secret, time = Date.now(), period = 30, digits = 6) {
  const counter = Math.floor(time / (period * 1000));
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const key = Buffer.isBuffer(secret) ? secret : base32Decode(secret);
  const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;

  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const modulus = 10 ** digits;
  return (code % modulus).toString().padStart(digits, '0');
}

/**
 * Verifica un código TOTP ingresado contra el secreto con tolerancia de ventana (RFC 6238).
 * @param {string} token
 * @param {string|Buffer} secret
 * @param {object} [options]
 * @param {number} [options.window=1] - Tolerancia de pasos anteriores/posteriores (+/- 1 paso de 30s)
 * @param {number} [options.period=30]
 * @param {number} [options.time=Date.now()]
 * @returns {boolean}
 */
function verifyTotp(token, secret, options = {}) {
  if (!token || !secret) return false;
  const cleanToken = String(token).trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanToken)) return false;

  const window = typeof options.window === 'number' ? options.window : 1;
  const period = options.period || 30;
  const time = typeof options.time === 'number' ? options.time : Date.now();

  try {
    const key = Buffer.isBuffer(secret) ? secret : base32Decode(secret);
    if (!key || key.length === 0) return false;

    const tokenBuf = Buffer.from(cleanToken, 'utf8');

    for (let delta = -window; delta <= window; delta++) {
      const stepTime = time + delta * period * 1000;
      const expected = generateTotp(key, stepTime, period, 6);
      const expectedBuf = Buffer.from(expected, 'utf8');
      if (tokenBuf.length === expectedBuf.length && crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
        return true;
      }
    }
    return false;
  } catch (_) {
    return false;
  }
}

/**
 * Genera la URI otpauth:// estándar compatible con Google Authenticator, Authy, etc.
 * @param {object} params
 * @param {string} params.secret
 * @param {string} [params.issuer='CTM Oficina Virtual']
 * @param {string} [params.label='usuario@ctmueble.com.ar']
 * @returns {string}
 */
function generateOtpAuthUri({ secret, issuer = 'CTM Oficina Virtual', label = 'usuario@ctmueble.com.ar' }) {
  const encIssuer = encodeURIComponent(issuer);
  const encLabel = encodeURIComponent(label);
  const cleanSecret = String(secret || '').trim().replace(/\s+/g, '').toUpperCase();
  return `otpauth://totp/${encIssuer}:${encLabel}?secret=${cleanSecret}&issuer=${encIssuer}`;
}

module.exports = {
  base32Encode,
  base32Decode,
  generateSecret,
  generateTotp,
  verifyTotp,
  generateOtpAuthUri
};
