/**
 * DTO para cargar resultados de muestras.
 * - Verifica finitud (`Number.isFinite`, rechazando `Infinity`/`NaN`) y acota el lote a `<= 200` muestras.
 */
const MAX_SAMPLE_RESULTS_BATCH = 200;

class LoadSampleResultsDTO {
  constructor(params) {
    this.workOrderId = null;

    if (params && typeof params === 'object') {
      this.workOrderId = params.workOrderId || params.work_order_id || null;
    }

    if (Array.isArray(params)) {
      this.samples = params;
      this.isArray = true;
    } else if (params && params.samples && Array.isArray(params.samples)) {
      this.samples = params.samples;
      this.isArray = true;
    } else if (params && typeof params === 'object' && params.id !== undefined) {
      this.samples = [params];
      this.isArray = false;
    } else if (params && params.result !== undefined) {
      this.samples = [{ id: params.id, result: params.result }];
      this.isArray = false;
    } else {
      this.samples = [];
      this.isArray = true;
    }
  }

  validate() {
    if (!this.workOrderId || typeof this.workOrderId !== 'string' || this.workOrderId.trim() === '') {
      throw new Error('Debe proporcionar el ID de la orden de trabajo (workOrderId)');
    }

    if (!Array.isArray(this.samples) || this.samples.length === 0) {
      throw new Error('Debe proporcionar al menos una muestra con su resultado');
    }

    if (this.samples.length > MAX_SAMPLE_RESULTS_BATCH) {
      throw new Error(`No se pueden actualizar más de ${MAX_SAMPLE_RESULTS_BATCH} resultados por solicitud`);
    }

    this.samples.forEach((sampleData, index) => {
      if (!sampleData || !sampleData.id) {
        throw new Error(`Falta el ID de la muestra en el elemento ${index + 1}`);
      }

      if (typeof sampleData.id !== 'string' || sampleData.id.trim() === '') {
        throw new Error(`El ID de la muestra en el elemento ${index + 1} debe ser una cadena válida`);
      }

      if (sampleData.result !== null && sampleData.result !== undefined && sampleData.result !== '') {
        const parsed =
          typeof sampleData.result === 'number'
            ? sampleData.result
            : typeof sampleData.result === 'string' && sampleData.result.trim() !== ''
            ? Number(sampleData.result)
            : NaN;

        if (!Number.isFinite(parsed)) {
          throw new Error(`El resultado de la muestra ${index + 1} debe ser un número válido o null`);
        }
      }
    });
  }

  toPlainObject() {
    return this.samples.map((sample) => ({
      id: sample.id,
      result:
        sample.result !== null && sample.result !== undefined && sample.result !== ''
          ? Number(sample.result)
          : null
    }));
  }

  getSamplesArray() {
    return this.toPlainObject();
  }

  getWorkOrderId() {
    return this.workOrderId;
  }

  getSingleResult() {
    if (this.samples.length !== 1) {
      throw new Error('Este método solo puede usarse cuando hay una sola muestra');
    }
    const result = this.samples[0].result;
    return result !== null && result !== undefined && result !== '' ? Number(result) : null;
  }
}

module.exports = LoadSampleResultsDTO;
