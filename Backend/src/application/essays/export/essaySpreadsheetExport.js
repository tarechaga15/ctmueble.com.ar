'use strict';

const WorkOrderDTO = require('../dto/WorkOrderDTO');

/**
 * Neutraliza vectores de Formula / CSV Injection en Excel, LibreOffice Calc y Google Sheets.
 * Prefija con comilla simple (`'`) cualquier texto que comience con `=`, `+`, `-` (no numérico), `@`, `\t` o `\r`.
 */
function sanitizeFormulaValue(val) {
  if (val == null) return '';
  if (typeof val === 'number' || typeof val === 'boolean') return val;
  const s = String(val);
  if (s === '') return '';
  if (/^-[0-9]+([.,][0-9]+)?$/.test(s.trim())) {
    return s;
  }
  if (/^[\t\r\n ]*[=+\-@]/.test(s) || /^[\t\r]/.test(s)) {
    return `'${s}`;
  }
  return s;
}

function fmtDate(v) {
  if (v == null || v === '') return '';
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return '';
    return v.toISOString().split('T')[0];
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().split('T')[0];
}

function fmtDateTime(v) {
  if (v == null || v === '') return '';
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? '' : v.toISOString();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString();
}

function countryLabel(c) {
  if (!c) return '';
  if (typeof c === 'object') return c.name ?? '';
  return String(c);
}

function contactPhone(contact) {
  if (!contact) return '';
  const p = contact.phone;
  if (!p) return '';
  if (typeof p === 'object') {
    const cc = p.country_code ?? '';
    const num = p.phone ?? '';
    return `${cc} ${num}`.trim();
  }
  return String(p);
}

function termsDays(terms) {
  if (!terms) return '';
  const v = terms.daysToDo ?? terms.days_to_do;
  return v != null ? String(v) : '';
}

function termsPrice(terms) {
  if (!terms) return '';
  const p = terms.price;
  return p != null ? String(p) : '';
}

function termsCons(terms) {
  if (!terms) return '';
  const v = terms.samplesConservationDays ?? terms.samples_conservation_days;
  return v != null ? String(v) : '';
}

function fmtBillingAddress(billing) {
  if (!billing) return '';
  const a = billing.address;
  if (a == null) return '';
  if (typeof a === 'string') return a;
  if (typeof a === 'object') return Object.values(a).filter(Boolean).join(', ');
  return String(a);
}

function csvEscape(val) {
  const safeVal = sanitizeFormulaValue(val);
  const s = safeVal == null ? '' : String(safeVal);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(headers, rows) {
  const lines = [
    headers.map(csvEscape).join(','),
    ...rows.map((row) => row.map((cell) => csvEscape(cell)).join(','))
  ];
  return `\uFEFF${lines.join('\r\n')}`;
}

const SOL_HEADERS = [
  'id',
  'codigo_ensayo',
  'estado',
  'fecha_solicitud',
  'fecha_cierre',
  'observaciones',
  'tipo_ensayo',
  'producto',
  'fabricante',
  'lote',
  'fecha_elemento',
  'pais_elemento',
  'plazo_dias',
  'precio',
  'dias_conservacion_muestras',
  'resultado',
  'clasificacion',
  'cliente_cuit',
  'cliente_razon_social',
  'representante',
  'contacto_nombre',
  'contacto_mail',
  'contacto_telefono',
  'facturacion_cuit',
  'facturacion_direccion',
  'facturacion_paga_iva',
  'ot_id',
  'ot_codigo',
  'ot_estado',
  'ot_promedio',
  'ot_incertidumbre',
  'ot_muestras_recibidas',
  'ot_cierre',
  'ot_plazo_informe'
];

const ORDEN_HEADERS = [
  'ot_id',
  'ot_codigo',
  'ensayo_id',
  'codigo_seguimiento_ensayo',
  'estado',
  'promedio',
  'incertidumbre',
  'muestras_recibidas',
  'cierre_ot',
  'generada_en',
  'observaciones'
];

const CLIENT_HEADERS = ['cuit', 'razon_social', 'representante', 'contacto_nombre', 'contacto_mail', 'contacto_telefono'];

function essayToSolicitudRow(essay, woEntity, includeWo) {
  const c = essay.client || {};
  const rep = c.representative || {};
  const wo = includeWo && woEntity ? WorkOrderDTO.fromEntity(woEntity).toJSON() : null;

  return {
    id: essay.id,
    codigo_ensayo: essay.code,
    estado: essay.status,
    fecha_solicitud: fmtDate(essay.requestDate),
    fecha_cierre: fmtDate(essay.finishDate),
    observaciones: essay.observations ?? '',
    tipo_ensayo: essay.type?.name ?? '',
    producto: essay.elements?.product ?? '',
    fabricante: essay.elements?.manufacturer ?? '',
    lote: essay.elements?.batch_number ?? '',
    fecha_elemento: fmtDate(essay.elements?.date),
    pais_elemento: countryLabel(essay.elements?.country),
    plazo_dias: termsDays(essay.terms),
    precio: termsPrice(essay.terms),
    dias_conservacion_muestras: termsCons(essay.terms),
    resultado: essay.result != null ? String(essay.result) : '',
    clasificacion: essay.classification ?? '',
    cliente_cuit: c.cuit ?? '',
    cliente_razon_social: c.name ?? '',
    representante: rep.name ?? '',
    contacto_nombre: c.contact?.name ?? essay.contact?.name ?? '',
    contacto_mail: c.contact?.mail ?? essay.contact?.mail ?? '',
    contacto_telefono: contactPhone(c.contact) || contactPhone(essay.contact),
    facturacion_cuit: essay.billing?.cuit ?? '',
    facturacion_direccion: fmtBillingAddress(essay.billing),
    facturacion_paga_iva: essay.billing?.pays_iva != null ? String(essay.billing.pays_iva) : '',
    ot_id: wo?.id ?? '',
    ot_codigo: wo?.code ?? '',
    ot_estado: wo?.status ?? '',
    ot_promedio: wo?.average_value != null ? String(wo.average_value) : '',
    ot_incertidumbre: wo?.uncertainty ?? '',
    ot_muestras_recibidas: fmtDateTime(wo?.samples_received_at),
    ot_cierre: fmtDateTime(wo?.closed_at),
    ot_plazo_informe: wo?.report_delivery_deadline ?? ''
  };
}

function rowObjectToArray(rowObj, headers) {
  return headers.map((h) => sanitizeFormulaValue(rowObj[h] ?? ''));
}

function buildClientDedupRow(client, contactFallback) {
  const c = client || {};
  const contact = c.contact || contactFallback || {};
  const rep = c.representative || {};
  return {
    cuit: c.cuit ?? '',
    razon_social: c.name ?? '',
    representante: rep.name ?? '',
    contacto_nombre: contact.name ?? '',
    contacto_mail: contact.mail ?? '',
    contacto_telefono: contactPhone(contact)
  };
}

function enrichEssaysForExport(essays, woByEssayId, isLab) {
  return essays.map((e) => {
    const wo = woByEssayId.get(e.id);
    const copy = { ...e };
    const canUseWo = isLab || e.status === 'COMPLETED';
    if (e.status === 'COMPLETED' && canUseWo && wo && (copy.result == null || copy.result === '')) {
      const raw = wo.averageValue;
      if (raw != null && raw !== '') {
        const result = parseFloat(raw);
        if (!Number.isNaN(result)) {
          copy.result = result;
          if (result <= 3.5) copy.classification = 'E1';
          else if (result > 3.5 && result <= 8.0) copy.classification = 'E2';
        }
      }
    }
    return copy;
  });
}

function buildExportTables(essays, woByEssayId, user) {
  const isLab = user?.profile === 'LABORATORY';
  const solicitudRows = [];
  const ordenRows = [];
  const clientKeySeen = new Set();
  const clientRows = [];

  for (const essay of essays) {
    const wo = woByEssayId.get(essay.id);
    const includeWo = isLab || essay.status === 'COMPLETED';
    const rowObj = essayToSolicitudRow(essay, wo, includeWo);
    solicitudRows.push(rowObjectToArray(rowObj, SOL_HEADERS));

    if (wo && includeWo) {
      const wj = WorkOrderDTO.fromEntity(wo).toJSON();
      ordenRows.push(
        [
          wj.id,
          wj.code,
          wj.essay_id,
          wj.essay_track_code ?? '',
          wj.status ?? '',
          wj.average_value != null ? String(wj.average_value) : '',
          wj.uncertainty ?? '',
          fmtDateTime(wj.samples_received_at),
          fmtDateTime(wj.closed_at),
          fmtDateTime(wj.generated_at),
          String(wj.observations ?? '').replace(/\r?\n/g, ' ')
        ].map(sanitizeFormulaValue)
      );
    }

    if (essay.client) {
      const ck = `${essay.client.cuit || ''}|${essay.client.name || ''}|${essay.client.id || ''}`;
      if (ck !== '||' && !clientKeySeen.has(ck)) {
        clientKeySeen.add(ck);
        const cr = buildClientDedupRow(essay.client, essay.contact);
        clientRows.push(
          [
            cr.cuit,
            cr.razon_social,
            cr.representante,
            cr.contacto_nombre,
            cr.contacto_mail,
            cr.contacto_telefono
          ].map(sanitizeFormulaValue)
        );
      }
    }
  }

  return {
    solicitudes: { headers: SOL_HEADERS, rows: solicitudRows },
    ordenes: { headers: ORDEN_HEADERS, rows: ordenRows },
    clientes: { headers: CLIENT_HEADERS, rows: clientRows }
  };
}

async function buildXlsxBuffer(tables) {
  const ExcelJS = require('exceljs');
  const wb = new ExcelJS.Workbook();

  const addSheet = (name, headers, rows) => {
    const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
    ws.addRow(headers.map(sanitizeFormulaValue));
    const hRow = ws.getRow(1);
    hRow.font = { bold: true };
    for (const r of rows) {
      ws.addRow(r.map(sanitizeFormulaValue));
    }
    ws.columns.forEach((col) => {
      let max = 10;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const len = cell.value != null ? String(cell.value).length : 0;
        if (len > max) max = len;
      });
      col.width = Math.min(max + 2, 52);
    });
  };

  addSheet('Solicitudes', tables.solicitudes.headers, tables.solicitudes.rows);
  addSheet('Ordenes de trabajo', tables.ordenes.headers, tables.ordenes.rows);
  addSheet('Clientes', tables.clientes.headers, tables.clientes.rows);

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

function buildCsvBuffer(tables) {
  return toCsv(tables.solicitudes.headers, tables.solicitudes.rows);
}

module.exports = {
  sanitizeFormulaValue,
  enrichEssaysForExport,
  buildExportTables,
  buildXlsxBuffer,
  buildCsvBuffer
};
