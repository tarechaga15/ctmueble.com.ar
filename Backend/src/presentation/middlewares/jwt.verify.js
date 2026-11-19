const jwtService = require('../../infrastructure/auth/services/JWTService');
const SessionRevocationService = require('../../infrastructure/auth/services/SessionRevocationService');
const UserSessionService = require('../../infrastructure/auth/services/UserSessionService');
const { getAuthService } = require('../../shared/serviceFactory');
const { ACCESS_COOKIE_NAME } = require('../utils/authCookies');
const { sendSecurityError } = require('./securityResponse');

const authService = getAuthService();
const revocationService = SessionRevocationService.getInstance();
const userSessionService = UserSessionService.getInstance();

const verifyJWT = async (req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieToken = req.cookies && typeof req.cookies[ACCESS_COOKIE_NAME] === 'string'
    ? req.cookies[ACCESS_COOKIE_NAME].trim()
    : '';

  let token = '';
  let authSource = null;

  if (cookieToken) {
    token = cookieToken;
    authSource = 'cookie';
  } else if (!isProd) {
    const authHeader = req.headers && req.headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
      return sendSecurityError(res, req, 401, 'TOKEN_REQUIRED', 'Token requerido');
    }

    const parts = authHeader.split(' ');
    const scheme = parts[0];
    const rawToken = parts.slice(1).join(' ').trim();
    if (scheme !== 'Bearer' || !rawToken) {
      return sendSecurityError(res, req, 401, 'TOKEN_FORMAT_INVALID', 'Formato de token inválido');
    }

    token = rawToken;
    authSource = 'header';
  } else {
    return sendSecurityError(res, req, 401, 'TOKEN_REQUIRED', 'Token requerido');
  }

  try {
    const decoded = jwtService.verifyAccessToken(token);
    if (!decoded || !decoded.id) {
      return sendSecurityError(res, req, 401, 'TOKEN_INVALID', 'Token inválido');
    }

    const revoked = await revocationService.isRevoked(decoded.jti, decoded.sid);
    if (revoked) {
      return sendSecurityError(res, req, 401, 'TOKEN_REVOKED', 'Sesión revocada');
    }

    // Fallback en PostgreSQL cuando Redis no está configurado (evita aceptar sesiones revocadas en instancias serverless frías)
    if (!revocationService._useRedis() && decoded.sid && !process.env.NODE_TEST_CONTEXT) {
      try {
        const dbSession = await userSessionService.sessionModel?.findByPk?.(decoded.sid);
        if (dbSession && (dbSession.is_revoked === true || (dbSession.expires_at && new Date() > new Date(dbSession.expires_at)))) {
          if (typeof revocationService._setMemory === 'function') {
            revocationService._setMemory(`auth:rev:sid:${decoded.sid}`, 300);
          }
          return sendSecurityError(res, req, 401, 'TOKEN_REVOKED', 'Sesión revocada');
        }
      } catch (_) {
        // Fail open si la tabla o DB no está disponible (ej. tests sin conexión Postgres)
      }
    }

    const user = await authService.getUserForRequest(decoded.id);
    if (!user) {
      return sendSecurityError(res, req, 403, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

    if (user.isActive === false) {
      return sendSecurityError(res, req, 403, 'ACCOUNT_DISABLED', 'Cuenta de usuario desactivada');
    }

    req.user = user;
    req.auth = decoded;
    req.authSource = authSource;
    if (req.context) {
      req.context.user = user;
      req.context.auth = decoded;
    }
    if (decoded.sid) {
      userSessionService.touchSession(decoded.sid);
    }
    return next();
  } catch (err) {
    if (err && err.name === 'TokenExpiredError') {
      return sendSecurityError(res, req, 401, 'TOKEN_EXPIRED', 'Token expirado');
    }
    return sendSecurityError(res, req, 401, 'TOKEN_INVALID', 'Token inválido');
  }
};

module.exports = verifyJWT;
