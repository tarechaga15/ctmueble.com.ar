/**
 * DTO para cargar muestras en un ensayo con cota máxima anti-DoS (`<= 100`).
 */
const LoadSampleDTO = require('./LoadSampleDTO');

const MAX_SAMPLES_BATCH = 100;

class LoadSamplesDTO {
  constructor({ dimensions, samples } = {}) {
    this.dimensions = dimensions || {};
    this.samples = samples || [];
  }

  validate() {
    if (!Array.isArray(this.samples)) {
      throw new Error('El campo samples debe ser un array');
    }
    if (this.samples.length === 0) {
      throw new Error('Debe proporcionar al menos una muestra');
    }
    if (this.samples.length > MAX_SAMPLES_BATCH) {
      throw new Error(`No se pueden cargar más de ${MAX_SAMPLES_BATCH} muestras por operación`);
    }

    this.samples.forEach((sampleData, index) => {
      try {
        const sampleDTO = new LoadSampleDTO(sampleData);
        sampleDTO.validate();
      } catch (error) {
        throw new Error(`Error en muestra ${index + 1}: ${error.message}`);
      }
    });

    if (this.dimensions && Object.keys(this.dimensions).length > 0) {
      if (
        this.dimensions.width !== undefined &&
        (typeof this.dimensions.width !== 'number' || !Number.isFinite(this.dimensions.width) || this.dimensions.width <= 0)
      ) {
        throw new Error('El ancho debe ser un número positivo');
      }
      if (
        this.dimensions.large !== undefined &&
        (typeof this.dimensions.large !== 'number' || !Number.isFinite(this.dimensions.large) || this.dimensions.large <= 0)
      ) {
        throw new Error('El largo debe ser un número positivo');
      }
      if (
        this.dimensions.height !== undefined &&
        (typeof this.dimensions.height !== 'number' || !Number.isFinite(this.dimensions.height) || this.dimensions.height <= 0)
      ) {
        throw new Error('El alto debe ser un número positivo');
      }
    }
  }

  toPlainObject() {
    return {
      dimensions: this.dimensions,
      samples: this.samples.map((sampleData) => {
        const sampleDTO = new LoadSampleDTO(sampleData);
        return sampleDTO.toPlainObject();
      })
    };
  }

  getSamplesArray() {
    return this.samples.map((sampleData) => {
      const sampleDTO = new LoadSampleDTO(sampleData);
      return sampleDTO.toPlainObject();
    });
  }

  getDimensions() {
    return this.dimensions;
  }
}

module.exports = LoadSamplesDTO;
