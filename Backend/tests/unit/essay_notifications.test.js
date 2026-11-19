const test = require('node:test');
const assert = require('node:assert/strict');

const Essay = require('../../src/domain/essays/entities/Essay');
const EssayAuditEvent = require('../../src/domain/essays/value-objects/EssayAuditEvent');
const EssayDTO = require('../../src/application/essays/dto/EssayDTO');
const CreateEssayDTO = require('../../src/application/essays/dto/CreateEssayDTO');
const EssayApplicationService = require('../../src/application/essays/services/EssayApplicationService');

test('Essay entity: clientNotificationsEnabled por defecto es true y se puede alternar', () => {
  const essay = new Essay({
    id: 'test-1',
    code: '2026-11-001',
    status: 'REQUESTED'
  });

  assert.equal(essay.clientNotificationsEnabled, true);
  assert.equal(essay.toPlain().clientNotificationsEnabled, true);

  essay.setClientNotifications(false);
  assert.equal(essay.clientNotificationsEnabled, false);
  assert.equal(essay.toPlain().clientNotificationsEnabled, false);

  essay.setClientNotifications(true);
  assert.equal(essay.clientNotificationsEnabled, true);
});

test('EssayAuditEvent: contiene eventos de activación y desactivación de notificaciones', () => {
  assert.equal(EssayAuditEvent.isValid(EssayAuditEvent.NOTIFICATIONS_ENABLED), true);
  assert.equal(EssayAuditEvent.isValid(EssayAuditEvent.NOTIFICATIONS_DISABLED), true);
  assert.equal(EssayAuditEvent.getDescription(EssayAuditEvent.NOTIFICATIONS_ENABLED), 'Notificaciones por correo activadas');
  assert.equal(EssayAuditEvent.getDescription(EssayAuditEvent.NOTIFICATIONS_DISABLED), 'Notificaciones por correo desactivadas');
});

test('EssayDTO: expone clientNotificationsEnabled y client_notifications_enabled', () => {
  const dto = new EssayDTO({
    id: 'test-1',
    code: '2026-11-001',
    status: 'REQUESTED',
    clientNotificationsEnabled: false,
    notificationToken: 'token-123'
  });

  assert.equal(dto.clientNotificationsEnabled, false);
  assert.equal(dto.client_notifications_enabled, false);
  assert.equal(dto.notificationToken, 'token-123');
});

test('CreateEssayDTO: recibe y preserva client_notifications_enabled', () => {
  const dtoDefault = new CreateEssayDTO({
    client: 'cli-1',
    essay: '1',
    elements: { templateId: 't-1', date: '2026-11-13' }
  });
  assert.equal(dtoDefault.client_notifications_enabled, true);
  assert.equal(dtoDefault.toPlainObject().client_notifications_enabled, true);

  const dtoDisabled = new CreateEssayDTO({
    client: 'cli-1',
    essay: '1',
    elements: { templateId: 't-1', date: '2026-11-13' },
    client_notifications_enabled: false
  });
  assert.equal(dtoDisabled.client_notifications_enabled, false);
  assert.equal(dtoDisabled.toPlainObject().client_notifications_enabled, false);
});

test('EssayApplicationService: updateNotifications cambia estado y registra evento en historial', async () => {
  let updatedEssay = null;
  const loggedEvents = [];

  const fakeEssay = new Essay({
    id: 'essay-1',
    code: '2026-11-001',
    status: 'REQUESTED',
    clientNotificationsEnabled: true
  });

  const fakeRepo = {
    findById: async () => fakeEssay,
    update: async (essay) => {
      updatedEssay = essay;
      return essay;
    }
  };

  const fakeAuditService = {
    logEvent: async (essayId, eventCode, user, metadata) => {
      loggedEvents.push({ essayId, eventCode, user, metadata });
      return true;
    }
  };

  const service = new EssayApplicationService();
  service.essayRepository = fakeRepo;
  service.essayAuditLogService = fakeAuditService;

  // 1. Desactivar notificaciones desde el sistema
  const resDisable = await service.updateNotifications('essay-1', false, { id: 'user-1', name: 'Tomas Admin' });

  assert.equal(fakeEssay.clientNotificationsEnabled, false);
  assert.equal(loggedEvents.length, 1);
  assert.equal(loggedEvents[0].eventCode, EssayAuditEvent.NOTIFICATIONS_DISABLED);
  assert.equal(loggedEvents[0].metadata.source, 'SYSTEM');
  assert.equal(loggedEvents[0].metadata.updatedBy, 'Tomas Admin');

  // 2. Reactivar notificaciones desde el sistema
  const resEnable = await service.updateNotifications('essay-1', true, { id: 'user-1', name: 'Tomas Admin' });

  assert.equal(fakeEssay.clientNotificationsEnabled, true);
  assert.equal(loggedEvents.length, 2);
  assert.equal(loggedEvents[1].eventCode, EssayAuditEvent.NOTIFICATIONS_ENABLED);
  assert.equal(loggedEvents[1].metadata.source, 'SYSTEM');
});

test('EssayApplicationService: unsubscribeByToken valida token y registra baja en historial', async () => {
  const loggedEvents = [];
  const fakeEssay = new Essay({
    id: 'essay-unsub-1',
    code: '2026-11-002',
    status: 'REQUESTED',
    clientNotificationsEnabled: true,
    notificationToken: 'secret-token-abc'
  });

  const fakeRepo = {
    findById: async () => fakeEssay,
    update: async (essay) => essay
  };

  const fakeAuditService = {
    getAuditLogs: async () => [
      { eventCode: 'REQUEST_CREATED', userId: 'applicant-user-1', userName: 'Juan Solicitante' }
    ],
    logEvent: async (essayId, eventCode, user, metadata) => {
      loggedEvents.push({ essayId, eventCode, user, metadata });
      return true;
    }
  };

  const service = new EssayApplicationService();
  service.essayRepository = fakeRepo;
  service.essayAuditLogService = fakeAuditService;

  // Intento con token erróneo
  await assert.rejects(
    () => service.unsubscribeByToken('essay-unsub-1', 'wrong-token'),
    /Token de desuscripción inválido/
  );

  // Intento con token correcto
  const result = await service.unsubscribeByToken('essay-unsub-1', 'secret-token-abc');

  assert.equal(result.success, true);
  assert.equal(fakeEssay.clientNotificationsEnabled, false);
  assert.equal(loggedEvents.length, 1);
  assert.equal(loggedEvents[0].eventCode, EssayAuditEvent.NOTIFICATIONS_DISABLED);
  assert.equal(loggedEvents[0].metadata.source, 'UNSUBSCRIBE_LINK');

  // Reintento idempotente
  const resultIdempotent = await service.unsubscribeByToken('essay-unsub-1', 'secret-token-abc');
  assert.equal(resultIdempotent.success, true);
});

test('essaysController: updateNotifications valida payload y sanitiza errores técnicos', async () => {
  const essaysController = require('../../src/presentation/controllers/essays.controller');

  // 1. Missing enabled field
  let statusCode = null;
  let jsonBody = null;
  const mockResMissing = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonBody = data;
      return this;
    }
  };

  await essaysController.updateNotifications(
    { params: { id: 'essay-1' }, body: {} },
    mockResMissing
  );

  assert.equal(statusCode, 400);
  assert.equal(jsonBody.code, 'MISSING_ENABLED_FIELD');
  assert.equal(jsonBody.message, 'El campo enabled es requerido');

  // 2. Sanitización ante error técnico (no expone detalles internos)
  const mockResError = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonBody = data;
      return this;
    }
  };

  // Simular request que desencadena un error técnico o de base de datos
  const mockReqWithTechnicalError = {
    params: { id: 'essay-tech-error' },
    body: { enabled: true },
    user: { id: 'user-1' }
  };

  await essaysController.updateNotifications(mockReqWithTechnicalError, mockResError);
  // Al no haber DB inicializada para ese ID, lanzará error pero NO debe exponer SQL ni crashear el status code
  assert.equal(typeof statusCode, 'number');
  assert.ok(statusCode >= 400 && statusCode <= 599);
  assert.ok(!/syntax error|violates foreign key|table .* does not exist|undefined/i.test(jsonBody.message));
  assert.ok(jsonBody.message.length > 0);
});

test('essaysController: unsubscribeNotifications valida parámetros requeridos', async () => {
  const essaysController = require('../../src/presentation/controllers/essays.controller');

  let statusCode = null;
  let jsonBody = null;
  const mockRes = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonBody = data;
      return this;
    }
  };

  await essaysController.unsubscribeNotifications(
    { params: {}, query: {}, body: {} },
    mockRes
  );

  assert.equal(statusCode, 400);
  assert.equal(jsonBody.code, 'INVALID_UNSUBSCRIBE_PARAMS');
  assert.equal(jsonBody.message, 'Se requiere id del ensayo y token de desuscripción');
});
