// sw-extras.js — complément du SW généré (importScripts, gen_sw.mjs).
//
// Fix racine bannière 2026-08-27 (3e itération, JMJ : « corriger à la source ») :
// le bouton « Recharger » pouvait boucler car (a) un garde-fou temporel
// rechargait la page ALORS QUE le nouveau SW n'était pas encore actif (install
// du précache ~30 Mo > 8 s → page resservie par le VIEUX SW → bannière), et
// (b) les caches RUNTIME (sv-entites, sv-data-v2) survivaient aux activations
// successives du SW : NetworkFirst retombe dessus en timeout/offline et peut
// resservir des pages périmées. Correction :
//   1. SKIP_WAITING sur message (presser l'activation d'un SW en attente) ;
//   2. À L'ACTIVATION d'un nouveau SW : purge des caches runtime — un nouveau
//      SW signifie un nouveau build, les entrées runtime HTML/JSON sont
//      périmées PAR CONSTRUCTION ; l'offline se re-remplit à l'usage.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n === 'sv-entites' || n === 'sv-data-v2')
          .map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});
