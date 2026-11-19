const crypto = require('crypto');
const { CSRF_COOKIE_NAME } = require('../utils/authCookies');
const { sendSecurityError } = require('./securityResponse');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function getAllowedOrigins() {
  const defaultOrigins =
    process.env.NODE_ENV === 'production'
      ? ['https://oficina.ctmueble.com.ar']
      : ['http://localhost:3000', 'http://localhost:5173', 'https://oficina.ctmueble.com.ar'];

  const envOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return new Set([...defaultOrigins, ...envOrigins]);
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  const allowed = getAllowedOrigins();
  if (allowed.has(origin)) return true;

  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();

    // Permitir dominio institucional y sus subdominios (solo HTTPS)
    if (
      url.protocol === 'https:' &&
      (hostname === 'ctmueble.com.ar' || hostname.endsWith('.ctmueble.com.ar'))
    ) {
      return true;
    }
    // Permitir deploys/previews propios del proyecto en Vercel (solo HTTPS)
    if (
      url.protocol === 'https:' &&
      /^(?:[a-z0-9-]+-)?(?:oficina|gestion|tarechaga15)[a-z0-9-]*\.vercel\.app$/i.test(hostname)
    ) {
      return true;
    }
    // Permitir localhost en entornos no productivos
    if (
      process.env.NODE_ENV !== 'production' &&
      url.protocol === 'http:' &&
      (hostname === 'localhost' || hostname === '127.0.0.1')
    ) {
      return true;
    }
  } catch (_e) {
    return false;
  }

  return false;
}

/**
 * Resuelve y valida una URL de frontend candidata contra la lista blanca de orígenes permitidos.
 * Evita ataques de Host/URL Injection hacia dominios externos en enlaces de correo.
 */
function resolveSafeFrontendUrl(candidateUrl) {
  const fallback = (
    process.env.FRONTEND_URL ||
    process.env.APP_URL ||
    'https://oficina.ctmueble.com.ar'
  ).replace(/\/+$/, '');

  if (!candidateUrl || typeof candidateUrl !== 'string') {
    return fallback;
  }

  try {
    const parsed = new URL(candidateUrl.trim());
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return fallback;
    }
    if (isOriginAllowed(parsed.origin)) {
      return parsed.origin.replace(/\/+$/, '');
    }
  } catch (_e) {
    return fallback;
  }

  return fallback;
}

function safeEqualStrings(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (!a.length || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
}

function validateCsrfTokens(req, res) {
  const origin = req.headers && req.headers['origin'];
  if (origin) {
    if (!isOriginAllowed(origin)) {
      sendSecurityError(res, req, 403, 'CSRF_ORIGIN_FORBIDDEN', 'Origen no autorizado para solicitud con credenciales');
      return false;
    }
  }

  const cookieToken = req.cookies && req.cookies[CSRF_COOKIE_NAME];
  const headerRaw = req.headers && (req.headers['x-csrf-token'] || req.headers['X-CSRF-Token']);
  const headerToken = Array.isArray(headerRaw) ? headerRaw[0] : headerRaw;

  if (!cookieToken || !headerToken || !safeEqualStrings(cookieToken, headerToken)) {
    sendSecurityError(res, req, 403, 'CSRF_TOKEN_INVALID', 'Token CSRF faltante o inválido');
    return false;
  }

  return true;
}

/**
 * Middleware CSRF para rutas autenticadas tras `verifyJWT`.
 * Solo exige CSRF cuando la sesión fue autenticada mediante cookie (`req.authSource === 'cookie'`).
 * En development con `Authorization: Bearer`, `req.authSource === 'header'` y no interfiere.
 */
function verifyCsrf(req, res, next) {
  if (SAFE_METHODS.has(String(req.method || '').toUpperCase())) {
    return next();
  }

  if (req.authSource !== 'cookie') {
    return next();
  }

  if (!validateCsrfTokens(req, res)) return;
  return next();
}

/**
 * Middleware CSRF para `/auth/refresh_token` y `/auth/logout` cuando operan con cookies.
 * En development, si el cliente envía el token explícitamente por body y no usa cookies, no bloquea.
 */
function verifyAuthCookieCsrf(req, res, next) {
  if (SAFE_METHODS.has(String(req.method || '').toUpperCase())) {
    return next();
  }

  const isProd = process.env.NODE_ENV === 'production';
  const hasCookieToken = Boolean(req.cookies && (req.cookies.ctm_rt || req.cookies.ctm_at));
  const hasBodyToken = !isProd && Boolean(req.body && (req.body.refreshToken || req.body.token));

  if (hasCookieToken && !hasBodyToken) {
    if (!validateCsrfTokens(req, res)) return;
  }

  return next();
}

module.exports = {
  verifyCsrf,
  verifyAuthCookieCsrf,
  getAllowedOrigins,
  isOriginAllowed,
  resolveSafeFrontendUrl
};
