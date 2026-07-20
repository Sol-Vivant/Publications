# API externes — architecture d'acquisition et de vérification

Le corpus s'appuie sur **5 API externes** pour l'acquisition, l'enrichissement
et la vérification de ses sources bibliographiques. Ce guide détaille les
phases où ces appels interviennent, les scripts impliqués, et les tables DB
touchées.

## Architecture post-ménage 2026-07

```
                    ┌──────────────────────────────────┐
                    │   Semantic Scholar Academic Graph │
                    │   214M papiers · 2.49B citations  │
                    │   API gratuite (juge de vérité)   │
                    └──────────────┬───────────────────┘
                                   │ API ouverte (graph/v1)
                    ┌──────────────┼───────────────────┐
                    │              │                   │
              ┌─────▼─────┐  ┌─────▼─────┐      ┌──────▼──────┐
              │ DeepSeek  │  │  Scripts  │      │   HAL CCSD  │
              │ V4 Pro    │  │  corpus   │      │ (dépôts FR) │
              │ (coordinateur│ (Python) │      │  API ouverte│
              │  + rédacteur)│          │      │             │
              └─────┬─────┘  └─────┬─────┘      └──────┬──────┘
                    │              │                   │
                    │    ┌─────────▼─────────┐        │
                    │    │  sol_vivant.db    │◄───────┘
                    └───►│ sources     │
                         │ source_usages     │
                         │ refs / ref_links  │
                         └───────────────────┘
```

**Rôles** (paradigme agent pilote 2026-07-13 : Jenni, ScholarAI et DeepSeek Session A supprimés) :
- **Subagents Task** = rédacteurs (sous supervision GLM+JMJ, DB read-only pendant la production) → produisent
  fiches MD natives + thésaurus. Handoff par manifeste vers intégration consciente.
- **Semantic Scholar** = juge de **vérité** du Conseil (arbitrage factuel via
  `audit_factuel_arbitrage.py`). API gratuite, aucune couche LLM, évidence brute.
- **L'orchestrateur** (agent primaire, modèle choisi par JMJ au sélecteur) = orchestration + intégration (écriture DB avec Conseil d'audit).

## Les 5 API en jeu

| API | Base URL | Auth | Rôle | Script(s) |
|-----|----------|------|------|-----------|
| **Semantic Scholar** | `api.semanticscholar.org/graph/v1` | `SEMANTIC_SCHOLAR_API_KEY` (optionnelle, sinon 1000 req/s partagé) | Découverte + enrichissement + vérification factuelle (juge de vérité du Conseil) | `semantic_scholar.py`, `audit_factuel_arbitrage.py` |
| **DeepSeek** | `api.deepseek.com` | `DEEPSEEK_API_KEY` (header `Authorization: Bearer`) | Audit factuel + cohérence + synthèse thésaurus. Modèle `deepseek-v4-pro`, thinking activé | `audit_factuel_deepseek.py`, `audit_bq_deepseek.py`, `enrich_thesaurus.py` |
| **HAL (CCSD)** | `api.archives-ouvertes.fr` | Aucune (ouverte) | Enrichissement francophone (thèses, papiers INRAE) | `enrich_hal.py` |
| **Crossref** | `api.crossref.org/works` | Polite (mail dans User-Agent) | Résolution DOI (arbitrage) | `resolve_sources_crossref.py`, `audit_factuel_arbitrage.py` |
| **Zotero** | `api.zotero.org` (user 19582809) | `ZOTERO_API_KEY` (env) | Sync citation manager (biblio riche JMJ) | `pull_zotero.py`, `push_zotero_web.py` |

---

## Phase 1 — Enrichissement (remplissage métadonnées)

Remplir les `resume_court` (et `doi`/`url`) manquants dans `sources`.
Coverage actuelle : **9407/10098 (93%) avec abstract**,
9668 avec DOI.

### 2a. Semantic Scholar — découverte paper (DOI / titre)

```
  sources WHERE resume_court IS NULL
       │
       │  GET /paper?query=<titre>&fields=abstract,doi,authors,...
       │  (ou GET /paper/DOI:<doi> si DOI connu)
       ▼  match DOI (authoritative) puis fallback similarité titre
       ▼  write-back DOI/URL si source orpheline
  UPDATE sources SET resume_court=?, doi=?, url=?
```

**Client** : `tools/veille/semantic_scholar.py` (`SemanticScholarClient`)
**Règle absolue** : JAMAIS d'auto-insert — JMJ arbitre chaque paper.

### 2b. HAL — sources francophones (thèses, INRAE, Hal)

```
  sources WHERE resume_court IS NULL AND url LIKE '%hal%'
       │  extract halId depuis URL (hal-XXXX / tel-XXXX)
       ▼  GET api.archives-ouvertes.fr/search/?q=halId_s:<id>&fl=abstract_s,doiId_s
       ▼  (préfère abstract FR, récupère DOI bonus si manquant)
  UPDATE sources SET resume_court=<abstract>, doi=<doiId_s?>
```

**Script** : `tools/admin/enrich_hal.py` · **Throttle** : 1s (API ouverte)

### 2c. Zotero — sync retour (biblio riche JMJ)

Zotero (bibliothèque JMJ, user 19582809) est la source **riche** (abstracts,
PDF, tags). `pull_zotero` synchronise vers `sources` (non-destructif,
champs vides seulement) — complète Semantic Scholar/HAL sur ce que JMJ a curé
à la main.

```bash
python3 tools/admin/pull_zotero.py --db sol_vivant.db        # dry-run
python3 tools/admin/pull_zotero.py --db sol_vivant.db --apply
```

### Bilan enrichissement combiné

Les voies sont **complémentaires** : Semantic Scholar couvre l'international,
HAL le francophone (thèses/dépôts INRAE/CIRAD), Zotero la curation manuelle JMJ.
La **dette résiduelle** (littérature grise : CTAHR, manuels KNF/EM, cours) est
API-résistante — sa source canonique est le PDF local (`source_docx`).

---

## Phase 3 — Vérification factuelle (juge de vérité du Conseil)

Vérifier que les citations (Auteur, Année) d'une fiche correspondent à des
papiers réels. Détection d'hallucinations (BQ `wf_audit_factuel`). **Semantic
Scholar est le juge de vérité externe du Conseil** (`conseil_modele`).

```
  fiche #N (contenu intégré)
       │  extrait (surname, year) de chaque citation APA inline "(Auteur, Année)"
       ▼  Semantic Scholar + Crossref (résolution DOI croisée)
  ┌─────────────────────────────────────────┐
  │ [CONFIRMÉ]      auteur + année exacts   │
  │ [ANNÉE ERRONÉE] auteur trouvé, ≠ année  │  → corriger l'année
  │ [INTROUVABLE]   auteur absent du sujet  │  → suspection hallucination
  └─────────────────────────────────────────┘
       ▼  jmj/rapports/audit/verification_fiche<N>_<date>.md
       (rapport pour arbitrage JMJ — aucune auto-modification DB)
```

**Scripts** :
- `tools/admin/audit_factuel_arbitrage.py` — pipeline S2 (Semantic Scholar) + Crossref
- `tools/admin/audit_factuel_deepseek.py` — relecture DeepSeek (contexte corpus injecté)

---

## Tables DB impliquées

| Table | Effectif | Rôle | Phase(s) | L/E |
|-------|----------|------|----------|-----|
| `sources` | 10098 | Métadonnées sources (DOI, auteurs, `resume_court`) | 1, 2, 3 | R+W |
| `source_usages` | 19852 | Liens sources ↔ entités (fiches, prompts, cards) | 1 | W |
| `refs` | 364 | Évidence chiffrée typée (kind, valeur, `source_id`) | 3 | W |
| `ref_links` | 1295 | Liens génériques refs ↔ targets | 3 | W |
| `audit_log` | — | Journal des opérations (chaque UPDATE batch) | 2 | W |

---

## Config et authentification

Les clés API sont lues par `lib.config.get_secret()` — loader centralisé. Ordre
de résolution : **export shell (`~/.bashrc`) > fichier `.env` à la racine**
(gitignoré, voir `.env.example`). Aucune clé n'est jamais stockée en DB ni
committée.

| Config | Emplacement | Détail |
|--------|-------------|--------|
| `SEMANTIC_SCHOLAR_API_KEY` | `.env` (racine) ou export shell | Optionnelle (1000 req/s partagé sans clé ; 1 RPS dédié avec) |
| `DEEPSEEK_API_KEY` | `.env` (racine) ou export shell | DeepSeek V4 pro (audit factuel + vérification cohérence, API appelée par l'orchestrateur GLM). Modèle + thinking pilotés par config DB (`api.deepseek_*`) |
| `ZOTERO_API_KEY` | `.env` (racine) ou export shell | API web Zotero (library + write) |
| HAL / Crossref | Aucune auth | APIs publiques |

**Mise en place** : `cp .env.example .env` puis renseigner les clés.

## Voir aussi

- BQ `doctrine_deepseek_api` — intégration API DeepSeek (V4 pro, thinking, dépréciation reasoner)
- BQ `wf_fiche_production` — workflow production fiche (**OBSOLÈTE**, `is_active: false`, workflow Session A abandonné)
- BQ `wf_fiche_integration` — workflow intégration (GLM + Conseil d'audit)
- BQ `conseil_modele` — Conseil (Semantic Scholar = juge de vérité externe)
- BQ `wf_audit_factuel` — workflow vérification factuelle
- BQ `wf_source_integration` — workflow intégration source (arbitrage conscient)
- `architecture.md` — architecture DB générale
- `gestion_sessions.md` — cycle de session
