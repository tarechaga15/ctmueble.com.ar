'use strict';

/**
 * Añade columna origin (CLIENT | LABORATORY) a essay_element_templates
 * y permite user_id NULL para plantillas de laboratorio.
 */
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') {
      return;
    }

    const tableDesc = await queryInterface.describeTable('essay_element_templates').catch(() => null);
    if (!tableDesc) return;

    if (!tableDesc.origin) {
      await queryInterface.addColumn('essay_element_templates', 'origin', {
        type: DataTypes.ENUM('CLIENT', 'LABORATORY'),
        allowNull: false,
        defaultValue: 'CLIENT'
      });
      await queryInterface.sequelize.query(
        `UPDATE essay_element_templates SET origin = 'CLIENT' WHERE origin IS NULL`
      ).catch(() => {});
    }

    await queryInterface.sequelize.query(`
      ALTER TABLE essay_element_templates ALTER COLUMN user_id DROP NOT NULL;
    `).catch(() => {});
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') {
      return;
    }

    const tableDesc = await queryInterface.describeTable('essay_element_templates').catch(() => null);
    if (!tableDesc) return;

    if (tableDesc.origin) {
      await queryInterface.removeColumn('essay_element_templates', 'origin');
    }

    await queryInterface.sequelize.query(`
      UPDATE essay_element_templates SET user_id = (SELECT id FROM users LIMIT 1) WHERE user_id IS NULL;
      ALTER TABLE essay_element_templates ALTER COLUMN user_id SET NOT NULL;
    `).catch(() => {});
  }
};
