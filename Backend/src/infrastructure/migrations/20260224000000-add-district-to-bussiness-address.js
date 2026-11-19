'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    const tableDesc = await queryInterface.describeTable('bussiness_address');
    if (tableDesc.district) return;

    await queryInterface.addColumn('bussiness_address', 'district', {
      type: DataTypes.CHAR(6),
      allowNull: true,
      references: {
        model: 'types_districts',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface) {
    const tableDesc = await queryInterface.describeTable('bussiness_address');
    if (!tableDesc.district) return;

    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === 'postgres') {
      const [constraints] = await queryInterface.sequelize.query(
        `SELECT constraint_name FROM information_schema.table_constraints 
         WHERE table_schema = 'public' AND table_name = 'bussiness_address' 
           AND constraint_type = 'FOREIGN KEY' 
           AND constraint_name LIKE '%district%'`
      );
      const name = Array.isArray(constraints) && constraints.length > 0 ? constraints[0].constraint_name : null;
      if (name) {
        await queryInterface.sequelize.query(`ALTER TABLE bussiness_address DROP CONSTRAINT "${name}"`);
      }
    }
    await queryInterface.removeColumn('bussiness_address', 'district');
  }
};
