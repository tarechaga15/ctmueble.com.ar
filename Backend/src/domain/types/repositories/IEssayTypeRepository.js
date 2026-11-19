/**
 * Interfaz del repositorio de tipos de ensayo (catálogo).
 */
class IEssayTypeRepository {
  /**
   * Obtiene todos los tipos de ensayo ordenados por nombre.
   * @returns {Promise<Array<{ id: number, name: string }>>}
   */
  async findAll() {
    throw new Error('Method not implemented');
  }

  /**
   * Crea un tipo de ensayo o devuelve el existente con el mismo nombre.
   * @param {string} name
   * @returns {Promise<{ id: number, name: string, created: boolean }>}
   */
  async createByName(_name) {
    throw new Error('Method not implemented');
  }
}

module.exports = IEssayTypeRepository;
