/**
 * DTOs de ensayos. Alineados con gestion.ctmueble.com.ar/src/application/essays/dto.
 *
 * GET: EssayDTO — respuesta al obtener ensayo(s).
 * POST: CreateEssayDTO — body para crear ensayo.
 * PUT: UpdateEssayDTO — body para actualizar ensayo.
 */

/**
 * DTO para transferir datos de ensayos (GET – respuesta).
 * @typedef {Object} EssayDTO
 * @property {string} id
 * @property {string} code
 * @property {string|Date} requestDate
 * @property {string} status
 * @property {string} subStatus
 * @property {string} [observations]
 * @property {Object} client
 * @property {Object} contact
 * @property {Object} type
 * @property {Object} elements
 * @property {Object} [billing]
 * @property {Object} [terms]
 * @property {Array<Object>} [documents]
 * @property {number} [result]
 * @property {string|null} [classification] - E1, E2 o null
 * @property {Object} [workOrder] - Datos de la orden de trabajo (average_value, uncertainty, samples_received_at, closed_at, sample_dimensions, ...)
 * @property {string|Date} [finishDate] - Fecha de cierre del ensayo
 * @property {string|Date} [last_update] - Fecha de última actualización del ensayo (auditoría)
 * @property {string|Date} [last_report_generated] - Fecha del último informe emitido
 * @property {Array<Object>} [samples] - Muestras (ver SampleDTO en dtos/samples.js)
 * @property {Array<Object>} [auditLogs]
 */

/**
 * Normaliza respuesta GET de ensayo.
 * @param {EssayDTO} data
 * @returns {EssayDTO}
 */
export function createEssayDTO(data) {
  return {
    id: data.id,
    code: data.code,
    requestDate: data.requestDate,
    finishDate: data.finishDate ?? null,
    status: data.status,
    subStatus: data.subStatus,
    observations: data.observations,
    client: data.client,
    contact: data.contact,
    type: data.type,
    elements: data.elements,
    billing: data.billing,
    terms: data.terms,
    documents: data.documents,
    result: data.result,
    classification: data.classification,
    workOrder: data.workOrder ?? null,
    finishDate: data.finishDate ?? null,
    last_update: data.last_update ?? null,
    last_report_generated: data.last_report_generated ?? null,
    samples: data.samples ?? [],
    auditLogs: data.auditLogs ?? [],
    client_notifications_enabled: data.client_notifications_enabled ?? data.clientNotificationsEnabled ?? true,
    notificationToken: data.notificationToken ?? null,
  };
}

/**
 * DTO para crear un ensayo (POST – body).
 * @typedef {Object} CreateEssayDTO
 * @property {string} client - ID del cliente
 * @property {string} [contact] - ID del contacto
 * @property {string} essay - ID del tipo de ensayo
 * @property {string} [observations]
 * @property {Object} elements - { template|templateId|id (UUID plantilla), date (yyyy-MM-dd), batch_number? }
 * @property {Object} [billing] - { cuit?, address?, amount?, pays_iva? }
 */

/**
 * @param {CreateEssayDTO} data
 * @returns {CreateEssayDTO}
 */
export function createCreateEssayDTO(data) {
  return {
    client: data.client,
    contact: data.contact,
    essay: data.essay,
    observations: data.observations,
    elements: data.elements,
    billing: data.billing ?? {},
    client_notifications_enabled: data.client_notifications_enabled !== undefined ? Boolean(data.client_notifications_enabled) : true,
  };
}

/**
 * Valida CreateEssayDTO antes de POST.
 * @param {CreateEssayDTO} dto
 * @throws {Error}
 */
export function validateCreateEssayDTO(dto) {
  if (!dto.client) throw new Error("El cliente es requerido");
  if (!dto.essay) throw new Error("El tipo de ensayo es requerido");
  const templateId = dto.elements?.template ?? dto.elements?.templateId ?? dto.elements?.id;
  if (!templateId) throw new Error("La plantilla de elemento es requerida");
  if (!dto.elements?.date) throw new Error("La fecha de toma de muestra es requerida");
}

/**
 * Convierte CreateEssayDTO a objeto para enviar en POST.
 * @param {CreateEssayDTO} dto
 * @returns {Object}
 */
export function toPlainCreateEssayDTO(dto) {
  return {
    client: dto.client,
    contact: dto.contact,
    essay: dto.essay,
    observations: dto.observations,
    elements: dto.elements,
    billing: dto.billing,
    client_notifications_enabled: dto.client_notifications_enabled !== undefined ? Boolean(dto.client_notifications_enabled) : true,
  };
}

/**
 * DTO para actualizar un ensayo (PUT – body).
 * @typedef {Object} UpdateEssayDTO
 * @property {string} [observations]
 * @property {Object} [elements]
 * @property {Object} [billing]
 * @property {Object} [terms] - { days_to_do?, price?, samples_conservation_days? }
 */

/**
 * @param {UpdateEssayDTO} data
 * @returns {UpdateEssayDTO}
 */
export function createUpdateEssayDTO(data) {
  return {
    observations: data.observations,
    elements: data.elements,
    billing: data.billing,
    terms: data.terms,
  };
}

/**
 * Convierte UpdateEssayDTO a objeto para enviar en PUT.
 * @param {UpdateEssayDTO} dto
 * @returns {Object}
 */
export function toPlainUpdateEssayDTO(dto) {
  return {
    observations: dto.observations,
    elements: dto.elements,
    billing: dto.billing,
    terms: dto.terms,
  };
}
