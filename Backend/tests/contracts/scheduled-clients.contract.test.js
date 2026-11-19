const test = require('node:test');
const assert = require('node:assert/strict');

const ClientApplicationService = require('../../src/application/clients/services/ClientApplicationService');
const clientsController = require('../../src/presentation/controllers/clients.controller');
const serviceFactory = require('../../src/shared/serviceFactory');

test('isClientScheduled reconoce cliente agendado por CUIT cuando clientId pertenece a un essay_client', async () => {
  const labUserId = 'lab-user-uuid-1';
  const svc = new ClientApplicationService({
    context: { user: { id: labUserId, profile: 'LABORATORY' } }
  });

  const scheduledLabClient = {
    id: 'client-scheduled-uuid',
    cuit: '30711111118',
    origin: 'LABORATORY',
    userId: labUserId
  };

  svc.clientRepository = {
    findById: async (id) => {
      // El ID es de essay_client, por lo que NO existe en la tabla clients
      return null;
    },
    findOneByCuitUserAndOrigin: async (cuit, userId, origin) => {
      if (cuit === '30711111118' && userId === labUserId && origin === 'LABORATORY') {
        return scheduledLabClient;
      }
      return null;
    },
    isContactLinked: async () => false
  };

  // 1. Chequeo pasando clientId desconocido + cuit
  const resWithCuit = await svc.isClientScheduled({
    clientId: '11111111-1111-4111-8111-111111111111',
    cuit: '30711111118'
  });

  assert.equal(resWithCuit.scheduled, true);
  assert.equal(resWithCuit.clientId, 'client-scheduled-uuid');

  // 2. Chequeo pasando cuit no agendado
  const resNotScheduled = await svc.isClientScheduled({
    clientId: '11111111-1111-4111-8111-111111111111',
    cuit: '30999999999'
  });
  assert.equal(resNotScheduled.scheduled, false);
  assert.equal(resNotScheduled.clientId, null);
});

test('addScheduledClient agenda correctamente cuando clientId es de essay_client y trae CUIT', async () => {
  const labUserId = 'lab-user-uuid-1';
  const svc = new ClientApplicationService({
    context: { user: { id: labUserId, profile: 'LABORATORY' } }
  });

  let savedEntity = null;
  let linkedContactId = null;

  svc.client = class MockClient {
    constructor(data) {
      Object.assign(this, data);
    }
    validate() {
      return true;
    }
  };

  svc.clientRepository = {
    findById: async () => null,
    findByCuit: async () => null,
    findOneByCuitUserAndOrigin: async () => null,
    save: async (entity) => {
      savedEntity = entity;
      return { ...entity, id: 'new-scheduled-id' };
    },
    addContactToClient: async (clientId, contactId) => {
      linkedContactId = contactId;
    }
  };

  svc.getClient = async (id) => ({ id, name: savedEntity?.name, cuit: savedEntity?.cuit });

  const result = await svc.addScheduledClient({
    clientId: '22222222-2222-4222-8222-222222222222',
    cuit: '30712345678',
    name: 'Muebles SA',
    contact: { id: 'contact-uuid-1' },
    address: { address: 'Calle 123', location: 'Capital', province: 'AR-C' }
  });

  assert.equal(result.id, 'new-scheduled-id');
  assert.equal(savedEntity.cuit, '30712345678');
  assert.equal(savedEntity.origin, 'LABORATORY');
  assert.equal(savedEntity.userId, labUserId);
  assert.equal(linkedContactId, 'contact-uuid-1');
});

test('isClientScheduled tolera clientId no-UUID sin lanzar error y busca por CUIT', async () => {
  const labUserId = 'lab-user-uuid-1';
  const svc = new ClientApplicationService({
    context: { user: { id: labUserId, profile: 'LABORATORY' } }
  });

  svc.clientRepository = {
    findById: async () => null,
    findOneByCuitUserAndOrigin: async (cuit) => {
      if (cuit === '30711111118') {
        return { id: 'client-1', cuit, origin: 'LABORATORY', userId: labUserId };
      }
      return null;
    },
    isContactLinked: async () => false
  };

  const res = await svc.isClientScheduled({
    clientId: 'no-es-uuid',
    cuit: '30711111118'
  });

  assert.equal(res.scheduled, true);
  assert.equal(res.clientId, 'client-1');
});

test('clients.controller valida campos requeridos para isScheduled y addScheduled', async () => {
  // 1. isScheduled sin clientId ni cuit -> 400
  let errStatus = null;
  let errJson = null;
  const resErr = {
    status: (code) => {
      errStatus = code;
      return resErr;
    },
    json: (data) => {
      errJson = data;
      return data;
    }
  };
  await clientsController.isScheduled({ query: {} }, resErr);
  assert.equal(errStatus, 400);
  assert.match(errJson.error, /requerido/i);

  // 2. addScheduled sin clientId ni cuit -> 400
  let addErrStatus = null;
  let addErrJson = null;
  const resAddErr = {
    status: (code) => {
      addErrStatus = code;
      return resAddErr;
    },
    json: (data) => {
      addErrJson = data;
      return data;
    }
  };
  await clientsController.addScheduled({ body: {} }, resAddErr);
  assert.equal(addErrStatus, 400);
  assert.match(addErrJson.error, /requerido/i);
});

test('los clientes agendados de laboratorio se comparten entre todos los usuarios del laboratorio', async () => {
  const userA = 'lab-user-A';
  const userB = 'lab-user-B';

  const clientCreatedByA = {
    id: 'client-created-by-A',
    name: 'Cliente Compartido SA',
    cuit: '30888888888',
    origin: 'LABORATORY',
    userId: userA,
    address: 'Calle Lab 123',
    representative: null,
    contact: null,
    billing_cuit: null
  };

  const sharedRepo = {
    findAllByOrigin: async (origin) => {
      if (origin === 'LABORATORY') return [clientCreatedByA];
      return [];
    },
    findAllByUserAndOrigin: async (userId, origin) => {
      if (userId === userA && origin === 'LABORATORY') return [clientCreatedByA];
      return [];
    },
    findOneByCuitAndOrigin: async (cuit, origin) => {
      if (cuit === '30888888888' && origin === 'LABORATORY') return clientCreatedByA;
      return null;
    },
    findByCuit: async () => null,
    findById: async (id) => {
      if (id === clientCreatedByA.id) return clientCreatedByA;
      return null;
    },
    update: async (c) => c,
    isContactLinked: async () => false
  };

  // Instanciamos el servicio para el usuario B (compañero de laboratorio de A)
  const svcUserB = new ClientApplicationService({
    context: { user: { id: userB, profile: 'LABORATORY' } }
  });
  svcUserB.clientRepository = sharedRepo;
  svcUserB.getClient = async (id) => sharedRepo.findById(id);

  // 1. Usuario B debe ver en getScheduledClients el cliente agendado por A
  const scheduledList = await svcUserB.getScheduledClients();
  assert.equal(scheduledList.length, 1);
  assert.equal(scheduledList[0].id, 'client-created-by-A');
  assert.equal(scheduledList[0].cuit, '30888888888');

  // 2. Usuario B debe ver en getAllClients el cliente agendado por A
  const allList = await svcUserB.getAllClients();
  assert.equal(allList.length, 1);
  assert.equal(allList[0].id, 'client-created-by-A');

  // 3. Usuario B debe reconocer como agendado el cliente por CUIT
  const check = await svcUserB.isClientScheduled({ cuit: '30888888888' });
  assert.equal(check.scheduled, true);
  assert.equal(check.clientId, 'client-created-by-A');

  // 4. Si Usuario B intenta agendar la misma empresa, debe reutilizar la existente y no crear duplicado
  let createdNew = false;
  svcUserB.client = class MockClient {
    constructor() {
      createdNew = true;
    }
  };
  const addRes = await svcUserB.addScheduledClient({ cuit: '30888888888' });
  assert.equal(addRes.id, 'client-created-by-A');
  assert.equal(createdNew, false, 'No debe crear una nueva entidad si ya está agendada en el laboratorio');
});
