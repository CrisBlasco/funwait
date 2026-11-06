#!/usr/bin/env node
// Puerta de calidad de la PWA: un manifest o un icono mal hechos no dan ningún
// error visible, simplemente la app deja de poder instalarse.
// Falla con código != 0 para cortar el deploy en CI.

import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generar } from "./build-sw.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
const PAGES = ["index.html", "mimica.html", "bomba.html"];

const errors = [];

// Las rutas se quedan relativas para que el sitio sea portable (ver CLAUDE.md).
const relativa = (r) => typeof r === "string" && r.startsWith("./");

// Tamaño real de un PNG, leído de su cabecera IHDR.
function pngSize(path) {
  const b = readFileSync(path);
  if (b.toString("latin1", 1, 4) !== "PNG") return null;
  return `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`;
}

function revisarPng(ref, sizes, donde) {
  const p = join(PUBLIC, ref);
  if (!existsSync(p)) {
    errors.push(`${donde}: no existe el icono → ${ref}`);
    return;
  }
  const real = pngSize(p);
  if (real !== sizes) errors.push(`${donde}: ${ref} mide ${real}, se esperaba ${sizes}`);
}

// 1) Manifest.
let manifest = {};
try {
  manifest = JSON.parse(readFileSync(join(PUBLIC, "manifest.webmanifest"), "utf8"));
} catch (e) {
  errors.push(`public/manifest.webmanifest: no se puede leer → ${e.message}`);
}
for (const campo of ["name", "short_name", "display", "background_color", "theme_color"]) {
  if (!manifest[campo]) errors.push(`manifest: falta "${campo}"`);
}
if (manifest.display !== "standalone") errors.push(`manifest: display debe ser "standalone"`);
if ("orientation" in manifest) errors.push(`manifest: sin "orientation", Mímica también se juega en apaisado`);
for (const campo of ["start_url", "scope"]) {
  if (!relativa(manifest[campo])) errors.push(`manifest: "${campo}" debe ser una ruta relativa`);
}

// 2) Iconos: Chrome exige 192 y 512, y uno maskable para Android.
const iconos = manifest.icons || [];
for (const i of iconos) {
  if (!relativa(i.src)) errors.push(`manifest: icono con ruta no relativa → ${i.src}`);
  else revisarPng(i.src, i.sizes, "manifest");
}
for (const sizes of ["192x192", "512x512"]) {
  if (!iconos.some((i) => i.sizes === sizes && i.purpose === "any")) errors.push(`manifest: falta el icono ${sizes}`);
}
if (!iconos.some((i) => i.purpose === "maskable")) errors.push("manifest: falta un icono maskable");

// 3) Cada página enlaza el manifest y lo necesario para iOS.
for (const page of PAGES) {
  const html = readFileSync(join(PUBLIC, page), "utf8");
  if (!html.includes('rel="manifest" href="./manifest.webmanifest"')) errors.push(`${page}: no enlaza el manifest`);
  if (!html.includes('name="apple-mobile-web-app-capable"')) errors.push(`${page}: falta la meta de iOS`);
  const touch = html.match(/rel="apple-touch-icon" href="([^"]+)"/);
  if (!touch) errors.push(`${page}: falta apple-touch-icon`);
  else revisarPng(touch[1], "180x180", page);
}

// 4) Service worker. El de emergencia (KILL-SWITCH) no lleva lista ni versión:
//    bloquearlo aquí impediría retirar uno defectuoso.
const swPath = join(PUBLIC, "sw.js");
const sw = existsSync(swPath) ? readFileSync(swPath, "utf8") : "";
if (!sw) errors.push("public/sw.js: no existe; nunca debe borrarse una vez publicado");
else if (!sw.startsWith("/* KILL-SWITCH")) {
  if (generar(sw) !== sw) errors.push("public/sw.js: versión o lista desfasadas; ejecuta npm run sw");
  if (/^\s*'[^']*\.html',$/m.test(sw)) errors.push("public/sw.js: la lista no debe llevar claves .html");
  if (/^const VERSION = '';$/m.test(sw)) errors.push("public/sw.js: sin versión; ejecuta npm run sw");
}

// 5) El navegador debe revalidar sw.js siempre. (--dry-run no lee _headers.)
const headersPath = join(PUBLIC, "_headers");
const headers = existsSync(headersPath) ? readFileSync(headersPath, "utf8") : "";
if (!/^\/sw\.js\n\s+Cache-Control: no-cache$/m.test(headers)) {
  errors.push("public/_headers: falta la regla Cache-Control: no-cache de /sw.js");
}

if (errors.length) {
  console.error("❌ Puerta de calidad (PWA) FALLÓ:");
  for (const e of errors) console.error("   • " + e);
  process.exit(1);
}

console.log("✅ PWA OK: manifest, iconos, metas y service worker correctos.");
