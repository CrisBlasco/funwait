# Instrucciones de proyecto — FunWait (mímica, bomba, …)

Sitio estático (HTML/CSS/JS en `public/`) servido por **Cloudflare Workers con static
assets**. Detalle completo del despliegue en `RUNBOOK-despliegue.md`.

## Reglas de despliegue (OBLIGATORIAS — seguir siempre)

Modelo **dos ramas → dos entornos**. No hacer excepciones sin que la persona las pida
explícitamente.

| Rama | Entorno | Worker | Despliega en… |
|---|---|---|---|
| `dev` (por defecto) | staging | `funwait-dev` | cada push a `dev` |
| `main` (protegida) | producción | `funwait` | cada merge a `main` |

1. **Desde local solo se toca `dev`.** Nunca commitear ni hacer push directo a `main`.
   Los git hooks (`.githooks/`) y la branch protection lo bloquean; no usar `--no-verify`
   para saltárselo salvo petición expresa.
2. **A producción solo por PR `dev → main`**, y el **merge lo hace una persona**. No
   mergear ese PR de forma automática.
3. **No desplegar a mano.** El deploy lo hace GitHub Actions (`.github/workflows/deploy.yml`).
   No ejecutar `wrangler deploy` manualmente salvo emergencia documentada.
4. **Nada se despliega si falla la calidad.** La puerta es `npm run check`
   (`wrangler --dry-run` + `scripts/check-html.mjs`). Si se añade lógica nueva, ampliar ese
   script, no saltárselo.
5. **Secretos:** credenciales de deploy en *GitHub Actions secrets*; secretos de runtime en
   `wrangler secret put ... --env dev|production`. **Nunca** en `wrangler.jsonc` ni en git.

## Flujo de trabajo estándar

```sh
git switch dev
# ...editar public/...
npm run check                 # validar antes de subir
git add -A && git commit -m "feat: ..."
git push origin dev           # → CI despliega a STAGING (funwait-dev)
# probar staging; si OK:
gh pr create --base main --head dev --fill   # revisar y mergear a mano → PRODUCCIÓN
```

## Convenciones del repo

- **wrangler.jsonc:** los bloques `env.*` **no heredan** recursos; repetir `assets`,
  `observability`, etc. en cada entorno. Producción conserva el nombre `funwait`.
- **Rutas en el HTML:** mantenerlas **relativas** (`./css/...`, `./js/...`). No cablear
  dominios absolutos ni `canonical`/`og:url` con dominio, para que el sitio sea portable.
- **Contenido del juego:** al añadir palabras nuevas a `public/index.html`, validar con la
  skill `validar-palabras-mimica` antes de integrarlas.
