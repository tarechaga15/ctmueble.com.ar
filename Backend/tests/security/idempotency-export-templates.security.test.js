const test = require('node:test');
const assert = require('node:assert/strict');

const idempotencyMiddleware = require('../../src/presentation/middlewares/idempotency');
const {
  sanitizeFormulaValue,
  buildExportTables,
  buildCsvBuffer
} = require('../../src/application/essays/export/essaySpreadsheetExport');
const HandlebarsService = require('../../src/infrastructure/templates/HandlebarsService');
const DocumentInfrastructureService = require('../../src/infrastructure/documents/services/DocumentInfrastructureService');
const SecurityAuditService = require('../../src/application/security/SecurityAuditService');
const { createMockRes, createNextSpy } = require('../contracts/helpers');

test('idempotencyMiddleware aísla por usuario, rechaza duplicados en vuelo (409) y no cachea errores 4xx/5xx', async () => {
  idempotencyMiddleware._clearMemoryForTests();

  // 1. Petición en vuelo bloquea duplicado concurrente del mismo usuario con 409
  const reqInFlight1 = {
    method: 'POST',
    originalUrl: '/essays/create',
    headers: { 'idempotency-key': 'idem-key-1' },
    user: { id: 'user-A' },
    body: { client: 'c1' }
  };
  const resInFlight1 = createMockRes();
  const nextInFlight1 = createNextSpy();

  await idempotencyMiddleware(reqInFlight1, resInFlight1, nextInFlight1);
  assert.equal(nextInFlight1.called, true);

  // Antes de que reqInFlight1 llame a res.json(), llega otra igual de user-A -> 409
  const reqDuplicate = {
    method: 'POST',
    originalUrl: '/essays/create',
    headers: { 'idempotency-key': 'idem-key-1' },
    user: { id: 'user-A' },
    body: { client: 'c1' }
  };
  const resDuplicate = createMockRes();
  const nextDuplicate = createNextSpy();
  await idempotencyMiddleware(reqDuplicate, resDuplicate, nextDuplicate);
  assert.equal(nextDuplicate.called, false);
  assert.equal(resDuplicate.statusCode, 409);
  assert.equal(resDuplicate.body.code, 'IDEMPOTENCY_IN_PROGRESS');

  // Otro usuario distinto (user-B) con la misma Idempotency-Key NO colisiona ni ve datos de user-A
  const reqUserB = {
    method: 'POST',
    originalUrl: '/essays/create',
    headers: { 'idempotency-key': 'idem-key-1' },
    user: { id: 'user-B' },
    body: { client: 'c1' }
  };
  const resUserB = createMockRes();
  const nextUserB = createNextSpy();
  await idempotencyMiddleware(reqUserB, resUserB, nextUserB);
  assert.equal(nextUserB.called, true);
  resUserB.status(201).json({ essayId: 'owned-by-B' });

  // Finaliza user-A con 201 -> queda cacheado solo para user-A
  resInFlight1.status(201).json({ essayId: 'owned-by-A' });

  const reqReplayA = {
    method: 'POST',
    originalUrl: '/essays/create',
    headers: { 'idempotency-key': 'idem-key-1' },
    user: { id: 'user-A' },
    body: { client: 'c1' }
  };
  const resReplayA = createMockRes();
  const nextReplayA = createNextSpy();
  await idempotencyMiddleware(reqReplayA, resReplayA, nextReplayA);
  assert.equal(nextReplayA.called, false);
  assert.equal(resReplayA.statusCode, 201);
  assert.deepEqual(resReplayA.body, { essayId: 'owned-by-A' });
  assert.equal(resReplayA.headers['X-Idempotent-Replayed'], 'true');

  // 2. Respuesta 400/500 NO debe cachearse: permite reintentar con la misma clave
  const reqFail = {
    method: 'POST',
    originalUrl: '/essays/create',
    headers: { 'idempotency-key': 'idem-key-error' },
    user: { id: 'user-A' },
    body: { client: 'c1' }
  };
  const resFail = createMockRes();
  const nextFail = createNextSpy();
  await idempotencyMiddleware(reqFail, resFail, nextFail);
  resFail.status(500).json({ error: 'Fallo transitorio' });

  const reqRetry = { ...reqFail };
  const resRetry = createMockRes();
  const nextRetry = createNextSpy();
  await idempotencyMiddleware(reqRetry, resRetry, nextRetry);
  assert.equal(nextRetry.called, true);
});

test('essaySpreadsheetExport neutraliza Formula/CSV Injection conservando números negativos legítimos', () => {
  assert.equal(sanitizeFormulaValue('=CMD|\' /C calc\'!A0'), "'=CMD|' /C calc'!A0");
  assert.equal(sanitizeFormulaValue('+SUM(A1:A10)'), "'+SUM(A1:A10)");
  assert.equal(sanitizeFormulaValue('@IMPORTXML("http://evil")'), "'@IMPORTXML(\"http://evil\")");
  assert.equal(sanitizeFormulaValue('-HYPERLINK("http://evil")'), "'-HYPERLINK(\"http://evil\")");
  assert.equal(sanitizeFormulaValue('  =1+1'), "'  =1+1");
  assert.equal(sanitizeFormulaValue('-12.50'), '-12.50');
  assert.equal(sanitizeFormulaValue(42), 42);

  const tables = buildExportTables(
    [
      {
        id: 'e1',
        code: 'E-01',
        status: 'REQUESTED',
        observations: '=HYPERLINK("https://evil.example","Click")',
        client: { id: 'c1', cuit: '30712345678', name: '+Malicious Corp' }
      }
    ],
    new Map(),
    { profile: 'LABORATORY' }
  );
  const csv = buildCsvBuffer(tables);
  assert.match(csv, /"'=HYPERLINK\(""|'=HYPERLINK/);
  assert.match(csv, /\+Malicious Corp/);
  assert.ok(csv.includes("'+Malicious Corp"));
});

test('HandlebarsService, DocumentInfrastructureService y SecurityAuditService bloquean traversal y redactan secretos', () => {
  const hbs = new HandlebarsService();
  const compiled = hbs.handlebars.compile(
    '{{#if (and billing.cuit (ne billing.cuit client.cuit))}}FACT:{{billing.cuit}}{{/if}}|{{formatDate d "dd/MM/YYYY"}}|{{formatDate d "dd/mm/yyyy"}}'
  );
  const rendered = compiled({
    billing: { cuit: '30999999997' },
    client: { cuit: '30111111118' },
    d: new Date('2026-05-09T12:00:00Z')
  });
  assert.equal(rendered, 'FACT:30999999997|09/05/2026|09/05/2026');

  assert.throws(() => hbs.loadTemplate('../../package.json'), /fuera del directorio permitido/);

  const docInfra = new DocumentInfrastructureService();
  assert.throws(
    () => docInfra.getDocumentFilePath('../../.env', docInfra.getStorageDirectory()),
    (err) => err.status === 400 && err.code === 'INVALID_DOCUMENT_PATH'
  );

  const redacted = SecurityAuditService.redact({
    mail: 'user@ctm.ar',
    password: 'SuperSecretPassword123!',
    nested: {
      refresh_token: 'secret-jwt',
      authorization: 'Bearer abc',
      safeField: 'visible'
    }
  });
  assert.equal(redacted.mail, 'user@ctm.ar');
  assert.equal(redacted.password, '[REDACTED]');
  assert.equal(redacted.nested.refresh_token, '[REDACTED]');
  assert.equal(redacted.nested.authorization, '[REDACTED]');
  assert.equal(redacted.nested.safeField, 'visible');
});
