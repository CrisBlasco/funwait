#!/usr/bin/env node
// Puerta de calidad del contenido de los juegos (public/data/<idioma>/*.json):
// un JSON roto o incompleto deja un juego sin jugar, y solo se vería en el móvil.
// Falla con código != 0 para cortar el deploy en CI.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "public", "data");

// Cada idioma es una carpeta; es es el idioma base y siempre debe existir.
const REQUIRED = ["es/mimica.json", "es/bomba.json", "es/portero.json", "es/lengua.json"];

// El Portero y Muérdete la Lengua se juegan varias veces seguidas al mismo nivel:
// por debajo de esto se repite pronto.
const MIN_POR_NIVEL = 30;

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const COLOR = /^#[0-9a-fA-F]{6}$/;

const errors = [];

for (const f of REQUIRED) {
  if (!existsSync(join(DATA, f))) errors.push(`Falta el contenido obligatorio: public/data/${f}`);
}

const texto = (v) => typeof v === "string" && v.trim() !== "";
// Para comparar palabras: sin mayúsculas ni tildes (la ñ se conserva).
const normal = (v) => v.toLowerCase().replace(/ñ/g, "\0").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\0/g, "ñ").trim();

// Campos comunes de un paquete de Mímica, un tema de La Bomba o un nivel de El Portero
// o de Muérdete la Lengua.
function revisarEntradas(rel, entradas, nombreLista, extra) {
  if (!Array.isArray(entradas) || entradas.length === 0) {
    errors.push(`${rel}: "${nombreLista}" debe ser una lista con elementos`);
    return;
  }
  const ids = new Set();
  entradas.forEach((e, i) => {
    const donde = `${rel}: ${nombreLista}[${e?.id ?? i}]`;
    if (!ID.test(e?.id ?? "")) errors.push(`${donde}: id no válido`);
    if (ids.has(e?.id)) errors.push(`${donde}: id repetido`);
    ids.add(e?.id);
    if (!texto(e?.nombre)) errors.push(`${donde}: falta "nombre"`);
    if (!texto(e?.emoji)) errors.push(`${donde}: falta "emoji"`);
    if (!COLOR.test(e?.color ?? "")) errors.push(`${donde}: color no válido → "${e?.color}"`);
    extra(e, donde);
  });
}

const VALIDADORES = {
  "mimica.json": (rel, datos) =>
    revisarEntradas(rel, datos.paquetes, "paquetes", (p, donde) => {
      if (!Array.isArray(p?.palabras) || p.palabras.length === 0) {
        errors.push(`${donde}: "palabras" debe ser una lista con elementos`);
        return;
      }
      const vistas = new Set();
      for (const w of p.palabras) {
        if (!texto(w)) errors.push(`${donde}: palabra vacía o no válida`);
        else if (vistas.has(w)) errors.push(`${donde}: palabra repetida → "${w}"`);
        vistas.add(w);
      }
    }),
  "bomba.json": (rel, datos) => {
    revisarEntradas(rel, datos.temas, "temas", (t, donde) => {
      if (!texto(t?.descripcion)) errors.push(`${donde}: falta "descripcion"`);
    });
    if (!Array.isArray(datos.onomatopeyas) || !datos.onomatopeyas.length || !datos.onomatopeyas.every(texto)) {
      errors.push(`${rel}: "onomatopeyas" debe ser una lista de textos con elementos`);
    }
  },
  // Los id de las reglas son únicos en todo el fichero: el juego los guarda para no repetirlas.
  "portero.json": (rel, datos) => {
    const ids = new Set();
    const listaDeTextos = (v) => Array.isArray(v) && v.length > 0 && v.every(texto);
    revisarEntradas(rel, datos.niveles, "niveles", (n, donde) => {
      if (!texto(n?.descripcion)) errors.push(`${donde}: falta "descripcion"`);
      if (!Array.isArray(n?.reglas) || n.reglas.length < MIN_POR_NIVEL) {
        errors.push(`${donde}: necesita al menos ${MIN_POR_NIVEL} reglas (tiene ${n?.reglas?.length ?? 0})`);
        return;
      }
      for (const r of n.reglas) {
        const dr = `${donde}: regla[${r?.id}]`;
        if (!ID.test(r?.id ?? "")) errors.push(`${dr}: id no válido`);
        if (ids.has(r?.id)) errors.push(`${dr}: id repetido`);
        ids.add(r?.id);
        if (!texto(r?.texto)) errors.push(`${dr}: falta "texto"`);
        if (!listaDeTextos(r?.si)) errors.push(`${dr}: "si" debe ser una lista de textos con elementos`);
        if (!listaDeTextos(r?.no)) errors.push(`${dr}: "no" debe ser una lista de textos con elementos`);
        if (r?.nota !== undefined && !texto(r.nota)) errors.push(`${dr}: "nota" vacía`);
      }
    });
  },
  // La palabra es el id de la tarjeta (el juego la guarda para no repetirla): única en todo el fichero.
  // Una prohibida no puede contener la palabra ni estar dentro de ella: ya está prohibida de por sí.
  "lengua.json": (rel, datos) => {
    const palabras = new Set();
    revisarEntradas(rel, datos.niveles, "niveles", (n, donde) => {
      if (!texto(n?.descripcion)) errors.push(`${donde}: falta "descripcion"`);
      if (!Number.isInteger(n?.nProhibidas) || n.nProhibidas < 1) errors.push(`${donde}: "nProhibidas" debe ser un entero positivo`);
      if (!Array.isArray(n?.tarjetas) || n.tarjetas.length < MIN_POR_NIVEL) {
        errors.push(`${donde}: necesita al menos ${MIN_POR_NIVEL} tarjetas (tiene ${n?.tarjetas?.length ?? 0})`);
        return;
      }
      for (const t of n.tarjetas) {
        const dt = `${donde}: tarjeta[${t?.palabra}]`;
        if (!texto(t?.palabra)) { errors.push(`${donde}: tarjeta sin "palabra"`); continue; }
        const clave = normal(t.palabra);
        if (palabras.has(clave)) errors.push(`${dt}: palabra repetida`);
        palabras.add(clave);
        if (!Array.isArray(t.prohibidas) || !t.prohibidas.every(texto)) {
          errors.push(`${dt}: "prohibidas" debe ser una lista de textos`);
          continue;
        }
        if (t.prohibidas.length !== n.nProhibidas) errors.push(`${dt}: tiene ${t.prohibidas.length} prohibidas y el nivel pide ${n.nProhibidas}`);
        const vistas = new Set();
        for (const pr of t.prohibidas.map(normal)) {
          if (vistas.has(pr)) errors.push(`${dt}: prohibida repetida → "${pr}"`);
          vistas.add(pr);
          if (pr.includes(clave) || clave.includes(pr)) errors.push(`${dt}: la prohibida "${pr}" contiene la palabra o está dentro de ella`);
        }
      }
    });
  },
};

for (const idioma of existsSync(DATA) ? readdirSync(DATA) : []) {
  for (const f of readdirSync(join(DATA, idioma))) {
    const rel = `public/data/${idioma}/${f}`;
    const validar = VALIDADORES[f];
    if (!validar) {
      errors.push(`${rel}: fichero sin validador; añádelo a scripts/check-content.mjs`);
      continue;
    }
    let datos;
    try {
      datos = JSON.parse(readFileSync(join(DATA, idioma, f), "utf8"));
    } catch (e) {
      errors.push(`${rel}: JSON no válido → ${e.message}`);
      continue;
    }
    validar(rel, datos);
  }
}

if (errors.length) {
  console.error("❌ Puerta de calidad (contenido) FALLÓ:");
  for (const e of errors) console.error("   • " + e);
  process.exit(1);
}

console.log("✅ Contenido OK: JSON válidos y completos.");
