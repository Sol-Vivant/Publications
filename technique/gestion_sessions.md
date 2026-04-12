# Gestion des sessions — guide d'usage

Ce guide documente le cycle complet d'une session de travail sur le corpus Sol Vivant : démarrage, développement, clôture. Il liste aussi les règles actives (lues en DB) et les modules de la Bibliothèque de Connaissances (BQ) disponibles.

## Contexte

Le projet est **mono-utilisateur** avec une DB SQLite binaire (`sol_vivant.db`) qui est la **source de vérité unique**. Les pages HTML, les README et les exports ne sont que des projections régénérables. Ce qui n'est pas en base n'existe pas.

Chaque session Claude Code est un **RESET** : l'état local peut contenir des commits fantômes de sessions précédentes (règle n°6 de CLAUDE.md), mais seul `origin/main` fait foi. Le script de démarrage les écrase automatiquement.

## Cycle d'une session

### 1. Démarrage

```bash
python3 tools/admin/session_start.py --db sol_vivant.db
```

Le script fait, dans l'ordre :
1. `git fetch origin main` et reset `--hard` sur `origin/main` si divergence
2. Nettoyage des branches locales `claude/*` (commits fantômes)
3. Backup DB journalier (`sol_vivant.db.YYYYMMDD.bak`)
4. Affichage du dashboard : santé, documents, scripts, historique, intégrité, **règles actives**

### 2. Développement

La plateforme Claude Code web impose une branche `claude/<nom-session>`. Toutes les modifications (DB, scripts, templates) s'y accumulent.

**Règle** : on modifie la DB (tables, templates `html_templates`, config), **jamais** les fichiers générés (HTML, README, MD). Les scripts Python sont synchronisés dans les deux sens via :
```bash
python3 tools/sync_scripts.py --db sol_vivant.db --diff     # comparer
python3 tools/sync_scripts.py --db sol_vivant.db --inject   # disque → DB
python3 tools/sync_scripts.py --db sol_vivant.db --extract  # DB → disque
```

### 3. Clôture

À la fin de chaque session, Claude propage systématiquement le travail vers `main` en fast-forward strict :

```bash
# Prérequis : working tree propre
git push -u origin claude/<branche-session>
git checkout main
git pull origin main
git merge --ff-only claude/<branche-session>
git push origin main
```

Cette clôture évite les collisions avec les manipulations manuelles (GitKraken) de JMJ pendant les tests. Si le fast-forward échoue — ne devrait jamais arriver en mono-session — **stop et demander à JMJ**.

## Règles actives

Stockées dans la table `config` (catégorie `claude_rules`) et affichées en live par `session_start.py` au démarrage de chaque session. C'est la source de vérité — modifiable par un simple `UPDATE` en DB, effet immédiat à la session suivante.

Pour ajouter ou modifier une règle :
```sql
-- Ajouter
INSERT INTO config (categorie, cle, valeur, type, description)
VALUES ('claude_rules', '<clé>', '<texte de la règle>', 'text', '<libellé>');

-- Modifier
UPDATE config SET valeur = '<nouveau texte>'
 WHERE categorie = 'claude_rules' AND cle = '<clé>';
```

**Règles actuellement en base (2)** :

### `audit_cards_first` — Audit concept_cards obligatoire avant toute création ou update

```
Recherche avant création, pas création à l'aveugle.

AVANT de proposer création d'un nouveau terme, concept_card, fiche, validation :

  SELECT id, title, description, status FROM concept_cards
  WHERE lower(title) LIKE '%<kw>%'
     OR lower(description) LIKE '%<kw>%'
     OR lower(notes) LIKE '%<kw>%';

  -- Et en parallèle :
  python3 tools/admin/bq_query.py --search "<kw>"

Triggers obligatoires — Claude lance cet audit AVANT de :
  • proposer une nouvelle concept_card (vérifier non-existence)
  • proposer un nouveau terme
  • proposer une nouvelle fiche ou validation
  • UPDATE d'une carte existante (lire version courante + liens)
  • détecter une contradiction apparente entre pièces du corpus

Si une carte/terme/fiche existante couvre le sujet (même partiellement), LA MOBILISER avant de proposer une création. Création uniquement si l'audit revient vide OU si la synthèse justifie explicitement une pièce complémentaire non redondante.

Justification : règle instituée suite à la session 2026-04-11 (sol sableux) où Claude a proposé de créer 2 cartes existantes (Card #17 'Mode d'application' et terme 'ration du sol'), a manqué la contradiction pré-existante entre Card #11 et Card #17, et a traité 48 cartes 'archive' legacy comme si elles étaient 'active'. Le système concept_cards contient plus de matière qu'il n'en expose par défaut — le réflexe de vérification est la condition pour le rendre utilisable.
```

### `bq_access` — Doctrine d'accès à la Bibliothèque de Connaissances — recherche au fil de l'eau

```
Recherche au fil de l'eau, pas chargement en bloc.

  bq_query.py --search "<terme>"    # trouve les entrées pertinentes
  bq_query.py --modules <code>      # charge un module entier (plusieurs entrées utiles)
  bq_query.py --list                # inventaire

Triggers obligatoires — Claude lance --search AVANT de :
  • toucher un nouveau type d'artefact (page web, fiche, prompt, chaîne)
  • décider d'une convention (casse, format, préfixe, tri)
  • commettre un UPDATE structurel en DB
  • diagnostiquer un script qui échoue de manière inattendue
```

## Bibliothèque de Connaissances (BQ)

La BQ stocke les guides, conventions et retours d'expérience dans la table `bq_entries`, organisés en modules (`bq_modules`). La doctrine d'accès est « **recherche au fil de l'eau** » : on ne charge pas un bloc au démarrage, on cherche au moment où un doute émerge (voir règle `bq_access` ci-dessus).

### Commandes usuelles

```bash
# Recherche ciblée par mot-clé (réflexe principal)
python3 tools/admin/bq_query.py --db sol_vivant.db --search "<terme>"

# Charger un module entier (seulement si plusieurs entrées pertinentes)
python3 tools/admin/bq_query.py --db sol_vivant.db --modules <code>

# Inventaire des modules disponibles
python3 tools/admin/bq_query.py --db sol_vivant.db --list
```

### Modules disponibles (9)

| Code | Titre | Description |
|------|-------|-------------|
| `projet` | Projet Le Sol Vivant cet Holobionte | Vue d'ensemble, architecture, strates, chaînes causales |
| `claude` | Guide Claude — contraintes et workflow | Contraintes comportementales, règles absolues, stratégie rédaction, structure dépôt |
| `sqlite` | Guide SQLite — architecture DB complète | Architecture DB, tables actives/legacy, requêtes de pilotage |
| `jenni` | Guide Jenni — Workflow v3.0 | Masque mécanique, données dans les tables, workflow one-shot + analyse |
| `batch` | Guide Batch — Pipeline Zotero v3 | normalise → batch_attribution → validate. Patch in-place, STATUT-driven. |
| `zotero` | Guide Zotero | Tags STATUT/STRATE/CHAINE, filtres, workflow import |
| `illustrations` | Guide Illustrations | FigureLabs, Mermaid, 12 concepts, prochains lots |
| `maintenance` | Guide Maintenance — Sync, sessions, requêtes | Workflow session, gestion scripts, sync DB/fichiers, journal de bord |
| `web` | Guide Web — Charte graphique et templates HTML | Architecture des pages HTML interactives : charte Sol Vivant, templates, scripts de génération, conventions. |

## Cheat-sheet — commandes usuelles

```bash
# Démarrer une session
python3 tools/admin/session_start.py --db sol_vivant.db

# Regénérer CLAUDE.md depuis la DB
python3 tools/admin/session_start.py --db sol_vivant.db --claude-md

# Chercher dans la BQ
python3 tools/admin/bq_query.py --db sol_vivant.db --search "<terme>"

# Vérifier la cohérence scripts DB ↔ disque
python3 tools/sync_scripts.py --db sol_vivant.db --diff

# Régénérer toutes les pages web (après modif DB)
python3 tools/regen_all.py --db sol_vivant.db

# Régénérer tous les README et guides techniques
python3 tools/docs/gen_readme.py --db sol_vivant.db
```

---

*Ce document est regénéré automatiquement par `tools/docs/gen_readme.py` (cible `sessions`) depuis les tables `config` et `bq_modules`. Ne pas éditer à la main.*
