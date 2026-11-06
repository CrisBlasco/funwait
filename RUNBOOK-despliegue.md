# Runbook de despliegue — mímica-loca / FunWait

Modelo aplicado: **dos ramas → dos entornos**, con despliegue automático y puerta de
calidad. Basado en `Modelo-Entornos-y-Despliegue-Portable.md`.

| Rama | Entorno | Worker (Cloudflare) | Se despliega… |
|---|---|---|---|
| `dev` (por defecto) | **staging** | `funwait-dev` | en cada push a `dev` |
| `main` (protegida) | **producción** | `funwait` | en cada merge a `main` |

```
local ──push──▶ dev ──deploy──▶ STAGING ──pruebas OK──▶ PR dev→main ──merge (humano)──▶ main ──deploy──▶ PRODUCCIÓN
```

---

## Ciclo diario

```sh
git switch dev
# ...cambios en public/...
git add -A && git commit -m "feat: ..."
git push origin dev            # CI: calidad → deploy a STAGING (mimica-loca-dev)

# probar en staging; cuando esté OK:
gh pr create --base main --head dev --fill   # o abrir el PR en la web
# revisar y MERGEAR el PR a mano  ← único disparador de PRODUCCIÓN
```

> Regla de oro: desde local solo se envía a `dev`. A `main` solo se llega por **PR
> mergeado por una persona** con la calidad en verde. Hooks + branch protection lo fuerzan.

---

## Puerta de calidad

`npm run check` (lo mismo que corre el CI antes de desplegar):

- `wrangler deploy --dry-run` → la config de Wrangler es válida y los assets compilan.
- `node scripts/check-html.mjs` → las páginas obligatorias existen y no hay `src`/`href`
  locales que apunten a archivos inexistentes.
- `node scripts/check-content.mjs` → el contenido de `public/data/` es válido y completo.
- `node scripts/check-i18n.mjs` → cada key existe y se usa, y no hay texto suelto en el HTML.
- `node scripts/check-pwa.mjs` → manifest, iconos y metas correctos, y `sw.js` al día con
  `public/` (si no, indica ejecutar `npm run sw`).

No hay tests ni build porque el sitio es HTML/CSS/JS estático; si en el futuro se añaden,
se encadenan en el script `check` del `package.json`.

---

## Emergencias: PWA y service worker

Un service worker queda instalado en los móviles: un error en la web se corrige con un
deploy normal, pero **uno en `public/sw.js` solo se corrige publicando otro `sw.js`**. Por
eso `public/sw.js` **nunca se borra**, tampoco al revertir: con un 404, los móviles se
quedarían con el anterior.

Quien ya tiene la app abre primero su copia guardada, así que un arreglo le llega cuando el
móvil, con red, detecta la versión nueva: la app recarga sola en la pantalla de inicio.

**Error en el juego (lo normal):**

```sh
git switch dev
git revert <commit>            # si el commit tocó public/, regenerar el sw.js:
npm run sw && npm run check
git add -A && git commit -m "fix: ..."
git push origin dev            # probar en staging; luego PR dev → main, merge a mano
```

**El `sw.js` está roto y hay que retirarlo (kill switch):**

```sh
git switch dev
cp scripts/sw-killswitch.js public/sw.js   # el check lo acepta por su marcador
npm run check
git add -A && git commit -m "fix: retira el service worker"
git push origin dev            # comprobar en staging; luego PR dev → main, merge a mano
```

Borra las cachés y deja de interceptar peticiones: la web funciona solo con red. Para volver
a la normalidad, restaurar `public/sw.js` desde git y ejecutar `npm run sw`.

**Excepción a "no desplegar a mano":** si producción está caída y no se puede esperar al flujo
normal, `npx wrangler rollback --env production` vuelve a la versión anterior del Worker. Es el
único despliegue manual previsto. No toca git, así que el siguiente deploy lo pisaría: hay que
hacer también el revert anterior.

---

## Pasos MANUALES (una sola vez, no se automatizan)

### 1. Activar los git hooks (una vez por clon)

```sh
git config core.hooksPath .githooks
chmod +x .githooks/*
```

El `pre-commit` hace dos cosas: bloquea commits en `main` y **escanea las líneas
añadidas en busca de secretos** (tokens Cloudflare `cfut_`, claves privadas, PAT de
GitHub, asignaciones tipo `TOKEN=valor`…). Si salta un falso positivo: `git commit --no-verify`.
Además, `.gitignore` ignora los archivos de secretos locales (`.dev.vars`, `.env*`, `*.key`…).

### 2. Secretos de deploy en GitHub Actions

Settings → Secrets and variables → Actions → New repository secret, o por CLI:

```sh
gh secret set CLOUDFLARE_API_TOKEN       # token con permiso Workers Scripts:Edit
gh secret set CLOUDFLARE_ACCOUNT_ID      # ID de la cuenta de Cloudflare
```

- `CLOUDFLARE_API_TOKEN`: crear en Cloudflare → My Profile → API Tokens, plantilla
  "Edit Cloudflare Workers" (o permiso *Account · Workers Scripts · Edit*).
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare → Workers & Pages → panel derecho "Account ID".

Secretos de **runtime** (claves de terceros, etc.): este proyecto no usa ninguno hoy.
Si hiciera falta, van por entorno: `wrangler secret put CLAVE --env dev|production`.
Nunca en `wrangler.jsonc` ni en git.

### 3. Branch protection en `main`

Settings → Branches → Add rule, patrón `main`:

- ✅ Require a pull request before merging.
- ✅ Require status checks to pass → marcar el check **`check`** como obligatorio.
- (Opcional) Require linear history, no permitir force-push.

### 4. Primer despliegue de staging

Tras configurar los secretos, el primer `push` a `dev` crea el Worker `funwait-dev`
y da su URL `https://funwait-dev.<subdominio>.workers.dev`.

---

## Qué NO está automatizado (a propósito)

- **Alta de dominios/DNS** y provisión inicial de cada Worker: una vez, al montar el entorno.
- No hay base de datos ni migraciones de esquema en este proyecto.

## Nota de migración (worker antiguo)

Antes, producción se desplegaba a mano como el Worker **`mimica-loca`**. Al renombrar a
`funwait`, el primer deploy de producción crea un Worker **nuevo** (`funwait`) y el viejo
`mimica-loca` queda **huérfano** (deja de actualizarse). Cuando valides que `funwait` sirve
bien, borra el antiguo para no dejar una URL vieja viva:

```sh
npx wrangler delete --name mimica-loca
```

