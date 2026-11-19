const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const EmailVerification = sequelize.define(
  'email_verifications',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true
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
    verified_at: {
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
    tableName: 'email_verifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['mail', 'verified_at'] },
      { fields: ['token_hash'] },
      { fields: ['expires_at'] }
    ]
  }
);

module.exports = EmailVerification;
