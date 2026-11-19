/**
 * DTOs de muestras y términos. Alineados con gestion.ctmueble.com.ar/src/application/essays/dto.
 *
 * GET: SampleDTO — respuesta al obtener muestra(s) (ej. dentro de EssayDTO.samples).
 * POST: LoadSampleDTO, LoadSamplesDTO, LoadSampleResultsDTO — body para cargar muestras o resultados.
 * PUT: UpdateSampleDTO, SetTermsDTO — body para actualizar muestra o términos del ensayo.
 */

/**
 * DTO para transferir datos de muestras (GET – respuesta).
 * La API puede devolver snake_case (date_code, received_at, internal_conditioning).
 * @typedef {Object} SampleDTO
 * @property {string} id
 * @property {string} essay - ID del ensayo (backend puede enviar essayId)
 * @property {string} status
 * @property {string} code
 * @property {string} [date_code]
 * @property {number} correlative
 * @property {boolean} countersample
 * @property {string|Date} [received_at]
 * @property {boolean} accepted
 * @property {boolean} [internal_conditioning]
 * @property {string} [observations]
 * @property {number|null} [result]
 */

/**
 * Normaliza respuesta GET de muestra (o ítem de EssayDTO.samples).
 * @param {SampleDTO} data
 * @returns {SampleDTO}
 */
export function createSampleDTO(data) {
  return {
    id: data.id,
    essay: data.essay ?? data.essayId,
    status: data.status,
    code: data.code,
    date_code: data.date_code ?? data.dateCode,
    correlative: data.correlative,
    countersample: data.countersample,
    received_at: data.received_at ?? data.receivedAt,
    accepted: data.accepted,
    internal_conditioning: data.internal_conditioning ?? data.internalConditioning,
    observations: data.observations,
    result: data.result,
  };
}

/**
 * DTO para cargar una muestra (POST – body).
 * @typedef {Object} LoadSampleDTO
 * @property {number} correlative
 * @property {boolean} [countersample]
 * @property {boolean} [accepted]
 * @property {boolean} [internal_conditioning]
 * @property {string} [observations]
 */

export function createLoadSampleDTO(data) {
  return {
    correlative: data.correlative,
    countersample: data.countersample ?? false,
    accepted: data.accepted ?? false,
    internal_conditioning: data.internal_conditioning ?? false,
    observations: data.observations,
  };
}

/**
 * Valida LoadSampleDTO antes de POST.
 * @param {LoadSampleDTO} dto
 * @throws {Error}
 */
export function validateLoadSampleDTO(dto) {
  if (dto.correlative === undefined || dto.correlative === null)
    throw new Error("El correlativo es requerido");
  if (typeof dto.correlative !== "number" && isNaN(Number(dto.correlative)))
    throw new Error("El correlativo debe ser un número");
}

/**
 * Convierte LoadSampleDTO a objeto para enviar en POST.
 * @param {LoadSampleDTO} dto
 * @returns {Object}
 */
export function toPlainLoadSampleDTO(dto) {
  return {
    correlative: dto.correlative,
    countersample: dto.countersample,
    accepted: dto.accepted,
    internal_conditioning: dto.internal_conditioning,
    observations: dto.observations,
  };
}

/**
 * DTO para cargar resultados de muestras (POST – body: array o objeto único).
 * @typedef {Array<{id: string, result: number|null}>} LoadSampleResultsDTO
 */

/**
 * Normaliza body POST de resultados (array, objeto único o { samples }).
 * @param {LoadSampleResultsDTO|{id: string, result: number|null}|{samples: Array<{id: string, result: number|null}>}} params
 * @returns {{ samples: Array<{id: string, result: number|null}> }}
 */
export function normalizeLoadSampleResultsDTO(params) {
  if (Array.isArray(params)) return { samples: params };
  if (params && typeof params === "object" && params.id !== undefined)
    return { samples: [{ id: params.id, result: params.result ?? null }] };
  if (params?.samples && Array.isArray(params.samples)) return { samples: params.samples };
  if (params && params.result !== undefined)
    return { samples: [{ id: params.id, result: params.result }] };
  return { samples: [] };
}

/**
 * Valida LoadSampleResultsDTO antes de POST.
 * @param {{ samples: Array<{id: string, result: number|null}> }} dto
 * @throws {Error}
 */
export function validateLoadSampleResultsDTO(dto) {
  if (!Array.isArray(dto.samples) || dto.samples.length === 0)
    throw new Error("Debe proporcionar al menos una muestra con su resultado");
  dto.samples.forEach((s, i) => {
    if (!s?.id || typeof s.id !== "string" || !s.id.trim())
      throw new Error(`Falta el ID de la muestra en el elemento ${i + 1}`);
    if (
      s.result != null &&
      s.result !== "" &&
      isNaN(s.result) &&
      isNaN(parseFloat(s.result))
    )
      throw new Error(`El resultado de la muestra ${i + 1} debe ser un número válido o null`);
  });
}

/**
 * DTO para cargar muestras en un ensayo (POST – body: dimensiones + array de muestras).
 * @typedef {Object} LoadSamplesDTO
 * @property {Object} [dimensions] - { width?, large?, height? }
 * @property {Array<LoadSampleDTO>} samples
 */

export function createLoadSamplesDTO(data) {
  return {
    dimensions: data.dimensions ?? {},
    samples: data.samples ?? [],
  };
}

/**
 * Valida LoadSamplesDTO antes de POST.
 * @param {LoadSamplesDTO} dto
 * @throws {Error}
 */
export function validateLoadSamplesDTO(dto) {
  if (!Array.isArray(dto.samples)) throw new Error("El campo samples debe ser un array");
  if (dto.samples.length === 0) throw new Error("Debe proporcionar al menos una muestra");
  dto.samples.forEach((s, i) => {
    try {
      validateLoadSampleDTO(createLoadSampleDTO(s));
    } catch (e) {
      throw new Error(`Error en muestra ${i + 1}: ${e.message}`);
    }
  });
  const dim = dto.dimensions;
  if (dim && Object.keys(dim).length > 0) {
    if (dim.width !== undefined && (typeof dim.width !== "number" || dim.width <= 0))
      throw new Error("El ancho debe ser un número positivo");
    if (dim.large !== undefined && (typeof dim.large !== "number" || dim.large <= 0))
      throw new Error("El largo debe ser un número positivo");
    if (dim.height !== undefined && (typeof dim.height !== "number" || dim.height <= 0))
      throw new Error("El alto debe ser un número positivo");
  }
}

/**
 * DTO para establecer términos de un ensayo (PUT – body).
 * @typedef {Object} SetTermsDTO
 * @property {number} days_to_do
 * @property {number} price
 * @property {number} samples_conservation_days
 */

export function createSetTermsDTO(data) {
  return {
    days_to_do: data.days_to_do,
    price: data.price,
    samples_conservation_days: data.samples_conservation_days,
  };
}

/**
 * Valida SetTermsDTO antes de PUT.
 * @param {SetTermsDTO} dto
 * @throws {Error}
 */
export function validateSetTermsDTO(dto) {
  if (dto.days_to_do == null || typeof dto.days_to_do !== "number" || dto.days_to_do <= 0)
    throw new Error("Los días para realizar el ensayo deben ser un número positivo");
  if (dto.price == null || typeof dto.price !== "number" || dto.price < 0)
    throw new Error("El precio debe ser un número mayor o igual a cero");
  if (
    dto.samples_conservation_days == null ||
    typeof dto.samples_conservation_days !== "number" ||
    dto.samples_conservation_days <= 0
  )
    throw new Error("Los días de conservación de muestras deben ser un número positivo"  );
}

/**
 * Convierte SetTermsDTO a objeto para enviar en PUT.
 * @param {SetTermsDTO} dto
 * @returns {Object}
 */
export function toPlainSetTermsDTO(dto) {
  return {
    days_to_do: dto.days_to_do,
    price: dto.price,
    samples_conservation_days: dto.samples_conservation_days,
  };
}

/**
 * DTO para actualizar una muestra (PUT – body).
 * @typedef {Object} UpdateSampleDTO
 * @property {number|null} [result]
 * @property {boolean} [accepted]
 * @property {boolean} [internal_conditioning]
 * @property {string} [observations]
 */

export function createUpdateSampleDTO(data) {
  return {
    result: data.result,
    accepted: data.accepted,
    internal_conditioning: data.internal_conditioning,
    observations: data.observations,
  };
}

/**
 * Valida UpdateSampleDTO antes de PUT.
 * @param {UpdateSampleDTO} dto
 * @throws {Error}
 */
export function validateUpdateSampleDTO(dto) {
  if (dto.result != null && dto.result !== "" && isNaN(dto.result) && isNaN(parseFloat(dto.result)))
    throw new Error("El resultado debe ser un número válido");
}

/**
 * Convierte UpdateSampleDTO a objeto para enviar en PUT.
 * @param {UpdateSampleDTO} dto
 * @returns {Object}
 */
export function toPlainUpdateSampleDTO(dto) {
  return {
    result: dto.result,
    accepted: dto.accepted,
    internal_conditioning: dto.internal_conditioning,
    observations: dto.observations,
  };
}
