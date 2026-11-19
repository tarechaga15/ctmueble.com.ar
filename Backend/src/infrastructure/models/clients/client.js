const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Client = sequelize.define(
  "clients",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    cuit: {
      type: DataTypes.STRING(12),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    address: {
      type: DataTypes.UUID,
      allowNull: true
    },
    address_address: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    address_location: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    address_province: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    address_district: {
      type: DataTypes.CHAR(6),
      allowNull: true
    },
    /**
     * FK a persons.id - representante legal del cliente
     */
    representative: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'persons',
        key: 'id'
      }
    },
    /**
     * FK a persons.id - contacto adicional del cliente (después de representative)
     */
    contact: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'persons',
        key: 'id'
      }
    },
    origin: {
      type: DataTypes.ENUM('CLIENT', 'LABORATORY'),
      allowNull: false,
      defaultValue: 'CLIENT'
    },
    billing_cuit: {
      type: DataTypes.STRING(12),
      allowNull: true,
      comment: 'CUIT alternativa para facturación'
    },
    billing_address: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Dirección de facturación alternativa'
    },
    billing_location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Localidad de facturación alternativa'
    },
    billing_province: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Provincia de facturación alternativa'
    },
    billing_iva: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Si tributa IVA (true) o no (false)'
    },
    user: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    tableName: "clients",
    timestamps: false,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
    hasPrimaryKeys: true,
  }
);

module.exports = Client;
