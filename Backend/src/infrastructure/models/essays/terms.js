const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Terms = sequelize.define("essays_terms", {
    essay: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "essays",
            key: "id"   
        }
    },
    days_to_do: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    samples_conservation_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
},
{
    tableName: "essays_terms",
    timestamps: false,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
    hasPrimaryKeys: true,
}
);

module.exports = Terms;