const { DataTypes } = require("sequelize");
const sequelize = require('../config/db');

const Env = sequelize.define('environment_variables', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('TEXT', 'NUMBER', 'DECIMAL', 'TIMESTAMP'),
        allowNull: false
    },
    value_text: {
        type: DataTypes.STRING,
        allowNull: true
    },
    value_number: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    value_decimal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },
    value_timestamp: {
        type: DataTypes.DATE,
        allowNull: true
    },
    hardcoded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
}, {
    tableName: 'environment_variables',
    timestamps: false,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
    hasPrimaryKeys: true,
});

module.exports = Env;