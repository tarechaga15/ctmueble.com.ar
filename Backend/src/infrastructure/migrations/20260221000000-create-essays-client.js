'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    const dialect = queryInterface.sequelize.getDialect();
    const isPostgres = dialect === 'postgres';

    try {
      let tableExists;
      if (isPostgres) {
        const [rows] = await queryInterface.sequelize.query(
          `SELECT 1 FROM information_schema.tables 
           WHERE table_schema = 'public' AND table_name = 'essays_client'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
        );
        tableExists = Array.isArray(rows) ? rows : [rows];
      } else {
        const [contactIdInfo] = await queryInterface.sequelize.query(
          `SELECT COLLATION_NAME, CHARACTER_SET_NAME 
           FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() 
             AND TABLE_NAME = 'contacts' 
             AND COLUMN_NAME = 'id'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
        );
        const targetCollation = contactIdInfo?.COLLATION_NAME || 'utf8mb4_general_ci';
        const targetCharset = contactIdInfo?.CHARACTER_SET_NAME || 'utf8mb4';

        tableExists = await queryInterface.sequelize.query(
          `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
           WHERE TABLE_SCHEMA = DATABASE() 
             AND TABLE_NAME = 'essays_client'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
        );
      }

      if (tableExists.length === 0) {
        const tableDefinition = {
          id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
            allowNull: false
          },
          essay: {
            type: DataTypes.CHAR(36),
            allowNull: false,
            references: {
              model: 'essays',
              key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            unique: true
          },
          cuit: {
            type: DataTypes.STRING(12),
            allowNull: false,
            references: {
              model: 'bussiness',
              key: 'cuit'
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
          },
          address: {
            type: DataTypes.CHAR(36),
            allowNull: false,
            references: {
              model: 'bussiness_address',
              key: 'id'
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
          },
          representative: {
            type: DataTypes.CHAR(36),
            allowNull: true,
            references: {
              model: 'persons',
              key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
          },
          contact: {
            type: DataTypes.CHAR(36),
            allowNull: false,
            references: {
              model: 'contacts',
              key: 'id'
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
          }
        };

        if (isPostgres) {
          await queryInterface.createTable('essays_client', tableDefinition, { transaction });
        } else {
          const [contactIdInfo] = await queryInterface.sequelize.query(
            `SELECT COLLATION_NAME, CHARACTER_SET_NAME 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'contacts' 
               AND COLUMN_NAME = 'id'`,
            { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
          );
          const targetCollation = contactIdInfo?.COLLATION_NAME || 'utf8mb4_general_ci';
          const targetCharset = contactIdInfo?.CHARACTER_SET_NAME || 'utf8mb4';
          await queryInterface.createTable('essays_client', tableDefinition, {
            transaction,
            charset: targetCharset,
            collate: targetCollation
          });
        }

        const essayIndexName = dialect === 'postgres' ? 'idx_essays_client_essay' : 'idx_essay';
        const essayClientIndexNames = dialect === 'postgres'
          ? { cuit: 'idx_essays_client_cuit', address: 'idx_essays_client_address', representative: 'idx_essays_client_representative', contact: 'idx_essays_client_contact' }
          : { cuit: 'idx_cuit', address: 'idx_address', representative: 'idx_representative', contact: 'idx_contact' };
        await queryInterface.addIndex('essays_client', ['essay'], {
          name: essayIndexName,
          unique: true,
          transaction
        });
        await queryInterface.addIndex('essays_client', ['cuit'], {
          name: essayClientIndexNames.cuit,
          transaction
        });
        await queryInterface.addIndex('essays_client', ['address'], {
          name: essayClientIndexNames.address,
          transaction
        });
        await queryInterface.addIndex('essays_client', ['representative'], {
          name: essayClientIndexNames.representative,
          transaction
        });
        await queryInterface.addIndex('essays_client', ['contact'], {
          name: essayClientIndexNames.contact,
          transaction
        });

        if (!isPostgres) {
          const [contactIdInfo] = await queryInterface.sequelize.query(
            `SELECT COLLATION_NAME, CHARACTER_SET_NAME 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'contacts' 
               AND COLUMN_NAME = 'id'`,
            { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
          );
          const targetCollation = contactIdInfo?.COLLATION_NAME || 'utf8mb4_general_ci';
          const targetCharset = contactIdInfo?.CHARACTER_SET_NAME || 'utf8mb4';
          await queryInterface.sequelize.query(
            `ALTER TABLE essays_client 
             MODIFY COLUMN id CHAR(36) CHARACTER SET ${targetCharset} COLLATE ${targetCollation} NOT NULL,
             MODIFY COLUMN essay CHAR(36) CHARACTER SET ${targetCharset} COLLATE ${targetCollation} NOT NULL,
             MODIFY COLUMN address CHAR(36) CHARACTER SET ${targetCharset} COLLATE ${targetCollation} NOT NULL,
             MODIFY COLUMN representative CHAR(36) CHARACTER SET ${targetCharset} COLLATE ${targetCollation} NULL,
             MODIFY COLUMN contact CHAR(36) CHARACTER SET ${targetCharset} COLLATE ${targetCollation} NOT NULL`,
            { transaction }
          );
        }
      } else if (!isPostgres) {
        const [contactIdInfo] = await queryInterface.sequelize.query(
          `SELECT COLLATION_NAME, CHARACTER_SET_NAME 
           FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() 
             AND TABLE_NAME = 'contacts' 
             AND COLUMN_NAME = 'id'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
        );
        const targetCollation = contactIdInfo?.COLLATION_NAME || 'utf8mb4_general_ci';
        const targetCharset = contactIdInfo?.CHARACTER_SET_NAME || 'utf8mb4';
        const columns = ['id', 'essay', 'address', 'representative', 'contact'];

        for (const column of columns) {
          const colInfo = await queryInterface.sequelize.query(
            `SELECT COLLATION_NAME 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'essays_client' 
               AND COLUMN_NAME = '${column}'`,
            { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
          );
          if (colInfo.length > 0 && colInfo[0].COLLATION_NAME !== targetCollation) {
            const nullable = column === 'representative' ? 'NULL' : 'NOT NULL';
            await queryInterface.sequelize.query(
              `ALTER TABLE essays_client 
               MODIFY COLUMN ${column} CHAR(36) CHARACTER SET ${targetCharset} COLLATE ${targetCollation} ${nullable}`,
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

      if (tableExists.length > 0) {
        await queryInterface.dropTable('essays_client', { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
