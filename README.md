# 🎉 ¡Mímica Loca!

Juego de mímica para jugar en el navegador del móvil (estilo *Heads Up!*), sin app nativa.
Pon el móvil en la frente, **inclínalo hacia abajo si lo adivinan** y **hacia arriba para pasar**.

Ideal para pasar el rato con los niños mientras haces cola en un parque temático 😉

- 8 paquetes de palabras para niños (~10 años): objetos, animales, herramientas,
  profesiones, Halloween, Navidad, personajes Disney y verano.
- Usa los sensores de inclinación del navegador (`deviceorientation`).
- Si no hay sensores (o en el ordenador), funciona tocando: **abajo = acierto**, **arriba = pasar**.
- Temporizador ajustable, sonidos, vibración y pantalla que no se apaga.

## Probar en local

```bash
npm install
npm run dev
```

Abre la URL que indica Wrangler. Para probar en el móvil con sensores necesitas HTTPS
(lo da Cloudflare al desplegar; en local solo funcionará el modo táctil).

## Despliegue (automático: dos ramas → dos entornos)

El despliegue está automatizado con GitHub Actions. **No se despliega a mano**:

- Push a **`dev`** → despliega a **staging** (`funwait-dev`).
- Merge de un PR a **`main`** → despliega a **producción** (`funwait`).

Nada sale sin pasar la puerta de calidad (`npm run check`). El detalle completo del
flujo, los secretos y los pasos manuales está en **`RUNBOOK-despliegue.md`**.

Ciclo típico:

```bash
git switch dev
# ...editar public/index.html, public/mimica.html, etc...
git add -A && git commit -m "feat: ..."
git push origin dev            # → CI: calidad → deploy a STAGING
# probar en staging y, si va bien, abrir y mergear un PR dev → main
```
