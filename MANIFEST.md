# Sol Vivant Tools — Manifest

## Base de donnees
- `sol_vivant.db` — source de verite unique
- 59 tables, 7 vues, 50 scripts

## Scripts

| Script | Version | Dossier | Description |
|---|---|---|---|
| `regen_all.py` | v1.0 | `tools/` | Régénère tous les outputs depuis la DB (script unifié) |
| `sync_scripts.py` | v1.0 | `tools/` | Sync scripts DB ↔ fichiers. |
| `audit_opus.py` | v3.0 | `tools/admin/` | Audit Opus v3.1. |
| `backfill_biblio.py` | v1.0 | `tools/admin/` | Consolidation jenni_sources : extrait refs APA des docx + prompts, complète les champs manquants par matching DOI/URL/signature |
| `bq_query.py` | v1.0 | `tools/admin/` | Consultation BQ on-demand — modules, recherche, filtres |
| `check_integrity.py` | v1.0 | `tools/admin/` | Validation intégrité DB (termes orphelins, FK, doublons) |
| `deploy_publications.py` | v1.0 | `tools/admin/` | Synchronise Publications/web/ vers ../Publications/ (dépôt GitHub Pages séparé) via rsync. |
| `explorer.py` | v1.0 | `tools/admin/` | Interface web locale pour consulter sol_vivant.db (tables, BQ, sessions) |
| `export_biblio.py` | v1.0 | `tools/admin/` | Export biblio jenni_sources au format RIS (Zotero) ou APA, avec filtres (--all/--missing-journal/--orphan/--fiche/--doc) |
| `export_tools.py` | v1.5 | `tools/admin/` | Exporteur scripts v1.5. |
| `fix_titres.py` | v1.0 | `tools/admin/` | Correction titres jenni_doc_specs |
| `integrate_doc_docx.py` | v1.0 | `tools/admin/` | Integration docx redige (document de strate) -> doc_contenus.contenu_integre. |
| `relink_fiche_refs.py` | v1.0 | `tools/admin/` | Reconnecte fiche_contenus.refs (JSON) vers jenni_sources.id et garantit source_usages |
| `session_end.py` | v1.1 | `tools/admin/` | Rituel de clôture de session Claude Code : regen, integrity, session_recap insert (BQ #119), commit, push, merge FF main |
| `session_start.py` | v3.0 | `tools/admin/` | Contexte session v2.3. |
| `analyse_corpus.py` | v4.1 | `tools/batch/` | Analyse modulaire corpus v4.1. |
| `gen_archive.py` | v1.0 | `tools/docs/` | Génère une archive ZIP hors-ligne du site Sol Vivant (pages + vendor + images) |
| `gen_cahier.py` | v1.0 | `tools/docs/` | Cahier de Science — livre pédagogique multi-chapitres (MO/POM-MAOM, Textures, Fermentations) |
| `gen_concept_cards.py` | v1.0 | `tools/docs/` | Concept Cards — page interactive ; rend les cartes via SvConceptCardList unifié |
| `gen_esclaves_calc.py` | v1.0 | `tools/docs/` | Calculateur Esclaves Energetiques : web page avec saisie combustible + quantite annuelle, calcul du nombre d equivalents humains au travail. |
| `gen_explorer.py` | v1.0 | `tools/docs/` | Génération page Explorer DB statique |
| `gen_lifofer.py` | v1.0 | `tools/docs/` | Calculateur interactif LiFoFer v1 |
| `gen_mo_calc.py` | v1.0 | `tools/docs/` | Calculateur interactif Matière Organique — formule de Kirkby, mélanges, analyse sols. |
| `gen_readme.py` | v1.1 | `tools/docs/` | Génération dynamique de tous les README depuis la DB. |
| `gen_reports.py` | v1.0 | `tools/docs/` | Génère les rapports d'audit depuis audit_reports → jmj/analyses/reports/ |
| `gen_technique.py` | v1.0 | `tools/docs/` | Guide Technique (Publications/technique/index.html) — architecture, méthode, portabilité du patron. |
| `gen_triangle_textures.py` | v2.0 | `tools/docs/` | Triangle des textures interactif — classification USDA des sols. |
| `gen_web.py` | v2.2 | `tools/docs/` | Cartographie React interactive v1.1 (web public). |
| `gen_workflows.py` | v2.0 | `tools/docs/` | Génération des workflows horodatés par module. |
| `enrich_thesaurus.py` | v1.0 | `tools/jenni/` | Pipeline unifie enrichissement thesaurus : audit (par axe bt/syn/def et strate) -> export lot de 10 pour Jenni -> import retour (parse TERME/EN/DEF/... |
| `export_fiche.py` | v1.0 | `tools/jenni/` | Export prompts fiches transversales depuis la DB. |
| `export_jenni_doc.py` | v3.1 | `tools/jenni/` | Génération prompts Jenni v3.1. |
| `export_validation.py` | v1.0 | `tools/jenni/` | Génération des prompts de validations depuis validation_sections. |
| `gen_fiche_docx.py` | v1.0 | `tools/jenni/` | Generateur de fiche .docx au format "document dans son etat courant" (doctrine wf_fiche). |
| `gen_prompt_completion.py` | v1.0 | `tools/jenni/` | Génère un prompt Jenni pour compléter les champs manquants (BT, RT, SYN_FR, SYN_EN) de termes déjà existants dans le thésaurus. |
| `gen_prompt_enrichissement.py` | v1.0 | `tools/jenni/` | Génère un prompt Jenni d'enrichissement thésaurus depuis liste/JSON/final_consolide (filtres criticité, strate, doc_cible) |
| `gen_prompt_thesaurus.py` | v1.0 | `tools/jenni/` | Génère un prompt Jenni UNIFIÉ par strate (nouveaux termes + termes à compléter en un seul fichier). |
| `import_enrichissement.py` | v1.0 | `tools/jenni/` | Import semi-auto réponses Jenni (parse→preview→insert avec --confirm) |
| `agent_runner.py` | v1.0 | `tools/lib/` | Pattern préparateur → agents Task → consolidateur. |
| `biblio_format.py` | v1.0 | `tools/lib/` | Parsing/format APA + Zotero report + RIS pour biblio Sol Vivant |
| `cli.py` | v1.0 | `tools/lib/` | Helpers CLI partagés (add_db_arg, check_db) |
| `concept_cards.py` | v1.0 | `tools/lib/` | Builder unifié des payloads de cartes conceptuelles (build_card_payloads) — single source of truth pour SvConceptCardList |
| `config.py` | v1.0 | `tools/lib/` | Accès centralisé à la table config (get, get_json) |
| `db.py` | v1.0 | `tools/lib/` | Connexion DB centralisée (get_connection) |
| `glossary.py` | v1.0 | `tools/lib/` | Builder unifié des payloads glossaire (build_term_payloads + glossary_for_text) — single source pour SvGlossary |
| `jenni_format.py` | v1.0 | `tools/lib/` | Formatage des prompts Jenni (markdown, sections) |
| `pub_path.py` | v1.0 | `tools/lib/` | Chemins de publication (Publications/web/, Publications/cartographie/) |
| `repair_json.py` | v1.0 | `tools/lib/` | Module partagé : repair_json() — réparation JSON tronqué/malformé des réponses LLM. |
| `web_template.py` | v1.0 | `tools/lib/` | Template HTML partagé — charte Sol Vivant, render_page, OG tags |
| `weekly_scan.py` | v1.0 | `tools/veille/` | Veille PubMed hebdomadaire : balaye config.veille.hot_topics, dedoublonne contre pubmed_seen, produit rapport Markdown des nouveaux candidats dans recherches/veille/ |

## Arborescence

```
projet/
├── sol_vivant.db
├── CLAUDE.md              # contexte persistent Claude Code
├── MANIFEST.md            # ce fichier
├── tools/
│   ├── sync_scripts.py
│   ├── admin/                  audit_opus, backfill_biblio, bq_query, check_integrity, deploy_publications, explorer, export_biblio, export_tools, fix_titres, integrate_doc_docx, relink_fiche_refs, session_end, session_start
│   ├── batch/                  analyse_corpus
│   ├── docs/                   gen_archive, gen_cahier, gen_concept_cards, gen_esclaves_calc, gen_explorer, gen_lifofer, gen_mo_calc, gen_readme, gen_reports, gen_technique, gen_triangle_textures, gen_web, gen_workflows
│   ├── jenni/                  enrich_thesaurus, export_fiche, export_jenni_doc, export_validation, gen_fiche_docx, gen_prompt_completion, gen_prompt_enrichissement, gen_prompt_thesaurus, import_enrichissement
│   ├── lib/                    agent_runner, biblio_format, cli, concept_cards, config, db, glossary, jenni_format, pub_path, repair_json, web_template
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

10 pages, 41 templates (2 partagés), vendor local (hors-ligne).

| Page | Slug | Fichier |
|------|------|---------|
| Cahier de Science | `cahier` | `cahier.html` |
| Concept Cards | `concept_cards` | `concept_cards.html` |
| Ébauches des documents | `ebauches` | `ebauches.html` |
| Esclaves énergétiques | `esclaves_calculateur` | `esclaves_calculateur.html` |
| Cartographie | `index` | `index.html` |
| LiFoFer | `lifofer` | `lifofer.html` |
| Matière organique | `mo_calculateur` | `mo_calculateur.html` |
| Tests terrain | `tests_terrain` | `tests_terrain.html` |
| Transition robuste | `transition_robuste` | `transition_robuste.html` |
| Textures GEPPA | `triangle_textures` | `triangle_textures.html` |

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

# Audit
python3 tools/admin/audit_opus.py --db sol_vivant.db --dry-run
python3 tools/admin/session_start.py --db sol_vivant.db
```

Les scripts d'inférence (`attribution.py`, `analyse_corpus.py`, `audit_opus.py`) suivent le workflow en 3 phases via `agent_runner.py` : `--prepare` → agents Task dans une session Claude Code → `--consolidate`. Plus d'API Anthropic externe depuis v4.
