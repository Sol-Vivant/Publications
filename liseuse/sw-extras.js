// sw-extras.js — complément du SW généré (importScripts, gen_sw.mjs).
// Fix bannière 2026-08-27 : SvPwaUpdate envoie {type:'SKIP_WAITING'} au SW en
// attente pour activer la nouvelle version AVANT le reload (sinon la page
// rechargée sort du vieux précache et la bannière revient). skipWaiting:true
// couvre déjà le cas nominal ; ce listener couvre les SW en état waiting
// (transition, onglets multiples).
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
