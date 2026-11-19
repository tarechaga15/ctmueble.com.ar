'use strict';

/**
 * Añade la columna last_report_generated a essays.
 * Se actualiza al emitir informe (original, modificación o copia). Se usa para determinar
 * si el reporte a emitir es una modificación (lastUpdate > last_report_generated).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    const transaction = await queryInterface.sequelize.transaction();
    try {
      const desc = await queryInterface.describeTable('essays').catch(() => null);
      if (desc && !desc.last_report_generated) {
        await queryInterface.addColumn('essays', 'last_report_generated', {
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

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    const transaction = await queryInterface.sequelize.transaction();
    try {
      const desc = await queryInterface.describeTable('essays').catch(() => null);
      if (desc && desc.last_report_generated) {
        await queryInterface.removeColumn('essays', 'last_report_generated', { transaction });
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
