/**
 * Script para sincronizar las plantillas HTML y recursos estáticos
 * dentro de src/infrastructure/templates/embeddedTemplates.js
 *
 * Ejecutar con: npm run build:templates
 */
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'src', 'infrastructure', 'templates');
const essaysFormsDir = path.join(baseDir, 'essays_forms');

function syncTemplates() {
  const templates = {};

  const files = ['fpc131.html', 'fpc132.html', 'fpc151.html', 'fpc161.html'];
  for (const file of files) {
    const filePath = path.join(essaysFormsDir, file);
    if (fs.existsSync(filePath)) {
      templates[`essays_forms/${file}`] = fs.readFileSync(filePath, 'utf8');
    }
  }

  const ctmPath = path.join(essaysFormsDir, 'static', 'ctm.jpg');
  if (fs.existsSync(ctmPath)) {
    const ctmBuffer = fs.readFileSync(ctmPath);
    templates.headerImageBase64 = `data:image/jpeg;base64,${ctmBuffer.toString('base64')}`;
  }

  const outPath = path.join(baseDir, 'embeddedTemplates.js');
  const fileContent = `/**
 * Archivo auto-generado por scripts/sync-templates.js.
 * NO EDITAR MANUALMENTE ESTE ARCHIVO.
 * Edita directamente los archivos .html en src/infrastructure/templates/essays_forms/
 * y ejecuta: npm run build:templates
 */
module.exports = ${JSON.stringify(templates, null, 2)};
`;

  fs.writeFileSync(outPath, fileContent, 'utf8');
  console.log(`[sync-templates] Sincronizadas ${Object.keys(templates).length - 1} plantillas en embeddedTemplates.js`);
}

syncTemplates();
