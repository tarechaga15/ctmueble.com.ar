/**
 * Interfaz del repositorio de ensayos.
 * Define los métodos que debe implementar cualquier repositorio de ensayos.
 * Permite la inversión de dependencias, desacoplando el dominio de la infraestructura.
 */
class IEssayRepository {
  /**
   * Busca un ensayo por su ID.
   * @param {string} id - ID del ensayo
   * @param {Object} user - Usuario que realiza la búsqueda (para filtros de permisos)
   * @returns {Promise<Essay>} El ensayo encontrado o null
   */
  async findById(id, user) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene todos los ensayos, aplicando filtros según el usuario.
   * @param {Object} user - Usuario que realiza la búsqueda
   * @returns {Promise<Array<Essay>>} Lista de ensayos
   */
  async findAll(user) {
    throw new Error('Method not implemented');
  }

  /**
   * Guarda un nuevo ensayo.
   * @param {Essay} essay - Entidad Essay a guardar
   * @returns {Promise<Essay>} El ensayo guardado con su ID asignado
   */
  async save(essay) {
    throw new Error('Method not implemented');
  }

  /**
   * Actualiza un ensayo existente.
   * @param {Essay} essay - Entidad Essay con los cambios
   * @returns {Promise<Essay>} El ensayo actualizado
   */
  async update(essay) {
    throw new Error('Method not implemented');
  }

  /**
   * Elimina un ensayo por su ID.
   * @param {string} id - ID del ensayo a eliminar
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Busca un ensayo por su código único.
   * @param {string} code - Código del ensayo
   * @returns {Promise<Essay>} El ensayo encontrado o null
   */
  async findByCode(code) {
    throw new Error('Method not implemented');
  }
}

module.exports = IEssayRepository;

