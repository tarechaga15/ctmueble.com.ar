/**
 * DTO (Data Transfer Object) para establecer términos de un ensayo.
 * Se utiliza para validar y transferir datos de términos a través de PUT.
 */
class SetTermsDTO {
  /**
   * Constructor del DTO de términos de ensayo.
   * @param {Object} params - Parámetros de los términos
   * @param {number} params.days_to_do - Días para realizar el ensayo
   * @param {number} params.price - Precio del ensayo
   * @param {number} params.samples_conservation_days - Días de conservación de muestras
   */
  constructor({
    days_to_do,
    price,
    samples_conservation_days
  }) {
    this.days_to_do = days_to_do;
    this.price = price;
    this.samples_conservation_days = samples_conservation_days;
  }

  /**
   * Valida que los campos requeridos estén presentes y sean válidos.
   * @throws {Error} Si faltan campos requeridos o son inválidos
   */
  validate() {
    if (this.days_to_do === undefined || this.days_to_do === null) {
      throw new Error('Los días para realizar el ensayo son requeridos');
    }
    if (typeof this.days_to_do !== 'number' || this.days_to_do <= 0) {
      throw new Error('Los días para realizar el ensayo deben ser un número positivo');
    }
    if (this.price === undefined || this.price === null) {
      throw new Error('El precio es requerido');
    }
    if (typeof this.price !== 'number' || this.price < 0) {
      throw new Error('El precio debe ser un número mayor o igual a cero');
    }
    if (this.samples_conservation_days === undefined || this.samples_conservation_days === null) {
      throw new Error('Los días de conservación de muestras son requeridos');
    }
    if (typeof this.samples_conservation_days !== 'number' || this.samples_conservation_days <= 0) {
      throw new Error('Los días de conservación de muestras deben ser un número positivo');
    }
  }

  /**
   * Convierte el DTO a un objeto plano.
   * @returns {Object} Objeto plano con los datos del DTO
   */
  toPlainObject() {
    return {
      days_to_do: this.days_to_do,
      price: this.price,
      samples_conservation_days: this.samples_conservation_days
    };
  }
}

module.exports = SetTermsDTO;

