/**
 * Interfaz del repositorio de clientes.
 * Define los métodos que debe implementar cualquier repositorio de clientes.
 */
class IClientRepository {
  /**
   * Busca un cliente por su ID.
   * @param {string} id - ID del cliente
   * @returns {Promise<Client>} El cliente encontrado o null
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene todos los clientes.
   * @returns {Promise<Array<Client>>} Lista de clientes
   */
  async findAll() {
    throw new Error('Method not implemented');
  }

  /**
   * Busca un cliente por su CUIT.
   * @param {string} cuit - CUIT del cliente
   * @returns {Promise<Client>} El cliente encontrado o null
   */
  async findByCuit(cuit) {
    throw new Error('Method not implemented');
  }

  /**
   * Guarda un nuevo cliente.
   * @param {Client} client - Entidad Client a guardar
   * @returns {Promise<Client>} El cliente guardado con su ID asignado
   */
  async save(client) {
    throw new Error('Method not implemented');
  }

  /**
   * Actualiza un cliente existente.
   * @param {Client} client - Entidad Client con los cambios
   * @returns {Promise<Client>} El cliente actualizado
   */
  async update(client) {
    throw new Error('Method not implemented');
  }

  /**
   * Elimina un cliente por su ID.
   * @param {string} id - ID del cliente a eliminar
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }

  async addContactToClient(clientId, personId) {
    throw new Error('Method not implemented');
  }

  async removeContactFromClient(clientId, personId) {
    throw new Error('Method not implemented');
  }

  async findAllByUserAndOrigin(userId, origin) {
    throw new Error('Method not implemented');
  }

  async findAllByOrigin(origin) {
    throw new Error('Method not implemented');
  }

  async findOneByCuitAndOrigin(cuit, origin) {
    throw new Error('Method not implemented');
  }

  async isContactLinked(clientId, personId) {
    throw new Error('Method not implemented');
  }

  async getContactsByClientId(clientId) {
    throw new Error('Method not implemented');
  }
}

module.exports = IClientRepository;

