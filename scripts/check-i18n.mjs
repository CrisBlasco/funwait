#!/usr/bin/env node
// Puerta de calidad de los textos de la interfaz: una key que falta se vería en
// pantalla como "mimica.rules.title", y solo lo notaría quien juega.
// Falla con código != 0 para cortar el deploy en CI.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
const DICT = "js/i18n/es.js";

// Texto de marca del logo: no se traduce.
const NO_TRADUCIBLE = new Set(["Fun", "Wait"]);

const errors = [];

function allFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...allFiles(p));
    else out.push(p);
  }
  return out;
}

const files = allFiles(PUBLIC);
const pages = files.filter((f) => f.endsWith(".html"));
const scripts = files.filter((f) => f.endsWith(".js") && !f.endsWith(DICT) && !f.endsWith("sw.js"));
const relOf = (f) => f.slice(PUBLIC.length + 1);

// 1) El diccionario se evalúa tal cual lo cargará el navegador.
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(join(PUBLIC, DICT), "utf8"), sandbox);
const dict = sandbox.window.FW_I18N;

const usedPlain = new Set();
const usedHtml = new Set();
const usedPlural = new Set();

for (const file of pages) {
  const rel = relOf(file);
  const html = readFileSync(file, "utf8");

  // 2) Keys usadas desde el HTML.
  for (const [, attr, key] of html.matchAll(/data-i18n(-html|-aria-label)?="([^"]+)"/g)) {
    (attr === "-html" ? usedHtml : usedPlain).add(key);
    if (!(key in dict)) errors.push(`${rel}: key inexistente → "${key}"`);
  }

  // 3) El diccionario debe cargarse antes que funwait.js.
  const iDict = html.indexOf(`src="./${DICT}"`);
  const iFw = html.indexOf('src="./js/funwait.js"');
  if (iDict === -1 || iDict > iFw) errors.push(`${rel}: ${DICT} debe cargarse antes que js/funwait.js`);

  // 4) Sin texto suelto ni atributos accesibles sin key. <title> se deja literal
  //    (lo leen buscadores y previsualizaciones, que no ejecutan JS).
  const body = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|title)\b[\s\S]*?<\/\1>/gi, "<$1></$1>");
  for (const m of body.matchAll(/<(\/?[a-z][^<>]*)>([^<>]*)(?=<)/gi)) {
    const texto = m[2].trim();
    if (!/\p{L}/u.test(texto) || NO_TRADUCIBLE.has(texto)) continue;
    if (!/\bdata-i18n(-html)?=/.test(m[1])) errors.push(`${rel}: texto sin key → "${texto}"`);
  }
  for (const m of body.matchAll(/<[^<>]*\baria-label="[^"]*"[^<>]*>/g)) {
    if (!/data-i18n-aria-label=/.test(m[0])) errors.push(`${rel}: aria-label sin key → ${m[0]}`);
  }
}

// 5) Keys usadas desde el JS (de las páginas y de los scripts).
for (const file of [...pages, ...scripts]) {
  const rel = relOf(file);
  const src = readFileSync(file, "utf8");
  for (const [, fn, key] of src.matchAll(/\b(tn?)\('([^']+)'/g)) {
    (fn === "tn" ? usedPlural : usedPlain).add(key);
    if (!(key in dict)) errors.push(`${rel}: key inexistente → "${key}"`);
  }
  // Excepciones: la propia definición de t/tn y applyI18n, que lee la key del atributo.
  const sinApi = src.replace(/function tn?\(/g, "").replace(/\btn?\(key/g, "").replace(/\bt\(e\.dataset\./g, "");
  if (/\btn?\((?!')/.test(sinApi)) {
    errors.push(`${rel}: t()/tn() con una key que no es literal; no se puede comprobar`);
  }
}

// 6) El diccionario, según cómo se use cada key.
const vars = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join();
for (const [key, value] of Object.entries(dict)) {
  if (!usedPlain.has(key) && !usedHtml.has(key) && !usedPlural.has(key)) {
    errors.push(`${DICT}: key sin usar → "${key}"`);
  }
  if (usedPlural.has(key)) {
    if (typeof value !== "object" || !value.one || !value.other) {
      errors.push(`${DICT}: "${key}" se usa con tn() y necesita { one, other }`);
    } else if (vars(value.one) !== vars(value.other)) {
      errors.push(`${DICT}: "${key}": one y other usan variables distintas`);
    }
    continue;
  }
  if (typeof value !== "string" || !value.trim()) {
    errors.push(`${DICT}: "${key}" debe ser un texto no vacío`);
    continue;
  }
  const tags = value.match(/<[^>]*>/g) || [];
  if (tags.length && !usedHtml.has(key)) errors.push(`${DICT}: "${key}" lleva HTML sin usarse con data-i18n-html`);
  for (const tag of tags) {
    if (!/^<\/?(b|br)>$/.test(tag)) errors.push(`${DICT}: "${key}" usa una etiqueta no permitida → ${tag}`);
  }
}

if (errors.length) {
  console.error("❌ Puerta de calidad (i18n) FALLÓ:");
  for (const e of errors) console.error("   • " + e);
  process.exit(1);
}

console.log(`✅ i18n OK: ${Object.keys(dict).length} keys, todas existentes y en uso.`);
