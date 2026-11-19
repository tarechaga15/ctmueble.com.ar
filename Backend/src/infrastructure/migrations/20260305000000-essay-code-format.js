'use strict';

/**
 * Actualiza el formato del código de ensayo para permitir yyyymmdd + letra.
 * Amplía essays.code a 16 caracteres (como work_orders.code).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    const transaction = await queryInterface.sequelize.transaction();
    try {
      const table = 'essays';
      const desc = await queryInterface.describeTable(table).catch(() => null);
      if (!desc || !desc.code) {
        await transaction.commit();
        return;
      }

      await queryInterface.sequelize.query(
        `ALTER TABLE ${table} ALTER COLUMN code TYPE VARCHAR(16)`,
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    const transaction = await queryInterface.sequelize.transaction();
    try {
      const table = 'essays';
      const desc = await queryInterface.describeTable(table).catch(() => null);
      if (!desc || !desc.code) {
        await transaction.commit();
        return;
      }

      await queryInterface.sequelize.query(
        `ALTER TABLE ${table} ALTER COLUMN code TYPE VARCHAR(6)`,
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};

