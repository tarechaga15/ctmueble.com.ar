'use strict';

/**
 * Añade a work_orders: closed_at (fecha de cierre al emitir informe).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    const transaction = await queryInterface.sequelize.transaction();
    try {
      const table = 'work_orders';
      const desc = await queryInterface.describeTable(table).catch(() => null);
      if (!desc) {
        await transaction.commit();
        return;
      }

      if (!desc.closed_at) {
        await queryInterface.addColumn(table, 'closed_at', {
          type: Sequelize.DATE,
          allowNull: true
        }, { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    const transaction = await queryInterface.sequelize.transaction();
    try {
      const table = 'work_orders';
      const desc = await queryInterface.describeTable(table).catch(() => null);
      if (!desc) {
        await transaction.commit();
        return;
      }

      if (desc.closed_at) {
        await queryInterface.removeColumn(table, 'closed_at', { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
