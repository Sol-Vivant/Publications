# Gestion des sessions — guide d'usage

Ce guide documente le cycle complet d'une session de travail sur le corpus Sol Vivant : démarrage, développement, clôture. Il liste aussi les règles actives (lues en DB) et les modules de la Bibliothèque de Connaissances (BQ) disponibles.

## Contexte

Le projet est **mono-utilisateur** avec une DB SQLite binaire (`sol_vivant.db`) qui est la **source de vérité données** (le code des scripts est versionné par git). Les pages HTML, les README et les exports ne sont que des projections régénérables. Ce qui n'est pas en base n'existe pas.

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

**Regle** : on modifie la DB (tables, templates `html_templates`, config), **jamais** les fichiers generes (HTML, README, MD). Les scripts Python sont versionnes par git directement dans `tools/` (plus de table `scripts` ni de sync DB↔fichiers depuis Session B).

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

**Règles actuellement en base (22)** :

### `agent_runner_reflexe` — N>5 items LLM independants -> pattern agent_runner.py 3 phases (jamais agent par agent)

```
Reflexe : des N>5 items LLM independants -> pattern `agent_runner.py` en 3 phases (--prepare -> agents Task en parallele dans un seul message -> --consolidate), jamais les agents un par un. Doctrine complete : BQ `strategie_agents` + `agent_runner_garde_fous` (fait foi).
```

### `agents_opus_default` — Toujours passer model='opus' aux Agent Task (jugement nuance)

```
# Agents Task : passer model="opus" par defaut

Quand je lance un agent (Agent tool / Task), je dois TOUJOURS specifier
`model="opus"` sauf si je sais explicitement que la tache est triviale
(ex: lecture rapide d'un seul fichier court).

**Pourquoi** : les agents Explore et general-purpose ont Haiku 4.5 en
frontmatter par defaut, ce qui sous-dimensionne les analyses fines
(jugement doctrinal, audit nuance, refactor multi-fichiers). Constat
session 2026-05-05 : un agent Haiku a trouve 2 residus mineurs la ou
Opus en a trouve plus.

**Comment** : dans l'invocation Agent :
```
Agent(
    description="...",
    subagent_type="Explore",
    model="opus",   # <-- toujours
    prompt="..."
)
```

**Exception** : tasks vraiment triviales (recherche d'un fichier connu,
grep simple) peuvent rester sur le default. Mais en cas de doute, opus.

JMJ a explicitement demande Opus par defaut (2026-05-05).
```

### `archivage_fiches` — Archivage auto post-intégration (docx réponse + pendant recherches/) — factorisé sur 3 lanes : fiche, question/validation, thésaurus

```
# Archivage automatique des fichiers sources post-intégration (toutes lanes)

**Règle absolue** — dès qu'un document de `docx/` (réponse Jenni) est INTÉGRÉ au corpus, il est déplacé dans `docx/archives/`, ET son **pendant** (le document envoyé à Jenni, dans `recherches/<lane>/`) dans `recherches/<lane>/archives/`. Sans ça, `docx/` et `recherches/` accumulent le traité — on ne distingue plus l'actif du fait.

**Le principe couvre les 3 lanes d'intégration** :

| Lane | Script | Réponse (docx/) | Pendant envoyé (recherches/) | Helper |
|---|---|---|---|---|
| Fiche | `integrate_fiche.py` | `fiche_<id>.docx` | `recherches/fiches/fiche_<id>.docx` | `lib/fiche_archive.py::archive_fiche_files()` (nommage canonique + index docx + versions vN) |
| Question / validation | `integrate_validation_refs.py` | `<réponse>.docx` | `recherches/questions/question_<topic>_*.docx` | `lib/doc_archive.py::archive_integrated_docx()` (pendant deviné par slug, ou `--question-docx`) |
| Thésaurus | `import_termes_jenni.py` | `thesaurus_*.docx` | `recherches/thesaurus/<liste>.txt` (passer `--sent`) | `lib/doc_archive.py::archive_integrated_docx()` |

**Helper factorisé** : `lib/doc_archive.py::archive_integrated_docx(response_docx, pendant_docx)` — déplace docx + pendant vers leurs `archives/` respectifs (idempotent, non bloquant, agnostique `.docx`/`.txt`, suffixe `_vN` si collision). Câblé à l'apply de chaque script, **après `con.commit()`**. La lane fiche garde son implémentation dédiée (`fiche_archive.py`) car elle porte une sémantique de versions ; les deux matérialisent le même principe.

**Git** : `shutil.move` + `git add -A` capture le rename (delete+add) — pas besoin de `git mv` dans les scripts (cf. réflexe `archive_git_mv` pour l'archivage à la main).

**Scripts ad-hoc / intégration en direct** : importer `archive_integrated_docx` (ou `archive_fiche_files` pour une fiche) et l'appeler en fin de script. La règle s'applique à TOUS les pipelines, pas seulement au canonique.
```

### `archive_git_mv` — archive_git_mv

```
# Archivage docx post-intégration — utiliser `git mv` (pas `mv`)

**Règle opérationnelle** — quand on archive un docx Jenni intégré :

```bash
# OUI — git mv stage rename + delete + add en une commande
git mv docx/thesaurus_<date>.docx docx/archives/thesaurus_<date>.docx
```

```bash
# NON — mv + git add stage l'add mais OUBLIE le delete
# → working tree pollué, hook stop-git-check refuse
mv docx/thesaurus_<date>.docx docx/archives/
git add docx/archives/thesaurus_<date>.docx   # ⚠ delete non staged
```

Si le `mv` est déjà fait (oubli) : `git add -A docx/` capture le delete + l'add.

**Justification** : pattern à corriger après 2 incidents cette session
(lots 3 et 20260508) qui ont chacun nécessité un commit chore correctif
suite à un working tree pollué.

S'applique à : archivage docx thésaurus, fiches, prompts. Pour les fiches,
`tools/admin/integrate_fiche_docx.py::archive_fiche_files()` automatise déjà
proprement via shutil.move + git tracking — pour le thésaurus, Claude le fait
manuellement, d'où le rappel.
```

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

### `audit_reflex` — Toutes les 3-5 sessions / avant gros consolide : triptyque check_integrity + thesaurus + corpus

```
Reflexe : toutes les 3-5 sessions ou avant un consolide editorial majeur -> triptyque d'audit `check_integrity` + audit thesaurus + audit corpus. Doctrine complete : BQ `audit_conscient` / `audit_thesaurus` / `audit_corpus` (fait foi).
```

### `audit_status_lecture` — Lecture des audits : degraded = NON bloquant (1 ligne puis objectif de session) ; seul failed/missing/critique bloque ; jauges de préférence (anglicismes) ≠ casse, pas une urgence.

```
# Lecture du status des audits — anti-rassurisme ET anti-squat

**Deux pièges symétriques :**
- *Rassurisme* — déclarer « tout va bien » alors qu'un audit est non-`ok`.
- *Squat* — laisser un `degraded` détourner la session alors que JMJ a un autre
  objectif. `degraded` n'est PAS bloquant (voir définitions).

## Status (audit_meta.py / session_start.py)
- **`ok`** — toutes les assertions passent.
- **`degraded`** — échecs important/souhaitable/info, **0 critique → NON BLOQUANT**.
  Indique « peut-être à regarder un jour », pas une urgence.
- **`failed`** — erreur d'exécution OU ≥1 assertion **critique → BLOQUANT**.
- **`missing`** — pas de `_latest.json` → jamais tourné → bloquant.
- **`stale`** — `ok` mais trop ancien → relancer.

## Deux natures d'audit — ne pas confondre
- **Audits d'intégrité** (FK, doc_code, méta-vocab, orphelins, doublons) :
  un rouge = un **défaut réel** à corriger.
- **Jauges de préférence / qualité** (ex. `audit_anglicismes` : le corpus
  privilégie le français) : `degraded` est un **régime normal**, PAS une casse.
  Un anglicisme résiduel ne « casse » rien — préférence éditoriale traitée au fil
  de l'eau via Jenni. NE JAMAIS présenter une jauge `degraded` comme un problème
  bloquant ou un corpus « cassé ».

## Comportement au démarrage
1. Lire ÉTAT DES AUDITS et **signaler en UNE phrase** tout non-`ok` (jamais
   « tout va bien » : qualifier — « degraded sur audit_X »).
2. Puis **faire l'OBJECTIF DE SESSION fixé par JMJ.** Sur un `degraded` : ne pas
   enquêter, ne pas lire les rapports, ne pas proposer d'audit de sa propre
   initiative. Traiter les audits UNIQUEMENT si JMJ en fait la demande explicite.
3. **Seul `failed`/`missing`/critique** prend le pas sur le travail métier.

## Quand Claude audite (sur demande)
- Lire le **JSON** (`audit_reports/json/<script>_latest.json`), pas la sortie
  texte (tronquée/trompeuse).
- *Défaut corpus* vs *outil trop strict/cassé* : trancher avant de « corriger ».
- Script qui plante : ne pas silencier → `errors[]` (AuditReport), status `failed`.

## Anti-pattern silence-fail
`enrich_thesaurus.py --audit` plantait silencieusement (migration `terms.bt`
v1→v2) ; des sessions ont déclaré le BT « réglé » sans voir l'outil cassé. Motive
`tools/lib/audit_report.py`.

## Pipeline
`audit_report.py` · `check_integrity.py` · `audit_meta.py` · `session_start.py`.
Attendus : check_integrity, check_forbidden_jenni, audit_sources_orphelines,
audit_anglicismes, audit_fiches, enrich_thesaurus_audit, audit_opus.
```

### `bq_access` — Doctrine d'accès à la Bibliothèque de Connaissances — recherche au fil de l'eau

```
Recherche au fil de l'eau, pas chargement en bloc.

  bq_query.py --search "<terme>"    # trouve les entrées pertinentes
  bq_query.py --domaine <slug>      # charge un module entier (plusieurs entrées utiles)
  bq_query.py --list                # inventaire

ETAPE 3 OBLIGATOIRE du workflow session (BQ #128) :
Entre "comprendre la demande JMJ" et "faire", TOUJOURS lancer
  bq_query.py --search <terme>
sur les mots-cles de la demande. Skip interdit. Si la recherche revient
vide, documenter explicitement ("BQ search '<kw>' -> 0 resultat, pas de
pattern existant") avant d'agir.

Triggers obligatoires — Claude lance --search AVANT de :
  • toucher un nouveau type d'artefact (page web, fiche, prompt, chaîne)
  • décider d'une convention (casse, format, préfixe, tri)
  • commettre un UPDATE structurel en DB (incluant integration docx Jenni,
    resolution orphelines, merge de termes, patch citations)
  • diagnostiquer un script qui échoue de manière inattendue
  • lancer un script qui fait potentiellement des operations destructives
    (resolve_import_conflicts, dedupe_thesaurus, DELETE, MERGE)

Anti-pattern detecte (session 2026-04-21) : sauter de l'etape 2
"comprendre" a l'etape 4 "faire" sans etape 3 BQ --search. JMJ a du
rappeler 5 fois "tu lis les BQ avant" sur une meme session. Consequence :
merge destructif evite de justesse (Thaumarchaeota #25 et Nitrosomonas
#23 allaient etre supprimes par resolve_import_conflicts avec apostrophe
ASCII mal matchee). Cause : traitement de la BQ comme ressource optionnelle
au lieu de checkpoint non-negociable du workflow.
```

### `bq_source_verite` — Source de vérité = BQ, pas les fichiers/runs précédents (anti reverse-engineering / effet mémoire)

```
La BQ est la source de vérité du WORKFLOW (corrigée, canonique) — PAS les fichiers ni les runs précédents.
Avant d'agir : lire la BQ gouvernante et exécuter DEPUIS sa checklist / ses étapes.

INTERDIT pour déterminer QUOI faire :
  (1) lire le source d'un script pour « comprendre le workflow » — un script EXÉCUTE la doctrine, il ne la définit pas ;
  (2) deviner le schéma DB via sqlite_master → lire BQ #57 (architecture) ;
  (3) calquer une fiche / session précédente (template d'un run passé).

POURQUOI : ces artefacts portent des bugs souvent DÉJÀ corrigés ; les répliquer = EFFET MÉMOIRE qui ressuscite des correctifs perdus.
Cas réel 2026-06-06 : fiche #248 calquée sur #247 → a hérité des MÊMES lacunes (#155, liens trans-fiches manqués) que BQ #147 spécifie pourtant.

Si la BQ n'explique pas un point requis → l'AJOUTER (réflexe config.claude_rules ou entrée tools/bq/*.md) — jamais improviser depuis les fichiers.
Reverse-engineering du code admis UNIQUEMENT pour debugger une vraie erreur, BQ lue d'abord.
```

### `cloture_pending_recap` — Reflexe doctrine : pending session_recap obligatoire avant session_end.py (BQ #119). Garde-fou ajoute 2026-04-30 dans session_end.py.

```
# Cloture session : pending session_recap OBLIGATOIRE avant session_end.py

**Reflexe non negociable** — avant de lancer `python3 tools/admin/session_end.py`,
ECRIRE le pending session_recap :

```
jmj/.pending_session_recap.md
```

Format : YAML frontmatter + body markdown (cf. BQ #119 pour le format exact).

**Pourquoi** : `session_end.py` est idempotent. S'il trouve un session_recap pour la
date du jour mais pas de pending file, il SKIP silencieusement l'etape (cas d'une
relance apres cloture interrompue). Ce skip est trompeur si du travail metier a ete
fait depuis le dernier recap.

**Garde-fou ajoute 2026-04-30** : `session_end.py` refuse desormais le skip si des
commits metier (hors `session_end : ...`) ont ete pousses depuis le `ts_end` du
dernier `maintenance_sessions`. Mais cette protection est un filet de securite —
le reflexe doctrinaire reste : ECRIRE le recap AVANT.

**Triggers obligatoires** — Claude redige le pending recap AVANT `session_end.py` quand :
  - la session a produit > 3 commits sur main
  - la session a touche au schema DB (ALTER TABLE, nouvelles tables)
  - la session a modifie des scripts ou de la doctrine BQ
  - la session a cree ou refondu des fiches/cards/chains
  - JMJ a explicitement demande la cloture

**Anti-pattern detecte 2026-04-30** : refonte massive de 26 fiches + creation de 5
nouvelles fiches close sans pending recap. JMJ a du le rappeler. Cause : asymetrie
d'attention en fin de session, skip silencieux trompeur.

**Workflow correct** :
  1. Travail metier de la session (commits multiples sur main)
  2. AVANT cloture : rediger `jmj/.pending_session_recap.md`
  3. `python3 tools/admin/session_end.py --db sol_vivant.db`
  4. Le script consomme le pending file -> insert audit_reports + maintenance_sessions
  5. Commit des regenerations + push

Voir BQ #119 (cle session) pour le format complet du pending recap.

## Synthèse réflexive — bloc OBLIGATOIRE du recap (2026-06-01)

Le body du recap inclut TOUJOURS une synthèse réflexive en 4 sections :
- Frictions (ou Claude s'est trompe pendant la session + cause)
- Anomalies (incoherences du corpus revelees)
- Ce que j'ai compris (doctrine internalisee, mots propres)
- Reflexes (a faire differemment la prochaine fois)

But : capitaliser sur les frictions pour ne pas les reproduire.
Modele : jmj/rapports/synthese/synthese_session_2026-06-01_frictions_apprentissages.md
```

### `environnement_web` — Env web : sqlite3 CLI absent -> python3 / bq_query.py (jamais sqlite3 shell)

```
Conteneur ephemere ; `requirements.txt` pas joue d'office -> `pip install -r requirements.txt` si un import manque. Seul piege env VERIFIE : le binaire `sqlite3` CLI est absent -> requetes DB via le module python / `bq_query.py`, jamais `sqlite3 db "..."`. Doctrine : BQ `environnement_pas_de_binaire_sqlite3_utiliser_pyth`. (Le "masquage de python-docx par le dossier docx/" est un faux probleme, verifie 2026-05-31.)
```

### `fiche_docx_production` — Docx fiches : zero meta-vocab, structure plate H1 (pas de H2 impose), graines ~600 chars, 5-8k total

```
Reflexe : production docx fiches -> zero meta-vocab, structure PLATE (titres H1, pas de H2 impose), graines ~600 chars/section, 5-8k chars total (zoom tres sous-sectionne peut monter, jamais >=12k). Citations (Auteur, annee) INLINE au mot pres (#146.7), puisees dans les source_usages ventiles par section ; PAS de gabarit « Mecanismes: »/« Termes: » (termes integres au texte, #146.6). gen_fiche_docx : bloc References dedoublonne par oeuvre, lignes recap auto supprimees. REDO d'une fiche integree = regenerer une graine corpus-aware re-sourcee sans toucher l'integre affiche (modeles #84 trophobiose, #219 AGCC). Redaction = Claude direct, jamais d'agent. Doctrine complete : BQ `wf_fiche_production` (fait foi).
```

### `fichiers_jmj_sur_github` — Fichiers poussés par JMJ = sur origin (GitHub), JAMAIS dans le conteneur local. Réflexe : git fetch origin + inspecter origin/main (git log/diff), pas de recherche locale d'abord.

```
## Les fichiers poussés par JMJ sont sur GitHub, pas en local

JMJ développe sur sa machine et **pousse sur le remote** (origin / GitHub). Il **ne peut pas** déposer un fichier dans le conteneur éphémère de Claude. Donc tout fichier qu'il annonce (« j'ai poussé le docx / la liste / le retour Jenni… ») est un **commit sur origin**, le plus souvent sur `origin/main`.

**Réflexe obligatoire** : `git fetch origin` puis inspecter `origin/main` (`git log --oneline origin/main`, `git diff --stat <base>..origin/main`) — ou relancer `session_start.py` qui resynchronise `main` sur `origin/main`. **Ne jamais** chercher d'abord dans le filesystem local du conteneur, ni conclure « fichier introuvable » sans avoir fetché origin au préalable.
```

### `integration_reponse_sourcage` — Intégration d'une réponse de sourçage Jenni (refs -> corpus, pendant de l'intégration fiche). Cf. BQ #160.

```
Réponse Jenni à une question/validation de SOURÇAGE (docx prose + biblio en fin) -> NE PAS utiliser integrate_source.py (1 source) ni intégrer à la main. Pipeline dédié : tools/jenni/integrate_validation_refs.py --validation <slug> --docx docx/<reponse>.docx (dry-run, puis --apply) : extrait les refs, dédup contre jenni_sources, rattache aux prompts_cibles de la validation, clôt la validation (integre). PUIS conscient : harmoniser les valeurs SI le doc cible a du contenu rédigé ; sinon (graines) c'est un pré-sourçage = rien à harmoniser. Format Jenni : biblio toujours en fin (JenniRefBody), citations inline (Auteur, Année) en hyperliens dummy-citation à nettoyer (parse_docx gère). Doctrine complète : BQ #160 integration_reponse_sourcage_refs.
```

### `metaanalyse_croise_sourcages` — Méta-analyse fiche : croiser les mécanismes des réponses de sourçage (volet H audit croisé) — ne pas perdre la matière non captée en DB

```
Méta-analyse d'intégration de fiche (audit croisé) -> VOLET H obligatoire : croiser les MÉCANISMES décrits dans les réponses aux questions de sourçage (validations statut=integre). Depuis 2026-06-02, integrate_validation_refs CAPTE la prose-réponse dans validation_contenus.contenu_brut (requêtable) : SELECT contenu_brut FROM validation_contenus WHERE validation_id IN (...). Exception : les sourçages intégrés AVANT le correctif (faune #15) n'ont que les refs en DB -> prose dans docx/archives/QS-*.docx + validation_sections. Action volet H : (1) recenser les sourçages intégrés recoupant la fiche ; (2) croiser explicitement les mécanismes (lien réel, sinon le noter) ; (3) signaler les croisements À VENIR (sourçages en_cours que la fiche nourrira). Demande JMJ 2026-06-02 : « il serait dommage de perdre cette matière ». Doctrine : BQ wf_fiche_integration volet H.
```

### `parser_docx_omath` — Parseur docx doit extraire oMath (formules chimiques Jenni)

```
# Parseur docx Jenni — formules OMML à extraire (règle critique)

**Jenni écrit TOUTES les formules chimiques/indices/exposants en Office Math ML** (`<m:oMath>` dans le XML Word) : `NH₃`, `CO₂`, `Fe²⁺`, `k₁`, `ΔG`, `NO₃⁻`, etc.

**`python-docx` ignore les oMath** → les formules sont perdues, remplacées par `(...)` vides.

**Tout script lisant un docx Jenni DOIT utiliser un parseur XML custom** qui :
- Parse `word/document.xml` directement
- Extrait `<m:oMath>` et convertit en Unicode (sub/sup)
- Skip les `<w:t>` fallback à l'intérieur des oMath

Implémenté dans `tools/jenni/import_termes_jenni.py::parse_docx()` depuis 2026-04-20.

Voir BQ #137 (claude/parse_docx_omath) pour les détails.

**Vérification post-import** :
```python
SELECT id, fr, definition FROM terms
WHERE definition GLOB '*(*)*'
  AND definition LIKE '%()%';
```
Si résultats non vides → parseur défaillant ou bug Jenni.
```

### `pas_agent_redacteur` — Redaction editoriale du corpus = JMJ + Claude (sur demande directe) + Jenni UNIQUEMENT

```
Reflexe : la redaction editoriale (definitions, synonymes, fiches, cards, amorces) = JMJ + Claude (sur demande explicite) + Jenni. Agents Task INTERDITS pour rediger ; autorises pour classer/extraire/auditer. Doctrine complete : BQ `pas_agent_redacteur` (fait foi).
```

### `pas_modif_fr_canonique` — Ne JAMAIS modifier le fr canonique d'un terme (cle d'aller-retour Jenni)

```
Reflexe : `terms.fr` est la cle editoriale d'aller-retour Jenni -> aucune normalisation auto (casse, ponctuation, espaces). BT/NT/RT -> `term_relations`, jamais en colonnes `terms`. Doctrine complete : BQ `pas_modif_fr_canonique` (fait foi).
```

### `pratiques_typees_hors_jenni` — Pratiques typees (KNF/JADAM/EM/LiFoFer) hors-perimetre Jenni - angle mecanisme

```
Reflexe : les pratiques typees (KNF, JADAM, EM/Bokashi, LiFoFer) sont hors-perimetre Jenni -> redaction JMJ/Claude depuis PDF, angle MECANISME generique > recette ; `flag_pratique_typee=1` exclut des exports. Doctrine complete : BQ `pratiques_typees_hors_jenni` (fait foi).
```

### `redaction_documents_jenni` — Doctrine UNIQUE de toute rédaction Jenni (#146) — À ACTIVER avant de produire tout doc Jenni (fiche, graine, validation, question) ; produire depuis la doctrine, jamais copier un output

```
Un seul texte de référence pour TOUTE rédaction destinée à Jenni,
valable pour tous les types de documents (prompt strate, fiche, graine,
validation, thésaurus, question de sourçage, docx de reprise).
Référence complète : BQ #146 « Règles de rédaction des documents Jenni ».

═══ ACTIVATION OBLIGATOIRE ═══
Claude LIT et APPLIQUE cette doctrine AVANT de produire ou éditer le moindre
document destiné à Jenni. Déclencheurs :
  • fiche / graine (gen_fiche_docx)
  • validation / renforcement / comblement
  • question de sourçage (docx chargeable dans Jenni → recherches/questions/)
  • prompt de strate, liste thésaurus, docx de reprise
Produire DEPUIS la doctrine — JAMAIS rétro-concevoir le format en imitant un
output déjà produit (un artefact n'est pas la doctrine ; au mieux un masque).

12 règles (BQ #146) :
  1. Le document = le document lui-même (pas de métaphrases, pas de [à compléter])
  2. Proposition = état du corpus à l'instant t (prose continue)
  3. Contenu issu du corpus uniquement
  4. ZÉRO méta-vocab (pas de card/fiche/chaîne/doc X, pas de corpus/strate/thésaurus)
  5. Structure Word native (Title + H1/H2/H3 max, pas de déco ASCII)
  6. Termes canoniques INTÉGRÉS dans le texte (jamais en liste séparée)
  7. Citations APA inline + biblio DOI/URL
  8. Bloc de 10 max pour listes d'items
  9. Listes triées lower(fr)
  10. Pas de conseils rédactionnels redondants
  11. Refs et sources = cadre de vérification (pas d'invention)
  12. Cycle itératif Claude → Jenni → JMJ (proposition, pas vérité finale)

Vérif AVANT tout commit : scan regex FORBIDDEN (règle #4). Le hook pre-commit
check_forbidden_jenni.py est le filet automatique.

Justification (session 2026-06-02) : pour sourcer la faune du sol, Claude a
enchaîné 3 formats faux (md ad hoc plein de méta-vocab → .txt validation
surchargé avec dump de termes → copie de l'output question_carbone) avant de
lire cette doctrine. Cause racine : doctrine non activée au moment de produire.
D'où ce déclencheur.
```

### `wal_checkpoint` — DB en mode WAL : PRAGMA wal_checkpoint(TRUNCATE) AVANT chaque git add sol_vivant.db (sinon perte silencieuse au reset)

```
sol_vivant.db est en mode WAL (propriete persistante du fichier, pas du code). Une ecriture peut rester dans sol_vivant.db-wal, INVISIBLE de git : le fichier .db principal reste byte-identique a HEAD (git add committe une DB perimee), puis l'ecriture est PERDUE au prochain session_start (reset --hard). Cause racine PROBABLE du symptome historique 'le travail de Claude n'est jamais le meme d'une session a l'autre' (bug 68a36486, 2026-06-02 : session_end lui-meme en a ete victime). Parade : PRAGMA wal_checkpoint(TRUNCATE) AVANT chaque git add sol_vivant.db (flushe puis vide le -wal). session_end.py le fait a l'etape 5 ; pour un commit manuel en cours de session, checkpoint d'abord. Verif : `ls -la sol_vivant.db-wal` a 0 octet.
```

### `web_nav_ancres` — Deep-link #card-N/#fiche-N : émetteur (CardLink/refs/pedago_links) ET cible (lecture hash + ouverture conteneur + scrollIntoView + scrollMarginTop)

```
Navigation par ancres entre/dans les pages web — convention #card-N / #fiche-N.

PRINCIPE : toute entité du corpus exposée sur le site est adressable par une ancre
URL stable — concept_cards.html#card-<id>, cahier.html#fiche-<id>. Vaut pour les
liens INTER-pages (depuis une fiche/doc) ET INTRA-page (carte->carte).

CÔTÉ ÉMETTEUR (le lien) :
- SvRichText reconnaît « Card #N » / « Card "titre" » -> onCardRef, et « fiche N »
  -> lien cahier.html#fiche-N. CardLink (SvConceptCardList) route par le hash : donc
  toujours cliquable, même inter-dimensions (fini le texte gris mort hors-pool).
- Réutiliser pedago_links (entity<->card, générique fiche/doc/regle/terme/matiere)
  pour les blocs de liens. JAMAIS de table de relation dédiée : pedago_links existe.

CÔTÉ CIBLE (l'atterrissage) — SANS quoi le lien arrive MORT :
- La page DOIT lire window.location.hash au mount ET sur 'hashchange' (useEffect +
  addEventListener), OUVRIR le conteneur replié (dimension repliée / onglet / groupe
  de type) PUIS scrollIntoView après un petit setTimeout (le noeud React n'existe
  qu'une fois le conteneur ouvert).
- L'ancre porte id={'card-'+id} / id={'fiche-'+id} + style scrollMarginTop:'5rem'
  (le header collant ne doit pas masquer la cible).
- Neutraliser filtres/recherche actifs à l'arrivée par hash (sinon cible filtrée donc
  cachée).

PIÈGE VÉCU (2026-06-03) : la fonctionnalité existait à MOITIÉ — émetteurs câblés
(onCardRef cahier, blocs « Pour aller plus loin », 203 liens pedago vers #card-N)
mais concept_cards.html ne lisait jamais le hash -> tout arrivait mort, et 257/432
related_to inter-dimensions étaient non-cliquables. Toujours vérifier les DEUX côtés
(émetteur ET cible) d'un deep-link.
```

## Bibliothèque de Connaissances (BQ)

La BQ stocke les guides, conventions et retours d'expérience dans la table `bq_entries`, classés par **domaines techniques** (`domaines_techniques`) via la table de jointure `domaine_bq` (une entrée a 1 domaine primaire + 0-5 domaines de référence). Quatre catégories : pipeline | corpus | web | technique | specifique. La doctrine d'accès est « **recherche au fil de l'eau** » : on ne charge pas un bloc au démarrage, on cherche au moment où un doute émerge (voir règle `bq_access` ci-dessus).

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

*Ce document est regénéré automatiquement par `tools/docs/gen_readme.py` (cible `sessions`) depuis les tables `config` et `domaines_techniques`. Ne pas éditer à la main.*
