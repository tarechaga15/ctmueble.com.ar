/**
 * Entidad de dominio que representa un tipo de ensayo (types_essays).
 */
class EssayType {
  /**
   * @param {Object} params
   * @param {number} params.id - ID del tipo
   * @param {string} params.name - Nombre del tipo de ensayo
   */
  constructor({ id, name }) {
    this.id = id;
    this.name = name;
  }
}

module.exports = EssayType;
