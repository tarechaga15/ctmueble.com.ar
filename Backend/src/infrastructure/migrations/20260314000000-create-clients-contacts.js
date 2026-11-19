'use strict';

const { DataTypes } = require('sequelize');

/**
 * Crea de forma idempotente la tabla intermedia `clients_contacts` (clientes <-> personas de contacto).
 */
module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    const transaction = await queryInterface.sequelize.transaction();
    try {
      const existing = await queryInterface.describeTable('clients_contacts').catch(() => null);
      if (!existing) {
        await queryInterface.createTable(
          'clients_contacts',
          {
            client: {
              type: DataTypes.UUID,
              primaryKey: true,
              allowNull: false,
              references: {
                model: 'clients',
                key: 'id'
              },
              onDelete: 'CASCADE',
              onUpdate: 'CASCADE'
            },
            contact: {
              type: DataTypes.UUID,
              primaryKey: true,
              allowNull: false,
              references: {
                model: 'persons',
                key: 'id'
              },
              onDelete: 'CASCADE',
              onUpdate: 'CASCADE'
            }
          },
          { transaction }
        );
      }

      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_clients_contacts_contact ON clients_contacts (contact);`,
        { transaction }
      );

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
      await queryInterface.dropTable('clients_contacts', { transaction }).catch(() => {});
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
