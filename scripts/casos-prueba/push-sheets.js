#!/usr/bin/env node
/**
 * push-sheets.js — Sube los casos de prueba (.xlsx de 7 columnas que produce la
 * skill `casos-de-prueba`) al Google Sheets central de la operación
 * ("Repo de casos de prueba - 384"), una pestaña por MÓDULO.
 *
 * - Si la pestaña del módulo NO existe, la crea con el encabezado de 7 columnas.
 * - Si YA existe, NO sobreescribe: AÑADE los casos nuevos al final, de-duplicando
 *   por "Casos de prueba ID" (los IDs ya presentes se omiten).
 * - Dry-run por defecto: sin --apply no escribe nada (solo muestra el plan).
 *
 * Auth: Service Account (igual que src/reporters/sync-sheets.js). La hoja debe estar
 * compartida como Editor con el email del SA. La llave JSON se toma de:
 *   GOOGLE_APPLICATION_CREDENTIALS  o  ~/.config/google-sheets-sa/credentials.json
 *
 * Uso:
 *   node scripts/casos-prueba/push-sheets.js                      # escanea "Casos de Prueba/" (dry-run)
 *   node scripts/casos-prueba/push-sheets.js --apply              # idem, y escribe
 *   node scripts/casos-prueba/push-sheets.js "Casos de Prueba/Clientes.xlsx" --apply
 *   node scripts/casos-prueba/push-sheets.js --modulo "Clientes" <archivo.xlsx> --apply
 *
 * Flags:
 *   <paths...>        Archivos .xlsx y/o carpetas a subir. Default: la carpeta "Casos de Prueba/".
 *   --modulo "<x>"    Forza el nombre de la pestaña (módulo) para los archivos dados.
 *   --sheet <id>      ID del spreadsheet destino (default: env CASOS_SHEETS_ID o el central).
 *   --sa <path>       Ruta al JSON del service account (default: env o ruta por defecto).
 *   --apply           Ejecuta la escritura. Sin este flag = dry-run.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const ExcelJS = require('exceljs');
const { google } = require('googleapis');

const DEFAULT_SHEET_ID = '18gT5WctBSWKmX23QVzKUO9xjgvNU2c1ZudTUozzc05Q'; // Repo de casos de prueba - 384
const CASOS_DIR = 'Casos de Prueba';
const NCOLS = 7;
const HEADERS = [
  'Casos de prueba ID', 'Nombre del escenario', 'Paso a paso', 'Resultado esperado',
  'HU relacionada', 'Funcionalidad', 'Propósito',
];

// ── args ──────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const a = { paths: [], apply: false };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const next = () => argv[++i];
    switch (k) {
      case '--apply': a.apply = true; break;
      case '--modulo': a.modulo = next(); break;
      case '--sheet': a.sheet = next(); break;
      case '--sa': a.sa = next(); break;
      default:
        if (k.startsWith('--')) throw new Error(`Flag desconocido: ${k}`);
        a.paths.push(k);
    }
  }
  return a;
}

// ── descubrir .xlsx ───────────────────────────────────────────────────────────
function collectXlsx(p, acc) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(p)) collectXlsx(path.join(p, e), acc);
  } else if (/\.xlsx$/i.test(p) && !path.basename(p).startsWith('~$')) {
    acc.push(p);
  }
  return acc;
}

// Módulo = pestaña. Si el archivo cuelga de "Casos de Prueba/<Módulo>/..." el módulo
// es esa carpeta; si está directo en "Casos de Prueba/<Módulo>.xlsx", es el nombre.
function moduleOf(file, forced) {
  if (forced) return forced;
  const abs = path.resolve(file);
  const parts = abs.split(path.sep);
  const i = parts.lastIndexOf(CASOS_DIR);
  if (i >= 0 && i < parts.length - 2) return parts[i + 1]; // carpeta de módulo
  return path.basename(file).replace(/\.xlsx$/i, '');
}

// ── leer xlsx → filas (7 col) ─────────────────────────────────────────────────
function cellText(v) {
  if (v == null) return '';
  if (typeof v === 'object') {
    if (Array.isArray(v.richText)) return v.richText.map((t) => t.text).join('');
    if ('text' in v) return String(v.text);
    if ('result' in v) return String(v.result);
    return String(v);
  }
  return String(v);
}
async function readXlsxRows(file) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  const ws = wb.worksheets[0];
  const rows = [];
  if (ws) ws.eachRow({ includeEmpty: true }, (er) => {
    const r = [];
    for (let c = 1; c <= NCOLS; c++) r.push(cellText(er.getCell(c).value));
    rows.push(r);
  });
  while (rows.length && rows[rows.length - 1].every((c) => !String(c).trim())) rows.pop();
  return rows;
}

// filas (con header en [0]) → bloques [{id, rows}]
function rowsToBlocks(rows) {
  const blocks = [];
  let cur = null;
  rows.forEach((r, idx) => {
    if (idx === 0) return; // header de columnas
    const id = (r[0] || '').trim();
    if (id) { if (cur) blocks.push(cur); cur = { id, rows: [r] }; }
    else if (cur) cur.rows.push(r);
  });
  if (cur) blocks.push(cur);
  // recorta filas vacías al final de cada bloque
  for (const b of blocks) while (b.rows.length && b.rows[b.rows.length - 1].every((c) => !String(c).trim())) b.rows.pop();
  return blocks;
}

function getSaPath(arg) {
  return arg || process.env.GOOGLE_APPLICATION_CREDENTIALS
    || path.join(os.homedir(), '.config', 'google-sheets-sa', 'credentials.json');
}

async function main() {
  const args = parseArgs(process.argv);
  const sheetId = args.sheet || process.env.CASOS_SHEETS_ID || DEFAULT_SHEET_ID;
  const saPath = getSaPath(args.sa);
  const DRY = !args.apply;
  const tag = DRY ? '[DRY-RUN]' : '[APPLY]';

  if (!fs.existsSync(saPath)) {
    console.error(`Service account no encontrado: ${saPath}`);
    console.error('Definí GOOGLE_APPLICATION_CREDENTIALS o copiá el JSON a la ruta por defecto (ver docs/PUSH-SHEETS-SETUP.md).');
    process.exit(1);
  }

  // archivos a procesar
  const inputs = args.paths.length ? args.paths : [CASOS_DIR];
  const files = [];
  for (const p of inputs) {
    if (!fs.existsSync(p)) { console.error(`No existe: ${p}`); process.exit(1); }
    collectXlsx(p, files);
  }
  if (!files.length) { console.error(`No se encontraron .xlsx (revisá "${CASOS_DIR}/").`); process.exit(1); }

  // agrupar por módulo (rdtqa: varios archivos → un módulo)
  const byModule = {};
  for (const f of files) {
    const m = moduleOf(f, args.modulo);
    (byModule[m] = byModule[m] || []).push(f);
  }

  const auth = new google.auth.GoogleAuth({ keyFile: saPath, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const sheets = google.sheets({ version: 'v4', auth });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const title = meta.data.properties.title;
  const existingTabs = new Set(meta.data.sheets.map((s) => s.properties.title));
  console.log(`${tag} Spreadsheet: "${title}" (${sheetId})`);
  console.log(`${tag} SA: ${saPath}`);

  let totalNew = 0, totalSkip = 0, tabsCreated = 0;

  for (const [modulo, modFiles] of Object.entries(byModule)) {
    // juntar bloques de todos los archivos del módulo, de-dup por ID dentro del módulo
    const blocks = [];
    const seen = new Set();
    for (const f of modFiles) {
      const bs = rowsToBlocks(await readXlsxRows(f));
      for (const b of bs) { if (b.id && !seen.has(b.id)) { seen.add(b.id); blocks.push(b); } }
    }

    const exists = existingTabs.has(modulo);
    let existingIds = new Set();
    let lastRow = 0;
    if (exists) {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `'${modulo}'!A:G` });
      const vals = res.data.values || [];
      lastRow = vals.length;
      vals.forEach((r, i) => { if (i === 0) return; const id = (r[0] || '').toString().trim(); if (id) existingIds.add(id); });
    }

    const fresh = blocks.filter((b) => !existingIds.has(b.id));
    const skipped = blocks.length - fresh.length;
    totalNew += fresh.length; totalSkip += skipped;

    const srcLabel = modFiles.map((f) => path.basename(f)).join(', ');
    console.log(`\n${tag} Módulo "${modulo}" ← ${srcLabel}`);
    console.log(`${tag}   pestaña: ${exists ? 'existe (se añade)' : 'NO existe (se crea)'} · ${fresh.length} caso(s) nuevo(s)` + (skipped ? ` · ${skipped} omitido(s) (ID ya en la hoja)` : ''));
    for (const b of fresh) console.log(`${tag}     + ${b.id}  ${(b.rows[0]?.[1] || '').slice(0, 70)}`);

    if (DRY || !fresh.length) continue;

    // construir filas a escribir (bloques separados por 1 fila en blanco)
    const dataRows = [];
    fresh.forEach((b, i) => { if (i) dataRows.push(['', '', '', '', '', '', '']); dataRows.push(...b.rows); });

    if (!exists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: modulo, gridProperties: { columnCount: NCOLS } } } }] },
      });
      tabsCreated++;
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId, range: `'${modulo}'!A1`, valueInputOption: 'USER_ENTERED',
        requestBody: { values: [HEADERS, ...dataRows] },
      });
    } else {
      const startRow = lastRow + 2; // deja una fila en blanco de separación
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId, range: `'${modulo}'!A${startRow}`, valueInputOption: 'USER_ENTERED',
        requestBody: { values: dataRows },
      });
    }
    console.log(`${tag}   escrito (${fresh.length} caso(s))`);
  }

  console.log(`\n${tag} Resumen: ${totalNew} caso(s) nuevo(s), ${totalSkip} omitido(s) por ID existente, ${tabsCreated} pestaña(s) creada(s).`);
  if (DRY) console.log('\n(DRY-RUN: no se escribió nada. Volvé a correr con --apply para subir.)');
}

main().catch((e) => { console.error('ERROR:', e.message || e); process.exit(1); });
