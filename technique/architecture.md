# Architecture technique — Le Sol Vivant cet Holobionte

## Base de donnees : sol_vivant.db

Source unique de verite. SQLite, 35 tables.

### Tables principales

| Table | Role | Enregistrements |
|-------|------|-----------------|
| `documents` | 18 documents du corpus | 18 |
| `prompts` | Structure des sections (type, chapitre, section, titres, contexte, instructions) | 191 |
| `prompt_contenus` | Contenu redige par Jenni, analyse par Claude (1:1 avec prompts) | 12 (S0) |
| `terms` | Thesaurus canonique (FR/EN, definitions, relations) | 377 |
| `term_relations` | Relations entre termes (BT, NT, RT) | 821 |
| `chains_causales` | 6 chaines causales reliant les documents | 6 |
| `chain_etapes` | Etapes des chaines | 43 |
| `doc_cross_refs` | Renvois inter-documents bidirectionnels | 114 |
| `config` | Parametres centralises (api, strates, zotero, analyse, batch, corpus) | 26 |
| `jenni_doc_specs` | Specifications document (titre Jenni, style) | 18 |
| `scripts` | Registre des scripts avec versions | 14 |
| `db_meta` | Historique (audits, scores, todos, idees) | 31 |
| `audit_log` | Journal des operations | ~30 |

### Table config (parametres centralises)

```sql
SELECT categorie, cle, valeur, description FROM config ORDER BY categorie, cle;
```

| Categorie | Cles |
|-----------|------|
| `api` | model, max_tokens, prix session/batch |
| `strates` | noms, couleurs, ordre |
| `zotero` | batch_version, batch_size, seuils |
| `analyse` | passes (JSON), max_tokens |
| `batch` | poll_interval, timeout |
| `corpus` | nom, auteur, regle_jenni |

## Scripts (tools/)

| Script | Module | Role |
|--------|--------|------|
| `export_jenni_doc.py` | jenni | Generation des prompts depuis la table prompts |
| `normalise_ris.py` | zotero | Normalisation incrementale des fichiers RIS |
| `attribution.py` | zotero | Attribution des refs aux documents via Claude Opus |
| `validate_ris.py` | zotero | Validation RIS avant import Zotero |
| `analyse_corpus.py` | batch | Analyse modulaire du corpus (10 passes) |
| `resume_batch.py` | batch | Reprise d'un batch Anthropic |
| `audit_opus.py` | admin | Audit technique et corpus via Opus |
| `session_start.py` | admin | Contexte de demarrage de session |
| `gen_cartography.py` | docs | Cartographie interactive React |
| `gen_html_solvivant.py` | docs | Documentation HTML complete |
| `gen_workflows.py` | docs | Workflows MD par module |
| `sync_scripts.py` | admin | Synchronisation DB ↔ fichiers |
| `config.py` | lib | Lecture centralisee de la table config |
| `pub_path.py` | lib | Resolution chemin Publications/ + horodatage |

## Reproduire le patron pour un autre corpus

1. Creer une DB SQLite avec les tables : `documents`, `prompts`, `terms`, `config`
2. Peupler le thesaurus avec les termes du domaine (FR/EN/definition)
3. Ecrire les prompts (type, chapitre, section, titre_h1, titre_h2, contexte_sci, instructions)
4. Connecter Zotero avec la bibliographie du domaine
5. Utiliser `export_jenni_doc.py` pour generer les prompts
6. Copier-coller dans Jenni, recuperer le .docx
7. Analyser avec Claude, integrer dans `prompt_contenus`

L'architecture est independante du domaine. Seul le contenu change.
