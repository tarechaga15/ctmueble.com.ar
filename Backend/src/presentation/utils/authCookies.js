const crypto = require('crypto');

const ACCESS_COOKIE_NAME = 'ctm_at';
const REFRESH_COOKIE_NAME = 'ctm_rt';
const CSRF_COOKIE_NAME = 'ctm_csrf';

function parseDurationToMs(spec, fallbackMs) {
  if (!spec || typeof spec !== 'string') return fallbackMs;
  const match = spec.trim().match(/^(\d+)\s*(s|m|h|d)$/i);
  if (!match) return fallbackMs;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };
  return amount * (multipliers[unit] || 1000);
}

function getBaseCookieConfig() {
  const rawSameSite = (process.env.COOKIE_SAME_SITE || 'lax').trim().toLowerCase();
  const sameSite = ['lax', 'strict', 'none'].includes(rawSameSite) ? rawSameSite : 'lax';
  const explicitSecure = process.env.COOKIE_SECURE;
  const isProdOrVercel = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  const secure =
    sameSite === 'none'
      ? true
      : explicitSecure !== undefined
      ? explicitSecure === 'true'
      : isProdOrVercel;
  const domain = process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN.trim() : undefined;

  return {
    secure,
    sameSite,
    ...(domain ? { domain } : {})
  };
}

function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

function setAuthCookies(res, { accessToken, refreshToken, csrfToken, rememberMe = true } = {}) {
  if (!res || typeof res.cookie !== 'function') return null;

  const base = getBaseCookieConfig();
  const accessMaxAge = parseDurationToMs(process.env.JWT_EXPIRES_IN || '15m', 15 * 60 * 1000);
  const refreshMaxAge = rememberMe
    ? parseDurationToMs(process.env.JWT_REFRESH_EXPIRES_IN || '30d', 30 * 24 * 60 * 60 * 1000)
    : undefined;
  const finalCsrf = csrfToken || generateCsrfToken();

  if (accessToken) {
    res.cookie(ACCESS_COOKIE_NAME, accessToken, {
      ...base,
      httpOnly: true,
      path: '/',
      maxAge: accessMaxAge
    });
  }

  if (refreshToken) {
    const rtOpts = {
      ...base,
      httpOnly: true,
      path: '/auth'
    };
    if (refreshMaxAge !== undefined) {
      rtOpts.maxAge = refreshMaxAge;
    }
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, rtOpts);
  }

  const csrfOpts = {
    ...base,
    httpOnly: false,
    path: '/'
  };
  if (refreshMaxAge !== undefined) {
    csrfOpts.maxAge = refreshMaxAge;
  }
  res.cookie(CSRF_COOKIE_NAME, finalCsrf, csrfOpts);

  if (typeof res.setHeader === 'function') {
    res.setHeader('X-CSRF-Token', finalCsrf);
  }

  return finalCsrf;
}

function clearAuthCookies(res) {
  if (!res || typeof res.clearCookie !== 'function') return;
  const base = getBaseCookieConfig();

  res.clearCookie(ACCESS_COOKIE_NAME, { ...base, httpOnly: true, path: '/' });
  res.clearCookie(REFRESH_COOKIE_NAME, { ...base, httpOnly: true, path: '/auth' });
  res.clearCookie(CSRF_COOKIE_NAME, { ...base, httpOnly: false, path: '/' });
}

module.exports = {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  generateCsrfToken,
  setAuthCookies,
  clearAuthCookies,
  parseDurationToMs
};
