const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ALL_COUNTRIES,
  ARGENTINA_PROVINCES,
  DEFAULT_ESSAY_TYPES,
  DEFAULT_DOCUMENT_TYPES,
  FICTITIOUS_LAB_ENV_VARIABLES,
  FICTITIOUS_LABORATORY,
  getDefaultSeedUsers
} = require('../../src/infrastructure/seeders/baseSeedData');
const {
  parseSeedArgs,
  resolveSelectedTargets,
  seedUserAccount
} = require('../../src/infrastructure/seeders/run-default-types-seed');

test('baseSeedData: contiene los 249 países ISO alpha-2 en español sin códigos duplicados', () => {
  assert.equal(ALL_COUNTRIES.length, 249);

  const ids = new Set();
  const nonNullCodes = new Set();
  for (const c of ALL_COUNTRIES) {
    assert.match(c.id, /^[A-Z]{2}$/, `Código ISO inválido: ${c.id}`);
    assert.ok(!ids.has(c.id), `Código ISO duplicado: ${c.id}`);
    ids.add(c.id);
    assert.ok(typeof c.name === 'string' && c.name.trim().length > 0, `Nombre vacío para ${c.id}`);

    if (c.country_code != null) {
      assert.ok(c.country_code.length <= 3, `country_code excede CHAR(3) para ${c.id}`);
      const trimmed = c.country_code.trim();
      assert.ok(!nonNullCodes.has(trimmed), `country_code duplicado: ${trimmed} en ${c.id}`);
      nonNullCodes.add(trimmed);
    }
  }

  const argentina = ALL_COUNTRIES.find((c) => c.id === 'AR');
  assert.equal(argentina?.name, 'Argentina');
  assert.equal(argentina?.country_code?.trim(), '54');
});

test('baseSeedData: contiene las 24 provincias argentinas, ensayo de formaldehído y datos ficticios de laboratorio', () => {
  assert.equal(ARGENTINA_PROVINCES.length, 24);
  const provinceIds = new Set(ARGENTINA_PROVINCES.map((p) => p.id.trim()));
  assert.equal(provinceIds.size, 24);
  assert.ok(provinceIds.has('AR-S'));
  assert.ok(provinceIds.has('AR-C'));

  assert.ok(DEFAULT_ESSAY_TYPES.some((t) => /formaldeh[ií]do/i.test(t.name) && /IT17-01/i.test(t.name)));
  assert.equal(DEFAULT_DOCUMENT_TYPES.length, 5);
  assert.ok(FICTITIOUS_LAB_ENV_VARIABLES.some((v) => v.id === 'CUIT'));
  assert.ok(FICTITIOUS_LAB_ENV_VARIABLES.some((v) => v.id === 'UNCERTAINTY'));
  assert.equal(FICTITIOUS_LABORATORY.country, 'AR');

  const users = getDefaultSeedUsers({});
  assert.equal(users.labAdmin.profile, 'LABORATORY');
  assert.equal(users.labAdmin.role, 'ADMIN');
  assert.equal(users.client.profile, 'CLIENT');
});

test('run-default-types-seed: resuelve modo global por defecto y flags granulares con reset-passwords', () => {
  const globalTargets = resolveSelectedTargets(parseSeedArgs([]));
  assert.equal(globalTargets.countries, true);
  assert.equal(globalTargets.provinces, true);
  assert.equal(globalTargets.essayTypes, true);
  assert.equal(globalTargets.documents, true);
  assert.equal(globalTargets.lab, true);
  assert.equal(globalTargets.adminUser, true);
  assert.equal(globalTargets.clientUser, true);
  assert.equal(globalTargets.resetPasswords, false);

  const countriesOnly = resolveSelectedTargets(parseSeedArgs(['--countries']));
  assert.deepEqual(countriesOnly, {
    countries: true,
    provinces: false,
    essayTypes: false,
    documents: false,
    lab: false,
    adminUser: false,
    clientUser: false,
    resetPasswords: false,
    overwriteLab: false
  });

  const resetUsers = resolveSelectedTargets(parseSeedArgs(['--users', '--reset-passwords']));
  assert.equal(resetUsers.countries, false);
  assert.equal(resetUsers.adminUser, true);
  assert.equal(resetUsers.clientUser, true);
  assert.equal(resetUsers.resetPasswords, true);

  const adminAndProvinces = resolveSelectedTargets(parseSeedArgs(['--provinces', '--admin']));
  assert.equal(adminAndProvinces.provinces, true);
  assert.equal(adminAndProvinces.adminUser, true);
  assert.equal(adminAndProvinces.clientUser, false);
});

test('seedUserAccount: crea usuario nuevo y restablece contraseña si ya existe con resetPasswords=true', async () => {
  const storedUsers = new Map();
  const storedPersons = new Map();
  const memberships = [];

  const mockUserRepo = {
    async findByMail(mail) {
      return storedUsers.get(mail) || null;
    },
    async save(u) {
      const saved = { ...u, id: `user-${storedUsers.size + 1}` };
      storedUsers.set(saved.mail, saved);
      return saved;
    },
    async update(u) {
      storedUsers.set(u.mail, { ...u });
      return u;
    },
    async updatePassword(id, newHash) {
      for (const u of storedUsers.values()) {
        if (u.id === id) u.passwordHash = newHash;
      }
    }
  };

  const mockPersonRepo = {
    async findByUserId(userId) {
      return storedPersons.get(userId) || null;
    },
    async save(p) {
      storedPersons.set(p.userId, p);
      return p;
    }
  };

  const hashFn = async (pwd) => `hashed:${pwd}`;
  const ensureLabMembershipFn = async (userId, labId, role) => {
    memberships.push({ userId, labId, role });
  };

  const adminAccount = {
    mail: 'admin.lab@ctmueble.com.ar',
    password: 'PasswordInicial1!',
    name: 'Admin Demo',
    dni: '30111222',
    profile: 'LABORATORY',
    role: 'ADMIN'
  };

  // 1. Primera ejecución: crea usuario y membresía ADMIN
  const first = await seedUserAccount({
    userRepo: mockUserRepo,
    personRepo: mockPersonRepo,
    hashFn,
    ensureLabMembershipFn,
    account: adminAccount,
    resetPasswords: false,
    labId: 'lab-1'
  });
  assert.equal(first.status, 'created');
  assert.equal(storedUsers.get(adminAccount.mail).passwordHash, 'hashed:PasswordInicial1!');
  assert.equal(memberships.length, 1);
  assert.equal(memberships[0].role, 'ADMIN');

  // 2. Segunda ejecución sin reset: conserva contraseña original
  const second = await seedUserAccount({
    userRepo: mockUserRepo,
    personRepo: mockPersonRepo,
    hashFn,
    ensureLabMembershipFn,
    account: { ...adminAccount, password: 'OtraPassword2!' },
    resetPasswords: false,
    labId: 'lab-1'
  });
  assert.equal(second.status, 'already_exists');
  assert.equal(storedUsers.get(adminAccount.mail).passwordHash, 'hashed:PasswordInicial1!');

  // 3. Tercera ejecución con resetPasswords=true: actualiza hash de contraseña
  const third = await seedUserAccount({
    userRepo: mockUserRepo,
    personRepo: mockPersonRepo,
    hashFn,
    ensureLabMembershipFn,
    account: { ...adminAccount, password: 'NuevaPassword3!' },
    resetPasswords: true,
    labId: 'lab-1'
  });
  assert.equal(third.status, 'password_reset');
  assert.equal(storedUsers.get(adminAccount.mail).passwordHash, 'hashed:NuevaPassword3!');
});
