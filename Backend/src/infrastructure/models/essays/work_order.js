const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const WorkOrder = sequelize.define(
  "work_orders",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    essay_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "essays", key: "id" },
    },
    code: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    essay_track_code: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    report_delivery_deadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    samples_received_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sample_dimensions: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    sample_width: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
    },
    sample_height: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
    },
    sample_thickness: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
    },
    generated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    internal_aconditioning: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    uncertainty: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    average_value: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "WAITING_SAMPLES",
        "ANALYZING",
        "COMPLETED",
        "CANCELLED"
      ),
      allowNull: false,
      defaultValue: "WAITING_SAMPLES",
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_update: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de última actualización (se actualiza al registrar un evento de auditoría)'
    },
  },
  {
    tableName: "work_orders",
    timestamps: false,
    freezeTableName: true,
  }
);

WorkOrder.prototype.toJSON = function () {
  return { ...this.get() };
};

module.exports = WorkOrder;
