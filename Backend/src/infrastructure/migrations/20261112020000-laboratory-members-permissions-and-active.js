'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Agregar valor 'CONSULTA' al enum del rol de laboratorio si no existe
    try {
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_laboratories_members_role" ADD VALUE IF NOT EXISTS 'CONSULTA';`
      );
    } catch (_) {}

    // 2. Columna is_active en users
    try {
      await queryInterface.addColumn('users', 'is_active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    } catch (_) {}

    // 3. Tabla laboratory_permissions
    await queryInterface.createTable('laboratory_permissions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      rol: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      accion: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      permitido: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }).catch(() => {});

    try {
      await queryInterface.addIndex('laboratory_permissions', ['rol', 'accion'], {
        unique: true,
        name: 'idx_lab_perm_rol_accion'
      });
    } catch (_) {}
  },

  down: async (queryInterface) => {
    try {
      await queryInterface.dropTable('laboratory_permissions');
    } catch (_) {}
    try {
      await queryInterface.removeColumn('users', 'is_active');
    } catch (_) {}
  }
};
