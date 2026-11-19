const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const SecurityAuditLog = sequelize.define(
  'security_audit_logs',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    request_id: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    session_id: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    action: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    resource: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    resource_id: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    outcome: {
      type: DataTypes.STRING(24),
      allowNull: false,
      defaultValue: 'SUCCESS'
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
      type: DataTypes.JSONB,
      allowNull: true
    }
  },
  {
    tableName: 'security_audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

module.exports = SecurityAuditLog;
