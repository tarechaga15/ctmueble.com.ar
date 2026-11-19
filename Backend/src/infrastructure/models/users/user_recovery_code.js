const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const UserRecoveryCode = sequelize.define(
  'user_recovery_codes',
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
    code_hash: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'user_recovery_codes',
    timestamps: false
  }
);

module.exports = UserRecoveryCode;
