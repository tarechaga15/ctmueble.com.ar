/**
 * Interfaz del repositorio de muestras.
 * Define los métodos que debe implementar cualquier repositorio de muestras.
 */
class ISampleRepository {
  /**
   * Busca una muestra por su ID.
   * @param {string} id - ID de la muestra
   * @returns {Promise<Sample|null>} La entidad Sample si se encuentra, de lo contrario null.
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Busca todas las muestras de un ensayo.
   * @param {string} essayId - ID del ensayo
   * @returns {Promise<Array<Sample>>} Lista de muestras del ensayo
   */
  async findByEssayId(essayId) {
    throw new Error('Method not implemented');
  }

  /**
   * Busca todas las muestras de una orden de trabajo.
   * @param {string} workOrderId - ID de la orden de trabajo
   * @returns {Promise<Array<Sample>>} Lista de muestras de la orden
   */
  async findByWorkOrderId(workOrderId) {
    throw new Error('Method not implemented');
  }

  /**
   * Busca muestras por ensayo, código de fecha y tipo (muestra/contramuestra).
   * @param {string} essayId - ID del ensayo
   * @param {string} dateCode - Código de fecha
   * @param {boolean} isCountersample - Indica si buscar contramuestras
   * @returns {Promise<Array<Sample>>} Lista de muestras encontradas
   */
  async findByEssayAndDateCode(essayId, dateCode, isCountersample) {
    throw new Error('Method not implemented');
  }

  /**
   * Guarda una nueva muestra.
   * @param {Sample} sample - Entidad Sample a guardar
   * @returns {Promise<Sample>} Entidad Sample guardada con ID asignado
   */
  async save(sample) {
    throw new Error('Method not implemented');
  }

  /**
   * Guarda múltiples muestras en una transacción.
   * @param {Array<Sample>} samples - Lista de entidades Sample a guardar
   * @returns {Promise<Array<Sample>>} Lista de muestras guardadas
   */
  async saveMany(samples) {
    throw new Error('Method not implemented');
  }

  /**
   * Actualiza una muestra existente.
   * @param {Sample} sample - Entidad Sample a actualizar
   * @returns {Promise<Sample>} Entidad Sample actualizada
   */
  async update(sample) {
    throw new Error('Method not implemented');
  }

  /**
   * Elimina una muestra.
   * @param {string} id - ID de la muestra a eliminar
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }
}

module.exports = ISampleRepository;

