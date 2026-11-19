/**
 * Entidad de dominio que representa una muestra.
 * Contiene la lógica de negocio relacionada con muestras de ensayos.
 */
const SampleStatus = require('../value-objects/SampleStatus');

class Sample {
  /**
   * Constructor de la entidad Sample.
   * @param {Object} params - Parámetros de la muestra
   * @param {string} params.id - Identificador único de la muestra
   * @param {string} params.essayId - ID del ensayo asociado
   * @param {string} params.status - Estado de la muestra
   * @param {string} [params.code] - Código formateado de la muestra
   * @param {string} params.dateCode - Código de fecha (incluye la letra de la OT cuando aplica)
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
    workOrderId,
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
    this.essayId = essayId;
    this.workOrderId = workOrderId;
    this.status = status || new SampleStatus(SampleStatus.PENDING);
    this.code = code;
    this.dateCode = dateCode;
    this.correlative = correlative;
    this.countersample = countersample || false;
    this.receivedAt = receivedAt || new Date();
    this.accepted = accepted || false;
    this.internalConditioning = internalConditioning || false;
    this.observations = observations;
    this.result = result;
    this.height = height;
    this.width = width;
    this.thickness = thickness;
  }

  /**
   * Valida que la muestra tenga un código de fecha válido.
   * @throws {Error} Si el código de fecha no es válido
   */
  validateDateCode() {
    if (!this.dateCode || this.dateCode.length < 6) {
      throw new Error('El código de fecha es inválido');
    }
  }

  /**
   * Marca la muestra como aceptada.
   */
  accept() {
    this.accepted = true;
  }

  /**
   * Marca la muestra como rechazada.
   */
  reject() {
    this.accepted = false;
    this.status = new SampleStatus(SampleStatus.REJECTED);
  }

  /**
   * Actualiza el resultado del análisis.
   * @param {number} result - Resultado del análisis
   */
  setResult(result) {
    this.result = result;
    if (result != null) {
      this.status = new SampleStatus(SampleStatus.ANALYZED);
    }
  }
}

module.exports = Sample;

