/**
 * Interfaz del repositorio de usuarios.
 * Define los métodos que debe implementar cualquier repositorio de usuarios.
 */
class IUserRepository {
  /**
   * Busca un usuario por su ID.
   * @param {string} id - ID del usuario
   * @returns {Promise<User>} El usuario encontrado o null
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Busca un usuario por su email.
   * @param {string} mail - Email del usuario
   * @returns {Promise<User>} El usuario encontrado o null
   */
  async findByMail(mail) {
    throw new Error('Method not implemented');
  }

  /**
   * Guarda un nuevo usuario.
   * @param {User} user - Entidad User a guardar
   * @returns {Promise<User>} El usuario guardado con su ID asignado
   */
  async save(user) {
    throw new Error('Method not implemented');
  }

  /**
   * Actualiza un usuario existente.
   * @param {User} user - Entidad User con los cambios
   * @returns {Promise<User>} El usuario actualizado
   */
  async update(user) {
    throw new Error('Method not implemented');
  }

  /**
   * Elimina un usuario por su ID.
   * @param {string} id - ID del usuario a eliminar
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene todos los laboratorios asociados a un usuario.
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Lista de laboratorios
   */
  async findUserLaboratories(userId) {
    throw new Error('Method not implemented');
  }
}

module.exports = IUserRepository;

