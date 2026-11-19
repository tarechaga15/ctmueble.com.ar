const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Bussiness = sequelize.define('bussiness', {
    cuit: {
        type: DataTypes.STRING(12),
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: "bussiness",
    timestamps: false,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
    hasPrimaryKeys: true,
});

module.exports = Bussiness;