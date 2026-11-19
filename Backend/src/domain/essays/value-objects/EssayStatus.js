/**
 * Value Object que representa el estado de un ensayo.
 * REQUESTED (inicial) -> ACCEPTED | REJECTED -> SERVICE_AGREEMENT_MADED (contrato) -> IN_WORK (orden emitida) -> COMPLETED (informe) | CANCELLED
 */
class EssayStatus {
  static REQUESTED = 'REQUESTED';
  static ACCEPTED = 'ACCEPTED';
  static REJECTED = 'REJECTED';
  static SERVICE_AGREEMENT_MADED = 'SERVICE_AGREEMENT_MADED';
  static IN_WORK = 'IN_WORK';
  static COMPLETED = 'COMPLETED';
  static CANCELLED = 'CANCELLED';

  constructor(value) {
    if (!Object.values(EssayStatus).includes(value)) {
      throw new Error(`Estado de ensayo inválido: ${value}`);
    }
    this.value = value;
  }

  equals(other) {
    return this.value === (other?.value ?? other);
  }
}

module.exports = EssayStatus;
