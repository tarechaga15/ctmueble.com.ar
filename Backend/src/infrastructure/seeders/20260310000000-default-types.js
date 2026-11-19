/* Seeder para datos por defecto de:
 * - types_countries
 * - types_districts
 * - types_essays
 * - types_documents
 *
 * Ejecutar (con DATABASE_URL configurada):
 *   npx sequelize-cli db:seed:all
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Países por defecto (tal cual tabla actual)
    await queryInterface.bulkInsert('types_countries', [
      { id: 'AR', name: 'Argentina', country_code: '54 ' }
    ], {});

    // 2) Distritos por defecto (todos los de Argentina que pasaste)
    await queryInterface.bulkInsert('types_districts', [
      { id: 'AR-A  ', country: 'AR', name: 'Salta', numeric_id: 9 },
      { id: 'AR-B  ', country: 'AR', name: 'Provincia de Buenos Aires', numeric_id: 1 },
      { id: 'AR-C  ', country: 'AR', name: 'Ciudad Autónoma de Buenos Aires', numeric_id: 0 },
      { id: 'AR-D  ', country: 'AR', name: 'San Luis', numeric_id: 11 },
      { id: 'AR-E  ', country: 'AR', name: 'Entre Ríos', numeric_id: 5 },
      { id: 'AR-F  ', country: 'AR', name: 'La Rioja', numeric_id: 8 },
      { id: 'AR-G  ', country: 'AR', name: 'Santiago del Estero', numeric_id: 13 },
      { id: 'AR-H  ', country: 'AR', name: 'Chaco', numeric_id: 16 },
      { id: 'AR-J  ', country: 'AR', name: 'San Juan', numeric_id: 10 },
      { id: 'AR-K  ', country: 'AR', name: 'Catamarca', numeric_id: 2 },
      { id: 'AR-L  ', country: 'AR', name: 'La Pampa', numeric_id: 21 },
      { id: 'AR-M  ', country: 'AR', name: 'Mendoza', numeric_id: 7 },
      { id: 'AR-N  ', country: 'AR', name: 'Misiones', numeric_id: 19 },
      { id: 'AR-P  ', country: 'AR', name: 'Formosa', numeric_id: 18 },
      { id: 'AR-Q  ', country: 'AR', name: 'Neuquén', numeric_id: 20 },
      { id: 'AR-R  ', country: 'AR', name: 'Río Negro', numeric_id: 22 },
      { id: 'AR-S  ', country: 'AR', name: 'Santa Fe', numeric_id: 12 },
      { id: 'AR-T  ', country: 'AR', name: 'Tucumán', numeric_id: 14 },
      { id: 'AR-U  ', country: 'AR', name: 'Chubut', numeric_id: 17 },
      { id: 'AR-V  ', country: 'AR', name: 'Tierra del Fuego', numeric_id: 24 },
      { id: 'AR-W  ', country: 'AR', name: 'Corrientes', numeric_id: 4 },
      { id: 'AR-X  ', country: 'AR', name: 'Córdoba', numeric_id: 3 },
      { id: 'AR-Y  ', country: 'AR', name: 'Jujuy', numeric_id: 6 },
      { id: 'AR-Z  ', country: 'AR', name: 'Santa Cruz', numeric_id: 23 }
    ], {});

    // 3) Tipos de ensayos por defecto (tal cual tabla actual)
    await queryInterface.bulkInsert('types_essays', [
      {
        id: 1,
        name: 'Determinación de la emisión formaldehído por el método de análisis del gas según IT17-01.'
      }
    ], {});

    // 4) Tipos de documentos por defecto (tal cual tabla actual)
    await queryInterface.bulkInsert('types_documents', [
      {
        id: 3,
        code: 'F-PC13-01',
        name: 'Solicitud de ensayo',
        filesheet: 'essays_forms/fpc131.html'
      },
      {
        id: 1,
        code: 'F-PC16-01',
        name: 'Registro de recepción de muestras',
        filesheet: 'essays_forms/fpc161.html'
      },
      {
        id: 4,
        code: 'F-PC16-02',
        name: 'Orden de Trabajo',
        filesheet: 'essays_forms/fpc162.html'
      },
      {
        id: 2,
        code: 'F-PC13-02',
        name: 'Contrato de Servicio',
        filesheet: 'essays_forms/fpc132.html'
      },
      {
        id: 5,
        code: 'F-PC15-01',
        name: 'Informe de Ensayo',
        filesheet: 'essays_forms/fpc151.html'
      }
    ], {});

    // 5) Variables de entorno de negocio (environment_variables)
    await queryInterface.bulkInsert('environment_variables', [
      {
        id: 'SOCIAL_NAME',
        label: 'Razón social del Laboratorio',
        type: 'TEXT',
        value_text: 'Fundación para el Desarrollo de Cañada de Gomez (FU.DE.CA.)',
        value_number: null,
        value_decimal: null,
        value_timestamp: '2025-11-07 16:43:40-03',
        hardcoded: true
      },
      {
        id: 'CUIT',
        label: 'CUIT del Laboratorio',
        type: 'TEXT',
        value_text: '30-67387889-6',
        value_number: null,
        value_decimal: null,
        value_timestamp: '2025-11-07 16:11:54-03',
        hardcoded: true
      },
      {
        id: 'LOCAL_ADDRESS',
        label: 'Domicilio del laboratorio',
        type: 'TEXT',
        value_text: 'Sarmiento 153',
        value_number: null,
        value_decimal: null,
        value_timestamp: '2025-11-07 16:11:54-03',
        hardcoded: true
      },
      {
        id: 'LOCATION',
        label: 'Localidad del laboratorio',
        type: 'TEXT',
        value_text: 'Cañada de Gomez',
        value_number: null,
        value_decimal: null,
        value_timestamp: '2025-11-07 16:11:54-03',
        hardcoded: true
      },
      {
        id: 'PROVINCE',
        label: 'Provincia del laboratorio',
        type: 'TEXT',
        value_text: 'Santa Fe',
        value_number: null,
        value_decimal: null,
        value_timestamp: '2025-11-07 16:11:54-03',
        hardcoded: true
      },
      {
        id: 'PRESIDENT',
        label: 'Presidente de la institución',
        type: 'TEXT',
        value_text: 'Mario Lauría',
        value_number: null,
        value_decimal: null,
        value_timestamp: '2025-11-07 16:11:54-03',
        hardcoded: true
      },
      {
        id: 'PRESIDENT_DNI',
        label: 'DNI del Presidente',
        type: 'TEXT',
        value_text: '32.074.001',
        value_number: null,
        value_decimal: null,
        value_timestamp: '2025-11-07 16:11:54-03',
        hardcoded: true
      },
      {
        id: 'BANK',
        label: 'Entidad bancaria de la institución',
        type: 'TEXT',
        value_text: 'BANCO CREDICOOP filial 275',
        value_number: null,
        value_decimal: null,
        value_timestamp: '2025-11-07 16:11:54-03',
        hardcoded: true
      },
      {
        id: 'BANK_CC',
        label: 'Cuenta corriente en pesos',
        type: 'TEXT',
        value_text: '2621/1',
        value_number: null,
        value_decimal: null,
        value_timestamp: '2025-11-07 16:11:54-03',
        hardcoded: true
      },
      {
        id: 'BANK_CBU',
        label: 'CBU',
        type: 'TEXT',
        value_text: '1910275555027500262114',
        value_number: null,
        value_decimal: null,
        value_timestamp: '2025-11-07 16:11:54-03',
        hardcoded: true
      },
      {
        id: 'UNCERTAINLY',
        label: 'Incertidumbre',
        type: 'DECIMAL',
        value_text: null,
        value_number: null,
        value_decimal: '0.05',
        value_timestamp: null,
        hardcoded: false
      },
      {
        id: 'UNCERTAINTY',
        label: 'Incertidumbre',
        type: 'DECIMAL',
        value_text: null,
        value_number: null,
        value_decimal: '0.05',
        value_timestamp: null,
        hardcoded: false
      },
      {
        id: 'LAB_DIRECTOR',
        label: 'Director del Laboratorio',
        type: 'TEXT',
        value_text: 'Lic. Veronica Florencia Solis',
        value_number: null,
        value_decimal: null,
        value_timestamp: '2025-11-07 16:11:54-03',
        hardcoded: true
      },
      {
        id: 'LAB_PHONE',
        label: 'Telefono del laboratorio',
        type: 'TEXT',
        value_text: '+54 9 3471 41-7535',
        value_number: null,
        value_decimal: null,
        value_timestamp: null,
        hardcoded: false
      },
      {
        id: 'LAB_MAIL',
        label: 'Correo del laboratorio',
        type: 'TEXT',
        value_text: 'ctmlaboratorio@gmail.com',
        value_number: null,
        value_decimal: null,
        value_timestamp: null,
        hardcoded: false
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Borramos solo los registros insertados por este seeder

    await queryInterface.bulkDelete('environment_variables', {
      id: [
        'SOCIAL_NAME',
        'CUIT',
        'LOCAL_ADDRESS',
        'LOCATION',
        'PROVINCE',
        'PRESIDENT',
        'PRESIDENT_DNI',
        'BANK',
        'BANK_CC',
        'BANK_CBU',
        'UNCERTAINLY',
        'UNCERTAINTY',
        'LAB_DIRECTOR',
        'LAB_PHONE',
        'LAB_MAIL'
      ]
    }, {});

    await queryInterface.bulkDelete('types_documents', {
      id: [1, 2, 3, 4, 5]
    }, {});

    await queryInterface.bulkDelete('types_essays', {
      id: [1]
    }, {});

    await queryInterface.bulkDelete('types_districts', {
      id: [
        'AR-A  ', 'AR-B  ', 'AR-C  ', 'AR-D  ', 'AR-E  ', 'AR-F  ', 'AR-G  ', 'AR-H  ',
        'AR-J  ', 'AR-K  ', 'AR-L  ', 'AR-M  ', 'AR-N  ', 'AR-P  ', 'AR-Q  ', 'AR-R  ',
        'AR-S  ', 'AR-T  ', 'AR-U  ', 'AR-V  ', 'AR-W  ', 'AR-X  ', 'AR-Y  ', 'AR-Z  '
      ]
    }, {});

    await queryInterface.bulkDelete('types_countries', {
      id: ['AR']
    }, {});
  }
};

