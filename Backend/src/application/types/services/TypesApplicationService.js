/**
 * Servicio de aplicación para catálogos de tipos: tipos de ensayo, países, distritos.
 * Usa repositorios de dominio (no modelos directamente).
 */
class TypesApplicationService {
  /**
   * @param {Object} deps
   * @param {IEssayTypeRepository} deps.essayTypeRepository
   * @param {ICountryRepository} deps.countryRepository
   * @param {IDistrictRepository} deps.districtRepository
   */
  constructor({ essayTypeRepository, countryRepository, districtRepository }) {
    this.essayTypeRepository = essayTypeRepository;
    this.countryRepository = countryRepository;
    this.districtRepository = districtRepository;
  }

  /**
   * Lista todos los tipos de ensayo (id, name).
   * @returns {Promise<Array<{ id: number, name: string }>>}
   */
  async getEssayTypes() {
    return this.essayTypeRepository.findAll();
  }

  /**
   * Alta de un tipo de ensayo. Si ya existe el nombre, devuelve ese registro.
   * @param {string} name
   * @returns {Promise<{ type: { id: number, name: string }, created: boolean }>}
   */
  async createEssayType(name) {
    return this.essayTypeRepository.createByName(name);
  }

  /**
   * Lista todos los países (id, name, country_code).
   * @returns {Promise<Array<{ id: string, name: string, country_code?: string }>>}
   */
  async getCountries() {
    return this.countryRepository.findAll();
  }

  /**
   * Lista todos los distritos (id, name, country).
   * @returns {Promise<Array<{ id: string, name: string, country: string }>>}
   */
  async getDistricts() {
    return this.districtRepository.findAll();
  }
}

module.exports = TypesApplicationService;
