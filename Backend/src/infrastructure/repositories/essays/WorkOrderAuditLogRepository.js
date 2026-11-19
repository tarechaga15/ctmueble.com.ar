/**
 * Repositorio de registros de auditoría de órdenes de trabajo (work_order_audit_logs).
 */
const IWorkOrderAuditLogRepository = require('../../../domain/essays/repositories/IWorkOrderAuditLogRepository');
const WorkOrderAuditLog = require('../../../domain/essays/entities/WorkOrderAuditLog');
const { WorkOrderAuditLog: WorkOrderAuditLogModel, User } = require('../../models');
const SnapshotCryptoService = require('../../security/SnapshotCryptoService');

class WorkOrderAuditLogRepository extends IWorkOrderAuditLogRepository {
  constructor({ transaction } = {}) {
    super();
    this.transaction = transaction || null;
  }

  setTransaction(transaction) {
    this.transaction = transaction || null;
  }

  async save(auditLog) {
    const createOptions = this.transaction ? { transaction: this.transaction } : {};

    let previousHash = auditLog.previousHash || null;
    if (!previousHash) {
      try {
        const prevLog = await WorkOrderAuditLogModel.findOne({
          where: { work_order_id: auditLog.workOrderId },
          order: [['timestamp', 'DESC']],
          attributes: ['record_hash'],
          ...(this.transaction ? { transaction: this.transaction } : {})
        });
        previousHash = prevLog?.record_hash || null;
      } catch (_) {}
    }

    let recordHash = auditLog.recordHash || null;
    let signature = auditLog.signature || null;

    try {
      const cryptoService = SnapshotCryptoService.getInstance();
      const hashed = cryptoService.hashCanonical({
        work_order_id: auditLog.workOrderId,
        user_id: auditLog.userId,
        event_code: auditLog.eventCode,
        timestamp: auditLog.timestamp,
        metadata: auditLog.metadata,
        previous_hash: previousHash
      });
      recordHash = hashed.canonicalHash;
      const signed = cryptoService.signHash(recordHash);
      signature = signed.signature;
    } catch (_) {}

    const row = await WorkOrderAuditLogModel.create({
      work_order_id: auditLog.workOrderId,
      user_id: auditLog.userId,
      event_code: auditLog.eventCode,
      timestamp: auditLog.timestamp,
      metadata: auditLog.metadata,
      record_hash: recordHash,
      signature: signature,
      previous_hash: previousHash
    }, createOptions);
    auditLog.id = row.id;
    auditLog.recordHash = recordHash;
    auditLog.signature = signature;
    auditLog.previousHash = previousHash;
    return auditLog;
  }

  async findByWorkOrderId(workOrderId) {
    const options = {
      where: { work_order_id: workOrderId },
      order: [['timestamp', 'DESC']],
      include: [{ model: User, as: 'userAudit', attributes: ['id', 'name', 'mail'] }]
    };
    if (this.transaction) options.transaction = this.transaction;
    const rows = await WorkOrderAuditLogModel.findAll(options);
    return rows.map(r => this.mapToDomain(r));
  }

  async findById(id) {
    const options = { where: { id }, include: [{ model: User, as: 'userAudit', attributes: ['id', 'name', 'mail'] }] };
    if (this.transaction) options.transaction = this.transaction;
    const row = await WorkOrderAuditLogModel.findOne(options);
    return row ? this.mapToDomain(row) : null;
  }

  mapToDomain(data) {
    const plain = data.get ? data.get({ plain: true }) : data;
    let userName = 'Usuario desconocido';
    if (plain.userAudit) {
      userName = plain.userAudit.name || plain.userAudit.mail || 'Usuario desconocido';
    }
    return new WorkOrderAuditLog({
      id: plain.id,
      workOrderId: plain.work_order_id,
      userId: plain.user_id,
      userName,
      eventCode: plain.event_code,
      timestamp: plain.timestamp,
      metadata: plain.metadata,
      recordHash: plain.record_hash || null,
      signature: plain.signature || null,
      previousHash: plain.previous_hash || null
    });
  }
}

module.exports = WorkOrderAuditLogRepository;
