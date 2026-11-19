const test = require('node:test');
const assert = require('node:assert/strict');

const Essay = require('../../src/domain/essays/entities/Essay');
const EssayApplicationService = require('../../src/application/essays/services/EssayApplicationService');

test('EssayApplicationService.createContract devuelve metadata y filename usando essay.code sin ReferenceError', async () => {
  const fakeEssay = new Essay({
    id: 'essay-123',
    code: '2026-11-001',
    status: 'ACCEPTED'
  });

  const service = new EssayApplicationService({
    user: { id: 'user-1', profile: 'LABORATORY' }
  });

  service.essayPermissionService = {
    validateCanSetTerms: () => {},
    validateCanCreateContract: () => {}
  };
  service._runInTransaction = async (fn) => fn();
  service.essayRepository = {
    findById: async () => fakeEssay,
    update: async (essay) => essay
  };
  service.essayAuditLogService = {
    logEvent: async () => true
  };
  service.documentService = {
    registerDocument: async () => ({ id: 'doc-456' })
  };
  service.getEssay = async () => ({ id: 'essay-123', code: '2026-11-001' });
  service.snapshotService = {
    takeSnapshot: async () => true
  };
  service._notifyClientStatusChange = async () => {};

  const result = await service.createContract('essay-123', {
    days_to_do: 10,
    price: 50000,
    samples_conservation_days: 30
  });

  assert.deepEqual(result, {
    id: 'doc-456',
    documentId: 'doc-456',
    essayId: 'essay-123',
    typeCode: 'F-PC13-02',
    filename: 'F-PC13-02_2026-11-001.pdf'
  });
});
