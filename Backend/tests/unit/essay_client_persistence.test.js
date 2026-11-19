const test = require('node:test');
const assert = require('node:assert/strict');
const EssayClient = require('../../src/domain/essays/entities/EssayClient');

test('EssayClient: maneja representantes anidados o vacíos sin generar [object Object] en payload de persistencia', () => {
  const malformedClient = {
    cuit: '20445762602',
    name: 'Cliente Test',
    representative: {
      id: { id: null, name: null, dni: null, district: null, country: null },
      name: null,
      dni: null
    },
    address: {
      id: { id: '11111111-1111-1111-1111-111111111111' },
      address: 'Calle Falsa 123',
      location: 'Rosario',
      province: 'AR-S'
    },
    contact: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Contacto Test',
      dni: '12345678',
      mail: 'contacto@test.com',
      phone: '123456789'
    },
    billing: {
      cuit: '20445762602',
      address: 'Calle Falsa 123',
      paysIva: true
    }
  };

  const essayClient = EssayClient.fromClient(malformedClient);
  assert.equal(essayClient.representative, null, 'Un representante sin nombre, dni ni id string válido debe ser null');
  assert.equal(essayClient.address.id, '11111111-1111-1111-1111-111111111111');

  const payload = essayClient.toPersistencePayload('essay-id-123');
  assert.equal(payload.representative, null, 'El campo representative en persistencia debe ser null, nunca [object Object]');
  assert.notEqual(payload.representative, '[object Object]');
  assert.equal(payload.address, '11111111-1111-1111-1111-111111111111');
  assert.notEqual(payload.address, '[object Object]');
  assert.equal(payload.contact, '22222222-2222-2222-2222-222222222222');
});

test('EssayClient: conserva id válido de representante y mapea campos correctamente', () => {
  const validClient = {
    cuit: '20445762602',
    name: 'Cliente Valido',
    representative: {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Representante Perez',
      dni: '11223344'
    },
    address: {
      id: '44444444-4444-4444-4444-444444444444',
      address: 'Av. Corrientes 500'
    },
    contact: {
      id: '55555555-5555-5555-5555-555555555555',
      name: 'Contacto Perez',
      mail: 'test@ctm.com'
    }
  };

  const essayClient = EssayClient.fromClient(validClient);
  assert.equal(essayClient.representative.id, '33333333-3333-3333-3333-333333333333');
  assert.equal(essayClient.representative.name, 'Representante Perez');

  const payload = essayClient.toPersistencePayload('essay-id-999');
  assert.equal(payload.representative, '33333333-3333-3333-3333-333333333333');
  assert.equal(payload.representative_name, 'Representante Perez');
  assert.equal(payload.representative_dni, '11223344');
  assert.equal(payload.address, '44444444-4444-4444-4444-444444444444');
  assert.equal(payload.contact, '55555555-5555-5555-5555-555555555555');
});
