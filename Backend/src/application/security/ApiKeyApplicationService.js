const SystemApiKey = require('../../infrastructure/models/security/system_api_key');
const EncryptionProviderFactory = require('../../infrastructure/security/encryption/EncryptionProviderFactory');

/**
 * Servicio multi-propósito e independiente para la gestión segura de API Keys y credenciales.
 * Todas las claves se almacenan cifradas con AES-256-GCM y soporte para Envelope Encryption.
 */
const CACHE_TTL_MS = 60 * 1000;

class ApiKeyApplicationService {
  constructor(options = {}) {
    this.model = options.model || SystemApiKey;
    this.encryptionProvider = options.encryptionProvider || EncryptionProviderFactory.getProvider();
    this._localCache = new Map();
  }

  _getCacheStore() {
    if (this.model === SystemApiKey && !process.env.NODE_TEST_CONTEXT && process.env.NODE_ENV !== 'test') {
      if (!ApiKeyApplicationService._sharedCache) {
        ApiKeyApplicationService._sharedCache = new Map();
      }
      return ApiKeyApplicationService._sharedCache;
    }
    return this._localCache;
  }

  clearCache(service = null) {
    const store = this._getCacheStore();
    if (service) {
      store.delete(String(service).trim().toUpperCase());
    } else {
      store.clear();
    }
    if (this._localCache !== store) {
      this._localCache.clear();
    }
  }

  /**
   * Genera un hint visual seguro de la clave para mostrar en la interfaz (ej: re_...3a8f)
   */
  _generateKeyHint(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') return '****';
    const clean = apiKey.trim();
    if (clean.length <= 8) return '****';
    const prefix = clean.slice(0, 3);
    const suffix = clean.slice(-4);
    return `${prefix}...${suffix}`;
  }

  /**
   * Guarda o actualiza una API Key para un servicio y proveedor determinado.
   * Cifra la clave con AES-256-GCM y versionado.
   *
   * @param {Object} params
   * @param {string} params.service - Servicio (ej: 'MAILING', 'AFIP', 'AWS')
   * @param {string} params.provider - Proveedor (ej: 'RESEND', 'SENDGRID')
   * @param {string} [params.name] - Nombre descriptivo
   * @param {string} params.apiKey - Texto plano de la API Key a cifrar
   * @param {Object} [params.metadata] - Metadatos adicionales (fromEmail, fromName, etc.)
   */
  async saveApiKey({ service, provider, name, apiKey, metadata = {} }) {
    if (!service || !provider || !apiKey) {
      const err = new Error('service, provider y apiKey son requeridos');
      err.code = 'INVALID_API_KEY_PAYLOAD';
      throw err;
    }

    const normalizedService = String(service).trim().toUpperCase();
    const normalizedProvider = String(provider).trim().toUpperCase();
    const keyHint = this._generateKeyHint(apiKey);

    // Cifrar la clave con contexto AAD ligado al servicio para máxima seguridad
    const encrypted = await this.encryptionProvider.encrypt(apiKey.trim(), {
      aad: `${normalizedService}:${normalizedProvider}`
    });

    // Desactivar claves anteriores para el mismo servicio si se reemplaza
    await this.model.update(
      { is_active: false },
      { where: { service: normalizedService, is_active: true } }
    );

    const record = await this.model.create({
      service: normalizedService,
      provider: normalizedProvider,
      name: (name || `${normalizedProvider} API Key`).trim(),
      encrypted_key: encrypted.ciphertext,
      iv: encrypted.iv,
      tag: encrypted.tag,
      key_version: encrypted.keyVersion,
      algorithm: encrypted.algorithm,
      key_hint: keyHint,
      metadata: metadata || {},
      envelope: encrypted.envelope || null,
      is_active: true
    });

    this.clearCache(normalizedService);

    return {
      id: record.id,
      service: record.service,
      provider: record.provider,
      name: record.name,
      keyHint: record.key_hint,
      metadata: record.metadata,
      algorithm: record.algorithm,
      isActive: record.is_active,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    };
  }

  /**
   * Actualiza únicamente los metadatos de una configuración activa sin modificar la API Key cifrada.
   */
  async updateMetadata(service, metadata = {}) {
    const normalizedService = String(service || 'MAILING').trim().toUpperCase();
    const record = await this.model.findOne({
      where: { service: normalizedService, is_active: true }
    });
    if (!record) {
      const err = new Error('No existe una configuración activa para este servicio');
      err.code = 'CONFIG_NOT_FOUND';
      throw err;
    }

    const currentMetadata = record.metadata || {};
    record.metadata = { ...currentMetadata, ...metadata };
    await record.save();

    this.clearCache(normalizedService);

    return {
      id: record.id,
      service: record.service,
      provider: record.provider,
      name: record.name,
      keyHint: record.key_hint,
      metadata: record.metadata,
      algorithm: record.algorithm,
      isActive: record.is_active,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    };
  }

  /**
   * Obtiene la API Key activa y la descifra en memoria para el servicio solicitado.
   * Solo para uso interno de servicios del backend.
   *
   * @param {string} service - Nombre del servicio (ej: 'MAILING')
   * @returns {Promise<{ id: string, provider: string, apiKey: string, metadata: Object } | null>}
   */
  async getActiveApiKey(service) {
    const normalizedService = String(service).trim().toUpperCase();
    const cache = this._getCacheStore();
    const cached = cache.get(normalizedService);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const record = await this.model.findOne({
      where: { service: normalizedService, is_active: true },
      order: [['created_at', 'DESC']]
    });

    if (!record) return null;

    try {
      const decryptedKey = await this.encryptionProvider.decrypt(
        {
          ciphertext: record.encrypted_key,
          iv: record.iv,
          tag: record.tag,
          keyVersion: record.key_version,
          envelope: record.envelope,
          aad: `${record.service}:${record.provider}`
        }
      );

      const resolved = {
        id: record.id,
        service: record.service,
        provider: record.provider,
        name: record.name,
        apiKey: decryptedKey,
        keyHint: record.key_hint,
        metadata: record.metadata || {},
        isActive: record.is_active
      };

      cache.set(normalizedService, {
        value: resolved,
        expiresAt: Date.now() + CACHE_TTL_MS
      });

      return resolved;
    } catch (err) {
      console.error(`[ApiKeyService] Error al descifrar clave para ${service}:`, err.message);
      return null;
    }
  }

  /**
   * Obtiene el estado público de configuración de un servicio (sin exponer el secreto).
   *
   * @param {string} service - Nombre del servicio
   */
  async getServiceStatus(service) {
    const normalizedService = String(service).trim().toUpperCase();
    const record = await this.model.findOne({
      where: { service: normalizedService, is_active: true },
      order: [['created_at', 'DESC']]
    });

    if (!record) {
      return {
        isConfigured: false,
        service: normalizedService,
        provider: null,
        keyHint: null,
        metadata: {}
      };
    }

    return {
      isConfigured: true,
      id: record.id,
      service: record.service,
      provider: record.provider,
      name: record.name,
      keyHint: record.key_hint,
      metadata: record.metadata || {},
      algorithm: record.algorithm,
      updatedAt: record.updated_at
    };
  }

  /**
   * Elimina o desactiva una API Key.
   */
  async deleteApiKey(id) {
    const record = await this.model.findByPk(id);
    if (!record) return false;
    await record.update({ is_active: false });
    this.clearCache(record.service);
    return true;
  }
}

module.exports = ApiKeyApplicationService;
