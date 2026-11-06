/* KILL-SWITCH
   Service worker de emergencia: borra las cachés de FunWait y se desinstala, y la
   web vuelve a funcionar solo con red. Está fuera de public/ para que no se publique.

   Activarlo (procedimiento completo en RUNBOOK-despliegue.md):
     cp scripts/sw-killswitch.js public/sw.js
   y seguir el flujo normal. El marcador de la primera línea hace que `npm run check`
   lo acepte. No recarga las páginas: la siguiente apertura ya llega sin caché. */
self.addEventListener('install', e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil((async () => {
  const nombres = await caches.keys();
  await Promise.all(nombres.filter(n => n.startsWith('funwait-')).map(n => caches.delete(n)));
  await self.registration.unregister();
})()));
