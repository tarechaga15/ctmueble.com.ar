const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const SystemApiKey = sequelize.define(
  'system_api_keys',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    // Servicio o propósito (ej: 'MAILING', 'AFIP', 'PAYMENTS', 'STORAGE')
    service: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    // Proveedor del servicio (ej: 'RESEND', 'SENDGRID', 'AWS_SES')
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    // Nombre descriptivo asignado por el administrador
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    // Texto cifrado en AES-256-GCM (Base64)
    encrypted_key: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    // Vector de inicialización de 96 bits (Base64)
    iv: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    // Authentication Tag de 128 bits (Base64)
    tag: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    // Versión de la clave maestra utilizada (ej: 'v1')
    key_version: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'v1'
    },
    // Algoritmo de cifrado utilizado
    algorithm: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'AES-256-GCM'
    },
    // Pistas de la clave para mostrar en la interfaz sin exponerla (ej: 're_...1234')
    key_hint: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    // Metadatos adicionales (ej: fromEmail, fromName, endpoint)
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    // Envelope data si se utilizó KMS Envelope Encryption
    envelope: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    tableName: 'system_api_keys',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['service', 'is_active'] },
      { fields: ['provider'] }
    ]
  }
);

module.exports = SystemApiKey;
