'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableNames = await queryInterface.showAllTables();
    const normalizedTables = tableNames.map((t) => (typeof t === 'string' ? t : t.tableName || t.name));

    // 1. Crear tabla essay_document_snapshots si no existe
    if (!normalizedTables.includes('essay_document_snapshots')) {
      await queryInterface.createTable('essay_document_snapshots', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.literal('gen_random_uuid()')
        },
        essay_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'essays',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        document_type: {
          type: Sequelize.STRING(32),
          allowNull: false,
          comment: 'Código del documento snapshot (F-PC13-01, F-PC13-02, etc.)'
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
          comment: 'Versión secuencial de la snapshot para este ensayo y tipo de documento'
        },
        event_code: {
          type: Sequelize.STRING(64),
          allowNull: false,
          comment: 'Evento que motivó la captura del snapshot'
        },
        snapshot_data: {
          type: Sequelize.JSONB,
          allowNull: false,
          comment: 'Contenido canónico y estructurado de los datos al momento de la snapshot'
        },
        canonical_hash: {
          type: Sequelize.STRING(64),
          allowNull: false,
          comment: 'Hash SHA-256 canónico (RFC 8785) de snapshot_data'
        },
        signature: {
          type: Sequelize.TEXT,
          allowNull: false,
          comment: 'Firma criptográfica del hash'
        },
        signature_algorithm: {
          type: Sequelize.STRING(32),
          allowNull: false,
          defaultValue: 'HMAC-SHA256'
        },
        ots_status: {
          type: Sequelize.STRING(24),
          allowNull: false,
          defaultValue: 'PENDING',
          comment: 'Estado de timestamping OpenTimestamps: PENDING, STAMPED, FAILED, SKIPPED'
        },
        ots_proof: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Prueba criptográfica de OpenTimestamps codificada en Base64'
        },
        ots_calendar_url: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'URL del servidor de calendario OpenTimestamps que certificó la fecha cierta'
        },
        ots_stamped_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Fecha y hora cierta certificada por OpenTimestamps'
        },
        ots_error: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        session_id: {
          type: Sequelize.STRING(64),
          allowNull: true
        },
        device_id: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Identificador único del dispositivo'
        },
        device_fingerprint: {
          type: Sequelize.STRING(128),
          allowNull: true,
          comment: 'Huella digital del dispositivo'
        },
        client_name: {
          type: Sequelize.STRING(120),
          allowNull: true,
          comment: 'Navegador y sistema operativo identificado'
        },
        ip_address: {
          type: Sequelize.STRING(64),
          allowNull: true
        },
        user_agent: {
          type: Sequelize.STRING(512),
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      // Índices para búsquedas e integridad de versión
      try {
        await queryInterface.addIndex('essay_document_snapshots', ['essay_id', 'document_type', 'version'], {
          unique: true,
          name: 'idx_snapshots_essay_doc_version'
        });
      } catch (_) {}

      try {
        await queryInterface.addIndex('essay_document_snapshots', ['canonical_hash'], {
          name: 'idx_snapshots_canonical_hash'
        });
      } catch (_) {}

      try {
        await queryInterface.addIndex('essay_document_snapshots', ['ots_status'], {
          name: 'idx_snapshots_ots_status'
        });
      } catch (_) {}

      try {
        await queryInterface.addIndex('essay_document_snapshots', ['created_at'], {
          name: 'idx_snapshots_created_at'
        });
      } catch (_) {}
    }

    // 2. Extender security_audit_logs con columnas de dispositivo e integridad criptográfica
    const safeAddColumn = async (tableName, colName, colDef) => {
      try {
        await queryInterface.addColumn(tableName, colName, colDef);
      } catch (_) {}
    };

    if (normalizedTables.includes('security_audit_logs')) {
      await safeAddColumn('security_audit_logs', 'device_id', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      await safeAddColumn('security_audit_logs', 'device_fingerprint', {
        type: Sequelize.STRING(128),
        allowNull: true
      });
      await safeAddColumn('security_audit_logs', 'client_name', {
        type: Sequelize.STRING(120),
        allowNull: true
      });
      await safeAddColumn('security_audit_logs', 'record_hash', {
        type: Sequelize.STRING(64),
        allowNull: true
      });
      await safeAddColumn('security_audit_logs', 'signature', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      await safeAddColumn('security_audit_logs', 'previous_hash', {
        type: Sequelize.STRING(64),
        allowNull: true
      });
    }

    // 3. Extender essay_audit_logs con dispositivo e integridad criptográfica
    if (normalizedTables.includes('essay_audit_logs')) {
      await safeAddColumn('essay_audit_logs', 'device_id', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      await safeAddColumn('essay_audit_logs', 'device_fingerprint', {
        type: Sequelize.STRING(128),
        allowNull: true
      });
      await safeAddColumn('essay_audit_logs', 'client_name', {
        type: Sequelize.STRING(120),
        allowNull: true
      });
      await safeAddColumn('essay_audit_logs', 'ip_address', {
        type: Sequelize.STRING(64),
        allowNull: true
      });
      await safeAddColumn('essay_audit_logs', 'user_agent', {
        type: Sequelize.STRING(512),
        allowNull: true
      });
      await safeAddColumn('essay_audit_logs', 'session_id', {
        type: Sequelize.STRING(64),
        allowNull: true
      });
      await safeAddColumn('essay_audit_logs', 'record_hash', {
        type: Sequelize.STRING(64),
        allowNull: true
      });
      await safeAddColumn('essay_audit_logs', 'signature', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      await safeAddColumn('essay_audit_logs', 'previous_hash', {
        type: Sequelize.STRING(64),
        allowNull: true
      });
    }

    // 4. Extender work_order_audit_logs con dispositivo e integridad criptográfica
    if (normalizedTables.includes('work_order_audit_logs')) {
      await safeAddColumn('work_order_audit_logs', 'device_id', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      await safeAddColumn('work_order_audit_logs', 'device_fingerprint', {
        type: Sequelize.STRING(128),
        allowNull: true
      });
      await safeAddColumn('work_order_audit_logs', 'client_name', {
        type: Sequelize.STRING(120),
        allowNull: true
      });
      await safeAddColumn('work_order_audit_logs', 'ip_address', {
        type: Sequelize.STRING(64),
        allowNull: true
      });
      await safeAddColumn('work_order_audit_logs', 'user_agent', {
        type: Sequelize.STRING(512),
        allowNull: true
      });
      await safeAddColumn('work_order_audit_logs', 'session_id', {
        type: Sequelize.STRING(64),
        allowNull: true
      });
      await safeAddColumn('work_order_audit_logs', 'record_hash', {
        type: Sequelize.STRING(64),
        allowNull: true
      });
      await safeAddColumn('work_order_audit_logs', 'signature', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      await safeAddColumn('work_order_audit_logs', 'previous_hash', {
        type: Sequelize.STRING(64),
        allowNull: true
      });
    }
  },

  down: async (queryInterface) => {
    try {
      await queryInterface.dropTable('essay_document_snapshots');
    } catch (_) {}
  }
};
