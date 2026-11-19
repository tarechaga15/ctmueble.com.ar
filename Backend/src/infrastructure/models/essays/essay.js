const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Essay = sequelize.define(
  'essays',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    essay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    request_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    signing_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    finish_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(
        'REQUESTED',
        'ACCEPTED',
        'REJECTED',
        'SERVICE_AGREEMENT_MADED',
        'IN_WORK',
        'COMPLETED',
        'CANCELLED'
      ),
      allowNull: false,
      defaultValue: 'REQUESTED'
    },
    code: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    last_update: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de última actualización (se actualiza al registrar un evento de auditoría)'
    },
    last_report_generated: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha del último informe emitido (se actualiza al emitir informe original, modificación o copia)'
    },
    result: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    uncertainty: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    client_notifications_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica si el solicitante autorizó recibir notificaciones por correo'
    },
    notification_token: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      comment: 'Token único para baja de suscripción de notificaciones por correo'
    }
  },
  {
    tableName: 'essays',
    timestamps: false
  }
);

Essay.prototype.toJSON = function () {
  return { ...this.get() };
};

module.exports = Essay;
