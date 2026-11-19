const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const ClientsContacts = sequelize.define("clients_contacts", {
    client: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'clients',
            key: 'id'
        }
    },
    contact: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'persons',
            key: 'id'
        }
    }
}, {
    tableName: "clients_contacts",
    timestamps: false,
    freezeTableName: true
});

module.exports = ClientsContacts;