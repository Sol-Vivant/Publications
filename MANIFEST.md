# Sol Vivant Tools — Manifest

## Base de donnees
- `sol_vivant.db` — source de verite unique
- 56 tables, 10 vues, 42 scripts

## Scripts

| Script | Version | Dossier | Description |
|---|---|---|---|
| `regen_all.py` | v1.0 | `tools/` | Régénère tous les outputs depuis la DB (script unifié) |
| `sync_scripts.py` | v1.0 | `tools/` | Sync scripts DB ↔ fichiers. |
| `audit_opus.py` | v3.0 | `tools/admin/` | Audit Opus v3.1. |
| `bq_query.py` | v1.0 | `tools/admin/` | Consultation BQ on-demand — modules, recherche, filtres |
| `check_integrity.py` | v1.0 | `tools/admin/` | Validation intégrité DB (termes orphelins, FK, doublons) |
| `deploy_publications.py` | v1.0 | `tools/admin/` | Synchronise Publications/web/ vers ../Publications/ (dépôt GitHub Pages séparé) via rsync. |
| `explorer.py` | v1.0 | `tools/admin/` | Interface web locale pour consulter sol_vivant.db (tables, BQ, sessions) |
| `export_tools.py` | v1.5 | `tools/admin/` | Exporteur scripts v1.5. |
| `fix_titres.py` | v1.0 | `tools/admin/` | Correction titres jenni_doc_specs |
| `session_start.py` | v3.0 | `tools/admin/` | Contexte session v2.3. |
| `analyse_corpus.py` | v4.1 | `tools/batch/` | Analyse modulaire corpus v4.1. |
| `gen_archive.py` | v1.0 | `tools/docs/` | Génère une archive ZIP hors-ligne du site Sol Vivant (pages + vendor + images) |
| `gen_cahier.py` | v1.0 | `tools/docs/` | Cahier de Science — livre pédagogique multi-chapitres (MO/POM-MAOM, Textures, Fermentations) |
| `gen_explorer.py` | v1.0 | `tools/docs/` | Génération page Explorer DB statique |
| `gen_lifofer.py` | v1.0 | `tools/docs/` | Calculateur interactif LiFoFer v1 |
| `gen_mo_calc.py` | v1.0 | `tools/docs/` | Calculateur interactif Matière Organique — formule de Kirkby, mélanges, analyse sols. |
| `gen_readme.py` | v1.1 | `tools/docs/` | Génération dynamique de tous les README depuis la DB. |
| `gen_reports.py` | v1.0 | `tools/docs/` | Génère les rapports d'audit depuis audit_reports → jmj/analyses/reports/ |
| `gen_technique.py` | v1.0 | `tools/docs/` | Guide Technique (Publications/technique/index.html) — architecture, méthode, portabilité du patron. |
| `gen_triangle_textures.py` | v2.0 | `tools/docs/` | Triangle des textures interactif — classification USDA des sols. |
| `gen_web.py` | v2.2 | `tools/docs/` | Cartographie React interactive v1.1 (web public). |
| `gen_workflows.py` | v2.0 | `tools/docs/` | Génération des workflows horodatés par module. |
| `export_fiche.py` | v1.0 | `tools/jenni/` | Export prompts fiches transversales depuis la DB. |
| `export_jenni_doc.py` | v3.1 | `tools/jenni/` | Génération prompts Jenni v3.1. |
| `export_validation.py` | v1.0 | `tools/jenni/` | Génération des prompts de validations depuis validation_sections. |
| `gen_prompt_completion.py` | v1.0 | `tools/jenni/` | Génère un prompt Jenni pour compléter les champs manquants (BT, RT, SYN_FR, SYN_EN) de termes déjà existants dans le thésaurus. |
| `gen_prompt_enrichissement.py` | v1.0 | `tools/jenni/` | Génère un prompt Jenni d'enrichissement thésaurus depuis liste/JSON/final_consolide (filtres criticité, strate, doc_cible) |
| `gen_prompt_thesaurus.py` | v1.0 | `tools/jenni/` | Génère un prompt Jenni UNIFIÉ par strate (nouveaux termes + termes à compléter en un seul fichier). |
| `import_enrichissement.py` | v1.0 | `tools/jenni/` | Import semi-auto réponses Jenni (parse→preview→insert avec --confirm) |
| `integrate_fiche_retour.py` | v1.0 | `tools/jenni/` | Intègre un retour Jenni (docx) dans fiche_section_h2_notes — parse H2, extrait citations [N] et termes candidats |
| `reformat_fiches_ris.py` | v1.0 | `tools/jenni/` | Reformate les citations Auteur-année des fiches historiques au format [N] en matchant contre biblio_norm.ris (source unique Zotero) |
| `agent_runner.py` | v1.0 | `tools/lib/` | Pattern préparateur → agents Task → consolidateur. |
| `cli.py` | v1.0 | `tools/lib/` | Helpers CLI partagés (add_db_arg, check_db) |
| `config.py` | v1.0 | `tools/lib/` | Accès centralisé à la table config (get, get_json) |
| `db.py` | v1.0 | `tools/lib/` | Connexion DB centralisée (get_connection) |
| `jenni_format.py` | v1.0 | `tools/lib/` | Formatage des prompts Jenni (markdown, sections) |
| `pub_path.py` | v1.0 | `tools/lib/` | Chemins de publication (Publications/web/, Publications/cartographie/) |
| `repair_json.py` | v1.0 | `tools/lib/` | Module partagé : repair_json() — réparation JSON tronqué/malformé des réponses LLM. |
| `web_template.py` | v1.0 | `tools/lib/` | Template HTML partagé — charte Sol Vivant, render_page, OG tags |
| `attribution.py` | v4.0 | `tools/zotero/` | Attribution Zotero v4.1. |
| `normalise_ris.py` | v2.0 | `tools/zotero/` | Normalisation RIS v2.0. |
| `validate_ris.py` | v2.0 | `tools/zotero/` | Validation RIS v2.1. |

## Arborescence

```
projet/
├── sol_vivant.db
├── CLAUDE.md              # contexte persistent Claude Code
├── MANIFEST.md            # ce fichier
├── tools/
│   ├── sync_scripts.py
│   ├── admin/                  audit_opus, bq_query, check_integrity, deploy_publications, explorer, export_tools, fix_titres, session_start
│   ├── batch/                  analyse_corpus
│   ├── docs/                   gen_archive, gen_cahier, gen_explorer, gen_lifofer, gen_mo_calc, gen_readme, gen_reports, gen_technique, gen_triangle_textures, gen_web, gen_workflows
│   ├── jenni/                  export_fiche, export_jenni_doc, export_validation, gen_prompt_completion, gen_prompt_enrichissement, gen_prompt_thesaurus, import_enrichissement, integrate_fiche_retour, reformat_fiches_ris
│   ├── lib/                    agent_runner, cli, config, db, jenni_format, pub_path, repair_json, web_template
│   ├── zotero/                 attribution, normalise_ris, validate_ris
├── docx/                      Documents .docx et .ris
├── jmj/                       Documents de travail
└── Publications/
    └── web/                   Pages HTML générées
        ├── index.html         Cartographie interactive
        ├── mo_calculateur.html
        ├── lifofer.html
        ├── triangle_textures.html
        ├── vendor/            React, Babel, Tailwind (hors-ligne)
        └── img/               Images OG et previews
```

## Pages web interactives

6 pages, 31 templates (1 partagés), vendor local (hors-ligne).

| Page | Slug | Fichier |
|------|------|---------|
| Cahier de Science | `cahier` | `cahier.html` |
| Concept Cards | `concept_cards` | `concept_cards.html` |
| Cartographie interactive | `index` | `index.html` |
| Calculateur LiFoFer | `lifofer` | `lifofer.html` |
| Calculateur Matière Organique | `mo_calculateur` | `mo_calculateur.html` |
| Triangle des Textures GEPPA | `triangle_textures` | `triangle_textures.html` |

Déploiement : `rsync -av Publications/web/ /Publications/` → GitHub Pages

Archive hors-ligne : `python3 tools/docs/gen_archive.py --db sol_vivant.db`

## Commandes rapides

```bash
# Sync scripts
python3 tools/sync_scripts.py --db sol_vivant.db --extract
python3 tools/sync_scripts.py --db sol_vivant.db --inject
python3 tools/sync_scripts.py --db sol_vivant.db --diff

# Pages web
python3 tools/docs/gen_web.py --db sol_vivant.db
python3 tools/docs/gen_mo_calc.py --db sol_vivant.db
python3 tools/docs/gen_lifofer.py --db sol_vivant.db
python3 tools/docs/gen_triangle_textures.py --db sol_vivant.db
python3 tools/docs/gen_archive.py --db sol_vivant.db --regenerate

# Documentation
python3 tools/docs/gen_readme.py --db sol_vivant.db

# Prompts Jenni
python3 tools/jenni/export_jenni_doc.py --db sol_vivant.db --doc S2
python3 tools/jenni/export_jenni_doc.py --db sol_vivant.db --all

# Pipeline Zotero
python3 tools/zotero/normalise_ris.py --db sol_vivant.db --input biblio.ris --output biblio_norm.ris
python3 tools/zotero/attribution.py --input biblio.json --db sol_vivant.db --output biblio_tagged.ris
python3 tools/zotero/validate_ris.py --input biblio_tagged.ris --db sol_vivant.db

# Audit
python3 tools/admin/audit_opus.py --db sol_vivant.db --dry-run
python3 tools/admin/session_start.py --db sol_vivant.db
```

Les scripts d'inférence (`attribution.py`, `analyse_corpus.py`, `audit_opus.py`) suivent le workflow en 3 phases via `agent_runner.py` : `--prepare` → agents Task dans une session Claude Code → `--consolidate`. Plus d'API Anthropic externe depuis v4.
