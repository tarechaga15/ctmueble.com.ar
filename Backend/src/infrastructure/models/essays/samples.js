const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Sample = sequelize.define(
  "samples",
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    essay: {
      type: DataTypes.STRING(36),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "ANALYZED",
        "REJECTED",
        "SAVED",
        "RETURNED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },
    date_code: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    correlative: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    countersample: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    received_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    accepted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    internal_conditioning: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    result: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    work_order: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "work_orders", key: "id" },
    },
    height: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
    },
    width: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
    },
    thickness: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
    },
  },
  {
    tableName: "samples",
    timestamps: false,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
    hasPrimaryKeys: true,
  }
);

Sample.prototype.toJSON = function () {
  const values = { ...this.get() };
  return values;
};

module.exports = Sample;
