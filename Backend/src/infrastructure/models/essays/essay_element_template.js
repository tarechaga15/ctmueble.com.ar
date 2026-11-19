const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const EssayElementTemplate = sequelize.define(
  "essay_element_templates",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    origin: {
      type: DataTypes.ENUM('CLIENT', 'LABORATORY'),
      allowNull: false,
      defaultValue: 'CLIENT',
    },
    product: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.CHAR(2),
      allowNull: true,
      references: { model: "types_countries", key: "id" },
    },
  },
  {
    tableName: "essay_element_templates",
    timestamps: false,
    freezeTableName: true,
  }
);

EssayElementTemplate.prototype.toJSON = function () {
  const values = { ...this.get() };
  if (values.countryData) {
    values.country = values.countryData;
    delete values.countryData;
  }
  if (values.origin === 'LABORATORY') {
    values.user_id = null;
  }
  return values;
};

module.exports = EssayElementTemplate;
