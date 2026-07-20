# Le Sol Vivant cet Holobionte — Tools

Outils de production du corpus scientifique francophone sur l'agriculture régénératrice et la biologie des sols.

**Auteur** : Jean-Michel Juzan
**Licence** : MIT

## Le projet

Un corpus de 18 documents scientifiques sur l'agriculture régénératrice et la biologie des sols, organisé en 5 strates thématiques (Fondements, Sol, Vivant, Pratiques, Humain).

**L'originalité** : une base de données unique (`sol_vivant.db`) orchestre tout le projet — du thésaurus terminologique aux pages web interactives, en passant par la rédaction assistée. LLM assure la cohérence scientifique, les connexions inter-documents et la maintenance du code. Jenni AI assemble les citations depuis la biblio interne curée.

### Le corpus en chiffres

- **18 documents** répartis en 5 strates
- **4048 termes** canoniques (français/anglais) — 100.0% documentés, 100.0% définis
- **45 chaînes causales** et **0 renvois** inter-documents
- **237 fiches conceptuelles** et **192 prompts** structurés
- **10 pages web** interactives (calculateurs, cartographie, triangle des textures)
- **51 tables** SQLite, 137 scripts Python

### Les forces de cette architecture

- **DB = source de vérité données** (`sol_vivant.db`) ; **scripts versionnés par git** dans `tools/`
- **Zéro hardcodage** : les textes, formules et données des pages web viennent de la DB, pas du code
- **LLM intégré** : développement, audit, analyse et maintenance du corpus en conversation directe
- **Hors-ligne natif** : toutes les pages fonctionnent sans internet (vendor local)
- **Reproductible** : l'architecture est indépendante du domaine — seul le contenu change

## Démarrage rapide

```bash
git clone {GITHUB_TOOLS_URL}.git
cd Tools
python3 tools/admin/session_start.py --db sol_vivant.db
```

Les scripts génèrent les fichiers dans `Publications/` (prompts, cartographie, workflows, journal).

## Architecture

```
Tools/
├── sol_vivant.db              Source de vérité données (SQLite)
├── tools/
│   ├── admin/                  analyse_emergences, analyse_fiches, audit_anglicismes, audit_bq_deepseek, audit_bq_legacy_ids, audit_bq_verify, audit_bt, audit_canoniques_anglais, audit_center, audit_corpus_relations, audit_factuel_arbitrage, audit_factuel_deepseek, audit_fiche_md_deepseek, audit_fiches, audit_focus, audit_meta, audit_repartition, audit_revue_bq_scripts, audit_sources_orphelines, audit_thesaurus, backfill_biblio, backup_rotation, bq_query, build_inrae_matches, check_forbidden_jenni, check_integrity, conseil_emergences, dedupe_thesaurus, deploy_publications, diag_refs, dump_db_sql, enrich_hal, enrich_sources_crossref, enrich_thesaurus_s2, explorer, export_biblio, export_mismatches_inrae, export_termes_candidats, export_zotero, fix_sections_h2_inline, fix_sections_titre_repete, gen_agents_md, gen_pending_template, ingest_structured_links, integrate_resolved_cites, migrate_refs, pedago_links_apply, pedago_links_suggest, pull_zotero, purge_audit_log, push_zotero, push_zotero_web, repair_sections_batch_20260704, resolve_sources_crossref, resolve_term_relations, run_thesaurus_batches, session_end, session_start, sync_syn_inrae, verify_citations
│   ├── batch/                  analyse_corpus
│   ├── docs/                   gen_archive, gen_bq_page, gen_cahier, gen_concept_cards, gen_dashboard, gen_esclaves_calc, gen_explorer, gen_fiches_index, gen_illustration_prompts, gen_lifofer, gen_mo_calc, gen_readme, gen_scripts, gen_technique, gen_tests_terrain, gen_transition_robuste, gen_triangle_textures, gen_web, gen_workflows
│   ├── integration/            enrich_thesaurus, export_thesaurus_incomplets, export_validation, import_termes, integrate_fiche, integrate_fiche_refs, integrate_source, integrate_validation_refs, resolve_import_conflicts
│   ├── lib/                    agent_context, agent_guards, agent_report, agent_runner, agent_thinking, apa, api_urls, audit_persist, audit_post_import, audit_report, biblio_format, bq_inventory, cli, concept_cards, config, db, deepseek_client, deepseek_meta, doc_archive, docx_index, fiche_archive, fiche_text, glossary, http_client, inrae, parse_jenni_docx, parse_jenni_md, prompt_format, pub_path, refs, repair_json, reports_inventory, scripts_inventory, section, source_enrich, term_rels, text_norm, thesaurus_completion, web_template
├── docx/                      Documents .docx (retours Jenni)
├── jmj/                       Documents de travail
└── Publications/web/           Pages web (→ rsync vers dépôt Pages)
    ├── vendor/                Dépendances JS/CSS (hors-ligne)
    └── img/                   Images et previews
```

## Le workflow

```
sol_vivant.db → export_jenni_doc.py → prompts/
                                        ↓
                               Jenni AI (biblio curée) → .docx
                                        ↓
                               Publications/ (contenu accessible)
```

## Les strates

| Strate | Code | Documents | Description |
|--------|------|-----------|-------------|
| **Fondements** | F | F1, F2 | Les Fondements posent le cadre historique et économique du corpus. |
| **Sol** | S | S0, S1, S2, S3, S4 | La strate Sol décrit la matrice physique, chimique et biologique. |
| **Vivant** | V | V1, V2, V3 | La strate Vivant couvre la faune du sol, l'holobionte plante-microbiome et les fermentations microbiennes. |
| **Pratiques** | P | P1, P2, P3, P4, P5 | La strate Pratiques traduit la science en action : diagnostic terrain, agriculture de conservation (3 piliers ACS), biostimulants, agroforesterie, et la trajectoire de transition vers un sol vivant. |
| **Humain** | H | H1, H2, H3 | La strate Humain relie le sol à la santé. |

## Réutiliser cette architecture

L'architecture est **modulaire** et **indépendante du domaine**. Le cœur du système — une base SQLite pilotée par LLM — fonctionne de manière autonome.

**Le noyau** (suffisant seul) : LLM + une DB SQLite. On peut construire un corpus complet en conversation directe : documents, thésaurus, pages web interactives, scripts de génération.

**Les couches optionnelles** : Jenni AI (rédaction académique), agents Task pour le traitement en masse (`agent_runner.py`). On les active selon le projet.

**Exemples** : solutions low-tech, guide de permaculture, base médicale, patrimoine architectural... le patron fonctionne pour tout domaine ayant besoin de structurer des connaissances avec un vocabulaire technique.

**SQLite + Git** : la base SQLite est un fichier unique, portable, qui fonctionne partout sans serveur — idéal pour des projets embarqués ou isolés de toute connexion. Git versionne le projet (recommandé), mais on peut aussi simplement échanger le fichier `.db` avec LLM dans une session web ou desktop.

Voir [Reproduire le patron]({GITHUB_PUB_URL}) pour le guide complet.
