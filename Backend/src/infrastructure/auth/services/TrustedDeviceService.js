const { Op } = require('sequelize');
const crypto = require('crypto');
const { UserTrustedDevice } = require('../../models');
const { getClientDetails } = require('../utils/clientInfo');

class TrustedDeviceService {
  constructor(options = {}) {
    this.model = options.model || UserTrustedDevice;
    this.defaultTrustDays = 7; // 1 semana como solicitó el usuario
  }

  static getInstance() {
    if (!TrustedDeviceService._instance) {
      TrustedDeviceService._instance = new TrustedDeviceService();
    }
    return TrustedDeviceService._instance;
  }

  _safeCompare(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }

  _hashFingerprint(deviceFingerprint) {
    return crypto.createHash('sha256').update(`trusted-fp:${String(deviceFingerprint || '').trim()}`).digest('hex');
  }

  /**
   * Verifica si el dispositivo actual es de confianza y se encuentra dentro de la ventana de 7 días.
   */
  async isDeviceTrusted({ userId, deviceId, deviceFingerprint }) {
    if (!userId || !deviceId || !deviceFingerprint) return false;

    const now = new Date();
    const record = await this.model.findOne({
      where: {
        user_id: userId,
        device_id: String(deviceId).trim(),
        is_revoked: false,
        trusted_until: { [Op.gt]: now }
      }
    });

    if (!record) return false;

    // Comparar fingerprint hasheado (o legado directo para registros previos a la migración de formato)
    const storedFp = String(record.device_fingerprint || '');
    const incomingFp = String(deviceFingerprint || '').trim();
    const incomingHashed = this._hashFingerprint(incomingFp);
    if (!this._safeCompare(storedFp, incomingHashed) && !this._safeCompare(storedFp, incomingFp)) {
      return false;
    }

    // Actualizar última actividad del dispositivo de confianza
    await record.update({ last_used_at: now });
    return true;
  }

  /**
   * Registra o renueva la confianza en el dispositivo por 7 días.
   */
  async trustDevice({ userId, deviceId, deviceFingerprint, req, durationDays = 7 }) {
    if (!userId || !deviceId || !deviceFingerprint) return null;

    const client = getClientDetails(req);
    const now = new Date();
    const trustedUntil = new Date(now.getTime() + durationDays * 24 * 3600 * 1000);

    // Buscar si ya existía registro previo para este dispositivo
    const existing = await this.model.findOne({
      where: {
        user_id: userId,
        device_id: String(deviceId).trim()
      }
    });

    const hashedFingerprint = this._hashFingerprint(deviceFingerprint);

    if (existing) {
      await existing.update({
        device_fingerprint: hashedFingerprint,
        device_name: client.clientName,
        ip_address: client.ip,
        trusted_until: trustedUntil,
        is_revoked: false,
        last_used_at: now
      });
      return existing;
    }

    const created = await this.model.create({
      user_id: userId,
      device_id: String(deviceId).trim(),
      device_fingerprint: hashedFingerprint,
      device_name: client.clientName,
      ip_address: client.ip,
      trusted_until: trustedUntil,
      is_revoked: false,
      last_used_at: now,
      created_at: now
    });

    return created;
  }

  /**
   * Obtiene la lista de dispositivos de confianza del usuario.
   */
  async getUserTrustedDevices(userId) {
    if (!userId) return [];
    const now = new Date();

    const devices = await this.model.findAll({
      where: {
        user_id: userId,
        is_revoked: false,
        trusted_until: { [Op.gt]: now }
      },
      order: [['last_used_at', 'DESC']]
    });

    return devices.map((d) => ({
      id: d.id,
      deviceId: d.device_id ? `${String(d.device_id).slice(0, 6)}...` : null,
      deviceName: d.device_name || 'Dispositivo de confianza',
      ipAddress: d.ip_address,
      trustedUntil: d.trusted_until,
      createdAt: d.created_at,
      lastUsedAt: d.last_used_at
    }));
  }

  /**
   * Revoca la confianza de un dispositivo específico.
   */
  async revokeDevice(userId, deviceRecordId) {
    if (!userId || !deviceRecordId) return false;
    const [count] = await this.model.update(
      { is_revoked: true },
      { where: { id: deviceRecordId, user_id: userId } }
    );
    return count > 0;
  }

  /**
   * Revoca todos los dispositivos de confianza del usuario.
   */
  async revokeAllDevices(userId) {
    if (!userId) return 0;
    const [count] = await this.model.update(
      { is_revoked: true },
      { where: { user_id: userId, is_revoked: false } }
    );
    return count;
  }
}

module.exports = TrustedDeviceService;
