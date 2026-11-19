const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Laboratory = sequelize.define(
  'laboratories',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cuit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    administrator: {
      type: DataTypes.UUID,
      allowNull: false
    },
    mail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    district: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'laboratories',
    timestamps: false
  }
);

module.exports = Laboratory;
