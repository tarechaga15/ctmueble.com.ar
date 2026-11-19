// Ejecutar globalmente:
//   npm run seed
// Ejecutar granularmente:
//   npm run seed:countries
//   npm run seed:provinces
//   npm run seed:essay-types
//   npm run seed:lab
//   npm run seed:users
//   npm run seed:reset-passwords

'use strict';

const {
  ALL_COUNTRIES,
  ARGENTINA_PROVINCES,
  DEFAULT_ESSAY_TYPES,
  DEFAULT_DOCUMENT_TYPES,
  FICTITIOUS_LAB_ENV_VARIABLES,
  FICTITIOUS_LABORATORY,
  getDefaultSeedUsers
} = require('./baseSeedData');

function printUsage() {
  console.log(`
Uso:
  node -r dotenv/config src/infrastructure/seeders/run-default-types-seed.js [opciones]

Modos de ejecución:
  --all                 Ejecuta todos los bloques de seedeo (comportamiento por defecto si no se pasan flags)
  --countries           Siembra los 249 países ISO 3166-1 alpha-2 en types_countries (alias: --paises)
  --provinces           Siembra las 24 jurisdicciones/provincias argentinas en types_districts (alias: --provincias, --districts)
  --essay-types         Siembra el tipo de ensayo de formaldehído (IT17-01) en types_essays (alias: --ensayos)
  --documents           Siembra los formularios oficiales en types_documents (alias: --documentos)
  --lab                 Siembra datos ficticios de laboratorio en environment_variables y laboratories (alias: --laboratorio, --env)
  --users               Siembra la cuenta Admin de Laboratorio y la cuenta de Cliente (alias: --usuarios)
  --admin               Siembra únicamente la cuenta Admin de Laboratorio
  --client              Siembra únicamente la cuenta de Cliente

Opciones de restablecimiento y personalización:
  --reset-passwords     Si los usuarios ya existen, restablece sus contraseñas (alias: --reset-password)
  --overwrite-lab       Si las variables de environment_variables ya existen, actualiza sus valores ficticios
  --admin-mail <email>  --admin-password <pass>  --admin-name <nombre>  --admin-dni <8d>
  --client-mail <email> --client-password <pass> --client-name <nombre> --client-dni <8d>
  --help, -h            Muestra esta ayuda
`);
}

function parseSeedArgs(argv = []) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function resolveSelectedTargets(args = {}) {
  const countries = Boolean(args.countries || args.paises);
  const provinces = Boolean(args.provinces || args.provincias || args.districts);
  const essayTypes = Boolean(args['essay-types'] || args.essayTypes || args.ensayos);
  const documents = Boolean(args.documents || args.documentos);
  const lab = Boolean(args.lab || args.laboratorio || args.env);
  const users = Boolean(args.users || args.usuarios);
  const admin = Boolean(args.admin);
  const client = Boolean(args.client);

  const hasSpecific = countries || provinces || essayTypes || documents || lab || users || admin || client;
  const runAll = Boolean(args.all) || !hasSpecific;

  return {
    countries: runAll || countries,
    provinces: runAll || provinces,
    essayTypes: runAll || essayTypes,
    documents: runAll || documents,
    lab: runAll || lab,
    adminUser: runAll || users || admin,
    clientUser: runAll || users || client,
    resetPasswords: Boolean(args['reset-passwords'] || args['reset-password'] || args.resetPasswords),
    overwriteLab: Boolean(args['overwrite-lab'] || args.overwriteLab)
  };
}

async function seedCountries(sequelize, qi, countriesList = ALL_COUNTRIES) {
  const [existingRows] = await sequelize.query('SELECT id, country_code FROM types_countries');
  const existingIds = new Set(existingRows.map((r) => String(r.id).trim()));
  const usedCodes = new Set(
    existingRows.map((r) => (r.country_code != null ? String(r.country_code).trim() : null)).filter(Boolean)
  );

  const toInsert = [];
  for (const c of countriesList) {
    if (existingIds.has(c.id)) continue;
    const cleanCode = c.country_code != null ? String(c.country_code).trim() : null;
    const safeCode = cleanCode && !usedCodes.has(cleanCode) ? c.country_code : null;
    if (cleanCode && safeCode) usedCodes.add(cleanCode);
    toInsert.push({ id: c.id, name: c.name, country_code: safeCode });
  }

  if (toInsert.length > 0) {
    await qi.bulkInsert('types_countries', toInsert, {});
  }

  return { inserted: toInsert.length, total: countriesList.length };
}

async function seedProvinces(sequelize, qi, provincesList = ARGENTINA_PROVINCES) {
  const argentina = ALL_COUNTRIES.find((c) => c.id === 'AR') || { id: 'AR', name: 'Argentina', country_code: '54 ' };
  await seedCountries(sequelize, qi, [argentina]);

  const [existingRows] = await sequelize.query('SELECT id, numeric_id FROM types_districts');
  const existingById = new Map(existingRows.map((r) => [String(r.id).trim(), r]));

  const toInsert = [];
  let updated = 0;

  for (const dist of provincesList) {
    const trimmedId = dist.id.trim();
    const current = existingById.get(trimmedId);
    if (!current) {
      toInsert.push(dist);
    } else if (current.numeric_id == null && dist.numeric_id != null) {
      await sequelize.query(
        'UPDATE types_districts SET numeric_id = :numericId, name = :name WHERE TRIM(id) = :trimmedId',
        { replacements: { numericId: dist.numeric_id, name: dist.name, trimmedId } }
      );
      updated += 1;
    }
  }

  if (toInsert.length > 0) {
    await qi.bulkInsert('types_districts', toInsert, {});
  }

  return { inserted: toInsert.length, updated, total: provincesList.length };
}

async function syncSerialSequence(sequelize, tableName) {
  try {
    await sequelize.query(
      `SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), COALESCE((SELECT MAX(id) FROM ${tableName}), 1), true);`
    );
  } catch (_) {}
}

async function seedEssayTypes(sequelize, qi, essayTypes = DEFAULT_ESSAY_TYPES) {
  const [existingRows] = await sequelize.query('SELECT id, name FROM types_essays');
  const existingIds = new Set(existingRows.map((r) => Number(r.id)));
  const existingNames = new Set(existingRows.map((r) => String(r.name || '').trim().toLowerCase()));

  const toInsert = essayTypes.filter(
    (t) => !existingIds.has(Number(t.id)) && !existingNames.has(String(t.name).trim().toLowerCase())
  );

  if (toInsert.length > 0) {
    await qi.bulkInsert('types_essays', toInsert, {});
  }
  await syncSerialSequence(sequelize, 'types_essays');

  return { inserted: toInsert.length, total: essayTypes.length };
}

async function seedDocumentTypes(sequelize, qi, docTypes = DEFAULT_DOCUMENT_TYPES) {
  const [existingRows] = await sequelize.query('SELECT id, code FROM types_documents');
  const existingIds = new Set(existingRows.map((r) => Number(r.id)));
  const existingCodes = new Set(existingRows.map((r) => String(r.code || '').trim().toUpperCase()));

  const toInsert = docTypes.filter(
    (d) => !existingIds.has(Number(d.id)) && !existingCodes.has(String(d.code).trim().toUpperCase())
  );

  if (toInsert.length > 0) {
    await qi.bulkInsert('types_documents', toInsert, {});
  }
  await syncSerialSequence(sequelize, 'types_documents');

  return { inserted: toInsert.length, total: docTypes.length };
}

async function seedLabEnvironmentVariables(sequelize, qi, vars = FICTITIOUS_LAB_ENV_VARIABLES, { overwrite = false } = {}) {
  const [existingRows] = await sequelize.query('SELECT id FROM environment_variables');
  const existingIds = new Set(existingRows.map((r) => String(r.id)));

  const toInsert = vars.filter((v) => !existingIds.has(v.id));
  let updated = 0;

  if (toInsert.length > 0) {
    await qi.bulkInsert('environment_variables', toInsert, {});
  }

  if (overwrite) {
    for (const v of vars) {
      if (!existingIds.has(v.id)) continue;
      await sequelize.query(
        `UPDATE environment_variables
         SET label = :label, type = :type, value_text = :value_text,
             value_number = :value_number, value_decimal = :value_decimal,
             value_timestamp = :value_timestamp, hardcoded = :hardcoded
         WHERE id = :id`,
        { replacements: v }
      );
      updated += 1;
    }
  }

  return { inserted: toInsert.length, updated, total: vars.length };
}

async function ensureFictitiousLaboratory({ sequelize, adminUserId }) {
  const [existingLabs] = await sequelize.query(
    'SELECT id, name, cuit, administrator FROM laboratories ORDER BY id ASC LIMIT 1'
  );
  if (existingLabs.length > 0) {
    return { status: 'already_exists', laboratory: existingLabs[0] };
  }

  if (!adminUserId) {
    throw new Error('Se requiere un usuario administrador (adminUserId) para crear el registro en laboratories.');
  }

  const [createdRows] = await sequelize.query(
    `INSERT INTO laboratories (name, cuit, administrator, mail, address, location, district, country)
     VALUES (:name, :cuit, :administrator, :mail, :address, :location, :district, :country)
     RETURNING id, name, cuit, administrator`,
    {
      replacements: {
        ...FICTITIOUS_LABORATORY,
        administrator: adminUserId
      }
    }
  );

  return { status: 'created', laboratory: createdRows[0] };
}

async function ensureLabMembershipDefault(sequelize, qi, userId, laboratoryId, role = 'ADMIN') {
  const tables = ['laboratory_members', 'laboratories_members'];
  for (const tableName of tables) {
    let desc;
    try {
      desc = await qi.describeTable(tableName);
    } catch (_) {
      continue;
    }
    if (!desc || !desc.user) continue;

    if (desc.laboratory && laboratoryId) {
      const [rows] = await sequelize.query(
        `SELECT role FROM ${tableName} WHERE "user" = :userId AND laboratory = :laboratoryId`,
        { replacements: { userId, laboratoryId } }
      );
      if (rows.length === 0) {
        await sequelize.query(
          `INSERT INTO ${tableName} (laboratory, "user", role) VALUES (:laboratoryId, :userId, :role)`,
          { replacements: { laboratoryId, userId, role } }
        );
      } else if (rows[0].role !== role) {
        await sequelize.query(
          `UPDATE ${tableName} SET role = :role WHERE "user" = :userId AND laboratory = :laboratoryId`,
          { replacements: { laboratoryId, userId, role } }
        );
      }
    } else if (!desc.laboratory) {
      const [rows] = await sequelize.query(
        `SELECT role FROM ${tableName} WHERE "user" = :userId`,
        { replacements: { userId } }
      );
      if (rows.length === 0) {
        await sequelize.query(
          `INSERT INTO ${tableName} ("user", role) VALUES (:userId, :role)`,
          { replacements: { userId, role } }
        );
      } else if (rows[0].role !== role) {
        await sequelize.query(
          `UPDATE ${tableName} SET role = :role WHERE "user" = :userId`,
          { replacements: { userId, role } }
        );
      }
    }
  }
}

/**
 * Crea o actualiza una cuenta de usuario base (Admin de Laboratorio o Cliente).
 * Si el usuario ya existe y `resetPasswords` es true, restablece su contraseña.
 */
async function seedUserAccount({
  userRepo,
  personRepo,
  hashFn,
  ensureLabMembershipFn,
  account,
  resetPasswords = false,
  labId = null
}) {
  const normalizedMail = String(account.mail || '').trim().toLowerCase();
  const isLab = account.profile === 'LABORATORY';
  const existing = await userRepo.findByMail(normalizedMail);

  let status;
  let userEntity;

  if (existing) {
    if (resetPasswords) {
      const newHash = await hashFn(account.password);
      await userRepo.updatePassword(existing.id, newHash);
    }

    const needsLabUpdate = isLab && labId && existing.laboratory !== labId;
    const needsProfileUpdate = existing.profile !== account.profile || existing.isActive === false;
    if (needsLabUpdate || needsProfileUpdate) {
      existing.profile = account.profile;
      existing.isActive = true;
      if (isLab && labId) existing.laboratory = labId;
      await userRepo.update(existing);
    }

    userEntity = existing;
    status = resetPasswords ? 'password_reset' : 'already_exists';
  } else {
    const passwordHash = await hashFn(account.password);
    const User = require('../../domain/users/entities/User');
    const newUser = new User({
      mail: normalizedMail,
      profile: account.profile,
      passwordHash,
      name: account.name,
      dni: account.dni,
      laboratory: isLab ? labId : null,
      isActive: true
    });
    userEntity = await userRepo.save(newUser);
    status = 'created';
  }

  const origin = isLab ? 'LABORATORY' : 'CLIENT';
  const existingPerson = await personRepo.findByUserId(userEntity.id);
  if (!existingPerson) {
    await personRepo.save({
      name: account.name,
      dni: account.dni,
      mail: normalizedMail,
      userId: userEntity.id,
      origin,
      isThirdParty: false
    });
  }

  if (isLab && typeof ensureLabMembershipFn === 'function') {
    await ensureLabMembershipFn(userEntity.id, labId, account.role || 'ADMIN');
  }

  return {
    status,
    id: userEntity.id,
    mail: normalizedMail,
    profile: account.profile
  };
}

function resolveUserAccountsWithOverrides(args = {}) {
  const defaults = getDefaultSeedUsers();
  return {
    labAdmin: {
      ...defaults.labAdmin,
      mail: args['admin-mail'] ? String(args['admin-mail']).trim().toLowerCase() : defaults.labAdmin.mail,
      password: args['admin-password'] ? String(args['admin-password']) : defaults.labAdmin.password,
      name: args['admin-name'] ? String(args['admin-name']).trim() : defaults.labAdmin.name,
      dni: args['admin-dni'] ? String(args['admin-dni']).trim() : defaults.labAdmin.dni
    },
    client: {
      ...defaults.client,
      mail: args['client-mail'] ? String(args['client-mail']).trim().toLowerCase() : defaults.client.mail,
      password: args['client-password'] ? String(args['client-password']) : defaults.client.password,
      name: args['client-name'] ? String(args['client-name']).trim() : defaults.client.name,
      dni: args['client-dni'] ? String(args['client-dni']).trim() : defaults.client.dni
    }
  };
}

async function runSeed(rawArgv = process.argv.slice(2)) {
  const args = Array.isArray(rawArgv) ? parseSeedArgs(rawArgv) : rawArgv;
  if (args.help) {
    printUsage();
    return { help: true };
  }

  const targets = resolveSelectedTargets(args);
  const accounts = resolveUserAccountsWithOverrides(args);

  const sequelize = require('../config/db');
  const qi = sequelize.getQueryInterface();
  const UserRepository = require('../repositories/users/UserRepository');
  const PersonRepository = require('../repositories/persons/PersonRepository');
  const { hash: hashPassword } = require('../auth/services/PasswordHasherService');

  const userRepo = new UserRepository();
  const personRepo = new PersonRepository();
  const summary = {};

  await sequelize.authenticate();

  try {
    if (targets.countries) {
      summary.countries = await seedCountries(sequelize, qi);
    }

    if (targets.provinces) {
      summary.provinces = await seedProvinces(sequelize, qi);
    }

    if (targets.essayTypes) {
      summary.essayTypes = await seedEssayTypes(sequelize, qi);
    }

    if (targets.documents) {
      summary.documents = await seedDocumentTypes(sequelize, qi);
    }

    let adminUserResult = null;
    let laboratoryResult = null;

    if (targets.adminUser || targets.lab) {
      if (targets.lab) {
        summary.environmentVariables = await seedLabEnvironmentVariables(sequelize, qi, FICTITIOUS_LAB_ENV_VARIABLES, {
          overwrite: targets.overwriteLab
        });
      }

      if (targets.adminUser) {
        adminUserResult = await seedUserAccount({
          userRepo,
          personRepo,
          hashFn: hashPassword,
          account: accounts.labAdmin,
          resetPasswords: targets.resetPasswords,
          labId: null
        });
      }

      // Resolver ID del administrador para crear/vincular el registro en laboratories
      let adminUserId = adminUserResult?.id || null;
      if (!adminUserId) {
        const existingAdmin = await userRepo.findByMail(accounts.labAdmin.mail);
        if (existingAdmin) {
          adminUserId = existingAdmin.id;
        } else {
          const [anyLabUser] = await sequelize.query(
            "SELECT id FROM users WHERE profile = 'LABORATORY' ORDER BY created_at ASC LIMIT 1"
          );
          if (anyLabUser.length > 0) {
            adminUserId = anyLabUser[0].id;
          } else {
            adminUserResult = await seedUserAccount({
              userRepo,
              personRepo,
              hashFn: hashPassword,
              account: accounts.labAdmin,
              resetPasswords: targets.resetPasswords,
              labId: null
            });
            adminUserId = adminUserResult.id;
          }
        }
      }

      laboratoryResult = await ensureFictitiousLaboratory({ sequelize, adminUserId });
      const labId = laboratoryResult.laboratory?.id || null;

      if (labId && adminUserId) {
        await sequelize.query('UPDATE users SET laboratory = :labId WHERE id = :adminUserId AND laboratory IS NULL', {
          replacements: { labId, adminUserId }
        });
        await ensureLabMembershipDefault(sequelize, qi, adminUserId, labId, 'ADMIN');
      }

      if (targets.lab) summary.laboratory = laboratoryResult;
      if (adminUserResult) summary.adminUser = adminUserResult;
    }

    if (targets.clientUser) {
      summary.clientUser = await seedUserAccount({
        userRepo,
        personRepo,
        hashFn: hashPassword,
        account: accounts.client,
        resetPasswords: targets.resetPasswords,
        labId: null
      });
    }

    return summary;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  runSeed(process.argv.slice(2))
    .then((res) => {
      if (!res?.help) {
        console.log('✅ Seedeo ejecutado correctamente:\n', JSON.stringify(res, null, 2));
      }
    })
    .catch((err) => {
      console.error('❌ Error ejecutando seedeo:', err);
      process.exitCode = 1;
    });
}

module.exports = {
  parseSeedArgs,
  resolveSelectedTargets,
  resolveUserAccountsWithOverrides,
  seedUserAccount,
  runSeed
};
