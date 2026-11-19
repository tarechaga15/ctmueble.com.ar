/**
 * Implementación del repositorio de tipos de ensayo usando Sequelize.
 */
const { Op } = require('sequelize');
const IEssayTypeRepository = require('../../../domain/types/repositories/IEssayTypeRepository');
const EssayType = require('../../../domain/types/entities/EssayType');
const { EssayType: EssayTypeModel } = require('../../models');
const { escapeLike } = require('../../../shared/sqlLike');

class EssayTypeRepository extends IEssayTypeRepository {
  async findAll() {
    const rows = await EssayTypeModel.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    return rows.map((r) => new EssayType({ id: r.id, name: r.name }));
  }

  async findById(id) {
    const row = await EssayTypeModel.findOne({ where: { id } });
    return row ? new EssayType({ id: row.id, name: row.name }) : null;
  }

  async createByName(name) {
    const trimmed = String(name || '').trim();
    if (!trimmed) {
      const error = new Error('El nombre del ensayo es obligatorio');
      error.status = 400;
      throw error;
    }
    if (trimmed.length > 150) {
      const error = new Error('El nombre del ensayo no puede superar 150 caracteres');
      error.status = 400;
      throw error;
    }

    const existing = await EssayTypeModel.findOne({
      where: { name: { [Op.iLike]: escapeLike(trimmed) } }
    });
    if (existing) {
      return { type: new EssayType({ id: existing.id, name: existing.name }), created: false };
    }
    const row = await EssayTypeModel.create({ name: trimmed });
    return { type: new EssayType({ id: row.id, name: row.name }), created: true };
  }
}

module.exports = EssayTypeRepository;
