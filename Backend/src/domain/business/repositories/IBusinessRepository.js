/**
 * Interfaz del repositorio de empresas.
 * Define los métodos que debe implementar cualquier repositorio de empresas.
 */
class IBusinessRepository {
  /**
   * Busca una empresa por su CUIT.
   * @param {string} cuit - CUIT de la empresa
   * @returns {Promise<Business>} La empresa encontrada o null
   */
  async findByCuit(cuit) {
    throw new Error('Method not implemented');
  }

  /**
   * Guarda una nueva empresa.
   * @param {Business} business - Entidad Business a guardar
   * @returns {Promise<Business>} La empresa guardada
   */
  async save(business) {
    throw new Error('Method not implemented');
  }

  /**
   * Actualiza una empresa existente.
   * @param {Business} business - Entidad Business con los cambios
   * @returns {Promise<Business>} La empresa actualizada
   */
  async update(business) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene las direcciones de una empresa, aplicando filtros según el usuario.
   * @param {string} cuit - CUIT de la empresa
   * @param {Object} user - Usuario que realiza la consulta
   * @returns {Promise<Array>} Lista de direcciones
   */
  async findAddresses(cuit, user) {
    throw new Error('Method not implemented');
  }

  /**
   * Agrega una dirección a una empresa.
   * @param {string} cuit - CUIT de la empresa
   * @param {Object} address - Datos de la dirección
   * @returns {Promise<Object>} Dirección creada
   */
  async addAddress(cuit, address) {
    throw new Error('Method not implemented');
  }

  /**
   * Actualiza una dirección de una empresa.
   * @param {string} addressId - ID de la dirección
   * @param {Object} addressData - Nuevos datos de la dirección
   * @param {Object} user - Usuario que actualiza
   * @returns {Promise<Object>} Dirección actualizada
   */
  async updateAddress(addressId, addressData, user) {
    throw new Error('Method not implemented');
  }

  /**
   * Elimina una dirección de una empresa.
   * @param {string} addressId - ID de la dirección
   * @param {Object} user - Usuario que elimina
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  async deleteAddress(addressId, user) {
    throw new Error('Method not implemented');
  }
}

module.exports = IBusinessRepository;

