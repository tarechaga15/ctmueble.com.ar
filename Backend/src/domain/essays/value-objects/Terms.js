/**
 * Value Object que representa los términos y condiciones de un ensayo.
 * Contiene información sobre plazos, conservación de muestras y precio.
 */
class Terms {
  /**
   * Crea una instancia de Terms.
   * @param {Object} params - Parámetros de los términos
   * @param {number} params.daysToDo - Días para realizar el ensayo
   * @param {number} params.samplesConservationDays - Días de conservación de muestras
   * @param {number} params.price - Precio del ensayo
   */
  constructor({
    daysToDo,
    samplesConservationDays,
    price
  }) {
    this.daysToDo = daysToDo;
    this.samplesConservationDays = samplesConservationDays;
    this.price = price;
  }

  /**
   * Verifica si los términos están completos.
   * @returns {boolean} True si todos los campos requeridos están definidos
   */
  isComplete() {
    return this.price != null && this.daysToDo != null && this.samplesConservationDays != null;
  }
}

module.exports = Terms;

