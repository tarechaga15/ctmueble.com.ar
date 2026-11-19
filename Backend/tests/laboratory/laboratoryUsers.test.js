const test = require('node:test');
const assert = require('node:assert/strict');
const LaboratoryUserApplicationService = require('../../src/application/laboratories/services/LaboratoryUserApplicationService');
const { CATALOGO_PERMISOS } = require('../../src/shared/permissionsCatalog');

test('LaboratoryUserApplicationService: listUsers formatea los usuarios internos y roles correctamente', async () => {
  const fakeMembers = [
    { user: 'user-1', role: 'ADMIN' },
    { user: 'user-2', role: 'USER' }
  ];

  const fakeUsers = [
    { id: 'user-1', name: 'Super Admin', mail: 'admin@ctmueble.com.ar', dni: '11111111', is_active: true },
    { id: 'user-2', name: 'Operario Lab', mail: 'operario@ctmueble.com.ar', dni: '22222222', is_active: false }
  ];

  const service = new LaboratoryUserApplicationService({
    userModel: {
      findAll: async () => fakeUsers
    },
    labMembersModel: {
      findAll: async () => fakeMembers
    },
    labPermissionModel: {
      findAll: async () => []
    },
    emailVerificationModel: {
      destroy: async () => {},
      create: async () => {}
    },
    mailingService: {
      isConfigured: async () => false
    }
  });

  const list = await service.listUsers();
  assert.equal(list.length, 2);
  assert.equal(list[0].rol, 'Admin');
  assert.equal(list[0].isSuperAdmin, true);
  assert.equal(list[0].activo, true);
  assert.equal(list[1].rol, 'Usuario');
  assert.equal(list[1].isSuperAdmin, false);
  assert.equal(list[1].activo, false);
});

test('LaboratoryUserApplicationService: createUser crea usuario en modo LABORATORY y genera token de activación', async () => {
  let createdUser = null;
  let createdMember = null;
  let createdVerification = null;
  let invitationSent = false;

  const fakeUserModel = {
    findOne: async () => null,
    create: async (data) => {
      createdUser = { id: 'new-user-uuid', ...data };
      return createdUser;
    }
  };

  const fakeLabMembersModel = {
    findOne: async () => null,
    create: async (data) => {
      createdMember = data;
      return data;
    }
  };

  const fakeEmailVerificationModel = {
    destroy: async () => {},
    create: async (data) => {
      createdVerification = data;
      return data;
    }
  };

  const fakeMailingService = {
    isConfigured: async () => true,
    sendLaboratoryInvitation: async (params) => {
      invitationSent = true;
      assert.equal(params.to, 'nuevo@ctmueble.com.ar');
      assert.equal(params.role, 'USER');
      assert.ok(params.verificationToken);
      assert.ok(params.otpCode);
    }
  };

  const service = new LaboratoryUserApplicationService({
    userModel: fakeUserModel,
    labMembersModel: fakeLabMembersModel,
    emailVerificationModel: fakeEmailVerificationModel,
    mailingService: fakeMailingService
  });

  const result = await service.createUser({
    nombreCompleto: 'Juan Tecnico',
    dni: '38123456',
    email: 'nuevo@ctmueble.com.ar',
    rol: 'Usuario'
  });

  assert.equal(result.nombreCompleto, 'Juan Tecnico');
  assert.equal(result.email, 'nuevo@ctmueble.com.ar');
  assert.equal(result.rol, 'Usuario');
  assert.equal(result.mailingSent, true);

  assert.ok(createdUser);
  assert.equal(createdUser.profile, 'LABORATORY');
  assert.equal(createdUser.is_active, true);
  assert.equal(createdMember.user, 'new-user-uuid');
  assert.equal(createdMember.role, 'USER');
  assert.ok(createdVerification);
  assert.equal(invitationSent, true);
});

test('LaboratoryUserApplicationService: getPermissionsMatrix y updatePermissionsMatrix', async () => {
  let savedItems = [];

  const fakeLabPermissionModel = {
    findAll: async () => [
      { rol: 'Usuario', accion: 'essays.ver', permitido: true },
      { rol: 'Consulta', accion: 'essays.ver', permitido: false }
    ],
    findOne: async ({ where }) => {
      const match = savedItems.find((i) => i.rol === where.rol && i.accion === where.accion);
      if (match) {
        return {
          update: async (data) => Object.assign(match, data)
        };
      }
      return null;
    },
    create: async (data) => {
      savedItems.push(data);
      return data;
    }
  };

  const service = new LaboratoryUserApplicationService({
    labPermissionModel: fakeLabPermissionModel
  });

  const matrix = await service.getPermissionsMatrix();
  assert.equal(matrix.catalogo.length, CATALOGO_PERMISOS.length);
  assert.ok(matrix.matriz.length > 0);

  const foundUserVer = matrix.matriz.find((m) => m.rol === 'Usuario' && m.accion === 'essays.ver');
  assert.equal(foundUserVer.permitido, true);

  const foundConsultaVer = matrix.matriz.find((m) => m.rol === 'Consulta' && m.accion === 'essays.ver');
  assert.equal(foundConsultaVer.permitido, false);

  await service.updatePermissionsMatrix([
    { rol: 'Consulta', accion: 'essays.ver', permitido: true }
  ]);
  assert.ok(savedItems.some((i) => i.rol === 'Consulta' && i.accion === 'essays.ver' && i.permitido === true));
});
