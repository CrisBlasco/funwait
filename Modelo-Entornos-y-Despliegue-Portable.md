# Modelo de entornos y despliegue (portable)

> Documento **autocontenido y agnóstico de proyecto**: describe un modelo sencillo de
> *dos ramas → dos entornos* con despliegue automático y una puerta de calidad, para replicarlo en
> cualquier repositorio. Las partes atadas a una plataforma concreta (aquí **Cloudflare + Wrangler**)
> van marcadas como **[stack]**: sustitúyelas por las de tu hosting (Vercel, Fly, Render, AWS…) sin
> cambiar el modelo.

---

## 1. La idea en una frase

**Dos ramas = dos entornos. Se hace `push` y se despliega solo, pero únicamente si pasa la puerta de
calidad (lint + typecheck + tests). A producción se llega siempre por un PR que mergeas tú a mano.**

| Rama | Rol | Entorno | Se despliega… |
|---|---|---|---|
| `dev` | integración (rama por defecto) | **staging** | en **cada push a `dev`** |
| `main` | producción (protegida) | **producción** | en **cada push/merge a `main`** |

Flujo de una mejora:

```
local ──push──▶ dev ──deploy──▶ STAGING ──pruebas OK──▶ PR dev→main ──merge (humano)──▶ main ──deploy──▶ PRODUCCIÓN
```

Tres reglas que lo sostienen:

1. **Desde local solo se toca `dev`.** Nunca se commitea ni se hace push directo a `main`.
2. **A producción se llega SIEMPRE por PR `dev → main`.** El merge es la acción deliberada que despliega
   producción y **lo hace una persona** (no se automatiza).
3. **Nada se despliega si falla la calidad.** El deploy depende del job de calidad.

---

## 2. Piezas

### 2.1. Workflow de CI/CD (GitHub Actions)

Un **único** archivo (`.github/workflows/deploy.yml`) con dos jobs: calidad (siempre) y deploy (solo en
push, y el entorno lo elige la rama).

```yaml
name: CI/CD

on:
  push:         { branches: [dev, main] }
  pull_request: { branches: [dev, main] }   # los PR SOLO validan, NO despliegan

jobs:
  check:                                     # puerta de calidad
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4           # [stack] tu gestor de paquetes
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test

  deploy:
    needs: check                             # si la calidad falla, NO despliega
    if: github.event_name == 'push'          # los PR no despliegan (solo validan)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - name: Desplegar a STAGING
        if: github.ref == 'refs/heads/dev'
        # [stack] comando de deploy a tu entorno de staging. Ejemplo (Cloudflare):
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: apps/server
          command: deploy --env dev

      - name: Desplegar a PRODUCCIÓN
        if: github.ref == 'refs/heads/main'
        # [stack] comando de deploy a tu entorno de producción.
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: apps/server
          command: deploy --env production
```

Por qué así (patrones que hacen esto replicable):

- **`needs: check`** encadena deploy a calidad → nada sale sin pasar lint/typecheck/tests.
- **`if: github.event_name == 'push'`** → los **PR solo validan**; el despliegue ocurre cuando el commit
  **aterriza** en la rama (push/merge), no al abrir el PR.
- **`if: github.ref == 'refs/heads/…'`** → el **mismo** workflow sirve ambos entornos; la rama decide.
  Un solo pipeline, sin duplicar.

### 2.2. Git hooks que blindan `main` desde local

Para que "desde local solo `dev`" no dependa de la memoria, dos hooks versionados en `.githooks/` la
**fuerzan**:

`.githooks/pre-commit` (bloquea commits en `main`):

```sh
#!/bin/sh
branch=$(git symbolic-ref --short HEAD 2>/dev/null)
if [ "$branch" = "main" ]; then
  echo "⛔ Commit directo en 'main' bloqueado. Trabaja en 'dev' y promociona con un PR."
  echo "   Excepción puntual: git commit --no-verify"
  exit 1
fi
exit 0
```

`.githooks/pre-push` (bloquea push a `main`):

```sh
#!/bin/sh
while read -r local_ref local_sha remote_ref remote_sha; do
  case "$remote_ref" in
    refs/heads/main)
      echo "⛔ Push a 'main' (producción) bloqueado. Abre un PR 'dev → main'."
      echo "   Excepción puntual: git push --no-verify"
      exit 1
      ;;
  esac
done
exit 0
```

Activación **una vez por clon** (los hooks del repo no se activan solos):

```sh
git config core.hooksPath .githooks
chmod +x .githooks/*        # que sean ejecutables
```

Esto materializa "el merge a `main` lo hago siempre yo": desde la máquina de desarrollo es **imposible**
empujar a producción; el único camino es el PR y su merge en la interfaz de GitHub.

### 2.3. Protección de rama en GitHub (el cinturón, además del tirante)

Los hooks protegen *tu máquina*; la **branch protection** protege *el repo entero* (también a colaboradores
y a despistes). En `main`, activa:

- **Require a pull request before merging** (nada de push directo).
- **Require status checks to pass** → marca el job `check` como obligatorio.
- (Opcional) revisión aprobada, historial lineal, no permitir *force-push*.

Con esto, "a producción solo por PR mergeado por un humano con los checks en verde" queda garantizado por
el servidor, no solo por disciplina local.

### 2.4. Configuración multi-entorno en un solo archivo **[stack]**

El patrón general: *una* config con un bloque por entorno; el deploy elige con una bandera (`--env`).
Ejemplo con Wrangler (`wrangler.toml`):

```toml
# base (desarrollo local)
name = "mi-server"
[vars] APP_URL = "http://localhost:8787"

[env.dev]                       # → deploy --env dev   (STAGING)
name = "mi-server-dev"
[env.dev.vars] APP_URL = "https://staging.midominio.app"
# ...binding a la BD de staging

[env.production]                # → deploy --env production
name = "mi-server-production"
[env.production.vars] APP_URL = "https://midominio.app"
# ...binding a la BD de producción
```

Dos avisos que ahorran depuración:

- **Los recursos/bindings NO se heredan entre entornos**: repite base de datos, dominios y variables en
  cada bloque `[env.*]`.
- **Cada entorno apunta a SU propia base de datos/recursos.** Staging y producción **nunca** comparten
  datos.

### 2.5. Secretos: dos niveles

- **En GitHub** (Settings → Secrets and variables → Actions): las credenciales para que el **CI despliegue**
  (p. ej. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`). **[stack]**
- **En la plataforma, por entorno** (p. ej. `wrangler secret put CLAVE --env dev|production`): los secretos
  de **runtime** (claves de email, push, terceros…). **[stack]**
- **Nunca** en el archivo de config ni en git.

### 2.6. Lo que se deja manual a propósito

No todo conviene automatizarlo; lo irreversible/destructivo se hace a mano y se documenta en un runbook:

- **Migraciones de esquema de la base de datos**: se aplican **por entorno a mano** (el deploy del código
  no toca el esquema de datos). **[stack]**
- **Alta de dominios/DNS, provisión de las bases reales, primeros secretos**: una vez, al montar cada
  entorno.

---

## 3. Checklist de montaje (otro proyecto)

1. Crea **dos ramas**: `dev` (por defecto) y `main` (producción).
2. Crea **dos entornos** en tu hosting, cada uno con **su propia** base de datos/recursos y variables.
3. Añade **un workflow de CI/CD** (`on: push/PR a [dev, main]`): job de calidad siempre + job de deploy
   `needs: calidad`, `if: push`, con pasos condicionados por `github.ref` a cada entorno.
4. Guarda los **secretos de deploy** en GitHub Actions; los **secretos de runtime** en la plataforma, por
   entorno.
5. Añade **git hooks** `pre-commit`/`pre-push` que bloqueen `main`, y documenta
   `git config core.hooksPath .githooks`.
6. Activa **branch protection** en `main` (PR obligatorio + checks verdes).
7. Config **multi-entorno en un solo archivo** (elige entorno por bandera), recordando que los bindings no
   se heredan.
8. Escribe un **runbook** con los pasos manuales (migraciones, dominios, secretos) por entorno.

---

## 4. Resumen del ciclo diario

```
# trabajar
git switch dev
# ...cambios...
git add -A && git commit -m "feat: ..."
git push origin dev            # ← CI: calidad → deploy a STAGING

# probar en staging; cuando esté OK:
# abrir PR dev → main en GitHub  (CI corre calidad sobre el PR)
# revisar y MERGEAR el PR a mano  ← único disparador de PRODUCCIÓN
#   → CI: calidad → deploy a PRODUCCIÓN
```

> **Regla de oro:** desde local solo se envía a `dev`. A `main` (producción) solo se llega por **PR
> mergeado por una persona**, con la calidad en verde. Los git hooks + la branch protection lo hacen
> cumplir aunque alguien se despiste.
