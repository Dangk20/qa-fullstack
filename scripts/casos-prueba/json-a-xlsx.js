#!/usr/bin/env node
/**
 * json-a-xlsx.js — Convierte un JSON de casos (array) a un .xlsx POR MÓDULO con el
 * modelo final de 7 columnas en bloque (skill `casos-de-prueba`), sin pasar por CSV.
 *
 * Columnas: Casos de prueba ID | Nombre del escenario | Paso a paso |
 *           Resultado esperado | HU relacionada | Funcionalidad | Propósito
 *
 * Un .xlsx consolidado por módulo (ej. `Casos de Prueba/<Módulo>/<Módulo>-Casos-Consolidado.xlsx`).
 * Todas las funcionalidades del módulo se concentran en ese único archivo (la columna
 * Funcionalidad indica a cuál pertenece cada caso, y luego mapea a una Suite en Cubofish).
 *
 * Por defecto AÑADE: si el .xlsx ya existe, agrega los casos nuevos al final
 * (de-duplicando por "Casos de prueba ID"), en vez de sobreescribir.
 *
 * Uso:  node scripts/casos-prueba/json-a-xlsx.js <in.json> <out.xlsx> [--overwrite]
 *   --overwrite  reemplaza el archivo en vez de añadir.
 * Crea las carpetas del <out.xlsx> si no existen.
 *
 * Forma esperada de cada caso:
 * { id, funcionalidad, nombre, proposito, hus:[...], preconditions, ruta,
 *   ruta_expected, steps:[{action, expected}] }
 */
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const NCOLS = 7;
const HEADERS = [
  'Casos de prueba ID', 'Nombre del escenario', 'Paso a paso', 'Resultado esperado',
  'HU relacionada', 'Funcionalidad', 'Propósito',
];

// Un caso → sus filas (bloque), sin cabecera de columnas. Termina con fila en blanco.
function caseToBlock(c) {
  const rows = [];
  const hus = (c.hus || []).join(' ; ');
  rows.push([c.id || '', c.nombre || '', '', '', hus, c.funcionalidad || '', c.proposito || '']);
  if (c.preconditions) rows.push(['', '', '[PRECONDICIÓN] ' + c.preconditions, '', '', '', '']);
  if (c.ruta) rows.push(['', '', '(Ruta) ' + c.ruta, c.ruta_expected || '', '', '', '']);
  for (const s of (c.steps || [])) rows.push(['', '', s.action || '', s.expected || '', '', '', '']);
  rows.push(['', '', '', '', '', '', '']); // separador
  return rows;
}

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

async function readExistingRows(outPath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(outPath);
  const ws = wb.worksheets[0];
  const rows = [];
  if (ws) {
    ws.eachRow({ includeEmpty: true }, (er) => {
      const r = [];
      for (let c = 1; c <= NCOLS; c++) r.push(cellText(er.getCell(c).value));
      rows.push(r);
    });
  }
  while (rows.length && rows[rows.length - 1].every((c) => !String(c).trim())) rows.pop();
  return rows;
}

function idsFromRows(rows) {
  const ids = new Set();
  rows.forEach((r, i) => { if (i === 0) return; const id = (r[0] || '').trim(); if (id) ids.add(id); });
  return ids;
}

async function main() {
  const inPath = process.argv[2];
  const outPath = process.argv[3];
  const overwrite = process.argv.includes('--overwrite');
  if (!inPath || !outPath) {
    console.error('Uso: node scripts/casos-prueba/json-a-xlsx.js <in.json> <out.xlsx> [--overwrite]');
    process.exit(1);
  }
  let raw = fs.readFileSync(inPath, 'utf8').trim();
  raw = raw.replace(/^```(json)?/i, '').replace(/```$/, '').trim(); // tolera fences
  const cases = JSON.parse(raw);

  let rows;
  let existingIds = new Set();
  let hadContent = false;
  if (!overwrite && fs.existsSync(outPath)) {
    rows = await readExistingRows(outPath);
    if (!rows.length) rows = [HEADERS.slice()];
    existingIds = idsFromRows(rows);
    hadContent = rows.length > 1;
  } else {
    rows = [HEADERS.slice()];
  }

  const newBlocks = [];
  let appended = 0, skipped = 0;
  for (const c of cases) {
    const id = (c.id || '').trim();
    if (id && existingIds.has(id)) { skipped++; continue; }
    if (id) existingIds.add(id);
    newBlocks.push(...caseToBlock(c));
    appended++;
  }
  if (newBlocks.length && hadContent) rows.push(new Array(NCOLS).fill('')); // separa de lo previo
  rows.push(...newBlocks);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Casos de prueba');
  ws.columns = [
    { width: 20 }, { width: 50 }, { width: 60 }, { width: 56 },
    { width: 38 }, { width: 32 }, { width: 22 },
  ];

  rows.forEach((r, idx) => {
    while (r.length < NCOLS) r.push('');
    const excelRow = ws.addRow(r.slice(0, NCOLS));
    excelRow.alignment = { vertical: 'top', wrapText: true };
    const isHeader = idx === 0;
    const isCaseHeader = !isHeader && String(r[0]).trim() !== '';
    if (isHeader) {
      excelRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      excelRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF305496' } };
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
      excelRow.height = 22;
    } else if (isCaseHeader) {
      excelRow.font = { bold: true };
      excelRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBF7' } };
      });
    }
  });

  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = { from: 'A1', to: 'G1' };

  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  await wb.xlsx.writeFile(outPath);
  const total = idsFromRows(rows).size;
  console.log(
    `xlsx: ${path.resolve(outPath)} · +${appended} caso(s)` +
    (skipped ? ` · ${skipped} omitido(s) (ID ya existía)` : '') +
    ` · ${total} caso(s) en el módulo`
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
