/**
 * Servicio de aplicación para gestionar registros de auditoría de ensayos y órdenes de trabajo.
 * Verifica permisos y pertenencia (prevención de IDOR) antes de exponer bitácoras.
 */
const EssayAuditEvent = require('../../../domain/essays/value-objects/EssayAuditEvent');
const WorkOrderAuditEvent = require('../../../domain/essays/value-objects/WorkOrderAuditEvent');
const { extractDeviceInfo } = require('../../../infrastructure/auth/utils/deviceInfo');

class EssayAuditLogApplicationService {
  constructor({ context } = {}) {
    this.context = context || {};
  }

  async logEvent(essayId, eventCode, user, metadata = null, timestamp = null) {
    if (!EssayAuditEvent.isValid(eventCode)) {
      throw new Error(`Código de evento inválido: ${eventCode}`);
    }
    const req = this.context?.req || this.context?.request;
    const device = extractDeviceInfo(req);

    const auditLog = await this.essayAuditLog.create(
      essayId,
      user.id,
      user.name || user.mail || 'Usuario desconocido',
      eventCode,
      metadata,
      timestamp || null,
      device
    );
    const saved = await this.essayAuditLogRepository.save(auditLog);
    if (this.essayRepository && saved) {
      try {
        await this.essayRepository.updateLastUpdate(essayId, auditLog.timestamp);
      } catch (err) {
        if (this.context.logger) {
          this.context.logger.warn('Error al actualizar last_update del ensayo:', err?.message);
        }
      }
    }
    return saved;
  }

  _formatEssayAuditEntry(log) {
    const isClient = this.context?.user?.profile === 'CLIENT';
    const rawSessionId = log.sessionId || null;
    const maskedSession = rawSessionId
      ? (String(rawSessionId).length > 8 ? `${String(rawSessionId).slice(0, 8)}...` : '***')
      : null;

    return {
      id: log.id,
      essayId: log.essayId,
      userId: log.userId,
      userName: log.userName,
      eventCode: log.eventCode,
      eventDescription: EssayAuditEvent.getDescription(log.eventCode),
      timestamp: log.timestamp,
      metadata: log.metadata,
      deviceId: isClient ? null : (log.deviceId || null),
      deviceFingerprint: isClient ? null : (log.deviceFingerprint || null),
      clientName: log.clientName || null,
      ipAddress: isClient ? null : (log.ipAddress || null),
      userAgent: isClient ? null : (log.userAgent || null),
      sessionId: isClient ? null : maskedSession,
      recordHash: log.recordHash || null,
      signature: log.signature || null,
      previousHash: log.previousHash || null
    };
  }

  async getAuditLogs(essayId) {
    if (this.essayRepository && this.context?.user) {
      const essay = await this.essayRepository.findById(essayId, this.context.user);
      if (!essay) {
        const err = new Error('Ensayo no encontrado');
        err.status = 404;
        err.code = 'ESSAY_NOT_FOUND';
        throw err;
      }
    }
    const auditLogs = await this.essayAuditLogRepository.findByEssayId(essayId);
    return auditLogs.map((log) => this._formatEssayAuditEntry(log));
  }

  async getAuditLogById(id) {
    const auditLog = await this.essayAuditLogRepository.findById(id);
    if (!auditLog) return null;
    if (this.essayRepository && this.context?.user) {
      const essay = await this.essayRepository.findById(auditLog.essayId, this.context.user);
      if (!essay) {
        const err = new Error('Registro de auditoría no encontrado');
        err.status = 404;
        throw err;
      }
    }
    return this._formatEssayAuditEntry(auditLog);
  }

  async logWorkOrderEvent(workOrderId, eventCode, user, metadata = null) {
    if (!this.workOrderAuditLogRepository || !this.workOrderAuditLog) return null;
    if (!user || !user.id) return null;
    if (!WorkOrderAuditEvent.isValid(eventCode)) {
      throw new Error(`Código de evento de orden de trabajo inválido: ${eventCode}`);
    }
    const userName = (user && (user.name || user.mail)) || 'Usuario desconocido';
    const auditLog = await this.workOrderAuditLog.create(workOrderId, user.id, userName, eventCode, metadata);
    const saved = await this.workOrderAuditLogRepository.save(auditLog);
    if (this.workOrderRepository && saved) {
      try {
        await this.workOrderRepository.update(workOrderId, { last_update: new Date() });
      } catch (err) {
        if (this.context.logger) {
          this.context.logger.warn('Error al actualizar last_update de la orden de trabajo:', err?.message);
        }
      }
    }
    return saved;
  }

  async getWorkOrderAuditLogs(workOrderId) {
    if (this.context?.user && this.context.user.profile !== 'LABORATORY') {
      const err = new Error('Solo el laboratorio puede consultar la auditoría de órdenes de trabajo');
      err.status = 403;
      err.code = 'LABORATORY_REQUIRED';
      throw err;
    }
    if (!this.workOrderAuditLogRepository) return [];
    const logs = await this.workOrderAuditLogRepository.findByWorkOrderId(workOrderId);
    return logs.map((log) => ({
      id: log.id,
      workOrderId: log.workOrderId,
      userId: log.userId,
      userName: log.userName,
      eventCode: log.eventCode,
      eventDescription: WorkOrderAuditEvent.getDescription(log.eventCode),
      timestamp: log.timestamp,
      metadata: log.metadata
    }));
  }
}

module.exports = EssayAuditLogApplicationService;
