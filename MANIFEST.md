# Sol Vivant Tools — Manifest

## Base de donnees
- `sol_vivant.db` — source de verite (corpus + audit_log + config + refs)
- 50 tables, 7 vues
- Scripts : 94 fichiers Python dans `tools/` (filesystem = source de verite, voir Session B)

## Scripts

| Script | Dossier | Description |
|---|---|---|
| `regen_all.py` | `tools/` | Régénère tous les outputs depuis la DB |
| `analyse_fiches.py` | `tools/admin/` | analyse_fiches.py -- Analyse consciente des fiches via pattern agent_runner. |
| `audit_anglicismes.py` | `tools/admin/` | Détecte les anglicismes résiduels dans le corpus. |
| `audit_bt.py` | `tools/admin/` | Audit de l'arbre BT (hyperonymes) du thésaurus. |
| `audit_canoniques_anglais.py` | `tools/admin/` | Détection des canoniques FR qui sont en |
| `audit_corpus_relations.py` | `tools/admin/` | Audit dynamique des relations du corpus. |
| `audit_fiches.py` | `tools/admin/` | Audit complet des fiches integrees. |
| `audit_meta.py` | `tools/admin/` | Méta-audit : lit tous les audit_reports/json/*_latest.json |
| `audit_opus.py` | `tools/admin/` | Audit approfondi du corpus via agents Task Claude Code |
| `audit_repartition.py` | `tools/admin/` | Audit de répartition par strate. |
| `audit_sources_orphelines.py` | `tools/admin/` | Audit des sources sans DOI ni URL avec |
| `backfill_biblio.py` | `tools/admin/` | consolidation jenni_sources depuis docx + prompts. |
| `bq_query.py` | `tools/admin/` | Consultation BQ on-demand (filesystem) |
| `check_forbidden_jenni.py` | `tools/admin/` | Scan méta-vocab interdit dans tout contenu destiné à Jenni. |
| `check_integrity.py` | `tools/admin/` | Validation d'intégrité de la DB sol_vivant.db |
| `dedupe_thesaurus.py` | `tools/admin/` | Détecte et fusionne les doublons du thésaurus. |
| `deploy_publications.py` | `tools/admin/` | Synchronise Publications/web/ vers ../Publications/ |
| `explorer.py` | `tools/admin/` | Interface web locale pour consulter sol_vivant.db |
| `export_biblio.py` | `tools/admin/` | exporte la biblio jenni_sources au format RIS ou APA. |
| `export_mismatches_inrae.py` | `tools/admin/` | Export des mismatches corpus ↔ INRAE pour arbitrage. |
| `export_termes_candidats.py` | `tools/admin/` | Export des termes candidats non insérés pour validation. |
| `export_tools.py` | `tools/admin/` | Exporte les scripts depuis le filesystem (tools/lib/scripts_inventory.py) vers un ZIP versionné |
| `fix_titres.py` | `tools/admin/` | » par « I. |
| `insert_lacunes_lot2.py` | `tools/admin/` | Insertion en DB des 21 fiches a_faire du Lot 2 lacunes. |
| `insert_lacunes_lot3.py` | `tools/admin/` | Insertion en DB des 8 fiches a_faire du Lot 3 lacunes. |
| `integrate_doc_docx.py` | `tools/admin/` | Pipeline d'integration d'un document de strate (.docx) en DB. |
| `integrate_fiche_docx.py` | `tools/admin/` | Pipeline d'intégration d'une fiche Jenni (.docx) dans la DB. |
| `pedago_links_apply.py` | `tools/admin/` | Insère dans pedago_links les suggestions générées par |
| `pedago_links_suggest.py` | `tools/admin/` | Suggestion de cards pédagogiques à lier aux fiches/docs |
| `reintegrate_fiches_sections.py` | `tools/admin/` | reintegrate_fiches_sections.py -- Migration one-shot des fiches vers stockage par section. |
| `relink_fiche_refs.py` | `tools/admin/` | reconnecte les refs JSON de fiche_contenus.refs |
| `session_end.py` | `tools/admin/` | Rituel de clôture de session Claude Code web. |
| `session_start.py` | `tools/admin/` | Dashboard de démarrage de session Claude Code |
| `sync_syn_inrae.py` | `tools/admin/` | Enrichit syn_fr/syn_en du thésaurus corpus depuis INRAE. |
| `triage_ris.py` | `tools/admin/` | Triage semi-automatique d'un export RIS. |
| `analyse_corpus.py` | `tools/batch/` | Analyse modulaire du corpus  v4.1 |
| `gen_archive.py` | `tools/docs/` | Génère une archive ZIP hors-ligne du site Sol Vivant. |
| `gen_bq_page.py` | `tools/docs/` | page HTML cartographique simple des BQ. |
| `gen_cahier.py` | `tools/docs/` | Cahier de Science (livre pédagogique multi-chapitres) |
| `gen_concept_cards.py` | `tools/docs/` | Page interactive des concept cards |
| `gen_dashboard.py` | `tools/docs/` | Génère le tableau de bord Claude/Sol Vivant. |
| `gen_esclaves_calc.py` | `tools/docs/` | Generer Publications/web/esclaves_calculateur.html |
| `gen_explorer.py` | `tools/docs/` | Génère la page Explorer DB statique |
| `gen_illustration_prompts.py` | `tools/docs/` | Export les prompts d'illustration depuis la DB. |
| `gen_lifofer.py` | `tools/docs/` | Calculateur interactif LiFoFer |
| `gen_mo_calc.py` | `tools/docs/` | Calculateur interactif Matière Organique |
| `gen_readme.py` | `tools/docs/` | gen_readme.py v1.1 |
| `gen_technique.py` | `tools/docs/` | Guide Technique (Publications/web/technique/index.html) |
| `gen_tests_terrain.py` | `tools/docs/` | Genere Publications/web/tests_terrain.html |
| `gen_transition_robuste.py` | `tools/docs/` | Genere Publications/web/transition_robuste.html |
| `gen_triangle_textures.py` | `tools/docs/` | gen_triangle_textures.py v2.0 |
| `gen_web.py` | `tools/docs/` | Cartographie React interactive (consultation publique web) |
| `gen_workflows.py` | `tools/docs/` | Génère un fichier MD de workflow par domaine technique. |
| `gen_ebauches_web.py` | `tools/docs/archives/` | Génère la page web de consultation des ébauches. |
| `edit_fiche_note.py` | `tools/jenni/` | Édition chirurgicale des notes H2 de fiches. |
| `enrich_thesaurus.py` | `tools/jenni/` | Pipeline unifie d'enrichissement du thesaurus. |
| `export_fiche.py` | `tools/jenni/` | Génération des prompts de fiches depuis fiche_sections |
| `export_jenni_doc.py` | `tools/jenni/` | Génération mécanique des prompts Jenni |
| `export_thesaurus_incomplets.py` | `tools/jenni/` | Génère des docx Jenni pour termes incomplets. |
| `export_validation.py` | `tools/jenni/` | Génération des prompts de validations depuis validation_sections |
| `gen_fiche_docx.py` | `tools/jenni/` | Genere le .docx d'une fiche au format "document dans son etat courant". |
| `gen_prompt_completion.py` | `tools/jenni/` | [DÉPRÉCIÉ 2026-04-14] |
| `gen_prompt_enrichissement.py` | `tools/jenni/` | Génère un prompt Jenni d'enrichissement du thésaurus |
| `gen_prompt_thesaurus.py` | `tools/jenni/` | Document de travail Jenni UNIFIÉ par strate |
| `import_enrichissement.py` | `tools/jenni/` | Import semi-automatique des réponses Jenni |
| `import_termes_jenni.py` | `tools/jenni/` | Import des listes de termes Jenni avec contrôle strict. |
| `integrate_fiche.py` | `tools/jenni/` | Pipeline unifie d'integration d'une fiche Jenni. |
| `integrate_fiche_refs.py` | `tools/jenni/` | Intégration des refs biblio d'une fiche intégrée dans jenni_sources + source_usages. |
| `integrate_source.py` | `tools/jenni/` | Integration consciente d'un rapport de source. |
| `resolve_import_conflicts.py` | `tools/jenni/` | Résout les blocs Jenni bloqués par multiples matches. |
| `gen_doc_ebauche.py` | `tools/jenni/archives/` | Génère un .docx d'ébauche pour un document de strate. |
| `agent_runner.py` | `tools/lib/` | Pattern « préparateur → agents Task → consolidateur » |
| `audit_persist.py` | `tools/lib/` | Persistance des rapports d'audit sur filesystem. |
| `audit_report.py` | `tools/lib/` | Module commun pour rapports d'audit JSON structurés. |
| `biblio_format.py` | `tools/lib/` | parsing et formatage des références bibliographiques. |
| `bq_inventory.py` | `tools/lib/` | Inventaire/lecture des entrees BQ filesystem. |
| `cli.py` | `tools/lib/` | Helpers CLI partagés. |
| `concept_cards.py` | `tools/lib/` | builder unifié des payloads de cartes conceptuelles. |
| `config.py` | `tools/lib/` | Lecture centralisée de la table config. |
| `db.py` | `tools/lib/` | Connexion DB standardisée. |
| `glossary.py` | `tools/lib/` | builder unifié des payloads glossaire (terms). |
| `inrae.py` | `tools/lib/` | Thésaurus INRAE comme référentiel de contrôle et d'enrichissement. |
| `jenni_format.py` | `tools/lib/` | Fonctions partagées de formatage des prompts Jenni |
| `parse_jenni_docx.py` | `tools/lib/` | Parser docx Jenni -- extraction structuree par section. |
| `pub_path.py` | `tools/lib/` | Résolution du chemin Publications/ et nommage horodaté. |
| `refs.py` | `tools/lib/` | refs.py -- API unifiee pour la table 'refs' (ex 5 ref_* tables). |
| `repair_json.py` | `tools/lib/` | Robust JSON repair for truncated or fenced LLM output. |
| `reports_inventory.py` | `tools/lib/` | Inventaire et lecture/ecriture des rapports filesystem. |
| `scripts_inventory.py` | `tools/lib/` | Inventaire des scripts depuis le filesystem. |
| `sources.py` | `tools/lib/` | gestion des sources bibliographiques du corpus. |
| `term_rels.py` | `tools/lib/` | Helpers pour écrire dans `term_relations` (source de vérité |
| `thesaurus_completion.py` | `tools/lib/` | Critère canonique de complétude du thésaurus. |
| `web_template.py` | `tools/lib/` | Template HTML partagé pour les pages outils Sol Vivant. |
| `weekly_scan.py` | `tools/veille/` | Veille PubMed hebdomadaire. |

## Arborescence

```
projet/
├── sol_vivant.db
├── CLAUDE.md              # contexte persistent Claude Code
├── MANIFEST.md            # ce fichier
├── tools/
│   ├── admin/                  analyse_fiches, audit_anglicismes, audit_bt, audit_canoniques_anglais, audit_corpus_relations, audit_fiches, audit_meta, audit_opus, audit_repartition, audit_sources_orphelines, backfill_biblio, bq_query, check_forbidden_jenni, check_integrity, dedupe_thesaurus, deploy_publications, explorer, export_biblio, export_mismatches_inrae, export_termes_candidats, export_tools, fix_titres, insert_lacunes_lot2, insert_lacunes_lot3, integrate_doc_docx, integrate_fiche_docx, pedago_links_apply, pedago_links_suggest, reintegrate_fiches_sections, relink_fiche_refs, session_end, session_start, sync_syn_inrae, triage_ris
│   ├── batch/                  analyse_corpus
│   ├── docs/                   gen_archive, gen_bq_page, gen_cahier, gen_concept_cards, gen_dashboard, gen_esclaves_calc, gen_explorer, gen_illustration_prompts, gen_lifofer, gen_mo_calc, gen_readme, gen_technique, gen_tests_terrain, gen_transition_robuste, gen_triangle_textures, gen_web, gen_workflows
│   ├── jenni/                  edit_fiche_note, enrich_thesaurus, export_fiche, export_jenni_doc, export_thesaurus_incomplets, export_validation, gen_fiche_docx, gen_prompt_completion, gen_prompt_enrichissement, gen_prompt_thesaurus, import_enrichissement, import_termes_jenni, integrate_fiche, integrate_fiche_refs, integrate_source, resolve_import_conflicts
│   ├── lib/                    agent_runner, audit_persist, audit_report, biblio_format, bq_inventory, cli, concept_cards, config, db, glossary, inrae, jenni_format, parse_jenni_docx, pub_path, refs, repair_json, reports_inventory, scripts_inventory, sources, term_rels, thesaurus_completion, web_template
│   ├── veille/                 weekly_scan
│   ├── regen_all.py
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
