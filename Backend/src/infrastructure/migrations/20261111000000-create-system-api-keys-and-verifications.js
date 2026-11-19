'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Tabla system_api_keys
    await queryInterface.createTable('system_api_keys', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      service: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      encrypted_key: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      iv: {
        type: Sequelize.STRING(64),
        allowNull: false
      },
      tag: {
        type: Sequelize.STRING(64),
        allowNull: false
      },
      key_version: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'v1'
      },
      algorithm: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'AES-256-GCM'
      },
      key_hint: {
        type: Sequelize.STRING(30),
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      envelope: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('system_api_keys', ['service', 'is_active']);
    await queryInterface.addIndex('system_api_keys', ['provider']);

    // 2. Tabla email_verifications
    await queryInterface.createTable('email_verifications', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      mail: {
        type: Sequelize.STRING,
        allowNull: false
      },
      otp_code_hash: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      token_hash: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      verified_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('email_verifications', ['mail', 'verified_at']);
    await queryInterface.addIndex('email_verifications', ['token_hash']);
    await queryInterface.addIndex('email_verifications', ['expires_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('email_verifications');
    await queryInterface.dropTable('system_api_keys');
  }
};
