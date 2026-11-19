/**
 * DTO para recepcionar muestras (unificado con emitir orden de trabajo).
 * - Valida enteros finitos y acota `samples_count` / `countersamples_count` a `<= 100` para prevenir DoS.
 */
const MAX_SAMPLES_PER_RECEPTION = 100;

class ReceiveSamplesDTO {
  constructor({
    essayId,
    accepted,
    dimensions,
    internal_conditioning,
    observations,
    samples_count,
    countersamples_count
  } = {}) {
    this.essayId = essayId;
    this.accepted = accepted === true;
    this.dimensions = dimensions || {};
    this.internal_conditioning = internal_conditioning === true;
    this.observations = typeof observations === 'string' ? observations.slice(0, 2000) : (observations ?? null);
    this.rawSamplesCount = samples_count;
    this.rawCountersamplesCount = countersamples_count;
    this.samples_count = samples_count != null ? Number(samples_count) : 0;
    this.countersamples_count = countersamples_count != null ? Number(countersamples_count) : 0;
  }

  validate() {
    if (!this.essayId || typeof this.essayId !== 'string' || this.essayId.trim() === '') {
      throw new Error('essayId es requerido');
    }
    if (this.accepted) {
      if (!Number.isInteger(this.samples_count) || !Number.isInteger(this.countersamples_count)) {
        throw new Error('samples_count y countersamples_count deben ser números enteros válidos');
      }
      if (this.samples_count < 0 || this.countersamples_count < 0) {
        throw new Error('samples_count y countersamples_count deben ser mayor o igual a 0');
      }
      if (
        this.samples_count > MAX_SAMPLES_PER_RECEPTION ||
        this.countersamples_count > MAX_SAMPLES_PER_RECEPTION
      ) {
        throw new Error(
          `samples_count y countersamples_count no pueden superar ${MAX_SAMPLES_PER_RECEPTION} unidades por recepción`
        );
      }
      if (this.samples_count === 0 && this.countersamples_count === 0) {
        throw new Error(
          'Debe indicar al menos una muestra o una contramuestra (samples_count o countersamples_count > 0)'
        );
      }
    }
  }

  toPlainObject() {
    return {
      essayId: this.essayId,
      accepted: this.accepted,
      dimensions: this.dimensions,
      internal_conditioning: this.internal_conditioning,
      observations: this.observations,
      samples_count: Number.isInteger(this.samples_count) ? this.samples_count : 0,
      countersamples_count: Number.isInteger(this.countersamples_count) ? this.countersamples_count : 0
    };
  }
}

module.exports = ReceiveSamplesDTO;
