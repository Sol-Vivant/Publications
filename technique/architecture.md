# Architecture technique — Le Sol Vivant cet Holobionte

## Base de donnees : sol_vivant.db

Source unique de verite. SQLite, 56 tables, 10 vues.

### Tables principales

| Table | Role | Enregistrements |
|-------|------|-----------------|
| `documents` | 18 documents du corpus | 18 |
| `prompts` | Structure des sections (type, chapitre, section, titres, contexte, instructions) | 191 |
| `prompt_contenus` | Contenu redige par Jenni, analyse par Claude (1:1 avec prompts) | 12 |
| `terms` | Thesaurus canonique (FR/EN, definitions, relations) | 874 |
| `term_relations` | Relations entre termes (BT, NT, RT) | 3635 |
| `chains_causales` | 16 chaines causales reliant les documents | 16 |
| `chain_etapes` | Etapes des chaines | 121 |
| `doc_cross_refs` | Renvois inter-documents bidirectionnels | 118 |
| `config` | Parametres centralises (api, strates, zotero, analyse, batch, corpus) | 79 |
| `jenni_doc_specs` | Specifications document (titre Jenni, style) | 18 |
| `scripts` | Registre des scripts avec versions | 42 |
| `db_meta` | Historique (audits, scores, todos, idees) | 10 |
| `audit_log` | Journal des operations | 956 |

### Tables web et outils interactifs

| Table | Role | Enregistrements |
|-------|------|-----------------|
| `web_pages` | Pages web (slug, titre, OG tags) | 10 |
| `html_templates` | Templates CSS/JS par page + partagés | 31 (1 partagés) |
| `concept_cards` | Fiches conceptuelles synthétiques | 73 |
| `diagnostic_rules` | Règles diagnostiques sol | 26 |
| `cascade_niveaux` | Niveaux de la cascade prérequis | 6 |
| `illustration_prompts` | Diagrammes Mermaid générés | 14 |
| `ref_matieres` | Matières organiques (C/N, k1, NPK) | 110 |
| `ref_textures` | Classes texturales GEPPA | 14 |

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
| `audit` | min_bigram_chars, warn_docs_isoles, warn_terms_sans_def |
| `cahier` | chapitres |
| `claude_rules` | audit_cards_first, bq_access |
| `concept_cards` | page_intro |
| `corpus` | auteur, nom, regle_jenni |
| `index` | tab_cards, tab_cascade, tab_chaines, tab_connections, tab_crossrefs, tab_documents, tab_illustrations, tab_thesaurus |
| `jenni` | prompt_enrichissement_definitions_vagues, prompt_enrichissement_thesaurus, prompt_redaction_pedagogique, prompt_resolution_doublons, prompt_validation_chaine_causale |
| `lifofer` | data, sources_sucre, ui |
| `mo_calc` | cat_colors, modes_transformation, zones_eh_fallback |
| `projet` | base_url_publications, github_org_url, github_pages_url, github_publications_url, github_repo_url, github_tools_url |
| `strates` | couleurs, couleurs_cascade, couleurs_light, descriptions, noms, ordre |
| `technique` | chapitres |
| `triangle` | sections_didactiques, test_bocal, test_boudin |
| `web` | icon_library, index_description_template |
| `zotero` | batch_size_avec_resume, batch_size_sans_resume, batch_version, est_tokens_in_ab, est_tokens_in_no, est_tokens_out_ab, est_tokens_out_no, max_abstract_chars, max_entry_chars, max_field_chars, max_ris_abstract_chars, max_ris_size_mb, min_abstract_len, min_bigram_chars, opus_doubt_threshold_pct, opus_error_threshold_pct, opus_sample_size, statuts, warn_entry_chars, warn_field_chars, warn_sans_doi_count |

## Scripts (tools/)

| Script | Module | Role |
|--------|--------|------|
| `regen_all.py` | root | Régénère tous les outputs depuis la DB (script unifié) |
| `sync_scripts.py` | root | Sync scripts DB ↔ fichiers. |
| `audit_opus.py` | admin | Audit Opus v3.1. |
| `bq_query.py` | admin | Consultation BQ on-demand — modules, recherche, filtres |
| `check_integrity.py` | admin | Validation intégrité DB (termes orphelins, FK, doublons) |
| `deploy_publications.py` | admin | Synchronise Publications/web/ vers ../Publications/ (dépôt GitHub Pages séparé) via rsync. |
| `explorer.py` | admin | Interface web locale pour consulter sol_vivant.db (tables, BQ, sessions) |
| `export_tools.py` | admin | Exporteur scripts v1.5. |
| `fix_titres.py` | admin | Correction titres jenni_doc_specs |
| `session_start.py` | admin | Contexte session v2.3. |
| `analyse_corpus.py` | batch | Analyse modulaire corpus v4.1. |
| `gen_archive.py` | docs | Génère une archive ZIP hors-ligne du site Sol Vivant (pages + vendor + images) |
| `gen_cahier.py` | docs | Cahier de Science — livre pédagogique multi-chapitres (MO/POM-MAOM, Textures, Fermentations) |
| `gen_explorer.py` | docs | Génération page Explorer DB statique |
| `gen_lifofer.py` | docs | Calculateur interactif LiFoFer v1 |
| `gen_mo_calc.py` | docs | Calculateur interactif Matière Organique — formule de Kirkby, mélanges, analyse sols. |
| `gen_readme.py` | docs | Génération dynamique de tous les README depuis la DB. |
| `gen_reports.py` | docs | Génère les rapports d'audit depuis audit_reports → jmj/analyses/reports/ |
| `gen_technique.py` | docs | Guide Technique (Publications/technique/index.html) — architecture, méthode, portabilité du patron. |
| `gen_triangle_textures.py` | docs | Triangle des textures interactif — classification USDA des sols. |
| `gen_web.py` | docs | Cartographie React interactive v1.1 (web public). |
| `gen_workflows.py` | docs | Génération des workflows horodatés par module. |
| `export_fiche.py` | jenni | Export prompts fiches transversales depuis la DB. |
| `export_jenni_doc.py` | jenni | Génération prompts Jenni v3.1. |
| `export_validation.py` | jenni | Génération des prompts de validations depuis validation_sections. |
| `gen_prompt_completion.py` | jenni | Génère un prompt Jenni pour compléter les champs manquants (BT, RT, SYN_FR, SYN_EN) de termes déjà existants dans le thésaurus. |
| `gen_prompt_enrichissement.py` | jenni | Génère un prompt Jenni d'enrichissement thésaurus depuis liste/JSON/final_consolide (filtres criticité, strate, doc_cible) |
| `gen_prompt_thesaurus.py` | jenni | Génère un prompt Jenni UNIFIÉ par strate (nouveaux termes + termes à compléter en un seul fichier). |
| `import_enrichissement.py` | jenni | Import semi-auto réponses Jenni (parse→preview→insert avec --confirm) |
| `integrate_fiche_retour.py` | jenni | Intègre un retour Jenni (docx) dans fiche_section_h2_notes — parse H2, extrait citations [N] et termes candidats |
| `reformat_fiches_ris.py` | jenni | Reformate les citations Auteur-année des fiches historiques au format [N] en matchant contre biblio_norm.ris (source unique Zotero) |
| `agent_runner.py` | lib | Pattern préparateur → agents Task → consolidateur. |
| `cli.py` | lib | Helpers CLI partagés (add_db_arg, check_db) |
| `config.py` | lib | Accès centralisé à la table config (get, get_json) |
| `db.py` | lib | Connexion DB centralisée (get_connection) |
| `jenni_format.py` | lib | Formatage des prompts Jenni (markdown, sections) |
| `pub_path.py` | lib | Chemins de publication (Publications/web/, Publications/cartographie/) |
| `repair_json.py` | lib | Module partagé : repair_json() — réparation JSON tronqué/malformé des réponses LLM. |
| `web_template.py` | lib | Template HTML partagé — charte Sol Vivant, render_page, OG tags |
| `attribution.py` | zotero | Attribution Zotero v4.1. |
| `normalise_ris.py` | zotero | Normalisation RIS v2.0. |
| `validate_ris.py` | zotero | Validation RIS v2.1. |
| `inrae.py` | lib | Module partage |
| `sources.py` | lib | Module partage |

## Reproduire le patron pour un autre corpus

1. Creer une DB SQLite avec les tables : `documents`, `prompts`, `terms`, `config`
2. Peupler le thesaurus avec les termes du domaine (FR/EN/definition)
3. Ecrire les prompts (type, chapitre, section, titre_h1, titre_h2, contexte_sci, instructions)
4. Connecter Zotero avec la bibliographie du domaine
5. Utiliser `export_jenni_doc.py` pour generer les prompts
6. Copier-coller dans Jenni, recuperer le .docx
7. Analyser avec Claude, integrer dans `prompt_contenus`

L'architecture est independante du domaine. Seul le contenu change.
