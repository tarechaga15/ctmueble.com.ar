'use strict';

/**
 * Añade a work_orders: uncertainty (incertidumbre, desde variable de entorno al crear)
 * y average_value (valor promedio, al emitir informe).
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

      if (!desc.uncertainty) {
        await queryInterface.addColumn(table, 'uncertainty', {
          type: Sequelize.STRING(64),
          allowNull: true
        }, { transaction });
      }
      if (!desc.average_value) {
        await queryInterface.addColumn(table, 'average_value', {
          type: Sequelize.DECIMAL(12, 4),
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

      if (desc.uncertainty) {
        await queryInterface.removeColumn(table, 'uncertainty', { transaction });
      }
      if (desc.average_value) {
        await queryInterface.removeColumn(table, 'average_value', { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
