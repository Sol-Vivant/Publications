# Le Sol Vivant cet Holobionte — redirection

**Ce dépôt n'héberge plus le site.** Tout est publié à la racine de
**<https://lesolvivant.fr/>** depuis le 10 novembre 2026.

L'ancien contenu (`liseuse/`, `Outils/`, `technique/`, `img/`, `vendor/`) a
été **supprimé** : GitHub Pages impose un cache client de 10 minutes
(`cache-control: max-age=600`), et un ancien contenu laissé en place
continuait d'être servi — voire resservi depuis le cache — au lieu de la
redirection.

Il ne reste que `index.html` et `404.html` (la même page), qui annoncent le
site officiel et y redirigent en conservant le chemin, et `robots.txt` en
`Disallow: /`.

**Licence** : MIT (voir `LICENSE`).
