/**
 * Interfaz del repositorio de registros de auditoría de órdenes de trabajo.
 */
class IWorkOrderAuditLogRepository {
  async save(auditLog, transaction = null) {
    throw new Error('Method save() must be implemented');
  }

  async findByWorkOrderId(workOrderId, transaction = null) {
    throw new Error('Method findByWorkOrderId() must be implemented');
  }

  async findById(id, transaction = null) {
    throw new Error('Method findById() must be implemented');
  }
}

module.exports = IWorkOrderAuditLogRepository;
