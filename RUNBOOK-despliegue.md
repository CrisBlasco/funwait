# Runbook de despliegue — mímica-loca / FunWait

Modelo aplicado: **dos ramas → dos entornos**, con despliegue automático y puerta de
calidad. Basado en `Modelo-Entornos-y-Despliegue-Portable.md`.

| Rama | Entorno | Worker (Cloudflare) | Se despliega… |
|---|---|---|---|
| `dev` (por defecto) | **staging** | `mimica-loca-dev` | en cada push a `dev` |
| `main` (protegida) | **producción** | `mimica-loca` | en cada merge a `main` |

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

No hay tests ni build porque el sitio es HTML/CSS/JS estático; si en el futuro se añaden,
se encadenan en el script `check` del `package.json`.

---

## Pasos MANUALES (una sola vez, no se automatizan)

### 1. Activar los git hooks (una vez por clon)

```sh
git config core.hooksPath .githooks
chmod +x .githooks/*
```

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

Tras configurar los secretos, el primer `push` a `dev` crea el Worker `mimica-loca-dev`
y da su URL `https://mimica-loca-dev.<subdominio>.workers.dev`.

---

## Qué NO está automatizado (a propósito)

- **Alta de dominios/DNS** y provisión inicial de cada Worker: una vez, al montar el entorno.
- No hay base de datos ni migraciones de esquema en este proyecto.
