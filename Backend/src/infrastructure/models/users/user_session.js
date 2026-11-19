const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const UserSession = sequelize.define(
  'user_sessions',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      autoIncrement: false,
      defaultValue: DataTypes.UUIDV4
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    client_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    is_revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    last_active_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    tableName: 'user_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'last_active_at'
  }
);

module.exports = UserSession;
