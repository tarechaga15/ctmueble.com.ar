'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    const dialect = queryInterface.sequelize.getDialect();
    const isPostgres = dialect === 'postgres';

    try {
      if (isPostgres) {
        // 1. Agregar columna name a essays_client si no existe
        await queryInterface.sequelize.query(
          'ALTER TABLE essays_client ADD COLUMN IF NOT EXISTS name VARCHAR(100);',
          { transaction }
        );

        // 2. Poblar name desde clients para registros existentes que no tengan name
        await queryInterface.sequelize.query(`
          UPDATE essays_client ec
          SET name = COALESCE(c.name, b.name)
          FROM clients c
          LEFT JOIN bussiness b ON c.cuit = b.cuit
          WHERE ec.cuit = c.cuit AND (ec.name IS NULL OR ec.name = '');
        `, { transaction });

        // 3. Poblar name desde bussiness para cualquier registro que siga sin name
        await queryInterface.sequelize.query(`
          UPDATE essays_client ec
          SET name = b.name
          FROM bussiness b
          WHERE ec.cuit = b.cuit AND (ec.name IS NULL OR ec.name = '');
        `, { transaction });
      } else {
        await queryInterface.addColumn('essays_client', 'name', {
          type: Sequelize.STRING(100),
          allowNull: true
        }, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('essays_client', 'name', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
