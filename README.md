# 🎉 FunWait · La cola también se juega

Colección de **minijuegos para el móvil** pensados para pasar el rato en las colas:
elige uno, os pasáis el teléfono y a reír. Sin app nativa, funciona en el navegador.

Ideal para entretener a los niños mientras hacéis cola en un parque temático 😉

## Juegos

- **💣 La Bomba** (3–8 jugadores, rápido). Por turnos decís una palabra del tema y os
  pasáis el móvil; pierde quien lo tenga cuando explota.
- **🎭 Mímica Express** (todos, creativo). Móvil en la frente: los demás hacen mímica.
  **Inclina hacia abajo si lo adivinan** y **hacia arriba para pasar**. Si no hay sensores
  de inclinación (o en el ordenador), funciona tocando: **abajo = acierto**, **arriba = pasar**.
- **🎲 Modo aleatorio** para que elija por vosotros.
- Más juegos muy pronto 😜

Extras comunes: temporizador ajustable, sonidos, vibración y pantalla que no se apaga.

## Estructura

Sitio estático servido por **Cloudflare Workers con static assets**. Todo vive en `public/`:

```
public/
  index.html     # hub de FunWait (elige juego)
  mimica.html    # Mímica Express
  bomba.html     # La Bomba
  data/es/       # contenido de los juegos (palabras, temas) en JSON
  css/ js/ fonts/ assets/   # design system compartido (FunWait)
```

## Probar en local

```bash
npm install
npm run dev
```

Abre la URL que indica Wrangler (abrir los HTML con `file://` no funciona, porque el
contenido se carga con `fetch`). Para probar en el móvil con sensores de inclinación
necesitas HTTPS (lo da Cloudflare al desplegar; en local solo funcionará el modo táctil).

## Despliegue (automático: dos ramas → dos entornos)

El despliegue está automatizado con GitHub Actions. **No se despliega a mano**:

- Push a **`dev`** → despliega a **staging** (worker `funwait-dev`).
- Merge de un PR a **`main`** → despliega a **producción** (worker `funwait`).

Nada sale sin pasar la puerta de calidad (`npm run check`). El detalle completo del flujo,
los secretos y los pasos manuales está en **`RUNBOOK-despliegue.md`**, y las reglas del
proceso en **`CLAUDE.md`**.

Ciclo típico:

```bash
git switch dev
# ...editar public/index.html, public/mimica.html, public/bomba.html...
npm run check                  # validar antes de subir
git add -A && git commit -m "feat: ..."
git push origin dev            # → CI: calidad → deploy a STAGING
# probar en staging y, si va bien, abrir y mergear un PR dev → main
```
