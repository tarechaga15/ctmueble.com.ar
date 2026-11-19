const test = require('node:test');
const assert = require('node:assert/strict');

const UserApplicationService = require('../../src/application/users/services/UserApplicationService');
const ClientApplicationService = require('../../src/application/clients/services/ClientApplicationService');
const PersonApplicationService = require('../../src/application/persons/services/PersonApplicationService');
const PersonValidationService = require('../../src/domain/persons/services/PersonValidationService');
const EssayApplicationService = require('../../src/application/essays/services/EssayApplicationService');
const EssayAuditLogApplicationService = require('../../src/application/essays/services/EssayAuditLogApplicationService');
const EssayPermissionService = require('../../src/domain/essays/services/EssayService');

test('UserApplicationService.switchProfile bloquea escalada CLIENT -> LABORATORY sin membresía real', async () => {
  const fakeUser = {
    id: 'user-client-1',
    mail: 'cliente@empresa.com',
    profile: 'CLIENT',
    laboratory: null,
    switchProfile(p) {
      this.profile = p;
    },
    switchLaboratory(l) {
      this.laboratory = l;
    }
  };

  let updated = false;
  const repoWithoutMembership = {
    findById: async () => ({
      ...fakeUser,
      switchProfile: fakeUser.switchProfile,
      switchLaboratory: fakeUser.switchLaboratory
    }),
    findUserLaboratories: async () => [],
    update: async () => {
      updated = true;
    }
  };

  const svcDenied = new UserApplicationService(repoWithoutMembership);
  await assert.rejects(
    async () => svcDenied.switchProfile('user-client-1', 'LABORATORY'),
    (err) => err.status === 403 && err.code === 'LABORATORY_MEMBERSHIP_REQUIRED'
  );
  assert.equal(updated, false);

  // Usuario con membresía verificada en laboratories_members sí puede activar perfil LABORATORY
  const repoWithMembership = {
    findById: async () => ({
      ...fakeUser,
      switchProfile: fakeUser.switchProfile,
      switchLaboratory: fakeUser.switchLaboratory
    }),
    findUserLaboratories: async () => [{ laboratory: 'lab-uuid-1', role: 'MEMBER' }],
    update: async (u) => u
  };
  const svcAllowed = new UserApplicationService(repoWithMembership);
  const dto = await svcAllowed.switchProfile('user-client-1', 'LABORATORY');
  assert.equal(dto.profile, 'LABORATORY');
  assert.equal(dto.laboratory, 'lab-uuid-1');
});

test('ClientApplicationService impide IDOR sobre clientes y contactos de otros usuarios (anti-enumeración 404)', async () => {
  const svc = new ClientApplicationService({
    context: { user: { id: 'attacker-user', profile: 'CLIENT' } }
  });

  svc.personService = {
    getMyPersonProfile: async () => ({ id: 'attacker-person-id' })
  };

  svc.clientRepository = {
    findByPerson: async () => [{ id: 'own-client-id', cuit: '30111111118', userId: 'attacker-user' }],
    findById: async (id) => ({
      id,
      cuit: '30999999997',
      name: 'Empresa Ajena SA',
      userId: 'victim-owner-user'
    }),
    update: async () => {
      throw new Error('No debería ejecutarse update');
    },
    delete: async () => {
      throw new Error('No debería ejecutarse delete');
    },
    findContactsByClient: async () => [{ id: 'secret-contact' }]
  };

  await assert.rejects(
    () => svc.getClient('victim-client-id'),
    (err) => err.status === 404 && err.code === 'CLIENT_NOT_FOUND'
  );

  await assert.rejects(
    () => svc.updateClient('victim-client-id', { address: 'Nueva Dir' }),
    (err) => err.status === 404 && err.code === 'CLIENT_NOT_FOUND'
  );

  await assert.rejects(
    () => svc.deleteClient('victim-client-id'),
    (err) => err.status === 404 && err.code === 'CLIENT_NOT_FOUND'
  );

  await assert.rejects(
    () => svc.getContactsByClient('victim-client-id'),
    (err) => err.status === 404 && err.code === 'CLIENT_NOT_FOUND'
  );
});

test('ClientApplicationService en modo CLIENT bloquea acceso a clientes de origen LABORATORY aunque coincida userId', async () => {
  const svc = new ClientApplicationService({
    context: { user: { id: 'dual-user-1', profile: 'CLIENT' } }
  });

  svc.clientRepository = {
    findById: async (id) => ({
      id,
      cuit: '30999999997',
      name: 'Cliente Lab SA',
      origin: 'LABORATORY',
      userId: 'dual-user-1'
    })
  };

  await assert.rejects(
    () => svc.getClient('lab-client-id'),
    (err) => err.status === 404 && err.code === 'CLIENT_NOT_FOUND'
  );
});

test('PersonApplicationService impide leer o editar personas ajenas y preserva userId=null en contactos de terceros', async () => {
  const svc = new PersonApplicationService({
    context: { user: { id: 'client-user-1', profile: 'CLIENT' } }
  });
  svc.personValidationService = new PersonValidationService();

  let savedEntity = null;
  svc.person = class MockPerson {
    constructor(data) {
      Object.assign(this, data);
    }
    validate() {}
  };
  svc.personRepository = {
    findById: async (id) => ({
      id,
      name: 'Otra Persona',
      userId: 'other-user-999',
      isThirdParty: false
    }),
    isPersonAccessibleByUser: async () => false,
    save: async (entity) => {
      savedEntity = entity;
      return { ...entity, id: 'new-third-party-id' };
    }
  };
  svc.clientRepository = {
    findByPerson: async () => []
  };

  await assert.rejects(
    () => svc.getPerson('foreign-person-id'),
    (err) => err.status === 404 && err.code === 'PERSON_NOT_FOUND'
  );

  await assert.rejects(
    () => svc.updatePerson('foreign-person-id', { name: 'Hackeado' }),
    (err) => err.status === 404 && err.code === 'PERSON_NOT_FOUND'
  );

  const created = await svc.createPerson({
    name: 'Contacto Externo',
    mail: 'contacto@externo.com',
    isThirdParty: true
  });
  assert.equal(savedEntity.userId, null);
  assert.equal(savedEntity.isThirdParty, true);
  assert.equal(created.id, 'new-third-party-id');
});

test('EssayApplicationService y EssayAuditLogApplicationService bloquean acciones de laboratorio y accesos cross-tenant', async () => {
  const clientUser = { id: 'client-user-1', profile: 'CLIENT' };
  const svc = new EssayApplicationService({
    context: { user: clientUser }
  });
  svc.essayPermissionService = new EssayPermissionService();
  svc.essayRepository = {
    // Simula aislamiento de repositorio: devuelve null si el ensayo no pertenece al usuario CLIENT autenticado
    findById: async (id, user) => {
      if (user?.profile === 'CLIENT') return null;
      return { id, client: 'foreign-client-999', status: 'REQUESTED' };
    }
  };
  svc.documentRepository = {
    findById: async () => ({
      id: 'doc-999',
      essayId: 'essay-foreign-1',
      type: 'BUDGET',
      file: 'secret.pdf'
    })
  };

  // Incluso si el ensayo existiera y fuera propio, un CLIENT no puede aceptar ni emitir OT (403 LABORATORY_REQUIRED)
  const ownEssaySvc = new EssayApplicationService({ context: { user: clientUser } });
  ownEssaySvc.essayPermissionService = new EssayPermissionService();
  ownEssaySvc.essayRepository = {
    findById: async (id) => ({ id, client: 'own-client-1', status: 'REQUESTED' })
  };

  await assert.rejects(
    () => ownEssaySvc.acceptEssay('essay-own-1', { days_to_do: 10, price: 100, samples_conservation_days: 30 }),
    (err) => err.status === 403 && err.code === 'LABORATORY_REQUIRED'
  );

  await assert.rejects(
    () => ownEssaySvc.emitWorkOrder('essay-own-1'),
    (err) => err.status === 403 && err.code === 'LABORATORY_REQUIRED'
  );

  // Un CLIENT intentando descargar un documento o leer auditoría de otro cliente recibe 404 anti-enumeración
  await assert.rejects(
    () => svc.downloadDocument('doc-999'),
    (err) => err.status === 404 && err.code === 'DOCUMENT_NOT_FOUND'
  );

  const auditSvc = new EssayAuditLogApplicationService({ context: { user: clientUser } });
  auditSvc.essayRepository = svc.essayRepository;
  auditSvc.essayAuditLogRepository = {
    findByEssayId: async () => [{ id: 'log-1' }]
  };

  await assert.rejects(
    () => auditSvc.getAuditLogs('essay-foreign-1', clientUser),
    (err) => err.status === 404 && err.code === 'ESSAY_NOT_FOUND'
  );
});
