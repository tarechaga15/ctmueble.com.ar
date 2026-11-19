const { getUuidV4 } = require('../../../shared/uuid');

/**
 * Entidad de dominio que representa un registro de auditoría de una orden de trabajo.
 */
class WorkOrderAuditLog {
  constructor({
    id,
    workOrderId,
    userId,
    userName,
    eventCode,
    timestamp,
    metadata = null,
    recordHash = null,
    signature = null,
    previousHash = null
  }) {
    this.id = id;
    this.workOrderId = workOrderId;
    this.userId = userId;
    this.userName = userName;
    this.eventCode = eventCode;
    this.timestamp = timestamp || new Date();
    this.metadata = metadata;
    this.recordHash = recordHash;
    this.signature = signature;
    this.previousHash = previousHash;
  }

  static async create(workOrderId, userId, userName, eventCode, metadata = null) {
    const id = await getUuidV4();
    return new WorkOrderAuditLog({
      id,
      workOrderId,
      userId,
      userName,
      eventCode,
      timestamp: new Date(),
      metadata
    });
  }
}

module.exports = WorkOrderAuditLog;
