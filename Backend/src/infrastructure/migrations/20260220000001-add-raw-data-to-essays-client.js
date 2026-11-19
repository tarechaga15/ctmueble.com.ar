'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    const dialect = queryInterface.sequelize.getDialect();
    const isPostgres = dialect === 'postgres';

    try {
      // Verificar que la tabla existe
      let tableExists;
      if (isPostgres) {
        const [rows] = await queryInterface.sequelize.query(
          `SELECT 1 FROM information_schema.tables 
           WHERE table_schema = 'public' AND table_name = 'essays_client'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
        );
        tableExists = Array.isArray(rows) ? rows : [rows];
      } else {
        tableExists = await queryInterface.sequelize.query(
          `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
           WHERE TABLE_SCHEMA = DATABASE() 
             AND TABLE_NAME = 'essays_client'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
        );
      }

      if (tableExists.length === 0) {
        throw new Error('La tabla essays_client no existe. Ejecuta primero la migración de creación.');
      }

      // Obtener información de collation para MySQL/MariaDB
      let targetCollation = 'utf8mb4_unicode_ci';
      let targetCharset = 'utf8mb4';
      if (!isPostgres) {
        const [contactIdInfo] = await queryInterface.sequelize.query(
          `SELECT COLLATION_NAME, CHARACTER_SET_NAME 
           FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() 
             AND TABLE_NAME = 'contacts' 
             AND COLUMN_NAME = 'id'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
        );
        if (contactIdInfo && contactIdInfo.length > 0) {
          targetCollation = contactIdInfo[0].COLLATION_NAME || targetCollation;
          targetCharset = contactIdInfo[0].CHARACTER_SET_NAME || targetCharset;
        }
      }

      // Columnas de bussiness_address (datos en crudo)
      const addressRawColumns = [
        { name: 'address_raw_id', type: isPostgres ? DataTypes.UUID : DataTypes.CHAR(36), allowNull: true, comment: 'ID original de bussiness_address (mantiene referencia)' },
        { name: 'address_raw_cuit', type: DataTypes.STRING(12), allowNull: true, comment: 'CUIT de la dirección' },
        { name: 'address_raw_address', type: DataTypes.STRING(100), allowNull: true, comment: 'Dirección completa' },
        { name: 'address_raw_location', type: DataTypes.STRING(100), allowNull: true, comment: 'Localidad' },
        { name: 'address_raw_province', type: DataTypes.STRING(100), allowNull: true, comment: 'Provincia' },
        { name: 'address_raw_origin', type: DataTypes.ENUM('CLIENT', 'LABORATORY', 'PUBLIC'), allowNull: true, comment: 'Origen de la dirección' },
        { name: 'address_raw_user', type: isPostgres ? DataTypes.UUID : DataTypes.CHAR(36), allowNull: true, comment: 'Usuario que creó la dirección' },
      ];

      // Columnas del representante (datos en crudo, persons)
      const representativeRawColumns = [
        { name: 'representative_raw_id', type: isPostgres ? DataTypes.UUID : DataTypes.CHAR(36), allowNull: true, comment: 'ID original del representante (persons)' },
        { name: 'representative_raw_name', type: DataTypes.STRING(100), allowNull: true, comment: 'Nombre del representante' },
        { name: 'representative_raw_dni', type: DataTypes.STRING(8), allowNull: true, comment: 'DNI del representante' },
        { name: 'representative_raw_contact_id', type: isPostgres ? DataTypes.UUID : DataTypes.CHAR(36), allowNull: true, comment: 'ID del contacto del representante' },
      ];

      // Columnas de contacts (datos en crudo)
      const contactRawColumns = [
        { name: 'contact_raw_id', type: isPostgres ? DataTypes.UUID : DataTypes.CHAR(36), allowNull: true, comment: 'ID original de contacts (mantiene referencia)' },
        { name: 'contact_raw_name', type: DataTypes.STRING, allowNull: true, comment: 'Nombre del contacto' },
        { name: 'contact_raw_dni', type: DataTypes.STRING, allowNull: true, comment: 'DNI del contacto' },
        { name: 'contact_raw_mail', type: DataTypes.STRING, allowNull: true, comment: 'Email del contacto' },
        { name: 'contact_raw_country_code', type: DataTypes.CHAR(3), allowNull: true, comment: 'Código de país del teléfono' },
        { name: 'contact_raw_phone', type: DataTypes.STRING, allowNull: true, comment: 'Teléfono del contacto' },
        { name: 'contact_raw_address', type: DataTypes.STRING, allowNull: true, comment: 'Dirección del contacto' },
        { name: 'contact_raw_location', type: DataTypes.STRING, allowNull: true, comment: 'Localidad del contacto' },
        { name: 'contact_raw_district', type: DataTypes.CHAR(6), allowNull: true, comment: 'Distrito del contacto' },
        { name: 'contact_raw_country', type: DataTypes.CHAR(2), allowNull: true, comment: 'País del contacto' },
        { name: 'contact_raw_user_id', type: isPostgres ? DataTypes.UUID : DataTypes.CHAR(36), allowNull: true, comment: 'Usuario asociado al contacto' },
      ];

      // Columna de bussiness (nombre de la empresa)
      const businessRawColumns = [
        { name: 'bussiness_raw_name', type: DataTypes.STRING(100), allowNull: true, comment: 'Nombre de la empresa' },
      ];

      // Agregar todas las columnas
      const allColumns = [
        ...addressRawColumns,
        ...representativeRawColumns,
        ...contactRawColumns,
        ...businessRawColumns,
      ];

      for (const column of allColumns) {
        // Verificar si la columna ya existe
        let columnExists = false;
        if (isPostgres) {
          const [rows] = await queryInterface.sequelize.query(
            `SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
               AND table_name = 'essays_client' 
               AND column_name = '${column.name}'`,
            { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
          );
          columnExists = Array.isArray(rows) ? rows.length > 0 : !!rows;
        } else {
          const [rows] = await queryInterface.sequelize.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'essays_client' 
               AND COLUMN_NAME = '${column.name}'`,
            { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
          );
          columnExists = rows && rows.length > 0;
        }

        if (!columnExists) {
          const columnDefinition = {
            type: column.type,
            allowNull: column.allowNull !== undefined ? column.allowNull : true,
          };

          if (column.comment) {
            columnDefinition.comment = column.comment;
          }

          await queryInterface.addColumn('essays_client', column.name, columnDefinition, { transaction });

          // Ajustar collation para MySQL/MariaDB si es UUID/CHAR
          if (!isPostgres && (column.type === DataTypes.CHAR(36) || column.type === DataTypes.UUID)) {
            await queryInterface.sequelize.query(
              `ALTER TABLE essays_client 
               MODIFY COLUMN ${column.name} CHAR(36) CHARACTER SET ${targetCharset} COLLATE ${targetCollation} ${column.allowNull ? 'NULL' : 'NOT NULL'}`,
              { transaction }
            );
          }
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    const dialect = queryInterface.sequelize.getDialect();
    const isPostgres = dialect === 'postgres';

    try {
      // Lista de todas las columnas a eliminar
      const columnsToRemove = [
        // Address raw columns
        'address_raw_id',
        'address_raw_cuit',
        'address_raw_address',
        'address_raw_location',
        'address_raw_province',
        'address_raw_origin',
        'address_raw_user',
        // Representative raw columns
        'representative_raw_id',
        'representative_raw_name',
        'representative_raw_dni',
        'representative_raw_contact_id',
        // Contact raw columns
        'contact_raw_id',
        'contact_raw_name',
        'contact_raw_dni',
        'contact_raw_mail',
        'contact_raw_country_code',
        'contact_raw_phone',
        'contact_raw_address',
        'contact_raw_location',
        'contact_raw_district',
        'contact_raw_country',
        'contact_raw_user_id',
        // Business raw columns
        'bussiness_raw_name',
      ];

      for (const columnName of columnsToRemove) {
        // Verificar si la columna existe antes de eliminarla
        let columnExists = false;
        if (isPostgres) {
          const [rows] = await queryInterface.sequelize.query(
            `SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
               AND table_name = 'essays_client' 
               AND column_name = '${columnName}'`,
            { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
          );
          columnExists = Array.isArray(rows) ? rows.length > 0 : !!rows;
        } else {
          const [rows] = await queryInterface.sequelize.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'essays_client' 
               AND COLUMN_NAME = '${columnName}'`,
            { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
          );
          columnExists = rows && rows.length > 0;
        }

        if (columnExists) {
          await queryInterface.removeColumn('essays_client', columnName, { transaction });
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
