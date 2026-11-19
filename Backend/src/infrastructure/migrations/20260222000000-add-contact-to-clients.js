'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const tableDescription = await queryInterface.describeTable('clients');
    if (tableDescription.contact) return;

    await queryInterface.addColumn('clients', 'contact', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'persons',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface) {
    const tableDescription = await queryInterface.describeTable('clients');
    if (!tableDescription.contact) return;

    await queryInterface.removeColumn('clients', 'contact');
  }
};
