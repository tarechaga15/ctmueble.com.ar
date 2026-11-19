const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const LabMembers = sequelize.define("laboratory_members", {
    user: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "users",
            key: "id"
        }
    },
    role: {
        type: DataTypes.ENUM("ADMIN", "USER", "CONSULTA"),
        allowNull: false,
        defaultValue: "USER"
    }
},
{
    tableName: "laboratory_members",
    timestamps: false
});

module.exports = LabMembers;
