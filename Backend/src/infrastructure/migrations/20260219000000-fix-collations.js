'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === 'postgres') {
      return; // PostgreSQL no usa charset/collation por columna como MySQL
    }

    const transaction = await queryInterface.sequelize.transaction();

    try {
      const [contactIdInfo] = await queryInterface.sequelize.query(
        `SELECT COLLATION_NAME, CHARACTER_SET_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'contacts' 
           AND COLUMN_NAME = 'id'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      if (!contactIdInfo) {
        throw new Error('No se pudo obtener información de contacts.id');
      }

      const targetCollation = contactIdInfo.COLLATION_NAME;
      const targetCharset = contactIdInfo.CHARACTER_SET_NAME;

      const [repIdInfo] = await queryInterface.sequelize.query(
        `SELECT COLLATION_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'bussiness_representatives' 
           AND COLUMN_NAME = 'id'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      if (repIdInfo && repIdInfo.COLLATION_NAME !== targetCollation) {
        await queryInterface.sequelize.query(
          `ALTER TABLE bussiness_representatives 
           MODIFY COLUMN id CHAR(36) CHARACTER SET ${targetCharset} COLLATE ${targetCollation} NOT NULL`,
          { transaction }
        );
      }

      const [repContactInfo] = await queryInterface.sequelize.query(
        `SELECT COLLATION_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'bussiness_representatives' 
           AND COLUMN_NAME = 'contact'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      if (repContactInfo && repContactInfo.COLLATION_NAME !== targetCollation) {
        await queryInterface.sequelize.query(
          `ALTER TABLE bussiness_representatives 
           MODIFY COLUMN contact CHAR(36) CHARACTER SET ${targetCharset} COLLATE ${targetCollation} NULL`,
          { transaction }
        );
      }

      const [clientRepInfo] = await queryInterface.sequelize.query(
        `SELECT COLLATION_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'clients' 
           AND COLUMN_NAME = 'representative'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      if (clientRepInfo && clientRepInfo.COLLATION_NAME !== targetCollation) {
        await queryInterface.sequelize.query(
          `ALTER TABLE clients 
           MODIFY COLUMN representative CHAR(36) CHARACTER SET ${targetCharset} COLLATE ${targetCollation} NULL`,
          { transaction }
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    return Promise.resolve();
  }
};
