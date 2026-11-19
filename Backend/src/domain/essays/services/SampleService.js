/**
 * Servicio de dominio para generar códigos únicos de muestras.
 * Genera códigos con formato "añomesdia" + número correlativo.
 * Para contramuestras agrega el sufijo "C".
 */
class SampleService {
  /**
   * Genera el código base de fecha en formato "añomesdia".
   * @param {Date} date - Fecha para generar el código (opcional, usa fecha actual si no se proporciona)
   * @returns {string} Código de fecha en formato YYMMDD
   */
  generateDateCode(date = new Date()) {
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Genera un código completo de muestra.
   * Usa dateCode en formato YYMMDD o YYMMDDL (incluyendo la letra de la OT como sufijo).
   * @param {string} dateCode - Código de fecha base (YYMMDD o YYMMDDL)
   * @param {number} correlative - Número correlativo
   * @param {boolean} isCountersample - Indica si es contramuestra
   * @returns {string|null} Código completo de la muestra (ej. "26-0311A-01", "26-0311A-01C")
   */
  generateSampleCode(dateCode, correlative, isCountersample = false) {
    const raw = String(dateCode || '');
    const base = raw.substring(0, 6);
    if (!base || base.length < 6) return null;
    const correlativeStr = String(correlative).padStart(2, '0');
    const suffix = isCountersample ? 'C' : '';
    // base siempre es YYMMDD -> "YY-MMDD"
    const formattedDateCode = `${base.slice(0, 2)}-${base.slice(2, 6)}`;
    const letter = raw.length > 6 ? raw.charAt(6) : null;
    if (letter && /^[A-Z]$/.test(letter)) {
      // Formato con letra: "26-0311A-01" o "26-0311A-01C"
      return `${formattedDateCode}${letter}-${correlativeStr}${suffix}`;
    }
    // Sin letra: "26-0311-01" o "26-0311-01C"
    return `${formattedDateCode}-${correlativeStr}${suffix}`;
  }

  /**
   * Obtiene el siguiente número correlativo para un ensayo en una fecha específica.
   * @param {ISampleRepository} sampleRepository - Repositorio de muestras
   * @param {string} essayId - ID del ensayo
   * @param {string} dateCode - Código de fecha
   * @param {boolean} isCountersample - Indica si es contramuestra
   * @returns {Promise<number>} Siguiente número correlativo
   */
  async getNextCorrelative(sampleRepository, essayId, dateCode, isCountersample = false, transaction = null) {
    const existingSamples = await sampleRepository.findByEssayAndDateCode(essayId, dateCode, isCountersample, transaction);
    
    if (existingSamples.length === 0) {
      return 1;
    }

    const maxCorrelative = Math.max(...existingSamples.map(s => s.correlative));
    return maxCorrelative + 1;
  }

  /**
   * Valida que los números correlativos sean consecutivos y estén disponibles.
   * @param {ISampleRepository} sampleRepository - Repositorio de muestras
   * @param {string} essayId - ID del ensayo
   * @param {string} dateCode - Código de fecha
   * @param {Array<Object>} samplesData - Array de datos de muestras con correlativos
   * @returns {Promise<{valid: boolean, error?: string}>} Resultado de la validación
   */
  async validateCorrelatives(sampleRepository, essayId, dateCode, samplesData) {
    // Separar muestras y contramuestras
    const samples = samplesData.filter(s => !s.countersample);
    const countersamples = samplesData.filter(s => s.countersample);

    // Validar muestras
    if (samples.length > 0) {
      const validation = await this.validateCorrelativesForType(
        sampleRepository,
        essayId,
        dateCode,
        samples,
        false,
      );
      if (!validation.valid) {
        return validation;
      }
    }

    // Validar contramuestras
    if (countersamples.length > 0) {
      const validation = await this.validateCorrelativesForType(
        sampleRepository,
        essayId,
        dateCode,
        countersamples,
        true,
      );
      if (!validation.valid) {
        return validation;
      }
    }

    return { valid: true };
  }

  /**
   * Valida correlativos para un tipo específico (muestras o contramuestras).
   * @param {ISampleRepository} sampleRepository - Repositorio de muestras
   * @param {string} essayId - ID del ensayo
   * @param {string} dateCode - Código de fecha
   * @param {Array<Object>} samplesData - Array de datos de muestras
   * @param {boolean} isCountersample - Indica si son contramuestras
   * @returns {Promise<{valid: boolean, error?: string}>} Resultado de la validación
   */
  async validateCorrelativesForType(sampleRepository, essayId, dateCode, samplesData, isCountersample) {
    // Obtener muestras existentes
    const existingSamples = await sampleRepository.findByEssayAndDateCode(essayId, dateCode, isCountersample);
    const existingCorrelatives = new Set(existingSamples.map(s => s.correlative));

    // Extraer correlativos de las muestras a crear
    const correlatives = samplesData
      .map(s => s.correlative)
      .filter(c => c != null)
      .map(c => parseInt(c));

    if (correlatives.length === 0) {
      return { valid: false, error: `Debe proporcionar números correlativos para ${isCountersample ? 'contramuestras' : 'muestras'}` };
    }

    // Validar que no haya duplicados en la solicitud
    const uniqueCorrelatives = new Set(correlatives);
    if (uniqueCorrelatives.size !== correlatives.length) {
      return { valid: false, error: `Hay números correlativos duplicados en ${isCountersample ? 'contramuestras' : 'muestras'}` };
    }

    // Validar que no estén ocupados
    for (const correlative of correlatives) {
      if (existingCorrelatives.has(correlative)) {
        return { 
          valid: false, 
          error: `El número correlativo ${correlative} ya está en uso para ${isCountersample ? 'contramuestras' : 'muestras'}` 
        };
      }
    }

    // Validar que sean consecutivos
    correlatives.sort((a, b) => a - b);
    const min = correlatives[0];
    const max = correlatives[correlatives.length - 1];
    
    // Deben ser consecutivos desde el mínimo
    for (let i = 0; i < correlatives.length; i++) {
      if (correlatives[i] !== min + i) {
        return { 
          valid: false, 
          error: `Los números correlativos de ${isCountersample ? 'contramuestras' : 'muestras'} deben ser consecutivos comenzando desde ${min}` 
        };
      }
    }

    return { valid: true };
  }
}

module.exports = SampleService;

