const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

/**
 * Tabla que almacena la información del cliente asociada a un ensayo.
 * Esta tabla mantiene un snapshot del cliente al momento de crear el ensayo,
 * independientemente de si el cliente cambia después.
 * 
 * Incluye tanto las referencias (FKs) como los datos en crudo para poder
 * detectar cambios en el origen y permitir al usuario decidir si actualizar.
 */
const EssayClient = sequelize.define(
  "essays_client",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    essay: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: "essays",
        key: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    cuit: {
      type: DataTypes.STRING(12),
      allowNull: false,
      references: {
        model: "bussiness",
        key: "cuit"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nombre o razón social del cliente'
    },
    address: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "bussiness_address",
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },
    representative: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "persons",
        key: "id"
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE"
    },
    contact: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "persons",
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },
    // Datos en crudo de bussiness_address (para detectar cambios)
    address_address: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Dirección completa'
    },
    address_location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Localidad'
    },
    address_province: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Provincia'
    },
    // Datos en crudo del representante (persons, para detectar cambios)
    representative_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nombre del representante'
    },
    representative_dni: {
      type: DataTypes.STRING(8),
      allowNull: true,
      comment: 'DNI del representante'
    },
    representative_contact: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID del contacto del representante'
    },
    // Datos en crudo de contacts (para detectar cambios)
    contact_name: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Nombre del contacto'
    },
    contact_dni: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'DNI del contacto'
    },
    contact_mail: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Email del contacto'
    },
    contact_country_code: {
      type: DataTypes.CHAR(3),
      allowNull: true,
      comment: 'Código de país del teléfono'
    },
    contact_phone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Teléfono del contacto'
    },
    contact_address: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Dirección del contacto'
    },
    contact_location: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Localidad del contacto'
    },
    contact_district: {
      type: DataTypes.CHAR(6),
      allowNull: true,
      comment: 'Distrito del contacto'
    },
    contact_country: {
      type: DataTypes.CHAR(2),
      allowNull: true,
      comment: 'País del contacto'
    },
    // Datos de facturación alternativa (snapshot)
    billing_cuit: {
      type: DataTypes.STRING(12),
      allowNull: true,
      comment: 'CUIT de facturación alternativa'
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
      comment: 'Si tributa IVA'
    }
  },
  {
    tableName: "essays_client",
    timestamps: false,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
    hasPrimaryKeys: true
  }
);

module.exports = EssayClient;

