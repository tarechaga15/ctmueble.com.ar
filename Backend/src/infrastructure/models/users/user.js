const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const User = sequelize.define(
  'users',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      autoIncrement: false,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dni: {
      type: DataTypes.STRING(8),
      allowNull: false
    },
    mail: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profile: {
      type: DataTypes.STRING,
      allowNull: false
    },
    laboratory: {
      type: DataTypes.UUID,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    two_factor_method: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'NONE'
    },
    two_factor_secret: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    two_factor_temp_secret: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    two_factor_confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    defaultScope: {
      attributes: { exclude: ['password', 'two_factor_secret', 'two_factor_temp_secret'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password', 'two_factor_secret', 'two_factor_temp_secret'] }
      },
      withTwoFactorSecret: {
        attributes: { include: ['two_factor_secret', 'two_factor_temp_secret'] }
      }
    }
  }
);

module.exports = User;
