/**
 * Interfaz del repositorio de distritos (catálogo).
 */
class IDistrictRepository {
  /**
   * Obtiene todos los distritos ordenados por nombre.
   * @returns {Promise<Array<{ id: string, name: string, country: string }>>}
   */
  async findAll() {
    throw new Error('Method not implemented');
  }
}

module.exports = IDistrictRepository;
