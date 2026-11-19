'use strict';

/**
 * Crea tabla work_order_audit_logs para auditoría de órdenes de trabajo.
 */
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    const tableName = 'work_order_audit_logs';
    const exists = await queryInterface.sequelize
      .query(`SELECT to_regclass('public.${tableName}')`)
      .then(([[r]]) => r.to_regclass != null);

    if (exists) return;

    await queryInterface.createTable(tableName, {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      work_order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'work_orders', key: 'id', onDelete: 'CASCADE' }
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      event_code: { type: DataTypes.STRING(50), allowNull: false },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      metadata: { type: DataTypes.JSON, allowNull: true }
    });

    await queryInterface.addIndex(tableName, ['work_order_id']);
    await queryInterface.addIndex(tableName, ['user_id']);
    await queryInterface.addIndex(tableName, ['timestamp']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('work_order_audit_logs').catch(() => {});
  }
};
