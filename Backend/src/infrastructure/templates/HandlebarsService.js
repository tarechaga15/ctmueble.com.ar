/**
 * Servicio de infraestructura para manejar plantillas Handlebars.
 * - Implementa helpers lógicos nativos (`and`, `or`, `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `not`) sin depender del paquete obsoleto `handlebars-helpers`.
 * - Valida que la ruta de plantilla permanezca estrictamente dentro del directorio `templates/`.
 * - Cachea en memoria las plantillas compiladas para evitar `fs.readFileSync` + `Handlebars.compile` en cada emisión de PDF.
 */
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const writtenNumber = require('written-number');

writtenNumber.defaults.lang = 'es';

const TEMPLATES_BASE_DIR = path.resolve(__dirname);
const compiledTemplatesCache = new Map();

// Helpers lógicos nativos compatibles con subexpresiones Handlebars: `{{#if (and a (ne b c))}}`
Handlebars.registerHelper('and', function (...args) {
  const values = args.slice(0, -1);
  return values.every(Boolean);
});

Handlebars.registerHelper('or', function (...args) {
  const values = args.slice(0, -1);
  return values.some(Boolean);
});

Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

Handlebars.registerHelper('ne', function (a, b) {
  return a !== b;
});

Handlebars.registerHelper('gt', function (a, b) {
  return a > b;
});

Handlebars.registerHelper('gte', function (a, b) {
  return a >= b;
});

Handlebars.registerHelper('lt', function (a, b) {
  return a < b;
});

Handlebars.registerHelper('lte', function (a, b) {
  return a <= b;
});

Handlebars.registerHelper('not', function (a) {
  return !a;
});

/**
 * Helper para formatear fechas (soporta `yyyy-mm-dd`, `dd/mm/yyyy` / `dd/MM/YYYY`, `dd`, `MM`, `YYYY`).
 */
Handlebars.registerHelper('formatDate', function (date, format) {
  try {
    if (!date) return '';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';

    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = String(d.getFullYear());
    const fmt = typeof format === 'string' ? format.trim() : '';

    if (fmt.toLowerCase() === 'yyyy-mm-dd') {
      return d.toISOString().split('T')[0];
    }
    if (fmt.toLowerCase() === 'dd/mm/yyyy') {
      return `${dd}/${mm}/${yyyy}`;
    }
    if (fmt === 'dd') {
      return dd;
    }
    if (fmt === 'MM') {
      return mm;
    }
    if (fmt === 'YYYY' || fmt === 'yyyy') {
      return yyyy;
    }
    return `${dd}/${mm}/${yyyy}`;
  } catch (_) {
    return '';
  }
});

Handlebars.registerHelper('dateParts', function (date) {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return { day: '', month: '', year: '' };
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: String(d.getMonth() + 1).padStart(2, '0'),
      year: String(d.getFullYear())
    };
  } catch (_) {
    return { day: '', month: '', year: '' };
  }
});

Handlebars.registerHelper('numeroATexto', function (numero) {
  if (numero == null || Number.isNaN(Number(numero))) return '';
  return writtenNumber(Number(numero)).toUpperCase();
});

Handlebars.registerHelper('formatearNumero', function (numero) {
  if (numero == null || Number.isNaN(Number(numero))) return '';
  return Number(numero).toLocaleString('es-AR');
});

Handlebars.registerHelper('monthName', function (date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const months = [
    'ENERO',
    'FEBRERO',
    'MARZO',
    'ABRIL',
    'MAYO',
    'JUNIO',
    'JULIO',
    'AGOSTO',
    'SEPTIEMBRE',
    'OCTUBRE',
    'NOVIEMBRE',
    'DICIEMBRE'
  ];
  return months[d.getMonth()] || '';
});

Handlebars.registerHelper('formatPhoneNumber', function (country_code, number) {
  const cp = String(country_code || '').replace(/\D/g, '');
  const num = String(number || '').replace(/\D/g, '');
  if (!cp || !num) return '';

  let formatted = `+${cp} `;
  if (num.length === 10) {
    formatted += `${num.substring(0, 2)} ${num.substring(2, 6)}-${num.substring(6)}`;
  } else if (num.length === 8) {
    formatted += `${num.substring(0, 4)}-${num.substring(4)}`;
  } else {
    formatted += num;
  }
  return formatted;
});

let embeddedTemplates = null;
try {
  embeddedTemplates = require('./embeddedTemplates');
} catch (_) {
  embeddedTemplates = null;
}

class HandlebarsService {
  constructor() {
    this.handlebars = Handlebars;
  }

  resolveSafeTemplatePath(templateRelativePath) {
    if (!templateRelativePath || typeof templateRelativePath !== 'string') {
      throw new Error('Ruta de plantilla inválida');
    }
    const resolved = path.resolve(TEMPLATES_BASE_DIR, templateRelativePath);
    const relative = path.relative(TEMPLATES_BASE_DIR, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('Acceso a plantilla fuera del directorio permitido');
    }
    return resolved;
  }

  loadTemplate(templateRelativePath) {
    try {
      const absPath = this.resolveSafeTemplatePath(templateRelativePath);
      if (compiledTemplatesCache.has(absPath)) {
        return compiledTemplatesCache.get(absPath);
      }
      let templateContent = null;
      // 1. Si existe en disco (desarrollo local o bundle con includeFiles), leer el archivo físico directamente
      if (fs.existsSync(absPath)) {
        templateContent = fs.readFileSync(absPath, 'utf8');
      } else {
        // 2. Fallback de seguridad en memoria si el entorno serverless omite los archivos físicos
        const normalizedKey = String(templateRelativePath || '').replace(/\\/g, '/');
        if (embeddedTemplates && typeof embeddedTemplates[normalizedKey] === 'string') {
          templateContent = embeddedTemplates[normalizedKey];
        }
      }
      if (templateContent === null) {
        throw new Error('Archivo de plantilla no encontrado en disco ni en memoria');
      }
      const compiled = Handlebars.compile(templateContent);
      compiledTemplatesCache.set(absPath, compiled);
      return compiled;
    } catch (err) {
      throw new Error(`Error loading template file "${templateRelativePath}": ${err.message}`);
    }
  }

  parseWithTemplate(templateRelativePath, data) {
    const template = this.loadTemplate(templateRelativePath);
    return template(data);
  }
}

module.exports = HandlebarsService;
