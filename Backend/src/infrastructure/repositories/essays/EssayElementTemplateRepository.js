/**
 * Repositorio de plantillas de elementos a ensayar (essay_element_templates).
 * Distingue por origin: CLIENT (user_id = usuario) o LABORATORY (user_id = null).
 */
const { EssayElementTemplate: Model, Country } = require('../../models');

function whereForProfile(profile, userId) {
  if (profile === 'LABORATORY') {
    return { origin: 'LABORATORY' };
  }
  return { origin: 'CLIENT', user_id: userId };
}

function mapRow(plain) {
  if (plain.countryData) {
    plain.country = plain.countryData;
    delete plain.countryData;
  }
  if (plain.origin === 'LABORATORY') {
    plain.user_id = null;
  }
  return plain;
}

class EssayElementTemplateRepository {
  constructor({ transaction } = {}) {
    this.transaction = transaction || null;
  }

  setTransaction(transaction) {
    this.transaction = transaction || null;
  }
  /**
   * Lista plantillas del usuario según perfil.
   * CLIENT: origin='CLIENT' y user_id=userId. LABORATORY: origin='LABORATORY' y user_id IS NULL.
   * @param {string} userId - UUID del usuario (solo usado si profile es CLIENT)
   * @param {string} profile - 'CLIENT' | 'LABORATORY'
   * @returns {Promise<Array<Object>>} Array de { id, product, manufacturer, country, origin, user_id? }
   */
  async findByUser(userId, profile) {
    const where = whereForProfile(profile, userId);
    const options = {
      where,
      include: [{ model: Country, as: 'countryData', attributes: ['id', 'name', 'country_code'] }]
    };
    if (this.transaction) options.transaction = this.transaction;
    const rows = await Model.findAll(options);
    return rows.map((r) => mapRow(r.get ? r.get({ plain: true }) : r));
  }

  /**
   * Busca una plantilla por id, restringido al perfil y usuario.
   * @param {string} id - UUID de la plantilla
   * @param {string} userId - UUID del usuario (solo usado si profile es CLIENT)
   * @param {string} profile - 'CLIENT' | 'LABORATORY'
   * @returns {Promise<Object|null>}
   */
  async findById(id, userId, profile) {
    const where = { id, ...whereForProfile(profile, userId) };
    const options = {
      where,
      include: [{ model: Country, as: 'countryData', attributes: ['id', 'name', 'country_code'] }]
    };
    if (this.transaction) options.transaction = this.transaction;
    const row = await Model.findOne(options);
    if (!row) return null;
    return mapRow(row.get ? row.get({ plain: true }) : row);
  }

  /**
   * Crea una plantilla.
   * @param {Object} data - { user_id?, origin, product, manufacturer, country }
   * @returns {Promise<Object>}
   */
  async create(data) {
    const options = this.transaction ? { transaction: this.transaction } : {};
    const row = await Model.create(
      {
        user_id: data.user_id ?? null,
        origin: data.origin || 'CLIENT',
        product: data.product || '',
        manufacturer: data.manufacturer || '',
        country: data.country || null
      },
      options
    );
    const plain = row.get ? row.get({ plain: true }) : row;
    return mapRow(plain);
  }

  /**
   * Elimina una plantilla si pertenece al usuario según perfil.
   * CLIENT: id + user_id + origin CLIENT. LABORATORY: id + origin LABORATORY + user_id null.
   * @param {string} id - UUID de la plantilla
   * @param {string} userId - UUID del usuario (solo usado si profile es CLIENT)
   * @param {string} profile - 'CLIENT' | 'LABORATORY'
   * @returns {Promise<number>} Filas eliminadas
   */
  async deleteByIdAndUser(id, userId, profile) {
    const where = { id, ...whereForProfile(profile, userId) };
    const options = { where };
    if (this.transaction) options.transaction = this.transaction;
    const n = await Model.destroy(options);
    return n;
  }
}

module.exports = EssayElementTemplateRepository;
