const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/db");

const Districts = sequelize.define("types_districts", {
  id: {
    type: DataTypes.CHAR(6),
    primaryKey: true
  },
  country: {
    type: DataTypes.CHAR(2),
    references: {
      model: "types_countries",
      key: "id"
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numeric_id: {
    type: DataTypes.INTEGER,
    allowNull: true
    
  }
}, {
  tableName: "types_districts",
  timestamps: false,
  freezeTableName: true,
  createdAt: false,
  updatedAt: false,
  hasPrimaryKeys: true,
});

module.exports = Districts;