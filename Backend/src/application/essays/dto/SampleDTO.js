/**
 * DTO (Data Transfer Object) para muestras.
 * Se utiliza para transferir datos de muestras entre capas de la aplicación.
 */
class SampleDTO {
  /**
   * Constructor del DTO de muestra.
   * @param {Object} params - Parámetros de la muestra
   * @param {string} params.id - ID de la muestra
   * @param {string} params.essayId - ID del ensayo
   * @param {string} params.status - Estado de la muestra
   * @param {string} params.code - Código de la muestra
   * @param {string} params.dateCode - Código de fecha
   * @param {number} params.correlative - Número correlativo
   * @param {boolean} params.countersample - Indica si es contramuestra
   * @param {Date} params.receivedAt - Fecha de recepción
   * @param {boolean} params.accepted - Indica si fue aceptada
   * @param {boolean} params.internalConditioning - Indica si tiene acondicionamiento interno
   * @param {string} params.observations - Observaciones
   * @param {number} params.result - Resultado del análisis
   */
  constructor({
    id,
    essayId,
    status,
    code,
    dateCode,
    correlative,
    countersample,
    receivedAt,
    accepted,
    internalConditioning,
    observations,
    result,
    height,
    width,
    thickness
  }) {
    this.id = id;
    this.essay = essayId;
    this.status = status;
    this.code = code;
    this.date_code = dateCode;
    this.correlative = correlative;
    this.countersample = countersample;
    this.received_at = receivedAt;
    this.accepted = accepted;
    this.internal_conditioning = internalConditioning;
    this.observations = observations;
    this.result = result;
    this.height = height;
    this.width = width;
    this.thickness = thickness;
  }
}

module.exports = SampleDTO;

