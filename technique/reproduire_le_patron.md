# Reproduire le patron pour un autre corpus

## L'idee

L'architecture Sol Vivant est un **patron generique** pour construire un corpus de connaissances structure. Elle n'est pas limitee a l'agriculture : tout domaine qui a besoin d'organiser des documents, un vocabulaire technique et des outils interactifs peut l'utiliser.

Le patron Sol Vivant gere actuellement 6861 termes, 192 prompts, 49 chaines causales et 10 pages web interactives, avec 162 scripts Python.

## Architecture modulaire

Le systeme est compose de **couches independantes**. On peut n'en utiliser qu'une partie selon le projet :

### Le noyau — orchestrateur + SQLite

C'est le minimum pour demarrer. Il suffit de :

1. Creer une base SQLite avec les tables de base
2. Lancer l'orchestrateur (opencode CLI) dans le dossier du projet
3. Construire le corpus en conversation : documents, termes, pages web

L'orchestrateur (agent primaire) orchestre ; les subagents Task auditent, classifient et redigent sous supervision ; un **Conseil d’audit** (contradicteur + juge) valide les arbitrages avant integration. LLM gere l'analyse de coherence, la generation de code et la maintenance des scripts. **Pas besoin d'autre outil.**

### Couches optionnelles

| Couche | Apport | Quand l'activer |
|--------|--------|-----------------|
| **Subagents redacteurs** | Redaction longue avec citations integrees (DeepSeek/Kimi via `agent_runner.py`, workflow 3 phases prepare → agents → consolidate) | Corpus academique avec bibliographie dense |
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

Dans tous les cas, le workflow est le meme : une DB unique + un orchestrateur pour tout piloter. Les scripts de generation web, README et outils interactifs sont reutilisables directement.

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

### 3. Travailler avec l'orchestrateur

Ouvrir l'orchestrateur (opencode) dans le dossier du projet. L'orchestrateur a acces a la DB et aux scripts. En conversation, on peut :

- Creer des documents et alimenter le thesaurus
- Generer des pages web interactives (calculateurs, cartographie)
- Ecrire et maintenir les scripts Python
- Analyser la coherence du corpus (termes orphelins, connexions manquantes)
- Generer les README et le MANIFEST automatiquement

Les subagents Task (agents specialises, routages via `config.agent_library`) traitent les taches en masse ; le Conseil d’audit valide les arbitrages editoriaux avant toute integration DB.

Le fichier `AGENTS.md` a la racine du projet donne le contexte permanent a l'agent (regles, architecture, conventions).

### Pourquoi SQLite + Git

**SQLite** est le format ideal pour ce type de projet : c'est un fichier unique, portable, qui fonctionne partout sans serveur. On peut travailler dans un train, sur un vieux portable sous Linux, dans un avion — aucune connexion necessaire. L'orchestrateur lit et ecrit directement dans la base, ce que peu de gens imaginent possible.

**Git** est fortement recommande pour versionner le projet. Il permet de :

- Garder l'historique complet de chaque modification
- Revenir en arriere en cas d'erreur
- Synchroniser entre plusieurs machines
- Collaborer (meme si le fichier .db est binaire et ne se merge pas)

**Sans Git**, le patron fonctionne aussi : on peut travailler dans une session orchestrateur (CLI ou desktop) en echangeant le fichier `.db` entre l'utilisateur et l'agent. Mais Git apporte la securite du versionnement — on ne perd jamais rien.

### 4. Publier (optionnel)

```bash
# Liseuse — point d'entrée public (site statique + PWA + exports)
bash tools/liseuse/build.sh --db ma_base.db

# Pages web internes restantes (dashboard, explorer, technique…)
python3 tools/regen_all.py --db ma_base.db

# Deployer sur GitHub Pages
rsync -av Publications/web/ /chemin/vers/depot-pages/
```

L'architecture est independante du domaine. Seul le contenu de la DB change — les scripts et la charte web sont reutilisables tels quels.
