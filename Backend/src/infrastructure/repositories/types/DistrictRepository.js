/**
 * Implementación del repositorio de distritos usando Sequelize.
 */
const IDistrictRepository = require('../../../domain/types/repositories/IDistrictRepository');
const { District: DistrictModel } = require('../../models');

class DistrictRepository extends IDistrictRepository {
  async findAll() {
    const rows = await DistrictModel.findAll({
      attributes: ['id', 'name', 'country', 'numeric_id'],
      order: [['name', 'ASC']]
    });
    return rows.map(r => ({ id: r.id, name: r.name, country: r.country, numeric_id: r.numeric_id }));
  }
}

module.exports = DistrictRepository;
