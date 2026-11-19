/**
 * Implementación del repositorio de países usando Sequelize.
 */
const ICountryRepository = require('../../../domain/types/repositories/ICountryRepository');
const { Country: CountryModel } = require('../../models');

class CountryRepository extends ICountryRepository {
  async findAll() {
    const rows = await CountryModel.findAll({
      attributes: ['id', 'name', 'country_code'],
      order: [['name', 'ASC']]
    });
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      ...(r.country_code != null && { country_code: r.country_code })
    }));
  }
}

module.exports = CountryRepository;
