'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    const dialect = queryInterface.sequelize.getDialect();
    const isPostgres = dialect === 'postgres';

    try {
      if (isPostgres) {
        await queryInterface.sequelize.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS name VARCHAR(100);', { transaction });
        await queryInterface.sequelize.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_address VARCHAR(100);', { transaction });
        await queryInterface.sequelize.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_location VARCHAR(100);', { transaction });
        await queryInterface.sequelize.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_province VARCHAR(100);', { transaction });
        await queryInterface.sequelize.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_district CHAR(6);', { transaction });
        await queryInterface.sequelize.query('ALTER TABLE clients ALTER COLUMN address DROP NOT NULL;', { transaction });
        await queryInterface.sequelize.query('ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_cuit_fkey;', { transaction });
        await queryInterface.sequelize.query('ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_address_fkey;', { transaction });

        await queryInterface.sequelize.query('ALTER TABLE essays_client ALTER COLUMN address DROP NOT NULL;', { transaction });
        await queryInterface.sequelize.query('ALTER TABLE essays_client DROP CONSTRAINT IF EXISTS essays_client_cuit_fkey;', { transaction });
        await queryInterface.sequelize.query('ALTER TABLE essays_client DROP CONSTRAINT IF EXISTS essays_client_address_fkey;', { transaction });

        await queryInterface.sequelize.query(`
          UPDATE clients c
          SET name = b.name
          FROM bussiness b
          WHERE c.cuit = b.cuit AND (c.name IS NULL OR c.name = '');
        `, { transaction });

        await queryInterface.sequelize.query(`
          UPDATE clients c
          SET address_address = a.address,
              address_location = a.location,
              address_province = COALESCE(td.name, a.district),
              address_district = a.district
          FROM bussiness_address a
          LEFT JOIN types_districts td ON td.id = a.district
          WHERE c.address = a.id AND (c.address_address IS NULL OR c.address_address = '');
        `, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // No-op or revert columns
  }
};
