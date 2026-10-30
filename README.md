# 🎉 ¡Mímica Loca!

Juego de mímica para jugar en el navegador del móvil (estilo *Heads Up!*), sin app nativa.
Pon el móvil en la frente, **inclínalo hacia abajo si lo adivinan** y **hacia arriba para pasar**.

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

## Desplegar en Cloudflare Pages

1. Inicia sesión una sola vez (abre el navegador):

   ```bash
   npx wrangler login
   ```

2. Despliega:

   ```bash
   npm run deploy
   ```

La primera vez, Wrangler creará el proyecto `mimica-loca` y te dará una URL
`https://mimica-loca.pages.dev`. Cada `npm run deploy` publica la última versión.

Para editar el juego, toca `public/index.html` y vuelve a desplegar.
