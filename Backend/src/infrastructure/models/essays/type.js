const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const EssayType = sequelize.define("types_essays", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
},
{
    tableName: "types_essays",
    timestamps: false,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
    hasPrimaryKeys: true,
});

module.exports = EssayType;