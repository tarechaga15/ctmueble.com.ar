/**
 * Value Object que representa el estado de una muestra.
 * Garantiza que solo se puedan usar estados válidos.
 */
class SampleStatus {
  static PENDING = 'PENDING';
  static RECEIVED = 'RECEIVED';
  static ANALYZED = 'ANALYZED';
  static REJECTED = 'REJECTED';
  static SAVED = 'SAVED';
  static RETURNED = 'RETURNED';

  /**
   * Crea una instancia de SampleStatus.
   * @param {string} value - Valor del estado
   * @throws {Error} Si el estado no es válido
   */
  constructor(value) {
    if (!Object.values(SampleStatus).includes(value)) {
      throw new Error(`Estado inválido: ${value}`);
    }
    this.value = value;
  }

  /**
   * Compara este estado con otro.
   * @param {SampleStatus} other - Otro estado a comparar
   * @returns {boolean} True si son iguales
   */
  equals(other) {
    return this.value === other.value;
  }
}

module.exports = SampleStatus;

