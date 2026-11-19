const crypto = require('crypto');
const { sendSecurityError } = require('./securityResponse');
const RedisClient = require('../../infrastructure/redis/RedisClient');

const MAX_MEMORY_BUCKETS = 10000;

function resolveClientIp(req) {
  const headers = req?.headers || {};

  // En Vercel Functions, el edge sobrescribe `x-vercel-forwarded-for` de forma confiable (anti-spoofing).
  if (process.env.VERCEL && typeof headers['x-vercel-forwarded-for'] === 'string' && headers['x-vercel-forwarded-for'].trim() !== '') {
    return headers['x-vercel-forwarded-for'].split(',')[0].trim();
  }

  // Cuando Express está montado con `app.set('trust proxy', 1)`, `req.ip` ya respeta únicamente el salto confiable.
  if (req?.app && typeof req.ip === 'string' && req.ip.trim() !== '') {
    return req.ip.trim();
  }

  // Soporte para mocks unitarios sin instancia Express (`req.app === undefined`)
  const forwardedFor = headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim() !== '') {
    return forwardedFor.split(',')[0].trim();
  }

  return req?.ip || 'unknown';
}

function resolveClientKey(req, { keyByUser = false, keyGenerator = null } = {}) {
  if (typeof keyGenerator === 'function') {
    return String(keyGenerator(req) || 'unknown').slice(0, 128);
  }
  if (keyByUser && req?.user?.id) {
    return `usr:${req.user.id}`;
  }
  return `ip:${resolveClientIp(req)}`;
}

function sweepMemoryStore(store, now) {
  for (const [k, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(k);
    }
  }
  // Si tras limpiar expirados sigue superando el tope, desaloja las entradas más antiguas (FIFO de Map)
  while (store.size >= MAX_MEMORY_BUCKETS) {
    const oldestKey = store.keys().next().value;
    if (oldestKey === undefined) break;
    store.delete(oldestKey);
  }
}

function createRateLimiter({
  windowMs,
  max,
  code = 'RATE_LIMIT_EXCEEDED',
  message = 'Demasiadas solicitudes, intente nuevamente más tarde.',
  keyByUser = false,
  keyGenerator = null
}) {
  if (!windowMs || !max) {
    throw new Error('Rate limiter requiere windowMs y max');
  }

  const store = new Map();
  const instanceId = crypto.randomBytes(4).toString('hex');
  const redisPrefix = `ctm:rl:${code}:${windowMs}:${max}:${instanceId}`;
  let opsCounter = 0;

  function checkMemoryLimit(req, res, next, clientKey) {
    const now = Date.now();
    opsCounter += 1;
    if (opsCounter >= 250 || store.size >= MAX_MEMORY_BUCKETS) {
      opsCounter = 0;
      sweepMemoryStore(store, now);
    }

    const entry = store.get(clientKey);
    if (!entry || now > entry.resetAt) {
      store.set(clientKey, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      const retryAfterSeconds = Math.max(Math.ceil((entry.resetAt - now) / 1000), 1);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return sendSecurityError(res, req, 429, code, message);
    }

    return next();
  }

  return (req, res, next) => {
    const clientKey = resolveClientKey(req, { keyByUser, keyGenerator });

    const useRedis =
      process.env.NODE_ENV !== 'test' &&
      !process.env.NODE_TEST_CONTEXT &&
      RedisClient.isConfigured();
    if (!useRedis) {
      return checkMemoryLimit(req, res, next, clientKey);
    }

    const sharedRedisKey = `ctm:rl:${code}:${windowMs}:${clientKey}`;
    return RedisClient.getInstance()
      .incrWithWindow(sharedRedisKey, windowMs)
      .then((result) => {
        if (!result) {
          return checkMemoryLimit(req, res, next, clientKey);
        }
        if (result.count > max) {
          const retryAfterSeconds = Math.max(Math.ceil((result.ttlMs || windowMs) / 1000), 1);
          res.setHeader('Retry-After', String(retryAfterSeconds));
          return sendSecurityError(res, req, 429, code, message);
        }
        return next();
      })
      .catch(() => checkMemoryLimit(req, res, next, clientKey));
  };
}

module.exports = {
  createRateLimiter,
  resolveClientIp
};
