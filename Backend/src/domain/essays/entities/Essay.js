/**
 * Entidad de dominio que representa un ensayo.
 * Estado único: REQUESTED | ACCEPTED | REJECTED | SERVICE_AGREEMENT_MADED | IN_WORK | COMPLETED | CANCELLED.
 */
const { DateTime } = require('luxon');

class Essay {
  /**
   * @param {Object} params - Parámetros del ensayo
   * @param {string} params.id - Identificador único
   * @param {string} params.status - Estado: REQUESTED, ACCEPTED, REJECTED, SERVICE_AGREEMENT_MADED, IN_WORK, COMPLETED, CANCELLED
   * @param {string} params.code - Código único del ensayo
   * @param {Object} params.terms - Términos (daysToDo, price, samplesConservationDays)
   * @param {Object} [params.elements] - Elementos del ensayo
   * @param {Object} [params.client] - Cliente
   * @param {Object} [params.type] - Tipo de ensayo
   * @param {Date} [params.requestDate] - Fecha de solicitud
   * @param {Date} [params.signingDate] - Fecha de firma
   * @param {Date} [params.finishDate] - Fecha de finalización
   * @param {Date} [params.dueDate] - Fecha de vencimiento
   * @param {string} [params.observations] - Observaciones
   * @param {Object} [params.workOrder] - Orden de trabajo
   * @param {Date} [params.lastUpdate] - Fecha de última actualización del ensayo (se actualiza al registrar auditoría)
   * @param {Date} [params.lastReportGenerated] - Fecha del último informe emitido (se actualiza al emitir informe)
   */
  constructor({
    id,
    client,
    type,
    requestDate,
    signingDate,
    finishDate,
    dueDate,
    observations,
    status,
    code,
    elements,
    terms,
    lastUpdate,
    lastReportGenerated,
    workOrder,
    result,
    uncertainty,
    clientNotificationsEnabled = true,
    notificationToken = null
  }) {
    this.id = id;
    this.client = client;
    this.type = type;
    this.requestDate = requestDate;
    this.signingDate = signingDate;
    this.finishDate = finishDate;
    this.dueDate = dueDate;
    this.observations = observations;
    this.status = status;
    this.code = code;
    this.elements = elements;
    this.terms = terms;
    this.workOrder = workOrder;
    this.lastUpdate = lastUpdate ?? null;
    this.lastReportGenerated = lastReportGenerated ?? null;
    this.result = result ?? null;
    this.uncertainty = uncertainty ?? null;
    this.clientNotificationsEnabled = clientNotificationsEnabled !== false;
    this.notificationToken = notificationToken;
  }

  /** Acepta el ensayo. Solo si status === REQUESTED. */
  accept() {
    if (this.status !== 'REQUESTED') {
      throw new Error('El ensayo no puede ser aceptado');
    }
    this.status = 'ACCEPTED';
  }

  /** Rechaza el ensayo. Solo si status === REQUESTED. */
  reject() {
    if (this.status !== 'REQUESTED') {
      throw new Error('El ensayo no puede ser rechazado');
    }
    this.status = 'REJECTED';
  }

  /**
   * Añade texto a las observaciones del ensayo.
   * Si ya existe observación previa, se añade al final (separado por salto de línea).
   * @param {string} text - Texto a añadir
   */
  appendObservations(text) {
    if (!text || typeof text !== 'string') return;
    const trimmed = text.trim();
    if (!trimmed) return;
    this.observations = this.observations ? `${this.observations}\n${trimmed}` : trimmed;
  }

  /** Establece los términos. Solo si status === ACCEPTED. */
  setTerms(terms) {
    if (this.status !== 'ACCEPTED') {
      throw new Error('No se pueden establecer términos');
    }
    if (
      !terms ||
      typeof terms.daysToDo === 'undefined' ||
      typeof terms.price === 'undefined' ||
      typeof terms.samplesConservationDays === 'undefined'
    ) {
      throw new Error('Términos no completos');
    }
    this.terms = terms;
  }

  /** Genera el contrato (acuerdo de servicio). Solo si status === ACCEPTED y términos completos. */
  createContract() {
    if (this.status !== 'ACCEPTED') {
      throw new Error('No se puede crear el contrato');
    }
    if (
      !this.terms ||
      typeof this.terms.daysToDo === 'undefined' ||
      typeof this.terms.price === 'undefined' ||
      typeof this.terms.samplesConservationDays === 'undefined'
    ) {
      throw new Error('Términos no completos');
    }
    this.status = 'SERVICE_AGREEMENT_MADED';
  }

  /** Marca el ensayo como en trabajo (orden de trabajo emitida). Solo si status === SERVICE_AGREEMENT_MADED. */
  markAsInWork() {
    if (this.status !== 'SERVICE_AGREEMENT_MADED') {
      throw new Error('Solo se puede emitir orden de trabajo cuando el contrato está generado');
    }
    this.status = 'IN_WORK';
  }

  /** Finaliza el ensayo (informe emitido). Solo si status === IN_WORK. */
  finish(timestamp = new Date()) {
    if (this.status !== 'IN_WORK') {
      throw new Error('Solo se puede finalizar un ensayo que está en trabajo');
    }
    const now = timestamp instanceof Date ? timestamp : new Date(timestamp);
    this.status = 'COMPLETED';
    this.finishDate = now;
    this.lastReportGenerated = now;
    this.lastUpdate = now;
  }

  hasModifiedAfterFinish() {
    const finishDate = this.finishDate ? new Date(this.finishDate) : null;
    const lastUpdate = this.lastUpdate ? new Date(this.lastUpdate) : null;
    return !!(finishDate && lastUpdate && lastUpdate > finishDate);
  }

  /**
   * Indica si hubo modificaciones del ensayo después del último informe emitido.
   * Se usa para determinar si el reporte a emitir es una modificación (lastUpdate > lastReportGenerated).
   * @returns {boolean}
   */
  hasModificationsSinceLastReport() {
    const lastUpdate = this.lastUpdate ? new Date(this.lastUpdate) : null;
    const lastReportGenerated = this.lastReportGenerated ? new Date(this.lastReportGenerated) : null;
    return !!(lastReportGenerated && lastUpdate && lastUpdate > lastReportGenerated);
  }

  validateCanEmitOriginal() {
    if (this.status !== 'IN_WORK') {
      throw new Error('Solo se puede emitir el informe original de un ensayo que está en trabajo');
    }
  }

  validateCanEmitModification() {
    if (this.status !== 'COMPLETED') {
      throw new Error('Solo se pueden emitir modificaciones de un ensayo finalizado');
    }
  }

  validateCanEmitCopy() {
    if (this.status !== 'COMPLETED') {
      throw new Error('Solo se pueden emitir copias de un ensayo finalizado');
    }
  }

  determineReportEmissionType({ existingReports, hasModifications = false }) {
    const originalReport = existingReports
      .filter(doc => !doc.modificated && doc.copy === 0)
      .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))[0] ||
      existingReports.sort((a, b) => new Date(a.generatedAt || a.generated_at) - new Date(b.generatedAt || b.generated_at))[0];

    // Toda re-emisión posterior al informe inicial se marca como modificación
    if (originalReport) {
      this.validateCanEmitModification();
      return { type: 'MODIFICATION', originalReport };
    }

    this.validateCanEmitOriginal();
    return { type: 'ORIGINAL', originalReport: null };
  }

  generateReportConfig({ existingReports, hasModifications = false }) {
    const emissionType = this.determineReportEmissionType({
      existingReports,
      hasModifications
    });
    const { type, originalReport } = emissionType;
    const isModification = type === 'MODIFICATION';
    const isCopy = type === 'COPY';
    const isNumberedCopy = isCopy;
    let baseConfig = { metadata: {}, copyNumber: 0, isModificated: false };

    if (isModification) {
      const modifications = existingReports.filter(doc => doc.modificated);
      baseConfig = {
        metadata: { modificationNumber: modifications.length + 1, originalReport },
        copyNumber: 0,
        isModificated: true
      };
    } else if (isCopy) {
      const numberedCopies = existingReports.filter(doc => doc.copy > 0 && !doc.modificated);
      const copyNumber = numberedCopies.length > 0 ? Math.max(...numberedCopies.map(doc => doc.copy)) + 1 : 1;
      baseConfig = {
        metadata: { copyNumber, originalReport },
        copyNumber,
        isModificated: false,
        isCopy: true
      };
    }

    const formattedMetadata = this.formatReportMetadataForTemplate({ type, baseConfig, originalReport });
    return {
      metadata: formattedMetadata,
      copyNumber: baseConfig.copyNumber,
      isModificated: baseConfig.isModificated,
      type,
      originalReport
    };
  }

  formatReportMetadataForTemplate({ type, baseConfig, originalReport }) {
    if (type === 'MODIFICATION') {
      const formattedDate = DateTime.fromJSDate(new Date(originalReport.generated_at)).toFormat('dd/MM/yyyy');
      return {
        headerTitle: `MODIFICACIÓN Nº ${baseConfig.metadata.modificationNumber} AL INFORME DE ENSAYO Nº ${this.code} DE FECHA ${formattedDate}`
      };
    }
    if (type === 'COPY') {
      if (baseConfig.copyNumber > 0) {
        const formattedDate = DateTime.fromJSDate(new Date(originalReport.generated_at)).toFormat('dd/MM/yyyy');
        return {
          headerTitle: `COPIA Nº ${baseConfig.copyNumber} DEL INFORME DE ENSAYO Nº ${this.code} DE FECHA ${formattedDate}`
        };
      }
      return { watermark: 'ES COPIA DEL ORIGINAL', copyDate: baseConfig.metadata.copyDate };
    }
    return { headerTitle: `INFORME DE ENSAYO Nº ${this.code}` };
  }

  switchStatus(status) {
    this.status = status;
  }

  setClientNotifications(enabled) {
    this.clientNotificationsEnabled = Boolean(enabled);
  }

  toPlain() {
    return {
      id: this.id,
      client: this.client,
      type: this.type,
      requestDate: this.requestDate,
      signingDate: this.signingDate,
      finishDate: this.finishDate,
      dueDate: this.dueDate,
      observations: this.observations,
      status: this.status,
      code: this.code,
      elements: this.elements,
      terms: this.terms,
      workOrder: this.workOrder ? this.workOrder.toPlain() : null,
      lastUpdate: this.lastUpdate,
      lastReportGenerated: this.lastReportGenerated,
      result: this.result,
      uncertainty: this.uncertainty,
      clientNotificationsEnabled: this.clientNotificationsEnabled,
      notificationToken: this.notificationToken
    };
  }
}

module.exports = Essay;
