/**
 * DTO (Data Transfer Object) para actualizar un ensayo existente.
 * Se utiliza para validar y transferir datos de actualización de ensayos a través de PUT.
 */
class UpdateEssayDTO {
  /**
   * Constructor del DTO de actualización de ensayo.
   * @param {Object} params - Parámetros del ensayo a actualizar
   * @param {string} [params.observations] - Observaciones del ensayo
   * @param {Object} [params.elements] - Elementos del ensayo
   * @param {Object} [params.billing] - Información de facturación
   * @param {Object} [params.terms] - Términos y condiciones (solo para usuarios LABORATORY)
   * @param {number} [params.terms.days_to_do] - Días para realizar el ensayo
   * @param {number} [params.terms.price] - Precio del ensayo
   * @param {number} [params.terms.samples_conservation_days] - Días de conservación de muestras
   */
  constructor({
    observations,
    elements,
    billing,
    terms
  }) {
    this.observations = observations;
    this.elements = elements;
    this.billing = billing;
    this.terms = terms;
  }

  /**
   * Convierte el DTO a un objeto plano.
   * @returns {Object} Objeto plano con los datos del DTO
   */
  toPlainObject() {
    return {
      observations: this.observations,
      elements: this.elements,
      billing: this.billing,
      terms: this.terms
    };
  }
}

module.exports = UpdateEssayDTO;

