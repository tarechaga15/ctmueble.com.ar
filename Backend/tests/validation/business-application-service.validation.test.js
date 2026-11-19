const test = require('node:test');
const assert = require('node:assert/strict');

const BusinessApplicationService = require('../../src/application/business/services/BusinessApplicationService');

function createService(overrides = {}) {
  const service = new BusinessApplicationService({ context: { user: { id: 'user-1', profile: 'CLIENT' } } });

  service.business = class BusinessEntity {
    constructor(data) {
      Object.assign(this, data);
    }
  };

  service.businessRepository = {
    findByCuit: async () => null,
    save: async (business) => business,
    addAddress: async () => ({}),
    update: async (business) => business,
    findAddresses: async () => [],
    ...overrides.businessRepository
  };

  service.padronService = {
    getPadron: async () => null,
    ...overrides.padronService
  };

  service.addressOriginService = {
    determineOrigin: () => 'CLIENT',
    ...overrides.addressOriginService
  };

  service.districtRepository = overrides.districtRepository;

  return service;
}

test('createBusinessManually exige cuit y nombre', async () => {
  const service = createService();
  await assert.rejects(
    () => service.createBusinessManually({}, { id: 'user-1', profile: 'CLIENT' }),
    /CUIT y nombre son obligatorios/
  );
});

test('createBusinessManually rechaza empresa existente', async () => {
  const service = createService({
    businessRepository: {
      findByCuit: async () => ({ cuit: '30712345678', name: 'Empresa SA' })
    }
  });

  await assert.rejects(
    () => service.createBusinessManually({ cuit: '30712345678', name: 'Empresa SA' }, { id: 'user-1', profile: 'CLIENT' }),
    /La empresa ya existe/
  );
});

test('syncBusinessByCuit valida existencia y tipo legal', async () => {
  const serviceNotFound = createService({
    businessRepository: {
      findByCuit: async () => null
    }
  });
  await assert.rejects(() => serviceNotFound.syncBusinessByCuit('30712345678', { id: 'u1' }), /Empresa no encontrada/);

  const serviceNoPadron = createService({
    businessRepository: {
      findByCuit: async () => ({ cuit: '30712345678', name: 'Empresa SA', addresses: [] })
    },
    padronService: {
      getPadron: async () => null
    }
  });
  await assert.rejects(
    () => serviceNoPadron.syncBusinessByCuit('30712345678', { id: 'u1' }),
    /No se encontraron datos actualizados/
  );

  const serviceInvalidType = createService({
    businessRepository: {
      findByCuit: async () => ({ cuit: '30712345678', name: 'Empresa SA', addresses: [] })
    },
    padronService: {
      getPadron: async () => ({ type: 'PHYSICAL', name: 'Persona' })
    }
  });
  await assert.rejects(
    () => serviceInvalidType.syncBusinessByCuit('30712345678', { id: 'u1' }),
    /no corresponde a una persona jurídica/i
  );
});

test('normalizeAddresses respeta restricciones de mapeo de distrito', async () => {
  const service = createService({
    districtRepository: {
      findAll: async () => [
        { id: 'AR-C', numeric_id: '02' },
        { id: 'AR-S', numeric_id: '82' }
      ]
    }
  });

  const addresses = await service.normalizeAddresses([
    { address: 'Av 1', location: 'x', province: '02' },
    { address: 'Av 2', location: 'y', district: 'AR-S' }
  ]);

  assert.equal(addresses[0].district, 'AR-C');
  assert.equal(addresses[0].location, 'Capital Federal');
  assert.equal(addresses[1].district, 'AR-S');
});

