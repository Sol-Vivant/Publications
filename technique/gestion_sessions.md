# Gestion des sessions — guide d'usage

Ce guide documente le cycle complet d'une session de travail sur le corpus Sol Vivant : démarrage, développement, clôture. Il liste aussi les règles actives (lues en DB) et les modules de la Bibliothèque de Connaissances (BQ) disponibles.

## Contexte

Le projet est **mono-utilisateur** avec une DB SQLite binaire (`sol_vivant.db`) qui est la **source de vérité données** (le code des scripts est versionné par git). Les pages HTML, les README et les exports ne sont que des projections régénérables. Ce qui n'est pas en base n'existe pas.

Chaque session démarre par `session_start.py` qui affiche l'état git (branche, working tree, ahead/behind) **sans reset ni checkout** — l'agent ne modifie jamais la topologie git. La DB binaire (`sol_vivant.db`) est la source de vérité, exclue de git depuis 2026-06-22 et versionnée via `backups/sol_vivant.sql.gz`.

## Cycle d'une session

### 1. Démarrage

```bash
python3 tools/admin/session_start.py --db sol_vivant.db
```

**Deux régimes selon l'environnement :**
- **Session web** (`LLM_CODE_REMOTE=true`, cas nominal) : le provisioning (pip/npm + `core.hooksPath`) est assuré par le hook SessionStart (`.llm/hooks/session-start.sh`) ; le ref `main` est réaligné sur `origin/main` **sans checkout**, on **reste** sur la branche `llm/<session>`. Aucun reset destructif.
- **Session locale (CLI opencode)** : `session_start.py` affiche l'état git (branche, working tree, ahead/behind) **sans reset**. L'utilisateur gère sa sync avec origin lui-même ; l'agent ne fait jamais de `git reset --hard`, `git checkout`, ou `git push --force`.

Puis (les deux régimes) : backup DB journalier + **dashboard** — santé / documents / scripts / historique / intégrité / **ÉTAT DES AUDITS** (`audit_meta` ; `degraded` = non bloquant) / **règles actives**.

### 2. Développement

La plateforme LLM web impose une branche `llm/<nom-session>`. Toutes les modifications (DB + scripts) s'y accumulent. Conteneur éphémère : si JMJ pousse un retour, faire `git pull` avant d'agir.

**Regle** : on édite la DB (`config`, `concept_cards`, `terms`, fiches… ; `html_templates` pour le web) + les scripts Python (versionnés par git dans `tools/`), **jamais** les fichiers générés (HTML, README, MD). Plus de table `scripts` ni de sync DB↔fichiers depuis Session B.

### 3. Clôture (propagation `main` obligatoire)

La clôture est **scriptée**, jamais manuelle. Prérequis : écrire d'abord `jmj/.pending_session_recap.md` (BQ #119), working tree propre.

```bash
python3 tools/admin/session_end.py --db sol_vivant.db
```

Le script enchaîne : regen pages web → `check_integrity --strict` → insert `session_recap` → purge `audit_log` → flush WAL (`PRAGMA wal_checkpoint(TRUNCATE)`) → commit des regens → push branche → checkout `main` → `merge --ff-only` → push `main` → reste sur `main`.

**Fast-forward strict** ; s'il échoue (ne devrait jamais arriver en mono-session) → **stop et demander à JMJ**. Clôture prématurée (JMJ veut tester un fichier) : même script, puis on reste sur `main`.

## Dispositifs transverses (détail : règles actives + BQ)

- **Conseil** — dispositif de délibération en **deux temps** (cf. `jmj/outils/conseil_v2_prompt.md`) : génération jugée à la **fécondité** (pontonnier + filtre, garde-friction) → valve → validation jugée justesse/nécessité (3 lentilles + contradicteur + anti-marteau, 2 rounds, double critique) → vérif DB → verdict JMJ. La **vérité** revient à un juge externe (Jenni). Règles : `conseil_contradicteur`, `integration_conseil_audit`, `ouverture_conseil` ; BQ : `conseil_modele`.
- **Agents Task** — pour N>5 items LLM indépendants : pattern `agent_runner.py` en 3 phases (`--prepare` → agents Task en parallèle → `--consolidate`) ; toujours `model='opus'` par défaut. **Interdits** pour la rédaction éditoriale du corpus (`pas_agent_redacteur`).
- **Ouverture de session** — lire le dernier handoff de clôture (`jmj/rapports/session/`) puis tenir le Conseil sur les arbitrages ouverts AVANT d'agir (`ouverture_conseil`).

## Règles actives

Stockées dans le fichier `.opencode/RULES.md` (versionné Git depuis 2026-06-23) et affichées en live par `session_start.py` au démarrage de chaque session. C'est la source de vérité — modifiable en éditant directement le fichier, effet immédiat au prochain `session_start.py`.

Pour ajouter ou modifier une règle :
```bash
# Éditer le fichier directement
vi .opencode/RULES.md
# La modification est effective au prochain session_start.py
```

*(aucune règle active pour l'instant)*

## Bibliothèque de Connaissances (BQ)

La BQ stocke les guides, conventions et retours d'expérience sous forme de **fiches markdown** (`tools/bq/*.md`), classées par **domaines techniques** (`tools/bq/_domaines.yaml`) — une entrée a 1 domaine primaire + 0-5 domaines de référence. Cinq catégories possibles : pipeline | corpus | web | technique | specifique. La doctrine d'accès est « **recherche au fil de l'eau** » : on ne charge pas un bloc au démarrage, on cherche au moment où un doute émerge (voir règle `bq_access` ci-dessus).

### Commandes usuelles

```bash
# Recherche ciblée par mot-clé (réflexe principal)
python3 tools/admin/bq_query.py --db sol_vivant.db --search "<terme>"

# Charger un domaine entier (primaires + références)
python3 tools/admin/bq_query.py --db sol_vivant.db --domaine <slug>

# Inventaire des domaines disponibles
python3 tools/admin/bq_query.py --db sol_vivant.db --list
```

### Domaines disponibles (14)

| Slug | Nom | Catégorie | Description |
|------|-----|-----------|-------------|
| `thesaurus` | Pipeline thesaurus | pipeline | prompt termes → Jenni → import en DB |
| `fiches` | Pipeline fiches | pipeline | prompt → Jenni → .docx → intégration → rendu Cahier |
| `docs` | Pipeline docs strate | pipeline | prompts F1/S2/V1/P13… clôturés → passe finale Jenni |
| `concept-cards` | Cartes de concept | corpus | filtre de rigueur entre captation et intégration |
| `validations` | Pipeline validations | pipeline | prompt validation → Jenni → intégration (combler lacunes) |
| `chaines` | Chaînes causales | corpus | chains_causales, étapes, workflow v4 |
| `web` | Pages web (toutes) | web | site, pages, charte CSS, dark mode, calculateurs, templates, React |
| `bq` | BQ elle-même | technique | architecture BQ, consultation, doctrine |
| `session` | Gestion de session | technique | démarrage, clôture, git, propagation main |
| `integrite` | Intégrité DB | technique | check_integrity, audit structurel, FK, orphelins |
| `analyse` | Analyse corpus | technique | analyse_corpus, audit_opus, veille, agent_runner |
| `archivage` | Archivage post-intégration | technique | règles fichiers/fiches/prompts traités |
| `jenni-workflow` | Workflow Jenni | technique | prompts docx, OMML, charte rédaction, refs APA |
| `sources-autoritaires` | Sources autoritaires externes | technique | doctrines de référence (INRAE, Shift, etc.) utilisées pour aligner le corpus |

## Cheat-sheet — commandes usuelles

```bash
# Démarrer une session
python3 tools/admin/session_start.py --db sol_vivant.db

# Chercher dans la BQ
python3 tools/admin/bq_query.py --db sol_vivant.db --search "<terme>"

# Inventaire des scripts (depuis le filesystem)
python3 -c "from tools.lib.scripts_inventory import list_scripts; [print(s['folder'], s['nom']) for s in list_scripts()]"

# Regenerer toutes les pages web (apres modif DB)
python3 tools/regen_all.py --db sol_vivant.db

# Régénérer tous les README et guides techniques
python3 tools/docs/gen_readme.py --db sol_vivant.db
```

---

*Ce document est regénéré automatiquement par `tools/docs/gen_readme.py` (cible `sessions`) depuis le filesystem (`tools/bq/_domaines.yaml` et `.opencode/RULES.md`). Ne pas éditer à la main.*
