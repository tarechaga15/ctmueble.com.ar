'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Agregar columnas de 2FA a tabla users si no existen
    const tableInfo = await queryInterface.describeTable('users');

    if (!tableInfo.two_factor_enabled) {
      await queryInterface.addColumn('users', 'two_factor_enabled', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }

    if (!tableInfo.two_factor_method) {
      await queryInterface.addColumn('users', 'two_factor_method', {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'NONE'
      });
    }

    if (!tableInfo.two_factor_secret) {
      await queryInterface.addColumn('users', 'two_factor_secret', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!tableInfo.two_factor_temp_secret) {
      await queryInterface.addColumn('users', 'two_factor_temp_secret', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!tableInfo.two_factor_confirmed_at) {
      await queryInterface.addColumn('users', 'two_factor_confirmed_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    // 2. Crear tabla user_sessions
    const tables = await queryInterface.showAllTables();
    const sessionTableExists = tables.some(
      (t) => (typeof t === 'string' ? t : t.tableName || t.name) === 'user_sessions'
    );

    if (!sessionTableExists) {
      await queryInterface.createTable('user_sessions', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        ip_address: {
          type: Sequelize.STRING(45),
          allowNull: true
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        client_name: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        is_revoked: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        last_active_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: false
        }
      });

      await queryInterface.addIndex('user_sessions', ['user_id', 'is_revoked']);
      await queryInterface.addIndex('user_sessions', ['expires_at']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    const sessionTableExists = tables.some(
      (t) => (typeof t === 'string' ? t : t.tableName || t.name) === 'user_sessions'
    );
    if (sessionTableExists) {
      await queryInterface.dropTable('user_sessions');
    }

    const tableInfo = await queryInterface.describeTable('users');
    if (tableInfo.two_factor_confirmed_at) await queryInterface.removeColumn('users', 'two_factor_confirmed_at');
    if (tableInfo.two_factor_temp_secret) await queryInterface.removeColumn('users', 'two_factor_temp_secret');
    if (tableInfo.two_factor_secret) await queryInterface.removeColumn('users', 'two_factor_secret');
    if (tableInfo.two_factor_method) await queryInterface.removeColumn('users', 'two_factor_method');
    if (tableInfo.two_factor_enabled) await queryInterface.removeColumn('users', 'two_factor_enabled');
  }
};
