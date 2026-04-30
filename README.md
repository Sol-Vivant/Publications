# Le Sol Vivant cet Holobionte — Tools

Outils de production du corpus scientifique francophone sur l'agriculture régénératrice et la biologie des sols.

**Auteur** : Jean-Michel Juzan
**Licence** : CC BY-SA 4.0

## Le projet

Un corpus de 18 documents scientifiques sur l'agriculture régénératrice et la biologie des sols, organisé en 5 strates thématiques (Fondements, Sol, Vivant, Pratiques, Humain).

**L'originalité** : une base de données unique (`sol_vivant.db`) orchestre tout le projet — du thésaurus terminologique aux pages web interactives, en passant par la rédaction assistée. Claude (Anthropic) assure la cohérence scientifique, les connexions inter-documents et la maintenance du code. Jenni AI assemble les citations depuis la biblio interne curée.

### Le corpus en chiffres

- **18 documents** répartis en 5 strates
- **1195 termes** canoniques (français/anglais) — 65.8% documentés, 100.0% définis
- **28 chaînes causales** et **118 renvois** inter-documents
- **105 fiches conceptuelles** et **191 prompts** structurés
- **10 pages web** interactives (calculateurs, cartographie, triangle des textures)
- **59 tables** SQLite, 50 scripts Python

### Les forces de cette architecture

- **Source unique de vérité** : tout est dans `sol_vivant.db` — pas de fichiers éparpillés, pas de doublons
- **Zéro hardcodage** : les textes, formules et données des pages web viennent de la DB, pas du code
- **Claude Code intégré** : développement, audit, analyse et maintenance du corpus en conversation directe
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
├── sol_vivant.db              Source unique de vérité (SQLite)
├── tools/
│   ├── admin/                  audit_opus, backfill_biblio, bq_query, check_integrity, deploy_publications, explorer, export_biblio, export_tools, fix_titres, integrate_doc_docx, relink_fiche_refs, session_end, session_start
│   ├── batch/                  analyse_corpus
│   ├── docs/                   gen_archive, gen_cahier, gen_concept_cards, gen_esclaves_calc, gen_explorer, gen_lifofer, gen_mo_calc, gen_readme, gen_reports, gen_technique, gen_triangle_textures, gen_web, gen_workflows
│   ├── jenni/                  enrich_thesaurus, export_fiche, export_jenni_doc, export_validation, gen_fiche_docx, gen_prompt_completion, gen_prompt_enrichissement, gen_prompt_thesaurus, import_enrichissement
│   ├── lib/                    agent_runner, biblio_format, cli, concept_cards, config, db, glossary, jenni_format, pub_path, repair_json, web_template
├── docx/                      Documents .docx et .ris
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
                               Claude (analyse) → prompt_contenus
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

L'architecture est **modulaire** et **indépendante du domaine**. Le cœur du système — une base SQLite pilotée par Claude Code — fonctionne de manière autonome.

**Le noyau** (suffisant seul) : Claude Code + une DB SQLite. On peut construire un corpus complet en conversation directe : documents, thésaurus, pages web interactives, scripts de génération.

**Les couches optionnelles** : Jenni AI (rédaction académique), API Anthropic batch (traitement en masse). On les active selon le projet.

**Exemples** : solutions low-tech, guide de permaculture, base médicale, patrimoine architectural... le patron fonctionne pour tout domaine ayant besoin de structurer des connaissances avec un vocabulaire technique.

**SQLite + Git** : la base SQLite est un fichier unique, portable, qui fonctionne partout sans serveur — idéal pour des projets embarqués ou isolés de toute connexion. Git versionne le projet (recommandé), mais on peut aussi simplement échanger le fichier `.db` avec Claude dans une session web ou desktop.

Voir [Reproduire le patron]({GITHUB_PUB_URL}) pour le guide complet.
