'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const SnapshotApplicationService = require('../src/application/essays/services/SnapshotApplicationService');
const SnapshotCryptoService = require('../src/infrastructure/security/SnapshotCryptoService');
const OpenTimestampsService = require('../src/infrastructure/security/OpenTimestampsService');

// Mock en memoria del modelo de snapshots para pruebas unitarias desacopladas
class MockSnapshotModel {
  constructor() {
    this.records = [];
  }

  async findOne({ where, order }) {
    let matches = this.records.filter((r) => {
      let ok = true;
      if (where.essay_id && r.essay_id !== where.essay_id) ok = false;
      if (where.document_type && r.document_type !== where.document_type) ok = false;
      return ok;
    });

    if (order && order[0] && order[0][0] === 'version') {
      const desc = order[0][1] === 'DESC';
      matches.sort((a, b) => (desc ? b.version - a.version : a.version - b.version));
    }

    return matches[0] || null;
  }

  async create(data) {
    const record = {
      id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...data
    };
    record.toJSON = () => ({ ...record });
    record.get = () => ({ ...record });
    this.records.push(record);
    return record;
  }

  async findByPk(id) {
    const found = this.records.find((r) => r.id === id);
    if (!found) return null;
    return {
      ...found,
      toJSON: () => ({ ...found }),
      get: () => ({ ...found })
    };
  }

  async findAll({ where }) {
    let matches = this.records.filter((r) => {
      if (where.essay_id && r.essay_id !== where.essay_id) return false;
      return true;
    });
    return matches.map((m) => ({
      ...m,
      toJSON: () => ({ ...m }),
      get: () => ({ ...m })
    }));
  }
}

test('SnapshotApplicationService: captura snapshot con hash firmado, versión secuencial y OTS', async () => {
  const mockModel = new MockSnapshotModel();
  const cryptoService = new SnapshotCryptoService({ hmacSecret: 'test-audit-key-secret-123' });
  const otsService = new OpenTimestampsService();

  const service = new SnapshotApplicationService({
    snapshotModel: mockModel,
    cryptoService,
    otsService
  });

  const essayData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    code: 'SOL-2026-0001',
    status: 'REQUESTED',
    requestDate: '2026-11-14T02:00:00.000Z',
    elements: {
      product: 'Mesa de reunión',
      manufacturer: 'Industrias CTM',
      batch_number: 'LOTE-99'
    },
    client: {
      cuit: '30700000001',
      name: 'Cliente Corp SA',
      contact_mail: 'contacto@clientecorp.com'
    }
  };

  const reqMock = {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
      'x-forwarded-for': '200.5.10.20',
      'x-device-id': 'dev_pc_laboratorio_1',
      'x-device-fingerprint': 'fp_hash_device_secure'
    },
    auth: { sid: 'sess_123' }
  };

  // 1. Capturar Snapshot Versión 1 (Solicitud F-PC13-01)
  const snapV1 = await service.takeSnapshot({
    essayId: essayData.id,
    essayData,
    documentType: 'F-PC13-01',
    eventCode: 'REQUEST_CREATED',
    user: { id: 'usr-1', name: 'Operador CTM' },
    req: reqMock
  });

  assert.equal(snapV1.version, 1);
  assert.equal(snapV1.document_type, 'F-PC13-01');
  assert.equal(snapV1.ots_status, 'STAMPED');
  assert.ok(snapV1.canonical_hash);
  assert.equal(snapV1.canonical_hash.length, 64);
  assert.ok(snapV1.signature);
  assert.equal(snapV1.device_id, 'dev_pc_laboratorio_1');
  assert.equal(snapV1.client_name, 'Google Chrome en Windows');

  // 2. Verificar integridad de Snapshot v1
  const verificationV1 = await service.verifySnapshot(snapV1.id);
  assert.equal(verificationV1.isValid, true);
  assert.equal(verificationV1.cryptography.integrityCheck.valid, true);
  assert.equal(verificationV1.openTimestamps.hasProof, true);
  assert.equal(verificationV1.openTimestamps.isValidHeader, true);

  // 3. Capturar Snapshot Versión 2 ante cambio de datos del solicitante
  const updatedEssayData = {
    ...essayData,
    client: {
      ...essayData.client,
      name: 'Cliente Corp S.A. (Actualizado)'
    }
  };

  const snapV2 = await service.takeSnapshot({
    essayId: essayData.id,
    essayData: updatedEssayData,
    documentType: 'F-PC13-01',
    eventCode: 'ESSAY_CLIENT_UPDATED',
    user: { id: 'usr-1', name: 'Operador CTM' },
    req: reqMock
  });

  assert.equal(snapV2.version, 2);
  assert.notEqual(snapV2.canonical_hash, snapV1.canonical_hash);

  // 4. Detección de alteración o manipulación (tampering) en BD
  const directTamperedRecord = mockModel.records.find((r) => r.id === snapV1.id);
  // Alguien altera directamente en la base de datos el nombre del cliente en el snapshot_data
  directTamperedRecord.snapshot_data.client.name = 'Empresa Falsa Modificada en SQL';

  const verificationTampered = await service.verifySnapshot(snapV1.id);
  assert.equal(verificationTampered.isValid, false);
  assert.equal(verificationTampered.cryptography.integrityCheck.reason, 'HASH_MISMATCH');

  // 5. Descarga de prueba OpenTimestamps (.ots)
  const otsDownload = await service.getOtsProofFile(snapV2.id);
  assert.ok(Buffer.isBuffer(otsDownload.buffer));
  assert.ok(otsDownload.filename.endsWith('.ots'));
});

test('SnapshotApplicationService: soporta reemisión de F-PC13-01 con modificación y snapshot versionada', async () => {
  const mockModel = new MockSnapshotModel();
  const cryptoService = new SnapshotCryptoService({ hmacSecret: 'reissue-test-key-999' });
  const otsService = new OpenTimestampsService();

  const service = new SnapshotApplicationService({
    snapshotModel: mockModel,
    cryptoService,
    otsService
  });

  const essayId = 'essay-reissue-test-111';
  const initialData = {
    id: essayId,
    code: 'SOL-2026-0099',
    status: 'REQUESTED',
    elements: { product: 'Mesa' },
    client: { name: 'Cliente Original' }
  };

  // 1. Snapshot original v1
  const snap1 = await service.takeSnapshot({
    essayId,
    essayData: initialData,
    documentType: 'F-PC13-01',
    eventCode: 'REQUEST_CREATED'
  });
  assert.equal(snap1.version, 1);
  assert.equal(snap1.snapshot_data.modificated, undefined);

  // 2. Reemisión de F-PC13-01 con modificación
  const modifiedData = {
    ...initialData,
    client: { name: 'Cliente con Razón Social Corregida' }
  };

  const snapReissued = await service.takeSnapshot({
    essayId,
    essayData: modifiedData,
    documentType: 'F-PC13-01',
    eventCode: 'REQUEST_MODIFIED',
    customData: {
      modificated: true,
      reissueReason: 'Corrección de datos solicitados por el cliente'
    }
  });

  assert.equal(snapReissued.version, 2);
  assert.equal(snapReissued.snapshot_data.modificated, true);
  assert.equal(snapReissued.snapshot_data.reissueReason, 'Corrección de datos solicitados por el cliente');
  assert.equal(snapReissued.ots_status, 'STAMPED');

  // Integridad de la snapshot reemitida
  const verifyReissued = await service.verifySnapshot(snapReissued.id);
  assert.equal(verifyReissued.isValid, true);
  assert.equal(verifyReissued.version, 2);
});
