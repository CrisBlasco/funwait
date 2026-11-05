#!/usr/bin/env node
// Puerta de calidad para un sitio estático: sin tests ni build, lo útil es
// verificar que el HTML que vamos a publicar no esté roto ni apunte a assets
// inexistentes. Falla con código != 0 para cortar el deploy en CI.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

// Páginas que SIEMPRE deben existir (si falta una, el deploy no tiene sentido).
const REQUIRED = ["index.html", "mimica.html", "bomba.html"];

const errors = [];

// 1) Las páginas obligatorias existen y no están vacías.
for (const f of REQUIRED) {
  const p = join(PUBLIC, f);
  if (!existsSync(p)) {
    errors.push(`Falta la página obligatoria: public/${f}`);
    continue;
  }
  if (statSync(p).size === 0) errors.push(`Página vacía: public/${f}`);
}

// Recorre public/ y devuelve todos los .html.
function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

const SRC_HREF = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;

for (const file of existsSync(PUBLIC) ? htmlFiles(PUBLIC) : []) {
  const rel = file.slice(PUBLIC.length + 1);
  const html = readFileSync(file, "utf8");

  // 2) Cierre básico del documento (heurística de buena formación).
  if (!/<\/html\s*>/i.test(html)) {
    errors.push(`${rel}: no se encuentra la etiqueta de cierre </html>`);
  }

  // 3) Referencias locales (src/href) que apunten a un archivo inexistente.
  for (const m of html.matchAll(SRC_HREF)) {
    let ref = m[1].trim();
    // Ignora recursos externos, anclas, data URIs y protocolos especiales.
    if (/^(https?:|data:|mailto:|tel:|javascript:|#|\/\/)/i.test(ref)) continue;
    ref = ref.split(/[?#]/)[0]; // quita query/fragment
    if (!ref) continue;

    const base = ref.startsWith("/") ? PUBLIC : dirname(file);
    const target = normalize(join(base, ref.replace(/^\//, "")));
    if (!target.startsWith(PUBLIC)) continue; // fuera de public/, no lo validamos
    if (!existsSync(target)) {
      errors.push(`${rel}: referencia a un archivo inexistente → "${m[1]}"`);
    }
  }
}

if (errors.length) {
  console.error("❌ Puerta de calidad (HTML) FALLÓ:");
  for (const e of errors) console.error("   • " + e);
  process.exit(1);
}

console.log("✅ HTML OK: páginas obligatorias presentes y sin referencias rotas.");
