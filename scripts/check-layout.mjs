#!/usr/bin/env node
// Puerta de calidad del diseño responsive: abre cada pantalla de cada página en
// móviles pequeños, apaisado y tablet, y falla si algo se rompe visualmente:
//   • botones o tarjetas que se solapan entre sí,
//   • elementos que se salen por los lados o scroll horizontal,
//   • contenido cortado por arriba o por abajo sin poder hacer scroll,
//   • botones de texto corto partidos en varias líneas.
// Falla con código != 0 para cortar el deploy en CI.
// Requiere Chromium de Playwright: npx playwright install chromium --only-shell

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, dirname, resolve, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
const PAGES = ["index.html", "mimica.html", "bomba.html"];

// Ancho × alto en CSS px. Cubren el móvil más estrecho habitual (320), los típicos,
// el apaisado bajo (donde más se rompe) y una tablet.
const VIEWPORTS = [
  [320, 568], [360, 640], [375, 667], [414, 896],
  [568, 320], [667, 375], [768, 1024],
];

// Lo que se comprueba que no se pise: controles y bloques principales.
const SELECTOR = [
  "button", "a.fw-btn", ".fw-icon-btn", ".fw-switch", ".fw-tile", ".fw-game-card",
  ".fw-card", ".fw-panel", "#temaBox", "#timer", "#score", ".tema-chip",
].join(", ");

// Botones con texto de hasta este largo deben caber en una línea.
const MAX_CORTO = 20;

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".woff2": "font/woff2", ".webmanifest": "application/manifest+json",
};

// Servidor estático mínimo sobre public/ (puerto libre al azar).
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  const file = join(PUBLIC, path.endsWith("/") ? path + "index.html" : path);
  if (!file.startsWith(PUBLIC)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const BASE = `http://127.0.0.1:${server.address().port}/`;

// Se ejecuta en el navegador: activa la pantalla y devuelve los problemas.
function revisarPantalla({ id, selector, maxCorto }) {
  document.querySelectorAll(".fw-screen").forEach((s) => s.classList.remove("is-active"));
  const sc = document.getElementById(id);
  sc.classList.add("is-active");
  sc.scrollTop = 0;

  // Los botones cuyo texto se rellena en juego salen vacíos: les damos un texto realista.
  for (const b of sc.querySelectorAll("button, a.fw-btn")) {
    if (!b.textContent.trim() && !b.getAttribute("aria-label")) b.textContent = "Ver palabras (12)";
  }

  const visible = (e) => {
    if (e.hidden || e.closest("[hidden]")) return false;
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden";
  };
  const nombre = (e) => {
    const t = (e.textContent || e.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 24);
    return `${e.id ? "#" + e.id : "." + [...e.classList].join(".")}${t ? ` «${t}»` : ""}`;
  };

  const problemas = [];
  const scr = sc.getBoundingClientRect();
  const cs = getComputedStyle(sc);
  const puedeScroll = /(auto|scroll)/.test(cs.overflowY);

  // Un decorado más ancho que la pantalla con overflow oculto (rayos de #boom) no se puede desplazar.
  const scrollX = sc.scrollWidth > sc.clientWidth + 1 && !/(hidden|clip)/.test(cs.overflowX);
  if (scrollX || document.documentElement.scrollWidth > innerWidth + 1) {
    problemas.push("hay scroll horizontal");
  }

  const els = [...sc.querySelectorAll(selector)].filter(visible);
  const rects = els.map((e) => e.getBoundingClientRect());

  els.forEach((e, i) => {
    const r = rects[i];
    if (r.left < -1 || r.right > innerWidth + 1) {
      problemas.push(`${nombre(e)} se sale por los lados (${Math.round(r.left)}…${Math.round(r.right)} de ${innerWidth}px)`);
    }
    if (r.top < scr.top - 1) problemas.push(`${nombre(e)} queda cortado por arriba`);
    if (r.bottom > scr.bottom + 1 && !puedeScroll) problemas.push(`${nombre(e)} queda cortado por abajo y no hay scroll`);

    for (let j = i + 1; j < els.length; j++) {
      const o = els[j];
      if (e.contains(o) || o.contains(e)) continue;
      const q = rects[j];
      const ancho = Math.min(r.right, q.right) - Math.max(r.left, q.left);
      const alto = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
      if (ancho > 2 && alto > 2) problemas.push(`${nombre(e)} se solapa con ${nombre(o)}`);
    }

    if (e.matches(".fw-btn")) {
      const texto = e.textContent.trim();
      if (texto && texto.length <= maxCorto) {
        const range = document.createRange();
        range.selectNodeContents(e);
        const lineas = new Set([...range.getClientRects()].map((x) => Math.round(x.bottom))).size;
        if (lineas > 1) problemas.push(`${nombre(e)} se parte en ${lineas} líneas`);
      }
    }
  });
  return problemas;
}

const errors = [];
let browser;
try {
  browser = await chromium.launch();
} catch (e) {
  server.close();
  console.error("❌ Puerta de calidad (diseño) no pudo arrancar Chromium.");
  console.error("   Instálalo con: npx playwright install chromium --only-shell");
  console.error("   " + String(e.message).split("\n")[0]);
  process.exit(1);
}

try {
  for (const [width, height] of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width, height }, isMobile: true, hasTouch: true, serviceWorkers: "block",
    });
    const page = await ctx.newPage();
    for (const pagina of PAGES) {
      await page.goto(BASE + pagina, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const ids = await page.$$eval(".fw-screen[id]", (s) => s.map((x) => x.id));
      for (const id of ids) {
        const problemas = await page.evaluate(revisarPantalla, { id, selector: SELECTOR, maxCorto: MAX_CORTO });
        for (const p of problemas) errors.push(`${width}×${height} ${pagina}#${id}: ${p}`);
      }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}

if (errors.length) {
  console.error("❌ Puerta de calidad (diseño) FALLÓ:");
  for (const e of errors) console.error("   • " + e);
  process.exit(1);
}

console.log(`✅ Diseño OK: ${PAGES.length} páginas × ${VIEWPORTS.length} tamaños sin solapes ni desbordes.`);
