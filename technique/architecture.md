# Architecture technique — Le Sol Vivant cet Holobionte

## Base de donnees : sol_vivant.db

Source unique de verite. SQLite, 58 tables, 7 vues.

### Tables principales

| Table | Role | Enregistrements |
|-------|------|-----------------|
| `documents` | 18 documents du corpus | 18 |
| `prompts` | Structure des sections (type, chapitre, section, titres, contexte, instructions) | 191 |
| `prompt_contenus` | Contenu redige par Jenni, analyse par Claude (1:1 avec prompts) | 12 |
| `terms` | Thesaurus canonique (FR/EN, definitions, relations) | 961 |
| `term_relations` | Relations entre termes (BT, NT, RT) | 6793 |
| `chains_causales` | 16 chaines causales reliant les documents | 16 |
| `chain_etapes` | Etapes des chaines | 121 |
| `doc_cross_refs` | Renvois inter-documents bidirectionnels | 118 |
| `config` | Parametres centralises (api, strates, analyse, batch, corpus) | 95 |
| `jenni_doc_specs` | Specifications document (titre Jenni, style) | 18 |
| `scripts` | Registre des scripts avec versions | 42 |
| `db_meta` | Historique (audits, scores, todos, idees) | 10 |
| `audit_log` | Journal des operations | 4529 |

### Tables web et outils interactifs

| Table | Role | Enregistrements |
|-------|------|-----------------|
| `web_pages` | Pages web (slug, titre, OG tags) | 13 |
| `html_templates` | Templates CSS/JS par page + partagés | 41 (2 partagés) |
| `concept_cards` | Fiches conceptuelles synthétiques | 91 |
| `diagnostic_rules` | Règles diagnostiques sol | 26 |
| `cascade_niveaux` | Niveaux de la cascade prérequis | 6 |
| `illustration_prompts` | Diagrammes Mermaid générés | 15 |
| `refs` (kind=matiere) | Matières organiques (C/N, k1, NPK) | 110 |
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
| `audit` | min_bigram_chars, warn_docs_isoles, warn_terms_sans_def |
| `cahier` | chapitres, onglets, tab_descriptions |
| `claude_rules` | agent_runner_reflexe, archivage_fiches, audit_cards_first, bq_access, fiche_docx_production, parser_docx_omath, pas_agent_redacteur, pas_modif_fr_canonique |
| `concept_cards` | page_intro, tab_intros |
| `corpus` | auteur, nom, regle_jenni |
| `deprecation` | fiche_section_h2_notes |
| `esclaves_calculateur` | tab_intros |
| `index` | tab_cards, tab_cascade, tab_chaines, tab_connections, tab_crossrefs, tab_documents, tab_illustrations, tab_thesaurus |
| `jenni` | prompt_enrichissement_definitions_vagues, prompt_enrichissement_thesaurus, prompt_redaction_pedagogique, prompt_resolution_doublons, prompt_validation_chaine_causale |
| `lifofer` | comprendre, data, sources_sucre, tab_intros, ui |
| `mo_calc` | cat_colors, modes_transformation, zones_eh_fallback |
| `mo_calculateur` | comprendre, tab_intros |
| `paths` | analyses_reports, docx_archives, docx_en_cours, jmj_archives, jmj_docx, jmj_notes, jmj_pdf, publications_web, publications_workflows, rapports_audit, rapports_session, recherches_archives, recherches_fiches, recherches_sources, recherches_thesaurus, recherches_veille |
| `projet` | base_url_publications, github_org_url, github_pages_url, github_publications_url, github_repo_url, github_tools_url |
| `strates` | couleurs, couleurs_cascade, couleurs_light, descriptions, noms, ordre |
| `technique` | chapitres |
| `tests_terrain` | tab_intros |
| `transition_robuste` | tab_intros |
| `triangle` | comprendre, sections_didactiques, tab_intros, test_bocal, test_boudin |
| `veille` | hot_topics, scholar_alerts |
| `web` | icon_library, index_description_template |

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
| `integrate_doc_docx.py` | admin | Integration docx redige (document de strate) -> doc_contenus.contenu_integre. |
| `session_start.py` | admin | Contexte session v2.3. |
| `analyse_corpus.py` | batch | Analyse modulaire corpus v4.1. |
| `gen_archive.py` | docs | Génère une archive ZIP hors-ligne du site Sol Vivant (pages + vendor + images) |
| `gen_cahier.py` | docs | Cahier de Science — livre pédagogique multi-chapitres (MO/POM-MAOM, Textures, Fermentations) |
| `gen_esclaves_calc.py` | docs | Calculateur Esclaves Energetiques : web page avec saisie combustible + quantite annuelle, calcul du nombre d equivalents humains au travail. |
| `gen_explorer.py` | docs | Génération page Explorer DB statique |
| `gen_lifofer.py` | docs | Calculateur interactif LiFoFer v1 |
| `gen_mo_calc.py` | docs | Calculateur interactif Matière Organique — formule de Kirkby, mélanges, analyse sols. |
| `gen_readme.py` | docs | Génération dynamique de tous les README depuis la DB. |
| `gen_reports.py` | docs | Génère les rapports d'audit depuis audit_reports → jmj/analyses/reports/ |
| `gen_technique.py` | docs | Guide Technique (Publications/technique/index.html) — architecture, méthode, portabilité du patron. |
| `gen_triangle_textures.py` | docs | Triangle des textures interactif — classification USDA des sols. |
| `gen_web.py` | docs | Cartographie React interactive v1.1 (web public). |
| `gen_workflows.py` | docs | Génération des workflows horodatés par module. |
| `enrich_thesaurus.py` | jenni | Pipeline unifie enrichissement thesaurus : audit (par axe bt/syn/def et strate) -> export lot de 10 pour Jenni -> import retour (parse TERME/EN/DEF/... |
| `export_fiche.py` | jenni | Export prompts fiches transversales depuis la DB. |
| `export_jenni_doc.py` | jenni | Génération prompts Jenni v3.1. |
| `export_validation.py` | jenni | Génération des prompts de validations depuis validation_sections. |
| `gen_fiche_docx.py` | jenni | Generateur de fiche .docx au format "document dans son etat courant" (doctrine wf_fiche). |
| `gen_prompt_completion.py` | jenni | Génère un prompt Jenni pour compléter les champs manquants (BT, RT, SYN_FR, SYN_EN) de termes déjà existants dans le thésaurus. |
| `gen_prompt_enrichissement.py` | jenni | Génère un prompt Jenni d'enrichissement thésaurus depuis liste/JSON/final_consolide (filtres criticité, strate, doc_cible) |
| `gen_prompt_thesaurus.py` | jenni | Génère un prompt Jenni UNIFIÉ par strate (nouveaux termes + termes à compléter en un seul fichier). |
| `import_enrichissement.py` | jenni | Import semi-auto réponses Jenni (parse→preview→insert avec --confirm) |
| `agent_runner.py` | lib | Pattern préparateur → agents Task → consolidateur. |
| `cli.py` | lib | Helpers CLI partagés (add_db_arg, check_db) |
| `config.py` | lib | Accès centralisé à la table config (get, get_json) |
| `db.py` | lib | Connexion DB centralisée (get_connection) |
| `jenni_format.py` | lib | Formatage des prompts Jenni (markdown, sections) |
| `pub_path.py` | lib | Chemins de publication (Publications/web/, Publications/cartographie/) |
| `repair_json.py` | lib | Module partagé : repair_json() — réparation JSON tronqué/malformé des réponses LLM. |
| `web_template.py` | lib | Template HTML partagé — charte Sol Vivant, render_page, OG tags |
| `weekly_scan.py` | veille | Veille PubMed hebdomadaire : balaye config.veille.hot_topics, dedoublonne contre pubmed_seen, produit rapport Markdown des nouveaux candidats dans recherches/veille/ |
| `inrae.py` | lib | Module partage |
| `parse_jenni_docx.py` | lib | Module partage |
| `refs.py` | lib | Module partage |
| `sources.py` | lib | Module partage |
| `term_rels.py` | lib | Module partage |

## Reproduire le patron pour un autre corpus

1. Creer une DB SQLite avec les tables : `documents`, `prompts`, `terms`, `config`
2. Peupler le thesaurus avec les termes du domaine (FR/EN/definition)
3. Ecrire les prompts (type, chapitre, section, titre_h1, titre_h2, contexte_sci, instructions)
4. Alimenter la biblio interne (`jenni_sources`) avec les sources primaires
5. Utiliser `export_jenni_doc.py` pour generer les prompts
6. Copier-coller dans Jenni, recuperer le .docx
7. Analyser avec Claude, integrer dans `prompt_contenus`

L'architecture est independante du domaine. Seul le contenu change.
