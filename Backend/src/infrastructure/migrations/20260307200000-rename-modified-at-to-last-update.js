'use strict';

/**
 * Renombra modified_at a last_update en essays y work_orders.
 * last_update se actualiza al registrar un evento de auditoría.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    const transaction = await queryInterface.sequelize.transaction();
    try {
      for (const table of ['essays', 'work_orders']) {
        const desc = await queryInterface.describeTable(table).catch(() => null);
        if (!desc) continue;
        if (desc.modified_at && !desc.last_update) {
          await queryInterface.renameColumn(table, 'modified_at', 'last_update', { transaction });
        } else if (!desc.last_update) {
          await queryInterface.addColumn(table, 'last_update', {
            type: Sequelize.DATE,
            allowNull: true
          }, { transaction });
        }
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
      for (const table of ['essays', 'work_orders']) {
        const desc = await queryInterface.describeTable(table).catch(() => null);
        if (!desc) continue;
        if (desc.last_update && !desc.modified_at) {
          await queryInterface.renameColumn(table, 'last_update', 'modified_at', { transaction });
        } else if (desc.last_update) {
          await queryInterface.removeColumn(table, 'last_update', { transaction });
        }
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
