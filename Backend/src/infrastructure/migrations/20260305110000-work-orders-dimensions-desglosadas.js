'use strict';

/**
 * Añade dimensiones desglosadas a work_orders: sample_width, sample_height, sample_thickness (ancho, largo, espesor).
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

      if (!desc.sample_width) {
        await queryInterface.addColumn(table, 'sample_width', {
          type: Sequelize.DECIMAL(12, 4),
          allowNull: true
        }, { transaction });
      }
      if (!desc.sample_height) {
        await queryInterface.addColumn(table, 'sample_height', {
          type: Sequelize.DECIMAL(12, 4),
          allowNull: true
        }, { transaction });
      }
      if (!desc.sample_thickness) {
        await queryInterface.addColumn(table, 'sample_thickness', {
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

      if (desc.sample_width) {
        await queryInterface.removeColumn(table, 'sample_width', { transaction });
      }
      if (desc.sample_height) {
        await queryInterface.removeColumn(table, 'sample_height', { transaction });
      }
      if (desc.sample_thickness) {
        await queryInterface.removeColumn(table, 'sample_thickness', { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
