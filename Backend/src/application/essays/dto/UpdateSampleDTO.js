/**
 * DTO (Data Transfer Object) para actualizar una muestra existente.
 * Se utiliza para validar y transferir datos de actualización de muestras a través de PUT.
 */
class UpdateSampleDTO {
  /**
   * Constructor del DTO de actualización de muestra.
   * @param {Object} params - Parámetros de la muestra a actualizar
   * @param {number|null} [params.result] - Resultado del análisis (puede ser null para limpiar el resultado)
   * @param {boolean} [params.accepted] - Indica si fue aceptada
   * @param {boolean} [params.internal_conditioning] - Indica si tiene acondicionamiento interno
   * @param {string} [params.observations] - Observaciones de la muestra
   */
  constructor({
    result,
    accepted,
    internal_conditioning,
    observations
  }) {
    this.result = result;
    this.accepted = accepted;
    this.internal_conditioning = internal_conditioning;
    this.observations = observations;
  }

  /**
   * Valida que el resultado sea un número válido si se proporciona.
   * @throws {Error} Si el resultado no es válido
   */
  validate() {
    if (this.result !== null && this.result !== undefined && this.result !== '') {
      if (isNaN(this.result) && isNaN(parseFloat(this.result))) {
        throw new Error('El resultado debe ser un número válido');
      }
    }
  }

  /**
   * Convierte el DTO a un objeto plano.
   * @returns {Object} Objeto plano con los datos del DTO
   */
  toPlainObject() {
    return {
      result: this.result,
      accepted: this.accepted,
      internal_conditioning: this.internal_conditioning,
      observations: this.observations
    };
  }
}

module.exports = UpdateSampleDTO;

