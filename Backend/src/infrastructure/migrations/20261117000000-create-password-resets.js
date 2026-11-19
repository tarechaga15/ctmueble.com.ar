'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('password_resets', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false
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
      used_at: {
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

    await queryInterface.addIndex('password_resets', ['mail', 'used_at']);
    await queryInterface.addIndex('password_resets', ['token_hash']);
    await queryInterface.addIndex('password_resets', ['expires_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('password_resets');
  }
};
