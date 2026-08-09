# Reproduire le patron pour un autre corpus

## L'idee

L'architecture Sol Vivant est un **patron generique** pour construire un corpus de connaissances structure. Elle n'est pas limitee a l'agriculture : tout domaine qui a besoin d'organiser des documents, un vocabulaire technique et des outils interactifs peut l'utiliser.

Le patron Sol Vivant gere actuellement 6835 termes, 192 prompts, 48 chaines causales et 10 pages web interactives, avec 143 scripts Python.

## Architecture modulaire

Le systeme est compose de **couches independantes**. On peut n'en utiliser qu'une partie selon le projet :

### Le noyau — LLM + SQLite

C'est le minimum pour demarrer. Il suffit de :

1. Creer une base SQLite avec les tables de base
2. Lancer LLM dans le dossier du projet
3. Construire le corpus en conversation : documents, termes, pages web

LLM gere la redaction, l'analyse de coherence, la generation de code, la maintenance des scripts et la creation des pages web interactives. **Pas besoin d'autre outil.**

### Couches optionnelles

| Couche | Apport | Quand l'activer |
|--------|--------|-----------------|
| **Jenni AI** | Redaction longue avec citations integrees | Corpus academique avec bibliographie dense |
| **Agents Task (inference)** | Audit / attribution / classification en masse, workflow 3 phases (prepare → agents Task → consolidate) via `agent_runner.py` | Gros volumes de traitement automatise |
| **GitHub Pages** | Publication web publique | Quand on veut partager les pages interactives |

## Exemples de projets possibles

| Projet | Strates possibles | Outils web |
|--------|-------------------|------------|
| **Solutions low-tech** | Materiaux, Energie, Eau, Alimentation, Habitat | Calculateurs, fiches techniques |
| **Guide de permaculture** | Sol, Plantes, Eau, Design, Animaux | Calendrier, associations, diagnostic sol |
| **Base medicale TDAH** | Fondements, Diagnostic, Traitements, Famille, Outils | Fiches FALC, echelles, arbres decisionnels |
| **Patrimoine architectural** | Epoques, Materiaux, Techniques, Reglementations | Cartographie, fiches batiment |
| **Cuisine et nutrition** | Ingredients, Techniques, Nutrition, Recettes | Calculateur nutritionnel, saisonnalite |

Dans tous les cas, le workflow est le meme : une DB unique + LLM pour tout orchestrer. Les scripts de generation web, README et outils interactifs sont reutilisables directement.

## Demarrage en 4 etapes

### 1. Creer la base

```sql
-- Les 3 tables essentielles (donnees du corpus)
CREATE TABLE documents (code TEXT PRIMARY KEY, strate TEXT, titre TEXT, note TEXT);
CREATE TABLE terms (id INTEGER PRIMARY KEY, fr TEXT, en TEXT, definition TEXT, doc_code TEXT);
CREATE TABLE config (categorie TEXT, cle TEXT, valeur TEXT, type TEXT DEFAULT 'text',
    description TEXT, PRIMARY KEY (categorie, cle));
```

**Pas de table `scripts`** : les scripts Python vivent dans `tools/` versionnes par git. L'inventaire est obtenu via `tools/lib/scripts_inventory.py` qui scanne le filesystem (lecon Session B 2026-05-05 : la sync DB↔fichiers se desynchronisait silencieusement, le filesystem-only est plus robuste).

Pour les pages web interactives, ajouter `web_pages` et `html_templates` (LLM les cree automatiquement quand on lui demande une page).

### 2. Definir le projet dans config

```sql
INSERT INTO config VALUES ('corpus', 'nom', 'Mon Projet', 'text', 'Nom du corpus');
INSERT INTO config VALUES ('corpus', 'auteur', 'Prenom Nom', 'text', 'Auteur principal');
INSERT INTO config VALUES ('strates', 'noms', '{"S":"Sol","V":"Vivant"}', 'json', 'Noms des strates');
INSERT INTO config VALUES ('strates', 'ordre', 'S,V', 'text', 'Ordre d affichage');
```

### 3. Travailler avec LLM

Ouvrir LLM dans le dossier du projet. LLM a acces a la DB et aux scripts. En conversation, on peut :

- Creer des documents et alimenter le thesaurus
- Generer des pages web interactives (calculateurs, cartographie)
- Ecrire et maintenir les scripts Python
- Analyser la coherence du corpus (termes orphelins, connexions manquantes)
- Generer les README et le MANIFEST automatiquement

Le fichier `AGENTS.md` a la racine du projet donne le contexte permanent a l'agent (regles, architecture, conventions).

### Pourquoi SQLite + Git

**SQLite** est le format ideal pour ce type de projet : c'est un fichier unique, portable, qui fonctionne partout sans serveur. On peut travailler dans un train, sur un vieux portable sous Linux, dans un avion — aucune connexion necessaire. LLM lit et ecrit directement dans la base, ce que peu de gens imaginent possible.

**Git** est fortement recommande pour versionner le projet. Il permet de :

- Garder l'historique complet de chaque modification
- Revenir en arriere en cas d'erreur
- Synchroniser entre plusieurs machines
- Collaborer (meme si le fichier .db est binaire et ne se merge pas)

**Sans Git**, le patron fonctionne aussi : on peut travailler dans une session LLM (CLI, web ou desktop) en echangeant le fichier `.db` entre l'utilisateur et LLM. Mais Git apporte la securite du versionnement — on ne perd jamais rien.

### 4. Publier (optionnel)

```bash
# Generer les pages web
python3 tools/docs/gen_web.py --db ma_base.db

# Archive hors-ligne
python3 tools/docs/gen_archive.py --db ma_base.db --regenerate

# Deployer sur GitHub Pages
rsync -av Publications/web/ /chemin/vers/depot-pages/
```

L'architecture est independante du domaine. Seul le contenu de la DB change — les scripts et la charte web sont reutilisables tels quels.
