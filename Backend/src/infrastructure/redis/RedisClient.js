const Redis = require('ioredis');

/**
 * RedisClient
 * Cliente singleton resiliente para conexión a Redis en entornos locales y Vercel Serverless.
 * Si Redis no está configurado o cae temporalmente, falla rápido (`null`/`false`) sin bloquear las funciones.
 */
class RedisClient {
  constructor() {
    this.client = null;
    this._initialized = false;
  }

  isConfigured() {
    return Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);
  }

  _ensureInitialized() {
    if (!this._initialized) {
      const commonOptions = {
        lazyConnect: true,
        connectTimeout: 2500,
        commandTimeout: 2000,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy(times) {
          if (times > 3) return null;
          return Math.min(times * 200, 1000);
        }
      };

      if (process.env.REDIS_URL) {
        this.client = new Redis(process.env.REDIS_URL, commonOptions);
      } else {
        const useTls = process.env.REDIS_TLS === 'true';
        this.client = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT || 6379),
          password: process.env.REDIS_PASS || undefined,
          db: Number(process.env.REDIS_DB || 0),
          ...(useTls
            ? { tls: { rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false' } }
            : {}),
          ...commonOptions
        });
      }

      this.client.on('error', (err) => {
        if (process.env.NODE_ENV !== 'test' && !process.env.NODE_TEST_CONTEXT) {
          console.warn('[Redis] Connection warning:', err.message);
        }
      });

      this._initialized = true;
    }
    return this.client;
  }

  getClient() {
    return this._ensureInitialized();
  }

  async connect() {
    if (!this.isConfigured()) {
      throw new Error('Redis is not configured');
    }
    const client = this.getClient();
    if (client.status === 'wait' || client.status === 'close' || client.status === 'end') {
      await client.connect();
    }
    return client;
  }

  async get(key) {
    try {
      const client = await this.connect();
      return await client.get(key);
    } catch (_) {
      return null;
    }
  }

  async set(key, value, ttlOrMode, ...rest) {
    try {
      const client = await this.connect();
      if (typeof ttlOrMode === 'number') {
        return await client.set(key, value, 'EX', Math.max(1, Math.ceil(ttlOrMode)));
      }
      if (ttlOrMode !== undefined) {
        return await client.set(key, value, ttlOrMode, ...rest);
      }
      return await client.set(key, value);
    } catch (_) {
      return null;
    }
  }

  async setNxPx(key, value, ttlMs) {
    try {
      const client = await this.connect();
      const res = await client.set(key, value, 'PX', Math.max(100, Math.ceil(ttlMs)), 'NX');
      return res === 'OK';
    } catch (_) {
      return null;
    }
  }

  async del(key) {
    try {
      const client = await this.connect();
      return await client.del(key);
    } catch (_) {
      return 0;
    }
  }

  async exists(key) {
    try {
      const client = await this.connect();
      return await client.exists(key);
    } catch (_) {
      return 0;
    }
  }

  async expire(key, seconds) {
    try {
      const client = await this.connect();
      return await client.expire(key, seconds);
    } catch (_) {
      return 0;
    }
  }

  async incrWithWindow(key, windowMs) {
    try {
      const client = await this.connect();
      const res = await client.multi().incr(key).pttl(key).exec();
      if (!res || !res[0] || res[0][0]) return null;
      const count = Number(res[0][1]);
      let ttlMs = Number(res[1]?.[1] ?? -1);
      if (count === 1 || ttlMs < 0) {
        await client.pexpire(key, windowMs);
        ttlMs = windowMs;
      }
      return { count, ttlMs };
    } catch (_) {
      return null;
    }
  }

  async disconnect() {
    if (this.client && this.client.status !== 'end') {
      await this.client.quit().catch(() => this.client.disconnect());
    }
  }

  async quit() {
    return this.disconnect();
  }
}

const defaultInstance = new RedisClient();
RedisClient.getInstance = () => defaultInstance;
RedisClient.isConfigured = () => defaultInstance.isConfigured();

module.exports = RedisClient;
