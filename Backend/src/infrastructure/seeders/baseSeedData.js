/**
 * Datos base oficiales para seedeo global y granular del sistema CTM.
 * Incluye:
 *  - Catálogo completo de los 249 países/territorios ISO 3166-1 alpha-2 en español (`types_countries`).
 *  - Las 24 jurisdicciones/provincias de la República Argentina (`types_districts`).
 *  - Tipo de ensayo de determinación de formaldehído según IT17-01 (`types_essays`).
 *  - Tipos de documentos oficiales (`types_documents`).
 *  - Variables institucionales y registro ficticio de laboratorio (`environment_variables`, `laboratories`).
 *  - Cuentas iniciales de administrador de laboratorio y cliente demo.
 */
'use strict';

function padCode(code) {
  if (code == null || code === '') return null;
  const digits = String(code).replace(/\D/g, '').slice(0, 3);
  return digits ? digits.padEnd(3, ' ') : null;
}

const REGION_DISPLAY = typeof Intl !== 'undefined' && Intl.DisplayNames
  ? new Intl.DisplayNames(['es'], { type: 'region' })
  : null;

/**
 * Matriz de los 249 países/territorios oficiales ISO 3166-1 alpha-2.
 * Cada entrada es `[codigoISO, prefijoTelefonicoUnicoITU | null, nombreFallbackEspañol]`.
 * Nota: `country_code` posee índice UNIQUE en PostgreSQL (`types_countries_country_code_key`),
 * por lo que los territorios que comparten prefijo con su país titular o usan 4 dígitos mantienen `null`.
 */
const RAW_COUNTRIES_ISO_249 = [
  ['AF', '93', 'Afganistán'],
  ['AX', null, 'Islas Åland'],
  ['AL', '355', 'Albania'],
  ['DE', '49', 'Alemania'],
  ['AD', '376', 'Andorra'],
  ['AO', '244', 'Angola'],
  ['AI', null, 'Anguila'],
  ['AQ', '672', 'Antártida'],
  ['AG', null, 'Antigua y Barbuda'],
  ['SA', '966', 'Arabia Saudita'],
  ['DZ', '213', 'Argelia'],
  ['AR', '54', 'Argentina'],
  ['AM', '374', 'Armenia'],
  ['AW', '297', 'Aruba'],
  ['AU', '61', 'Australia'],
  ['AT', '43', 'Austria'],
  ['AZ', '994', 'Azerbaiyán'],
  ['BS', null, 'Bahamas'],
  ['BD', '880', 'Bangladés'],
  ['BB', null, 'Barbados'],
  ['BH', '973', 'Baréin'],
  ['BE', '32', 'Bélgica'],
  ['BZ', '501', 'Belice'],
  ['BJ', '229', 'Benín'],
  ['BM', null, 'Bermudas'],
  ['BY', '375', 'Bielorrusia'],
  ['BO', '591', 'Bolivia'],
  ['BQ', null, 'Caribe neerlandés'],
  ['BA', '387', 'Bosnia y Herzegovina'],
  ['BW', '267', 'Botsuana'],
  ['BR', '55', 'Brasil'],
  ['BN', '673', 'Brunéi'],
  ['BG', '359', 'Bulgaria'],
  ['BF', '226', 'Burkina Faso'],
  ['BI', '257', 'Burundi'],
  ['BT', '975', 'Bután'],
  ['CV', '238', 'Cabo Verde'],
  ['KH', '855', 'Camboya'],
  ['CM', '237', 'Camerún'],
  ['CA', null, 'Canadá'],
  ['QA', '974', 'Catar'],
  ['TD', '235', 'Chad'],
  ['CL', '56', 'Chile'],
  ['CN', '86', 'China'],
  ['CY', '357', 'Chipre'],
  ['CO', '57', 'Colombia'],
  ['KM', '269', 'Comoras'],
  ['CG', '242', 'Congo'],
  ['CD', '243', 'República Democrática del Congo'],
  ['KP', '850', 'Corea del Norte'],
  ['KR', '82', 'Corea del Sur'],
  ['CR', '506', 'Costa Rica'],
  ['CI', '225', 'Costa de Marfil'],
  ['HR', '385', 'Croacia'],
  ['CU', '53', 'Cuba'],
  ['CW', '599', 'Curazao'],
  ['DK', '45', 'Dinamarca'],
  ['DM', null, 'Dominica'],
  ['EC', '593', 'Ecuador'],
  ['EG', '20', 'Egipto'],
  ['SV', '503', 'El Salvador'],
  ['AE', '971', 'Emiratos Árabes Unidos'],
  ['ER', '291', 'Eritrea'],
  ['SK', '421', 'Eslovaquia'],
  ['SI', '386', 'Eslovenia'],
  ['ES', '34', 'España'],
  ['US', '1', 'Estados Unidos'],
  ['EE', '372', 'Estonia'],
  ['ET', '251', 'Etiopía'],
  ['PH', '63', 'Filipinas'],
  ['FI', '358', 'Finlandia'],
  ['FJ', '679', 'Fiyi'],
  ['FR', '33', 'Francia'],
  ['GA', '241', 'Gabón'],
  ['GM', '220', 'Gambia'],
  ['GE', '995', 'Georgia'],
  ['GH', '233', 'Ghana'],
  ['GI', '350', 'Gibraltar'],
  ['GD', null, 'Granada'],
  ['GR', '30', 'Grecia'],
  ['GL', '299', 'Groenlandia'],
  ['GP', '590', 'Guadalupe'],
  ['GU', null, 'Guam'],
  ['GT', '502', 'Guatemala'],
  ['GF', '594', 'Guayana Francesa'],
  ['GG', null, 'Guernsey'],
  ['GN', '224', 'Guinea'],
  ['GQ', '240', 'Guinea Ecuatorial'],
  ['GW', '245', 'Guinea-Bisáu'],
  ['GY', '592', 'Guyana'],
  ['HT', '509', 'Haití'],
  ['HN', '504', 'Honduras'],
  ['HK', '852', 'RAE de Hong Kong (China)'],
  ['HU', '36', 'Hungría'],
  ['IN', '91', 'India'],
  ['ID', '62', 'Indonesia'],
  ['IQ', '964', 'Irak'],
  ['IR', '98', 'Irán'],
  ['IE', '353', 'Irlanda'],
  ['BV', null, 'Isla Bouvet'],
  ['IM', null, 'Isla de Man'],
  ['CX', null, 'Isla de Navidad'],
  ['NF', null, 'Isla Norfolk'],
  ['IS', '354', 'Islandia'],
  ['KY', null, 'Islas Caimán'],
  ['CC', null, 'Islas Cocos'],
  ['CK', '682', 'Islas Cook'],
  ['FO', '298', 'Islas Feroe'],
  ['GS', null, 'Islas Georgia del Sur y Sandwich del Sur'],
  ['HM', null, 'Islas Heard y McDonald'],
  ['FK', '500', 'Islas Malvinas'],
  ['MP', null, 'Islas Marianas del Norte'],
  ['MH', '692', 'Islas Marshall'],
  ['UM', null, 'Islas menores alejadas de EE. UU.'],
  ['PN', null, 'Islas Pitcairn'],
  ['SB', '677', 'Islas Salomón'],
  ['TC', null, 'Islas Turcas y Caicos'],
  ['VG', null, 'Islas Vírgenes Británicas'],
  ['VI', null, 'Islas Vírgenes de EE. UU.'],
  ['IL', '972', 'Israel'],
  ['IT', '39', 'Italia'],
  ['JM', null, 'Jamaica'],
  ['JP', '81', 'Japón'],
  ['JE', null, 'Jersey'],
  ['JO', '962', 'Jordania'],
  ['KZ', null, 'Kazajistán'],
  ['KE', '254', 'Kenia'],
  ['KG', '996', 'Kirguistán'],
  ['KI', '686', 'Kiribati'],
  ['KW', '965', 'Kuwait'],
  ['LA', '856', 'Laos'],
  ['LS', '266', 'Lesoto'],
  ['LV', '371', 'Letonia'],
  ['LB', '961', 'Líbano'],
  ['LR', '231', 'Liberia'],
  ['LY', '218', 'Libia'],
  ['LI', '423', 'Liechtenstein'],
  ['LT', '370', 'Lituania'],
  ['LU', '352', 'Luxemburgo'],
  ['MO', '853', 'RAE de Macao (China)'],
  ['MK', '389', 'Macedonia del Norte'],
  ['MG', '261', 'Madagascar'],
  ['MY', '60', 'Malasia'],
  ['MW', '265', 'Malaui'],
  ['MV', '960', 'Maldivas'],
  ['ML', '223', 'Mali'],
  ['MT', '356', 'Malta'],
  ['MA', '212', 'Marruecos'],
  ['MQ', '596', 'Martinica'],
  ['MU', '230', 'Mauricio'],
  ['MR', '222', 'Mauritania'],
  ['YT', null, 'Mayotte'],
  ['MX', '52', 'México'],
  ['FM', '691', 'Micronesia'],
  ['MD', '373', 'Moldavia'],
  ['MC', '377', 'Mónaco'],
  ['MN', '976', 'Mongolia'],
  ['ME', '382', 'Montenegro'],
  ['MS', null, 'Montserrat'],
  ['MZ', '258', 'Mozambique'],
  ['MM', '95', 'Myanmar (Birmania)'],
  ['NA', '264', 'Namibia'],
  ['NR', '674', 'Nauru'],
  ['NP', '977', 'Nepal'],
  ['NI', '505', 'Nicaragua'],
  ['NE', '227', 'Níger'],
  ['NG', '234', 'Nigeria'],
  ['NU', '683', 'Niue'],
  ['NO', '47', 'Noruega'],
  ['NC', '687', 'Nueva Caledonia'],
  ['NZ', '64', 'Nueva Zelanda'],
  ['OM', '968', 'Omán'],
  ['NL', '31', 'Países Bajos'],
  ['PK', '92', 'Pakistán'],
  ['PW', '680', 'Palaos'],
  ['PS', '970', 'Territorios Palestinos'],
  ['PA', '507', 'Panamá'],
  ['PG', '675', 'Papúa Nueva Guinea'],
  ['PY', '595', 'Paraguay'],
  ['PE', '51', 'Perú'],
  ['PF', '689', 'Polinesia Francesa'],
  ['PL', '48', 'Polonia'],
  ['PT', '351', 'Portugal'],
  ['PR', null, 'Puerto Rico'],
  ['GB', '44', 'Reino Unido'],
  ['CF', '236', 'República Centroafricana'],
  ['CZ', '420', 'Chequia'],
  ['DO', null, 'República Dominicana'],
  ['RE', '262', 'Reunión'],
  ['RW', '250', 'Ruanda'],
  ['RO', '40', 'Rumanía'],
  ['RU', '7', 'Rusia'],
  ['EH', null, 'Sáhara Occidental'],
  ['WS', '685', 'Samoa'],
  ['AS', null, 'Samoa Americana'],
  ['BL', null, 'San Bartolomé'],
  ['KN', null, 'San Cristóbal y Nieves'],
  ['SM', '378', 'San Marino'],
  ['MF', null, 'San Martín'],
  ['PM', '508', 'San Pedro y Miquelón'],
  ['VC', null, 'San Vicente y las Granadinas'],
  ['SH', '290', 'Santa Elena'],
  ['LC', null, 'Santa Lucía'],
  ['ST', '239', 'Santo Tomé y Príncipe'],
  ['SN', '221', 'Senegal'],
  ['RS', '381', 'Serbia'],
  ['SC', '248', 'Seychelles'],
  ['SL', '232', 'Sierra Leona'],
  ['SG', '65', 'Singapur'],
  ['SX', null, 'Sint Maarten'],
  ['SY', '963', 'Siria'],
  ['SO', '252', 'Somalia'],
  ['LK', '94', 'Sri Lanka'],
  ['SZ', '268', 'Esuatini'],
  ['ZA', '27', 'Sudáfrica'],
  ['SD', '249', 'Sudán'],
  ['SS', '211', 'Sudán del Sur'],
  ['SE', '46', 'Suecia'],
  ['CH', '41', 'Suiza'],
  ['SR', '597', 'Surinam'],
  ['SJ', null, 'Svalbard y Jan Mayen'],
  ['TH', '66', 'Tailandia'],
  ['TW', '886', 'Taiwán'],
  ['TZ', '255', 'Tanzania'],
  ['TJ', '992', 'Tayikistán'],
  ['IO', '246', 'Territorio Británico del Océano Índico'],
  ['TF', null, 'Territorios Australes Franceses'],
  ['TL', '670', 'Timor-Leste'],
  ['TG', '228', 'Togo'],
  ['TK', '690', 'Tokelau'],
  ['TO', '676', 'Tonga'],
  ['TT', null, 'Trinidad y Tobago'],
  ['TN', '216', 'Túnez'],
  ['TM', '993', 'Turkmenistán'],
  ['TR', '90', 'Turquía'],
  ['TV', '688', 'Tuvalu'],
  ['UA', '380', 'Ucrania'],
  ['UG', '256', 'Uganda'],
  ['UY', '598', 'Uruguay'],
  ['UZ', '998', 'Uzbekistán'],
  ['VU', '678', 'Vanuatu'],
  ['VA', '379', 'Ciudad del Vaticano'],
  ['VE', '58', 'Venezuela'],
  ['VN', '84', 'Vietnam'],
  ['WF', '681', 'Wallis y Futuna'],
  ['YE', '967', 'Yemen'],
  ['DJ', '253', 'Yibuti'],
  ['ZM', '260', 'Zambia'],
  ['ZW', '263', 'Zimbabue']
];

const ALL_COUNTRIES = RAW_COUNTRIES_ISO_249.map(([id, code, fallbackName]) => {
  let resolvedName = fallbackName;
  if (REGION_DISPLAY) {
    try {
      const intlName = REGION_DISPLAY.of(id);
      if (intlName && intlName !== id) {
        resolvedName = intlName;
      }
    } catch (_) {}
  }
  return {
    id,
    name: resolvedName,
    country_code: padCode(code)
  };
});

/**
 * Las 24 jurisdicciones/provincias oficiales de la República Argentina (ISO 3166-2:AR).
 * `numeric_id` respeta la codificación numérica compatible con el esquema `types_districts`.
 */
const ARGENTINA_PROVINCES = [
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
];

const DEFAULT_ESSAY_TYPES = [
  {
    id: 1,
    name: 'Determinación de la emisión formaldehído por el método de análisis del gas según IT17-01.'
  }
];

const DEFAULT_DOCUMENT_TYPES = [
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
];

/**
 * Datos ficticios de laboratorio para variables institucionales (`environment_variables`)
 * y entidad `laboratories`.
 */
const FICTITIOUS_LAB_ENV_VARIABLES = [
  {
    id: 'SOCIAL_NAME',
    label: 'Razón social del Laboratorio',
    type: 'TEXT',
    value_text: 'Fundación Centro Tecnológico del Mueble (Laboratorio Ficticio Demo)',
    value_number: null,
    value_decimal: null,
    value_timestamp: '2026-01-01 09:00:00-03',
    hardcoded: true
  },
  {
    id: 'CUIT',
    label: 'CUIT del Laboratorio',
    type: 'TEXT',
    value_text: '30-71000001-4',
    value_number: null,
    value_decimal: null,
    value_timestamp: '2026-01-01 09:00:00-03',
    hardcoded: true
  },
  {
    id: 'LOCAL_ADDRESS',
    label: 'Domicilio del laboratorio',
    type: 'TEXT',
    value_text: 'Av. de la Industria 1234',
    value_number: null,
    value_decimal: null,
    value_timestamp: '2026-01-01 09:00:00-03',
    hardcoded: true
  },
  {
    id: 'LOCATION',
    label: 'Localidad del laboratorio',
    type: 'TEXT',
    value_text: 'Cañada de Gómez',
    value_number: null,
    value_decimal: null,
    value_timestamp: '2026-01-01 09:00:00-03',
    hardcoded: true
  },
  {
    id: 'PROVINCE',
    label: 'Provincia del laboratorio',
    type: 'TEXT',
    value_text: 'Santa Fe',
    value_number: null,
    value_decimal: null,
    value_timestamp: '2026-01-01 09:00:00-03',
    hardcoded: true
  },
  {
    id: 'PRESIDENT',
    label: 'Presidente de la institución',
    type: 'TEXT',
    value_text: 'Ing. Roberto Martínez (Ficticio)',
    value_number: null,
    value_decimal: null,
    value_timestamp: '2026-01-01 09:00:00-03',
    hardcoded: true
  },
  {
    id: 'PRESIDENT_DNI',
    label: 'DNI del Presidente',
    type: 'TEXT',
    value_text: '20.123.456',
    value_number: null,
    value_decimal: null,
    value_timestamp: '2026-01-01 09:00:00-03',
    hardcoded: true
  },
  {
    id: 'BANK',
    label: 'Entidad bancaria de la institución',
    type: 'TEXT',
    value_text: 'BANCO DEMO CTM Sucursal 001',
    value_number: null,
    value_decimal: null,
    value_timestamp: '2026-01-01 09:00:00-03',
    hardcoded: true
  },
  {
    id: 'BANK_CC',
    label: 'Cuenta corriente en pesos',
    type: 'TEXT',
    value_text: '0001234/5',
    value_number: null,
    value_decimal: null,
    value_timestamp: '2026-01-01 09:00:00-03',
    hardcoded: true
  },
  {
    id: 'BANK_CBU',
    label: 'CBU',
    type: 'TEXT',
    value_text: '0000000000000000000001',
    value_number: null,
    value_decimal: null,
    value_timestamp: '2026-01-01 09:00:00-03',
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
    value_text: 'Dra. Laura Gómez (Ficticio)',
    value_number: null,
    value_decimal: null,
    value_timestamp: '2026-01-01 09:00:00-03',
    hardcoded: true
  },
  {
    id: 'LAB_PHONE',
    label: 'Telefono del laboratorio',
    type: 'TEXT',
    value_text: '+54 9 3471 00-0000',
    value_number: null,
    value_decimal: null,
    value_timestamp: null,
    hardcoded: false
  },
  {
    id: 'LAB_MAIL',
    label: 'Correo del laboratorio',
    type: 'TEXT',
    value_text: 'laboratorio.demo@ctmueble.com.ar',
    value_number: null,
    value_decimal: null,
    value_timestamp: null,
    hardcoded: false
  }
];

const FICTITIOUS_LABORATORY = {
  name: 'Laboratorio de Ensayos CTM (Ficticio)',
  cuit: '30710000014',
  mail: 'laboratorio.demo@ctmueble.com.ar',
  address: 'Av. de la Industria 1234',
  location: 'Cañada de Gómez',
  district: 'AR-S  ',
  country: 'AR'
};

function getDefaultSeedUsers(env = process.env) {
  return {
    labAdmin: {
      mail: env.SEED_ADMIN_MAIL || 'admin.lab@ctmueble.com.ar',
      password: env.SEED_ADMIN_PASSWORD || 'AdminLab1234!',
      name: env.SEED_ADMIN_NAME || 'Admin Laboratorio Demo',
      dni: env.SEED_ADMIN_DNI || '30111222',
      profile: 'LABORATORY',
      role: 'ADMIN'
    },
    client: {
      mail: env.SEED_CLIENT_MAIL || 'cliente.demo@ctmueble.com.ar',
      password: env.SEED_CLIENT_PASSWORD || 'ClienteDemo1234!',
      name: env.SEED_CLIENT_NAME || 'Cliente Demo Muebles',
      dni: env.SEED_CLIENT_DNI || '35222333',
      profile: 'CLIENT'
    }
  };
}

module.exports = {
  ALL_COUNTRIES,
  ARGENTINA_PROVINCES,
  DEFAULT_ESSAY_TYPES,
  DEFAULT_DOCUMENT_TYPES,
  FICTITIOUS_LAB_ENV_VARIABLES,
  FICTITIOUS_LABORATORY,
  getDefaultSeedUsers
};
