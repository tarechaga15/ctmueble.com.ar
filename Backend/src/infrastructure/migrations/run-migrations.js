/**
 * Script para ejecutar migraciones de Sequelize manualmente
 * Uso:
 *   node -r dotenv/config src/infrastructure/migrations/run-migrations.js [up|down|undo|status]
 */

const sequelize = require('../config/db');
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
const fs = require('fs');

async function runMigrations() {
  const command = process.argv[2] || 'up';

  // Verificar que el directorio de migraciones existe
  const migrationsPath = path.join(__dirname);
  if (!fs.existsSync(migrationsPath)) {
    console.error('❌ El directorio de migraciones no existe:', migrationsPath);
    process.exit(1);
  }

  // Listar archivos de migración encontrados (excluyendo run-migrations.js)
  const migrationFiles = fs.readdirSync(migrationsPath)
    .filter(file => {
      // Solo archivos .js que empiecen con números (formato de migración: YYYYMMDDHHMMSS-nombre.js)
      return file.endsWith('.js') && 
             file !== 'run-migrations.js' && 
             /^\d{14,}-/.test(file);
    })
    .sort();
  
  if (command !== 'status') {
    console.log(`📁 Archivos de migración encontrados: ${migrationFiles.length}`);
    if (migrationFiles.length > 0) {
      migrationFiles.forEach(file => console.log(`   - ${file}`));
    }
  }

  const umzug = new Umzug({
    migrations: {
      glob: path.resolve(__dirname, '[0-9]*.js').replace(/\\/g, '/'),
      resolve: ({ name, path: migrationPath }) => {
        const basename = path.basename(migrationPath);
        
        // Verificar que el archivo esté en la lista de migraciones válidas
        if (!migrationFiles.includes(basename)) {
          return null;
        }
        try {
          const migration = require(migrationPath);
          if (!migration.up || !migration.down) {
            console.warn(`⚠️  Archivo ${basename} no tiene métodos up/down, se omite`);
            return null;
          }
          return {
            name,
            up: async () => {
              const queryInterface = sequelize.getQueryInterface();
              await migration.up(queryInterface, sequelize.constructor);
            },
            down: async () => {
              const queryInterface = sequelize.getQueryInterface();
              await migration.down(queryInterface, sequelize.constructor);
            },
          };
        } catch (error) {
          console.warn(`⚠️  Error cargando migración ${basename}:`, error.message);
          console.error(error);
          return null;
        }
      },
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ 
      sequelize,
      tableName: 'SequelizeMeta'
    }),
    logger: console,
  });

  try {
    let executedMigrations;

    switch (command) {
      case 'up':
        console.log('🔄 Ejecutando migraciones pendientes...');
        executedMigrations = await umzug.up();
        if (executedMigrations.length === 0) {
          console.log('✅ No hay migraciones pendientes');
        } else {
          console.log(`✅ ${executedMigrations.length} migración(es) ejecutada(s):`);
          executedMigrations.forEach(m => console.log(`   - ${m.name}`));
        }
        break;

      case 'down':
        console.log('🔄 Revirtiendo última migración...');
        executedMigrations = await umzug.down();
        if (executedMigrations.length === 0) {
          console.log('✅ No hay migraciones para revertir');
        } else {
          console.log(`✅ ${executedMigrations.length} migración(es) revertida(s):`);
          executedMigrations.forEach(m => console.log(`   - ${m.name}`));
        }
        break;

      case 'undo':
        console.log('🔄 Revirtiendo última migración ejecutada...');
        executedMigrations = await umzug.down({ to: 0 });
        if (executedMigrations.length === 0) {
          console.log('✅ No hay migraciones para revertir');
        } else {
          console.log(`✅ ${executedMigrations.length} migración(es) revertida(s):`);
          executedMigrations.forEach(m => console.log(`   - ${m.name}`));
        }
        break;

      case 'status':
        const pending = await umzug.pending();
        const executed = await umzug.executed();
        console.log('\n📊 Estado de migraciones:');
        console.log(`   Ejecutadas: ${executed.length}`);
        console.log(`   Pendientes: ${pending.length}`);
        console.log(`   Total archivos: ${migrationFiles.length}`);
        
        // Verificar qué migraciones están en la BD (PostgreSQL requiere comillas en el nombre de tabla)
        const metaTable = sequelize.getDialect() === 'postgres' ? '"SequelizeMeta"' : 'SequelizeMeta';
        const [dbMigrations] = await sequelize.query(
          `SELECT name FROM ${metaTable} ORDER BY name`
        );
        console.log(`   Registradas en BD: ${dbMigrations.length}`);
        
        if (executed.length > 0) {
          console.log('\n   Migraciones ejecutadas (según umzug):');
          executed.forEach(m => console.log(`   ✅ ${m.name}`));
        }
        if (dbMigrations.length > 0) {
          console.log('\n   Migraciones registradas en BD:');
          dbMigrations.forEach(m => console.log(`   📝 ${m.name}`));
        }
        if (pending.length > 0) {
          console.log('\n   Migraciones pendientes:');
          pending.forEach(m => console.log(`   ⏳ ${m.name}`));
        } else if (migrationFiles.length > 0 && pending.length === 0 && executed.length === 0) {
          console.log('\n   ⚠️  Hay archivos de migración pero no se detectan como pendientes.');
          console.log('   Esto puede indicar que:');
          console.log('   1. La migración ya fue ejecutada manualmente');
          console.log('   2. Hay un problema con el formato del archivo de migración');
          console.log('   3. El nombre de la migración no coincide');
        }
        break;

      default:
        console.error(`❌ Comando desconocido: ${command}`);
        console.log('Uso: node run-migrations.js [up|down|undo|status]');
        process.exit(1);
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    await sequelize.close();
    process.exit(1);
  }
}

// Verificar conexión antes de ejecutar
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida');
    return runMigrations();
  })
  .catch(err => {
    console.error('❌ Error conectando a la base de datos:', err);
    process.exit(1);
  });

