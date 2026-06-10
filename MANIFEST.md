# Sol Vivant Tools — Manifest

## Base de donnees
- `sol_vivant.db` — source de verite (corpus + audit_log + config + refs)
- 52 tables, 7 vues
- Scripts : 107 fichiers Python dans `tools/` (filesystem = source de verite, voir Session B)

## Scripts

| Script | Dossier | Description |
|---|---|---|
| `regen_all.py` | `tools/` | Régénère tous les outputs depuis la DB |
| `analyse_emergences.py` | `tools/admin/` | Détecteur de tensions transversales (phase 1 du « conseil ») |
| `analyse_fiches.py` | `tools/admin/` | analyse_fiches.py -- Analyse consciente des fiches via pattern agent_runner. |
| `audit_anglicismes.py` | `tools/admin/` | Détecte les anglicismes résiduels dans le corpus. |
| `audit_bt.py` | `tools/admin/` | Audit de l'arbre BT (hyperonymes) du thésaurus. |
| `audit_canoniques_anglais.py` | `tools/admin/` | Détection des canoniques FR qui sont en |
| `audit_center.py` | `tools/admin/` | Centre d'audit du corpus : le FIL DIRECTEUR, tiré au démarrage. |
| `audit_corpus_relations.py` | `tools/admin/` | Audit dynamique des relations du corpus. |
| `audit_fiches.py` | `tools/admin/` | Audit complet des fiches integrees. |
| `audit_focus.py` | `tools/admin/` | Audits focalisés via agent_runner (Opus, 3 phases). |
| `audit_graines.py` | `tools/admin/` | Contrôle qualité des graines (fiche_sections) AVANT envoi Jenni. |
| `audit_meta.py` | `tools/admin/` | Méta-audit : lit tous les audit_reports/json/*_latest.json |
| `audit_opus.py` | `tools/admin/` | Audit approfondi du corpus via agents Task Claude Code |
| `audit_repartition.py` | `tools/admin/` | Audit de répartition par strate. |
| `audit_sources_orphelines.py` | `tools/admin/` | Audit des sources sans DOI ni URL avec |
| `audit_thesaurus.py` | `tools/admin/` | Rapport d'audit consolidé du thésaurus (axes A→H, doctrine BQ #155). |
| `backfill_biblio.py` | `tools/admin/` | consolidation jenni_sources depuis docx + prompts. |
| `bq_query.py` | `tools/admin/` | Consultation BQ on-demand (filesystem) |
| `check_forbidden_jenni.py` | `tools/admin/` | Scan méta-vocab interdit dans tout contenu destiné à Jenni. |
| `check_integrity.py` | `tools/admin/` | Validation d'intégrité de la DB sol_vivant.db |
| `conseil_emergences.py` | `tools/admin/` | Phase 2 du dispositif « conseil » : délibération multi-agents. |
| `dedupe_thesaurus.py` | `tools/admin/` | Détecte et fusionne les doublons du thésaurus. |
| `deploy_publications.py` | `tools/admin/` | Synchronise Publications/web/ vers ../Publications/ |
| `explorer.py` | `tools/admin/` | Interface web locale pour consulter sol_vivant.db |
| `export_biblio.py` | `tools/admin/` | exporte la biblio jenni_sources au format RIS ou APA. |
| `export_mismatches_inrae.py` | `tools/admin/` | Export des mismatches corpus ↔ INRAE pour arbitrage. |
| `export_termes_candidats.py` | `tools/admin/` | Export des termes candidats non insérés pour validation. |
| `export_tools.py` | `tools/admin/` | Exporte les scripts depuis le filesystem (tools/lib/scripts_inventory.py) vers un ZIP versionné |
| `fix_titres.py` | `tools/admin/` | » par « I. |
| `ingest_structured_links.py` | `tools/admin/` | Câblage des cards orphelines depuis le travail |
| `pedago_links_apply.py` | `tools/admin/` | Insère dans pedago_links les suggestions générées par |
| `pedago_links_suggest.py` | `tools/admin/` | Suggestion de cards pédagogiques à lier aux fiches/docs |
| `purge_audit_log.py` | `tools/admin/` | Rétention du journal audit_log. |
| `reintegrate_fiches_sections.py` | `tools/admin/` | reintegrate_fiches_sections.py -- Migration one-shot des fiches vers stockage par section. |
| `relink_fiche_refs.py` | `tools/admin/` | reconnecte les refs JSON de fiche_contenus.refs |
| `repair_usages_collision_millesime.py` | `tools/admin/` | purge des source_usages parasites créés |
| `resolve_sources_crossref.py` | `tools/admin/` | Phase 1 Crossref auto pour sources orphelines (BQ #129 wf_source_integration). |
| `resolve_term_relations.py` | `tools/admin/` | Résout les relations orphelines du thésaurus. |
| `retag_source_usages.py` | `tools/admin/` | Rétro-tag des source_usages depuis les inline citations de fiche_retour_sections. |
| `session_end.py` | `tools/admin/` | Rituel de clôture de session Claude Code web. |
| `session_start.py` | `tools/admin/` | Dashboard de démarrage de session Claude Code |
| `sync_syn_inrae.py` | `tools/admin/` | Enrichit syn_fr/syn_en du thésaurus corpus depuis INRAE. |
| `analyse_corpus.py` | `tools/batch/` | Analyse modulaire du corpus  v4.1 |
| `gen_archive.py` | `tools/docs/` | Génère une archive ZIP hors-ligne du site Sol Vivant. |
| `gen_bq_page.py` | `tools/docs/` | page HTML cartographique simple des BQ. |
| `gen_cahier.py` | `tools/docs/` | Cahier de Science (livre pédagogique multi-chapitres) |
| `gen_concept_cards.py` | `tools/docs/` | Page interactive des concept cards |
| `gen_dashboard.py` | `tools/docs/` | Génère le tableau de bord Claude/Sol Vivant. |
| `gen_esclaves_calc.py` | `tools/docs/` | Generer Publications/web/esclaves_calculateur.html |
| `gen_explorer.py` | `tools/docs/` | Génère la page Explorer DB statique |
| `gen_fiches_index.py` | `tools/docs/` | Régénère recherches/fiches/INDEX.md depuis la DB. |
| `gen_illustration_prompts.py` | `tools/docs/` | Export les prompts d'illustration depuis la DB. |
| `gen_lifofer.py` | `tools/docs/` | Calculateur interactif LiFoFer |
| `gen_mo_calc.py` | `tools/docs/` | Calculateur interactif Matière Organique |
| `gen_readme.py` | `tools/docs/` | gen_readme.py v1.1 |
| `gen_scripts.py` | `tools/docs/` | Génère Publications/web/scripts.html |
| `gen_technique.py` | `tools/docs/` | Guide Technique (Publications/web/technique/index.html) |
| `gen_tests_terrain.py` | `tools/docs/` | Genere Publications/web/tests_terrain.html |
| `gen_transition_robuste.py` | `tools/docs/` | Genere Publications/web/transition_robuste.html |
| `gen_triangle_textures.py` | `tools/docs/` | gen_triangle_textures.py v2.0 |
| `gen_web.py` | `tools/docs/` | Cartographie React interactive (consultation publique web) |
| `gen_workflows.py` | `tools/docs/` | Génère un fichier MD de workflow par domaine technique. |
| `edit_fiche_note.py` | `tools/jenni/` | Édition chirurgicale des notes H2 de fiches. |
| `enrich_thesaurus.py` | `tools/jenni/` | Pipeline unifie d'enrichissement du thesaurus. |
| `export_fiche.py` | `tools/jenni/` | Génération des prompts de fiches depuis fiche_sections |
| `export_jenni_doc.py` | `tools/jenni/` | Génération mécanique des prompts Jenni |
| `export_thesaurus_incomplets.py` | `tools/jenni/` | Génère des docx Jenni pour termes incomplets. |
| `export_validation.py` | `tools/jenni/` | Génération des prompts de validations depuis validation_sections |
| `gen_fiche_docx.py` | `tools/jenni/` | Genere le .docx d'une fiche au format "document dans son etat courant". |
| `gen_prompt_thesaurus.py` | `tools/jenni/` | Document de travail Jenni UNIFIÉ par strate |
| `import_termes_jenni.py` | `tools/jenni/` | Import des listes de termes Jenni avec contrôle strict. |
| `integrate_fiche.py` | `tools/jenni/` | Pipeline unifie d'integration d'une fiche Jenni. |
| `integrate_fiche_refs.py` | `tools/jenni/` | Intégration des refs biblio d'une fiche intégrée dans jenni_sources + source_usages. |
| `integrate_source.py` | `tools/jenni/` | Integration consciente d'un rapport de source. |
| `integrate_validation_refs.py` | `tools/jenni/` | Intégration des refs biblio d'une RÉPONSE de validation / question de sourçage. |
| `refresh_retour_text.py` | `tools/jenni/` | répare CHIRURGICALEMENT le texte des sections de |
| `resolve_import_conflicts.py` | `tools/jenni/` | Résout les blocs Jenni bloqués par multiples matches. |
| `agent_context.py` | `tools/lib/` | Contexte agent FRAIS et tracé (anti « effet mémoire »). |
| `agent_guards.py` | `tools/lib/` | Garde-fous pour scripts agent_runner. |
| `agent_runner.py` | `tools/lib/` | Pattern « préparateur → agents Task → consolidateur » |
| `audit_persist.py` | `tools/lib/` | Persistance des rapports d'audit sur filesystem. |
| `audit_post_import.py` | `tools/lib/` | BQ #146 §H.7. |
| `audit_report.py` | `tools/lib/` | Module commun pour rapports d'audit JSON structurés. |
| `biblio_format.py` | `tools/lib/` | parsing et formatage des références bibliographiques. |
| `bq_inventory.py` | `tools/lib/` | Inventaire/lecture des entrees BQ filesystem. |
| `cli.py` | `tools/lib/` | Helpers CLI partagés. |
| `concept_cards.py` | `tools/lib/` | builder unifié des payloads de cartes conceptuelles. |
| `config.py` | `tools/lib/` | Lecture centralisée de la table config. |
| `db.py` | `tools/lib/` | Connexion DB standardisée. |
| `doc_archive.py` | `tools/lib/` | archivage générique d'un docx intégré + son pendant envoyé. |
| `docx_index.py` | `tools/lib/` | Source de vérité du mapping fiche ↔ docx archivé. |
| `fiche_archive.py` | `tools/lib/` | archivage des fichiers sources post-intégration d'une fiche. |
| `fiche_text.py` | `tools/lib/` | Source de vérité unique du « texte intégré » d'une fiche. |
| `glossary.py` | `tools/lib/` | builder unifié des payloads glossaire (terms). |
| `inrae.py` | `tools/lib/` | Thésaurus INRAE comme référentiel de contrôle et d'enrichissement. |
| `jenni_format.py` | `tools/lib/` | Fonctions partagées de formatage des prompts Jenni |
| `parse_jenni_docx.py` | `tools/lib/` | Parser docx Jenni -- extraction structuree par section. |
| `pub_path.py` | `tools/lib/` | Résolution du chemin Publications/ et nommage horodaté. |
| `refs.py` | `tools/lib/` | refs.py -- API unifiee pour la table 'refs' (ex 5 ref_* tables). |
| `repair_json.py` | `tools/lib/` | Robust JSON repair for truncated or fenced LLM output. |
| `reports_inventory.py` | `tools/lib/` | Inventaire et lecture/ecriture des rapports filesystem. |
| `scripts_inventory.py` | `tools/lib/` | Inventaire des scripts depuis le filesystem. |
| `term_rels.py` | `tools/lib/` | Helpers pour écrire dans `term_relations` (source de vérité |
| `text_norm.py` | `tools/lib/` | Normalisation canonique pour le matching des termes du thésaurus. |
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
│   ├── admin/                  analyse_emergences, analyse_fiches, audit_anglicismes, audit_bt, audit_canoniques_anglais, audit_center, audit_corpus_relations, audit_fiches, audit_focus, audit_graines, audit_meta, audit_opus, audit_repartition, audit_sources_orphelines, audit_thesaurus, backfill_biblio, bq_query, check_forbidden_jenni, check_integrity, conseil_emergences, dedupe_thesaurus, deploy_publications, explorer, export_biblio, export_mismatches_inrae, export_termes_candidats, export_tools, fix_titres, ingest_structured_links, pedago_links_apply, pedago_links_suggest, purge_audit_log, reintegrate_fiches_sections, relink_fiche_refs, repair_usages_collision_millesime, resolve_sources_crossref, resolve_term_relations, retag_source_usages, session_end, session_start, sync_syn_inrae
│   ├── batch/                  analyse_corpus
│   ├── docs/                   gen_archive, gen_bq_page, gen_cahier, gen_concept_cards, gen_dashboard, gen_esclaves_calc, gen_explorer, gen_fiches_index, gen_illustration_prompts, gen_lifofer, gen_mo_calc, gen_readme, gen_scripts, gen_technique, gen_tests_terrain, gen_transition_robuste, gen_triangle_textures, gen_web, gen_workflows
│   ├── jenni/                  edit_fiche_note, enrich_thesaurus, export_fiche, export_jenni_doc, export_thesaurus_incomplets, export_validation, gen_fiche_docx, gen_prompt_thesaurus, import_termes_jenni, integrate_fiche, integrate_fiche_refs, integrate_source, integrate_validation_refs, refresh_retour_text, resolve_import_conflicts
│   ├── lib/                    agent_context, agent_guards, agent_runner, audit_persist, audit_post_import, audit_report, biblio_format, bq_inventory, cli, concept_cards, config, db, doc_archive, docx_index, fiche_archive, fiche_text, glossary, inrae, jenni_format, parse_jenni_docx, pub_path, refs, repair_json, reports_inventory, scripts_inventory, term_rels, text_norm, thesaurus_completion, web_template
│   ├── veille/                 weekly_scan
│   ├── regen_all.py
├── docx/                      Documents .docx (retours Jenni)
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

10 pages, 35 templates (2 partagés), vendor local (hors-ligne).

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
