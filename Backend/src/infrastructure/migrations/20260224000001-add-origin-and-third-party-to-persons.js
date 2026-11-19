'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const tables = ['persons', 'contacts'];

    for (const tableName of tables) {
      let tableDesc;
      try {
        tableDesc = await queryInterface.describeTable(tableName);
      } catch (e) {
        // La tabla no existe en este motor; continuar con la siguiente
        continue;
      }

      if (!tableDesc.origin) {
        await queryInterface.addColumn(tableName, 'origin', {
          type: DataTypes.ENUM('CLIENT', 'LABORATORY', 'PUBLIC'),
          allowNull: true
        });
      }

      if (!tableDesc.is_third_party) {
        await queryInterface.addColumn(tableName, 'is_third_party', {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        });
      }
    }
  },

  async down(queryInterface) {
    const tables = ['persons', 'contacts'];

    for (const tableName of tables) {
      let tableDesc;
      try {
        tableDesc = await queryInterface.describeTable(tableName);
      } catch (e) {
        continue;
      }

      if (tableDesc.is_third_party) {
        await queryInterface.removeColumn(tableName, 'is_third_party');
      }

      if (tableDesc.origin) {
        await queryInterface.removeColumn(tableName, 'origin');
      }
    }
  }
};

