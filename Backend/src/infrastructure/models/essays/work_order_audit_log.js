const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const WorkOrderAuditLog = sequelize.define(
  'work_order_audit_logs',
  {
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
    event_code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    ip_address: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    client_name: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    device_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    device_fingerprint: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    session_id: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    record_hash: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previous_hash: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  },
  {
    tableName: 'work_order_audit_logs',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      { fields: ['work_order_id'] },
      { fields: ['user_id'] },
      { fields: ['timestamp'] }
    ]
  }
);

WorkOrderAuditLog.prototype.toJSON = function () {
  return { ...this.get() };
};

module.exports = WorkOrderAuditLog;
