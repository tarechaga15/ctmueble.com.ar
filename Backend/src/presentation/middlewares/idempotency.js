/**
 * Middleware de Idempotencia endurecido para POST y PUT:
 * - Aísla las claves por `${userId}:${method}:${path}:${bodyHash}:${idempotencyKey}` (evita filtración entre usuarios/tenants).
 * - Rechaza claves inválidas (> 128 caracteres).
 * - Evita condiciones de carrera con estado `IN_PROGRESS` -> responde `409 IDEMPOTENCY_IN_PROGRESS`.
 * - Cachea ÚNICAMENTE respuestas `2xx` (nunca cachea errores 4xx/5xx para permitir reintentos legítimos).
 * - Acota memoria local (`MAX_ENTRIES = 2000`, `TTL = 15 min`) y soporta Redis (`TTL = 24 h`) cuando está configurado.
 */
const crypto = require('crypto');
const RedisClient = require('../../infrastructure/redis/RedisClient');

const MEMORY_TTL_MS = 15 * 60 * 1000;
const IN_PROGRESS_TTL_MS = 60 * 1000;
const REDIS_TTL_SECONDS = 24 * 60 * 60;
const MAX_MEMORY_ENTRIES = 2000;
const MAX_KEY_LENGTH = 128;

const memoryStore = new Map();

function sweepMemory(now) {
  for (const [k, entry] of memoryStore.entries()) {
    if (now > entry.expiresAt) {
      memoryStore.delete(k);
    }
  }
  while (memoryStore.size >= MAX_MEMORY_ENTRIES) {
    const oldestKey = memoryStore.keys().next().value;
    if (oldestKey === undefined) break;
    memoryStore.delete(oldestKey);
  }
}

function computeBodyHash(body) {
  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return 'empty';
  }
  try {
    return crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0, 16);
  } catch (_) {
    return 'unhashable';
  }
}

async function idempotencyMiddleware(req, res, next) {
  const method = String(req.method || '').toUpperCase();
  if (!['POST', 'PUT'].includes(method)) {
    return next();
  }

  const rawKey =
    req.headers?.['idempotency-key'] ||
    req.headers?.['Idempotency-Key'] ||
    req.headers?.['IDEMPOTENCY-KEY'];

  if (!rawKey) {
    return next();
  }

  const key = String(rawKey).trim();
  if (!key) {
    return next();
  }
  if (key.length > MAX_KEY_LENGTH) {
    return res.status(400).json({
      code: 'INVALID_IDEMPOTENCY_KEY',
      message: 'Idempotency-Key no puede superar 128 caracteres'
    });
  }

  const actorId = req.user?.id ? `u:${req.user.id}` : `ip:${req.ip || 'anon'}`;
  const cleanUrl = String(req.originalUrl || req.url || '').split('?')[0];
  const bodyHash = computeBodyHash(req.body);
  const cacheKey = `ctm:idem:${actorId}:${method}:${cleanUrl}:${bodyHash}:${key}`;
  const now = Date.now();

  const useRedis =
    process.env.NODE_ENV !== 'test' &&
    !process.env.NODE_TEST_CONTEXT &&
    RedisClient.isConfigured();

  if (useRedis) {
    const redis = RedisClient.getInstance();
    const existingRaw = await redis.get(cacheKey);
    if (existingRaw) {
      try {
        const parsed = JSON.parse(existingRaw);
        if (parsed.state === 'IN_PROGRESS') {
          return res.status(409).json({
            code: 'IDEMPOTENCY_IN_PROGRESS',
            message: 'Ya existe una operación en curso con esta Idempotency-Key'
          });
        }
        if (parsed.state === 'COMPLETED') {
          res.setHeader('X-Idempotent-Replayed', 'true');
          return res.status(parsed.statusCode).json(parsed.body);
        }
      } catch (_) {
        // Ignorar entrada corrupta
      }
    }
    const acquired = await redis.setNxPx(
      cacheKey,
      JSON.stringify({ state: 'IN_PROGRESS', startedAt: now }),
      IN_PROGRESS_TTL_MS
    );
    if (acquired === false) {
      return res.status(409).json({
        code: 'IDEMPOTENCY_IN_PROGRESS',
        message: 'Ya existe una operación en curso con esta Idempotency-Key'
      });
    }
  } else {
    sweepMemory(now);
    const existing = memoryStore.get(cacheKey);
    if (existing && now <= existing.expiresAt) {
      if (existing.state === 'IN_PROGRESS') {
        return res.status(409).json({
          code: 'IDEMPOTENCY_IN_PROGRESS',
          message: 'Ya existe una operación en curso con esta Idempotency-Key'
        });
      }
      if (existing.state === 'COMPLETED') {
        res.setHeader('X-Idempotent-Replayed', 'true');
        return res.status(existing.statusCode).json(existing.body);
      }
    }
    memoryStore.set(cacheKey, {
      state: 'IN_PROGRESS',
      expiresAt: now + IN_PROGRESS_TTL_MS
    });
  }

  let finalized = false;
  const clearInProgress = () => {
    if (finalized) return;
    finalized = true;
    if (useRedis) {
      RedisClient.getInstance().del(cacheKey).catch(() => {});
    } else {
      const cur = memoryStore.get(cacheKey);
      if (cur && cur.state === 'IN_PROGRESS') {
        memoryStore.delete(cacheKey);
      }
    }
  };

  if (typeof res.once === 'function') {
    res.once('close', clearInProgress);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const statusCode = res.statusCode || 200;
    finalized = true;

    if (statusCode >= 200 && statusCode < 300) {
      if (useRedis) {
        RedisClient.getInstance()
          .set(
            cacheKey,
            JSON.stringify({ state: 'COMPLETED', statusCode, body }),
            REDIS_TTL_SECONDS
          )
          .catch(() => {});
      } else {
        memoryStore.set(cacheKey, {
          state: 'COMPLETED',
          statusCode,
          body,
          expiresAt: Date.now() + MEMORY_TTL_MS
        });
      }
    } else if (useRedis) {
      RedisClient.getInstance().del(cacheKey).catch(() => {});
    } else {
      memoryStore.delete(cacheKey);
    }

    return originalJson(body);
  };

  return next();
}

idempotencyMiddleware._clearMemoryForTests = () => memoryStore.clear();

module.exports = idempotencyMiddleware;
