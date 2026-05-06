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

**Règles actuellement en base (14)** :

### `agent_runner_reflexe` — Rappel systematique : utiliser agent_runner plutot que spawning d agents un a un.

```
# Reflexe agent_runner — pour N items LLM independants

Quand une tache repetitive porte sur N items independants (analyse de
fiches, audit, attribution sources, validation RIS, extraction sources),
**ne jamais lancer les agents Task un par un**. Utiliser le pattern
`tools/lib/agent_runner.py` en 3 phases :

  1. Script `--prepare` -> batches/<cid>.json + state.json + README
  2. Claude Code lance les agents Task dans **un seul message**
     (plusieurs Agent() calls en parallele) -> responses/<cid>.json
  3. Script `--consolidate` -> ingere responses/ en DB ou artefact

Declencheurs obligatoires : N > 5 items similaires, reprise souhaitable,
resultat trop volumineux pour le contexte.

Exemples : audit_opus, attribution, analyse_corpus, analyse_fiches.
Doctrine complete : `bq_query.py --search "strategie_agents"` (BQ #132).
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

### `archivage_fiches` — Archivage auto docx + prompts post-intégration pour fiches

```
# Archivage automatique des fichiers sources post-intégration

**Règle absolue** — dès qu'une fiche passe en statut `integre` ou `integre_partiel`, les fichiers sources associés DOIVENT être déplacés dans leurs dossiers `archives/` respectifs :

1. **Docx source (retour Jenni)** : `docx/<name>.docx` → `docx/archives/<name>.docx`
2. **Prompts générés** : `recherches/fiches/prompt_fiche_*_<slug>_*.docx` → `recherches/fiches/archives/...`

**Raison** : sans archivage automatique, `docx/` et `recherches/fiches/` accumulent les fichiers traités, on ne distingue plus ce qui est actif vs ce qui est fait. Obligation d'archiver en fin de session ce qui aurait dû l'être au fil de l'eau.

**Implémentation** :
- `tools/admin/integrate_fiche_docx.py::archive_fiche_files()` — appelée automatiquement à la fin de `apply_integration()` après `con.commit()`.
- Idempotente (re-passe sans écrasement).
- Journalisée dans `audit_log` (operation='ARCHIVE', table='files').

**Pour les scripts ad-hoc (intégrations en direct par Claude)** : TOUJOURS importer et appeler `archive_fiche_files(fiche, docx_path)` à la fin du script d'intégration. La règle s'applique à tous les pipelines, pas seulement au script canonique.
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

### `audit_reflex` — audit_reflex

```
# Réflexe audit régulier — thésaurus + corpus + intégrité DB

Toutes les 3-5 sessions, ou systématiquement avant un consolidé éditorial
majeur (publication, revue, cycle d'envoi Jenni > 50 termes), lancer le
triptyque d'audit :

1. **`check_integrity.py`** — sanity check technique (FK, doublons schema)
   → BQ #74 audit_integrite_db
2. **Audit thésaurus** (passes T1/T2/B1/A1/M1) → BQ audit_thesaurus
   → axes A (nouveaux candidats), B (incomplets), C (relations cassées),
     D (doublons latents), E (méta-vocab), F (pseudoscience), G (anglicismes
     en strate FR), H (couverture)
3. **Audit corpus** (passes S1/S2/C1/C2/K1/K2/B1) → BQ audit_corpus
   → axes C1-C3 (chaînes), K1-K4 (cards comme outil d'audit), F1-F4 (fiches)

Déclencheurs immédiats :
- Après import thésaurus massif → re-passe T2 + relations
- Après intégration de fiche → mini-audit phase 4bis (BQ #147)
- Après refonte d'une chaîne → C1 + C2 + K2
- Avant publication / regen_all → check_integrity strict

Pattern agent_runner obligatoire pour passes lourdes (T1, S1, K2) avec
écriture progressive et split par strate (anti-timeout BQ #132 + #140).

Sortie : rapports `jmj/rapports/audit/audit_{thesaurus,corpus}_<date>.md`
+ section synthèse "actions priorisées (top 10)".
```

### `audit_status_lecture` — Doctrine de lecture des audits : status non-ok = suspect par défaut, ne pas dire « tout va bien »

```
# Lecture du status des audits — doctrine anti-rassurisme

**Règle absolue** — un audit qui ne tourne pas ou qui est `degraded`/`failed`
n'est PAS un succès. Le bon prior est « suspect tant que prouvé non-suspect ».

## Status à lire (audit_meta.py + session_start.py)

- **`ok`** : audit a tourné, toutes les assertions passent → OK
- **`degraded`** : assertions important/souhaitable/info en échec, 0 critique →
  signale qu'il y a quelque chose à regarder, même si ce n'est pas bloquant
- **`failed`** : erreurs d'exécution OU au moins 1 assertion critique en échec
  → bloquant, à corriger AVANT toute autre action métier
- **`missing`** : pas de `_latest.json` du tout → l'audit n'a jamais tourné
  ou il a été supprimé → bloquant équivalent
- **`stale`** : audit `ok` mais trop ancien (au-delà de `--max-age-hours`) →
  status `ok` non significatif, à relancer

## Anti-pattern silence-fail

Avant Phase D, `enrich_thesaurus.py --audit` plantait silencieusement
depuis la migration `terms.bt` v1→v2. Les sessions précédentes ont
déclaré le BT « réglé » via d'autres canaux sans s'apercevoir que
l'outil de monitoring lui-même était cassé. Cas concret de silence-fail
qui motive l'introduction du module `tools/lib/audit_report.py`.

## Comportement attendu de Claude

- À chaque démarrage de session, **lire la section ÉTAT DES AUDITS** du
  dashboard `session_start.py`. Si `degraded`/`failed`/`missing`/`stale`,
  signaler explicitement à JMJ AVANT d'attaquer le travail métier.
- Ne **jamais** dire « tout va bien » si un audit est non-`ok`. Toujours
  qualifier : « degraded sur audit_X, voici les assertions en échec : ... ».
- Si Claude exécute un audit lui-même pendant une session, **lire le
  rapport JSON** produit (`audit_reports/json/<script>_latest.json`),
  pas seulement la sortie texte (qui peut être tronquée ou trompeuse).
- Si un script d'audit plante, ne pas le silencier — capturer dans
  `errors[]` via le module `audit_report.AuditReport` (pattern context
  manager ou try/except explicite) et faire passer le status à `failed`.

## Pipeline canonique

```
tools/lib/audit_report.py      # module pivot (AuditReport)
tools/admin/check_integrity.py # premier pilote refactoré
tools/admin/audit_meta.py      # méta-audit (lit tous les _latest.json)
session_start.py               # affiche ÉTAT DES AUDITS
```

Audits attendus (cf. `EXPECTED_AUDITS` dans `audit_meta.py`) :
- check_integrity, check_forbidden_jenni, audit_sources_orphelines,
  audit_anglicismes, audit_fiches, enrich_thesaurus_audit, audit_opus
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
```

### `fiche_docx_production` — Regles de production du .docx pour fiches (evite repetitions session apres session)

```
Production docx fiches (rappels pratiques) :

1. AUCUNE consigne dans le docx — pas de "Dimensions attendues", pas de "Jenni rédige...", pas de "[à compléter]". Seulement du contenu (même amorce).
2. AMORCES EN TEXTE NORMAL (pas d'italique gris) — l'amorce est du CONTENU incomplet de document, pas une note editoriale. Les refs inline doivent rester lisibles.
3. ACCENTS francais corrects partout — jamais d'ascii dépouillé. évolution, écologie, é/è/ê/à.
4. TERMES CANONIQUES dans le texte avec EN entre parenthèses à la 1re mention. Pas de tableau final.
5. TITLE court sans accent (Jenni l'utilise comme nom de fichier).
6. REFS INLINE (Auteur, année) + section 'Références' en fin, format APA, une par paragraphe, tri alpha. CHAQUE REF DOIT AVOIR DOI ET/OU URL (resoluble). Si DOI seul : https://doi.org/<doi> est utilise. Si les deux differents : afficher les deux. Alerte script si ref sans lien. Meme pattern que Jenni.
7. PAS DE DECORATION ASCII (---, ===, banderoles).
8. Le docx = état du document, pas discussion avec Jenni.

9. SECTIONS BODY EN H1 NUMÉROTÉES (`1.`, `2.`, ...). Introduction et Résumé sans numéro. Sous-sections H2 (`1.1.`, `1.2.`...) si justifié (plusieurs sous-thèmes distincts, comparaison structurée, volume dense) — pas systématique. H3 max. Numérotation portée par les titres DB (fiche_sections.titre), pas ajoutée par le script.

Voir BQ #130 wf_fiche pour détails.
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

### `pas_agent_redacteur` — Pas d'agents redacteurs - rediction c'est JMJ/Claude/Jenni uniquement

```
# Pas d'agents rédacteurs — la rédaction c'est JMJ + Claude + Jenni

**Règle absolue** — la rédaction de contenu éditorial du corpus est STRICTEMENT limitée à :
- **Jenni** (workflow docx : prompt → Jenni rédige → retour docx → import contrôlé)
- **JMJ** (directement)
- **Claude** (moi) SEULEMENT quand JMJ me le demande explicitement en direct

**Sont interdits** :
- Lancer un agent Task pour rédiger définitions, synonymes, contenus de fiches, contenus de prompts, descriptions de concept_cards, contenus BQ ou tout autre contenu éditorial du corpus
- Demander à un agent de "produire des définitions courtes", "rédiger une synthèse", "écrire une amorce"
- Inventer des définitions ou contenus sans base docx/prompt Jenni ou indication explicite de JMJ

**Sont autorisés pour les agents Task** :
- Classification, extraction, analyse (ex: normaliser la casse, détecter des orphelins, trier des termes)
- Recherche dans le code ou la DB
- Parsing/formatage de données existantes
- Audit/comparaison

**Workflow correct pour créer un terme** :
1. Identifier le besoin (ex: hyperonyme manquant, terme orphelin à raccrocher)
2. Écrire le nom du terme dans une liste à passer par Jenni
3. Exporter via `export_thesaurus_incomplets.py` ou `gen_prompt_thesaurus.py`
4. Jenni rédige la définition
5. Réimport via `import_termes_jenni.py --replace`

**Justification** : JMJ passe des heures à faire rédiger Jenni avec soin. Toute définition Claude-made sabote ce travail et pollue le thésaurus avec du contenu non validé. Violation détectée 2026-04-20 (14 termes créés avec def Claude en commit af35413 — supprimés et à refaire via Jenni).
```

### `pas_modif_fr_canonique` — Ne pas modifier automatiquement le fr canonique (cycle Jenni)

```
# Ne pas modifier le libelle fr canonique d'un terme (regle absolue)

Le champ `terms.fr` est la CLE editoriale qui fait l'aller-retour avec Jenni.
Toute modification automatique (casse, ponctuation, espaces) cree un cycle vicieux :

1. Export : Jenni recoit la version modifiee
2. Retour Jenni : docx a la version modifiee (Jenni recopie verbatim)
3. Reimport : DB reste avec la version modifiee
4. Perte definitive de la forme d'origine

**INTERDIT** :
- Scripts de normalisation automatique de casse/ponctuation sur le `fr`
- Agents Task qui DECIDENT d'un changement de libelle (classification OK, modification NON)
- Regles typographiques abstraites (francais, ISO) appliquees au `fr` existant

**AUTORISE** :
- Modifications ciblees d'UN terme apres validation explicite JMJ
- Normalisations dans les champs secondaires (definition, syn_*, bt, rt)
- Parser math-aware pour preserver les formules OMML

**Incident 2026-04-20** : Chantier A (commit 5970137) avait baisse la Maj
initiale de 216 termes (Antifragilite, Biofilms, Bioturbation...). Corrige
commit 86408df. Cette erreur NE DOIT JAMAIS se reproduire.

Voir BQ #138 (claude/pas_modif_fr_canonique) pour les details.
```

### `pratiques_typees_hors_jenni` — pratiques_typees_hors_jenni

```
# Pratiques naturelles typees hors-perimetre Jenni (BQ #158)

Le corpus documente des **mecanismes scientifiques generiques**, pas des **recettes praticiennes**.

## Liste pratiques typees (hors-Jenni)

- KNF (Cho Han Kyu) : IMO, FAA, FPJ, FFJ, OHN, BRV, LAB, WCA, WCP, BIO-9, SA-N
- JADAM (Cho Youngsang) : JMS, JLF, JNP
- EM-Higa / Bokashi
- LiFoFer (Lithuanian Forest Fermentation)
- Ferments traditionnels (kefir, kimchi, choucroute, ensilage)
- Biofertilisants paysans sud-americains

## Workflow obligatoire

- Sources : PDFs jmj/pdf/ (Cho Han Kyu, Cho Youngsang, manuels praticiens)
- Redaction : JMJ ou Claude (extraction PDF) - JAMAIS Jenni
- Angle : MECANISME generique > recette typee
  - Ex. fiche "Fermentation lactique" qui mentionne KNF-LAB, LiFoFer, kefir comme instances
  - Pas de fiche "LAB-KNF" ni "JMS"
- Acronymes-recettes : en clair dans cards/fiches, pas indexes au thesaurus

## Garde-fous techniques

- Table terms : flag_pratique_typee=1 exclut des exports Jenni
  (enrich_thesaurus.py, gen_prompt_completion.py, export_thesaurus_incomplets.py)
- Gate integration (integrate_fiche.py) :
  - PSEUDOSCIENCE (biodynamie/anthroposophie/BD500-507) = violation CRITIQUE
    non bypassable meme avec --partial -> JMJ rejette ou reedite
  - RECETTE_TYPEE (FAA/FPJ/JMS/JLF/OHN/BRV/WCA/WCP/BIO-9/JADAM/KNF) = warning
    -> JMJ arbitre (mention contextualisee OK, sinon reediter)
  - STEINER_MENTION (Steiner hors Steinernema) = warning -> JMJ arbitre

## Mode degrade existant

Les fiches DIY actuelles integrees AVANT cette doctrine restent en l'etat.
A revoir lors d'une session dediee a partir des documents officiels :
- KNF : KNF - chos-global-natural-farming-sarra.pdf, KNF - Dr Hoon Park III - IMO.pdf
- JADAM : youngsang-cho-jadam-organic-farming-2016-1.pdf
- LiFoFer : guide-lff-2018.pdf, Lifofer_10.12.2024_Rezomes(5).pdf
- EM/Bokashi : Agriton EM Fermentation, Bokashi 3 years, em-cuba.pdf
```

### `redaction_documents_jenni` — redaction_documents_jenni

```
Un seul texte de référence pour TOUTE rédaction destinée à Jenni,
valable pour tous les types de documents (prompt strate, fiche, validation,
thésaurus, docx de reprise). Consulter BQ #146 « Règles de rédaction des
documents Jenni — référence unique ».

12 règles couvertes :
  1. Le document = le document lui-même (pas de métaphrases, pas de [à compléter])
  2. La proposition = état du corpus à l'instant t (prose continue, pas d'italique brouillon)
  3. Contenu issu du corpus uniquement (pas de sources externes non sourcées)
  4. **Zéro méta-vocab** (pas de card/fiche/chaîne/doc X, pas de corpus/strate/thésaurus)
  5. Structure Word native (Title + H1/H2/H3 max, pas de décoration ASCII)
  6. Termes canoniques intégrés dans le texte (pas en liste séparée)
  7. Citations APA inline + biblio DOI/URL (format Google Doc cross-refs)
  8. Bloc de 10 max pour listes d'items
  9. Listes triées `lower(fr)`
  10. Pas de conseils rédactionnels redondants
  11. Refs et sources — cadre de vérification (pas d'invention)
  12. Cycle itératif Claude → Jenni → JMJ (proposition, pas vérité finale)

Vérif avant tout commit : scan regex FORBIDDEN (cf. règle #4 dans la BQ).
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

# Regénérer CLAUDE.md depuis la DB
python3 tools/admin/session_start.py --db sol_vivant.db --claude-md

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
