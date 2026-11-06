#!/usr/bin/env node
// Genera la versión y la lista de ficheros de public/sw.js (npm run sw).
// El resultado se commitea: local, staging y producción llevan los mismos bytes,
// y solo cambia la versión si cambia algo de public/ (un README no reinstala).
// scripts/check-pwa.mjs falla si se ha olvidado ejecutar.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
export const SW_PATH = join(PUBLIC, "sw.js");

// El propio sw.js y _headers (que no se publica como asset) no se guardan en caché.
const EXCLUIDOS = new Set(["sw.js", "_headers"]);
const BLOQUE = /\/\/ <generado por npm run sw>[\s\S]*?\/\/ <\/generado>/;

// Sin ocultos: un .DS_Store local cambiaría la versión respecto a la de CI.
function allFiles(dir) {
  return readdirSync(dir).filter((name) => !name.startsWith(".")).sort().flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? allFiles(p) : [p];
  });
}

// URL canónica de cada fichero: Cloudflare redirige /x.html → /x e /index.html → /.
function urlDe(rel) {
  return "./" + rel.replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "");
}

export function generar(swActual) {
  const ficheros = allFiles(PUBLIC)
    .map((p) => [p, relative(PUBLIC, p).split(sep).join("/")])
    .filter(([, rel]) => !EXCLUIDOS.has(rel));

  const hash = createHash("sha256");
  hash.update(swActual.replace(BLOQUE, "")); // la lógica del propio service worker
  for (const [p, rel] of ficheros) hash.update(rel).update(readFileSync(p));

  const lista = ficheros.map(([, rel]) => `  '${urlDe(rel)}',`).join("\n");
  const bloque = `// <generado por npm run sw>
const VERSION = '${hash.digest("hex").slice(0, 12)}';
const PRECACHE = [
${lista}
];
// </generado>`;
  return swActual.replace(BLOQUE, bloque);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(SW_PATH, generar(readFileSync(SW_PATH, "utf8")));
  console.log("✅ public/sw.js actualizado.");
}
