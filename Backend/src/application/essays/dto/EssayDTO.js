/**
 * DTO (Data Transfer Object) para transferir datos de ensayos.
 * Representa la estructura de datos que se envía al cliente.
 */
class EssayDTO {
  /**
   * Constructor del DTO de ensayo.
   * @param {Object} params - Datos del ensayo
   * @param {string} params.id - ID del ensayo
   * @param {string} params.code - Código del ensayo
   * @param {Date} params.requestDate - Fecha de solicitud
   * @param {Date} [params.finishDate] - Fecha de cierre del ensayo (al emitir informe)
   * @param {string} params.status - Estado del ensayo
   * @param {string} params.subStatus - Estado secundario (obsoleto; se mantiene por compatibilidad, puede ser null)
   * @param {string} params.observations - Observaciones
   * @param {Object} params.client - Datos del cliente
   * @param {Object} params.contact - Datos del contacto
   * @param {Object} params.type - Tipo de ensayo
   * @param {Object} params.elements - Elementos del ensayo
   * @param {Object} params.billing - Información de facturación
   * @param {Object} params.terms - Términos y condiciones
   * @param {Array} params.documents - Documentos asociados
   * @param {number} params.result - Resultado del ensayo (promedio de muestras)
   * @param {string} params.classification - Clasificación del ensayo (E1, E2 o null)
   * @param {Array} params.samples - Muestras asociadas al ensayo
   * @param {Array} params.auditLogs - Registros de auditoría del ensayo
   * @param {Object} [params.workOrder] - Orden de trabajo asociada (datos públicos o completos según perfil)
   * @param {string} [params.last_update] - Fecha de última actualización del ensayo (al registrar auditoría)
   * @param {string} [params.last_report_generated] - Fecha del último informe emitido
   */
  constructor({
    id,
    code,
    requestDate,
    finishDate,
    status,
    subStatus,
    observations,
    client,
    contact,
    type,
    elements,
    billing,
    terms,
    documents,
    result,
    classification,
    samples,
    auditLogs,
    workOrder,
    last_update,
    last_report_generated,
    lastReportSnapshot,
    clientNotificationsEnabled = true,
    notificationToken = null
  }) {
    this.id = id;
    this.code = code;
    this.requestDate = requestDate;
    this.finishDate = finishDate ?? null;
    this.status = status;
    this.subStatus = subStatus;
    this.observations = observations;
    this.last_update = last_update ?? null;
    this.last_report_generated = last_report_generated ?? null;
    this.client = client;
    this.contact = contact;
    this.type = type;
    this.elements = elements;
    this.billing = billing;
    this.terms = terms;
    this.documents = documents;
    this.result = result;
    this.classification = classification;
    this.samples = samples || [];
    this.auditLogs = auditLogs || [];
    this.workOrder = workOrder ?? null;
    this.lastReportSnapshot = lastReportSnapshot ?? null;
    this.client_notifications_enabled = clientNotificationsEnabled !== false;
    this.clientNotificationsEnabled = clientNotificationsEnabled !== false;
    this.notificationToken = notificationToken ?? null;
  }
}

module.exports = EssayDTO;

