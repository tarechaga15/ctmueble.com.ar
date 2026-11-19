/**
 * Entidad de dominio que representa una orden de trabajo.
 * Vinculada a un ensayo; tiene estado propio (work order status).
 */
class WorkOrder {
  /**
   * @param {Object} params
   * @param {string} params.id - ID de la orden
   * @param {string} params.essayId - ID del ensayo
   * @param {string} params.code - Código de la orden (yymmdd + letra)
   * @param {string} [params.essayTrackCode] - Código del ensayo asociado
   * @param {string} [params.reportDeliveryDeadline] - Fecha límite de entrega del informe (ISO date)
   * @param {Date} [params.samplesReceivedAt] - Fecha de recepción de muestras
   * @param {string} [params.sampleDimensions] - Dimensiones de muestras (texto)
   * @param {number} [params.sampleWidth] - Ancho muestra (mm)
   * @param {number} [params.sampleHeight] - Alto muestra (mm)
   * @param {number} [params.sampleThickness] - Espesor muestra (mm)
   * @param {Date} [params.generatedAt] - Fecha de generación
   * @param {string} [params.observations] - Observaciones
   * @param {boolean} [params.internalAconditioning] - Acondicionamiento interno
   * @param {string} [params.uncertainty] - Incertidumbre
   * @param {number} [params.averageValue] - Valor promedio
   * @param {string} [params.status] - Estado: WAITING_SAMPLES | ANALYZING | COMPLETED | CANCELLED
   * @param {Date} [params.closedAt] - Fecha de cierre (al emitir informe)
   * @param {Date} [params.lastUpdate] - Fecha de última actualización (se actualiza al registrar auditoría)
   * @param {Array<import('./Sample')|Object>} [params.samples] - Muestras de la orden (entidades Sample o objetos con al menos result)
   */
  constructor({
    id,
    essayId,
    code,
    essayTrackCode,
    reportDeliveryDeadline,
    samplesReceivedAt,
    sampleDimensions,
    sampleWidth,
    sampleHeight,
    sampleThickness,
    generatedAt,
    observations,
    internalAconditioning,
    uncertainty,
    averageValue,
    status,
    closedAt,
    lastUpdate,
    samples
  }) {
    this.id = id;
    this.essayId = essayId;
    this.code = code;
    this.essayTrackCode = essayTrackCode ?? null;
    this.reportDeliveryDeadline = reportDeliveryDeadline ?? null;
    this.samplesReceivedAt = samplesReceivedAt ?? null;
    this.sampleDimensions = sampleDimensions ?? null;
    this.sampleWidth = sampleWidth != null ? parseFloat(sampleWidth) : null;
    this.sampleHeight = sampleHeight != null ? parseFloat(sampleHeight) : null;
    this.sampleThickness = sampleThickness != null ? parseFloat(sampleThickness) : null;
    this.generatedAt = generatedAt ?? new Date();
    this.observations = observations ?? null;
    this.internalAconditioning = internalAconditioning === true;
    this.uncertainty = uncertainty ?? null;
    this.averageValue = averageValue != null ? parseFloat(averageValue) : null;
    this.status = status ?? 'WAITING_SAMPLES';
    this.closedAt = closedAt ?? null;
    this.lastUpdate = lastUpdate ?? null;
    this.samples = Array.isArray(samples) ? samples : [];
  }

  /**
   * Devuelve las muestras que tienen resultado cargado (válido para informe).
   * @returns {Array}
   */
  getSamplesWithResult() {
    return this.samples.filter(s => {
      const r = s.result != null && s.result !== '';
      if (r && typeof s.result === 'string' && isNaN(parseFloat(s.result))) return false;
      return r;
    });
  }

  /**
   * Valida que la orden tenga las muestras cargadas correctamente para emitir informe:
   * al menos dos muestras con resultado cargado.
   * @throws {Error} Si hay menos de 2 muestras con resultado
   */
  validateSamplesForReport() {
    const MIN_SAMPLES_WITH_RESULT = 2;
    const count = this.getSamplesWithResult().length;
    if (count < MIN_SAMPLES_WITH_RESULT) {
      throw new Error(
        `Para emitir el informe se requieren al menos ${MIN_SAMPLES_WITH_RESULT} muestras con resultado cargado. ` +
        `Esta orden tiene ${count}.`
      );
    }
  }

  isWaitingSamples() {
    return this.status === 'WAITING_SAMPLES';
  }

  isAnalyzing() {
    return this.status === 'ANALYZING';
  }

  isCompleted() {
    return this.status === 'COMPLETED';
  }

  isCancelled() {
    return this.status === 'CANCELLED';
  }

  canReceiveSamples() {
    return this.isWaitingSamples();
  }

  startAnalyzing() {
    if (!this.canReceiveSamples()) {
      throw new Error('Solo se puede iniciar análisis cuando la orden está en WAITING_SAMPLES');
    }
    this.status = 'ANALYZING';
  }

  complete() {
    this.status = 'COMPLETED';
  }

  cancel() {
    this.status = 'CANCELLED';
  }
  hasModifiedAfterFinish() {
    const finishDate = this.closedAt ? new Date(this.closedAt) : null;
    const lastUpdate = this.lastUpdate ? new Date(this.lastUpdate) : null;
    return !!(finishDate && lastUpdate && lastUpdate > finishDate);
  }

  /**
   * Devuelve un objeto plano para plantillas (snake_case), incluyendo muestras.
   * Usado por Essay.toPlain() al generar el documento de informe.
   * @returns {Object}
   */
  toPlain() {
    const sampleToPlain = (s) => {
      if (s == null) return null;
      if (typeof s.toPlain === 'function') return s.toPlain();
      if (typeof s.toJSON === 'function') return s.toJSON();
      return {
        id: s.id,
        code: s.code,
        result: s.result,
        countersample: s.countersample,
        received_at: s.received_at ?? s.receivedAt,
        width: s.width,
        height: s.height,
        thickness: s.thickness
      };
    };
    return {
      id: this.id,
      essay_id: this.essayId,
      code: this.code,
      essay_track_code: this.essayTrackCode,
      report_delivery_deadline: this.reportDeliveryDeadline,
      samples_received_at: this.samplesReceivedAt,
      sample_dimensions: this.sampleDimensions,
      sample_width: this.sampleWidth,
      sample_height: this.sampleHeight,
      sample_thickness: this.sampleThickness,
      generated_at: this.generatedAt,
      observations: this.observations,
      internal_aconditioning: this.internalAconditioning,
      uncertainty: this.uncertainty,
      average_value: this.averageValue,
      status: this.status,
      closed_at: this.closedAt,
      last_update: this.lastUpdate,
      samples: this.samples.map(sampleToPlain)
    };
  }
}

module.exports = WorkOrder;
