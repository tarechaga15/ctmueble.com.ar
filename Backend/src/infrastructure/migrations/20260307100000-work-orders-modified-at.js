'use strict';

/**
 * Añade a work_orders: modified_at (fecha de modificación posterior al informe emitido).
 * Se actualiza cuando se cargan resultados o se modifica la orden después de haber emitido el informe.
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

      if (!desc.modified_at) {
        await queryInterface.addColumn(table, 'modified_at', {
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

      if (desc.modified_at) {
        await queryInterface.removeColumn(table, 'modified_at', { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
