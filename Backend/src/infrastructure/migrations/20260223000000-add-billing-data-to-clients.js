'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // 1) Agregar columnas de facturación alternativa a clients
    const clientsDesc = await queryInterface.describeTable('clients');
    if (!clientsDesc.billing_cuit) {
      await queryInterface.addColumn('clients', 'billing_cuit', {
        type: DataTypes.STRING(12),
        allowNull: true,
        comment: 'CUIT alternativa para facturación'
      });
    }
    if (!clientsDesc.billing_address) {
      await queryInterface.addColumn('clients', 'billing_address', {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Dirección de facturación alternativa'
      });
    }
    if (!clientsDesc.billing_location) {
      await queryInterface.addColumn('clients', 'billing_location', {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Localidad de facturación alternativa'
      });
    }
    if (!clientsDesc.billing_province) {
      await queryInterface.addColumn('clients', 'billing_province', {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Provincia de facturación alternativa'
      });
    }
    if (!clientsDesc.billing_iva) {
      await queryInterface.addColumn('clients', 'billing_iva', {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: 'Si tributa IVA (true) o no (false). Null si no se especificó'
      });
    }

    // 2) Agregar mismas columnas a essays_client (snapshot)
    const essaysClientDesc = await queryInterface.describeTable('essays_client');
    if (!essaysClientDesc.billing_cuit) {
      await queryInterface.addColumn('essays_client', 'billing_cuit', {
        type: DataTypes.STRING(12),
        allowNull: true,
        comment: 'CUIT de facturación (snapshot)'
      });
    }
    if (!essaysClientDesc.billing_address) {
      await queryInterface.addColumn('essays_client', 'billing_address', {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Dirección de facturación (snapshot)'
      });
    }
    if (!essaysClientDesc.billing_location) {
      await queryInterface.addColumn('essays_client', 'billing_location', {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Localidad de facturación (snapshot)'
      });
    }
    if (!essaysClientDesc.billing_province) {
      await queryInterface.addColumn('essays_client', 'billing_province', {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Provincia de facturación (snapshot)'
      });
    }
    if (!essaysClientDesc.billing_iva) {
      await queryInterface.addColumn('essays_client', 'billing_iva', {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: 'Si tributa IVA (snapshot)'
      });
    }
  },

  async down(queryInterface) {
    const clientsDesc = await queryInterface.describeTable('clients');
    if (clientsDesc.billing_cuit) await queryInterface.removeColumn('clients', 'billing_cuit');
    if (clientsDesc.billing_address) await queryInterface.removeColumn('clients', 'billing_address');
    if (clientsDesc.billing_location) await queryInterface.removeColumn('clients', 'billing_location');
    if (clientsDesc.billing_province) await queryInterface.removeColumn('clients', 'billing_province');
    if (clientsDesc.billing_iva) await queryInterface.removeColumn('clients', 'billing_iva');

    const essaysClientDesc = await queryInterface.describeTable('essays_client');
    if (essaysClientDesc.billing_cuit) await queryInterface.removeColumn('essays_client', 'billing_cuit');
    if (essaysClientDesc.billing_address) await queryInterface.removeColumn('essays_client', 'billing_address');
    if (essaysClientDesc.billing_location) await queryInterface.removeColumn('essays_client', 'billing_location');
    if (essaysClientDesc.billing_province) await queryInterface.removeColumn('essays_client', 'billing_province');
    if (essaysClientDesc.billing_iva) await queryInterface.removeColumn('essays_client', 'billing_iva');
  }
};
