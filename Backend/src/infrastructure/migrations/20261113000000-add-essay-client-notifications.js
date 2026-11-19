'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Agregar client_notifications_enabled a la tabla essays
    try {
      await queryInterface.addColumn('essays', 'client_notifications_enabled', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el solicitante desea recibir notificaciones por correo ante cambios de estado'
      });
    } catch (err) {
      // Ignorar si la columna ya existe
      console.warn('client_notifications_enabled ya existe o error:', err.message);
    }

    // 2. Agregar notification_token a la tabla essays para permitir baja segura vía enlace único
    try {
      await queryInterface.addColumn('essays', 'notification_token', {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        comment: 'Token único para baja de suscripción de notificaciones por correo'
      });
    } catch (err) {
      // Si gen_random_uuid() falla en algún entorno, reintentar sin default o con UUIDV4
      try {
        await queryInterface.addColumn('essays', 'notification_token', {
          type: Sequelize.UUID,
          allowNull: true,
          comment: 'Token único para baja de suscripción de notificaciones por correo'
        });
      } catch (_) {}
    }

    // 3. Índice para búsqueda rápida por notification_token
    try {
      await queryInterface.addIndex('essays', ['notification_token'], {
        name: 'idx_essays_notification_token'
      });
    } catch (_) {}
  },

  down: async (queryInterface) => {
    try {
      await queryInterface.removeIndex('essays', 'idx_essays_notification_token');
    } catch (_) {}
    try {
      await queryInterface.removeColumn('essays', 'notification_token');
    } catch (_) {}
    try {
      await queryInterface.removeColumn('essays', 'client_notifications_enabled');
    } catch (_) {}
  }
};
