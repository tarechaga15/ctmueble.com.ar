const RedisClient = require('../../redis/RedisClient');

const MAX_MEMORY_ENTRIES = 10000;

class SessionRevocationService {
  constructor({ redisClient } = {}) {
    this.redisClient = redisClient || RedisClient.getInstance();
    this.memoryStore = new Map();
    this.counterStore = new Map();
  }

  _pruneExpired(now = Date.now()) {
    if (this.memoryStore.size < MAX_MEMORY_ENTRIES) return;
    for (const [key, expiresAt] of this.memoryStore.entries()) {
      if (expiresAt <= now) {
        this.memoryStore.delete(key);
      }
    }
    while (this.memoryStore.size >= MAX_MEMORY_ENTRIES) {
      const oldestKey = this.memoryStore.keys().next().value;
      if (oldestKey === undefined) break;
      this.memoryStore.delete(oldestKey);
    }
  }

  _setMemory(key, ttlSeconds) {
    const ttlMs = Math.max(1000, Number(ttlSeconds || 3600) * 1000);
    this._pruneExpired();
    this.memoryStore.set(key, Date.now() + ttlMs);
  }

  _hasMemory(key) {
    const expiresAt = this.memoryStore.get(key);
    if (!expiresAt) return false;
    if (expiresAt <= Date.now()) {
      this.memoryStore.delete(key);
      return false;
    }
    return true;
  }

  _useRedis() {
    return (
      process.env.NODE_ENV !== 'test' &&
      !process.env.NODE_TEST_CONTEXT &&
      this.redisClient &&
      typeof this.redisClient.isConfigured === 'function' &&
      this.redisClient.isConfigured()
    );
  }

  async revokeToken(jti, ttlSeconds = 3600) {
    if (!jti) return;
    const ttl = Math.max(1, Math.ceil(ttlSeconds));
    const key = `auth:rev:jti:${jti}`;
    this._setMemory(key, ttl);
    if (this._useRedis()) {
      await this.redisClient.set(key, '1', ttl);
    }
  }

  async revokeSession(sid, ttlSeconds = 7 * 24 * 3600) {
    if (!sid) return;
    const ttl = Math.max(1, Math.ceil(ttlSeconds));
    const key = `auth:rev:sid:${sid}`;
    this._setMemory(key, ttl);
    if (this._useRedis()) {
      await this.redisClient.set(key, '1', ttl);
    }
  }

  async isRevoked(jti, sid) {
    if (jti && this._hasMemory(`auth:rev:jti:${jti}`)) return true;
    if (sid && this._hasMemory(`auth:rev:sid:${sid}`)) return true;

    if (this._useRedis()) {
      if (jti) {
        const revJti = await this.redisClient.get(`auth:rev:jti:${jti}`);
        if (revJti) {
          this._setMemory(`auth:rev:jti:${jti}`, 300);
          return true;
        }
      }
      if (sid) {
        const revSid = await this.redisClient.get(`auth:rev:sid:${sid}`);
        if (revSid) {
          this._setMemory(`auth:rev:sid:${sid}`, 300);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Consume un refresh token por única vez. Si ya había sido consumido,
   * revoca toda la familia de sesión (`sid`) por posible robo de token.
   */
  async consumeRefreshToken(jti, sid, ttlSeconds = 7 * 24 * 3600) {
    if (!jti) return true;
    const ttl = Math.max(1, Math.ceil(ttlSeconds));
    const usedKey = `auth:used:rt:${jti}`;

    if (this._hasMemory(usedKey)) {
      if (sid) await this.revokeSession(sid, ttl);
      return false;
    }

    if (this._useRedis()) {
      const win = await this.redisClient.incrWithWindow(usedKey, ttl * 1000);
      if (win && win.count > 1) {
        this._setMemory(usedKey, ttl);
        if (sid) await this.revokeSession(sid, ttl);
        return false;
      }
    }

    this._setMemory(usedKey, ttl);
    return true;
  }

  async incrementAttempt(key, ttlSeconds = 600) {
    if (!key) return 1;
    const ttl = Math.max(1, Math.ceil(ttlSeconds));
    if (this._useRedis()) {
      try {
        const win = await this.redisClient.incrWithWindow(key, ttl * 1000);
        if (win && typeof win.count === 'number') {
          return win.count;
        }
      } catch (_) {}
    }

    const now = Date.now();
    const existing = this.counterStore.get(key);
    if (!existing || existing.expiresAt <= now) {
      const entry = { count: 1, expiresAt: now + ttl * 1000 };
      this.counterStore.set(key, entry);
      return 1;
    }
    existing.count += 1;
    return existing.count;
  }

  clearMemory() {
    this.memoryStore.clear();
    this.counterStore.clear();
  }
}

let singletonInstance = null;
SessionRevocationService.getInstance = function getInstance() {
  if (!singletonInstance) {
    singletonInstance = new SessionRevocationService();
  }
  return singletonInstance;
};

module.exports = SessionRevocationService;
