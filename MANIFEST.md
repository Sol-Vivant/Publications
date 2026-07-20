# Sol Vivant Tools — Manifest

## Base de donnees
- `sol_vivant.db` — source de verite (corpus + audit_log + config + refs)
- 51 tables, 14 vues
- Scripts : 137 fichiers Python dans `tools/` (filesystem = source de verite, voir Session B)

## Scripts

| Script | Dossier | Description |
|---|---|---|
| `regen_all.py` | `tools/` | Régénère tous les outputs depuis la DB |
| `analyse_emergences.py` | `tools/admin/` | Détecteur de tensions transversales (phase 1 du « conseil ») |
| `analyse_fiches.py` | `tools/admin/` | Analyse consciente des fiches via pattern agent_runner. |
| `audit_anglicismes.py` | `tools/admin/` | Détecte les anglicismes résiduels dans le corpus. |
| `audit_bq_deepseek.py` | `tools/admin/` | Nettoyage des BQ (base de connaissances) via DeepSeek V4. |
| `audit_bq_legacy_ids.py` | `tools/admin/` | Détecte les références BQ #NNN (IDs numériques legacy) |
| `audit_bq_verify.py` | `tools/admin/` | Vérification factuelle des alertes audit_bq_deepseek. |
| `audit_bt.py` | `tools/admin/` | Audit de l'arbre BT (hyperonymes) du thésaurus. |
| `audit_canoniques_anglais.py` | `tools/admin/` | Détection des canoniques FR qui sont en réalité des termes anglais. |
| `audit_center.py` | `tools/admin/` | Centre d'audit du corpus : le FIL DIRECTEUR, tiré au démarrage. |
| `audit_corpus_relations.py` | `tools/admin/` | Audit dynamique des relations du corpus. |
| `audit_factuel_arbitrage.py` | `tools/admin/` | Arbitrage des sources INCONNUABLES (gâche 3). |
| `audit_factuel_deepseek.py` | `tools/admin/` | Gâche 3 de l'audit conscient (vérification factuelle DeepSeek). |
| `audit_fiche_md_deepseek.py` | `tools/admin/` | Audit conformité Markdown des fiches (DeepSeek V4 Pro). |
| `audit_fiches.py` | `tools/admin/` | Audit complet des fiches integrees. |
| `audit_focus.py` | `tools/admin/` | Audits focalisés via agent_runner (3 phases). |
| `audit_meta.py` | `tools/admin/` | Méta-audit : lit tous les jmj/rapports/audit_data/json/*_latest.json |
| `audit_repartition.py` | `tools/admin/` | Audit de répartition par strate. |
| `audit_revue_bq_scripts.py` | `tools/admin/` | Revue consciente BQ + scripts via bibliothèque d'agents V2. |
| `audit_sources_orphelines.py` | `tools/admin/` | Audit des sources sans DOI ni URL, avec remontée au docx d'origine pour récupérer les RIS sources. |
| `audit_thesaurus.py` | `tools/admin/` | Rapport d'audit consolidé du thésaurus (axes A→H, doctrine BQ `audit_thesaurus`). |
| `backfill_biblio.py` | `tools/admin/` | consolidation sources depuis docx + prompts. |
| `backup_rotation.py` | `tools/admin/` | Backup externe avec rotation 7 jours (rsync). |
| `bq_query.py` | `tools/admin/` | Consultation BQ on-demand (filesystem) |
| `build_inrae_matches.py` | `tools/admin/` | Construit la table inrae_matches (alignement corpus ↔ INRAE). |
| `check_forbidden_jenni.py` | `tools/admin/` | Scan méta-vocab interdit dans les fichiers destinés à la production. |
| `check_integrity.py` | `tools/admin/` | Validation d'intégrité de la DB sol_vivant.db |
| `conseil_emergences.py` | `tools/admin/` | Phase 2 du dispositif « conseil » : délibération multi-agents (v3). |
| `dedupe_thesaurus.py` | `tools/admin/` | Détecte et fusionne les doublons du thésaurus. |
| `deploy_publications.py` | `tools/admin/` | Synchronise Publications/web/ vers ../Publications/ |
| `diag_refs.py` | `tools/admin/` | Diagnostic des citations orphelines d'une fiche (refs_json). |
| `dump_db_sql.py` | `tools/admin/` | Dump SQL compressé de sol_vivant.db → backups/sol_vivant.sql.gz. |
| `enrich_hal.py` | `tools/admin/` | Enrichissement des sources via l'API HAL (CCSD). |
| `enrich_sources_crossref.py` | `tools/admin/` | Enrichissement direct des sources via CrossRef. |
| `enrich_thesaurus_s2.py` | `tools/admin/` | Enrichissement thésaurus via DeepSeek V4 Flash + Semantic Scholar |
| `explorer.py` | `tools/admin/` | Interface web locale pour consulter sol_vivant.db |
| `export_biblio.py` | `tools/admin/` | exporte la biblio sources au format RIS ou APA. |
| `export_mismatches_inrae.py` | `tools/admin/` | Export des mismatches corpus ↔ INRAE pour arbitrage. |
| `export_termes_candidats.py` | `tools/admin/` | Export des termes candidats non insérés pour validation. |
| `export_zotero.py` | `tools/admin/` | Export RIS pour import Zotero avec tags (strate/doc_code). |
| `fix_sections_h2_inline.py` | `tools/admin/` | Nettoie les sections H1 avec H2/H3 inline. |
| `fix_sections_titre_repete.py` | `tools/admin/` | Supprime la 1re ligne quand elle répète le titre. |
| `gen_agents_md.py` | `tools/admin/` | Régénère le routing modèle des agents depuis config DB. |
| `gen_pending_template.py` | `tools/admin/` | Génère le template du pending session recap. |
| `ingest_structured_links.py` | `tools/admin/` | Câblage des cards orphelines depuis le travail d'audit déjà structuré. |
| `integrate_resolved_cites.py` | `tools/admin/` | Intègre les citations inline résolues (chantier A). |
| `migrate_refs.py` | `tools/admin/` | Migration canonique des refs biblio (création sources + câblages + réécritures cites). |
| `pedago_links_apply.py` | `tools/admin/` | Insère dans pedago_links les suggestions de pedago_links_suggest.py, selon des seuils par rôle. |
| `pedago_links_suggest.py` | `tools/admin/` | Suggestion de cards pédagogiques à lier aux fiches/docs |
| `pull_zotero.py` | `tools/admin/` | Met à jour sources depuis les items Zotero (pull retour). |
| `purge_audit_log.py` | `tools/admin/` | Rétention du journal audit_log. |
| `push_zotero.py` | `tools/admin/` | Pousse les sources vers Zotero via le connector local. |
| `push_zotero_web.py` | `tools/admin/` | Push sources vers Zotero via API web (api.zotero.org). |
| `repair_sections_batch_20260704.py` | `tools/admin/` | Répare les sections des fiches du batch 2026-07-04. |
| `resolve_sources_crossref.py` | `tools/admin/` | Phase 1 Crossref auto pour sources orphelines (BQ `wf_source_integration`). |
| `resolve_term_relations.py` | `tools/admin/` | Résout les relations orphelines du thésaurus. |
| `run_thesaurus_batches.py` | `tools/admin/` | Runner DeepSeek pour les batches enrich_thesaurus. |
| `session_end.py` | `tools/admin/` | Clôture de session (CLI local mono-utilisateur). |
| `session_start.py` | `tools/admin/` | Démarrage de session (CLI local, allégé). |
| `sync_syn_inrae.py` | `tools/admin/` | Enrichit syn_fr/syn_en du thésaurus corpus depuis INRAE. |
| `verify_citations.py` | `tools/admin/` | Vérification des citations APA inline contre sources + Zotero. |
| `analyse_corpus.py` | `tools/batch/` | Analyse modulaire du corpus  v4.1 |
| `gen_archive.py` | `tools/docs/` | Génère une archive ZIP hors-ligne du site Sol Vivant. |
| `gen_bq_page.py` | `tools/docs/` | page HTML cartographique simple des BQ. |
| `gen_cahier.py` | `tools/docs/` | Cahier de Science (livre pédagogique multi-chapitres) |
| `gen_concept_cards.py` | `tools/docs/` | Page interactive des concept cards |
| `gen_dashboard.py` | `tools/docs/` | Génère le tableau de bord LLM / Sol Vivant. |
| `gen_esclaves_calc.py` | `tools/docs/` | Generer Publications/web/esclaves_calculateur.html |
| `gen_explorer.py` | `tools/docs/` | Génère la page Explorer DB statique |
| `gen_fiches_index.py` | `tools/docs/` | Régénère recherches/fiches/INDEX.md depuis la DB. |
| `gen_illustration_prompts.py` | `tools/docs/` | Export les prompts d'illustration depuis la DB. |
| `gen_lifofer.py` | `tools/docs/` | Calculateur interactif LiFoFer |
| `gen_mo_calc.py` | `tools/docs/` | Calculateur interactif Matière Organique |
| `gen_readme.py` | `tools/docs/` | Génération dynamique de tous les README depuis la DB sol_vivant.db. |
| `gen_scripts.py` | `tools/docs/` | Génère Publications/web/scripts.html |
| `gen_technique.py` | `tools/docs/` | Guide Technique (Publications/web/technique/index.html) |
| `gen_tests_terrain.py` | `tools/docs/` | Genere Publications/web/tests_terrain.html |
| `gen_transition_robuste.py` | `tools/docs/` | Genere Publications/web/transition_robuste.html |
| `gen_triangle_textures.py` | `tools/docs/` | Génère une page HTML interactive du triangle des textures GEPPA/USDA, liée au corpus Sol Vivant. |
| `gen_web.py` | `tools/docs/` | Cartographie React interactive (consultation publique web) |
| `gen_workflows.py` | `tools/docs/` | Génère un fichier MD de workflow par domaine technique. |
| `enrich_thesaurus.py` | `tools/integration/` | Pipeline unifie d'enrichissement du thesaurus. |
| `export_thesaurus_incomplets.py` | `tools/integration/` | Génère des docx Jenni pour termes incomplets. |
| `export_validation.py` | `tools/integration/` | Génération des prompts de validations depuis validation_sections |
| `import_termes.py` | `tools/integration/` | Import des listes de termes thésaurus avec contrôle strict. |
| `integrate_fiche.py` | `tools/integration/` | Pipeline unifie d'integration d'une fiche Jenni. |
| `integrate_fiche_refs.py` | `tools/integration/` | Intégration des refs biblio d'une fiche intégrée dans sources + source_usages. |
| `integrate_source.py` | `tools/integration/` | Integration consciente d'un rapport de source. |
| `integrate_validation_refs.py` | `tools/integration/` | Intégration des refs biblio d'une RÉPONSE de validation / question de sourçage. |
| `resolve_import_conflicts.py` | `tools/integration/` | Résout les blocs Jenni bloqués par multiples matches. |
| `agent_context.py` | `tools/lib/` | Contexte agent FRAIS et tracé (anti « effet mémoire »). |
| `agent_guards.py` | `tools/lib/` | Garde-fous pour scripts agent_runner. |
| `agent_report.py` | `tools/lib/` | Écrit un rapport depuis un agent Task (contournement du |
| `agent_runner.py` | `tools/lib/` | Pattern « préparateur → agents Task → consolidateur » |
| `agent_thinking.py` | `tools/lib/` | Workaround pour le thinking-off effectif. |
| `apa.py` | `tools/lib/` | Helpers partagés pour les citations APA et le matching sources. |
| `api_urls.py` | `tools/lib/` | URLs API centralisées avec fallback stateless. |
| `audit_persist.py` | `tools/lib/` | Persistance des rapports d'audit sur filesystem. |
| `audit_post_import.py` | `tools/lib/` | Audit post-import du thésaurus (BQ `regles_de_redaction_des_documents_jenni_reference` §H.7). |
| `audit_report.py` | `tools/lib/` | Module commun pour rapports d'audit JSON structurés. |
| `biblio_format.py` | `tools/lib/` | parsing et formatage des références bibliographiques. |
| `bq_inventory.py` | `tools/lib/` | Inventaire/lecture des entrees BQ filesystem. |
| `cli.py` | `tools/lib/` | Helpers CLI partagés. |
| `concept_cards.py` | `tools/lib/` | builder unifié des payloads de cartes conceptuelles. |
| `config.py` | `tools/lib/` | Lecture centralisée de la table config + secrets API. |
| `db.py` | `tools/lib/` | Connexion DB standardisée. |
| `deepseek_client.py` | `tools/lib/` | Helper partagé pour les appels DeepSeek API. |
| `deepseek_meta.py` | `tools/lib/` | Méta-contexte partagé à injecter dans les consignes DeepSeek. |
| `doc_archive.py` | `tools/lib/` | archivage générique d'un docx intégré + son pendant envoyé. |
| `docx_index.py` | `tools/lib/` | Source de vérité du mapping fiche ↔ docx archivé. |
| `fiche_archive.py` | `tools/lib/` | archivage des fichiers sources post-intégration d'une fiche. |
| `fiche_text.py` | `tools/lib/` | Source de vérité unique du « texte intégré » d'une fiche. |
| `glossary.py` | `tools/lib/` | builder unifié des payloads glossaire (terms). |
| `http_client.py` | `tools/lib/` | Transport HTTP canonique pour tools/. |
| `inrae.py` | `tools/lib/` | Thésaurus INRAE comme référentiel de contrôle et d'enrichissement. |
| `parse_jenni_docx.py` | `tools/lib/` | Parser docx Jenni : extraction structurée par section. |
| `parse_jenni_md.py` | `tools/lib/` | Parser MD pour fiches produites par DeepSeek. |
| `prompt_format.py` | `tools/lib/` | Fonctions partagées de formatage des prompts (handoffs rédacteur) |
| `pub_path.py` | `tools/lib/` | Résolution du chemin Publications/ et nommage horodaté. |
| `refs.py` | `tools/lib/` | API unifiee pour la table 'refs' (ex 5 ref_* tables). |
| `repair_json.py` | `tools/lib/` | Robust JSON repair for truncated or fenced LLM output. |
| `reports_inventory.py` | `tools/lib/` | Inventaire et lecture/ecriture des rapports filesystem. |
| `scripts_inventory.py` | `tools/lib/` | Inventaire des scripts depuis le filesystem. |
| `section.py` | `tools/lib/` | Helpers partagés pour la numérotation normalisée des sections. |
| `source_enrich.py` | `tools/lib/` | Fetch abstracts et métadonnées biblio multi-source. |
| `term_rels.py` | `tools/lib/` | Helpers pour écrire dans `term_relations` (source de vérité |
| `text_norm.py` | `tools/lib/` | Normalisation canonique pour le matching des termes du thésaurus. |
| `thesaurus_completion.py` | `tools/lib/` | Critère canonique de complétude du thésaurus. |
| `web_template.py` | `tools/lib/` | Template HTML partagé pour les pages outils Sol Vivant. |
| `server.py` | `tools/mcp/` | interface typée aux outils canoniques. |
| `openlibrary.py` | `tools/veille/` | Recherche livres et ISBN via Open Library (Internet Archive). |
| `search_bnf.py` | `tools/veille/` | Recherche livres et documents FR via BnF Catalogue général (API SRU). |
| `search_crossref.py` | `tools/veille/` | Recherche Crossref ouverte par auteur + titre/co-auteur + année. |
| `search_zotero.py` | `tools/veille/` | Recherche dans la bibliothèque Zotero de JMJ (API Web v3). |
| `semantic_scholar.py` | `tools/veille/` | Client Semantic Scholar Academic Graph API (v1). |
| `veille_services.py` | `tools/veille/` | Veille hebdomadaire des API services externes. |
| `weekly_scan.py` | `tools/veille/` | Veille PubMed hebdomadaire. |

## Arborescence

```
projet/
├── sol_vivant.db
├── AGENTS.md              # contexte persistent (opencode / LLM)
├── MANIFEST.md            # ce fichier
├── tools/
│   ├── admin/                  analyse_emergences, analyse_fiches, audit_anglicismes, audit_bq_deepseek, audit_bq_legacy_ids, audit_bq_verify, audit_bt, audit_canoniques_anglais, audit_center, audit_corpus_relations, audit_factuel_arbitrage, audit_factuel_deepseek, audit_fiche_md_deepseek, audit_fiches, audit_focus, audit_meta, audit_repartition, audit_revue_bq_scripts, audit_sources_orphelines, audit_thesaurus, backfill_biblio, backup_rotation, bq_query, build_inrae_matches, check_forbidden_jenni, check_integrity, conseil_emergences, dedupe_thesaurus, deploy_publications, diag_refs, dump_db_sql, enrich_hal, enrich_sources_crossref, enrich_thesaurus_s2, explorer, export_biblio, export_mismatches_inrae, export_termes_candidats, export_zotero, fix_sections_h2_inline, fix_sections_titre_repete, gen_agents_md, gen_pending_template, ingest_structured_links, integrate_resolved_cites, migrate_refs, pedago_links_apply, pedago_links_suggest, pull_zotero, purge_audit_log, push_zotero, push_zotero_web, repair_sections_batch_20260704, resolve_sources_crossref, resolve_term_relations, run_thesaurus_batches, session_end, session_start, sync_syn_inrae, verify_citations
│   ├── batch/                  analyse_corpus
│   ├── docs/                   gen_archive, gen_bq_page, gen_cahier, gen_concept_cards, gen_dashboard, gen_esclaves_calc, gen_explorer, gen_fiches_index, gen_illustration_prompts, gen_lifofer, gen_mo_calc, gen_readme, gen_scripts, gen_technique, gen_tests_terrain, gen_transition_robuste, gen_triangle_textures, gen_web, gen_workflows
│   ├── integration/            enrich_thesaurus, export_thesaurus_incomplets, export_validation, import_termes, integrate_fiche, integrate_fiche_refs, integrate_source, integrate_validation_refs, resolve_import_conflicts
│   ├── lib/                    agent_context, agent_guards, agent_report, agent_runner, agent_thinking, apa, api_urls, audit_persist, audit_post_import, audit_report, biblio_format, bq_inventory, cli, concept_cards, config, db, deepseek_client, deepseek_meta, doc_archive, docx_index, fiche_archive, fiche_text, glossary, http_client, inrae, parse_jenni_docx, parse_jenni_md, prompt_format, pub_path, refs, repair_json, reports_inventory, scripts_inventory, section, source_enrich, term_rels, text_norm, thesaurus_completion, web_template
│   ├── veille/                 openlibrary, search_bnf, search_crossref, search_zotero, semantic_scholar, veille_services, weekly_scan
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
python3 tools/integration/export_jenni_doc.py  # ⚠ ARCHIVÉ — exemple legacy --db sol_vivant.db --doc S2
python3 tools/integration/export_jenni_doc.py  # ⚠ ARCHIVÉ — exemple legacy --db sol_vivant.db --all

# Audit
python3 tools/admin/audit_focus.py --db sol_vivant.db --target chaines --prepare
python3 tools/admin/session_start.py --db sol_vivant.db
```

Les scripts d'inférence (`analyse_corpus.py`, `analyse_fiches.py`, `audit_focus.py`) suivent le workflow en 3 phases via `agent_runner.py` : `--prepare` → agents Task dans une session LLM → `--consolidate`. Plus d'API Anthropic externe depuis v4.
