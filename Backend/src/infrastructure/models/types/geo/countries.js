const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/db");

const Countries = sequelize.define("types_countries", {
  id: {
    type: DataTypes.CHAR(2),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country_code: {
    type: DataTypes.CHAR(3),
    allowNull: true
  }
}, {
  tableName: "types_countries",
  timestamps: false,
  freezeTableName: true,
  createdAt: false,
  updatedAt: false,
  hasPrimaryKeys: true,
});

module.exports = Countries;