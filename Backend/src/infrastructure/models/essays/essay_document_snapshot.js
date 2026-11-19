'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const EssayDocumentSnapshot = sequelize.define(
  'essay_document_snapshots',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    essay_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'essays',
        key: 'id'
      }
    },
    document_type: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    event_code: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    snapshot_data: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    canonical_hash: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    signature_algorithm: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'HMAC-SHA256'
    },
    ots_status: {
      type: DataTypes.STRING(24),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    ots_proof: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ots_calendar_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ots_stamped_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ots_error: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    session_id: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    device_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    device_fingerprint: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    client_name: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'essay_document_snapshots',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ['essay_id', 'document_type', 'version'],
        name: 'idx_snapshots_essay_doc_version'
      },
      {
        fields: ['canonical_hash'],
        name: 'idx_snapshots_canonical_hash'
      },
      {
        fields: ['ots_status'],
        name: 'idx_snapshots_ots_status'
      },
      {
        fields: ['created_at'],
        name: 'idx_snapshots_created_at'
      }
    ]
  }
);

EssayDocumentSnapshot.prototype.toJSON = function () {
  return { ...this.get() };
};

module.exports = EssayDocumentSnapshot;
