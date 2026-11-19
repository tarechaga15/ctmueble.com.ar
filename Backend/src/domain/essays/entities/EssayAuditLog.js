const { getUuidV4 } = require('../../../shared/uuid');

/**
 * Entidad de dominio que representa un registro de auditoría de un ensayo.
 * Registra todas las acciones realizadas sobre un ensayo con información del usuario,
 * evento, fecha y hora exacta.
 */
class EssayAuditLog {
  /**
   * Constructor de la entidad EssayAuditLog.
   * @param {Object} params - Parámetros del registro de auditoría
   * @param {string} params.id - Identificador único del registro
   * @param {string} params.essayId - ID del ensayo relacionado
   * @param {string} params.userId - ID del usuario que realizó la acción
   * @param {string} params.userName - Nombre del usuario que realizó la acción
   * @param {string} params.eventCode - Código del evento (REQUEST_CREATED, REQUEST_APPROVED, etc.)
   * @param {Date} params.timestamp - Fecha y hora exacta del evento
   * @param {Object} params.metadata - Metadatos adicionales del evento (opcional)
   */
  constructor({
    id,
    essayId,
    userId,
    userName,
    eventCode,
    timestamp,
    metadata = null,
    deviceId = null,
    deviceFingerprint = null,
    clientName = null,
    ipAddress = null,
    userAgent = null,
    sessionId = null,
    recordHash = null,
    signature = null,
    previousHash = null
  }) {
    this.id = id;
    this.essayId = essayId;
    this.userId = userId;
    this.userName = userName;
    this.eventCode = eventCode;
    this.timestamp = timestamp || new Date();
    this.metadata = metadata;
    this.deviceId = deviceId;
    this.deviceFingerprint = deviceFingerprint;
    this.clientName = clientName;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.sessionId = sessionId;
    this.recordHash = recordHash;
    this.signature = signature;
    this.previousHash = previousHash;
  }

  /**
   * Crea un nuevo registro de auditoría.
   * @param {string} essayId - ID del ensayo
   * @param {string} userId - ID del usuario
   * @param {string} userName - Nombre del usuario
   * @param {string} eventCode - Código del evento
   * @param {Object} metadata - Metadatos adicionales (opcional)
   * @param {Date} [timestamp] - Instante exacto del evento (opcional). Si no se proporciona, se usa la fecha actual.
   * @param {Object} [deviceInfo] - Información del dispositivo (opcional)
   * @returns {Promise<EssayAuditLog>} Nueva instancia de EssayAuditLog
   */
  static async create(essayId, userId, userName, eventCode, metadata = null, timestamp = null, deviceInfo = {}) {
    const id = await getUuidV4();
    return new EssayAuditLog({
      id,
      essayId,
      userId,
      userName,
      eventCode,
      timestamp: timestamp || new Date(),
      metadata,
      deviceId: deviceInfo?.deviceId || null,
      deviceFingerprint: deviceInfo?.deviceFingerprint || null,
      clientName: deviceInfo?.clientName || null,
      ipAddress: deviceInfo?.ipAddress || null,
      userAgent: deviceInfo?.userAgent || null,
      sessionId: deviceInfo?.sessionId || null,
      previousHash: deviceInfo?.previousHash || null
    });
  }
}

module.exports = EssayAuditLog;

