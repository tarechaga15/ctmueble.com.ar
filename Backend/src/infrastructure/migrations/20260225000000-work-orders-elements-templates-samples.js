'use strict';

/**
 * Migración: batch_number en essays_elements, essay_element_templates, work_orders, samples.
 * - essays_elements: solo se añade columna batch_number (sigue 1 elemento por ensayo).
 * - essay_element_templates: plantillas del usuario (sin fecha ni lote).
 * - work_orders, samples: sin cambios respecto al diseño acordado.
 */
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') {
      return;
    }

    const transaction = await queryInterface.sequelize.transaction();

    try {
      // --- 1) essays_elements: solo añadir batch_number (y revertir id/PK si existían de una migración anterior) ---
      const elementsDesc = await queryInterface.describeTable('essays_elements').catch(() => null);
      if (elementsDesc) {
        if (elementsDesc.id) {
          // Revertir cambio previo: quitar id como PK y restaurar essay como PK
          await queryInterface.sequelize.query(
            `ALTER TABLE essays_elements DROP CONSTRAINT IF EXISTS essays_elements_pkey`,
            { transaction }
          );
          await queryInterface.removeColumn('essays_elements', 'id', { transaction });
          await queryInterface.sequelize.query(
            `ALTER TABLE essays_elements ADD PRIMARY KEY (essay)`,
            { transaction }
          );
        }
        if (!elementsDesc.batch_number) {
          await queryInterface.addColumn('essays_elements', 'batch_number', {
            type: DataTypes.STRING,
            allowNull: true
          }, { transaction });
        }
      }

      // --- 2) essay_element_templates: listado guardado (sin fecha ni lote) ---
      const templatesExists = await queryInterface.sequelize.query(
        `SELECT to_regclass('public.essay_element_templates')`,
        { type: 'SELECT', transaction }
      ).then(([{ to_regclass }]) => to_regclass !== null);
      if (!templatesExists) {
        await queryInterface.createTable('essay_element_templates', {
          id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
          },
          user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
            onDelete: 'CASCADE'
          },
          product: { type: DataTypes.STRING, allowNull: false },
          manufacturer: { type: DataTypes.STRING, allowNull: false },
          country: {
            type: DataTypes.CHAR(2),
            allowNull: true,
            references: { model: 'types_countries', key: 'id' }
          }
        }, { transaction });
        await queryInterface.addIndex('essay_element_templates', ['user_id'], { transaction });
      }

      // --- 3) work_orders: vinculada a essays ---
      const workOrdersExists = await queryInterface.sequelize.query(
        `SELECT to_regclass('public.work_orders')`,
        { type: 'SELECT', transaction }
      ).then(([{ to_regclass }]) => to_regclass !== null);
      if (!workOrdersExists) {
        await queryInterface.createTable('work_orders', {
          id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
          },
          essay_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'essays', key: 'id' },
            onDelete: 'CASCADE'
          },
          code: { type: DataTypes.STRING(6), allowNull: false },
          report_delivery_deadline: { type: DataTypes.DATEONLY, allowNull: true },
          generated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          },
          price: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
          observations: { type: DataTypes.TEXT, allowNull: true },
          essay_type_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'types_essays', key: 'id' }
          },
          status: {
            type: DataTypes.ENUM('WAITING_SAMPLES', 'ANALYZING', 'COMPLETED', 'CANCELLED'),
            allowNull: false,
            defaultValue: 'WAITING_SAMPLES'
          }
        }, { transaction });
        await queryInterface.addIndex('work_orders', ['essay_id'], { transaction });
        await queryInterface.addIndex('work_orders', ['code'], { transaction });
      }

      // --- 4) samples: work_order (FK), dimensiones ---
      const samplesDesc = await queryInterface.describeTable('samples').catch(() => null);
      if (samplesDesc) {
        if (!samplesDesc.work_order) {
          await queryInterface.addColumn('samples', 'work_order', {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'work_orders', key: 'id' },
            onDelete: 'SET NULL'
          }, { transaction });
        }
        if (!samplesDesc.height) {
          await queryInterface.addColumn('samples', 'height', {
            type: DataTypes.DECIMAL(12, 4),
            allowNull: true
          }, { transaction });
        }
        if (!samplesDesc.width) {
          await queryInterface.addColumn('samples', 'width', {
            type: DataTypes.DECIMAL(12, 4),
            allowNull: true
          }, { transaction });
        }
        if (!samplesDesc.thickness) {
          await queryInterface.addColumn('samples', 'thickness', {
            type: DataTypes.DECIMAL(12, 4),
            allowNull: true
          }, { transaction });
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') {
      return;
    }

    const transaction = await queryInterface.sequelize.transaction();

    try {
      const samplesDesc = await queryInterface.describeTable('samples').catch(() => null);
      if (samplesDesc) {
        if (samplesDesc.thickness) await queryInterface.removeColumn('samples', 'thickness', { transaction });
        if (samplesDesc.width) await queryInterface.removeColumn('samples', 'width', { transaction });
        if (samplesDesc.height) await queryInterface.removeColumn('samples', 'height', { transaction });
        if (samplesDesc.work_order) await queryInterface.removeColumn('samples', 'work_order', { transaction });
      }

      await queryInterface.dropTable('work_orders', { cascade: true, transaction }).catch(() => {});
      await queryInterface.dropTable('essay_element_templates', { cascade: true, transaction }).catch(() => {});

      const elementsDesc = await queryInterface.describeTable('essays_elements').catch(() => null);
      if (elementsDesc && elementsDesc.batch_number) {
        await queryInterface.removeColumn('essays_elements', 'batch_number', { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
