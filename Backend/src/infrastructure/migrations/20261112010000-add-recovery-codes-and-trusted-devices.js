'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    const tableNames = tables.map((t) => (typeof t === 'string' ? t : t.tableName || t.name));

    // 1. Tabla user_recovery_codes (Códigos de recuperación de emergencia)
    if (!tableNames.includes('user_recovery_codes')) {
      await queryInterface.createTable('user_recovery_codes', {
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
        code_hash: {
          type: Sequelize.STRING(128),
          allowNull: false
        },
        used: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        used_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      await queryInterface.addIndex('user_recovery_codes', ['user_id', 'used']);
    }

    // 2. Tabla user_trusted_devices (Dispositivos de confianza para omitir 2FA por 7 días)
    if (!tableNames.includes('user_trusted_devices')) {
      await queryInterface.createTable('user_trusted_devices', {
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
        device_id: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        device_fingerprint: {
          type: Sequelize.STRING(128),
          allowNull: false
        },
        device_name: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        ip_address: {
          type: Sequelize.STRING(45),
          allowNull: true
        },
        trusted_until: {
          type: Sequelize.DATE,
          allowNull: false
        },
        is_revoked: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        last_used_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      await queryInterface.addIndex('user_trusted_devices', ['user_id', 'device_id', 'is_revoked']);
      await queryInterface.addIndex('user_trusted_devices', ['trusted_until']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    const tableNames = tables.map((t) => (typeof t === 'string' ? t : t.tableName || t.name));

    if (tableNames.includes('user_trusted_devices')) {
      await queryInterface.dropTable('user_trusted_devices');
    }
    if (tableNames.includes('user_recovery_codes')) {
      await queryInterface.dropTable('user_recovery_codes');
    }
  }
};
