'use strict';

/**
 * Unifica emisión de orden de trabajo con recepción de muestras.
 * work_orders: quitar price y essay_type_id; añadir essay_track_code e internal_aconditioning; ampliar code a 16 caracteres.
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

      if (desc.price) {
        await queryInterface.removeColumn(table, 'price', { transaction });
      }
      if (desc.essay_type_id) {
        await queryInterface.removeColumn(table, 'essay_type_id', { transaction });
      }
      if (!desc.essay_track_code) {
        await queryInterface.addColumn(table, 'essay_track_code', {
          type: Sequelize.STRING(64),
          allowNull: true
        }, { transaction });
      }
      if (!desc.internal_aconditioning) {
        await queryInterface.addColumn(table, 'internal_aconditioning', {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false
        }, { transaction });
      }

      await queryInterface.sequelize.query(
        `ALTER TABLE work_orders ALTER COLUMN code TYPE VARCHAR(16)`,
        { transaction }
      );

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

      if (desc.internal_aconditioning) {
        await queryInterface.removeColumn(table, 'internal_aconditioning', { transaction });
      }
      if (desc.essay_track_code) {
        await queryInterface.removeColumn(table, 'essay_track_code', { transaction });
      }
      if (!desc.price) {
        await queryInterface.addColumn(table, 'price', {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true
        }, { transaction });
      }
      if (!desc.essay_type_id) {
        await queryInterface.addColumn(table, 'essay_type_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'types_essays', key: 'id' }
        }, { transaction });
      }

      await queryInterface.sequelize.query(
        `ALTER TABLE work_orders ALTER COLUMN code TYPE VARCHAR(6)`,
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
