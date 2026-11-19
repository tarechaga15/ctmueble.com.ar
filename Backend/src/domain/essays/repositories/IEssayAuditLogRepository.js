/**
 * Interfaz del repositorio de registros de auditoría de ensayos.
 * Define los métodos que debe implementar cualquier repositorio de auditoría.
 */
class IEssayAuditLogRepository {
  /**
   * Guarda un nuevo registro de auditoría.
   * @param {EssayAuditLog} auditLog - Registro de auditoría a guardar
   * @param {Object} transaction - Transacción de base de datos (opcional)
   * @returns {Promise<EssayAuditLog>} Registro de auditoría guardado con ID asignado
   */
  async save(auditLog, transaction = null) {
    throw new Error('Method save() must be implemented');
  }

  /**
   * Obtiene todos los registros de auditoría de un ensayo.
   * @param {string} essayId - ID del ensayo
   * @param {Object} transaction - Transacción de base de datos (opcional)
   * @returns {Promise<Array<EssayAuditLog>>} Lista de registros de auditoría ordenados por fecha descendente
   */
  async findByEssayId(essayId, transaction = null) {
    throw new Error('Method findByEssayId() must be implemented');
  }

  /**
   * Obtiene un registro de auditoría por su ID.
   * @param {string} id - ID del registro de auditoría
   * @param {Object} transaction - Transacción de base de datos (opcional)
   * @returns {Promise<EssayAuditLog|null>} Registro de auditoría o null si no existe
   */
  async findById(id, transaction = null) {
    throw new Error('Method findById() must be implemented');
  }
}

module.exports = IEssayAuditLogRepository;

