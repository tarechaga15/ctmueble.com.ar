const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const PasswordReset = sequelize.define(
  'password_resets',
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
    mail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    otp_code_hash: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    token_hash: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: 'password_resets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['mail', 'used_at'] },
      { fields: ['token_hash'] },
      { fields: ['expires_at'] }
    ]
  }
);

module.exports = PasswordReset;
