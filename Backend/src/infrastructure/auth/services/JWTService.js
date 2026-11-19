/**
 * Servicio de infraestructura para manejo seguro de JWT (JSON Web Tokens).
 * - Secretos separados para access y refresh tokens (obligatorios y distintos en producción).
 * - En entornos no productivos (development/test), si solo existe JWT_SECRET,
 *   deriva claves independientes vía HKDF-SHA256 para evitar confusión de tokens.
 * - Algoritmo fijado en HS256, claims estándar (iss, aud, jti, sid, typ).
 */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ISSUER = process.env.JWT_ISSUER || 'gestion.ctmueble.com.ar';
const AUDIENCE = process.env.JWT_AUDIENCE || 'oficina.ctmueble.com.ar';
const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

function deriveDevSecret(baseSecret, contextInfo) {
  return Buffer.from(
    crypto.hkdfSync('sha256', Buffer.from(baseSecret, 'utf8'), Buffer.alloc(0), Buffer.from(contextInfo, 'utf8'), 32)
  ).toString('hex');
}

function getSecrets() {
  const isProd = process.env.NODE_ENV === 'production';
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (accessSecret && refreshSecret) {
    if (accessSecret === refreshSecret) {
      throw new Error('JWT_ACCESS_SECRET y JWT_REFRESH_SECRET deben ser estrictamente distintos.');
    }
    return { accessSecret, refreshSecret };
  }

  if (isProd) {
    throw new Error(
      'Configuración insegura en producción: defina JWT_ACCESS_SECRET y JWT_REFRESH_SECRET distintos (mínimo 32 caracteres).'
    );
  }

  const fallbackBase =
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === 'test' ? 'ctm-test-only-fallback-secret-do-not-use-in-prod' : null);

  if (!fallbackBase) {
    throw new Error('Falta configurar JWT_ACCESS_SECRET / JWT_REFRESH_SECRET (o JWT_SECRET en development).');
  }

  return {
    accessSecret: accessSecret || deriveDevSecret(fallbackBase, 'ctm-access-token-v1'),
    refreshSecret: refreshSecret || deriveDevSecret(fallbackBase, 'ctm-refresh-token-v1')
  };
}

function signAccessToken(payload = {}, options = {}) {
  const { accessSecret } = getSecrets();
  const userId = payload.id || payload.sub;
  const sid = payload.sid || options.sid || crypto.randomUUID();
  const jti = options.jti || crypto.randomUUID();

  return jwt.sign(
    {
      ...payload,
      id: userId,
      sub: String(userId),
      sid,
      typ: 'access'
    },
    accessSecret,
    {
      algorithm: 'HS256',
      expiresIn: options.expiresIn || ACCESS_EXPIRES_IN,
      jwtid: jti,
      issuer: ISSUER,
      audience: AUDIENCE
    }
  );
}

function signRefreshToken(payload = {}, options = {}) {
  const { refreshSecret } = getSecrets();
  const userId = payload.id || payload.sub;
  const sid = payload.sid || options.sid || crypto.randomUUID();
  const jti = options.jti || crypto.randomUUID();

  return jwt.sign(
    {
      ...payload,
      id: userId,
      sub: String(userId),
      sid,
      typ: 'refresh'
    },
    refreshSecret,
    {
      algorithm: 'HS256',
      expiresIn: options.expiresIn || REFRESH_EXPIRES_IN,
      jwtid: jti,
      issuer: ISSUER,
      audience: AUDIENCE
    }
  );
}

/**
 * Emite par de tokens compartiendo el mismo `sid` de sesión.
 */
function generateTokens({ access = {}, refresh = {}, sid } = {}) {
  const sessionId = sid || access.sid || refresh.sid || crypto.randomUUID();
  const accessToken = signAccessToken(access, { sid: sessionId });
  const refreshToken = signRefreshToken(refresh, { sid: sessionId });
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    sid: sessionId
  };
}

function verifyAccessToken(token) {
  const { accessSecret } = getSecrets();
  const decoded = jwt.verify(token, accessSecret, {
    algorithms: ['HS256'],
    issuer: ISSUER,
    audience: AUDIENCE
  });
  if (!decoded || decoded.typ !== 'access') {
    const err = new Error('Tipo de token inválido para acceso');
    err.name = 'JsonWebTokenError';
    throw err;
  }
  return decoded;
}

function verifyRefreshToken(token) {
  const { refreshSecret } = getSecrets();
  const decoded = jwt.verify(token, refreshSecret, {
    algorithms: ['HS256'],
    issuer: ISSUER,
    audience: AUDIENCE
  });
  if (!decoded || decoded.typ !== 'refresh') {
    const err = new Error('Tipo de token inválido para refresh');
    err.name = 'JsonWebTokenError';
    throw err;
  }
  return decoded;
}

function sign2FATempToken(payload = {}, options = {}) {
  const { accessSecret } = getSecrets();
  const userId = payload.id || payload.sub;
  const jti = options.jti || crypto.randomUUID();

  return jwt.sign(
    {
      ...payload,
      id: userId,
      sub: String(userId),
      typ: '2fa_temp'
    },
    accessSecret,
    {
      algorithm: 'HS256',
      jwtid: jti,
      expiresIn: options.expiresIn || '10m',
      issuer: ISSUER,
      audience: AUDIENCE
    }
  );
}

function verify2FATempToken(token) {
  const { accessSecret } = getSecrets();
  const decoded = jwt.verify(token, accessSecret, {
    algorithms: ['HS256'],
    issuer: ISSUER,
    audience: AUDIENCE
  });
  if (!decoded || decoded.typ !== '2fa_temp') {
    const err = new Error('Tipo de token inválido para verificación 2FA');
    err.name = 'JsonWebTokenError';
    throw err;
  }
  return decoded;
}

function decodeUnsafe(token) {
  if (!token || typeof token !== 'string') return null;
  return jwt.decode(token);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  generateTokens,
  sign2FATempToken,
  verify2FATempToken,
  verifyAccessToken,
  verifyRefreshToken,
  verify: verifyRefreshToken,
  decode: decodeUnsafe
};
