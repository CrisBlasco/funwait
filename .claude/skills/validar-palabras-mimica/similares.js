#!/usr/bin/env node
/*
 * Detecta palabras propuestas que se parecen demasiado a otras de la MISMA
 * lista (las ya existentes del tema) o entre sí (dentro del propio lote nuevo).
 *
 * Es la parte DETERMINISTA de la skill "validar-palabras-mimica": la similitud
 * se puede medir; la "mimeabilidad" la juzga el agente con la rúbrica del
 * SKILL.md.
 *
 * Uso:
 *   node similares.js --nuevas <archivo> [--tema <clave>] [--index <ruta>]
 *   node similares.js --nuevas <archivo> --existentes <archivo>
 *   node similares.js --nuevas <archivo> --tema deportes --umbral 0.8 --json
 *
 * --nuevas      Archivo con las palabras propuestas. Acepta .md (viñetas "- palabra")
 *               o texto plano (una palabra por línea; se ignoran líneas que empiezan por #).
 *   --tema      Clave del paquete (objetos, animales, deportes...). Si se da junto con
 *               --index, las palabras existentes se extraen del juego automáticamente.
 *   --index     Ruta al index.html del juego (por defecto: public/index.html).
 *   --existentes Alternativa a --tema/--index: archivo con las palabras ya existentes.
 *   --umbral    Umbral de parecido para marcar [0..1]. Por defecto 0.8.
 *   --json      Salida en JSON en vez de informe legible.
 */

const fs = require('fs');

// ---------- argumentos ----------
function getArg(name, def) {
  const i = process.argv.indexOf('--' + name);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return (v === undefined || v.startsWith('--')) ? true : v;
}
const archivoNuevas = getArg('nuevas');
const tema = getArg('tema');
const indexPath = getArg('index', 'public/index.html');
const archivoExistentes = getArg('existentes');
const UMBRAL = parseFloat(getArg('umbral', '0.8'));
const JSON_OUT = getArg('json', false) === true;

if (!archivoNuevas) {
  console.error('Falta --nuevas <archivo>. Ejecuta con --help para ver el uso.');
  process.exit(1);
}

// ---------- utilidades de texto ----------
const STOP = new Set(['de', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'con', 'al', 'a', 'en', 'y', 'o', 'del', 'por', 'para', 'su', 'se', 'lo']);

function norm(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
}
function tokens(s) {
  return norm(s).split(' ').filter(t => t && !STOP.has(t));
}
function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const c = a[i - 1] === b[j - 1] ? 0 : 1;
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
  }
  return d[m][n];
}
function ratio(a, b) {
  const max = Math.max(a.length, b.length) || 1;
  return 1 - lev(a, b) / max;
}
function jaccard(A, B) {
  const a = new Set(A), b = new Set(B);
  let inter = 0; for (const x of a) if (b.has(x)) inter++;
  const uni = new Set([...a, ...b]).size || 1;
  return inter / uni;
}

// Devuelve {score, motivo} del parecido entre dos palabras.
function comparar(p, e) {
  const pn = norm(p), en = norm(e);
  if (pn === en) return { score: 1, motivo: 'idéntica (ignorando acentos/mayúsculas)' };
  const pt = tokens(p), et = tokens(e);
  const r = ratio(pn, en);
  const jac = jaccard(pt, et);
  const compartida = pt.find(t => t.length >= 4 && et.includes(t));
  const contiene = pt.length && et.length && (pt.every(t => et.includes(t)) || et.every(t => pt.includes(t)));

  let score = r, motivo = `parecidas (${Math.round(r * 100)}%)`;
  if (contiene) { score = Math.max(score, 0.9); motivo = 'una contiene a la otra'; }
  else if (compartida) { score = Math.max(score, 0.85); motivo = `comparten la palabra «${compartida}»`; }
  else if (jac >= 0.6) { score = Math.max(score, 0.8); motivo = 'muchas palabras en común'; }
  return { score, motivo };
}

// ---------- lectura de palabras ----------
function leerNuevas(archivo, temaKey) {
  const txt = fs.readFileSync(archivo, 'utf8');
  if (archivo.endsWith('.md')) {
    let bloque = txt;
    if (temaKey) {
      // Parte el archivo en secciones "## ..." y coge la que empieza por la clave.
      const partes = txt.split(/^##\s+/m);
      const hit = partes.find(p => norm(p.split('\n')[0]).startsWith(norm(temaKey)));
      if (hit) bloque = hit;
    }
    return [...bloque.matchAll(/^\s*-\s+(.+?)\s*$/gm)].map(x => x[1].trim()).filter(Boolean);
  }
  return txt.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
}

function existentesDesdeIndex(ruta, temaKey) {
  const html = fs.readFileSync(ruta, 'utf8');
  const re = /(\w+):\s*\{\s*\n\s*nombre:\s*"([^"]+)",\s*emoji:\s*"[^"]*",\s*color:\s*"[^"]*",\s*\n\s*palabras:\s*(\[[\s\S]*?\])\s*\n\s*\}/g;
  let m;
  while ((m = re.exec(html))) if (m[1] === temaKey) return JSON.parse(m[3]);
  return [];
}

// ---------- ejecución ----------
const nuevas = leerNuevas(archivoNuevas, tema);
let existentes = [];
if (archivoExistentes) {
  existentes = fs.readFileSync(archivoExistentes, 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
} else if (tema && fs.existsSync(indexPath)) {
  existentes = existentesDesdeIndex(indexPath, tema);
}

const marcadas = [];
nuevas.forEach((p, i) => {
  let mejor = null;
  // contra las existentes de la misma lista
  for (const e of existentes) {
    const c = comparar(p, e);
    if (!mejor || c.score > mejor.score) mejor = { ...c, con: e, origen: 'existente' };
  }
  // contra las demás propuestas del lote
  nuevas.forEach((q, j) => {
    if (j === i) return;
    const c = comparar(p, q);
    if (!mejor || c.score > mejor.score) mejor = { ...c, con: q, origen: 'otra propuesta' };
  });
  if (mejor && mejor.score >= UMBRAL) {
    marcadas.push({ palabra: p, parecidaA: mejor.con, origen: mejor.origen, motivo: mejor.motivo, score: +mejor.score.toFixed(2) });
  }
});

if (JSON_OUT) {
  console.log(JSON.stringify({
    tema: tema || null,
    totalNuevas: nuevas.length,
    totalExistentes: existentes.length,
    umbral: UMBRAL,
    marcadas
  }, null, 2));
} else {
  console.log(`\nTema: ${tema || '(sin especificar)'}`);
  console.log(`Palabras nuevas: ${nuevas.length} · existentes comparadas: ${existentes.length} · umbral: ${UMBRAL}`);
  console.log(`\nDemasiado parecidas (a revisar): ${marcadas.length}`);
  if (marcadas.length === 0) {
    console.log('  ✓ ninguna supera el umbral de parecido');
  } else {
    marcadas.sort((a, b) => b.score - a.score);
    for (const m of marcadas) {
      console.log(`  ⚠️  "${m.palabra}"  ≈  "${m.parecidaA}" (${m.origen}) — ${m.motivo} [${m.score}]`);
    }
  }
  console.log('');
}
