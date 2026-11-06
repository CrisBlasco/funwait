---
name: validar-palabras-mimica
description: Valida palabras propuestas para los paquetes del juego de mímica. Comprueba dos cosas: (1) que no se parezcan demasiado a otras de la MISMA lista, y (2) que sean representables con mímica. Úsala al revisar contenido nuevo generado para el juego, antes de añadirlo a public/data/es/mimica.json.
---

# Validar palabras de mímica

Objetivo: revisar un lote de palabras propuestas para un tema del juego de mímica y
decidir cuáles se añaden y cuáles se descartan o se reformulan, por dos motivos:

1. **Parecido** — una palabra no debe parecerse demasiado a otra ya existente de la
   misma lista (ni a otra del propio lote): duplicados, singular/plural, misma raíz,
   "X" vs "X con algo", etc.
2. **Mimeabilidad** — como es mímica (charadas), la palabra debe poder **actuarse con
   gestos**, sin hablar ni dibujar.

El parecido se mide con un script (determinista). La mimeabilidad la juzgas tú con la
rúbrica de abajo.

## Paso 1 — Parecido (script)

Ejecuta el script de similitud. Marca las palabras demasiado parecidas a otras de la
misma lista o entre sí.

```bash
# Si el tema YA existe en el juego (lee las existentes de public/data/es/mimica.json; falla si el tema no existe):
node .claude/skills/validar-palabras-mimica/similares.js --nuevas <archivo> --tema <clave>

# Si es un tema NUEVO o tienes las existentes aparte:
node .claude/skills/validar-palabras-mimica/similares.js --nuevas <archivo> --existentes <archivo>

# Opciones: --umbral 0.8 (sensibilidad del parecido, 0..1) · --json (salida estructurada)
```

- `--nuevas` acepta un `.md` (viñetas `- palabra`; si pasas `--tema`, coge solo la
  sección `## <clave> ...`) o un `.txt` (una palabra por línea).
- Claves de tema del juego: `objetos, animales, herramientas, profesiones, halloween,
  navidad, disney, verano, superheroes, dibujos, deportes, acciones`.

El script lista las palabras `⚠️` que superan el umbral, con a qué se parecen y por qué.
Esas son candidatas a **descartar** (o quedarte solo con una de las dos).

## Paso 2 — Mimeabilidad (tu criterio)

Para CADA palabra del lote, clasifícala en **Sí / Dudosa / No** según esta rúbrica:

**Sí (se actúa bien):**
- Objetos concretos (martillo, paraguas), animales, comidas.
- Acciones y verbos físicos (nadar, bostezar, chutar).
- Personajes reconocibles con rasgos actuables (poderes, gestos, vestuario típico):
  válido para `disney`, `superheroes`, `dibujos`.
- Deportes y profesiones (tienen gestos característicos).

**Dudosa (reformular o avisar):**
- Muy parecida en gesto a otra de la lista (se confundirían al actuarla).
- Concreta pero difícil de distinguir sin más contexto.

**No (descartar):**
- Conceptos abstractos sin gesto claro (justicia, suerte, libertad).
- Cualidades/estados poco representables, términos técnicos.
- Nombres que solo se adivinarían deletreando o que casi nadie de ~10 años conoce.

Ten en cuenta el público: **niños de ~10 años (España)**. Si un nombre propio es
demasiado desconocido para esa edad, va a "No" aunque sea mimable en teoría.

## Paso 3 — Informe

Devuelve un informe accionable, por tema:

- **✅ Aprobadas**: nº y, si se pide, la lista final lista para pegar en el JSON.
- **⚠️ Parecidas**: cada palabra marcada por el script, con a qué se parece y la
  recomendación (descartar / quedarse con cuál).
- **🚫 Poco mimables**: las clasificadas como "No" o "Dudosa", con el motivo.
- Un recuento final (aprobadas vs descartadas) y confirma que quedan **≥100** por tema
  si ese era el objetivo.

No modifiques `public/data/es/mimica.json` salvo que te lo pidan explícitamente: por defecto
solo revisas y propones. Cuando te den luz verde, las palabras aprobadas se añaden al array
`palabras` del paquete correspondiente. La rúbrica está pensada para español de España: para
otro idioma, habrá que adaptarla.
