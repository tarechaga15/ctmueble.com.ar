'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // 1. Índices en user_id para mejorar consultas de revocación y limpieza
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id
      ON email_verifications (user_id);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_password_resets_user_id
      ON password_resets (user_id);
    `);

    // 2. Limpiar referencias huérfanas antes de crear FKs ON DELETE CASCADE
    await queryInterface.sequelize.query(`
      UPDATE email_verifications
      SET user_id = NULL
      WHERE user_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = email_verifications.user_id);
    `);

    await queryInterface.sequelize.query(`
      DELETE FROM password_resets
      WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = password_resets.user_id);
    `);

    // 3. Llaves foráneas ON DELETE CASCADE sobre users(id)
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_email_verifications_user'
        ) THEN
          ALTER TABLE email_verifications
          ADD CONSTRAINT fk_email_verifications_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
      END
      $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_password_resets_user'
        ) THEN
          ALTER TABLE password_resets
          ADD CONSTRAINT fk_password_resets_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
      END
      $$;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE email_verifications DROP CONSTRAINT IF EXISTS fk_email_verifications_user;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE password_resets DROP CONSTRAINT IF EXISTS fk_password_resets_user;
    `);
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_email_verifications_user_id;
    `);
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_password_resets_user_id;
    `);
  }
};
