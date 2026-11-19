/**
 * DTO para órdenes de trabajo (work_orders).
 * Se usa para respuestas de API; campos en snake_case.
 */
class WorkOrderDTO {
  /**
   * @param {Object} params - Campos en snake_case para la API
   * @param {string} [params.id]
   * @param {string} [params.essay_id]
   * @param {string} [params.code]
   * @param {string} [params.essay_track_code]
   * @param {string} [params.report_delivery_deadline]
   * @param {Date|string} [params.samples_received_at]
   * @param {string} [params.sample_dimensions]
   * @param {number} [params.sample_width]
   * @param {number} [params.sample_height]
   * @param {number} [params.sample_thickness]
   * @param {Date|string} [params.generated_at]
   * @param {string} [params.observations]
   * @param {boolean} [params.internal_aconditioning]
   * @param {string} [params.uncertainty]
   * @param {number} [params.average_value]
   * @param {string} [params.status]
   * @param {Date|string} [params.closed_at]
   * @param {Date|string} [params.last_update] - Fecha de última actualización (al registrar auditoría)
   * @param {number} [params.samples_count]
   * @param {Array} [params.samples]
   * @param {string} [params.element_to_test]
   * @param {Date|string} [params.essay_finish_date]
   * @param {string} [params.essay_status]
   * @param {string} [params.essay_type]
   * @param {Array} [params.audit_logs] - Eventos de auditoría asociados a la orden
   */
  constructor(params = {}) {
    this.id = params.id ?? null;
    this.essay_id = params.essay_id ?? null;
    this.code = params.code ?? null;
    this.essay_track_code = params.essay_track_code ?? null;
    this.report_delivery_deadline = params.report_delivery_deadline ?? null;
    this.samples_received_at = params.samples_received_at ?? null;
    this.sample_dimensions = params.sample_dimensions ?? null;
    this.sample_width = params.sample_width != null ? parseFloat(params.sample_width) : null;
    this.sample_height = params.sample_height != null ? parseFloat(params.sample_height) : null;
    this.sample_thickness = params.sample_thickness != null ? parseFloat(params.sample_thickness) : null;
    this.generated_at = params.generated_at ?? null;
    this.observations = params.observations ?? null;
    this.internal_aconditioning = params.internal_aconditioning === true;
    this.uncertainty = params.uncertainty ?? null;
    this.average_value = params.average_value != null ? parseFloat(params.average_value) : null;
    this.status = params.status ?? null;
    this.closed_at = params.closed_at ?? null;
    this.last_update = params.last_update ?? null;
    this.samples_count = params.samples_count;
    this.samples = params.samples;
    this.element_to_test = params.element_to_test;
    this.essay_finish_date = params.essay_finish_date;
    this.essay_last_report_generated = params.essay_last_report_generated ?? null;
    this.essay_status = params.essay_status;
    this.essay_type = params.essay_type ?? null;
    this.client_name = params.client_name ?? null;
    this.applicant_name = params.applicant_name ?? null;
    this.client = params.client ?? null;
    this.audit_logs = Array.isArray(params.audit_logs) ? params.audit_logs : null;
  }

  /**
   * Crea un DTO a partir de una entidad de dominio WorkOrder y datos extra (samples, essay_finish_date, etc.).
   * @param {import('../../../domain/essays/entities/WorkOrder')} workOrder - Entidad WorkOrder
   * @param {Object} [extra] - { samples_count, samples, element_to_test, essay_finish_date, essay_status, audit_logs, ...overrides }
   * @returns {WorkOrderDTO}
   */
  static fromEntity(workOrder, extra = {}) {
    if (!workOrder) return new WorkOrderDTO();
    const base = {
      id: workOrder.id,
      essay_id: workOrder.essayId,
      code: workOrder.code,
      essay_track_code: workOrder.essayTrackCode ?? null,
      report_delivery_deadline: workOrder.reportDeliveryDeadline ?? null,
      samples_received_at: workOrder.samplesReceivedAt ?? null,
      sample_dimensions: workOrder.sampleDimensions ?? null,
      sample_width: workOrder.sampleWidth,
      sample_height: workOrder.sampleHeight,
      sample_thickness: workOrder.sampleThickness,
      generated_at: workOrder.generatedAt ?? null,
      observations: workOrder.observations ?? null,
      internal_aconditioning: workOrder.internalAconditioning === true,
      uncertainty: workOrder.uncertainty ?? null,
      average_value: workOrder.averageValue,
      status: workOrder.status ?? null,
      closed_at: workOrder.closedAt ?? null,
      last_update: workOrder.lastUpdate ?? null
    };
    return new WorkOrderDTO({ ...base, ...extra });
  }

  /**
   * Objeto plano para res.json (sin getters; solo propiedades enumerables).
   */
  toJSON() {
    const o = {};
    if (this.id != null) o.id = this.id;
    if (this.essay_id != null) o.essay_id = this.essay_id;
    if (this.code != null) o.code = this.code;
    if (this.essay_track_code != null) o.essay_track_code = this.essay_track_code;
    if (this.report_delivery_deadline != null) o.report_delivery_deadline = this.report_delivery_deadline;
    if (this.samples_received_at != null) o.samples_received_at = this.samples_received_at;
    if (this.sample_dimensions != null) o.sample_dimensions = this.sample_dimensions;
    if (this.sample_width != null) o.sample_width = this.sample_width;
    if (this.sample_height != null) o.sample_height = this.sample_height;
    if (this.sample_thickness != null) o.sample_thickness = this.sample_thickness;
    if (this.generated_at != null) o.generated_at = this.generated_at;
    if (this.observations != null) o.observations = this.observations;
    o.internal_aconditioning = this.internal_aconditioning;
    if (this.uncertainty != null) o.uncertainty = this.uncertainty;
    if (this.average_value != null) o.average_value = this.average_value;
    if (this.status != null) o.status = this.status;
    if (this.closed_at != null) o.closed_at = this.closed_at;
    if (this.last_update != null) o.last_update = this.last_update;
    if (this.samples_count != null) o.samples_count = this.samples_count;
    if (this.samples != null) o.samples = this.samples;
    if (this.element_to_test != null) o.element_to_test = this.element_to_test;
    if (this.essay_finish_date != null) o.essay_finish_date = this.essay_finish_date;
    if (this.essay_last_report_generated != null) o.essay_last_report_generated = this.essay_last_report_generated;
    if (this.essay_status != null) o.essay_status = this.essay_status;
    if (this.essay_type != null) o.essay_type = this.essay_type;
    if (this.client_name != null) o.client_name = this.client_name;
    if (this.applicant_name != null) o.applicant_name = this.applicant_name;
    if (this.client != null) o.client = this.client;
    if (this.audit_logs != null) o.audit_logs = this.audit_logs;
    return o;
  }
}

module.exports = WorkOrderDTO;
