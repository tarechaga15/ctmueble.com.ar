/**
 * Value Object que representa los códigos de eventos de auditoría para ensayos.
 * Define los eventos que pueden ser registrados en el sistema de auditoría.
 */
class EssayAuditEvent {
  // Códigos de eventos
  static REQUEST_CREATED = 'REQUEST_CREATED';
  static REQUEST_APPROVED = 'REQUEST_APPROVED';
  static REQUEST_REJECTED = 'REQUEST_REJECTED';
  static CONTRACT_CREATED = 'CONTRACT_CREATED';
  static SAMPLES_RECEIVED = 'SAMPLES_RECEIVED';
  static ESSAY_CANCELLED = 'ESSAY_CANCELLED';
  static RESULTS_LOADED = 'RESULTS_LOADED';
  static REPORT_ISSUED = 'REPORT_ISSUED';
  static ESSAY_CLIENT_UPDATED = 'ESSAY_CLIENT_UPDATED';
  static NOTIFICATIONS_ENABLED = 'NOTIFICATIONS_ENABLED';
  static NOTIFICATIONS_DISABLED = 'NOTIFICATIONS_DISABLED';

  /**
   * Mapa de códigos de eventos a descripciones legibles.
   */
  static EVENT_DESCRIPTIONS = {
    [EssayAuditEvent.REQUEST_CREATED]: 'Solicitud de ensayo creada',
    [EssayAuditEvent.REQUEST_APPROVED]: 'Solicitud de ensayo aprobada',
    [EssayAuditEvent.REQUEST_REJECTED]: 'Solicitud de ensayo rechazada',
    [EssayAuditEvent.CONTRACT_CREATED]: 'Contrato creado',
    [EssayAuditEvent.SAMPLES_RECEIVED]: 'Muestras recibidas',
    [EssayAuditEvent.ESSAY_CANCELLED]: 'Ensayo cancelado (muestras no aceptadas)',
    [EssayAuditEvent.RESULTS_LOADED]: 'Resultados cargados',
    [EssayAuditEvent.REPORT_ISSUED]: 'Informe emitido',
    [EssayAuditEvent.ESSAY_CLIENT_UPDATED]: 'Datos del solicitante actualizados',
    [EssayAuditEvent.NOTIFICATIONS_ENABLED]: 'Notificaciones por correo activadas',
    [EssayAuditEvent.NOTIFICATIONS_DISABLED]: 'Notificaciones por correo desactivadas'
  };

  /**
   * Obtiene la descripción de un evento.
   * @param {string} eventCode - Código del evento
   * @returns {string} Descripción del evento
   */
  static getDescription(eventCode) {
    return this.EVENT_DESCRIPTIONS[eventCode] || 'Evento desconocido';
  }

  /**
   * Valida que un código de evento sea válido.
   * @param {string} eventCode - Código del evento a validar
   * @returns {boolean} True si el código es válido
   */
  static isValid(eventCode) {
    return eventCode && typeof eventCode === 'string' && eventCode in this.EVENT_DESCRIPTIONS;
  }
}

module.exports = EssayAuditEvent;

