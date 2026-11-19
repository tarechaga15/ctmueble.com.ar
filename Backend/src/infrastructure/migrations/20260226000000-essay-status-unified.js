'use strict';

/**
 * Unifica el estado del ensayo en una sola columna status.
 * Elimina procedure_status y work_status.
 * Nuevos valores: REQUESTED, ACCEPTED, REJECTED, SERVICE_AGREEMENT_MADED, IN_WORK, COMPLETED, CANCELLED.
 */
module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') {
      throw new Error('Esta migración está pensada para PostgreSQL');
    }

    const sql = queryInterface.sequelize.query.bind(queryInterface.sequelize);

    // Crear nuevo tipo ENUM
    await sql(`
      DO $$ BEGIN
        CREATE TYPE essay_status_new AS ENUM (
          'REQUESTED', 'ACCEPTED', 'REJECTED', 'SERVICE_AGREEMENT_MADED',
          'IN_WORK', 'COMPLETED', 'CANCELLED'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // Añadir columna temporal con el tipo creado
    await sql(`ALTER TABLE essays ADD COLUMN IF NOT EXISTS status_new essay_status_new;`);

    // En PostgreSQL puro el tipo puede ser distinto; usar raw para el UPDATE
    await sql(`
      UPDATE essays
      SET status_new = CASE
        WHEN status::text = 'CANCELLED' OR procedure_status::text = 'CANCELLED' THEN 'CANCELLED'::essay_status_new
        WHEN status::text = 'COMPLETED' OR work_status::text = 'COMPLETED' THEN 'COMPLETED'::essay_status_new
        WHEN status::text = 'IN_WORK' THEN 'IN_WORK'::essay_status_new
        WHEN procedure_status::text = 'COMPLETED' THEN 'SERVICE_AGREEMENT_MADED'::essay_status_new
        WHEN procedure_status::text = 'ACCEPTED' OR procedure_status::text = 'SIGNING' THEN 'ACCEPTED'::essay_status_new
        WHEN procedure_status::text = 'REJECTED' THEN 'REJECTED'::essay_status_new
        ELSE 'REQUESTED'::essay_status_new
      END
    `);

    // Quitar columnas viejas y renombrar (paso a paso para evitar dependencias del enum)
    await queryInterface.removeColumn('essays', 'status');
    await queryInterface.removeColumn('essays', 'procedure_status');
    await queryInterface.removeColumn('essays', 'work_status');
    await queryInterface.renameColumn('essays', 'status_new', 'status');

    // Asegurar NOT NULL y DEFAULT
    await sql(`
      ALTER TABLE essays
        ALTER COLUMN status SET NOT NULL,
        ALTER COLUMN status SET DEFAULT 'REQUESTED'::essay_status_new
    `);
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') {
      throw new Error('Esta migración está pensada para PostgreSQL');
    }

    // Restaurar columnas viejas requiere recrear los enums y mapear inverso (pérdida de información posible)
    const sql = queryInterface.sequelize.query.bind(queryInterface.sequelize);

    await sql(`
      DO $$ BEGIN
        CREATE TYPE enum_essays_status_old AS ENUM ('IN_PROCESS', 'IN_WORK', 'COMPLETED', 'CANCELLED', 'ARCHIVED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await sql(`
      DO $$ BEGIN
        CREATE TYPE enum_essays_procedure_status AS ENUM ('REQUESTED', 'SIGNING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await sql(`
      DO $$ BEGIN
        CREATE TYPE enum_essays_work_status AS ENUM ('WAITING_SAMPLES', 'ANALYZING', 'COMPLETED', 'CANCELLED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryInterface.addColumn('essays', 'status_old', {
      type: queryInterface.sequelize.Sequelize.ENUM('IN_PROCESS', 'IN_WORK', 'COMPLETED', 'CANCELLED', 'ARCHIVED'),
      allowNull: true
    }).catch(() => {});
    await queryInterface.addColumn('essays', 'procedure_status', {
      type: queryInterface.sequelize.Sequelize.ENUM('REQUESTED', 'SIGNING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'),
      allowNull: true
    }).catch(() => {});
    await queryInterface.addColumn('essays', 'work_status', {
      type: queryInterface.sequelize.Sequelize.ENUM('WAITING_SAMPLES', 'ANALYZING', 'COMPLETED', 'CANCELLED'),
      allowNull: true
    }).catch(() => {});

    await sql(`
      UPDATE essays SET
        status_old = CASE
          WHEN status::text = 'REQUESTED' OR status::text = 'ACCEPTED' OR status::text = 'REJECTED' THEN 'IN_PROCESS'::enum_essays_status_old
          WHEN status::text = 'SERVICE_AGREEMENT_MADED' THEN 'IN_PROCESS'::enum_essays_status_old
          WHEN status::text = 'IN_WORK' THEN 'IN_WORK'::enum_essays_status_old
          WHEN status::text = 'COMPLETED' THEN 'COMPLETED'::enum_essays_status_old
          WHEN status::text = 'CANCELLED' THEN 'CANCELLED'::enum_essays_status_old
          ELSE 'IN_PROCESS'::enum_essays_status_old
        END,
        procedure_status = CASE
          WHEN status::text = 'REQUESTED' THEN 'REQUESTED'::enum_essays_procedure_status
          WHEN status::text = 'ACCEPTED' OR status::text = 'REJECTED' THEN status::text::enum_essays_procedure_status
          WHEN status::text = 'SERVICE_AGREEMENT_MADED' THEN 'COMPLETED'::enum_essays_procedure_status
          ELSE 'REQUESTED'::enum_essays_procedure_status
        END,
        work_status = CASE
          WHEN status::text = 'IN_WORK' THEN 'WAITING_SAMPLES'::enum_essays_work_status
          WHEN status::text = 'COMPLETED' THEN 'COMPLETED'::enum_essays_work_status
          WHEN status::text = 'CANCELLED' THEN 'CANCELLED'::enum_essays_work_status
          ELSE 'WAITING_SAMPLES'::enum_essays_work_status
        END
    `);

    await queryInterface.removeColumn('essays', 'status');
    await queryInterface.renameColumn('essays', 'status_old', 'status');
    await sql(`ALTER TABLE essays ALTER COLUMN status SET DEFAULT 'IN_PROCESS'::enum_essays_status_old`);
    await sql(`ALTER TABLE essays ALTER COLUMN procedure_status SET NOT NULL`);
    await sql(`ALTER TABLE essays ALTER COLUMN procedure_status SET DEFAULT 'REQUESTED'::enum_essays_procedure_status`);
    await sql(`ALTER TABLE essays ALTER COLUMN work_status SET NOT NULL`);
    await sql(`ALTER TABLE essays ALTER COLUMN work_status SET DEFAULT 'WAITING_SAMPLES'::enum_essays_work_status`);
  }
};
