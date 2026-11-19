'use strict';

/**
 * Migración integral de seguridad, rendimiento y trazabilidad:
 * 1. Tabla atómica `daily_sequence_counters` para generación libre de carreras de códigos de ensayos y OT.
 * 2. Tabla inmutable (append-only) `security_audit_logs` con trigger anti-modificación/borrado.
 * 3. Índices compuestos críticos para listados, filtros multi-tenant e integridad de unicidad en códigos.
 */
module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', { transaction });

      // 1. Contadores diarios atómicos
      await queryInterface.sequelize.query(
        `CREATE TABLE IF NOT EXISTS daily_sequence_counters (
           scope VARCHAR(32) NOT NULL,
           date_key VARCHAR(16) NOT NULL,
           last_value INTEGER NOT NULL DEFAULT 0,
           PRIMARY KEY (scope, date_key)
         );`,
        { transaction }
      );

      // 2. Bitácora de auditoría de seguridad append-only
      await queryInterface.sequelize.query(
        `CREATE TABLE IF NOT EXISTS security_audit_logs (
           id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
           request_id VARCHAR(64),
           user_id UUID,
           session_id VARCHAR(64),
           action VARCHAR(80) NOT NULL,
           resource VARCHAR(80) NOT NULL,
           resource_id VARCHAR(128),
           outcome VARCHAR(24) NOT NULL DEFAULT 'SUCCESS',
           ip_address VARCHAR(64),
           user_agent VARCHAR(512),
           metadata JSONB,
           created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
         );`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `CREATE OR REPLACE FUNCTION prevent_security_audit_log_mutation()
         RETURNS trigger AS $$
         BEGIN
           RAISE EXCEPTION 'security_audit_logs es append-only: no se permiten operaciones %', TG_OP;
         END;
         $$ LANGUAGE plpgsql;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS trg_security_audit_logs_immutable ON security_audit_logs;
         CREATE TRIGGER trg_security_audit_logs_immutable
         BEFORE UPDATE OR DELETE ON security_audit_logs
         FOR EACH ROW EXECUTE FUNCTION prevent_security_audit_log_mutation();`,
        { transaction }
      );

      // 3. Índices de rendimiento y aislamiento multi-tenant (solo si las tablas existen)
      const indexStatements = [
        `CREATE INDEX IF NOT EXISTS idx_essays_request_date_desc ON essays (request_date DESC);`,
        `CREATE INDEX IF NOT EXISTS idx_essays_status_req_date ON essays (status, request_date DESC);`,
        `CREATE INDEX IF NOT EXISTS idx_essays_code ON essays (code);`,
        `CREATE INDEX IF NOT EXISTS idx_work_orders_essay_gen_desc ON work_orders (essay_id, generated_at DESC);`,
        `CREATE INDEX IF NOT EXISTS idx_work_orders_status_gen_desc ON work_orders (status, generated_at DESC);`,
        `CREATE INDEX IF NOT EXISTS idx_work_orders_code ON work_orders (code);`,
        `CREATE INDEX IF NOT EXISTS idx_essays_client_contact ON essays_client (contact);`,
        `CREATE INDEX IF NOT EXISTS idx_documents_essay_gen_desc ON documents (essay, generated_at DESC);`,
        `CREATE INDEX IF NOT EXISTS idx_samples_essay_corr ON samples (essay, correlative, countersample);`,
        `CREATE INDEX IF NOT EXISTS idx_samples_wo_corr ON samples (work_order, countersample, correlative);`,
        `CREATE INDEX IF NOT EXISTS idx_clients_user ON clients ("user");`,
        `CREATE INDEX IF NOT EXISTS idx_persons_user_id ON persons (user_id);`,
        `CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_desc ON security_audit_logs (created_at DESC);`,
        `CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_created ON security_audit_logs (user_id, created_at DESC);`
      ];

      for (const stmt of indexStatements) {
        await queryInterface.sequelize.query(`SAVEPOINT sp_idx;`, { transaction });
        try {
          await queryInterface.sequelize.query(stmt, { transaction });
          await queryInterface.sequelize.query(`RELEASE SAVEPOINT sp_idx;`, { transaction });
        } catch (_) {
          await queryInterface.sequelize.query(`ROLLBACK TO SAVEPOINT sp_idx;`, { transaction });
        }
      }

      // 4. Restricciones UNIQUE sobre códigos si no existen duplicados históricos
      await queryInterface.sequelize.query(
        `DO $$
         BEGIN
           IF NOT EXISTS (SELECT 1 FROM essays GROUP BY code HAVING COUNT(*) > 1) THEN
             CREATE UNIQUE INDEX IF NOT EXISTS uq_essays_code ON essays (code);
           END IF;
           IF NOT EXISTS (SELECT 1 FROM work_orders GROUP BY code HAVING COUNT(*) > 1) THEN
             CREATE UNIQUE INDEX IF NOT EXISTS uq_work_orders_code ON work_orders (code);
           END IF;
         END $$;`,
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS trg_security_audit_logs_immutable ON security_audit_logs;
         DROP FUNCTION IF EXISTS prevent_security_audit_log_mutation();
         DROP TABLE IF EXISTS security_audit_logs;
         DROP TABLE IF EXISTS daily_sequence_counters;
         DROP INDEX IF EXISTS uq_essays_code;
         DROP INDEX IF EXISTS uq_work_orders_code;`,
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
