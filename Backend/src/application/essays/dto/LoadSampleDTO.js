/**
 * DTO (Data Transfer Object) para cargar una muestra.
 * Se utiliza para validar y transferir datos de creación de muestras a través de POST.
 */
class LoadSampleDTO {
  /**
   * Constructor del DTO de carga de muestra.
   * @param {Object} params - Parámetros de la muestra a cargar
   * @param {number} params.correlative - Número correlativo de la muestra
   * @param {boolean} [params.countersample] - Indica si es contramuestra (default: false)
   * @param {boolean} [params.accepted] - Indica si fue aceptada (default: false)
   * @param {boolean} [params.internal_conditioning] - Indica si tiene acondicionamiento interno (default: false)
   * @param {string} [params.observations] - Observaciones de la muestra
   * @param {number} [params.height] - Alto (dimensiones)
   * @param {number} [params.width] - Ancho (dimensiones)
   * @param {number} [params.thickness] - Espesor (dimensiones)
   */
  constructor({
    correlative,
    countersample,
    accepted,
    internal_conditioning,
    observations,
    height,
    width,
    thickness
  }) {
    this.correlative = correlative;
    this.countersample = countersample || false;
    this.accepted = accepted || false;
    this.internal_conditioning = internal_conditioning || false;
    this.observations = observations;
    this.height = height;
    this.width = width;
    this.thickness = thickness;
  }

  /**
   * Valida que los campos requeridos estén presentes.
   * @throws {Error} Si faltan campos requeridos
   */
  validate() {
    if (this.correlative === undefined || this.correlative === null) {
      throw new Error('El correlativo es requerido');
    }
    if (typeof this.correlative !== 'number' && isNaN(parseInt(this.correlative))) {
      throw new Error('El correlativo debe ser un número');
    }
  }

  /**
   * Convierte el DTO a un objeto plano.
   * @returns {Object} Objeto plano con los datos del DTO
   */
  toPlainObject() {
    return {
      correlative: this.correlative,
      countersample: this.countersample,
      accepted: this.accepted,
      internal_conditioning: this.internal_conditioning,
      observations: this.observations,
      height: this.height,
      width: this.width,
      thickness: this.thickness
    };
  }
}

module.exports = LoadSampleDTO;

