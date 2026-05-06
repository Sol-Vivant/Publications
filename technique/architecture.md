# Architecture technique — Le Sol Vivant cet Holobionte

## Base de donnees : sol_vivant.db

Source de verite donnees. SQLite, 50 tables, 7 vues.

### Tables principales

| Table | Role | Enregistrements |
|-------|------|-----------------|
| `documents` | 18 documents du corpus | 18 |
| `prompts` | Structure des sections (type, chapitre, section, titres, contexte, instructions) | 191 |
| `prompt_contenus` | Contenu redige par Jenni, analyse par Claude (1:1 avec prompts) | 12 |
| `terms` | Thesaurus canonique (FR/EN, definitions, relations) | 1496 |
| `term_relations` | Relations entre termes (BT, NT, RT) | 8722 |
| `chains_causales` | 29 chaines causales reliant les documents | 29 |
| `chain_etapes` | Etapes des chaines | 193 |
| `doc_cross_refs` | Renvois inter-documents bidirectionnels | 0 |
| `config` | Parametres centralises (api, strates, analyse, batch, corpus) | 157 |
| `jenni_doc_specs` | Specifications document (titre Jenni, style) | 18 |
| `db_meta` | Historique (audits, scores, todos, idees) | 19 |
| `audit_log` | Journal des operations | 9335 |

### Tables web et outils interactifs

| Table | Role | Enregistrements |
|-------|------|-----------------|
| `web_pages` | Pages web (slug, titre, OG tags) | 13 |
| `html_templates` | Templates CSS/JS par page + partagés | 41 (2 partagés) |
| `concept_cards` | Fiches conceptuelles synthétiques | 146 |
| `diagnostic_rules` | Règles diagnostiques sol | 26 |
| `cascade_niveaux` | Niveaux de la cascade prérequis | 6 |
| `illustration_prompts` | Diagrammes Mermaid générés | 16 |
| `refs` (kind=matiere) | Matières organiques (C/N, k1, NPK) | 113 |
| `refs` (kind=texture) | Classes texturales GEPPA | 14 |

### Deploiement web

- **Vendor local** : `Publications/web/vendor/` (React, Babel, Tailwind — hors-ligne)
- **Charte CSS** : `web_template.py` (CHARTER_CSS + composants pédagogiques sv-*)
- **Composants React partagés** : `html_templates` (page_slug IS NULL, id=16)
- **Déploiement** : `rsync -av Publications/web/ /Publications/` → GitHub Pages
- **Archive** : `gen_archive.py` → ZIP autonome (~16 Mo)

### Table config (parametres centralises)

```sql
SELECT categorie, cle, valeur, description FROM config ORDER BY categorie, cle;
```

| Categorie | Cles |
|-----------|------|
| `analyse` | groupes, passes, template_passe2 |
| `api` | max_abstract_chars, max_ctx_analyse_corpus, max_ctx_audit_corpus, max_ctx_audit_technique, max_tokens_attribution, max_tokens_defaut, max_tokens_validation, model |
| `audit` | def_max_chars, def_min_chars, def_truncate_chars, max_age_hours_meta, min_bigram_chars, min_chars_contenu_fiche, min_chars_definition_terme, min_chars_refs_fiche, preview_chars_card, seuil_avancement_bas, seuil_avancement_haut, warn_docs_isoles, warn_terms_sans_def |
| `batch` | analyse_corpus_chunk_half, analyse_corpus_max_chars, analyse_fiches_max_tokens, audit_opus_max_ctx_corpus, audit_opus_max_ctx_technique |
| `cahier` | chapitres, onglets, tab_descriptions |
| `claude_rules` | agent_runner_reflexe, agents_opus_default, archivage_fiches, audit_cards_first, audit_reflex, audit_status_lecture, bq_access, cloture_pending_recap, fiche_docx_production, parser_docx_omath, pas_agent_redacteur, pas_modif_fr_canonique, pratiques_typees_hors_jenni, redaction_documents_jenni |
| `concept_cards` | page_intro, tab_intros |
| `corpus` | auteur, nom, regle_jenni |
| `deprecation` | fiche_section_h2_notes |
| `esclaves_calculateur` | tab_intros |
| `execution` | timeout_git_s, timeout_git_short_s, timeout_inrae_api_s, timeout_jsx_compile_s, timeout_regen_s, timeout_subprocess_default_s |
| `export` | audit_log_preview_chars, audit_log_recent_limit, json_indent, preview_long_chars, preview_title_long, preview_title_short, sample_top_n |
| `index` | tab_cards, tab_cascade, tab_chaines, tab_connections, tab_crossrefs, tab_documents, tab_illustrations, tab_thesaurus |
| `jenni` | prompt_enrichissement_definitions_vagues, prompt_enrichissement_thesaurus, prompt_redaction_pedagogique, prompt_resolution_doublons, prompt_validation_chaine_causale |
| `lifofer` | comprendre, data, sources_sucre, tab_intros, ui |
| `matching` | min_token_score, pedago_min_score, pedago_top_n, pedago_w_content, pedago_w_title, prefix_chars_min, prefix_ratio_min, score_contient, score_inclus, score_seuil_bas, score_seuil_haut, title_threshold, top_n_default, triage_top_n |
| `mo_calc` | cat_colors, modes_transformation, zones_eh_fallback |
| `mo_calculateur` | comprendre, tab_intros |
| `paths` | analyses_reports, audit_reports, audit_reports_json, docx_archives, docx_en_cours, illustrations, inrae_cache, inrae_rdf, jenni_ebauches, jmj_archives, jmj_docx, jmj_notes, jmj_pdf, pending_session_recap, publications_web, publications_workflows, rapports_audit, rapports_session, recherches_archives, recherches_completion, recherches_fiches, recherches_sources, recherches_thesaurus, recherches_veille |
| `projet` | base_url_publications, github_org_url, github_pages_url, github_publications_url, github_repo_url, github_tools_url |
| `strates` | couleurs, couleurs_cascade, couleurs_light, descriptions, noms, ordre |
| `technique` | chapitres |
| `tests_terrain` | tab_intros |
| `transition_robuste` | tab_intros |
| `triangle` | comprendre, sections_didactiques, tab_intros, test_bocal, test_boudin |
| `veille` | efetch_batch_size, hot_topics, scholar_alerts, throttle_sec, urlopen_timeout_s |
| `web` | explorer_host, explorer_open_delay_s, explorer_port, icon_library, index_description_template |

## Scripts (tools/)

| Script | Module | Role |
|--------|--------|------|
| `regen_all.py` | root | Régénère tous les outputs depuis la DB |
| `analyse_fiches.py` | admin | analyse_fiches.py -- Analyse consciente des fiches via pattern agent_runner. |
| `audit_anglicismes.py` | admin | Détecte les anglicismes résiduels dans le corpus. |
| `audit_bt.py` | admin | Audit de l'arbre BT (hyperonymes) du thésaurus. |
| `audit_canoniques_anglais.py` | admin | Détection des canoniques FR qui sont en |
| `audit_corpus_relations.py` | admin | Audit dynamique des relations du corpus. |
| `audit_fiches.py` | admin | Audit complet des fiches integrees. |
| `audit_meta.py` | admin | Méta-audit : lit tous les audit_reports/json/*_latest.json |
| `audit_opus.py` | admin | Audit approfondi du corpus via agents Task Claude Code |
| `audit_repartition.py` | admin | Audit de répartition par strate. |
| `audit_sources_orphelines.py` | admin | Audit des sources sans DOI ni URL avec |
| `backfill_biblio.py` | admin | consolidation jenni_sources depuis docx + prompts. |
| `bq_query.py` | admin | Consultation BQ on-demand (filesystem) |
| `check_forbidden_jenni.py` | admin | Scan méta-vocab interdit dans tout contenu destiné à Jenni. |
| `check_integrity.py` | admin | Validation d'intégrité de la DB sol_vivant.db |
| `dedupe_thesaurus.py` | admin | Détecte et fusionne les doublons du thésaurus. |
| `deploy_publications.py` | admin | Synchronise Publications/web/ vers ../Publications/ |
| `explorer.py` | admin | Interface web locale pour consulter sol_vivant.db |
| `export_biblio.py` | admin | exporte la biblio jenni_sources au format RIS ou APA. |
| `export_mismatches_inrae.py` | admin | Export des mismatches corpus ↔ INRAE pour arbitrage. |
| `export_termes_candidats.py` | admin | Export des termes candidats non insérés pour validation. |
| `export_tools.py` | admin | Exporte les scripts depuis le filesystem (tools/lib/scripts_inventory.py) vers un ZIP versionné |
| `fix_titres.py` | admin | » par « I. |
| `insert_lacunes_lot2.py` | admin | Insertion en DB des 21 fiches a_faire du Lot 2 lacunes. |
| `insert_lacunes_lot3.py` | admin | Insertion en DB des 8 fiches a_faire du Lot 3 lacunes. |
| `integrate_doc_docx.py` | admin | Pipeline d'integration d'un document de strate (.docx) en DB. |
| `integrate_fiche_docx.py` | admin | Pipeline d'intégration d'une fiche Jenni (.docx) dans la DB. |
| `pedago_links_apply.py` | admin | Insère dans pedago_links les suggestions générées par |
| `pedago_links_suggest.py` | admin | Suggestion de cards pédagogiques à lier aux fiches/docs |
| `reintegrate_fiches_sections.py` | admin | reintegrate_fiches_sections.py -- Migration one-shot des fiches vers stockage par section. |
| `relink_fiche_refs.py` | admin | reconnecte les refs JSON de fiche_contenus.refs |
| `session_end.py` | admin | Rituel de clôture de session Claude Code web. |
| `session_start.py` | admin | Dashboard de démarrage de session Claude Code |
| `sync_syn_inrae.py` | admin | Enrichit syn_fr/syn_en du thésaurus corpus depuis INRAE. |
| `triage_ris.py` | admin | Triage semi-automatique d'un export RIS. |
| `analyse_corpus.py` | batch | Analyse modulaire du corpus  v4.1 |
| `gen_archive.py` | docs | Génère une archive ZIP hors-ligne du site Sol Vivant. |
| `gen_bq_page.py` | docs | page HTML cartographique simple des BQ. |
| `gen_cahier.py` | docs | Cahier de Science (livre pédagogique multi-chapitres) |
| `gen_concept_cards.py` | docs | Page interactive des concept cards |
| `gen_dashboard.py` | docs | Génère le tableau de bord Claude/Sol Vivant. |
| `gen_esclaves_calc.py` | docs | Generer Publications/web/esclaves_calculateur.html |
| `gen_explorer.py` | docs | Génère la page Explorer DB statique |
| `gen_illustration_prompts.py` | docs | Export les prompts d'illustration depuis la DB. |
| `gen_lifofer.py` | docs | Calculateur interactif LiFoFer |
| `gen_mo_calc.py` | docs | Calculateur interactif Matière Organique |
| `gen_readme.py` | docs | gen_readme.py v1.1 |
| `gen_technique.py` | docs | Guide Technique (Publications/web/technique/index.html) |
| `gen_tests_terrain.py` | docs | Genere Publications/web/tests_terrain.html |
| `gen_transition_robuste.py` | docs | Genere Publications/web/transition_robuste.html |
| `gen_triangle_textures.py` | docs | gen_triangle_textures.py v2.0 |
| `gen_web.py` | docs | Cartographie React interactive (consultation publique web) |
| `gen_workflows.py` | docs | Génère un fichier MD de workflow par domaine technique. |
| `gen_ebauches_web.py` | docs/archives | Génère la page web de consultation des ébauches. |
| `edit_fiche_note.py` | jenni | Édition chirurgicale des notes H2 de fiches. |
| `enrich_thesaurus.py` | jenni | Pipeline unifie d'enrichissement du thesaurus. |
| `export_fiche.py` | jenni | Génération des prompts de fiches depuis fiche_sections |
| `export_jenni_doc.py` | jenni | Génération mécanique des prompts Jenni |
| `export_thesaurus_incomplets.py` | jenni | Génère des docx Jenni pour termes incomplets. |
| `export_validation.py` | jenni | Génération des prompts de validations depuis validation_sections |
| `gen_fiche_docx.py` | jenni | Genere le .docx d'une fiche au format "document dans son etat courant". |
| `gen_prompt_completion.py` | jenni | [DÉPRÉCIÉ 2026-04-14] |
| `gen_prompt_enrichissement.py` | jenni | Génère un prompt Jenni d'enrichissement du thésaurus |
| `gen_prompt_thesaurus.py` | jenni | Document de travail Jenni UNIFIÉ par strate |
| `import_enrichissement.py` | jenni | Import semi-automatique des réponses Jenni |
| `import_termes_jenni.py` | jenni | Import des listes de termes Jenni avec contrôle strict. |
| `integrate_fiche.py` | jenni | Pipeline unifie d'integration d'une fiche Jenni. |
| `integrate_fiche_refs.py` | jenni | Intégration des refs biblio d'une fiche intégrée dans jenni_sources + source_usages. |
| `integrate_source.py` | jenni | Integration consciente d'un rapport de source. |
| `resolve_import_conflicts.py` | jenni | Résout les blocs Jenni bloqués par multiples matches. |
| `gen_doc_ebauche.py` | jenni/archives | Génère un .docx d'ébauche pour un document de strate. |
| `agent_runner.py` | lib | Pattern « préparateur → agents Task → consolidateur » |
| `audit_persist.py` | lib | Persistance des rapports d'audit sur filesystem. |
| `audit_report.py` | lib | Module commun pour rapports d'audit JSON structurés. |
| `biblio_format.py` | lib | parsing et formatage des références bibliographiques. |
| `bq_inventory.py` | lib | Inventaire/lecture des entrees BQ filesystem. |
| `cli.py` | lib | Helpers CLI partagés. |
| `concept_cards.py` | lib | builder unifié des payloads de cartes conceptuelles. |
| `config.py` | lib | Lecture centralisée de la table config. |
| `db.py` | lib | Connexion DB standardisée. |
| `glossary.py` | lib | builder unifié des payloads glossaire (terms). |
| `inrae.py` | lib | Thésaurus INRAE comme référentiel de contrôle et d'enrichissement. |
| `jenni_format.py` | lib | Fonctions partagées de formatage des prompts Jenni |
| `parse_jenni_docx.py` | lib | Parser docx Jenni -- extraction structuree par section. |
| `pub_path.py` | lib | Résolution du chemin Publications/ et nommage horodaté. |
| `refs.py` | lib | refs.py -- API unifiee pour la table 'refs' (ex 5 ref_* tables). |
| `repair_json.py` | lib | Robust JSON repair for truncated or fenced LLM output. |
| `reports_inventory.py` | lib | Inventaire et lecture/ecriture des rapports filesystem. |
| `scripts_inventory.py` | lib | Inventaire des scripts depuis le filesystem. |
| `sources.py` | lib | gestion des sources bibliographiques du corpus. |
| `term_rels.py` | lib | Helpers pour écrire dans `term_relations` (source de vérité |
| `thesaurus_completion.py` | lib | Critère canonique de complétude du thésaurus. |
| `web_template.py` | lib | Template HTML partagé pour les pages outils Sol Vivant. |
| `weekly_scan.py` | veille | Veille PubMed hebdomadaire. |

## Reproduire le patron pour un autre corpus

1. Creer une DB SQLite avec les tables : `documents`, `prompts`, `terms`, `config`
2. Peupler le thesaurus avec les termes du domaine (FR/EN/definition)
3. Ecrire les prompts (type, chapitre, section, titre_h1, titre_h2, contexte_sci, instructions)
4. Alimenter la biblio interne (`jenni_sources`) avec les sources primaires
5. Utiliser `export_jenni_doc.py` pour generer les prompts
6. Copier-coller dans Jenni, recuperer le .docx
7. Analyser avec Claude, integrer dans `prompt_contenus`

L'architecture est independante du domaine. Seul le contenu change.
