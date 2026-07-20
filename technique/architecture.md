# Architecture technique — Le Sol Vivant cet Holobionte

## Base de donnees : sol_vivant.db

Source de verite donnees. SQLite, 51 tables, 14 vues.

### Tables principales

| Table | Role | Enregistrements |
|-------|------|-----------------|
| `documents` | 18 documents de strate (ossature pédagogique) | 18 |
| `prompts` | Structure des sections (héritage v3, ossature documents — gelé) | 192 |
| `terms` | Thesaurus canonique (FR/EN, definitions, relations) | 4048 |
| `term_relations` | Relations entre termes (BT, NT, RT) | 31026 |
| `chains_causales` | 45 chaines causales reliant les documents | 45 |
| `chain_etapes` | Etapes des chaines | 299 |
| `config` | Parametres centralises (corpus, strates, analyse, web, RULES.md) | 371 |
| `doc_specs` | Specifications document (titre Jenni, style) | 18 |
| `db_meta` | Historique (audits, scores, todos, idees) | 11 |
| `audit_log` | Journal des operations | 4923 |
| `sections` | **Contenu textuel unifié** (cards + fiches, moteur de rendu) | 7049 |

### Workflow fiches et sourçage

| Table | Role | Enregistrements |
|-------|------|-----------------|
| `fiches` | Unité de production éditoriale (slug, type, statut) | 264 |
| `fiche_retour_sections` | **Vue** sur `sections` (entity_type='fiche') — compatibilité | 6809 |
| `fiche_articulations` | Articulations inter-fiches (pivot, direction) | 160 |
| `sources` | Bibliothèque bibliographique du corpus (DOI, auteurs) | 10098 |
| `source_usages` | Citations inline rattachées aux entités | 19852 |
| `validations` | Workflow de validation / questions de sourçage | 19 |

### Fil directeur et graphe conceptuel

| Table | Role | Enregistrements |
|-------|------|-----------------|
| `doctrine_chantiers` | **Fil directeur** : thèses fédératrices, principes racines, chantiers, tensions | 24 |
| `concept_card_links` | Graphe de liens entre concept cards (from/to/type) | 1106 |
| `card_chain_links` | Rattachement cards ↔ chaînes causales | 713 |
| `cascade_level_links` | Rattachement entités ↔ niveaux de cascade | 146 |
| `pedago_links` | Liens pédagogiques card ↔ fiche/doc | 919 |
| `concept_dimensions` | Dimensions transversales des cards | 12 |

### Tables web et outils interactifs

| Table | Role | Enregistrements |
|-------|------|-----------------|
| `web_pages` | Pages web (slug, titre, OG tags) | 14 |
| `html_templates` | Templates CSS/JS par page + partagés | 35 (2 partagés) |
| `concept_cards` | Fiches conceptuelles synthétiques | 237 |
| `diagnostic_rules` | Règles diagnostiques sol | 26 |
| `cascade_prerequis` | Niveaux de la cascade de prérequis (logique, seuils, leviers) | 6 |
| `illustration_prompts` | Diagrammes Mermaid générés | 16 |
| `refs` (kind=matiere) | Matières organiques (C/N, k1, NPK) | 113 |
| `refs` (kind=texture) | Classes texturales GEPPA | 14 |

### Deploiement web

- **Vendor local** : `Publications/web/vendor/` (React, Babel, Tailwind — hors-ligne)
- **Charte CSS** : `web_template.py` (CHARTER_CSS + composants pédagogiques sv-*)
- **Composants React partagés** : `html_templates` (page_slug IS NULL — sv-shared-components, sv-charter-css)
- **Déploiement** : `rsync -av Publications/web/ /Publications/` → GitHub Pages
- **Archive** : `gen_archive.py` → ZIP autonome (~16 Mo)

### Table config (parametres centralises)

```sql
SELECT categorie, cle, valeur, description FROM config ORDER BY categorie, cle;
```

| Categorie | Cles |
|-----------|------|
| `agent_library` | _default_effort, _default_max_tokens, _default_model, _default_temperature, _default_thinking, _schema_version, _thinking_workaround, audit-bq-coherence_effort, audit-bq-coherence_enabled, audit-bq-coherence_max_tokens, audit-bq-coherence_model, audit-bq-coherence_temperature, audit-bq-coherence_thinking, audit-bq-frontmatter_effort, audit-bq-frontmatter_enabled, audit-bq-frontmatter_max_tokens, audit-bq-frontmatter_model, audit-bq-frontmatter_temperature, audit-bq-frontmatter_thinking, audit-bq-obsolescence_effort, audit-bq-obsolescence_enabled, audit-bq-obsolescence_max_tokens, audit-bq-obsolescence_model, audit-bq-obsolescence_temperature, audit-bq-obsolescence_thinking, audit-coherence_effort, audit-coherence_enabled, audit-coherence_max_tokens, audit-coherence_model, audit-coherence_temperature, audit-coherence_thinking, audit-factuel_effort, audit-factuel_enabled, audit-factuel_max_tokens, audit-factuel_model, audit-factuel_temperature, audit-factuel_thinking, audit-md-format_effort, audit-md-format_enabled, audit-md-format_max_tokens, audit-md-format_model, audit-md-format_temperature, audit-md-format_thinking, audit-scripts-conventions_effort, audit-scripts-conventions_enabled, audit-scripts-conventions_max_tokens, audit-scripts-conventions_model, audit-scripts-conventions_temperature, audit-scripts-conventions_thinking, audit-scripts-dette_effort, audit-scripts-dette_enabled, audit-scripts-dette_max_tokens, audit-scripts-dette_model, audit-scripts-dette_temperature, audit-scripts-dette_thinking, audit-scripts-orphans_effort, audit-scripts-orphans_enabled, audit-scripts-orphans_max_tokens, audit-scripts-orphans_model, audit-scripts-orphans_temperature, audit-scripts-orphans_thinking, audit-section-numbering_effort, audit-section-numbering_enabled, audit-section-numbering_max_tokens, audit-section-numbering_model, audit-section-numbering_temperature, audit-section-numbering_thinking, classifier-term-statut_effort, classifier-term-statut_enabled, classifier-term-statut_max_tokens, classifier-term-statut_model, classifier-term-statut_temperature, classifier-term-statut_thinking, conseil-contradicteur_effort, conseil-contradicteur_enabled, conseil-contradicteur_max_tokens, conseil-contradicteur_model, conseil-contradicteur_temperature, conseil-contradicteur_thinking, conseil-judge_effort, conseil-judge_enabled, conseil-judge_max_tokens, conseil-judge_model, conseil-judge_temperature, conseil-judge_thinking, consolidator-manifest_effort, consolidator-manifest_enabled, consolidator-manifest_max_tokens, consolidator-manifest_model, consolidator-manifest_temperature, consolidator-manifest_thinking, consolidator-triage_effort, consolidator-triage_enabled, consolidator-triage_max_tokens, consolidator-triage_model, consolidator-triage_temperature, consolidator-triage_thinking, detector-emergences_effort, detector-emergences_enabled, detector-emergences_max_tokens, detector-emergences_model, detector-emergences_temperature, detector-emergences_thinking, detector-gaps_effort, detector-gaps_enabled, detector-gaps_max_tokens, detector-gaps_model, detector-gaps_temperature, detector-gaps_thinking, extractor-citations_effort, extractor-citations_enabled, extractor-citations_max_tokens, extractor-citations_model, extractor-citations_temperature, extractor-citations_thinking, scholar-searcher_effort, scholar-searcher_enabled, scholar-searcher_max_tokens, scholar-searcher_model, scholar-searcher_temperature, scholar-searcher_thinking, session-scribe_effort, session-scribe_enabled, session-scribe_max_tokens, session-scribe_model, session-scribe_temperature, session-scribe_thinking, validator-crossref_effort, validator-crossref_enabled, validator-crossref_max_tokens, validator-crossref_model, validator-crossref_temperature, validator-crossref_thinking, validator-s2_effort, validator-s2_enabled, validator-s2_max_tokens, validator-s2_model, validator-s2_temperature, validator-s2_thinking, weaver-bq_effort, weaver-bq_enabled, weaver-bq_max_tokens, weaver-bq_model, weaver-bq_temperature, weaver-bq_thinking, weaver-cards_effort, weaver-cards_enabled, weaver-cards_max_tokens, weaver-cards_model, weaver-cards_temperature, weaver-cards_thinking, weaver-chains_effort, weaver-chains_enabled, weaver-chains_max_tokens, weaver-chains_model, weaver-chains_temperature, weaver-chains_thinking, weaver-fiches_effort, weaver-fiches_enabled, weaver-fiches_max_tokens, weaver-fiches_model, weaver-fiches_temperature, weaver-fiches_thinking, weaver-scripts-bq_effort, weaver-scripts-bq_enabled, weaver-scripts-bq_max_tokens, weaver-scripts-bq_model, weaver-scripts-bq_temperature, weaver-scripts-bq_thinking, weaver-thesaurus_effort, weaver-thesaurus_enabled, weaver-thesaurus_max_tokens, weaver-thesaurus_model, weaver-thesaurus_temperature, weaver-thesaurus_thinking, zotero-sync_effort, zotero-sync_enabled, zotero-sync_max_tokens, zotero-sync_model, zotero-sync_temperature, zotero-sync_thinking |
| `agent_runner` | max_concurrent, work_dir_root |
| `analyse` | groupes, passes, template_passe2 |
| `api` | bnf_url_base, bnf_url_sru, crossref_url, deepseek_base_url, deepseek_max_tokens, deepseek_model, deepseek_reasoning_effort, deepseek_thinking, deepseek_timeout_s, deepseek_url, github_opencode_releases_url, hal_url_search, max_abstract_chars, max_ctx_analyse_corpus, max_ctx_audit_corpus, max_ctx_audit_technique, max_tokens_attribution, max_tokens_defaut, max_tokens_validation, model, ncbi_eutils_url, openlibrary_url_isbn, openlibrary_url_search, openlibrary_url_works, s2_url_base, s2_url_reco, s2_url_status, zenodo_url, zotero_connector_url, zotero_uid, zotero_url |
| `audit` | def_max_chars, def_min_chars, def_truncate_chars, fil_derniere_regen, fil_seuil_integrations, max_age_hours_meta, min_bigram_chars, min_chars_contenu_fiche, min_chars_definition_terme, min_chars_refs_fiche, preview_chars_card, seuil_avancement_bas, seuil_avancement_haut, tissage_inter_card_min, warn_docs_isoles, warn_terms_sans_def |
| `batch` | analyse_corpus_chunk_half, analyse_corpus_max_chars, analyse_fiches_max_tokens, audit_opus_max_ctx_corpus, audit_opus_max_ctx_technique |
| `cahier` | chapitres, chapter_colors, chapter_fiches, fiche_type_colors, onglets, pedago_fiches, tab_descriptions, tool_pages |
| `concept_cards` | page_intro, tab_intros |
| `corpus` | auteur, nom, regle_jenni |
| `deprecation` | fiche_section_h2_notes |
| `enrich` | crossref_throttle, hal_throttle, http_retries, http_timeout, max_abstract_chars, min_abstract_chars, openlibrary_throttle, s2_chunk_size, s2_throttle, user_agent_mailto |
| `esclaves_calculateur` | tab_intros |
| `execution` | timeout_git_s, timeout_git_short_s, timeout_inrae_api_s, timeout_jsx_compile_s, timeout_regen_s, timeout_subprocess_default_s |
| `export` | audit_log_preview_chars, audit_log_recent_limit, json_indent, preview_long_chars, preview_title_long, preview_title_short, sample_top_n |
| `index` | tab_cards, tab_cascade, tab_chaines, tab_connections, tab_crossrefs, tab_documents, tab_illustrations, tab_thesaurus |
| `lifofer` | comprendre, data, sources_sucre, tab_intros, ui |
| `llm_batch` | analyse_fiches_max_tokens, prod_cards_max_tokens, prod_cards_model |
| `llm_notes` | fiches_biblio_cassee_marathon, fiches_marathon_filtre_origine |
| `maintenance` | audit_log_retention_mois |
| `matching` | min_token_score, pedago_min_score, pedago_top_n, pedago_w_content, pedago_w_title, prefix_chars_min, prefix_ratio_min, score_contient, score_inclus, score_seuil_bas, score_seuil_haut, title_threshold, top_n_default, triage_top_n |
| `mo_calc` | cat_colors, modes_transformation, zones_eh_fallback |
| `mo_calculateur` | comprendre, tab_intros |
| `paths` | analyses_reports, audit_data, audit_runs, docx_archives, docx_en_cours, illustrations, inrae_cache, inrae_rdf, jenni_ebauches, jmj_archives, jmj_docx, jmj_notes, jmj_pdf, pending_session_recap, publications_web, publications_workflows, rapports_audit, rapports_session, recherches_archives, recherches_completion, recherches_fiches, recherches_questions, recherches_thesaurus, recherches_veille |
| `projet` | base_url_publications, github_org_url, github_pages_url, github_publications_url, github_repo_url, github_tools_url |
| `strates` | couleurs, couleurs_cascade, couleurs_light, descriptions, noms, ordre |
| `technique` | chapitres |
| `tests_terrain` | tab_intros |
| `thesaurus` | def_enrich_min_chars, solid_def_min_chars |
| `transition_robuste` | tab_intros |
| `triangle` | comprendre, sections_didactiques, tab_intros, test_bocal, test_boudin |
| `veille` | efetch_batch_size, hot_topics, scholar_alerts, scholarai_enrich_throttle_s, throttle_sec, urlopen_timeout_s |
| `web` | explorer_host, explorer_open_delay_s, explorer_port, icon_library, index_description_template |

## Scripts (tools/)

| Script | Module | Role |
|--------|--------|------|
| `regen_all.py` | root | Régénère tous les outputs depuis la DB |
| `analyse_emergences.py` | admin | Détecteur de tensions transversales (phase 1 du « conseil ») |
| `analyse_fiches.py` | admin | Analyse consciente des fiches via pattern agent_runner. |
| `audit_anglicismes.py` | admin | Détecte les anglicismes résiduels dans le corpus. |
| `audit_bq_deepseek.py` | admin | Nettoyage des BQ (base de connaissances) via DeepSeek V4. |
| `audit_bq_legacy_ids.py` | admin | Détecte les références BQ #NNN (IDs numériques legacy) |
| `audit_bq_verify.py` | admin | Vérification factuelle des alertes audit_bq_deepseek. |
| `audit_bt.py` | admin | Audit de l'arbre BT (hyperonymes) du thésaurus. |
| `audit_canoniques_anglais.py` | admin | Détection des canoniques FR qui sont en réalité des termes anglais. |
| `audit_center.py` | admin | Centre d'audit du corpus : le FIL DIRECTEUR, tiré au démarrage. |
| `audit_corpus_relations.py` | admin | Audit dynamique des relations du corpus. |
| `audit_factuel_arbitrage.py` | admin | Arbitrage des sources INCONNUABLES (gâche 3). |
| `audit_factuel_deepseek.py` | admin | Gâche 3 de l'audit conscient (vérification factuelle DeepSeek). |
| `audit_fiche_md_deepseek.py` | admin | Audit conformité Markdown des fiches (DeepSeek V4 Pro). |
| `audit_fiches.py` | admin | Audit complet des fiches integrees. |
| `audit_focus.py` | admin | Audits focalisés via agent_runner (3 phases). |
| `audit_meta.py` | admin | Méta-audit : lit tous les jmj/rapports/audit_data/json/*_latest.json |
| `audit_repartition.py` | admin | Audit de répartition par strate. |
| `audit_revue_bq_scripts.py` | admin | Revue consciente BQ + scripts via bibliothèque d'agents V2. |
| `audit_sources_orphelines.py` | admin | Audit des sources sans DOI ni URL, avec remontée au docx d'origine pour récupérer les RIS sources. |
| `audit_thesaurus.py` | admin | Rapport d'audit consolidé du thésaurus (axes A→H, doctrine BQ `audit_thesaurus`). |
| `backfill_biblio.py` | admin | consolidation sources depuis docx + prompts. |
| `backup_rotation.py` | admin | Backup externe avec rotation 7 jours (rsync). |
| `bq_query.py` | admin | Consultation BQ on-demand (filesystem) |
| `build_inrae_matches.py` | admin | Construit la table inrae_matches (alignement corpus ↔ INRAE). |
| `check_forbidden_jenni.py` | admin | Scan méta-vocab interdit dans les fichiers destinés à la production. |
| `check_integrity.py` | admin | Validation d'intégrité de la DB sol_vivant.db |
| `conseil_emergences.py` | admin | Phase 2 du dispositif « conseil » : délibération multi-agents (v3). |
| `dedupe_thesaurus.py` | admin | Détecte et fusionne les doublons du thésaurus. |
| `deploy_publications.py` | admin | Synchronise Publications/web/ vers ../Publications/ |
| `diag_refs.py` | admin | Diagnostic des citations orphelines d'une fiche (refs_json). |
| `dump_db_sql.py` | admin | Dump SQL compressé de sol_vivant.db → backups/sol_vivant.sql.gz. |
| `enrich_hal.py` | admin | Enrichissement des sources via l'API HAL (CCSD). |
| `enrich_sources_crossref.py` | admin | Enrichissement direct des sources via CrossRef. |
| `enrich_thesaurus_s2.py` | admin | Enrichissement thésaurus via DeepSeek V4 Flash + Semantic Scholar |
| `explorer.py` | admin | Interface web locale pour consulter sol_vivant.db |
| `export_biblio.py` | admin | exporte la biblio sources au format RIS ou APA. |
| `export_mismatches_inrae.py` | admin | Export des mismatches corpus ↔ INRAE pour arbitrage. |
| `export_termes_candidats.py` | admin | Export des termes candidats non insérés pour validation. |
| `export_zotero.py` | admin | Export RIS pour import Zotero avec tags (strate/doc_code). |
| `fix_sections_h2_inline.py` | admin | Nettoie les sections H1 avec H2/H3 inline. |
| `fix_sections_titre_repete.py` | admin | Supprime la 1re ligne quand elle répète le titre. |
| `gen_agents_md.py` | admin | Régénère le routing modèle des agents depuis config DB. |
| `gen_pending_template.py` | admin | Génère le template du pending session recap. |
| `ingest_structured_links.py` | admin | Câblage des cards orphelines depuis le travail d'audit déjà structuré. |
| `integrate_resolved_cites.py` | admin | Intègre les citations inline résolues (chantier A). |
| `migrate_refs.py` | admin | Migration canonique des refs biblio (création sources + câblages + réécritures cites). |
| `pedago_links_apply.py` | admin | Insère dans pedago_links les suggestions de pedago_links_suggest.py, selon des seuils par rôle. |
| `pedago_links_suggest.py` | admin | Suggestion de cards pédagogiques à lier aux fiches/docs |
| `pull_zotero.py` | admin | Met à jour sources depuis les items Zotero (pull retour). |
| `purge_audit_log.py` | admin | Rétention du journal audit_log. |
| `push_zotero.py` | admin | Pousse les sources vers Zotero via le connector local. |
| `push_zotero_web.py` | admin | Push sources vers Zotero via API web (api.zotero.org). |
| `repair_sections_batch_20260704.py` | admin | Répare les sections des fiches du batch 2026-07-04. |
| `resolve_sources_crossref.py` | admin | Phase 1 Crossref auto pour sources orphelines (BQ `wf_source_integration`). |
| `resolve_term_relations.py` | admin | Résout les relations orphelines du thésaurus. |
| `run_thesaurus_batches.py` | admin | Runner DeepSeek pour les batches enrich_thesaurus. |
| `session_end.py` | admin | Clôture de session (CLI local mono-utilisateur). |
| `session_start.py` | admin | Démarrage de session (CLI local, allégé). |
| `sync_syn_inrae.py` | admin | Enrichit syn_fr/syn_en du thésaurus corpus depuis INRAE. |
| `verify_citations.py` | admin | Vérification des citations APA inline contre sources + Zotero. |
| `analyse_corpus.py` | batch | Analyse modulaire du corpus  v4.1 |
| `gen_archive.py` | docs | Génère une archive ZIP hors-ligne du site Sol Vivant. |
| `gen_bq_page.py` | docs | page HTML cartographique simple des BQ. |
| `gen_cahier.py` | docs | Cahier de Science (livre pédagogique multi-chapitres) |
| `gen_concept_cards.py` | docs | Page interactive des concept cards |
| `gen_dashboard.py` | docs | Génère le tableau de bord LLM / Sol Vivant. |
| `gen_esclaves_calc.py` | docs | Generer Publications/web/esclaves_calculateur.html |
| `gen_explorer.py` | docs | Génère la page Explorer DB statique |
| `gen_fiches_index.py` | docs | Régénère recherches/fiches/INDEX.md depuis la DB. |
| `gen_illustration_prompts.py` | docs | Export les prompts d'illustration depuis la DB. |
| `gen_lifofer.py` | docs | Calculateur interactif LiFoFer |
| `gen_mo_calc.py` | docs | Calculateur interactif Matière Organique |
| `gen_readme.py` | docs | Génération dynamique de tous les README depuis la DB sol_vivant.db. |
| `gen_scripts.py` | docs | Génère Publications/web/scripts.html |
| `gen_technique.py` | docs | Guide Technique (Publications/web/technique/index.html) |
| `gen_tests_terrain.py` | docs | Genere Publications/web/tests_terrain.html |
| `gen_transition_robuste.py` | docs | Genere Publications/web/transition_robuste.html |
| `gen_triangle_textures.py` | docs | Génère une page HTML interactive du triangle des textures GEPPA/USDA, liée au corpus Sol Vivant. |
| `gen_web.py` | docs | Cartographie React interactive (consultation publique web) |
| `gen_workflows.py` | docs | Génère un fichier MD de workflow par domaine technique. |
| `enrich_thesaurus.py` | integration | Pipeline unifie d'enrichissement du thesaurus. |
| `export_thesaurus_incomplets.py` | integration | Génère des docx Jenni pour termes incomplets. |
| `export_validation.py` | integration | Génération des prompts de validations depuis validation_sections |
| `import_termes.py` | integration | Import des listes de termes thésaurus avec contrôle strict. |
| `integrate_fiche.py` | integration | Pipeline unifie d'integration d'une fiche Jenni. |
| `integrate_fiche_refs.py` | integration | Intégration des refs biblio d'une fiche intégrée dans sources + source_usages. |
| `integrate_source.py` | integration | Integration consciente d'un rapport de source. |
| `integrate_validation_refs.py` | integration | Intégration des refs biblio d'une RÉPONSE de validation / question de sourçage. |
| `resolve_import_conflicts.py` | integration | Résout les blocs Jenni bloqués par multiples matches. |
| `agent_context.py` | lib | Contexte agent FRAIS et tracé (anti « effet mémoire »). |
| `agent_guards.py` | lib | Garde-fous pour scripts agent_runner. |
| `agent_report.py` | lib | Écrit un rapport depuis un agent Task (contournement du |
| `agent_runner.py` | lib | Pattern « préparateur → agents Task → consolidateur » |
| `agent_thinking.py` | lib | Workaround pour le thinking-off effectif. |
| `apa.py` | lib | Helpers partagés pour les citations APA et le matching sources. |
| `api_urls.py` | lib | URLs API centralisées avec fallback stateless. |
| `audit_persist.py` | lib | Persistance des rapports d'audit sur filesystem. |
| `audit_post_import.py` | lib | Audit post-import du thésaurus (BQ `regles_de_redaction_des_documents_jenni_reference` §H.7). |
| `audit_report.py` | lib | Module commun pour rapports d'audit JSON structurés. |
| `biblio_format.py` | lib | parsing et formatage des références bibliographiques. |
| `bq_inventory.py` | lib | Inventaire/lecture des entrees BQ filesystem. |
| `cli.py` | lib | Helpers CLI partagés. |
| `concept_cards.py` | lib | builder unifié des payloads de cartes conceptuelles. |
| `config.py` | lib | Lecture centralisée de la table config + secrets API. |
| `db.py` | lib | Connexion DB standardisée. |
| `deepseek_client.py` | lib | Helper partagé pour les appels DeepSeek API. |
| `deepseek_meta.py` | lib | Méta-contexte partagé à injecter dans les consignes DeepSeek. |
| `doc_archive.py` | lib | archivage générique d'un docx intégré + son pendant envoyé. |
| `docx_index.py` | lib | Source de vérité du mapping fiche ↔ docx archivé. |
| `fiche_archive.py` | lib | archivage des fichiers sources post-intégration d'une fiche. |
| `fiche_text.py` | lib | Source de vérité unique du « texte intégré » d'une fiche. |
| `glossary.py` | lib | builder unifié des payloads glossaire (terms). |
| `http_client.py` | lib | Transport HTTP canonique pour tools/. |
| `inrae.py` | lib | Thésaurus INRAE comme référentiel de contrôle et d'enrichissement. |
| `parse_jenni_docx.py` | lib | Parser docx Jenni : extraction structurée par section. |
| `parse_jenni_md.py` | lib | Parser MD pour fiches produites par DeepSeek. |
| `prompt_format.py` | lib | Fonctions partagées de formatage des prompts (handoffs rédacteur) |
| `pub_path.py` | lib | Résolution du chemin Publications/ et nommage horodaté. |
| `refs.py` | lib | API unifiee pour la table 'refs' (ex 5 ref_* tables). |
| `repair_json.py` | lib | Robust JSON repair for truncated or fenced LLM output. |
| `reports_inventory.py` | lib | Inventaire et lecture/ecriture des rapports filesystem. |
| `scripts_inventory.py` | lib | Inventaire des scripts depuis le filesystem. |
| `section.py` | lib | Helpers partagés pour la numérotation normalisée des sections. |
| `source_enrich.py` | lib | Fetch abstracts et métadonnées biblio multi-source. |
| `term_rels.py` | lib | Helpers pour écrire dans `term_relations` (source de vérité |
| `text_norm.py` | lib | Normalisation canonique pour le matching des termes du thésaurus. |
| `thesaurus_completion.py` | lib | Critère canonique de complétude du thésaurus. |
| `web_template.py` | lib | Template HTML partagé pour les pages outils Sol Vivant. |
| `server.py` | mcp | interface typée aux outils canoniques. |
| `openlibrary.py` | veille | Recherche livres et ISBN via Open Library (Internet Archive). |
| `search_bnf.py` | veille | Recherche livres et documents FR via BnF Catalogue général (API SRU). |
| `search_crossref.py` | veille | Recherche Crossref ouverte par auteur + titre/co-auteur + année. |
| `search_zotero.py` | veille | Recherche dans la bibliothèque Zotero de JMJ (API Web v3). |
| `semantic_scholar.py` | veille | Client Semantic Scholar Academic Graph API (v1). |
| `veille_services.py` | veille | Veille hebdomadaire des API services externes. |
| `weekly_scan.py` | veille | Veille PubMed hebdomadaire. |

## Reproduire le patron pour un autre corpus

1. Creer une DB SQLite avec les tables noyau : `terms`, `config`, `fiches`
2. Peupler le thesaurus avec les termes du domaine (FR/EN/definition)
3. Produire une fiche via DeepSeek + Semantic Scholar (MD natif)
4. Alimenter la biblio interne (`sources`) avec les sources primaires
5. Integrer le MD avec Conseil : `integrate_fiche.py` → `sections` + refs

Voir le guide dedie `reproduire_le_patron.md`. L'architecture est independante du domaine.
