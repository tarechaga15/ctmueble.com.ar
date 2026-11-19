const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const UserTrustedDevice = sequelize.define(
  'user_trusted_devices',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    device_id: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    device_fingerprint: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    device_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    trusted_until: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'user_trusted_devices',
    timestamps: false
  }
);

module.exports = UserTrustedDevice;
