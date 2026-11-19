const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Elements = sequelize.define(
  "essays_elements",
  {
    essay: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "essays",
        key: "id",
      },
    },
    product: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    country: {
      type: DataTypes.CHAR(2),
      allowNull: true,
      references: {
        model: "types_countries",
        key: "id",
      },
    },
    batch_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "essays_elements",
    timestamps: false,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
    hasPrimaryKeys: true,
  }
);

Elements.prototype.toJSON = function () {
  const values = { ...this.get() };
  if (values.countryData) {
    values.country = values.countryData;
    delete values.countryData;
  }
  return values;
};

module.exports = Elements;
