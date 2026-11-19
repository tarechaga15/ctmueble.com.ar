/**
 * Implementación del repositorio de registros de auditoría usando Sequelize.
 * Convierte entre modelos de Sequelize y entidades de dominio.
 */
const IEssayAuditLogRepository = require('../../../domain/essays/repositories/IEssayAuditLogRepository');
const EssayAuditLog = require('../../../domain/essays/entities/EssayAuditLog');
const { EssayAuditLog: EssayAuditLogModel, User } = require('../../models');
const SnapshotCryptoService = require('../../security/SnapshotCryptoService');

class EssayAuditLogRepository extends IEssayAuditLogRepository {
  constructor({ transaction } = {}) {
    super();
    this.transaction = transaction || null;
  }

  setTransaction(transaction) {
    this.transaction = transaction || null;
  }
  /**
   * Guarda un nuevo registro de auditoría usando Sequelize.
   * @param {EssayAuditLog} auditLog - Entidad EssayAuditLog a guardar
   * @returns {Promise<EssayAuditLog>} Entidad EssayAuditLog con ID asignado
   */
  async save(auditLog) {
    const createOptions = {};
    if (this.transaction) {
      createOptions.transaction = this.transaction;
    }

    let previousHash = auditLog.previousHash || null;
    if (!previousHash) {
      try {
        const prevLog = await EssayAuditLogModel.findOne({
          where: { essay: auditLog.essayId },
          order: [['timestamp', 'DESC']],
          attributes: ['record_hash'],
          ...(this.transaction ? { transaction: this.transaction } : {})
        });
        previousHash = prevLog?.record_hash || null;
      } catch (_) {}
    }

    const payloadToHash = {
      essay: auditLog.essayId,
      user_id: auditLog.userId,
      event_code: auditLog.eventCode,
      timestamp: auditLog.timestamp,
      metadata: auditLog.metadata,
      device_id: auditLog.deviceId || null,
      device_fingerprint: auditLog.deviceFingerprint || null,
      previous_hash: previousHash
    };

    let recordHash = auditLog.recordHash || null;
    let signature = auditLog.signature || null;

    try {
      const cryptoService = SnapshotCryptoService.getInstance();
      const hashed = cryptoService.hashCanonical(payloadToHash);
      recordHash = hashed.canonicalHash;
      const signed = cryptoService.signHash(recordHash);
      signature = signed.signature;
    } catch (_) {}

    const auditLogData = await EssayAuditLogModel.create({
      essay: auditLog.essayId,
      user_id: auditLog.userId,
      event_code: auditLog.eventCode,
      timestamp: auditLog.timestamp,
      metadata: auditLog.metadata,
      device_id: auditLog.deviceId || null,
      device_fingerprint: auditLog.deviceFingerprint || null,
      client_name: auditLog.clientName || null,
      ip_address: auditLog.ipAddress || null,
      user_agent: auditLog.userAgent || null,
      session_id: auditLog.sessionId || null,
      record_hash: recordHash,
      signature: signature,
      previous_hash: previousHash
    }, createOptions);

    auditLog.id = auditLogData.id;
    auditLog.recordHash = recordHash;
    auditLog.signature = signature;
    auditLog.previousHash = previousHash;
    return auditLog;
  }

  /**
   * Obtiene todos los registros de auditoría de un ensayo usando Sequelize.
   * @param {string} essayId - ID del ensayo
   * @returns {Promise<Array<EssayAuditLog>>} Lista de entidades EssayAuditLog ordenadas por fecha descendente
   */
  async findByEssayId(essayId) {
    const options = {
      where: { essay: essayId },
      order: [['timestamp', 'DESC']],
      include: [
        { model: User, as: 'userAudit', attributes: ['id', 'name', 'mail'] }
      ]
    };
    
    if (this.transaction) {
      options.transaction = this.transaction;
    }

    const auditLogsData = await EssayAuditLogModel.findAll(options);
    return auditLogsData.map(data => this.mapToDomain(data));
  }

  /**
   * Obtiene un registro de auditoría por su ID usando Sequelize.
   * @param {string} id - ID del registro de auditoría
   * @returns {Promise<EssayAuditLog|null>} Entidad EssayAuditLog o null si no existe
   */
  async findById(id) {
    const options = {
      where: { id }
    };
    
    if (this.transaction) {
      options.transaction = this.transaction;
    }

    const auditLogData = await EssayAuditLogModel.findOne(options);
    return auditLogData ? this.mapToDomain(auditLogData) : null;
  }

  /**
   * Convierte un modelo de Sequelize a una entidad de dominio EssayAuditLog.
   * @param {Object} auditLogData - Modelo de Sequelize
   * @returns {EssayAuditLog} Entidad EssayAuditLog de dominio
   */
  mapToDomain(auditLogData) {
    // Obtener el nombre del usuario desde la relación si está disponible
    let userName = 'Usuario desconocido';
    if (auditLogData.userAudit) {
      userName = auditLogData.userAudit.name || auditLogData.userAudit.mail || 'Usuario desconocido';
    }
    
    return new EssayAuditLog({
      id: auditLogData.id,
      essayId: auditLogData.essay,
      userId: auditLogData.user_id,
      userName: userName,
      eventCode: auditLogData.event_code,
      timestamp: auditLogData.timestamp,
      metadata: auditLogData.metadata,
      deviceId: auditLogData.device_id,
      deviceFingerprint: auditLogData.device_fingerprint,
      clientName: auditLogData.client_name,
      ipAddress: auditLogData.ip_address,
      userAgent: auditLogData.user_agent,
      sessionId: auditLogData.session_id,
      recordHash: auditLogData.record_hash,
      signature: auditLogData.signature,
      previousHash: auditLogData.previous_hash
    });
  }
}

module.exports = EssayAuditLogRepository;

