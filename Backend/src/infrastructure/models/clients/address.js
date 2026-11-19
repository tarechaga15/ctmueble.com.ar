const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const BusinesAddress = sequelize.define('bussiness_address', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    cuit: {
        type: DataTypes.STRING(12),
        allowNull: false,
        references: {
            model: 'bussiness',
            key: 'cuit'
        }
    },
    address: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    location: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    district: {
        type: DataTypes.CHAR(6),
        allowNull: true,
        references: {
            model: 'types_districts',
            key: 'id'
        }
    },
    origin: {
        type: DataTypes.ENUM('CLIENT', 'LABORATORY','PUBLIC'),
        allowNull: false,
        defaultValue: 'PUBLIC'
    },
    user: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: "bussiness_address",
    timestamps: false,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
    hasPrimaryKeys: true,
});

BusinesAddress.prototype.toJSON = function () {
  const values = { ...this.get() };
  if (values.districtData) {
    values.district = { id: values.districtData.id, name: values.districtData.name };
    delete values.districtData;
  } else if (values.district && typeof values.district === 'string') {
    values.district = { id: values.district, name: null };
  }
  return values;
};

module.exports = BusinesAddress;