/**
 * Script generador de documentación unificada (`DOCUMENTACION_CONSOLIDADA_CTM.md`)
 * y compilador a PDF único con portada e índice clicable (`DOCUMENTACION_CONSOLIDADA_CTM.pdf`).
 *
 * Recorre las 5 carpetas modulares de `docs/` en orden estricto de los Módulos I–IV
 * y Manuales Operativos, extrae encabezados y anclas únicas, construye el Índice General
 * y renderiza mediante Puppeteer bloqueando peticiones externas de red.
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const puppeteer = require('puppeteer');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const OUTPUT_MD_PATH = path.join(DOCS_DIR, 'DOCUMENTACION_CONSOLIDADA_CTM.md');
const OUTPUT_PDF_PATH = path.join(DOCS_DIR, 'DOCUMENTACION_CONSOLIDADA_CTM.pdf');
const DEFAULT_CONFIG_PATH = path.join(DOCS_DIR, 'pdf-config.json');
const PDF_RENDER_TIMEOUT_MS = Number(process.env.DOCS_PDF_TIMEOUT_MS) || 120000;
const MERMAID_CDN_URL = process.env.MERMAID_CDN_URL || 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
const VALID_MERMAID_THEMES = new Set(['neutral', 'default', 'forest', 'dark', 'base']);
const LOGO_MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

const DEFAULT_PDF_CONFIG = {
  cover: {
    badge: 'Centro Tecnológico del Mueble · CTM',
    title: 'Documentación Integral del Sistema',
    titleHighlight: 'gestion.ctmueble.com.ar',
    subtitle: 'Compendio oficial unificado conforme a los lineamientos metodológicos de los Módulos I, II, III y IV.',
    cardTitle: 'Alcance de la compilación:',
    cardDescription: 'Esta edición consolida la documentación de análisis del escenario, jerarquía de procesos y datos, arquitectura e infraestructura cloud, implementación técnica, seguridad, contratos HTTP, base de datos PostgreSQL (34 tablas) y operación funcional del laboratorio.',
    logos: {
      left: {
        enabled: true,
        src: 'docs/assets/logo-ctm.png',
        alt: 'CTM Oficina Virtual',
        height: '44px'
      },
      right: {
        enabled: true,
        src: 'docs/assets/logo-laboratorio-ctm.jpg',
        alt: 'Laboratorio CTM',
        height: '44px'
      }
    },
    metadata: [
      { label: 'Sistema', value: 'Plataforma Web de Gestión de Ensayos y Laboratorio (`gestion.ctmueble.com.ar`)' },
      { label: 'Versión', value: 'v{{version}}' },
      { label: 'Fecha de emisión', value: '{{date}}' },
      { label: 'Contenido incluido', value: '{{modulesCount}} módulos temáticos · {{docsCount}} documentos Markdown recopilados' },
      { label: 'Script generador', value: '`scripts/build-docs-pdf.js` (`npm run build:docs-pdf`)' }
    ],
    footer: 'Centro Tecnológico del Mueble (CTM) — Documento generado automáticamente desde el repositorio oficial de documentación en `/docs`.'
  },
  headerFooter: {
    headerLeft: 'Centro Tecnológico del Mueble (CTM)',
    headerRight: 'gestion.ctmueble.com.ar — Documentación Integral',
    footerLeft: 'Compilación unificada de Módulos I–IV',
    showPageNumbers: true,
    logos: {
      left: {
        enabled: true,
        src: 'docs/assets/logo-ctm.png',
        alt: 'CTM',
        height: '16px'
      },
      right: {
        enabled: true,
        src: 'docs/assets/logo-laboratorio-ctm.jpg',
        alt: 'Laboratorio CTM',
        height: '16px'
      }
    }
  },
  palette: {
    primary: '#c72a33',
    onPrimary: '#ffffff',
    primaryLight: '#f8e4e6',
    primarySoft: '#fdf2f3',
    primaryAccent: '#f2c6ca',
    heading: '#1b080a',
    text: '#333333',
    textMuted: '#6b6b5a',
    textSubtle: '#888888',
    pageBg: '#ffffff',
    surface: '#f7f7ee',
    surfaceAlt: '#f0f0db',
    border: '#d8d8c4',
    borderLight: '#e5e5dc',
    calloutInfoBorder: '#c72a33',
    calloutInfoBg: '#f7f7ee',
    calloutWarnBorder: '#9e2129',
    calloutWarnBg: '#f0f0c7',
    mermaidTheme: 'neutral'
  },
  standaloneManuals: {
    userManual: {
      enabled: true,
      sourcePath: 'docs/05-manuales-operativos-y-guia-cliente/02-MANUAL_USUARIO_FINAL.md',
      outputPdfPath: 'docs/MANUAL_USUARIO_GUIA_PRACTICA_CTM.pdf',
      cover: {
        badge: 'Centro Tecnológico del Mueble · CTM',
        title: 'Manual de Usuario — Guía Práctica',
        titleHighlight: 'oficina.ctmueble.com.ar',
        subtitle: 'Guía paso a paso para clientes, personal administrativo y equipo técnico del laboratorio en la gestión integral de ensayos.',
        cardTitle: 'Propósito del manual:',
        cardDescription: 'Explica de forma práctica cómo ingresar a la Oficina Virtual, administrar empresas y clientes (carga manual o autocompletado auxiliar opcional ARCA), solicitar ensayos, formalizar contratos, recibir muestras, cargar resultados y descargar informes oficiales.',
        metadata: [
          { label: 'Sistema', value: 'CTM Oficina Virtual (`oficina.ctmueble.com.ar` · `gestion.ctmueble.com.ar`)' },
          { label: 'Versión', value: 'v{{version}}' },
          { label: 'Fecha de emisión', value: '{{date}}' },
          { label: 'Alcance', value: '{{chaptersCount}} capítulos operativos · {{sectionsCount}} apartados con listas de control' },
          { label: 'Destinatarios', value: 'Clientes externos (`CLIENT`), administración y personal de laboratorio (`LABORATORY`)' }
        ],
        footer: 'Centro Tecnológico del Mueble (CTM) — Manual de Usuario (Guía Práctica) generado desde `{{sourcePath}}`.'
      },
      headerFooter: {
        headerLeft: 'Centro Tecnológico del Mueble (CTM)',
        headerRight: 'Manual de Usuario — Guía Práctica',
        footerLeft: 'oficina.ctmueble.com.ar — Guía Práctica de Uso',
        showPageNumbers: true
      }
    },
    technicalManual: {
      enabled: true,
      sourcePath: 'docs/05-manuales-operativos-y-guia-cliente/04-MANUAL_TECNICO_INSTALACION_Y_PUESTA_EN_FUNCIONAMIENTO.md',
      outputPdfPath: 'docs/MANUAL_TECNICO_INSTALACION_Y_PUESTA_EN_FUNCIONAMIENTO_CTM.pdf',
      cover: {
        badge: 'Centro Tecnológico del Mueble · CTM',
        title: 'Manual Técnico',
        titleHighlight: 'Instalación y Puesta en Funcionamiento',
        subtitle: 'Referencia técnica para despliegue, configuración de entorno, migraciones de base de datos, seedeo inicial y mantenimiento operativo de `gestion.ctmueble.com.ar` y `oficina.ctmueble.com.ar`.',
        cardTitle: 'Alcance técnico:',
        cardDescription: 'Cubre arquitectura cloud/local, requisitos previos, variables `.env` por subsistema, ejecución de migraciones Umzug sobre PostgreSQL/Neon, seedeo global y granular, compilación del frontend React/Vite, pruebas automatizadas, despliegue en Vercel/R2 y troubleshooting.',
        metadata: [
          { label: 'Componentes', value: 'Backend API Node/Express (`gestion.ctmueble.com.ar`) · Frontend React/Vite (`oficina.ctmueble.com.ar`)' },
          { label: 'Versión', value: 'v{{version}}' },
          { label: 'Fecha de emisión', value: '{{date}}' },
          { label: 'Contenido', value: '{{chaptersCount}} capítulos técnicos · {{sectionsCount}} secciones de configuración y operación' },
          { label: 'Destinatarios', value: 'Equipo de desarrollo, DevOps, infraestructura y administración técnica del sistema' }
        ],
        footer: 'Centro Tecnológico del Mueble (CTM) — Manual Técnico generado desde `{{sourcePath}}`.'
      },
      headerFooter: {
        headerLeft: 'Centro Tecnológico del Mueble (CTM)',
        headerRight: 'Manual Técnico — Instalación y Puesta en Funcionamiento',
        footerLeft: 'gestion.ctmueble.com.ar — Manual Técnico Operativo',
        showPageNumbers: true
      }
    }
  }
};

const MODULE_DEFINITIONS = [
  {
    dirName: '01-modulo-i-pautas-y-analisis-escenario',
    roman: 'Módulo I',
    title: 'Pautas Generales, Organización y Análisis del Escenario',
    subtitle: 'Equipo de trabajo, escenario CTM, modelo de negocio, organigrama, procesos, problemática, alcance y diagramas AS-IS.'
  },
  {
    dirName: '02-modulo-ii-jerarquia-procesos-y-estructura-datos',
    roman: 'Módulo II',
    title: 'Jerarquía de Procesos y Estructura de Datos',
    subtitle: 'Objetivo, alcance real, usuarios/roles, cascada operativa, requerimientos RF/RNF, reglas de negocio, diagramas TO-BE, casos de uso y clasificación de datos.'
  },
  {
    dirName: '03-modulo-iii-arquitectura-y-planificacion',
    roman: 'Módulo III',
    title: 'Arquitectura y Planificación de Implementación',
    subtitle: 'Tipo de solución web/serverless, Neon PostgreSQL, diseño lógico definitivo (34 tablas y normalización), módulos, navegación, mockups, seguridad, políticas y mantenimiento.'
  },
  {
    dirName: '04-modulo-iv-desarrollo-implementacion-y-validacion',
    roman: 'Módulo IV',
    title: 'Desarrollo, Implementación y Validación del Sistema',
    subtitle: 'Entorno DDD, desarrollo incremental, incidencias, seguridad 2FA/cookies/CSRF, permisos, cifrado KMS, ARCA, ensayos/OT/muestras, PDF, emails, integridad RSA/OTS, contratos HTTP, middlewares y tests.'
  }
];

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'seccion';
}

function stripMarkdownFormatting(text) {
  return String(text || '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim();
}

function formatReadableDate(date) {
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function resolveConfigArgPath() {
  const args = process.argv.slice(2);
  for (let idx = 0; idx < args.length; idx += 1) {
    const arg = args[idx];
    if (arg.startsWith('--config=')) {
      return path.resolve(process.cwd(), arg.slice('--config='.length));
    }
    if (arg === '--config' && args[idx + 1]) {
      return path.resolve(process.cwd(), args[idx + 1]);
    }
  }
  return null;
}

function sanitizeCssColor(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) {
    return trimmed;
  }
  if (/^(rgb|rgba|hsl|hsla)\(\s*[0-9.,%\s+-]+\s*\)$/i.test(trimmed)) {
    return trimmed;
  }
  if (/^[a-zA-Z]{3,24}$/.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

function pickString(rawObj, key, fallback) {
  if (!rawObj || typeof rawObj !== 'object') return fallback;
  return typeof rawObj[key] === 'string' ? rawObj[key] : fallback;
}

function sanitizeLogoHeight(value, fallback) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return `${value}px`;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
      return `${trimmed}px`;
    }
    if (/^\d+(?:\.\d+)?(?:px|mm|cm|pt)$/.test(trimmed)) {
      return trimmed;
    }
  }
  return fallback;
}

const logoDataUrlCache = new Map();

function loadLogoAsDataUrl(logoSrc) {
  const src = String(logoSrc || '').trim();
  if (!src) return null;
  if (/^data:image\/(png|jpeg|jpg|svg\+xml|webp);base64,[A-Za-z0-9+/=]+$/i.test(src)) {
    return src;
  }
  if (logoDataUrlCache.has(src)) {
    return logoDataUrlCache.get(src);
  }

  const candidatePaths = path.isAbsolute(src)
    ? [src]
    : [path.resolve(ROOT_DIR, src), path.resolve(DOCS_DIR, src)];
  const resolvedPath = candidatePaths.find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
  if (!resolvedPath) {
    throw new Error(`No se encontró el archivo de logo "${src}". Verificá la ruta en docs/pdf-config.json.`);
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const mime = LOGO_MIME_TYPES[ext];
  if (!mime) {
    throw new Error(`Formato de logo no soportado (${ext}) en "${src}". Formatos válidos: .png, .jpg, .jpeg, .svg, .webp.`);
  }

  const dataUrl = `data:${mime};base64,${fs.readFileSync(resolvedPath).toString('base64')}`;
  logoDataUrlCache.set(src, dataUrl);
  return dataUrl;
}

function resolveLogoConfig(rawLogo, defaultLogo) {
  if (typeof rawLogo === 'string') {
    const src = rawLogo.trim();
    const enabled = Boolean(src);
    return {
      enabled,
      src,
      alt: defaultLogo.alt,
      height: defaultLogo.height,
      dataUrl: enabled ? loadLogoAsDataUrl(src) : null
    };
  }

  if (rawLogo && typeof rawLogo === 'object' && !Array.isArray(rawLogo)) {
    const src = typeof rawLogo.src === 'string' ? rawLogo.src.trim() : defaultLogo.src;
    const enabled = typeof rawLogo.enabled === 'boolean' ? rawLogo.enabled && Boolean(src) : Boolean(src);
    return {
      enabled,
      src,
      alt: typeof rawLogo.alt === 'string' ? rawLogo.alt : defaultLogo.alt,
      height: sanitizeLogoHeight(rawLogo.height, defaultLogo.height),
      dataUrl: enabled ? loadLogoAsDataUrl(src) : null
    };
  }

  const fallbackEnabled = Boolean(defaultLogo.enabled && defaultLogo.src);
  return {
    enabled: fallbackEnabled,
    src: defaultLogo.src,
    alt: defaultLogo.alt,
    height: defaultLogo.height,
    dataUrl: fallbackEnabled ? loadLogoAsDataUrl(defaultLogo.src) : null
  };
}

function resolveLogosPair(rawLogos, defaultLogos) {
  const safeRaw = rawLogos && typeof rawLogos === 'object' ? rawLogos : {};
  return {
    left: resolveLogoConfig(safeRaw.left, defaultLogos.left),
    right: resolveLogoConfig(safeRaw.right, defaultLogos.right)
  };
}

function renderLogoImg(logo, extraStyle = '') {
  if (!logo || !logo.enabled) return '';
  const dataUrl = logo.dataUrl || (logo.src ? loadLogoAsDataUrl(logo.src) : null);
  if (!dataUrl) return '';
  const style = `height:${escapeHtml(logo.height || '44px')};width:auto;object-fit:contain;display:block;${extraStyle}`;
  return `<img src="${dataUrl}" alt="${escapeHtml(logo.alt || '')}" style="${style}" />`;
}

function resolveCoverSection(rawCover, defaultCover, fallbackLogos) {
  const safeRaw = rawCover && typeof rawCover === 'object' ? rawCover : {};
  const rawMetadata = Array.isArray(safeRaw.metadata)
    ? safeRaw.metadata
        .filter((item) => item && typeof item === 'object' && (typeof item.label === 'string' || typeof item.value === 'string'))
        .map((item) => ({
          label: typeof item.label === 'string' ? item.label : '',
          value: typeof item.value === 'string' ? item.value : ''
        }))
    : defaultCover.metadata;

  return {
    badge: pickString(safeRaw, 'badge', defaultCover.badge),
    title: pickString(safeRaw, 'title', defaultCover.title),
    titleHighlight: pickString(safeRaw, 'titleHighlight', defaultCover.titleHighlight),
    subtitle: pickString(safeRaw, 'subtitle', defaultCover.subtitle),
    cardTitle: pickString(safeRaw, 'cardTitle', defaultCover.cardTitle),
    cardDescription: pickString(safeRaw, 'cardDescription', defaultCover.cardDescription),
    logos: resolveLogosPair(safeRaw.logos, fallbackLogos || defaultCover.logos),
    metadata: rawMetadata,
    footer: pickString(safeRaw, 'footer', defaultCover.footer)
  };
}

function resolveHeaderFooterSection(rawHeaderFooter, defaultHeaderFooter, fallbackLogos) {
  const safeRaw = rawHeaderFooter && typeof rawHeaderFooter === 'object' ? rawHeaderFooter : {};
  return {
    headerLeft: pickString(safeRaw, 'headerLeft', defaultHeaderFooter.headerLeft),
    headerRight: pickString(safeRaw, 'headerRight', defaultHeaderFooter.headerRight),
    footerLeft: pickString(safeRaw, 'footerLeft', defaultHeaderFooter.footerLeft),
    showPageNumbers:
      typeof safeRaw.showPageNumbers === 'boolean'
        ? safeRaw.showPageNumbers
        : defaultHeaderFooter.showPageNumbers,
    logos: resolveLogosPair(safeRaw.logos, fallbackLogos || defaultHeaderFooter.logos)
  };
}

function resolveStandaloneManuals(rawManuals, baseCover, baseHeaderFooter) {
  const safeRaw = rawManuals && typeof rawManuals === 'object' && !Array.isArray(rawManuals) ? rawManuals : {};
  const defaultManuals = DEFAULT_PDF_CONFIG.standaloneManuals;
  const allKeys = Array.from(new Set([...Object.keys(defaultManuals), ...Object.keys(safeRaw)]));

  const manuals = [];
  allKeys.forEach((key) => {
    const defEntry = defaultManuals[key] || {};
    const usrEntry = safeRaw[key] && typeof safeRaw[key] === 'object' ? safeRaw[key] : {};
    const enabled = typeof usrEntry.enabled === 'boolean' ? usrEntry.enabled : defEntry.enabled !== false;
    const sourcePath = pickString(usrEntry, 'sourcePath', defEntry.sourcePath || '');
    const outputPdfPath = pickString(usrEntry, 'outputPdfPath', defEntry.outputPdfPath || '');

    if (!sourcePath || !outputPdfPath) {
      return;
    }

    const fallbackCover = {
      ...baseCover,
      ...(defEntry.cover || {}),
      logos: (defEntry.cover && defEntry.cover.logos) || baseCover.logos
    };
    const fallbackHf = {
      ...baseHeaderFooter,
      ...(defEntry.headerFooter || {}),
      logos: (defEntry.headerFooter && defEntry.headerFooter.logos) || baseHeaderFooter.logos
    };

    manuals.push({
      key,
      enabled,
      sourcePath,
      outputPdfPath,
      cover: resolveCoverSection(usrEntry.cover, fallbackCover, fallbackCover.logos),
      headerFooter: resolveHeaderFooterSection(usrEntry.headerFooter, fallbackHf, fallbackHf.logos)
    });
  });

  return manuals;
}

function loadPdfConfig() {
  const explicitPath = resolveConfigArgPath();
  const configPath = explicitPath || DEFAULT_CONFIG_PATH;
  let userConfig = {};
  let configSource = 'default';

  if (explicitPath && !fs.existsSync(explicitPath)) {
    throw new Error(`No se encontró el archivo de configuración especificado: ${explicitPath}`);
  }

  if (fs.existsSync(configPath)) {
    const rawJson = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error(`El archivo de configuración debe contener un objeto JSON válido: ${configPath}`);
    }
    userConfig = parsed;
    configSource = path.relative(ROOT_DIR, configPath) || path.basename(configPath);
  }

  const cover = resolveCoverSection(userConfig.cover, DEFAULT_PDF_CONFIG.cover, DEFAULT_PDF_CONFIG.cover.logos);
  const headerFooter = resolveHeaderFooterSection(
    userConfig.headerFooter,
    DEFAULT_PDF_CONFIG.headerFooter,
    DEFAULT_PDF_CONFIG.headerFooter.logos
  );

  const rawPalette = userConfig.palette || {};
  const palette = {};
  Object.entries(DEFAULT_PDF_CONFIG.palette).forEach(([key, defaultVal]) => {
    if (key === 'mermaidTheme') {
      const candidate = typeof rawPalette.mermaidTheme === 'string' ? rawPalette.mermaidTheme.trim().toLowerCase() : '';
      palette.mermaidTheme = VALID_MERMAID_THEMES.has(candidate) ? candidate : defaultVal;
    } else {
      palette[key] = sanitizeCssColor(rawPalette[key], defaultVal);
    }
  });

  const standaloneManuals = resolveStandaloneManuals(userConfig.standaloneManuals, cover, headerFooter);

  return { configSource, cover, headerFooter, palette, standaloneManuals };
}

function interpolateTemplate(text, vars) {
  return String(text || '').replace(
    /\{\{\s*(version|date|modulesCount|docsCount|chaptersCount|sectionsCount|sourcePath)\s*\}\}/g,
    (_m, key) => (Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : '')
  );
}

function buildTemplateVars(modules, generatedAt) {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
  const totalDocs = modules.reduce((acc, m) => acc + m.documents.length, 0);
  return {
    version: String(pkg.version || '1.2.0'),
    date: formatReadableDate(generatedAt),
    modulesCount: String(modules.length),
    docsCount: String(totalDocs)
  };
}

/**
 * Descubre los archivos `.md` dentro de cada carpeta modular ordenada.
 * Ignora subcarpetas (`anexos/`), archivos no `.md` y salidas compiladas previas.
 */
function discoverModuleDocuments() {
  return MODULE_DEFINITIONS.map((modDef, modIndex) => {
    const dirPath = path.join(DOCS_DIR, modDef.dirName);
    if (!fs.existsSync(dirPath)) {
      return { ...modDef, modNumber: modIndex + 1, documents: [] };
    }

    const mdFiles = fs
      .readdirSync(dirPath, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' }));

    const documents = mdFiles.map((fileName, docIndex) => {
      const fullPath = path.join(dirPath, fileName);
      const relativePath = path.posix.join('docs', modDef.dirName, fileName);
      const rawContent = fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n');
      const parsed = analyzeDocumentHeadings(rawContent, modIndex + 1, docIndex + 1, fileName);

      return {
        fileName,
        relativePath,
        docNumber: `${modIndex + 1}.${docIndex + 1}`,
        anchorId: parsed.docAnchorId,
        title: parsed.title,
        rawContent,
        headings: parsed.headings,
        headingMapByLine: parsed.headingMapByLine
      };
    });

    return {
      ...modDef,
      modNumber: modIndex + 1,
      anchorId: `modulo-${modIndex + 1}`,
      documents
    };
  });
}

/**
 * Extrae la jerarquía de títulos (#, ##, ###) ignorando comentarios dentro de bloques de código.
 */
function analyzeDocumentHeadings(markdownText, modNumber, docNumber, fileName, options = {}) {
  const { omitDisplayNumbers = false } = options;
  const lines = markdownText.split('\n');
  const docAnchorId = `doc-${modNumber}-${docNumber}`;
  const headings = [];
  const headingMapByLine = new Map();

  let inFence = false;
  let fenceChar = null;
  let docTitle = fileName.replace(/\.md$/i, '');
  let foundMainTitle = false;
  let secCounter = 0;
  let subCounter = 0;

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (!inFence) {
        inFence = true;
        fenceChar = marker;
      } else if (marker === fenceChar) {
        inFence = false;
        fenceChar = null;
      }
      return;
    }
    if (inFence) return;

    const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (!headingMatch) return;

    const level = headingMatch[1].length;
    const cleanText = stripMarkdownFormatting(headingMatch[2]);

    if (level === 1 && !foundMainTitle) {
      docTitle = cleanText;
      foundMainTitle = true;
      headingMapByLine.set(lineIdx, {
        level: 1,
        text: cleanText,
        anchorId: docAnchorId,
        displayNumber: omitDisplayNumbers ? '' : `${modNumber}.${docNumber}`
      });
      return;
    }

    if (level === 2) {
      secCounter += 1;
      subCounter = 0;
      const anchorId = `${docAnchorId}-s${secCounter}-${slugify(cleanText).slice(0, 32)}`;
      const entry = {
        level: 2,
        text: cleanText,
        anchorId,
        displayNumber: omitDisplayNumbers ? '' : `${modNumber}.${docNumber}.${secCounter}`
      };
      headings.push(entry);
      headingMapByLine.set(lineIdx, entry);
      return;
    }

    if (level === 3) {
      subCounter += 1;
      const prefix = omitDisplayNumbers
        ? ''
        : secCounter > 0
          ? `${modNumber}.${docNumber}.${secCounter}.${subCounter}`
          : `${modNumber}.${docNumber}.${subCounter}`;
      const anchorId = `${docAnchorId}-s${secCounter}-${subCounter}-${slugify(cleanText).slice(0, 28)}`;
      const entry = {
        level: 3,
        text: cleanText,
        anchorId,
        displayNumber: prefix
      };
      headings.push(entry);
      headingMapByLine.set(lineIdx, entry);
      return;
    }

    const fallbackId = `${docAnchorId}-h-${lineIdx}-${slugify(cleanText).slice(0, 24)}`;
    headingMapByLine.set(lineIdx, {
      level,
      text: cleanText,
      anchorId: fallbackId,
      displayNumber: ''
    });
  });

  return { docAnchorId, title: docTitle, headings, headingMapByLine };
}

/**
 * Renderiza Markdown inline preservando código embebido y evitando romper identificadores `snake_case`.
 */
function renderInline(text) {
  if (!text) return '';

  const codeTokens = [];
  let tokenized = String(text).replace(/`([^`]+)`/g, (_m, code) => {
    const token = `@@CTM_CODE_${codeTokens.length}@@`;
    codeTokens.push(`<code>${escapeHtml(code)}</code>`);
    return token;
  });

  const BR_TOKEN = '@@CTM_BR_TOKEN@@';
  let out = tokenized.replace(/<br\s*\/?>/gi, BR_TOKEN);
  out = escapeHtml(out);
  out = out.replace(new RegExp(BR_TOKEN, 'g'), '<br>');

  // Links Markdown: [label](href)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, rawLabel, rawHref) => {
    const label = rawLabel.trim();
    const href = rawHref.trim();
    if (href.startsWith('#')) {
      return `<a href="${escapeHtml(href)}">${label}</a>`;
    }
    if (href.startsWith('file:///')) {
      const shortRef = label || path.basename(href);
      return `<span class="file-ref">${shortRef}</span>`;
    }
    if (/^(https?:\/\/)/i.test(href)) {
      return `<a href="${escapeHtml(href)}">${label}</a> <span class="link-url">(${escapeHtml(href)})</span>`;
    }
    return `<span class="file-ref">${label}</span>`;
  });

  // Negrita (**texto** y __texto__)
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[\s(])__([^_]+)__(?=[\s.,;:!?)]|$)/g, '$1<strong>$2</strong>');

  // Cursiva (*texto* y _texto_ delimitado por bordes de palabra para no romper snake_case)
  out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  out = out.replace(/(^|[\s(])_([^_\n]+)_(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>');

  // Restaurar código embebido preservando su contenido sin formateo Markdown interno
  codeTokens.forEach((htmlCode, idx) => {
    out = out.replace(`@@CTM_CODE_${idx}@@`, () => htmlCode);
  });

  return out;
}

function splitTableRow(rowLine) {
  let trimmed = rowLine.trim();
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);

  const cells = [];
  let current = '';
  let inCode = false;
  for (let i = 0; i < trimmed.length; i += 1) {
    const ch = trimmed[i];
    if (ch === '\\' && trimmed[i + 1] === '|') {
      current += '|';
      i += 1;
      continue;
    }
    if (ch === '`') inCode = !inCode;
    if (ch === '|' && !inCode) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function isTableSeparatorLine(line) {
  const trimmed = line.trim();
  if (!trimmed.includes('|') || !trimmed.includes('-')) return false;
  const cells = splitTableRow(trimmed);
  return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
}

function parseTableAlignments(sepLine) {
  return splitTableRow(sepLine).map((cell) => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    return 'left';
  });
}

/**
 * Compila un documento Markdown completo a HTML limpio respetando anclas calculadas.
 */
function renderMarkdownDocumentToHtml(doc) {
  const lines = doc.rawContent.split('\n');
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // 1. Bloque de código con valla ``` o ~~~
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})(.*)$/);
    if (fenceMatch) {
      const fenceSeq = fenceMatch[1];
      const fenceChar = fenceSeq[0];
      const lang = (fenceMatch[2] || '').trim().toLowerCase();
      const codeLines = [];
      i += 1;
      while (i < lines.length) {
        const closingMatch = lines[i].trim().match(/^(`{3,}|~{3,})\s*$/);
        if (closingMatch && closingMatch[1][0] === fenceChar && closingMatch[1].length >= fenceSeq.length) {
          i += 1;
          break;
        }
        codeLines.push(lines[i]);
        i += 1;
      }
      const rawBlock = codeLines.join('\n');
      if (lang === 'mermaid') {
        html.push(`<div class="mermaid-wrap"><pre class="mermaid" data-doc="${escapeHtml(doc.relativePath)}">${escapeHtml(rawBlock)}</pre></div>`);
        continue;
      }
      const isDiagram = lang === 'text' || lang === 'ascii' || codeLines.some((l) => /[┌┐└┘│─▼▲►◄├┤┬┴┼]/.test(l));
      const cls = isDiagram ? 'code-block diagram-block' : 'code-block';
      html.push(`<pre class="${cls}"><code class="lang-${escapeHtml(lang || 'plain')}">${escapeHtml(rawBlock)}</code></pre>`);
      continue;
    }

    // 2. Separador horizontal --- / ***
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      html.push('<hr class="section-divider" />');
      i += 1;
      continue;
    }

    // 3. Encabezados # .. ######
    const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (headingMatch) {
      const rawLevel = headingMatch[1].length;
      const meta = doc.headingMapByLine.get(i);
      const htmlLevel = Math.min(6, rawLevel + 1); // Doc H1 -> H2, Doc H2 -> H3...
      const anchorAttr = meta ? ` id="${escapeHtml(meta.anchorId)}"` : '';
      const numPrefix = meta && meta.displayNumber ? `<span class="sec-num">${escapeHtml(meta.displayNumber)}</span> ` : '';
      const cls = rawLevel === 1 ? ' class="doc-title"' : rawLevel === 2 ? ' class="doc-h2"' : ' class="doc-h3"';
      html.push(`<h${htmlLevel}${anchorAttr}${cls}>${numPrefix}${renderInline(headingMatch[2])}</h${htmlLevel}>`);
      i += 1;
      continue;
    }

    // 4. Tabla GFM
    if (trimmed.includes('|') && i + 1 < lines.length && isTableSeparatorLine(lines[i + 1])) {
      const headers = splitTableRow(line);
      const alignments = parseTableAlignments(lines[i + 1]);
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].trim().includes('|') && !/^\s*(#{1,6}\s|```|---)/.test(lines[i])) {
        rows.push(splitTableRow(lines[i]));
        i += 1;
      }

      const ths = headers
        .map((h, idx) => `<th style="text-align:${alignments[idx] || 'left'}">${renderInline(h)}</th>`)
        .join('');
      const trs = rows
        .map((r) => {
          const tds = headers
            .map((_h, idx) => `<td style="text-align:${alignments[idx] || 'left'}">${renderInline(r[idx] || '')}</td>`)
            .join('');
          return `<tr>${tds}</tr>`;
        })
        .join('');

      html.push(`<div class="table-wrap"><table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`);
      continue;
    }

    // 5. Cita o Callout (> ...)
    if (trimmed.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
        i += 1;
      }
      let calloutClass = 'callout-note';
      let calloutPrefix = '';
      if (/^\s*\[!(WARNING|CAUTION)\]/i.test(quoteLines[0] || '')) {
        calloutClass = 'callout-warn';
        quoteLines[0] = quoteLines[0].replace(/^\s*\[!(WARNING|CAUTION)\]\s*/i, '');
        calloutPrefix = '<strong>Atención:</strong> ';
      } else if (/^\s*\[!(IMPORTANT|TIP|NOTE)\]/i.test(quoteLines[0] || '')) {
        quoteLines[0] = quoteLines[0].replace(/^\s*\[!(IMPORTANT|TIP|NOTE)\]\s*/i, '');
        calloutPrefix = '<strong>Nota clave:</strong> ';
      }
      const renderedLines = quoteLines.filter((l, idx) => idx > 0 || l.trim().length > 0).map((l) => renderInline(l));
      html.push(`<blockquote class="callout ${calloutClass}">${calloutPrefix}${renderedLines.join('<br>')}</blockquote>`);
      continue;
    }

    // 6. Listas (ordenadas y no ordenadas con soporte de anidamiento por indentación)
    const listStartMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
    if (listStartMatch) {
      const listHtml = parseListBlock(lines, i);
      html.push(listHtml.html);
      i = listHtml.nextIndex;
      continue;
    }

    // 7. Párrafo estándar
    const paraLines = [trimmed];
    i += 1;
    while (i < lines.length) {
      const next = lines[i];
      const nextTrim = next.trim();
      if (
        !nextTrim ||
        /^(`{3,}|~{3,})/.test(nextTrim) ||
        /^(#{1,6})\s+/.test(next) ||
        /^(-{3,}|\*{3,}|_{3,})$/.test(nextTrim) ||
        nextTrim.startsWith('>') ||
        /^(\s*)([-*+]|\d+\.)\s+/.test(next) ||
        (nextTrim.includes('|') && i + 1 < lines.length && isTableSeparatorLine(lines[i + 1]))
      ) {
        break;
      }
      paraLines.push(nextTrim);
      i += 1;
    }
    html.push(`<p>${renderInline(paraLines.join(' '))}</p>`);
  }

  return html.join('\n');
}

function parseListBlock(lines, startIndex) {
  const stack = [];
  const out = [];
  let i = startIndex;

  function closeListsDownTo(targetIndent) {
    while (stack.length > 0 && stack[stack.length - 1].indent > targetIndent) {
      const top = stack.pop();
      out.push(`</li></${top.type}>`);
    }
  }

  while (i < lines.length) {
    const raw = lines[i];
    if (!raw.trim()) {
      const lookahead = lines[i + 1] || '';
      if (!/^(\s*)([-*+]|\d+\.)\s+/.test(lookahead)) {
        break;
      }
      i += 1;
      continue;
    }

    const match = raw.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
    if (!match) {
      if (/^\s*(`{3,}|~{3,})/.test(raw)) {
        break;
      }
      if (/^\s{2,}/.test(raw) && stack.length > 0) {
        out.push(` ${renderInline(raw.trim())}`);
        i += 1;
        continue;
      }
      break;
    }

    const indent = match[1].replace(/\t/g, '  ').length;
    const type = /^\d+\./.test(match[2]) ? 'ol' : 'ul';
    const rawItemText = match[3]
      .replace(/^\[ \]\s+/, '☐ ')
      .replace(/^\[[xX]\]\s+/, '☑ ');
    const text = renderInline(rawItemText);

    if (stack.length === 0) {
      out.push(`<${type}>`);
      stack.push({ indent, type });
      out.push(`<li>${text}`);
    } else {
      const top = stack[stack.length - 1];
      if (indent > top.indent) {
        out.push(`<${type}>`);
        stack.push({ indent, type });
        out.push(`<li>${text}`);
      } else {
        closeListsDownTo(indent);
        if (stack.length === 0 || stack[stack.length - 1].type !== type) {
          if (stack.length > 0) {
            const popped = stack.pop();
            out.push(`</li></${popped.type}>`);
          }
          out.push(`<${type}>`);
          stack.push({ indent, type });
          out.push(`<li>${text}`);
        } else {
          out.push(`</li><li>${text}`);
        }
      }
    }
    i += 1;
  }

  while (stack.length > 0) {
    const top = stack.pop();
    out.push(`</li></${top.type}>`);
  }

  return { html: out.join(''), nextIndex: i };
}

/**
 * Construye el Markdown unificado (`DOCUMENTACION_CONSOLIDADA_CTM.md`).
 */
function buildConsolidatedMarkdown(modules, generatedAt, pdfConfig = DEFAULT_PDF_CONFIG) {
  const vars = buildTemplateVars(modules, generatedAt);
  const cover = pdfConfig.cover || DEFAULT_PDF_CONFIG.cover;
  const title = interpolateTemplate(cover.title, vars).trim() || DEFAULT_PDF_CONFIG.cover.title;
  const titleHighlight = interpolateTemplate(cover.titleHighlight, vars).trim();
  const subtitle = interpolateTemplate(cover.subtitle, vars).trim();
  const metadata = Array.isArray(cover.metadata) ? cover.metadata : [];

  const lines = [];

  lines.push(`# ${title}${titleHighlight ? ` — \`${titleHighlight}\`` : ''}`);
  lines.push('');
  if (subtitle) {
    lines.push(`> ${stripMarkdownFormatting(subtitle)}`);
    lines.push('');
  }
  metadata.forEach((item) => {
    const label = interpolateTemplate(item.label, vars).trim();
    const value = interpolateTemplate(item.value, vars).trim();
    if (label || value) {
      lines.push(label ? `- **${label}:** ${value}` : `- ${value}`);
    }
  });
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Índice General');
  lines.push('');

  modules.forEach((mod) => {
    lines.push(`- **${mod.roman}: ${mod.title}** (\`docs/${mod.dirName}/\`)`);
    mod.documents.forEach((doc) => {
      lines.push(`  - **${doc.docNumber}. ${doc.title}** (\`${doc.relativePath}\`)`);
      doc.headings
        .filter((h) => h.level === 2)
        .forEach((h) => {
          lines.push(`    - ${h.displayNumber} ${h.text}`);
        });
    });
  });

  lines.push('');
  lines.push('---');
  lines.push('');

  modules.forEach((mod) => {
    lines.push(`# ${mod.roman} — ${mod.title}`);
    lines.push('');
    lines.push(`> ${mod.subtitle}`);
    lines.push('');

    mod.documents.forEach((doc) => {
      lines.push(`<!-- Fuente: ${doc.relativePath} -->`);
      lines.push('');
      lines.push(doc.rawContent.trim());
      lines.push('');
      lines.push('---');
      lines.push('');
    });
  });

  return lines.join('\n');
}

function buildPdfStylesCss(palette) {
  return `
    :root {
      --color-primary: ${palette.primary};
      --color-on-primary: ${palette.onPrimary};
      --color-primary-light: ${palette.primaryLight};
      --color-primary-soft: ${palette.primarySoft};
      --color-primary-accent: ${palette.primaryAccent};
      --color-heading: ${palette.heading};
      --color-text: ${palette.text};
      --color-text-muted: ${palette.textMuted};
      --color-text-subtle: ${palette.textSubtle};
      --color-page-bg: ${palette.pageBg};
      --color-surface: ${palette.surface};
      --color-surface-alt: ${palette.surfaceAlt};
      --color-border: ${palette.border};
      --color-border-light: ${palette.borderLight};
      --color-callout-info-border: ${palette.calloutInfoBorder};
      --color-callout-info-bg: ${palette.calloutInfoBg};
      --color-callout-warn-border: ${palette.calloutWarnBorder};
      --color-callout-warn-bg: ${palette.calloutWarnBg};
    }
    @page {
      size: A4 portrait;
      margin: 22mm 14mm 18mm 14mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", Arial, Helvetica, sans-serif;
      font-size: 9.4pt;
      line-height: 1.48;
      color: var(--color-text);
      background: var(--color-page-bg);
      margin: 0;
      padding: 0;
    }
    a { color: var(--color-primary); text-decoration: none; }
    code {
      font-family: Consolas, "Courier New", monospace;
      font-size: 8.3pt;
      background: var(--color-surface-alt);
      color: var(--color-heading);
      padding: 1px 4px;
      border-radius: 3px;
      overflow-wrap: anywhere;
    }
    .code-block {
      font-family: Consolas, "Courier New", monospace;
      font-size: 7.4pt;
      line-height: 1.32;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-left: 3px solid var(--color-primary);
      border-radius: 4px;
      padding: 8px 10px;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      margin: 8px 0 12px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .code-block code {
      background: transparent;
      padding: 0;
      font-size: inherit;
    }
    .diagram-block {
      background: var(--color-page-bg);
      border: 1px solid var(--color-border);
      border-left: 3px solid var(--color-primary);
      font-size: 7.2pt;
      line-height: 1.25;
    }
    .mermaid-wrap {
      text-align: center;
      background: var(--color-page-bg);
      border: 1px solid var(--color-border);
      border-left: 3px solid var(--color-primary);
      border-radius: 6px;
      padding: 8px 10px;
      margin: 8px 0 12px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .mermaid {
      margin: 0;
      font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    }
    .mermaid svg {
      max-width: 100% !important;
      max-height: 220mm !important;
      width: auto !important;
      height: auto !important;
      display: block;
      margin: 0 auto;
    }
    .cover-page {
      page-break-after: always;
      break-after: page;
      padding: 16mm 10mm 12mm 10mm;
      border-top: 8px solid var(--color-primary);
      min-height: 242mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .cover-logos-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border-light);
    }
    .cover-logo-slot {
      display: flex;
      align-items: center;
      max-width: 45%;
    }
    .cover-logo-slot.left { justify-content: flex-start; }
    .cover-logo-slot.right { justify-content: flex-end; }
    .cover-logo-slot img { max-width: 100%; }
    .cover-badge {
      display: inline-block;
      background: var(--color-primary-light);
      color: var(--color-primary);
      font-weight: 700;
      font-size: 9pt;
      padding: 5px 12px;
      border-radius: 4px;
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }
    .cover-title {
      font-size: 25pt;
      line-height: 1.18;
      color: var(--color-heading);
      margin: 18px 0 10px 0;
      font-weight: 800;
    }
    .cover-subtitle {
      font-size: 12pt;
      color: var(--color-text-muted);
      margin: 0 0 24px 0;
      line-height: 1.5;
    }
    .cover-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-left: 4px solid var(--color-primary);
      padding: 14px 16px;
      border-radius: 4px;
      margin-bottom: 18px;
    }
    .cover-meta-grid {
      display: table;
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }
    .cover-meta-grid td {
      padding: 6px 8px;
      border-bottom: 1px solid var(--color-border-light);
      font-size: 9.2pt;
    }
    .cover-footer {
      border-top: 1px solid var(--color-border);
      padding-top: 10px;
      font-size: 8.5pt;
      color: var(--color-text-subtle);
    }
    .toc-page {
      page-break-after: always;
      break-after: page;
    }
    .toc-heading {
      font-size: 17pt;
      color: var(--color-primary);
      border-bottom: 2px solid var(--color-primary);
      padding-bottom: 6px;
      margin: 0 0 12px 0;
    }
    .toc-module {
      margin-bottom: 11px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .toc-mod-title {
      background: var(--color-primary-soft);
      border-left: 4px solid var(--color-primary);
      padding: 4px 8px;
      font-weight: 700;
      font-size: 9.8pt;
      color: var(--color-heading);
      margin-bottom: 4px;
    }
    .toc-doc-list, .toc-sec-list {
      list-style: none;
      margin: 0;
      padding-left: 12px;
    }
    .toc-doc { margin: 3px 0; }
    .toc-doc-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
      font-size: 8.9pt;
    }
    .toc-path {
      font-family: Consolas, monospace;
      font-size: 7.2pt;
      color: var(--color-text-subtle);
      white-space: nowrap;
    }
    .toc-sec-list {
      padding-left: 14px;
      margin-top: 1px;
      margin-bottom: 4px;
    }
    .toc-sec {
      font-size: 8pt;
      color: var(--color-text-muted);
      line-height: 1.32;
    }
    .toc-num {
      color: var(--color-primary);
      font-weight: 600;
    }
    .module-cover {
      page-break-before: always;
      break-before: page;
      background: var(--color-primary);
      color: var(--color-on-primary);
      padding: 16px 18px;
      border-radius: 6px;
      margin-bottom: 14px;
    }
    .module-kicker {
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--color-primary-accent);
      font-weight: 700;
    }
    .module-title {
      font-size: 17pt;
      margin: 4px 0 6px 0;
      color: var(--color-on-primary);
    }
    .module-subtitle {
      font-size: 9.5pt;
      color: var(--color-primary-light);
      margin: 0 0 8px 0;
    }
    .module-count {
      font-size: 8pt;
      color: var(--color-primary-accent);
      font-weight: 600;
    }
    .doc-article {
      margin-bottom: 18px;
    }
    .doc-article + .doc-article {
      page-break-before: always;
      break-before: page;
    }
    .doc-meta-bar {
      display: flex;
      justify-content: space-between;
      font-size: 7.6pt;
      color: var(--color-text-muted);
      background: var(--color-surface-alt);
      padding: 4px 8px;
      border-radius: 3px;
      margin-bottom: 8px;
    }
    .doc-file-tag {
      font-family: Consolas, monospace;
      color: var(--color-primary);
    }
    h2.doc-title {
      font-size: 14.5pt;
      color: var(--color-heading);
      border-bottom: 2px solid var(--color-border);
      padding-bottom: 4px;
      margin: 6px 0 10px 0;
      page-break-after: avoid;
      break-after: avoid;
    }
    h3.doc-h2 {
      font-size: 11.4pt;
      color: var(--color-primary);
      margin: 14px 0 6px 0;
      page-break-after: avoid;
      break-after: avoid;
    }
    h4.doc-h3 {
      font-size: 10pt;
      color: var(--color-text);
      margin: 10px 0 4px 0;
      page-break-after: avoid;
      break-after: avoid;
    }
    .sec-num {
      color: var(--color-primary);
      font-weight: 700;
    }
    p { margin: 5px 0 7px 0; }
    ul, ol { margin: 4px 0 8px 0; padding-left: 18px; }
    li { margin: 2px 0; }
    hr.section-divider {
      border: 0;
      border-top: 1px solid var(--color-border-light);
      margin: 12px 0;
    }
    .table-wrap {
      width: 100%;
      margin: 8px 0 12px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
      font-size: 8.1pt;
      page-break-inside: auto;
    }
    thead { display: table-header-group; }
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th {
      background: var(--color-primary);
      color: var(--color-on-primary);
      font-weight: 600;
      padding: 5px 6px;
      border: 1px solid var(--color-primary);
      overflow-wrap: anywhere;
    }
    td {
      padding: 4px 6px;
      border: 1px solid var(--color-border);
      vertical-align: top;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    tbody tr:nth-child(even) { background: var(--color-surface); }
    .callout {
      margin: 8px 0 10px 0;
      padding: 7px 10px;
      border-left: 4px solid var(--color-callout-info-border);
      background: var(--color-callout-info-bg);
      border-radius: 0 4px 4px 0;
      font-size: 8.8pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .callout-warn {
      border-left-color: var(--color-callout-warn-border);
      background: var(--color-callout-warn-bg);
    }
    .file-ref {
      font-family: Consolas, monospace;
      font-size: 8.2pt;
      color: var(--color-primary);
    }
    .link-url {
      font-size: 7.5pt;
      color: var(--color-text-subtle);
    }
  `;
}

function buildCoverPageHtml(cover, vars, fallbackTitle) {
  const safeCover = cover || DEFAULT_PDF_CONFIG.cover;
  const coverBadge = interpolateTemplate(safeCover.badge, vars).trim();
  const coverTitle = interpolateTemplate(safeCover.title, vars).trim() || fallbackTitle || DEFAULT_PDF_CONFIG.cover.title;
  const coverHighlight = interpolateTemplate(safeCover.titleHighlight, vars).trim();
  const coverSubtitle = interpolateTemplate(safeCover.subtitle, vars).trim();
  const coverCardTitle = interpolateTemplate(safeCover.cardTitle, vars).trim();
  const coverCardDesc = interpolateTemplate(safeCover.cardDescription, vars).trim();
  const coverFooter = interpolateTemplate(safeCover.footer, vars).trim();

  const coverLogos = safeCover.logos || DEFAULT_PDF_CONFIG.cover.logos;
  const coverLeftLogoHtml = renderLogoImg(coverLogos.left);
  const coverRightLogoHtml = renderLogoImg(coverLogos.right);
  const coverLogosHtml = coverLeftLogoHtml || coverRightLogoHtml
    ? `<div class="cover-logos-bar">
        <div class="cover-logo-slot left">${coverLeftLogoHtml}</div>
        <div class="cover-logo-slot right">${coverRightLogoHtml}</div>
      </div>`
    : '';

  const coverMetadataRows = (Array.isArray(safeCover.metadata) ? safeCover.metadata : [])
    .map((item) => ({
      label: interpolateTemplate(item.label, vars).trim(),
      value: interpolateTemplate(item.value, vars).trim()
    }))
    .filter((item) => item.label || item.value);

  const pageTitle = coverHighlight ? `${coverTitle} — ${coverHighlight}` : coverTitle;
  const coverTitleHtml = coverHighlight
    ? `${escapeHtml(coverTitle)}<br><code>${escapeHtml(coverHighlight)}</code>`
    : escapeHtml(coverTitle);

  const coverMetaTableHtml = coverMetadataRows.length
    ? `<table class="cover-meta-grid">
          ${coverMetadataRows
            .map((row) => `<tr><td><strong>${escapeHtml(row.label)}</strong></td><td>${renderInline(row.value)}</td></tr>`)
            .join('\n          ')}
        </table>`
    : '';

  const hasCoverCard = Boolean(coverCardTitle || coverCardDesc || coverMetadataRows.length > 0);
  const coverCardHtml = hasCoverCard
    ? `<div class="cover-card">
        ${coverCardTitle ? `<strong>${escapeHtml(coverCardTitle)}</strong>` : ''}
        ${coverCardDesc ? ` ${renderInline(coverCardDesc)}` : ''}
        ${coverMetaTableHtml}
      </div>`
    : '';

  const coverHtml = `
  <div class="cover-page">
    <div>
      ${coverLogosHtml}
      ${coverBadge ? `<span class="cover-badge">${escapeHtml(coverBadge)}</span>` : ''}
      <h1 class="cover-title">${coverTitleHtml}</h1>
      ${coverSubtitle ? `<p class="cover-subtitle">${renderInline(coverSubtitle)}</p>` : ''}
      ${coverCardHtml}
    </div>
    ${coverFooter ? `<div class="cover-footer">${renderInline(coverFooter)}</div>` : ''}
  </div>`;

  return { pageTitle, coverHtml };
}

function wrapFullHtmlDocument({ pageTitle, palette, coverHtml, tocHeading, tocSubtitle, tocHtml, mainHtml }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(pageTitle)}</title>
  <style>${buildPdfStylesCss(palette)}</style>
</head>
<body>
  ${coverHtml}

  <div class="toc-page">
    <h1 class="toc-heading">${escapeHtml(tocHeading || 'Índice General de Documentación')}</h1>
    <p style="font-size:8.6pt;color:var(--color-text-muted);margin-bottom:10px;">
      ${escapeHtml(tocSubtitle || 'Haga clic sobre cualquier capítulo o sección para navegar directamente al apartado correspondiente dentro del PDF.')}
    </p>
    ${tocHtml}
  </div>

  <main>
    ${mainHtml}
  </main>
</body>
</html>`;
}

function buildFullHtmlDocument(modules, generatedAt, pdfConfig = DEFAULT_PDF_CONFIG) {
  const vars = buildTemplateVars(modules, generatedAt);
  const cover = pdfConfig.cover || DEFAULT_PDF_CONFIG.cover;
  const palette = pdfConfig.palette || DEFAULT_PDF_CONFIG.palette;
  const { pageTitle, coverHtml } = buildCoverPageHtml(cover, vars, DEFAULT_PDF_CONFIG.cover.title);

  const tocModulesHtml = modules
    .map((mod) => {
      const docsHtml = mod.documents
        .map((doc) => {
          const secs = doc.headings
            .filter((h) => h.level === 2)
            .map(
              (h) =>
                `<li class="toc-sec"><a href="#${escapeHtml(h.anchorId)}"><span class="toc-num">${escapeHtml(h.displayNumber)}</span> ${escapeHtml(h.text)}</a></li>`
            )
            .join('');
          return `
            <li class="toc-doc">
              <div class="toc-doc-row">
                <a href="#${escapeHtml(doc.anchorId)}"><strong>${escapeHtml(doc.docNumber)}. ${escapeHtml(doc.title)}</strong></a>
                <span class="toc-path">${escapeHtml(doc.relativePath)}</span>
              </div>
              ${secs ? `<ul class="toc-sec-list">${secs}</ul>` : ''}
            </li>
          `;
        })
        .join('');

      return `
        <div class="toc-module">
          <div class="toc-mod-title"><a href="#${escapeHtml(mod.anchorId)}">${escapeHtml(mod.roman)} — ${escapeHtml(mod.title)}</a></div>
          <ul class="toc-doc-list">${docsHtml}</ul>
        </div>
      `;
    })
    .join('');

  const bodyModulesHtml = modules
    .map((mod) => {
      const docsHtml = mod.documents
        .map(
          (doc) => `
          <article class="doc-article" id="${escapeHtml(doc.anchorId)}-wrap">
            <div class="doc-meta-bar">
              <span>${escapeHtml(mod.roman)} · Capítulo ${escapeHtml(doc.docNumber)}</span>
              <span class="doc-file-tag">${escapeHtml(doc.relativePath)}</span>
            </div>
            ${renderMarkdownDocumentToHtml(doc)}
          </article>
        `
        )
        .join('\n');

      return `
        <section class="module-section">
          <div class="module-cover" id="${escapeHtml(mod.anchorId)}">
            <div class="module-kicker">${escapeHtml(mod.roman)}</div>
            <h1 class="module-title">${escapeHtml(mod.title)}</h1>
            <p class="module-subtitle">${escapeHtml(mod.subtitle)}</p>
            <div class="module-count">${mod.documents.length} documento(s) incluidos en este módulo</div>
          </div>
          ${docsHtml}
        </section>
      `;
    })
    .join('\n');

  return wrapFullHtmlDocument({
    pageTitle,
    palette,
    coverHtml,
    tocHeading: 'Índice General de Documentación',
    tocSubtitle: 'Haga clic sobre cualquier módulo, capítulo o sección para navegar directamente al apartado correspondiente dentro del PDF.',
    tocHtml: tocModulesHtml,
    mainHtml: bodyModulesHtml
  });
}

function buildStandaloneManualHtml(manualCfg, doc, vars, palette) {
  const { pageTitle, coverHtml } = buildCoverPageHtml(manualCfg.cover, vars, doc.title);

  const tocChapters = [];
  let currentChapter = null;
  doc.headings.forEach((h) => {
    if (h.level === 2) {
      currentChapter = { heading: h, sections: [] };
      tocChapters.push(currentChapter);
    } else if (h.level === 3 && currentChapter) {
      currentChapter.sections.push(h);
    } else if (h.level === 3) {
      tocChapters.push({ heading: h, sections: [] });
    }
  });

  const tocHtml = tocChapters
    .map((chapter) => {
      const subHtml = chapter.sections
        .map((s) => `<li class="toc-sec"><a href="#${escapeHtml(s.anchorId)}">${escapeHtml(s.text)}</a></li>`)
        .join('');
      return `
        <div class="toc-module">
          <div class="toc-mod-title"><a href="#${escapeHtml(chapter.heading.anchorId)}">${escapeHtml(chapter.heading.text)}</a></div>
          ${subHtml ? `<ul class="toc-sec-list">${subHtml}</ul>` : ''}
        </div>
      `;
    })
    .join('');

  const leftTag = interpolateTemplate(manualCfg.cover.badge, vars).trim() || 'Centro Tecnológico del Mueble · CTM';
  const mainHtml = `
    <article class="doc-article" id="${escapeHtml(doc.anchorId)}-wrap">
      <div class="doc-meta-bar">
        <span>${escapeHtml(leftTag)}</span>
        <span class="doc-file-tag">${escapeHtml(doc.relativePath)}</span>
      </div>
      ${renderMarkdownDocumentToHtml(doc)}
    </article>
  `;

  return {
    html: wrapFullHtmlDocument({
      pageTitle,
      palette,
      coverHtml,
      tocHeading: 'Índice General',
      tocSubtitle: 'Haga clic sobre cualquier capítulo o apartado para navegar directamente a su contenido dentro del PDF.',
      tocHtml,
      mainHtml
    }),
    chaptersCount: doc.headings.filter((h) => h.level === 2).length,
    sectionsCount: doc.headings.filter((h) => h.level === 3).length
  };
}

async function fetchMermaidScript() {
  const response = await axios.get(MERMAID_CDN_URL, {
    responseType: 'text',
    timeout: 30000,
    maxContentLength: 10 * 1024 * 1024
  });
  if (!response?.data || typeof response.data !== 'string') {
    throw new Error('No se pudo descargar el script de Mermaid JS.');
  }
  return response.data;
}

async function renderSinglePageToPdf(browser, mermaidScript, job, palette) {
  const { htmlContent, outputPath, headerFooter = DEFAULT_PDF_CONFIG.headerFooter, templateVars = {} } = job;
  const mermaidTheme = palette.mermaidTheme || 'neutral';
  const hfColor = palette.textSubtle || '#64748b';

  const headerLeft = escapeHtml(interpolateTemplate(headerFooter.headerLeft, templateVars));
  const headerRight = escapeHtml(interpolateTemplate(headerFooter.headerRight, templateVars));
  const headerLogos = headerFooter.logos || DEFAULT_PDF_CONFIG.headerFooter.logos;
  const headerLeftLogoHtml = renderLogoImg(headerLogos.left, 'max-width:95px;');
  const headerRightLogoHtml = renderLogoImg(headerLogos.right, 'max-width:95px;');
  const footerLeft = escapeHtml(interpolateTemplate(headerFooter.footerLeft, templateVars));
  const footerRight = headerFooter.showPageNumbers !== false
    ? '<span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>'
    : '<span></span>';

  const page = await browser.newPage();
  page.setDefaultTimeout(PDF_RENDER_TIMEOUT_MS);
  page.setDefaultNavigationTimeout(PDF_RENDER_TIMEOUT_MS);

  try {
    // Bloquea cualquier petición de red externa o file:// saliente (prevención SSRF / LFI)
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      if (url.startsWith('data:') || url.startsWith('about:') || url.startsWith('blob:')) {
        request.continue().catch(() => {});
      } else {
        request.abort('blockedbyclient').catch(() => {});
      }
    });

    await page.setContent(htmlContent, {
      waitUntil: 'domcontentloaded',
      timeout: PDF_RENDER_TIMEOUT_MS
    });

    let mermaidStats = { total: 0, rendered: 0 };
    if (mermaidScript && htmlContent.includes('<pre class="mermaid"')) {
      await page.addScriptTag({ content: mermaidScript });
      const evalResult = await page.evaluate(async (themeName) => {
        if (!window.mermaid) {
          throw new Error('window.mermaid no disponible tras inyectar script');
        }
        window.mermaid.initialize({
          startOnLoad: false,
          theme: themeName || 'neutral',
          securityLevel: 'loose',
          flowchart: { useMaxWidth: true, htmlLabels: true }
        });

        const nodes = Array.from(document.querySelectorAll('.mermaid'));
        const parseErrors = [];
        for (let idx = 0; idx < nodes.length; idx += 1) {
          const el = nodes[idx];
          const source = el.textContent || '';
          const docRef = el.getAttribute('data-doc') || `diagram-${idx}`;
          try {
            await window.mermaid.parse(source);
          } catch (err) {
            parseErrors.push({
              index: idx,
              doc: docRef,
              error: err?.message || String(err),
              preview: source.slice(0, 140)
            });
          }
        }

        if (parseErrors.length > 0) {
          return { total: nodes.length, rendered: 0, failures: parseErrors };
        }

        await window.mermaid.run({ querySelector: '.mermaid' });

        const missingSvg = [];
        let renderedCount = 0;
        nodes.forEach((el, idx) => {
          const svg = el.querySelector('svg');
          const txt = el.textContent || '';
          if (!svg || /Syntax error/i.test(txt)) {
            missingSvg.push({
              index: idx,
              doc: el.getAttribute('data-doc') || `diagram-${idx}`,
              error: svg ? 'Syntax error en SVG' : 'No generó elemento SVG',
              preview: txt.slice(0, 140)
            });
          } else {
            renderedCount += 1;
          }
        });

        return { total: nodes.length, rendered: renderedCount, failures: missingSvg };
      }, mermaidTheme);

      if (evalResult.failures && evalResult.failures.length > 0) {
        throw new Error(`Error compilando diagramas Mermaid:\n${JSON.stringify(evalResult.failures, null, 2)}`);
      }
      mermaidStats = { total: evalResult.total, rendered: evalResult.rendered };
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      margin: { top: '22mm', bottom: '18mm', left: '14mm', right: '14mm' },
      headerTemplate:
        `<div style="box-sizing:border-box;font-family:Segoe UI,Arial,sans-serif;font-size:7pt;color:${hfColor};width:100%;padding:0 14mm 3px 14mm;border-bottom:1px solid ${palette.borderLight};display:flex;justify-content:space-between;align-items:center;gap:10px;"><div style="display:flex;align-items:center;gap:8px;min-width:0;">${headerLeftLogoHtml}<span>${headerLeft}</span></div><div style="display:flex;align-items:center;gap:8px;justify-content:flex-end;min-width:0;text-align:right;"><span>${headerRight}</span>${headerRightLogoHtml}</div></div>`,
      footerTemplate:
        `<div style="box-sizing:border-box;font-family:Segoe UI,Arial,sans-serif;font-size:7pt;color:${hfColor};width:100%;padding:0 14mm;display:flex;justify-content:space-between;align-items:center;"><span>${footerLeft}</span>${footerRight}</div>`
    });

    return mermaidStats;
  } finally {
    await page.close().catch(() => {});
  }
}

async function renderBatchHtmlToPdf(jobs, palette = DEFAULT_PDF_CONFIG.palette) {
  let browser = null;
  const anyMermaid = jobs.some((job) => job.htmlContent.includes('<pre class="mermaid"'));
  const mermaidScript = anyMermaid ? await fetchMermaidScript() : null;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const results = [];
    for (const job of jobs) {
      const mermaidStats = await renderSinglePageToPdf(browser, mermaidScript, job, palette);
      const pdfStats = fs.statSync(job.outputPath);
      results.push({
        key: job.key,
        source: job.source || null,
        outputPdf: path.relative(ROOT_DIR, job.outputPath),
        pdfBytes: pdfStats.size,
        mermaidDiagrams: mermaidStats
      });
    }
    return results;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

async function renderHtmlToPdf(htmlContent, outputPath, pdfConfig = DEFAULT_PDF_CONFIG, templateVars = {}) {
  const [res] = await renderBatchHtmlToPdf(
    [
      {
        key: 'single',
        htmlContent,
        outputPath,
        headerFooter: pdfConfig.headerFooter || DEFAULT_PDF_CONFIG.headerFooter,
        templateVars
      }
    ],
    pdfConfig.palette || DEFAULT_PDF_CONFIG.palette
  );
  return res.mermaidDiagrams;
}

async function main() {
  const generatedAt = new Date();
  const pdfConfig = loadPdfConfig();
  const modules = discoverModuleDocuments();
  const totalDocs = modules.reduce((acc, m) => acc + m.documents.length, 0);

  if (totalDocs === 0) {
    throw new Error(`No se encontraron documentos Markdown en ${DOCS_DIR}`);
  }

  const baseVars = buildTemplateVars(modules, generatedAt);
  const consolidatedMd = buildConsolidatedMarkdown(modules, generatedAt, pdfConfig);
  fs.writeFileSync(OUTPUT_MD_PATH, consolidatedMd, 'utf8');

  const consolidatedHtml = buildFullHtmlDocument(modules, generatedAt, pdfConfig);
  const pdfJobs = [
    {
      key: 'consolidated',
      htmlContent: consolidatedHtml,
      outputPath: OUTPUT_PDF_PATH,
      headerFooter: pdfConfig.headerFooter,
      templateVars: baseVars
    }
  ];

  const standaloneManualsList = Array.isArray(pdfConfig.standaloneManuals) ? pdfConfig.standaloneManuals : [];
  standaloneManualsList.forEach((manualCfg, idx) => {
    if (!manualCfg.enabled) return;
    const sourceFullPath = path.resolve(ROOT_DIR, manualCfg.sourcePath);
    if (!fs.existsSync(sourceFullPath)) {
      throw new Error(`No se encontró el archivo fuente del manual "${manualCfg.key}": ${manualCfg.sourcePath}`);
    }
    const outputFullPath = path.resolve(ROOT_DIR, manualCfg.outputPdfPath);
    const relativeSource = path.relative(ROOT_DIR, sourceFullPath).replace(/\\/g, '/');
    const rawContent = fs.readFileSync(sourceFullPath, 'utf8').replace(/\r\n/g, '\n');
    const parsed = analyzeDocumentHeadings(rawContent, `manual-${idx + 1}`, 1, path.basename(sourceFullPath), {
      omitDisplayNumbers: true
    });

    const doc = {
      fileName: path.basename(sourceFullPath),
      relativePath: relativeSource,
      docNumber: '1',
      anchorId: parsed.docAnchorId,
      title: parsed.title,
      rawContent,
      headings: parsed.headings,
      headingMapByLine: parsed.headingMapByLine
    };

    const chaptersCount = doc.headings.filter((h) => h.level === 2).length;
    const sectionsCount = doc.headings.filter((h) => h.level === 3).length;
    const manualVars = {
      ...baseVars,
      chaptersCount: String(chaptersCount),
      sectionsCount: String(sectionsCount),
      sourcePath: relativeSource
    };

    const built = buildStandaloneManualHtml(manualCfg, doc, manualVars, pdfConfig.palette);
    pdfJobs.push({
      key: manualCfg.key,
      source: relativeSource,
      htmlContent: built.html,
      outputPath: outputFullPath,
      headerFooter: manualCfg.headerFooter,
      templateVars: manualVars
    });
  });

  const renderResults = await renderBatchHtmlToPdf(pdfJobs, pdfConfig.palette);
  const consolidatedResult = renderResults[0];
  const standaloneResults = renderResults.slice(1);
  const mdStats = fs.statSync(OUTPUT_MD_PATH);

  console.log(
    JSON.stringify(
      {
        status: 'ok',
        configSource: pdfConfig.configSource,
        modulesProcessed: modules.length,
        documentsProcessed: totalDocs,
        mermaidDiagrams: consolidatedResult.mermaidDiagrams,
        consolidatedMarkdown: path.relative(ROOT_DIR, OUTPUT_MD_PATH),
        markdownBytes: mdStats.size,
        consolidatedPdf: consolidatedResult.outputPdf,
        pdfBytes: consolidatedResult.pdfBytes,
        standaloneManuals: standaloneResults
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error('[build-docs-pdf] Error:', err);
  process.exit(1);
});
