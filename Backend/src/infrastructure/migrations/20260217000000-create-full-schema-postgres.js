'use strict';

/**
 * Migración completa del esquema para PostgreSQL (Neon).
 * Solo se ejecuta cuando el dialecto es 'postgres'.
 * Crea todas las tablas en orden de dependencias.
 */

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') {
      return;
    }

    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Extensión para UUID (Sequelize usa uuid_generate_v4() con DataTypes.UUIDV4)
      await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', { transaction });

      // 1) types_countries
      await queryInterface.createTable('types_countries', {
        id: { type: DataTypes.CHAR(2), primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        country_code: { type: DataTypes.CHAR(3), allowNull: true }
      }, { transaction });
      await queryInterface.addIndex('types_countries', ['country_code'], { unique: true, transaction }).catch(() => {});

      // 2) types_districts
      await queryInterface.createTable('types_districts', {
        id: { type: DataTypes.CHAR(6), primaryKey: true },
        country: {
          type: DataTypes.CHAR(2),
          allowNull: true,
          references: { model: 'types_countries', key: 'id' }
        },
        name: { type: DataTypes.STRING, allowNull: false }
      }, { transaction });

      // 3) types_documents
      await queryInterface.createTable('types_documents', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        code: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        filesheet: { type: DataTypes.STRING, allowNull: false }
      }, { transaction });

      // 4) environment_variables
      await queryInterface.createTable('environment_variables', {
        id: { type: DataTypes.STRING, primaryKey: true },
        label: { type: DataTypes.STRING, allowNull: false },
        type: {
          type: DataTypes.ENUM('TEXT', 'NUMBER', 'DECIMAL', 'TIMESTAMP'),
          allowNull: false
        },
        value_text: { type: DataTypes.STRING, allowNull: true },
        value_number: { type: DataTypes.INTEGER, allowNull: true },
        value_decimal: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
        value_timestamp: { type: DataTypes.DATE, allowNull: true },
        hardcoded: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
      }, { transaction });

      // 5) users (columna laboratory sin FK aún; laboratories se crea después)
      await queryInterface.createTable('users', {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        name: { type: DataTypes.STRING, allowNull: false },
        dni: { type: DataTypes.STRING(8), allowNull: false },
        mail: { type: DataTypes.STRING, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
        profile: { type: DataTypes.STRING, allowNull: false },
        laboratory: { type: DataTypes.UUID, allowNull: true },
        created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
      }, { transaction });
      await queryInterface.addIndex('users', ['mail'], { unique: true, transaction });

      // 6) laboratories (administrator -> users)
      await queryInterface.createTable('laboratories', {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        name: { type: DataTypes.STRING, allowNull: false },
        cuit: { type: DataTypes.STRING, allowNull: false },
        administrator: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' }
        },
        mail: { type: DataTypes.STRING, allowNull: false },
        address: { type: DataTypes.STRING, allowNull: false },
        location: { type: DataTypes.STRING, allowNull: false },
        district: { type: DataTypes.STRING, allowNull: false },
        country: { type: DataTypes.STRING, allowNull: false }
      }, { transaction });

      // FK users.laboratory -> laboratories (DEFERRABLE para que se valide al COMMIT)
      await queryInterface.sequelize.query(
        `ALTER TABLE users ADD CONSTRAINT users_laboratory_fkey
         FOREIGN KEY (laboratory) REFERENCES laboratories (id)
         ON DELETE SET NULL ON UPDATE CASCADE
         DEFERRABLE INITIALLY DEFERRED`,
        { transaction }
      );

      // 7) laboratories_members
      await queryInterface.createTable('laboratories_members', {
        laboratory: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          references: { model: 'laboratories', key: 'id' }
        },
        user: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          references: { model: 'users', key: 'id' }
        },
        role: {
          type: DataTypes.ENUM('ADMIN', 'USER'),
          allowNull: false,
          defaultValue: 'USER'
        }
      }, { transaction });

      // 8) bussiness
      await queryInterface.createTable('bussiness', {
        cuit: { type: DataTypes.STRING(12), primaryKey: true },
        name: { type: DataTypes.STRING(100), allowNull: false }
      }, { transaction });

      // 9) bussiness_address
      await queryInterface.createTable('bussiness_address', {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        cuit: {
          type: DataTypes.STRING(12),
          allowNull: false,
          references: { model: 'bussiness', key: 'cuit' }
        },
        address: { type: DataTypes.STRING(100), allowNull: false },
        location: { type: DataTypes.STRING(100), allowNull: false },
        province: { type: DataTypes.STRING(100), allowNull: false },
        origin: {
          type: DataTypes.ENUM('CLIENT', 'LABORATORY', 'PUBLIC'),
          allowNull: false,
          defaultValue: 'PUBLIC'
        },
        user: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' }
        }
      }, { transaction });

      // 10) contacts
      await queryInterface.createTable('contacts', {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        name: { type: DataTypes.STRING, allowNull: false },
        dni: { type: DataTypes.STRING, allowNull: false },
        mail: { type: DataTypes.STRING, allowNull: false },
        country_code: {
          type: DataTypes.CHAR(3),
          allowNull: false,
          references: { model: 'types_countries', key: 'country_code' }
        },
        phone: { type: DataTypes.STRING, allowNull: false },
        address: { type: DataTypes.STRING, allowNull: false },
        location: { type: DataTypes.STRING, allowNull: false },
        district: {
          type: DataTypes.CHAR(6),
          allowNull: false,
          references: { model: 'types_districts', key: 'id' }
        },
        country: {
          type: DataTypes.CHAR(2),
          allowNull: false,
          references: { model: 'types_countries', key: 'id' }
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' }
        }
      }, { transaction });
      await queryInterface.addIndex('contacts', ['user_id'], { unique: true, transaction });

      // 11) bussiness_representatives
      await queryInterface.createTable('bussiness_representatives', {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        name: { type: DataTypes.STRING(100), allowNull: false },
        dni: { type: DataTypes.STRING(8), allowNull: false },
        contact: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'contacts', key: 'id' }
        }
      }, { transaction });
      await queryInterface.addIndex('bussiness_representatives', ['contact'], { name: 'idx_bussiness_representatives_contact', transaction });

      // 12) clients
      await queryInterface.createTable('clients', {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        cuit: {
          type: DataTypes.STRING(12),
          allowNull: false,
          references: { model: 'bussiness', key: 'cuit' }
        },
        address: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'bussiness_address', key: 'id' }
        },
        representative: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'bussiness_representatives', key: 'id' }
        },
        origin: {
          type: DataTypes.ENUM('CLIENT', 'LABORATORY'),
          allowNull: false,
          defaultValue: 'CLIENT'
        },
        user: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' }
        }
      }, { transaction });

      // 13) clients_contacts
      await queryInterface.createTable('clients_contacts', {
        client: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          references: { model: 'clients', key: 'id' }
        },
        contact: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          references: { model: 'contacts', key: 'id' }
        }
      }, { transaction });

      // 14) types_essays
      await queryInterface.createTable('types_essays', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: { type: DataTypes.STRING, allowNull: false }
      }, { transaction });

      // 15) essays
      await queryInterface.createTable('essays', {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        client: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'clients', key: 'id' }
        },
        contact: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'contacts', key: 'id' }
        },
        laboratory: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'laboratories', key: 'id' }
        },
        essay: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          references: { model: 'types_essays', key: 'id' }
        },
        request_date: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        signing_date: { type: DataTypes.DATE, allowNull: true },
        finish_date: { type: DataTypes.DATE, allowNull: true },
        due_date: { type: DataTypes.DATE, allowNull: true },
        observations: { type: DataTypes.TEXT, allowNull: true },
        status: {
          type: DataTypes.ENUM('IN_PROCESS', 'IN_WORK', 'COMPLETED', 'CANCELLED', 'ARCHIVED'),
          allowNull: false,
          defaultValue: 'IN_PROCESS'
        },
        procedure_status: {
          type: DataTypes.ENUM('REQUESTED', 'SIGNING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'),
          allowNull: false,
          defaultValue: 'REQUESTED'
        },
        work_status: {
          type: DataTypes.ENUM('WAITING_SAMPLES', 'ANALYZING', 'COMPLETED', 'CANCELLED'),
          allowNull: false,
          defaultValue: 'WAITING_SAMPLES'
        },
        code: { type: DataTypes.STRING(6), allowNull: false },
        result: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
        uncertainty: { type: DataTypes.DECIMAL(12, 2), allowNull: true }
      }, { transaction });

      // 16) essays_elements (con country para la asociación Country)
      await queryInterface.createTable('essays_elements', {
        essay: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          references: { model: 'essays', key: 'id' }
        },
        product: { type: DataTypes.STRING, allowNull: false },
        manufacturer: { type: DataTypes.STRING, allowNull: false },
        date: { type: DataTypes.DATE, allowNull: false },
        country: {
          type: DataTypes.CHAR(2),
          allowNull: true,
          references: { model: 'types_countries', key: 'id' }
        }
      }, { transaction });

      // 17) essays_terms
      await queryInterface.createTable('essays_terms', {
        essay: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          references: { model: 'essays', key: 'id' }
        },
        days_to_do: { type: DataTypes.INTEGER, allowNull: false },
        samples_conservation_days: { type: DataTypes.INTEGER, allowNull: false },
        price: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
      }, { transaction });

      // 18) essays_billing
      await queryInterface.createTable('essays_billing', {
        essay: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          references: { model: 'essays', key: 'id' }
        },
        cuit: {
          type: DataTypes.STRING(12),
          allowNull: false,
          references: { model: 'bussiness', key: 'cuit' }
        },
        address: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'bussiness_address', key: 'id' }
        },
        amount: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: true,
          defaultValue: 0.0
        },
        pays_iva: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
      }, { transaction });

      // 19) samples
      await queryInterface.createTable('samples', {
        id: { type: DataTypes.STRING(36), primaryKey: true, allowNull: false },
        essay: { type: DataTypes.STRING(36), allowNull: false },
        status: {
          type: DataTypes.ENUM('PENDING', 'ANALYZED', 'REJECTED', 'SAVED', 'RETURNED'),
          allowNull: false,
          defaultValue: 'PENDING'
        },
        date_code: { type: DataTypes.STRING(6), allowNull: true },
        correlative: { type: DataTypes.INTEGER, allowNull: false },
        countersample: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        received_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        accepted: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
        internal_conditioning: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
        observations: { type: DataTypes.TEXT, allowNull: true },
        result: { type: DataTypes.DECIMAL(12, 2), allowNull: true }
      }, { transaction });

      // 20) essay_audit_logs
      await queryInterface.createTable('essay_audit_logs', {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        essay: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'essays', key: 'id' }
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' }
        },
        event_code: { type: DataTypes.STRING(50), allowNull: false },
        timestamp: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        metadata: { type: DataTypes.JSONB, allowNull: true }
      }, { transaction });
      await queryInterface.addIndex('essay_audit_logs', ['essay'], { transaction });
      await queryInterface.addIndex('essay_audit_logs', ['user_id'], { transaction });
      await queryInterface.addIndex('essay_audit_logs', ['timestamp'], { transaction });
      await queryInterface.addIndex('essay_audit_logs', ['event_code'], { transaction });

      // 21) essays_client
      await queryInterface.createTable('essays_client', {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        essay: {
          type: DataTypes.UUID,
          allowNull: false,
          unique: true,
          references: { model: 'essays', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        cuit: {
          type: DataTypes.STRING(12),
          allowNull: false,
          references: { model: 'bussiness', key: 'cuit' }
        },
        address: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'bussiness_address', key: 'id' }
        },
        representative: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'bussiness_representatives', key: 'id' }
        },
        contact: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'contacts', key: 'id' }
        }
      }, { transaction });
      await queryInterface.addIndex('essays_client', ['essay'], { name: 'idx_essays_client_essay', unique: true, transaction });
      await queryInterface.addIndex('essays_client', ['cuit'], { name: 'idx_essays_client_cuit', transaction });
      await queryInterface.addIndex('essays_client', ['address'], { name: 'idx_essays_client_address', transaction });
      await queryInterface.addIndex('essays_client', ['representative'], { name: 'idx_essays_client_representative', transaction });
      await queryInterface.addIndex('essays_client', ['contact'], { name: 'idx_essays_client_contact', transaction });

      // 22) essays_documents (PK compuesta id + essay)
      await queryInterface.createTable('essays_documents', {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        essay: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          references: { model: 'essays', key: 'id' }
        },
        type: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'types_documents', key: 'id' }
        },
        copy: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        modificated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        generated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        file: { type: DataTypes.STRING, allowNull: false }
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') {
      return;
    }

    const transaction = await queryInterface.sequelize.transaction();

    try {
      const tables = [
        'essays_documents',
        'essays_client',
        'essay_audit_logs',
        'samples',
        'essays_billing',
        'essays_terms',
        'essays_elements',
        'essays',
        'types_essays',
        'clients_contacts',
        'clients',
        'bussiness_representatives',
        'contacts',
        'bussiness_address',
        'bussiness',
        'laboratories_members',
        'laboratories',
        'users',
        'environment_variables',
        'types_documents',
        'types_districts',
        'types_countries'
      ];

      for (const table of tables) {
        await queryInterface.dropTable(table, { cascade: true, transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
