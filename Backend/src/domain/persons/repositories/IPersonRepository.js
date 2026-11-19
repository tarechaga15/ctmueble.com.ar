/**
 * Interfaz del repositorio de personas.
 * Define los métodos que debe implementar cualquier repositorio de personas.
 */
class IPersonRepository {
  /**
   * Busca una persona por su ID.
   * @param {string} id - ID de la persona
   * @param {Object} user - Usuario que realiza la búsqueda (para filtros de permisos)
   * @returns {Promise<Person>} La persona encontrada o null
   */
  async findById(id, user) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene todas las personas, aplicando filtros según el usuario.
   * @param {Object} user - Usuario que realiza la búsqueda
   * @returns {Promise<Array<Person>>} Lista de personas
   */
  async findAll(user) {
    throw new Error('Method not implemented');
  }

  /**
   * Guarda una nueva persona.
   * @param {Person} person - Entidad Person a guardar
   * @returns {Promise<Person>} La persona guardada con su ID asignado
   */
  async save(person) {
    throw new Error('Method not implemented');
  }

  /**
   * Actualiza una persona existente.
   * @param {Person} person - Entidad Person con los cambios
   * @returns {Promise<Person>} La persona actualizada
   */
  async update(person) {
    throw new Error('Method not implemented');
  }

  /**
   * Elimina una persona por su ID.
   * @param {string} id - ID de la persona a eliminar
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Vincula una persona a un cliente.
   * @param {string} personId - ID de la persona
   * @param {string} clientId - ID del cliente
   * @returns {Promise<void>}
   */
  async linkToClient(personId, clientId) {
    throw new Error('Method not implemented');
  }

  async unlinkFromClient(personId, clientId) {
    throw new Error('Method not implemented');
  }

  async findByClient(clientId) {
    throw new Error('Method not implemented');
  }
}

module.exports = IPersonRepository;
