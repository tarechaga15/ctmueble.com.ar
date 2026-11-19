/**
 * Interfaz del repositorio de países (catálogo).
 */
class ICountryRepository {
  /**
   * Obtiene todos los países ordenados por nombre.
   * @returns {Promise<Array<{ id: string, name: string, country_code?: string }>>}
   */
  async findAll() {
    throw new Error('Method not implemented');
  }
}

module.exports = ICountryRepository;
