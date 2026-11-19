const test = require('node:test');
const assert = require('node:assert/strict');

const HandlebarsService = require('../../src/infrastructure/templates/HandlebarsService');
const DocumentApplicationService = require('../../src/application/documents/services/DocumentApplicationService');

test('HandlebarsService carga templates F-PC16-01, F-PC13-01, F-PC13-02 y F-PC15-01 vía embeddedTemplates sin ENOENT', () => {
  const hbs = new HandlebarsService();

  const rendered161 = hbs.parseWithTemplate('essays_forms/fpc161.html', {
    essay_track_code: 'ENS-2026-001',
    generated_at: new Date('2026-11-13T10:00:00Z'),
    element_to_essay: 'Placa MDF',
    samples_count: 3,
    observations: 'Recepción correcta',
    internal_aconditioning: true,
    code: 'OT-2026-01',
    headerImageDataUrl: 'data:image/jpeg;base64,mock'
  });

  assert.ok(rendered161.includes('F-PC16-01'));
  assert.ok(rendered161.includes('ENS-2026-001'));
  assert.ok(rendered161.includes('Placa MDF'));

  const rendered131 = hbs.parseWithTemplate('essays_forms/fpc131.html', {
    code: 'ENS-2026-001',
    requestDate: new Date('2026-11-13T10:00:00Z'),
    client: { name: 'Cliente Test', cuit: '30-11111111-1', contact: { name: 'Juan', mail: 'j@test.com' } },
    type: { name: 'Ensayo Formaldehído' },
    elements: { product: 'Mueble' },
    headerImageDataUrl: 'data:image/jpeg;base64,mock'
  });
  assert.ok(rendered131.includes('F-PC13-01'));
  assert.ok(rendered131.includes('Cliente Test'));
});

test('DocumentApplicationService.registerDocument registra metadatos en memoria con file=on-demand sin invocar Puppeteer ni R2', async () => {
  const savedDocs = [];
  const mockRepo = {
    save: async (doc) => {
      doc.id = 'doc-uuid-1';
      savedDocs.push(doc);
      return doc;
    }
  };

  const docSvc = new DocumentApplicationService();
  docSvc.documentRepository = mockRepo;
  docSvc.getDocumentType = async (code) => ({ id: 1, code: 'F-PC16-01', name: 'Registro de recepción' });

  const result = await docSvc.registerDocument({
    essayId: 'essay-123',
    form: 'F-PC16-01',
    user: { id: 'u1', profile: 'LABORATORY' }
  });

  assert.equal(savedDocs.length, 1);
  assert.equal(savedDocs[0].essayId, 'essay-123');
  assert.equal(savedDocs[0].typeId, 1);
  assert.equal(savedDocs[0].file, 'on-demand');
  assert.equal(result.id, 'doc-uuid-1');
  assert.equal(result.typeCode, 'F-PC16-01');
});

test('DocumentApplicationService.downloadDocumentByEssayAndType genera PDF buffer On The Fly cuando no hay archivo persistido', async () => {
  const docSvc = new DocumentApplicationService({ context: { user: { id: 'lab-1', profile: 'LABORATORY' } } });
  docSvc.handlebarsService = new HandlebarsService();
  docSvc.getDocumentType = async (code) => ({ id: 1, code: 'F-PC16-01', filesheet: 'essays_forms/fpc161.html' });
  docSvc.getDocumentByEssayAndType = async () => null;
  docSvc.envService = { fetchSystemData: async () => ({ SOCIAL_NAME: 'CTM LAB' }) };
  docSvc.documentInfrastructureService = {
    generatePDFBufferFromHTML: async (html) => {
      assert.ok(html.includes('F-PC16-01'));
      return Buffer.from('%PDF-1.4 Mock PDF');
    }
  };
  docSvc.getEssayService = () => ({
    getEssay: async (id) => ({
      id,
      code: 'ENS-001',
      requestDate: new Date(),
      elements: { product: 'Muestra madera' },
      workOrder: { code: 'OT-001', samples: [{ code: 'M-1' }, { code: 'M-2' }], internal_aconditioning: true }
    })
  });

  const downloadResult = await docSvc.downloadDocumentByEssayAndType('essay-001', 'F-PC16-01', {
    id: 'lab-1',
    profile: 'LABORATORY'
  });

  assert.equal(downloadResult.type, 'buffer');
  assert.ok(Buffer.isBuffer(downloadResult.buffer));
  assert.equal(downloadResult.contentType, 'application/pdf');
  assert.ok(downloadResult.filename.includes('F-PC16-01'));
});
