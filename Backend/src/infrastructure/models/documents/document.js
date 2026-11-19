const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Document = sequelize.define('essays_documents', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    essay: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "essays",
            key: "id"
        }
    },
    type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "types_documents",
            key: "id"
        }
    },
    copy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    modificated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    generated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    file: {
        type: DataTypes.STRING,
        allowNull: false,
    }
},{
    tableName: "essays_documents",
    timestamps: false,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
    hasPrimaryKeys: true,
});


module.exports = Document;