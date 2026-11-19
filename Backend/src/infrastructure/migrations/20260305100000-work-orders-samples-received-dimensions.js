'use strict';

/**
 * Añade a work_orders: samples_received_at (fecha de recepción de muestras) y sample_dimensions (dimensiones de las muestras).
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

      if (!desc.samples_received_at) {
        await queryInterface.addColumn(table, 'samples_received_at', {
          type: Sequelize.DATE,
          allowNull: true
        }, { transaction });
      }
      if (!desc.sample_dimensions) {
        await queryInterface.addColumn(table, 'sample_dimensions', {
          type: Sequelize.STRING(255),
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

      if (desc.samples_received_at) {
        await queryInterface.removeColumn(table, 'samples_received_at', { transaction });
      }
      if (desc.sample_dimensions) {
        await queryInterface.removeColumn(table, 'sample_dimensions', { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
