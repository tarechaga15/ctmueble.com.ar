/**
 * Value Object que representa el estado de una orden de trabajo.
 */
class WorkOrderStatus {
  static WAITING_SAMPLES = 'WAITING_SAMPLES';
  static ANALYZING = 'ANALYZING';
  static COMPLETED = 'COMPLETED';
  static CANCELLED = 'CANCELLED';

  constructor(value) {
    if (!Object.values(WorkOrderStatus).includes(value)) {
      throw new Error(`Estado de orden de trabajo inválido: ${value}`);
    }
    this.value = value;
  }

  equals(other) {
    return this.value === (other?.value ?? other);
  }
}

module.exports = WorkOrderStatus;
