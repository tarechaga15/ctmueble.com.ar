/**
 * Value Object que representa los códigos de eventos de auditoría para órdenes de trabajo.
 */
class WorkOrderAuditEvent {
  static EMITTED = 'EMITTED';
  static SAMPLES_RECEIVED = 'SAMPLES_RECEIVED';
  static RESULTS_LOADED = 'RESULTS_LOADED';
  static COMPLETED = 'COMPLETED';

  static EVENT_DESCRIPTIONS = {
    [WorkOrderAuditEvent.EMITTED]: 'Orden de trabajo emitida',
    [WorkOrderAuditEvent.SAMPLES_RECEIVED]: 'Muestras recibidas',
    [WorkOrderAuditEvent.RESULTS_LOADED]: 'Resultados cargados',
    [WorkOrderAuditEvent.COMPLETED]: 'Orden cerrada e informe emitido'
  };

  static getDescription(eventCode) {
    return this.EVENT_DESCRIPTIONS[eventCode] || 'Evento desconocido';
  }

  static isValid(eventCode) {
    return eventCode && typeof eventCode === 'string' && eventCode in this.EVENT_DESCRIPTIONS;
  }
}

module.exports = WorkOrderAuditEvent;
