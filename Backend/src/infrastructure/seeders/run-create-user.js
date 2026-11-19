// Ejecutar con:
//   node -r dotenv/config src/infrastructure/seeders/run-create-user.js --mail user@example.com --password secret --name "Juan Pérez" --dni 12345678
//   npm run create-user -- --mail user@example.com --password secret --name "Juan Pérez" --dni 12345678 --profile CLIENT
//   npm run create-user -- --mail user@example.com --password NuevaClave123! --name "Juan Pérez" --dni 12345678 --reset-password

'use strict';

const sequelize = require('../config/db');
const User = require('../../domain/users/entities/User');
const UserRepository = require('../repositories/users/UserRepository');
const PersonRepository = require('../repositories/persons/PersonRepository');
const { hash: hashPassword } = require('../auth/services/PasswordHasherService');

const VALID_PROFILES = ['CLIENT', 'LABORATORY'];
const VALID_ROLES = ['ADMIN', 'USER', 'CONSULTA'];

function printUsage() {
  console.log(`
Uso:
  node -r dotenv/config src/infrastructure/seeders/run-create-user.js [opciones]

Opciones obligatorias:
  --mail             Email del usuario (único)
  --password         Contraseña en texto plano
  --name             Nombre completo (obligatorio al crear)
  --dni              DNI (8 caracteres, obligatorio al crear)

Opciones adicionales:
  --profile          Perfil del usuario: CLIENT | LABORATORY (default: CLIENT)
  --role             Rol de laboratorio cuando profile=LABORATORY: ADMIN | USER | CONSULTA (default: ADMIN)
  --reset-password   Si el usuario ya existe, restablece su contraseña y asegura su estado activo
  --help             Muestra esta ayuda

Ejemplos:
  npm run create-user -- --mail admin@ctm.com --password MiClave123! --name "Admin CTM" --dni 30123456 --profile LABORATORY --role ADMIN
  npm run create-user -- --mail admin@ctm.com --password NuevaClave123! --reset-password
`);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
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
      i++;
    }
  }
  return args;
}

function validateArgs(args) {
  const errors = [];
  const resetPassword = Boolean(args['reset-password'] || args['reset-passwords'] || args.resetPassword);

  if (!args.mail) errors.push('--mail es obligatorio');
  if (!args.password) errors.push('--password es obligatorio');
  if (!resetPassword) {
    if (!args.name) errors.push('--name es obligatorio');
    if (!args.dni) errors.push('--dni es obligatorio');
  }
  if (args.dni && String(args.dni).length !== 8) {
    errors.push('--dni debe tener exactamente 8 caracteres');
  }

  const profile = args.profile ? String(args.profile).toUpperCase() : null;
  if (profile && !VALID_PROFILES.includes(profile)) {
    errors.push(`--profile debe ser uno de: ${VALID_PROFILES.join(', ')}`);
  }

  const role = String(args.role || 'ADMIN').toUpperCase();
  if (!VALID_ROLES.includes(role)) {
    errors.push(`--role debe ser uno de: ${VALID_ROLES.join(', ')}`);
  }

  return { errors, profile: profile || 'CLIENT', hasExplicitProfile: Boolean(profile), role, resetPassword };
}

async function ensureLabMembership(userId, laboratoryId, role) {
  const qi = sequelize.getQueryInterface();
  for (const tableName of ['laboratory_members', 'laboratories_members']) {
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
      } else {
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
      } else {
        await sequelize.query(
          `UPDATE ${tableName} SET role = :role WHERE "user" = :userId`,
          { replacements: { userId, role } }
        );
      }
    }
  }
}

async function createOrResetUser({ mail, password, name, dni, profile, hasExplicitProfile, role, resetPassword }) {
  const userRepository = new UserRepository();
  const personRepository = new PersonRepository();

  const existing = await userRepository.findByMail(mail);
  if (existing && !resetPassword) {
    const err = new Error(`El correo "${mail}" ya está registrado (id: ${existing.id}). Use --reset-password para restablecer la contraseña.`);
    err.code = 'MAIL_ALREADY_EXISTS';
    throw err;
  }

  const passwordHash = await hashPassword(password);

  if (existing) {
    await userRepository.updatePassword(existing.id, passwordHash);
    if (name) existing.name = name;
    if (dni) existing.dni = dni;
    if (hasExplicitProfile) existing.profile = profile;
    existing.isActive = true;
    await userRepository.update(existing);

    const existingPerson = await personRepository.findByUserId(existing.id);
    if (!existingPerson) {
      await personRepository.save({
        name: existing.name,
        dni: existing.dni,
        mail: existing.mail,
        userId: existing.id,
        origin: existing.profile === 'LABORATORY' ? 'LABORATORY' : 'CLIENT',
        isThirdParty: false
      });
    }

    if (existing.profile === 'LABORATORY') {
      const [labs] = await sequelize.query('SELECT id FROM laboratories ORDER BY id ASC LIMIT 1');
      const labId = existing.laboratory || labs[0]?.id || null;
      await ensureLabMembership(existing.id, labId, role);
    }

    return { user: existing, action: 'password_reset' };
  }

  let labId = null;
  if (profile === 'LABORATORY') {
    const [labs] = await sequelize.query('SELECT id FROM laboratories ORDER BY id ASC LIMIT 1');
    labId = labs[0]?.id || null;
  }

  const user = new User({
    mail,
    profile,
    passwordHash,
    name,
    dni,
    laboratory: labId,
    isActive: true
  });

  const saved = await userRepository.save(user);

  const personOrigin = profile === 'LABORATORY' ? 'LABORATORY' : 'CLIENT';
  await personRepository.save({
    name,
    dni,
    mail,
    userId: saved.id,
    origin: personOrigin,
    isThirdParty: false
  });

  if (profile === 'LABORATORY') {
    await ensureLabMembership(saved.id, labId, role);
  }

  return { user: saved, action: 'created' };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  const { errors, profile, hasExplicitProfile, role, resetPassword } = validateArgs(args);
  if (errors.length > 0) {
    console.error('❌ Parámetros inválidos:\n');
    errors.forEach((e) => console.error(`  - ${e}`));
    console.error('');
    printUsage();
    process.exitCode = 1;
    return;
  }

  try {
    await sequelize.authenticate();

    const { user, action } = await createOrResetUser({
      mail: args.mail.trim(),
      password: args.password,
      name: args.name ? args.name.trim() : null,
      dni: args.dni ? String(args.dni).trim() : null,
      profile,
      hasExplicitProfile,
      role,
      resetPassword
    });

    console.log(action === 'password_reset' ? '✅ Contraseña restablecida correctamente' : '✅ Usuario creado correctamente');
    console.log(`   id:      ${user.id}`);
    console.log(`   mail:    ${user.mail}`);
    console.log(`   name:    ${user.name}`);
    console.log(`   dni:     ${user.dni}`);
    console.log(`   profile: ${user.profile}`);
  } catch (e) {
    console.error('❌ Error al procesar usuario:', e.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
