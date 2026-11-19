/**
 * Servicio de aplicación para gestionar ensayos, órdenes de trabajo y muestras.
 * - Transacciones explícitas (`withTransaction`) desacopladas del renderizado PDF (Puppeteer) y subida a R2.
 * - Validaciones estrictas de propiedad (anti-IDOR) y perfil (`LABORATORY` vs `CLIENT`).
 * - Carga en lote (`findByIds`) para eliminar consultas N+1 en listados de órdenes de trabajo.
 */
const crypto = require('crypto');
const EssayDTO = require('../dto/EssayDTO');
const WorkOrderDTO = require('../dto/WorkOrderDTO');
const SampleDTO = require('../dto/SampleDTO');
const Essay = require('../../../domain/essays/entities/Essay');
const WorkOrder = require('../../../domain/essays/entities/WorkOrder');
const Terms = require('../../../domain/essays/value-objects/Terms');
const EssayAuditEvent = require('../../../domain/essays/value-objects/EssayAuditEvent');
const WorkOrderAuditEvent = require('../../../domain/essays/value-objects/WorkOrderAuditEvent');
const SampleStatus = require('../../../domain/essays/value-objects/SampleStatus');
const EssayClient = require('../../../domain/essays/entities/EssayClient');
const { DateTime } = require('luxon');

function httpError(message, status = 400, code = 'BAD_REQUEST') {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

function dniToValidCuit(dni) {
  const digits = String(dni || '').replace(/\D/g, '');
  if (digits.length === 11) return digits;
  const clean = digits.padStart(8, '0').slice(-8);
  const prefixes = ['20', '27', '23', '24'];
  for (const prefix of prefixes) {
    const base = `${prefix}${clean}`;
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(base[i], 10) * multipliers[i];
    }
    const mod = sum % 11;
    let check = 11 - mod;
    if (check === 11) check = 0;
    if (check !== 10) {
      return `${base}${check}`;
    }
  }
  return `20${clean}9`;
}

class EssayApplicationService {
  constructor({ context } = {}) {
    this.context = context || {};
  }

  get snapshotService() {
    if (!this._snapshotService) {
      const SnapshotApplicationService = require('./SnapshotApplicationService');
      this._snapshotService = new SnapshotApplicationService({ context: this.context });
    }
    return this._snapshotService;
  }

  set snapshotService(service) {
    this._snapshotService = service;
  }

  async _runInTransaction(workFn) {
    let db = null;
    try {
      db = require('../../../infrastructure/config/db');
    } catch (_) {
      // Módulo no disponible en tests unitarios puros
    }

    if (db && typeof db.withTransaction === 'function') {
      return await db.withTransaction(async (tx) => {
        const prevTx = this.essayRepository?.transaction;
        if (this.essayRepository && typeof this.essayRepository.setTransaction === 'function') {
          this.essayRepository.setTransaction(tx);
        }
        if (this.workOrderRepository && typeof this.workOrderRepository.setTransaction === 'function') {
          this.workOrderRepository.setTransaction(tx);
        }
        if (this.sampleRepository && typeof this.sampleRepository.setTransaction === 'function') {
          this.sampleRepository.setTransaction(tx);
        }
        if (
          this.essayAuditLogService?.essayAuditLogRepository &&
          typeof this.essayAuditLogService.essayAuditLogRepository.setTransaction === 'function'
        ) {
          this.essayAuditLogService.essayAuditLogRepository.setTransaction(tx);
        }
        try {
          return await workFn(tx);
        } finally {
          if (this.essayRepository && typeof this.essayRepository.setTransaction === 'function') {
            this.essayRepository.setTransaction(prevTx);
          }
          if (this.workOrderRepository && typeof this.workOrderRepository.setTransaction === 'function') {
            this.workOrderRepository.setTransaction(prevTx);
          }
          if (this.sampleRepository && typeof this.sampleRepository.setTransaction === 'function') {
            this.sampleRepository.setTransaction(prevTx);
          }
          if (
            this.essayAuditLogService?.essayAuditLogRepository &&
            typeof this.essayAuditLogService.essayAuditLogRepository.setTransaction === 'function'
          ) {
            this.essayAuditLogService.essayAuditLogRepository.setTransaction(prevTx);
          }
        }
      });
    }

    return workFn(null);
  }

  _requireLaboratory(message = 'Solo el laboratorio puede realizar esta acción') {
    if (this.context?.user?.profile !== 'LABORATORY') {
      throw httpError(message, 403, 'LABORATORY_REQUIRED');
    }
  }

  async _readSystemUncertainty() {
    if (this.envService && typeof this.envService.getSystemValue === 'function') {
      return this.envService.getSystemValue('UNCERTAINTY');
    }
    if (this.envService && typeof this.envService.get === 'function') {
      return this.envService.get({ id: 'UNCERTAINTY' });
    }
    return null;
  }

  _getMailingService() {
    if (!this._mailingService) {
      const MailingService = require('../../../infrastructure/mailing/MailingService');
      this._mailingService = new MailingService();
    }
    return this._mailingService;
  }

  async _notifyClientStatusChange(essayId, status, observations = null) {
    try {
      const mailing = this._getMailingService();
      const isConfigured = await mailing.isConfigured();
      if (!isConfigured) return;

      const EssayRepository = require('../../../infrastructure/repositories/essays/EssayRepository');
      const cleanRepo = this.essayRepository && !this.essayRepository.transaction
        ? this.essayRepository
        : new EssayRepository({ transaction: null });

      const essay = await cleanRepo.findById(essayId, null);
      if (!essay || essay.clientNotificationsEnabled === false) return;

      const recipientEmail =
        essay.client?.contact?.mail ||
        essay.contact?.mail ||
        essay.client?.mail ||
        (essay.essayClient && essay.essayClient.contact_mail);

      if (!recipientEmail || typeof recipientEmail !== 'string' || !recipientEmail.includes('@')) {
        return;
      }

      const recipientName =
        essay.client?.contact?.name ||
        essay.contact?.name ||
        essay.client?.name ||
        '';

      const STATUS_MESSAGES = {
        REQUESTED: {
          title: 'Esperando respuesta del laboratorio acerca de tu solicitud',
          description:
            'Tu solicitud de ensayo fue enviada exitosamente. El equipo del laboratorio está revisando la viabilidad técnica para aceptarla.'
        },
        ACCEPTED: {
          title: 'La solicitud fue aceptada',
          description:
            'El laboratorio aceptó tu solicitud. En este momento se están formalizando los términos del contrato de servicio.'
        },
        REJECTED: {
          title: 'La solicitud fue rechazada',
          description: observations
            ? `El laboratorio no pudo aceptar esta solicitud. Motivo indicado: ${observations}`
            : 'El laboratorio revisó la solicitud y no fue posible aceptarla.'
        },
        SERVICE_AGREEMENT_MADED: {
          title: 'Esperando recepción de muestras',
          description:
            'El acuerdo de servicio está definido. El laboratorio aguarda la llegada de las muestras y contramuestras físicas para dar inicio a los análisis.'
        },
        IN_WORK: {
          title: 'El laboratorio está analizando las muestras',
          description:
            'Las muestras fueron recibidas de conformidad. El equipo técnico del laboratorio se encuentra ejecutando los ensayos correspondientes.'
        },
        COMPLETED: {
          title: 'Informe emitido',
          description:
            'El ensayo ha finalizado exitosamente. El informe formal técnico ya está emitido y listo para su consulta y descarga.'
        },
        CANCELLED: {
          title: 'El ensayo fue cancelado',
          description: observations
            ? `El ensayo fue cancelado. Motivo: ${observations}`
            : 'Este ensayo se encuentra cancelado.'
        }
      };

      const msgConfig = STATUS_MESSAGES[status];
      if (!msgConfig) return;

      await mailing.sendEssayStatusNotification({
        to: recipientEmail.trim(),
        name: recipientName.trim(),
        essayCode: essay.code,
        essayId: essay.id,
        status,
        statusTitle: msgConfig.title,
        statusDescription: msgConfig.description,
        observations: observations?.trim() || null,
        unsubscribeToken: essay.notificationToken
      });
    } catch (err) {
      if (this.context?.logger) {
        this.context.logger.warn(`[EssayApplicationService] Error al notificar cambio de estado (${status}) al cliente:`, err.message);
      } else {
        console.warn(`[EssayApplicationService] Error al notificar cambio de estado (${status}) al cliente:`, err.message);
      }
    }
  }

  async _notifyLaboratoryNewRequest(essayId) {
    try {
      const ApiKeyApplicationService = require('../../security/ApiKeyApplicationService');
      const apiKeyService = new ApiKeyApplicationService();
      const mailingConfig = await apiKeyService.getActiveApiKey('MAILING');

      const notifyEnabled = Boolean(mailingConfig?.metadata?.notifyNewRequests);
      if (!notifyEnabled) return;

      const mailing = this._getMailingService();
      const isConfigured = await mailing.isConfigured();
      if (!isConfigured) return;

      const EssayRepository = require('../../../infrastructure/repositories/essays/EssayRepository');
      const cleanRepo = this.essayRepository && !this.essayRepository.transaction
        ? this.essayRepository
        : new EssayRepository({ transaction: null });

      const essay = await cleanRepo.findById(essayId, null);
      if (!essay) return;

      let labEmail = mailingConfig?.metadata?.notificationEmail?.trim();
      if (!labEmail) {
        try {
          const { Laboratory } = require('../../../infrastructure/models');
          const lab = await Laboratory.findOne();
          if (lab && lab.mail) {
            labEmail = lab.mail.trim();
          }
        } catch (_) {}
      }
      if (!labEmail && this.envService) {
        try {
          const envVal = await this.envService.getSystemValue('LAB_MAIL');
          if (envVal?.value) labEmail = String(envVal.value).trim();
        } catch (_) {}
      }

      if (!labEmail || !labEmail.includes('@')) {
        labEmail = 'ctmlaboratorio@gmail.com';
      }

      const clientName = essay.client?.name || '';
      const applicantName = essay.client?.contact?.name || essay.contact?.name || '';
      const product = essay.elements?.product || '';
      const manufacturer = essay.elements?.manufacturer || '';

      await mailing.sendNewRequestLabNotification({
        to: labEmail,
        essayCode: essay.code,
        essayId: essay.id,
        clientName,
        applicantName,
        product,
        manufacturer,
        requestDate: essay.requestDate,
        observations: essay.observations
      });
    } catch (err) {
      if (this.context?.logger) {
        this.context.logger.warn('[EssayApplicationService] Error al notificar nueva solicitud al laboratorio:', err.message);
      } else {
        console.warn('[EssayApplicationService] Error al notificar nueva solicitud al laboratorio:', err.message);
      }
    }
  }

  async updateNotifications(essayId, enabled, user, source = 'SYSTEM') {
    const actingUser = user || this.context?.user;
    const essay = await this.essayRepository.findById(essayId, actingUser);
    if (!essay) {
      throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
    }

    const isEnabled = Boolean(enabled);
    if (essay.clientNotificationsEnabled === isEnabled) {
      return this.mapToDTO(essay, actingUser);
    }

    essay.setClientNotifications(isEnabled);
    await this.essayRepository.update(essay);

    const eventCode = isEnabled
      ? EssayAuditEvent.NOTIFICATIONS_ENABLED
      : EssayAuditEvent.NOTIFICATIONS_DISABLED;

    let auditUser = actingUser;
    if (!auditUser?.id) {
      try {
        const logs = await this.essayAuditLogService.getAuditLogs(essayId);
        const createLog = logs.find((l) => l.eventCode === 'REQUEST_CREATED');
        if (createLog && createLog.userId) {
          auditUser = { id: createLog.userId, name: createLog.userName || 'Usuario' };
        }
      } catch (_) {}
    }
    if (!auditUser?.id) {
      try {
        const { User } = require('../../../infrastructure/models');
        const defaultUser = await User.findOne();
        if (defaultUser) {
          auditUser = { id: defaultUser.id, name: defaultUser.name || 'Usuario del sistema' };
        }
      } catch (_) {}
    }

    if (auditUser?.id) {
      try {
        await this.essayAuditLogService.logEvent(
          essayId,
          eventCode,
          auditUser,
          {
            source,
            updatedBy: auditUser.name || auditUser.mail || 'Usuario del sistema'
          }
        );
      } catch (logErr) {
        if (this.context?.logger) {
          this.context.logger.warn('Error al registrar auditoría de cambio de notificaciones:', logErr.message);
        }
      }
    }

    return this.mapToDTO(essay, actingUser);
  }

  async unsubscribeByToken(essayId, token) {
    if (!essayId || !token) {
      throw httpError('ID de ensayo y token son requeridos', 400, 'INVALID_UNSUBSCRIBE_PARAMS');
    }

    const essay = await this.essayRepository.findById(essayId, null);
    if (!essay) {
      throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
    }

    const expectedToken = essay.notificationToken ? String(essay.notificationToken).trim().toLowerCase() : '';
    const providedToken = String(token).trim().toLowerCase();
    const tokensMatch =
      expectedToken.length > 0 &&
      expectedToken.length === providedToken.length &&
      crypto.timingSafeEqual(Buffer.from(expectedToken, 'utf8'), Buffer.from(providedToken, 'utf8'));
    if (!tokensMatch) {
      throw httpError('Token de desuscripción inválido', 403, 'INVALID_UNSUBSCRIBE_TOKEN');
    }

    if (!essay.clientNotificationsEnabled) {
      return {
        success: true,
        message: 'Ya te encontrás dado de baja de las notificaciones de esta solicitud',
        essayCode: essay.code
      };
    }

    essay.setClientNotifications(false);
    await this.essayRepository.update(essay);

    let auditUser = null;
    try {
      const logs = await this.essayAuditLogService.getAuditLogs(essayId);
      const createLog = logs.find((l) => l.eventCode === 'REQUEST_CREATED');
      if (createLog && createLog.userId) {
        auditUser = { id: createLog.userId, name: createLog.userName || 'Solicitante' };
      }
    } catch (_) {}

    if (!auditUser?.id) {
      try {
        const { User } = require('../../../infrastructure/models');
        const defaultUser = await User.findOne();
        if (defaultUser) auditUser = { id: defaultUser.id, name: 'Solicitante (Baja vía mail)' };
      } catch (_) {}
    }

    if (auditUser?.id) {
      try {
        await this.essayAuditLogService.logEvent(
          essayId,
          EssayAuditEvent.NOTIFICATIONS_DISABLED,
          auditUser,
          {
            source: 'UNSUBSCRIBE_LINK',
            updatedBy: 'Solicitante (vía enlace de correo)'
          }
        );
      } catch (logErr) {
        if (this.context?.logger) {
          this.context.logger.warn('Error al registrar auditoría de baja por token:', logErr.message);
        }
      }
    }

    return {
      success: true,
      message: 'Te has dado de baja correctamente de las notificaciones por correo de esta solicitud de ensayo',
      essayCode: essay.code
    };
  }

  async getEssay(id, options = {}) {
    if (!id) throw httpError('ID del ensayo requerido', 400, 'ESSAY_ID_REQUIRED');
    const essay = await this.essayRepository.findById(id, this.context.user);
    if (!essay) {
      throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
    }

    const isLaboratory = this.context.user?.profile === 'LABORATORY';
    const essayCompleted = essay.status?.value === 'COMPLETED' || essay.status === 'COMPLETED';
    const shouldFetchWorkOrder = isLaboratory || essayCompleted;

    let workOrderPayload = null;
    let samples = [];

    if (shouldFetchWorkOrder) {
      try {
        const workOrderDTO = await this.getWorkOrderByEssayId(id, {
          allowForCompletedEssay: !isLaboratory && essayCompleted,
          analyzedOnly: options.analyzedOnly !== undefined ? options.analyzedOnly : true
        });
        workOrderPayload = workOrderDTO.toJSON ? workOrderDTO.toJSON() : { ...workOrderDTO };
      } catch (_) {
        workOrderPayload = null;
        samples = [];
      }
    }

    const auditLogs = this.essayAuditLogService
      ? await this.essayAuditLogService.essayAuditLogRepository.findByEssayId(id).then((logs) =>
          logs.map((log) => ({
            id: log.id,
            essayId: log.essayId,
            userId: log.userId,
            userName: log.userName,
            eventCode: log.eventCode,
            eventDescription: EssayAuditEvent.getDescription(log.eventCode),
            timestamp: log.timestamp,
            metadata: log.metadata
          }))
        )
      : [];

    // Asegurar que los documentos disponibles según el estado del ensayo figuren en essay.documents
    if (Array.isArray(essay.documents)) {
      const hasDoc = (code) =>
        essay.documents.some((d) => (d?.typeDocument?.code || d?.typeCode || d?.type?.code) === code);

      if (!hasDoc('F-PC13-01')) {
        essay.documents.push({
          id: essay.id,
          essay: essay.id,
          type: 3,
          copy: 0,
          modificated: false,
          generated_at: essay.requestDate,
          file: 'on-demand',
          typeDocument: { id: 3, code: 'F-PC13-01', name: 'Solicitud de ensayo' }
        });
      }

      if (essay.terms && !hasDoc('F-PC13-02') && essay.status !== 'REQUESTED' && essay.status !== 'CANCELLED') {
        essay.documents.push({
          id: essay.id,
          essay: essay.id,
          type: 2,
          copy: 0,
          modificated: false,
          generated_at: essay.lastUpdate || essay.requestDate,
          file: 'on-demand',
          typeDocument: { id: 2, code: 'F-PC13-02', name: 'Contrato de Servicio' }
        });
      }

      if (workOrderPayload && !hasDoc('F-PC16-01')) {
        essay.documents.push({
          id: workOrderPayload.id || essay.id,
          essay: essay.id,
          type: 1,
          copy: 0,
          modificated: false,
          generated_at: workOrderPayload.samples_received_at || workOrderPayload.generated_at || essay.requestDate,
          file: 'on-demand',
          typeDocument: { id: 1, code: 'F-PC16-01', name: 'Registro de recepción de muestras' }
        });
      }

      if ((essayCompleted || essay.lastReportGenerated) && !hasDoc('F-PC15-01')) {
        essay.documents.push({
          id: essay.id,
          essay: essay.id,
          type: 5,
          copy: 0,
          modificated: false,
          generated_at: essay.lastReportGenerated || essay.finishDate || essay.lastUpdate,
          file: 'on-demand',
          typeDocument: { id: 5, code: 'F-PC15-01', name: 'Informe de Ensayo' }
        });
      }
    }

    return this.mapToDTO(essay, this.context.user, { samples, auditLogs, workOrder: workOrderPayload });
  }

  async getAllEssays(filters = {}) {
    const user = this.context?.user;
    const essays = await this.essayRepository.findAll(user, filters);
    return essays.map((essay) => this.mapToDTO(essay, user));
  }

  async countEssays(filters = {}) {
    const user = this.context?.user;
    return this.essayRepository.countAll(user, filters);
  }

  async buildEssayExport(filters, format) {
    const {
      enrichEssaysForExport,
      buildExportTables,
      buildXlsxBuffer,
      buildCsvBuffer
    } = require('../export/essaySpreadsheetExport');
    const user = this.context?.user;
    const essays = await this.getAllEssays({ ...filters, limit: 1000 });
    const ids = essays.map((e) => e.id);
    const woList = await this.workOrderRepository.findAllByEssayIds(ids);
    const woByEssay = new Map();
    for (const wo of woList) {
      if (!woByEssay.has(wo.essayId)) woByEssay.set(wo.essayId, wo);
    }
    const isLab = user?.profile === 'LABORATORY';
    const enriched = enrichEssaysForExport(essays, woByEssay, isLab);
    const tables = buildExportTables(enriched, woByEssay, user);
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === 'xlsx') {
      const buf = await buildXlsxBuffer(tables);
      return {
        body: buf,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `solicitudes-ensayo-${stamp}.xlsx`
      };
    }
    const csv = buildCsvBuffer(tables);
    return {
      body: Buffer.from(csv, 'utf8'),
      contentType: 'text/csv; charset=utf-8',
      filename: `solicitudes-ensayo-${stamp}.csv`
    };
  }

  async logEssayAuditEvent(essayId, eventCode, user, metadata = null) {
    if (!this.essayAuditLogService || !user?.id) return;
    try {
      await this.essayAuditLogService.logEvent(essayId, eventCode, user, metadata);
    } catch (err) {
      if (this.context.logger) this.context.logger.error('Error al registrar auditoría de ensayo:', err);
    }
  }

  async getAuditLogs(essayId) {
    if (!essayId) throw httpError('ID de ensayo requerido', 400, 'ESSAY_ID_REQUIRED');
    const essay = await this.essayRepository.findById(essayId, this.context?.user);
    if (!essay) {
      throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
    }
    if (!this.essayAuditLogService) return [];
    return this.essayAuditLogService.getAuditLogs(essayId);
  }

  async getAuditLogById(id) {
    if (!this.essayAuditLogService) return null;
    return this.essayAuditLogService.getAuditLogById(id);
  }

  async getWorkOrderAuditLogs(workOrderId) {
    this._requireLaboratory('Solo el laboratorio puede consultar la auditoría de órdenes de trabajo');
    if (!this.essayAuditLogService) return [];
    return this.essayAuditLogService.getWorkOrderAuditLogs(workOrderId);
  }

  async _getSamplesEntitiesForWorkOrder(workOrderId, options = {}) {
    let samples = await this.sampleRepository.findByWorkOrderId(workOrderId);
    if (options.analyzedOnly === true) {
      samples = samples.filter((s) => s.result != null && s.result !== '');
    }
    samples.sort((a, b) => {
      const ca = a.countersample === true;
      const cb = b.countersample === true;
      if (ca !== cb) return ca ? 1 : -1;
      return (a.code || '').localeCompare(b.code || '');
    });
    return samples;
  }

  async getSamplesByWorkOrder(workOrderId, options = {}) {
    this._requireLaboratory('Solo el laboratorio puede consultar las muestras de la orden');
    const workOrder = await this.workOrderRepository.findById(workOrderId);
    if (!workOrder) throw httpError('Orden de trabajo no encontrada', 404, 'WORK_ORDER_NOT_FOUND');
    const samples = await this._getSamplesEntitiesForWorkOrder(workOrderId, options);
    return samples.map((s) => this.mapSampleToDTO(s));
  }

  async _getWorkOrder(workOrder, options = {}) {
    const samples = await this._getSamplesEntitiesForWorkOrder(workOrder.id, options);
    const samplesDTO = samples.map((s) => this.mapSampleToDTO(s));
    const extra = { samples_count: samples.length, samples: samplesDTO };

    if (
      this.context?.user?.profile === 'LABORATORY' &&
      this.essayAuditLogService &&
      typeof this.getWorkOrderAuditLogs === 'function'
    ) {
      try {
        const auditLogs = await this.getWorkOrderAuditLogs(workOrder.id);
        extra.audit_logs = Array.isArray(auditLogs) ? auditLogs : [];
      } catch (err) {
        if (this.context.logger) {
          this.context.logger.error('Error al cargar auditoría de orden de trabajo:', err);
        }
      }
    }

    if (workOrder.essayId && this.essayRepository) {
      try {
        const essay = options.preloadedEssay || (await this.essayRepository.findById(workOrder.essayId, this.context.user));
        if (essay) {
          const product = essay.elements?.product;
          const typeName =
            essay.type?.name ?? (typeof essay.type === 'object' && essay.type !== null ? essay.type.name : null);
          extra.element_to_test = product ?? typeName ?? null;
          extra.essay_finish_date = essay.finishDate ?? essay.finish_date ?? null;
          extra.essay_status = essay.status ?? null;
          extra.essay_type = typeName ?? null;
          const clientName =
            essay.client?.name ?? essay.client?.business?.name ?? essay.client?.bussiness?.name ?? null;
          const applicantName =
            essay.client?.contact?.name ??
            essay.client?.representativeEntity?.name ??
            essay.client?.representative?.name ??
            null;
          extra.client_name = clientName;
          extra.applicant_name = applicantName;
          extra.client = essay.client
            ? {
                id: essay.client.id,
                name: clientName,
                cuit: essay.client.cuit,
                representative:
                  essay.client.representativeEntity?.name ?? essay.client.representative?.name ?? null,
                contact: essay.client.contact?.name ?? null
              }
            : null;
        }
      } catch (err) {
        if (this.context.logger) {
          this.context.logger.warn('Error al cargar elemento a ensayar en orden:', err?.message);
        }
      }
    }

    let samplesReceivedAt = workOrder.samplesReceivedAt ?? null;
    if (!samplesReceivedAt && samples.length > 0) {
      const dates = samples.map((s) => s.receivedAt || s.received_at).filter(Boolean);
      if (dates.length > 0) samplesReceivedAt = new Date(Math.min(...dates.map((d) => new Date(d).getTime())));
      extra.samples_received_at = samplesReceivedAt;
    }
    if (samplesReceivedAt != null && extra.samples_received_at == null) {
      extra.samples_received_at = samplesReceivedAt;
    }

    let sampleDimensions = workOrder.sampleDimensions;
    if (!sampleDimensions && samples.length > 0) {
      const first = samples[0];
      const dimStr = this.formatSampleDimensions({
        height: first.height,
        width: first.width,
        thickness: first.thickness
      });
      if (dimStr) sampleDimensions = dimStr;
      extra.sample_dimensions = sampleDimensions;
    }
    if (sampleDimensions != null && extra.sample_dimensions == null) {
      extra.sample_dimensions = sampleDimensions;
    }

    const round1 = (v) => (v != null && !isNaN(parseFloat(v)) ? Math.round(parseFloat(v) * 10) / 10 : null);
    let sampleWidth = workOrder.sampleWidth;
    let sampleHeight = workOrder.sampleHeight;
    let sampleThickness = workOrder.sampleThickness;
    if (sampleWidth == null && sampleHeight == null && sampleThickness == null && samples.length > 0) {
      const first = samples[0];
      sampleWidth = round1(first.width);
      sampleHeight = round1(first.height);
      sampleThickness = round1(first.thickness);
    }
    extra.sample_width = sampleWidth != null ? round1(sampleWidth) : null;
    extra.sample_height = sampleHeight != null ? round1(sampleHeight) : null;
    extra.sample_thickness = sampleThickness != null ? round1(sampleThickness) : null;

    let averageValue = workOrder.averageValue;
    if (averageValue == null && samples.length > 0) {
      const withResult = samples.filter((s) => s.result != null && s.result !== '');
      if (withResult.length > 0) {
        averageValue = parseFloat(
          (withResult.reduce((acc, s) => acc + parseFloat(s.result), 0) / withResult.length).toFixed(4)
        );
        extra.average_value = averageValue;
      }
    }
    if (averageValue != null && extra.average_value == null) extra.average_value = averageValue;

    return WorkOrderDTO.fromEntity(workOrder, extra);
  }

  async getWorkOrder(id, options = {}) {
    this._requireLaboratory('Solo el laboratorio puede consultar las órdenes de trabajo');
    const workOrder = await this.workOrderRepository.findById(id);
    if (!workOrder) throw httpError('Orden de trabajo no encontrada', 404, 'WORK_ORDER_NOT_FOUND');
    return this._getWorkOrder(workOrder, options);
  }

  async getWorkOrderByEssayId(essayId, options = {}) {
    const allowForCompletedEssay = options.allowForCompletedEssay === true;
    if (this.context.user?.profile !== 'LABORATORY' && !allowForCompletedEssay) {
      throw httpError('Solo el laboratorio puede consultar las órdenes de trabajo', 403, 'LABORATORY_REQUIRED');
    }
    const workOrder = await this.workOrderRepository.findByEssayId(essayId);
    if (!workOrder) throw httpError('Orden de trabajo no encontrada', 404, 'WORK_ORDER_NOT_FOUND');
    return this._getWorkOrder(workOrder, options);
  }

  async getWorkOrdersWithSamplesByEssayId(essayId) {
    this._requireLaboratory('Solo el laboratorio puede consultar las órdenes de trabajo');
    const wo = await this.workOrderRepository.findByEssayId(essayId);
    if (!wo) return [];
    const list = Array.isArray(wo) ? wo : [wo];
    return Promise.all(list.map((item) => this._getWorkOrder(item)));
  }

  async getSamples(essayId) {
    this._requireLaboratory('Solo el laboratorio puede consultar las muestras');
    const essay = await this.essayRepository.findById(essayId, this.context.user);
    if (!essay) throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
    const samples = await this.sampleRepository.findByEssayId(essayId);
    const samplesDTO = samples.map((s) => this.mapSampleToDTO(s));
    samplesDTO.sort((a, b) => {
      if (a.countersample !== b.countersample) return a.countersample ? 1 : -1;
      return (a.code || '').localeCompare(b.code || '');
    });
    return samplesDTO;
  }

  async emitWorkOrder(essayId) {
    this._requireLaboratory('Solo el laboratorio puede emitir órdenes de trabajo');
    const uncertainty = await this._readSystemUncertainty();
    if (!uncertainty || uncertainty.value == null) {
      throw httpError('Incertidumbre del sistema (UNCERTAINTY) no configurada', 500, 'UNCERTAINTY_MISSING');
    }

    const workOrder = await this._runInTransaction(async () => {
      const essay = await this.essayRepository.findById(essayId, this.context.user);
      if (!essay) throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
      this.essayDomainService.validateCanCreateWorkOrder(essay.status);

      const existing = await this.workOrderRepository.findByEssayId(essayId);
      if (existing) {
        return Array.isArray(existing) ? existing[0] : existing;
      }

      const generatedAt = new Date();
      const reportDeliveryDeadline =
        essay.terms?.daysToDo != null
          ? DateTime.fromJSDate(generatedAt).plus({ days: essay.terms.daysToDo }).toISODate()
          : null;
      const woCode = await this.workOrderRepository.getNextWorkOrderCodeForDate(generatedAt);

      const createdWo = await this.workOrderRepository.create({
        essay_id: essayId,
        code: woCode,
        essay_track_code: essay.code,
        report_delivery_deadline: reportDeliveryDeadline,
        generated_at: generatedAt,
        observations: essay.observations || null,
        internal_aconditioning: false,
        uncertainty: uncertainty.value,
        status: 'WAITING_SAMPLES'
      });

      essay.markAsInWork();
      await this.essayRepository.update(essay);

      try {
        await this.essayAuditLogService.logWorkOrderEvent(
          createdWo.id,
          WorkOrderAuditEvent.EMITTED,
          this.context.user,
          null
        );
      } catch (err) {
        if (this.context.logger) this.context.logger.error('Error al registrar auditoría de orden emitida:', err);
      }

      return createdWo;
    });

    return WorkOrderDTO.fromEntity(workOrder);
  }

  mapEssayToPlain(essay) {
    return {
      id: essay.id,
      code: essay.code,
      status: essay.status,
      type: essay.type,
      requestDate: essay.requestDate,
      observations: essay.observations
    };
  }

  async receiveSamples(essayId, data) {
    this._requireLaboratory('Solo el laboratorio puede registrar recepción de muestras');

    if (!data.accepted) {
      const cancelledResult = await this._runInTransaction(async () => {
        const essay = await this.essayRepository.findById(essayId, this.context.user);
        if (!essay) throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
        this.essayPermissionService.validateCanCreateWorkOrder(essay.status);

        if (data.observations && typeof data.observations === 'string' && data.observations.trim()) {
          essay.appendObservations(data.observations.trim());
        }
        essay.switchStatus('CANCELLED');
        await this.essayRepository.update(essay);
        try {
          await this.essayAuditLogService.logEvent(essayId, EssayAuditEvent.ESSAY_CANCELLED, this.context.user, {
            reason: 'samples_not_accepted'
          });
        } catch (err) {
          if (this.context.logger) this.context.logger.error('Error al registrar auditoría de cancelación:', err);
        }
        return { cancelled: true, essay: this.mapEssayToPlain(essay) };
      });

      await Promise.allSettled([
        this._notifyClientStatusChange(essayId, 'CANCELLED', data.observations || 'Muestras no aceptadas')
      ]);
      return cancelledResult;
    }

    const samplesCount = Math.max(0, parseInt(data.samples_count, 10) || 0);
    const countersamplesCount = Math.max(0, parseInt(data.countersamples_count, 10) || 0);
    if (samplesCount === 0 && countersamplesCount === 0) {
      throw httpError(
        'Debe indicar al menos una muestra o una contramuestra (samples_count o countersamples_count > 0)',
        400,
        'SAMPLES_COUNT_REQUIRED'
      );
    }
    if (samplesCount + countersamplesCount > 200) {
      throw httpError('La cantidad total de muestras y contramuestras no puede superar 200', 400, 'SAMPLES_LIMIT_EXCEEDED');
    }

    const uncertainty = await this._readSystemUncertainty();

    // Fase 1: Transacción SQL rápida (sin Puppeteer ni R2 adentro)
    const { workOrder, savedSamples, elementProduct } = await this._runInTransaction(async () => {
      const essay = await this.essayRepository.findById(essayId, this.context.user);
      if (!essay) throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
      this.essayPermissionService.validateCanCreateWorkOrder(essay.status);

      const generatedAt = new Date();
      const woCode = await this.workOrderRepository.getNextWorkOrderCodeForDate(generatedAt);
      const dateCode = woCode;
      const reportDeliveryDeadline =
        essay.terms?.daysToDo != null
          ? DateTime.fromJSDate(generatedAt).plus({ days: essay.terms.daysToDo }).toISODate()
          : null;
      const dim = data.dimensions || {};
      const height = dim.height != null ? Math.round(parseFloat(dim.height) * 10) / 10 : null;
      const width = dim.width != null ? Math.round(parseFloat(dim.width) * 10) / 10 : null;
      const thickness =
        dim.thickness != null
          ? Math.round(parseFloat(dim.thickness) * 10) / 10
          : dim.large != null
          ? Math.round(parseFloat(dim.large) * 10) / 10
          : null;
      const sampleDimensionsStr = this.formatSampleDimensions({ height, width, thickness });
      const internalConditioning = data.internal_conditioning === true;
      const observations = data.observations ?? null;

      const createdWo = await this.workOrderRepository.create({
        essay_id: essayId,
        code: woCode,
        essay_track_code: essay.code,
        report_delivery_deadline: reportDeliveryDeadline,
        samples_received_at: generatedAt,
        sample_dimensions: sampleDimensionsStr || null,
        sample_width: width,
        sample_height: height,
        sample_thickness: thickness,
        generated_at: generatedAt,
        observations,
        internal_aconditioning: internalConditioning,
        uncertainty: uncertainty?.value ?? null,
        status: 'ANALYZING'
      });

      const samples = [];
      for (let i = 1; i <= samplesCount; i++) {
        const formattedCode = this.sampleDomainService.generateSampleCode(dateCode, i, false);
        samples.push(
          new this.sample({
            essayId,
            workOrderId: createdWo.id,
            status: new SampleStatus(SampleStatus.PENDING),
            code: formattedCode,
            dateCode,
            correlative: i,
            countersample: false,
            receivedAt: generatedAt,
            accepted: true,
            internalConditioning,
            observations,
            height,
            width,
            thickness
          })
        );
      }
      for (let i = 1; i <= countersamplesCount; i++) {
        const formattedCode = this.sampleDomainService.generateSampleCode(dateCode, i, true);
        samples.push(
          new this.sample({
            essayId,
            workOrderId: createdWo.id,
            status: new SampleStatus(SampleStatus.PENDING),
            code: formattedCode,
            dateCode,
            correlative: i,
            countersample: true,
            receivedAt: generatedAt,
            accepted: true,
            internalConditioning,
            observations,
            height,
            width,
            thickness
          })
        );
      }

      const persistedSamples = await this.sampleRepository.saveMany(samples);
      essay.markAsInWork();
      await this.essayRepository.update(essay);

      try {
        const sampleCodes = persistedSamples.map((s) => s.code);
        await this.essayAuditLogService.logEvent(essayId, EssayAuditEvent.SAMPLES_RECEIVED, this.context.user, {
          samplesCount: persistedSamples.length,
          sampleCodes
        });
        await this.essayAuditLogService.logWorkOrderEvent(
          createdWo.id,
          WorkOrderAuditEvent.SAMPLES_RECEIVED,
          this.context.user,
          { samplesCount: persistedSamples.length, sampleCodes }
        );
      } catch (err) {
        if (this.context.logger) {
          this.context.logger.error('Error al registrar auditoría de recepción de muestras:', err);
        }
      }

      return {
        workOrder: createdWo,
        savedSamples: persistedSamples,
        elementProduct: essay.elements?.product ?? null
      };
    });

    // Fase 2: Registrar documento F-PC16-01 en BD sin generar ni almacenar PDF (se genera On The Fly al descargar)
    const samplesDTO = savedSamples.map((s) => this.mapSampleToDTO(s));
    try {
      await this.documentService.registerDocument({
        essayId,
        form: 'F-PC16-01',
        user: this.context.user
      });
    } catch (docErr) {
      if (this.context?.logger) {
        this.context.logger.error('Error al registrar metadatos de documento F-PC16-01:', docErr);
      }
    }

    await Promise.allSettled([this._notifyClientStatusChange(essayId, 'IN_WORK')]);

    return {
      cancelled: false,
      workOrder: WorkOrderDTO.fromEntity(workOrder),
      samples: samplesDTO
    };
  }

  /**
   * Alias de compatibilidad para `/essays/samples/load`.
   */
  async loadSamples(essayId, data) {
    return this.receiveSamples(essayId, data);
  }

  /**
   * Lista todas las órdenes de trabajo en 2 consultas SQL (sin N+1 por ensayo).
   */
  async getAllWorkOrders(filters = {}) {
    this._requireLaboratory('Solo el laboratorio puede consultar las órdenes de trabajo');

    const workOrders = await this.workOrderRepository.findAll(filters);
    if (workOrders.length === 0) return [];

    const essayMap = new Map();
    if (this.essayRepository && typeof this.essayRepository.findByIds === 'function') {
      const essayIds = workOrders.map((wo) => wo.essayId).filter(Boolean);
      const essays = await this.essayRepository.findByIds(essayIds, this.context.user);
      for (const essay of essays) {
        essayMap.set(essay.id, essay);
      }
    }

    return workOrders.map((wo) => {
      let extra = {};
      const essay = wo.essayId ? essayMap.get(wo.essayId) : null;
      if (essay) {
        const product = essay.elements?.product;
        const typeName =
          essay.type?.name ?? (typeof essay.type === 'object' && essay.type !== null ? essay.type.name : null);
        const clientName =
          essay.client?.name ?? essay.client?.business?.name ?? essay.client?.bussiness?.name ?? null;
        const applicantName =
          essay.client?.contact?.name ??
          essay.client?.representativeEntity?.name ??
          essay.client?.representative?.name ??
          null;

        extra = {
          element_to_test: product ?? typeName ?? null,
          essay_type: typeName ?? null,
          client_name: clientName,
          applicant_name: applicantName,
          client: essay.client
            ? {
                id: essay.client.id,
                name: clientName,
                cuit: essay.client.cuit,
                representative:
                  essay.client.representativeEntity?.name ?? essay.client.representative?.name ?? null,
                contact: essay.client.contact?.name ?? null
              }
            : null
        };
      }
      return WorkOrderDTO.fromEntity(wo, extra);
    });
  }

  async loadSampleResults({ workOrderId, samples: samplesResults }) {
    this._requireLaboratory('Solo el laboratorio puede cargar resultados de muestras');
    if (!workOrderId || (typeof workOrderId === 'string' && workOrderId.trim() === '')) {
      throw httpError('ID de orden de trabajo no válido', 400, 'INVALID_WORK_ORDER_ID');
    }
    if (!Array.isArray(samplesResults) || samplesResults.length === 0) {
      throw httpError('Debe proporcionar un array de muestras con sus resultados', 400, 'SAMPLES_REQUIRED');
    }

    this.essayPermissionService.validateCanLoadSampleResults(this.context.user.profile);

    return this._runInTransaction(async () => {
      const workOrder = await this.workOrderRepository.findById(workOrderId);
      if (!workOrder) {
        throw httpError('Orden de trabajo no encontrada', 404, 'WORK_ORDER_NOT_FOUND');
      }
      if (!workOrder.essayId) {
        throw httpError('La orden de trabajo no tiene ensayo asociado', 400, 'WORK_ORDER_ORPHAN');
      }

      const essay = await this.essayRepository.findById(workOrder.essayId, this.context.user);
      if (!essay) {
        throw httpError('No autorizado para acceder al ensayo de la orden de trabajo', 403, 'FORBIDDEN');
      }

      const woSamples = await this.sampleRepository.findByWorkOrderId(workOrderId);
      if (!Array.isArray(woSamples) || woSamples.length === 0) {
        throw httpError('La orden de trabajo no tiene muestras registradas', 400, 'NO_SAMPLES_REGISTERED');
      }

      const sampleMap = new Map(woSamples.map((s) => [s.id, s]));
      const updatedSamples = [];

      for (const item of samplesResults) {
        const { id, result } = item;
        if (!id) {
          throw httpError('Falta id de muestra en uno de los elementos', 400, 'SAMPLE_ID_REQUIRED');
        }

        const sample = sampleMap.get(id);
        if (!sample) {
          throw httpError(`La muestra ${id} no pertenece a la orden de trabajo indicada`, 400, 'SAMPLE_MISMATCH');
        }

        const numericResult = result !== null && result !== undefined && result !== '' ? Number(result) : null;
        if (numericResult !== null && !Number.isFinite(numericResult)) {
          throw httpError(`El resultado debe ser un número finito válido para la muestra ${id}`, 400, 'INVALID_RESULT');
        }

        sample.setResult(numericResult);
        const updated = await this.sampleRepository.update(sample);
        updatedSamples.push(this.mapSampleToDTO(updated));
      }

      const withResult = woSamples.filter((s) => s.result != null && s.result !== '');
      const now = new Date();
      const woUpdateData = { last_update: now };
      if (withResult.length > 0) {
        const sum = withResult.reduce((acc, s) => acc + parseFloat(s.result), 0);
        woUpdateData.average_value = parseFloat((sum / withResult.length).toFixed(4));
      }
      await this.workOrderRepository.update(workOrderId, woUpdateData);
      if (workOrder.essayId && this.essayRepository) {
        await this.essayRepository.updateLastUpdate(workOrder.essayId, now);
      }

      try {
        await this.essayAuditLogService.logEvent(
          workOrder.essayId,
          EssayAuditEvent.RESULTS_LOADED,
          this.context.user,
          { samplesCount: updatedSamples.length }
        );
        await this.essayAuditLogService.logWorkOrderEvent(
          workOrderId,
          WorkOrderAuditEvent.RESULTS_LOADED,
          this.context.user,
          { samplesCount: updatedSamples.length }
        );
      } catch (err) {
        if (this.context.logger) {
          this.context.logger.error('Error al registrar auditoría de carga de resultados:', err);
        }
      }

      return updatedSamples;
    });
  }

  mapSampleToDTO(sample) {
    const round1 = (v) => (v != null && !isNaN(parseFloat(v)) ? Math.round(parseFloat(v) * 10) / 10 : v);
    return new SampleDTO({
      id: sample.id,
      essayId: sample.essayId,
      status: sample.status?.value ?? sample.status,
      code: sample.code,
      dateCode: sample.dateCode,
      correlative: sample.correlative,
      countersample: sample.countersample,
      receivedAt: sample.receivedAt,
      accepted: sample.accepted,
      internalConditioning: sample.internalConditioning,
      observations: sample.observations,
      result: sample.result,
      height: round1(sample.height),
      width: round1(sample.width),
      thickness: round1(sample.thickness)
    });
  }

  formatSampleDimensions(dim) {
    if (!dim) return null;
    const h = dim.height != null && dim.height !== '' ? Number(dim.height) : null;
    const w = dim.width != null && dim.width !== '' ? Number(dim.width) : null;
    const t = dim.thickness != null && dim.thickness !== '' ? Number(dim.thickness) : null;
    if (h == null && w == null && t == null) return null;
    const parts = [h, w, t].filter((n) => n != null && !isNaN(n));
    return parts.length === 0 ? null : parts.join(' × ') + ' cm';
  }

  async updateEssayClient(essayId, payload) {
    await this._runInTransaction(async () => {
      const essay = await this.essayRepository.findById(essayId, this.context.user);
      if (!essay) {
        throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
      }

      if (this.context.user?.profile === 'CLIENT' && essay.status !== 'REQUESTED') {
        throw httpError(
          'Solo el laboratorio puede modificar datos del solicitante una vez evaluada la solicitud',
          403,
          'ESSAY_CLIENT_LOCKED'
        );
      }

      const essayClient =
        this.context.user?.profile === 'CLIENT' && essay.client?.contact
          ? EssayClient.fromClient(payload, essay.client.contact)
          : EssayClient.fromClient(payload);
      await this.essayRepository.updateEssayClient(essayId, essayClient);
      try {
        await this.essayAuditLogService.logEvent(
          essayId,
          EssayAuditEvent.ESSAY_CLIENT_UPDATED,
          this.context.user,
          null
        );
      } catch (err) {
        if (this.context.logger) {
          this.context.logger.error('Error al registrar auditoría de actualización de solicitante:', err);
        }
      }
    });

    return this.getEssay(essayId);
  }

  async createEssay(data) {
    if (!this.elementTemplateService) {
      throw httpError('Servicio de plantillas de elemento no disponible', 500, 'TEMPLATE_SERVICE_MISSING');
    }
    const templateId = data?.elements?.template ?? data?.elements?.templateId ?? data?.elements?.id;
    if (!templateId) {
      throw httpError(
        'El ID de la plantilla de elemento es requerido (elements.template, elements.templateId o elements.id)',
        400,
        'TEMPLATE_ID_REQUIRED'
      );
    }
    const template = await this.elementTemplateService.getElementTemplate(templateId);
    if (!template) {
      throw httpError('Plantilla de elemento no encontrada o no disponible para este usuario', 404, 'TEMPLATE_NOT_FOUND');
    }

    const elements = {
      product: template.product ?? '',
      manufacturer: template.manufacturer ?? '',
      date: data?.elements?.date,
      country: template?.country?.id ?? 'AR',
      batch_number: data?.elements?.batch_number ?? data?.elements?.batchNumber ?? null
    };

    await this.essayDomainService.validateEssayElements(elements);

    const currentUser = this.context?.user;

    // Fase 1: Persistencia atómica en PostgreSQL (sin Puppeteer ni R2 adentro)
    const savedEssay = await this._runInTransaction(async () => {
      let clientId = data.client;
      let contactOverride = null;

      if (currentUser?.profile === 'CLIENT') {
        const userPerson = await this.personService.getMyPersonProfile();
        if (!userPerson) {
          throw httpError('No se encontró el perfil de solicitante del usuario', 400, 'PERSON_PROFILE_MISSING');
        }
        contactOverride = userPerson;

        if (data.isSelf || !clientId) {
          const userClients = await this.clientRepository.findAllByUserAndOrigin(currentUser.id, 'CLIENT');
          const cleanDni = userPerson?.dni ? String(userPerson.dni).replace(/\D/g, '') : '';
          const personName = (userPerson?.name || '').trim().toLowerCase();

          let selfClient = userClients.find((c) => {
            const cCuit = String(c.cuit || '').replace(/\D/g, '');
            const cName = (c.name || '').trim().toLowerCase();
            const cContactId = c.contactId || (c.contact && typeof c.contact === 'object' ? c.contact.id : c.contact);
            return (
              (cleanDni && (cCuit === cleanDni || cCuit.includes(cleanDni))) ||
              (userPerson?.id && cContactId && String(cContactId) === String(userPerson.id)) ||
              (personName && cName === personName)
            );
          });
          if (!selfClient && userClients.length > 0) {
            selfClient = userClients[0];
          }
          if (!selfClient) {
            const validCuit = dniToValidCuit(userPerson.dni || '00000000');
            const prov = userPerson.district?.id || userPerson.district || 'AR-C';
            selfClient = await this.clientService.createClient(
              {
                cuit: validCuit,
                name: userPerson.name || currentUser.name || 'Cliente Particular',
                address: {
                  address: userPerson.address || 'Domicilio del solicitante',
                  location: userPerson.location || 'Localidad',
                  province: prov,
                  district: prov
                },
                contact: userPerson.id
              },
              currentUser
            );
          }
          clientId = selfClient.id;
        }
      } else if (data.contact || data.contactId) {
        const cId = data.contactId || (typeof data.contact === 'string' ? data.contact : data.contact?.id);
        if (cId) {
          contactOverride = await this.personService.getPerson(cId);
        }
      }

      const client = await this.clientService.getClient(clientId);
      if (!client) {
        throw httpError(
          'Cliente no encontrado, debe crear el cliente antes de crear el ensayo',
          404,
          'CLIENT_NOT_FOUND'
        );
      }

      if (!client.address || typeof client.address !== 'object') {
        client.address = {
          address: 'Domicilio no informado',
          location: 'Localidad no informada',
          province: 'AR-C',
          district: 'AR-C'
        };
      } else {
        if (!client.address.address) client.address.address = 'Domicilio no informado';
        if (!client.address.location) client.address.location = 'Localidad no informada';
        if (!client.address.province && !client.address.district) {
          client.address.province = 'AR-C';
          client.address.district = 'AR-C';
        }
      }

      if (contactOverride?.id && client.id) {
        await this.clientRepository.addContactToClient(client.id, contactOverride.id);
      }

      this.essayDomainService.validateClientDataForEssay(client);

      if (this.essayPermissionService.shouldRemoveBillingAmount(currentUser.profile) && data.billing?.amount) {
        delete data.billing.amount;
      }

      const code = await this.essayRepository.getNextEssayCodeForDate(new Date());

      const clientNotificationsEnabled =
        data.client_notifications_enabled !== undefined
          ? Boolean(data.client_notifications_enabled)
          : data.clientNotificationsEnabled !== undefined
          ? Boolean(data.clientNotificationsEnabled)
          : true;

      const essay = new this.essay({
        type: data.essay,
        code,
        observations: data.observations,
        status: 'REQUESTED',
        requestDate: new Date(),
        elements,
        clientNotificationsEnabled
      });

      const persisted = await this.essayRepository.save(essay);

      const essayClient = EssayClient.fromClient(client, contactOverride);
      await this.essayRepository.saveEssayClient(persisted.id, essayClient);

      try {
        await this.essayAuditLogService.logEvent(
          persisted.id,
          EssayAuditEvent.ESSAY_CLIENT_UPDATED,
          currentUser,
          { initial: true }
        );
        await this.essayAuditLogService.logEvent(
          persisted.id,
          EssayAuditEvent.REQUEST_CREATED,
          currentUser,
          { profile: currentUser.profile }
        );
      } catch (error) {
        if (this.context.logger) {
          this.context.logger.error('Error al registrar auditoría de creación de ensayo:', error);
        }
      }

      return persisted;
    });

    // Fase 2: Registrar documento F-PC13-01 sin generar PDF en disco/R2 (On The Fly)
    const essayData = await this.getEssay(savedEssay.id);
    try {
      const doc = await this.documentService.registerDocument({
        essayId: savedEssay.id,
        form: 'F-PC13-01',
        user: this.context.user
      });
      if (doc && Array.isArray(essayData.documents)) {
        essayData.documents.push(doc);
      }
    } catch (docErr) {
      if (this.context?.logger) {
        this.context.logger.error('Error al registrar metadatos de documento F-PC13-01:', docErr);
      }
    }

    // Fase 3: Capturar snapshot criptográfica inmutable con hash firmado y OpenTimestamps
    try {
      await this.snapshotService.takeSnapshot({
        essayId: savedEssay.id,
        essayData,
        documentType: 'F-PC13-01',
        eventCode: EssayAuditEvent.REQUEST_CREATED,
        user: currentUser,
        req: this.context?.req || this.context?.request
      });
    } catch (snapErr) {
      if (this.context?.logger) {
        this.context.logger.warn('Error al registrar snapshot de solicitud F-PC13-01:', snapErr?.message);
      }
    }

    // Disparar y aguardar notificaciones de nueva solicitud antes de finalizar la respuesta (serverless-safe)
    const notifications = [this._notifyLaboratoryNewRequest(savedEssay.id)];
    if (savedEssay.clientNotificationsEnabled) {
      notifications.unshift(this._notifyClientStatusChange(savedEssay.id, 'REQUESTED'));
    }
    await Promise.allSettled(notifications);

    return essayData;
  }

  async acceptEssay(id) {
    const result = await this._runInTransaction(async () => {
      const essay = await this.essayRepository.findById(id, this.context.user);
      if (!essay) {
        throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
      }

      this.essayPermissionService.validateCanAcceptOrRejectEssay(this.context.user?.profile, essay.status);

      essay.accept();
      await this.essayRepository.update(essay);

      try {
        await this.essayAuditLogService.logEvent(id, EssayAuditEvent.REQUEST_APPROVED, this.context.user, null);
      } catch (error) {
        if (this.context.logger) {
          this.context.logger.error('Error al registrar auditoría de aprobación de ensayo:', error);
        }
      }

      return this.mapToDTO(essay, this.context.user);
    });

    await Promise.allSettled([this._notifyClientStatusChange(id, 'ACCEPTED')]);

    return result;
  }

  async rejectEssay(id, observations) {
    const result = await this._runInTransaction(async () => {
      const essay = await this.essayRepository.findById(id, this.context.user);
      if (!essay) {
        throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
      }

      this.essayPermissionService.validateCanAcceptOrRejectEssay(this.context.user?.profile, essay.status);

      if (observations && typeof observations === 'string' && observations.trim()) {
        essay.appendObservations(observations.trim());
      }
      essay.reject();
      await this.essayRepository.update(essay);

      try {
        await this.essayAuditLogService.logEvent(id, EssayAuditEvent.REQUEST_REJECTED, this.context.user, null);
      } catch (error) {
        if (this.context.logger) {
          this.context.logger.error('Error al registrar auditoría de rechazo de ensayo:', error);
        }
      }

      return this.mapToDTO(essay, this.context.user);
    });

    await Promise.allSettled([this._notifyClientStatusChange(id, 'REJECTED', observations)]);

    return result;
  }

  async cancelEssay(id, observations) {
    const result = await this._runInTransaction(async () => {
      const essay = await this.essayRepository.findById(id, this.context.user);
      if (!essay) {
        throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
      }

      if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(essay.status)) {
        throw httpError(`No se puede cancelar un ensayo en estado ${essay.status}`, 400, 'INVALID_ESSAY_STATE');
      }

      if (this.context.user?.profile === 'CLIENT' && essay.status === 'IN_WORK') {
        throw httpError(
          'Solo el laboratorio puede cancelar un ensayo que ya se encuentra en análisis',
          403,
          'CANCEL_FORBIDDEN'
        );
      }

      if (observations && typeof observations === 'string' && observations.trim()) {
        essay.appendObservations(observations.trim());
      }

      essay.switchStatus('CANCELLED');
      await this.essayRepository.update(essay);

      try {
        await this.essayAuditLogService.logEvent(id, EssayAuditEvent.ESSAY_CANCELLED, this.context.user, {
          reason: 'manual_cancel',
          observations: observations?.trim() || null
        });
      } catch (error) {
        if (this.context.logger) {
          this.context.logger.error('Error al registrar auditoría de cancelación de ensayo:', error);
        }
      }

      return this.mapToDTO(essay, this.context.user);
    });

    await Promise.allSettled([this._notifyClientStatusChange(id, 'CANCELLED', observations)]);

    return result;
  }

  async createContract(id, termsData) {
    this.essayPermissionService.validateCanSetTerms(this.context.user?.profile);

    // Fase 1: Actualizar términos y estado en transacción corta
    const essay = await this._runInTransaction(async () => {
      const essayEntity = await this.essayRepository.findById(id, this.context.user);
      if (!essayEntity) {
        throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
      }

      this.essayPermissionService.validateCanCreateContract(this.context.user?.profile, essayEntity.status);

      const terms = new Terms({
        daysToDo: termsData.days_to_do,
        price: termsData.price,
        samplesConservationDays: termsData.samples_conservation_days
      });

      essayEntity.setTerms(terms);
      essayEntity.createContract();
      await this.essayRepository.update(essayEntity);

      try {
        await this.essayAuditLogService.logEvent(id, EssayAuditEvent.CONTRACT_CREATED, this.context.user, null);
      } catch (error) {
        if (this.context.logger) {
          this.context.logger.error('Error al registrar auditoría de creación de contrato:', error);
        }
      }

      return essayEntity;
    });

    // Fase 2: Registrar metadatos del acuerdo F-PC13-02 sin generar PDF en disco/R2 (On The Fly)
    let doc = null;
    try {
      doc = await this.documentService.registerDocument({
        essayId: id,
        form: 'F-PC13-02',
        user: this.context.user
      });
    } catch (docErr) {
      if (this.context?.logger) {
        this.context.logger.error('Error al registrar metadatos de documento F-PC13-02:', docErr);
      }
    }

    // Fase 3: Capturar snapshot criptográfica inmutable del contrato con hash firmado y OTS
    try {
      const contractEssayData = await this.getEssay(id);
      await this.snapshotService.takeSnapshot({
        essayId: id,
        essayData: contractEssayData,
        documentType: 'F-PC13-02',
        eventCode: EssayAuditEvent.CONTRACT_CREATED,
        user: this.context.user,
        req: this.context?.req || this.context?.request
      });
    } catch (snapErr) {
      if (this.context?.logger) {
        this.context.logger.warn('Error al registrar snapshot de contrato F-PC13-02:', snapErr?.message);
      }
    }

    await Promise.allSettled([this._notifyClientStatusChange(id, 'SERVICE_AGREEMENT_MADED')]);

    return {
      id: doc?.id || id,
      documentId: doc?.id || id,
      essayId: id,
      typeCode: 'F-PC13-02',
      filename: `F-PC13-02_${essay.code || id}.pdf`
    };
  }

  async closeWorkOrderAndEmitReport(workOrderId) {
    this._requireLaboratory('Solo el laboratorio puede cerrar órdenes y emitir informes');
    const workOrder = await this.workOrderRepository.findById(workOrderId);
    if (!workOrder || !workOrder.essayId) {
      throw httpError('Orden de trabajo no encontrada', 404, 'WORK_ORDER_NOT_FOUND');
    }
    return this.emitReport(workOrder.essayId);
  }

  async emitReport(id) {
    this._requireLaboratory('Solo el laboratorio puede emitir informes de ensayo');
    if (!id || (typeof id === 'string' && id.trim() === '')) {
      throw httpError('ID del ensayo no válido', 400, 'INVALID_ESSAY_ID');
    }

    const emittedAt = new Date();
    const essayData = await this.getEssay(id, { analyzedOnly: true });
    if (!essayData) {
      throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
    }

    const essayEntity = this._dtoToEssayEntity(essayData);
    const workOrderEntity = this._dtoToWorkOrderEntity(essayData.workOrder);
    if (!workOrderEntity) {
      throw httpError(
        'No se encontró la orden de trabajo del ensayo; no se puede emitir el informe.',
        400,
        'WORK_ORDER_MISSING'
      );
    }
    workOrderEntity.validateSamplesForReport();

    const existingReports = (essayData.documents || [])
      .filter(
        (d) =>
          (d.typeDocument && d.typeDocument.code === 'F-PC15-01') ||
          d.form === 'F-PC15-01' ||
          d.formCode === 'F-PC15-01'
      )
      .map((d) => ({ ...d, generatedAt: d.generatedAt || d.generated_at }));

    const reportConfig = essayEntity.generateReportConfig({
      existingReports,
      hasModifications: essayEntity.hasModificationsSinceLastReport() || workOrderEntity.hasModifiedAfterFinish()
    });

    // Fase 1: Persistir cierre de OT, estado COMPLETED del ensayo y auditoría en transacción corta
    await this._runInTransaction(async () => {
      if (this.workOrderRepository) {
        const woUpdate = { last_update: emittedAt };
        if (!reportConfig.isModificated) {
          woUpdate.status = 'COMPLETED';
          woUpdate.closed_at = emittedAt;
        }
        await this.workOrderRepository.update(workOrderEntity.id, woUpdate);
      }

      if (essayEntity.finishDate == null) {
        essayEntity.finish(emittedAt);
      } else if (reportConfig.isModificated || reportConfig.isCopy) {
        essayEntity.lastReportGenerated = emittedAt;
        essayEntity.lastUpdate = emittedAt;
      }

      if (workOrderEntity.averageValue != null || workOrderEntity.average_value != null) {
        essayEntity.result = parseFloat(workOrderEntity.averageValue ?? workOrderEntity.average_value);
      }
      if (workOrderEntity.uncertainty != null) {
        essayEntity.uncertainty = parseFloat(workOrderEntity.uncertainty);
      }

      await this.essayRepository.update(essayEntity);

      try {
        const woSamples = Array.isArray(workOrderEntity.samples)
          ? workOrderEntity.samples
          : Array.isArray(essayData.workOrder?.samples)
          ? essayData.workOrder.samples
          : [];
        const analyzedSamples = woSamples.filter((s) => s.result != null && s.result !== '');

        const resultsSnapshot = {
          average_value:
            essayEntity.result != null
              ? Number(essayEntity.result)
              : workOrderEntity.averageValue != null
              ? Number(workOrderEntity.averageValue)
              : null,
          uncertainty:
            essayEntity.uncertainty != null
              ? Number(essayEntity.uncertainty)
              : workOrderEntity.uncertainty != null
              ? Number(workOrderEntity.uncertainty)
              : null,
          sample_dimensions:
            workOrderEntity.sampleDimensions ||
            workOrderEntity.sample_dimensions ||
            essayData.workOrder?.sample_dimensions ||
            null,
          samples_received_at:
            workOrderEntity.samplesReceivedAt ||
            workOrderEntity.samples_received_at ||
            essayData.workOrder?.samples_received_at ||
            null,
          sampleCodes: analyzedSamples.length ? analyzedSamples.map((s) => s.code).join(', ') : null,
          samples: analyzedSamples.map((s) => ({
            id: s.id,
            code: s.code,
            result: s.result != null ? Number(s.result) : null
          })),
          finishDate: essayEntity.finishDate || emittedAt
        };

        const auditMetadata = {
          isModification: reportConfig.isModificated,
          isCopy: reportConfig.isCopy,
          isNumberedCopy: reportConfig.isCopy ? reportConfig.copyNumber : false,
          resultsSnapshot
        };

        if (reportConfig.isModificated && reportConfig.originalReport?.id) {
          auditMetadata.originalDocumentId = reportConfig.originalReport.id;
        }
        if (reportConfig.isCopy && reportConfig.isNumberedCopy) {
          auditMetadata.copyNumber = reportConfig.copyNumber;
        }
        if (essayEntity.requestDate) auditMetadata.startDate = essayEntity.requestDate;
        if (essayEntity.finishDate) auditMetadata.finishDate = essayEntity.finishDate;

        await this.essayAuditLogService.logEvent(
          id,
          EssayAuditEvent.REPORT_ISSUED,
          this.context.user,
          auditMetadata,
          emittedAt
        );
      } catch (error) {
        if (this.context.logger) {
          this.context.logger.error('Error al registrar auditoría de emisión de informe:', error);
        }
      }
    });

    // Fase 2: Registrar metadatos del informe F-PC15-01 sin generar PDF en disco/R2 (On The Fly)
    let doc = null;
    try {
      doc = await this.documentService.registerDocument({
        essayId: id,
        form: 'F-PC15-01',
        user: this.context.user,
        copy: reportConfig.isCopy ? reportConfig.copyNumber : null,
        modificated: Boolean(reportConfig.isModificated)
      });
    } catch (docErr) {
      if (this.context?.logger) {
        this.context.logger.error('Error al registrar metadatos de documento F-PC15-01:', docErr);
      }
    }

    if (!reportConfig.isModificated && !reportConfig.isCopy) {
      await Promise.allSettled([this._notifyClientStatusChange(id, 'COMPLETED')]);
    }

    return {
      id: doc?.id || id,
      documentId: doc?.id || id,
      essayId: id,
      typeCode: 'F-PC15-01',
      filename: `F-PC15-01_${essayEntity.code || id}.pdf`
    };
  }

  async downloadDocumentByType(essayId, typeCode, user) {
    const effectiveUser = user || this.context?.user;
    const essay = await this.essayRepository.findById(essayId, effectiveUser);
    if (!essay) {
      throw httpError('Ensayo o documento no encontrado', 404, 'DOCUMENT_NOT_FOUND');
    }
    return this.documentService.downloadDocumentByEssayAndType(essayId, typeCode, effectiveUser);
  }

  async downloadDocument(documentId, user) {
    const effectiveUser = user || this.context?.user;
    if (!documentId) {
      throw httpError('ID de documento requerido', 400, 'DOCUMENT_ID_REQUIRED');
    }
    const docEntity = await this.documentRepository.findById(documentId);
    if (!docEntity) {
      throw httpError('Documento no encontrado', 404, 'DOCUMENT_NOT_FOUND');
    }
    const essay = await this.essayRepository.findById(docEntity.essayId, effectiveUser);
    if (!essay) {
      throw httpError('Documento no encontrado', 404, 'DOCUMENT_NOT_FOUND');
    }
    return this.documentService.downloadDocument({ id: documentId, user: effectiveUser });
  }

  async getTypes() {
    return this.essayRepository.getTypes();
  }

  _dtoToEssayEntity(dto) {
    return new Essay({
      id: dto.id,
      code: dto.code,
      client: dto.client,
      requestDate: dto.requestDate,
      finishDate: dto.finishDate,
      status: dto.status,
      result: dto.result,
      uncertainty: dto.uncertainty,
      classification: dto.classification,
      auditLogs: dto.audit_logs || [],
      elements: dto.elements || [],
      type: dto.type,
      lastUpdate: dto.last_update,
      lastReportGenerated: dto.last_report_generated ?? dto.lastReportGenerated ?? null,
      workOrder: this._dtoToWorkOrderEntity(dto.work_order ?? dto.workOrder) ?? null
    });
  }

  _dtoToWorkOrderEntity(dto) {
    if (!dto) return null;
    return new WorkOrder({
      id: dto.id,
      essayId: dto.essay_id,
      code: dto.code,
      essayTrackCode: dto.essay_track_code,
      reportDeliveryDeadline: dto.report_delivery_deadline,
      samplesReceivedAt: dto.samples_received_at,
      sampleDimensions: dto.sample_dimensions,
      sampleWidth: dto.sample_width,
      sampleHeight: dto.sample_height,
      sampleThickness: dto.sample_thickness,
      generatedAt: dto.generated_at,
      observations: dto.observations,
      internalAconditioning: dto.internal_aconditioning === true,
      uncertainty: dto.uncertainty,
      averageValue: dto.average_value,
      status: dto.status,
      closedAt: dto.closed_at,
      lastUpdate: dto.last_update,
      samples: dto.samples || []
    });
  }

  mapToDTO(essay, user, extras = {}) {
    const formatPhone = (person) => {
      if (!person) return null;
      const hasPhone = person.phone != null || person.country_code != null || person.countryCode != null;
      if (!hasPhone) return null;
      return {
        country_code: person.country_code ?? person.countryCode ?? null,
        phone: person.phone ?? null
      };
    };

    const buildContact = (person) => {
      if (!person) return null;
      return {
        id: person.id,
        name: person.name,
        dni: person.dni,
        address: person.address,
        location: person.location,
        district: person.district,
        country: person.country,
        mail: person.mail,
        phone: formatPhone(person),
        user: person.user ?? null
      };
    };

    const buildRepresentative = (rep) => {
      const r = essay.client?.representativeEntity || essay.client?.representative || rep;
      if (!r) return null;
      const rawId = (typeof r.id === 'object' && r.id !== null) ? r.id.id : r.id;
      const id = (typeof rawId === 'string' && rawId.trim() && rawId.trim() !== '[object Object]') ? rawId.trim() : null;
      const name = (typeof r.name === 'string' && r.name.trim()) ? r.name.trim() : null;
      const dni = (typeof r.dni === 'string' && r.dni.trim()) ? r.dni.trim() : (r.dni ? String(r.dni).trim() : null);
      if (!id && !name && !dni) return null;
      return {
        id,
        name,
        dni,
        district: r.district ?? null,
        country: r.country ?? null,
        phone: formatPhone(r)
      };
    };

    const client = essay.client
      ? {
          id: essay.client.id,
          cuit: essay.client.cuit,
          name: essay.client.name ?? essay.client.bussiness?.name ?? essay.client.business?.name ?? essay.client.contact?.name ?? null,
          representative: buildRepresentative(essay.client.representativeEntity || essay.client.representative),
          address: essay.client.clientAddress ?? essay.client.address ?? null,
          contact: buildContact(essay.client.contact),
          user: essay.client.user ?? null
        }
      : null;

    const contact = buildContact(essay.contact || essay.client?.contact);

    const billing = essay.billing
      ? {
          cuit: essay.billing.cuit,
          address: essay.billing.billingAddress ?? essay.billing.address,
          amount: essay.billing.amount,
          pays_iva: essay.billing.pays_iva
        }
      : null;

    const reportLogs = (extras.auditLogs || [])
      .filter((log) => log.eventCode === 'REPORT_ISSUED')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const latestReportLog = reportLogs[0];
    let reportSnapshot = latestReportLog?.metadata?.resultsSnapshot || null;

    if (!reportSnapshot && (essay.lastReportGenerated || essay.finishDate || latestReportLog)) {
      const wo = extras.workOrder;
      const analyzedSamples = wo?.samples ? wo.samples.filter((s) => s.result != null && s.result !== '') : [];
      reportSnapshot = {
        average_value:
          essay.result != null
            ? parseFloat(essay.result)
            : wo?.average_value != null
            ? parseFloat(wo.average_value)
            : null,
        uncertainty:
          essay.uncertainty != null
            ? parseFloat(essay.uncertainty)
            : wo?.uncertainty != null
            ? parseFloat(wo.uncertainty)
            : null,
        sample_dimensions: wo?.sample_dimensions ?? null,
        samples_received_at: wo?.samples_received_at ?? null,
        sampleCodes: analyzedSamples.length ? analyzedSamples.map((s) => s.code).join(', ') : null,
        samples: analyzedSamples.map((s) => ({
          id: s.id,
          code: s.code,
          result: s.result != null ? parseFloat(s.result) : null
        })),
        finishDate: essay.finishDate ?? essay.lastReportGenerated ?? null
      };
    }

    let result = null;
    let classification = null;
    if (essay.status === 'COMPLETED' || essay.finishDate || essay.lastReportGenerated) {
      const rawResult = reportSnapshot?.average_value ?? essay.result;
      if (rawResult != null) {
        result = parseFloat(rawResult);
        if (result <= 3.5) {
          classification = 'E1';
        } else if (result > 3.5 && result <= 8.0) {
          classification = 'E2';
        }
      }
    }

    const el = essay.elements;
    const elements = el
      ? {
          product: el.product,
          manufacturer: el.manufacturer,
          date: el.date,
          country: el.country ?? null,
          batch_number: el.batchNumber ?? el.batch_number ?? null
        }
      : null;

    return new EssayDTO({
      id: essay.id,
      code: essay.code,
      requestDate: essay.requestDate,
      finishDate: essay.finishDate ?? null,
      status: essay.status,
      subStatus: null,
      observations: essay.observations,
      last_update: essay.lastUpdate ?? null,
      last_report_generated: essay.lastReportGenerated ?? null,
      client,
      contact,
      type: essay.type,
      elements,
      billing,
      terms: essay.terms,
      documents: essay.documents || [],
      result,
      classification,
      samples: extras.samples || [],
      auditLogs: extras.auditLogs || [],
      workOrder: extras.workOrder ?? null,
      lastReportSnapshot: reportSnapshot,
      clientNotificationsEnabled: essay.clientNotificationsEnabled !== false
    });
  }

  /**
   * Reemite la solicitud F-PC13-01 con marca de modificación y genera la nueva snapshot auditada con OTS.
   */
  async reissueEssayRequest(essayId, reason = null) {
    const user = this.context.user;
    if (this.essayRepository && user) {
      const essay = await this.essayRepository.findById(essayId, user);
      if (!essay) {
        throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
      }
      if (['CANCELLED', 'REJECTED'].includes(essay.status)) {
        throw httpError('No se puede reemitir un ensayo cancelado o rechazado', 400, 'INVALID_ESSAY_STATE');
      }
    }

    // Registrar reemisión en DocumentService
    let doc = null;
    try {
      if (this.documentService && typeof this.documentService.registerDocument === 'function') {
        doc = await this.documentService.registerDocument({
          essayId,
          form: 'F-PC13-01',
          user,
          modificated: true
        });
      }
    } catch (docErr) {
      if (this.context?.logger) {
        this.context.logger.warn('Error al registrar reemisión de F-PC13-01:', docErr?.message);
      }
    }

    // Registrar evento de auditoría
    try {
      await this.essayAuditLogService.logEvent(
        essayId,
        'REQUEST_MODIFIED',
        user,
        { reason: reason || 'Reemisión de solicitud modificada', modificated: true }
      );
    } catch (auditErr) {
      if (this.context?.logger) {
        this.context.logger.warn('Error al auditar reemisión de solicitud:', auditErr?.message);
      }
    }

    const essayData = await this.getEssay(essayId);

    // Capturar nueva snapshot versionada con modificated: true y sellado OTS
    let snapshot = null;
    try {
      snapshot = await this.snapshotService.takeSnapshot({
        essayId,
        essayData,
        documentType: 'F-PC13-01',
        eventCode: 'REQUEST_MODIFIED',
        user,
        req: this.context?.req || this.context?.request,
        customData: {
          modificated: true,
          reissueReason: reason || null
        }
      });
    } catch (snapErr) {
      if (this.context?.logger) {
        this.context.logger.warn('Error al capturar snapshot de reemisión F-PC13-01:', snapErr?.message);
      }
    }

    return {
      message: 'Solicitud F-PC13-01 reemitida con modificación exitosamente',
      essay: essayData,
      document: doc,
      snapshot
    };
  }

  /**
   * Obtiene la lista de snapshots con hashes criptográficos y sellos OTS de un ensayo.
   */
  async getEssaySnapshots(essayId) {
    if (this.essayRepository && this.context?.user) {
      const essay = await this.essayRepository.findById(essayId, this.context.user);
      if (!essay) {
        throw httpError('Ensayo no encontrado', 404, 'ESSAY_NOT_FOUND');
      }
    }
    return this.snapshotService.getSnapshotsByEssay(essayId, { user: this.context?.user });
  }

  /**
   * Verifica la integridad criptográfica contra manipulación en DB y prueba OTS de una snapshot.
   */
  async verifyEssaySnapshot(snapshotId) {
    const result = await this.snapshotService.verifySnapshot(snapshotId, { user: this.context?.user });
    if (this.essayRepository && this.context?.user && result?.essayId) {
      const essay = await this.essayRepository.findById(result.essayId, this.context.user);
      if (!essay) {
        throw httpError('Snapshot no encontrada o sin permisos', 404, 'SNAPSHOT_NOT_FOUND');
      }
    }
    return result;
  }

  /**
   * Obtiene el archivo de prueba OpenTimestamps (.ots) para verificación independiente.
   */
  async getSnapshotOtsProof(snapshotId) {
    const proof = await this.snapshotService.getOtsProofFile(snapshotId);
    if (this.essayRepository && this.context?.user && proof?.essayId) {
      const essay = await this.essayRepository.findById(proof.essayId, this.context.user);
      if (!essay) {
        throw httpError('Snapshot no encontrada o sin permisos', 404, 'SNAPSHOT_NOT_FOUND');
      }
    }
    return proof;
  }
}

module.exports = EssayApplicationService;
