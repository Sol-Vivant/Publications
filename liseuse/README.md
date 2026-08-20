# Le Sol Vivant cet Holobionte — Liseuse

> Liseuse du corpus scientifique, pédagogique et métier **« Le Sol Vivant cet
> Holobionte »** — agriculture régénératrice et biologie des sols.
> 299 textes intégraux, 7 316 entrées de vocabulaire, 269 concept cards,
> 49 chaînes causales, ~10 600 références académiques.

## Qu'est-ce que c'est ?

Un site statique **entièrement hors-ligne** (PWA) : une fois ouvert, tout le
corpus reste lisible sans connexion (Service Worker). Cinq strates —
Fondements, Sol, Vivant, Pratiques, Humain — portent l'ouvrage : fiches
techniques et pédagogiques, thésaurus tissé, cartes de rigueur, récits
causaux, références.

## Consulter (aucune installation)

Le site est servi par GitHub Pages :
**https://sol-vivant.github.io/Publications/**

- **Ajouter à l'écran d'accueil** (mobile) ou *Installer* (desktop, icône dans
  la barre d'adresse) : la liseuse s'utilise comme une application, offline.
- Une mise à jour du contenu se propose automatiquement (bannière version).

## Installation locale (serveur statique)

Le site est 100 % statique — n'importe quel serveur de fichiers suffit :

```bash
git clone https://github.com/Sol-Vivant/Publications.git
cd ..
mkdir -p pubroot/Publications
ln -s "$(pwd -P)/Publications/liseuse" pubroot/Publications/liseuse
cd pubroot && python3 -m http.server 8080
# → http://localhost:8080/Publications/liseuse/
```

> ⚠ Le chemin **/Publications/liseuse/** fait partie de l'URL (le build est
> préfixé pour GitHub Pages). Servir sous un autre chemin casse liens et
> Service Worker — pour un autre préfixe, rebuildez (ci-dessous).

## Rebuilder depuis les sources

Le pipeline complet vit dans le dépôt de développement (non requis pour
lecture) :

```bash
# Prérequis : Node ≥ 20 (verrouillé 22.x), Python 3, pandoc ≥ 3.10
export ASTRO_BASE=/Publications/liseuse/   # préfixe d'hébergement
bash tools/liseuse/build.sh --db sol_vivant.db --force
bash tools/liseuse/deploy_publications.sh # copie dist/ → repo public
```

Étapes internes : extraction DB → bundle Markdown → pré-rendu HTML → build
Astro (~8 000 pages) → Service Worker (workbox). Un build incrémental
(SHA-256) saute les étapes quand rien n'a changé.

## Suite de tests

`test_pages.sh` · `test_pwa.sh` · `test_navigation.sh` · `test_pandoc_lua.sh`
· `test_equivalence.mjs` · `test_exports.sh` · `pytest tests/test_liseuse_db.py`
— tous base-paramétrés (`SV_BASE=/Publications/`).

## Licences

- **Contenu du corpus** (textes, thésaurus, cards, chaînes) :
  [CC0 1.0 Universel](https://creativecommons.org/publicdomain/zero/1.0/deed.fr)
  — © Jean-Michel Juzan.
- **Code de la liseuse** (Astro/React/workbox, dépôt de développement) : MIT.
- **Références bibliographiques** : métadonnées uniquement (auteurs, titres,
  journaux, DOI) — aucun résumé d'éditeur n'est republié ; chaque référence
  pointe vers son DOI.

## Arborescence servie

```
/                    Accueil (portes des 5 strates)
/fiche/N/            299 textes (scientifiques + pédagogiques)
/terme/N/            7 316 entrées de vocabulaire définies et reliées
/card/N/             269 concept cards (rigueur des définitions)
/chain/N/            49 chaînes causales (récits cause à effet)
/strate/F..H/        pages d'accueil des strates
/doc/<code>/         18 documents sources du corpus
/thesaurus /cards /chaines /references   index
```

---

*Projet personnel de recherche et de vulgarisation — les retours sont les
bienvenus via les issues du dépôt.*
