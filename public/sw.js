/* ============================================================
   FunWait · Service worker (copia local primero)
   La caché es una instantánea atómica de una versión: solo escribe `install`
   y la red nunca la toca, así que no se mezclan versiones.
   ⚠️ No borrar este fichero una vez publicado: un 404 deja a los móviles con el
   service worker anterior para siempre. Para retirarlo, ver scripts/sw-killswitch.js.
   ============================================================ */

// <generado por npm run sw>
const VERSION = '2b99a3a7ac08';
const PRECACHE = [
  './assets/icon.svg',
  './assets/logo.svg',
  './bomba',
  './css/funwait.css',
  './data/es/bomba.json',
  './data/es/lengua.json',
  './data/es/mimica.json',
  './data/es/portero.json',
  './fonts/fredoka-600.woff2',
  './fonts/fredoka-700.woff2',
  './fonts/poppins-400.woff2',
  './fonts/poppins-600.woff2',
  './fonts/poppins-800.woff2',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './',
  './js/funwait.js',
  './js/i18n/es.js',
  './lengua',
  './manifest.webmanifest',
  './mimica',
  './portero',
];
// </generado>

const PREFIJO = 'funwait-';
const CACHE = PREFIJO + VERSION;

async function instalar() {
  const cache = await caches.open(CACHE);
  try {
    await Promise.all(PRECACHE.map(async (url) => {
      const res = await fetch(url, { cache: 'no-cache' });
      // Una respuesta redirigida rompe las navegaciones que se sirvan con ella.
      if (!res.ok || res.redirected) throw new Error(`Precache: ${url} → ${res.status}`);
      await cache.put(url, res);
    }));
  } catch (e) {
    // Sin versión a medias: el service worker anterior sigue sirviendo la suya.
    await caches.delete(CACHE);
    throw e;
  }
  await self.skipWaiting();
}

async function activar() {
  const nombres = await caches.keys();
  await Promise.all(nombres.filter(n => n.startsWith(PREFIJO) && n !== CACHE).map(n => caches.delete(n)));
  await self.clients.claim();
}

// Cloudflare redirige /x.html → /x e /index.html → /; en caché están sin extensión.
function claveDeCache(url) {
  url.pathname = url.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  url.search = ''; url.hash = '';
  return url.href;
}

async function responder(req) {
  const cache = await caches.open(CACHE);
  const copia = await cache.match(claveDeCache(new URL(req.url)));
  if (copia) return copia;
  try {
    return await fetch(req);
  } catch (e) {
    if (req.mode === 'navigate') return (await cache.match('./')) || Response.error();
    throw e;
  }
}

self.addEventListener('install', e => e.waitUntil(instalar()));
self.addEventListener('activate', e => e.waitUntil(activar()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(responder(e.request));
});
