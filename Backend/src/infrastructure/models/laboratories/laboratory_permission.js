const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const LaboratoryPermission = sequelize.define(
  'laboratory_permissions',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    rol: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    accion: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    permitido: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'laboratory_permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['rol', 'accion']
      }
    ]
  }
);

module.exports = LaboratoryPermission;
