'use strict';

/**
 * Ajusta samples para que date_code pueda incluir la letra de la OT (yymmdd + letra).
 * - Cambia date_code a STRING(7).
 * - Elimina la columna work_order_letter si existiera de versiones anteriores.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    const transaction = await queryInterface.sequelize.transaction();
    try {
      const table = 'samples';
      const desc = await queryInterface.describeTable(table).catch(() => null);
      if (!desc) {
        await transaction.commit();
        return;
      }

      if (desc.date_code) {
        await queryInterface.changeColumn(
          table,
          'date_code',
          {
            type: Sequelize.STRING(7),
            allowNull: true
          },
          { transaction }
        );
      }

      if (desc.work_order_letter) {
        await queryInterface.removeColumn(table, 'work_order_letter', { transaction });
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
      const table = 'samples';
      const desc = await queryInterface.describeTable(table).catch(() => null);
      if (!desc) {
        await transaction.commit();
        return;
      }

      if (desc.date_code) {
        await queryInterface.changeColumn(
          table,
          'date_code',
          {
            type: Sequelize.STRING(6),
            allowNull: true
          },
          { transaction }
        );
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
