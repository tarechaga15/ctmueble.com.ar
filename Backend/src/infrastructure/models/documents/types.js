const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Types = sequelize.define('types_documents', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    filesheet: {
        type: DataTypes.STRING,
        allowNull: false,
    }
},{
    tableName: "types_documents",
    timestamps: false,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
    hasPrimaryKeys: true,
});

module.exports = Types;