# API externes — architecture d'acquisition et de vérification

Le corpus s'appuie sur **5 API externes** pour l'acquisition, l'enrichissement
et la vérification de ses sources bibliographiques. Ce guide détaille les
phases où ces appels interviennent, les scripts impliqués, et les tables DB
touchées.

## Doctrine : Jenni ≠ source de vérité

```
                    ┌──────────────────────────────────┐
                    │     ScholarAI (Semantic Scholar)  │
                    │   Infrastructure d'évidence brute │
                    └──────────────┬───────────────────┘
                                   │ API ouverte
                    ┌──────────────┼───────────────────┐
                    │              │                   │
              ┌─────▼─────┐  ┌─────▼─────┐      ┌──────▼──────┐
              │  Jenni AI │  │  Scripts  │      │   HAL CCSD  │
              │ (web UI + │  │  corpus   │      │ (dépôts FR) │
              │  couche   │  │ (Python)  │      │  API ouverte│
              │  LLM)     │  │           │      │             │
              └─────┬─────┘  └─────┬─────┘      └──────┬──────┘
                    │              │                   │
                    │    ┌─────────▼─────────┐        │
                    │    │  sol_vivant.db    │◄───────┘
                    └───►│ jenni_sources     │
                         │ source_usages     │
                         │ refs / ref_links  │
                         └───────────────────┘
```

**Jenni = ScholarAI + couche LLM** (synthèse, rédaction). Cette couche ajoute
un **risque d'hallucination** (BQ `wf_source_integration` §fiabilité). Les
scripts du corpus interrogent ScholarAI **directement** — évidence brute,
vérifiable, sans intermédiaire LLM.

## Les 5 API en jeu

| API | Base URL | Auth | Rôle | Script(s) |
|-----|----------|------|------|-----------|
| **ScholarAI** | `api.scholarai.io` | `SCHOLARAI_API_KEY` (64 chars, header `x-scholarai-api-key`) | Découverte + enrichissement + vérification | `scholarai_search.py`, `enrich_scholarai.py`, `enrich_thesaurus_api.py`, `audit_factuel_scholarai.py` |
| **DeepSeek** | `api.deepseek.com` | `DEEPSEEK_API_KEY` (header `Authorization: Bearer`) | Vérification factuelle (gâche 3) + synthèse thésaurus (pipeline hybride). Modèle `deepseek-v4-pro`, thinking activé | `audit_factuel_deepseek.py`, `enrich_thesaurus_api.py` |
| **HAL (CCSD)** | `api.archives-ouvertes.fr` | Aucune (ouverte) | Enrichissement francophone (thèses, papiers INRAE) | `enrich_hal.py` |
| **Crossref** | `api.crossref.org/works` | Polite (mail dans User-Agent) | Résolution DOI (arbitrage) | `resolve_sources_crossref.py`, `audit_factuel_arbitrage.py` |
| **Zotero** | `api.zotero.org` (user 19582809) | `ZOTERO_API_KEY` (env) | Sync citation manager (biblio riche JMJ) | `pull_zotero.py`, `push_zotero_web.py` |

---

## Phase 1 — Découverte (veille bibliographique)

Trouver des papiers candidats sur un sujet, avant intégration consciente.

```
  Requête JMJ (sujet + keywords)
       │  GET /api/abstracts?query=...&keywords=...&sort=cited_by_count
       │  (generative_mode=false → abstract brut, pas de synthèse LLM)
       ▼
  jmj/rapports/veille/scholarai_<slug>_<date>.md
       │  (rapport Markdown pour arbitrage JMJ — JAMAIS d'auto-insert)
       ▼
  JMJ arbitre → integrate_source.py → INSERT jenni_sources + source_usages
```

**Script** : `tools/veille/scholarai_search.py`
**Throttle** : 3s/req (rate limit API 25 req/min)
**Doctrine** : découverte uniquement, l'arbitrage reste humain (BQ `wf_source_integration`)

```bash
python3 tools/veille/scholarai_search.py     --query "soil redox potential Eh measurement"     --keywords "redox potential,soil Eh,field measurement"     --sort cited_by_count --year-start 2018
```

---

## Phase 2 — Enrichissement (remplissage métadonnées)

Remplir les `resume_court` (et `doi`/`url`) manquants dans `jenni_sources`.
Coverage actuelle : **9068/9592 (95%) avec abstract**,
9241 avec DOI.

### 2a. ScholarAI — méthode NL (titre + auteur)

```
  jenni_sources WHERE resume_court IS NULL
       │
       │  query = titre (NL, semantic-friendly — PAS raw DOI)
       │  keywords = 1er auteur (required par /api/abstracts)
       │  generative_mode=false (§3 : abstract brut)
       ▼  match DOI (authoritative) puis fallback similarité titre
       ▼  write-back DOI/URL si source orpheline (fixe audit_sources_orphelines)
  UPDATE jenni_sources SET resume_court=?, doi=?, url=?
```

**Script** : `tools/admin/enrich_scholarai.py`
**Rendement** : ~25-38% sur le résidu (méthode NL post-2026-06-29).
L'ancienne méthode (raw-DOI, `keywords=''`) sous-résolvait l'endpoint sémantique
→ `--retry-failed` re-traite les échecs cache de l'ancienne méthode.
**Throttle** : `veille.scholarai_enrich_throttle_s` (config, défaut 3s)

```bash
# Dry-run (compte + échantillon qualité)
python3 tools/admin/enrich_scholarai.py --db sol_vivant.db
# Bulk + write-back DOI/URL
python3 tools/admin/enrich_scholarai.py --db sol_vivant.db --mode all --apply
# Re-essayer les échec cache (no_result/mismatch/api_error)
python3 tools/admin/enrich_scholarai.py --db sol_vivant.db --retry-failed --apply
```

### 2b. HAL — sources francophones (thèses, INRAE, Hal)

```
  jenni_sources WHERE resume_court IS NULL AND url LIKE '%hal%'
       │  extract halId depuis URL (hal-XXXX / tel-XXXX)
       ▼  GET api.archives-ouvertes.fr/search/?q=halId_s:<id>&fl=abstract_s,doiId_s
       ▼  (préfère abstract FR, récupère DOI bonus si manquant)
  UPDATE jenni_sources SET resume_court=<abstract>, doi=<doiId_s?>
```

**Script** : `tools/admin/enrich_hal.py` · **Throttle** : 1s (API ouverte)

### 2c. Zotero — sync retour (biblio riche JMJ)

Zotero (bibliothèque JMJ, user 19582809) est la source **riche** (abstracts,
PDF, tags). `pull_zotero` synchronise vers `jenni_sources` (non-destructif,
champs vides seulement) — complète ScholarAI/HAL sur ce que JMJ a curé à la main.

```bash
python3 tools/admin/pull_zotero.py --db sol_vivant.db        # dry-run
python3 tools/admin/pull_zotero.py --db sol_vivant.db --apply
```

### Bilan enrichissement combiné

Les voies sont **complémentaires** : ScholarAI couvre l'international, HAL le
francophone (thèses/dépôts INRAE/CIRAD), Zotero la curation manuelle JMJ. La
**dette résiduelle** (littérature grise : CTAHR, manuels KNF/EM, cours) est
API-résistante — soncanonical source est le PDF local (`source_docx`).

---

## Phase 3 — Vérification (arbitrage factuel)

Vérifier que les citations (Auteur, Année) d'une fiche correspondent à des
papiers réels. Détection d'hallucinations Jenni (BQ `wf_audit_factuel`).

```
  fiche #N (contenu intégré)
       │  extrait (surname, year) de chaque citation APA inline "(Auteur, Année)"
       ▼  GET /api/abstracts?query=<sujet>&keywords=<fiche_slug>&start_year=<an-1>&end_year=<an+1>
  ┌─────────────────────────────────────────┐
  │ [CONFIRMÉ]      auteur + année exacts   │
  │ [ANNÉE ERRONÉE] auteur trouvé, ≠ année  │  → corriger l'année
  │ [INTROUVABLE]   auteur absent du sujet  │  → suspection hallucination
  └─────────────────────────────────────────┘
       ▼  jmj/rapports/audit/verification_scholarai_fiche<N>_<date>.md
       (rapport pour arbitrage JMJ — aucune auto-modification DB)
```

**Script** : `tools/admin/audit_factuel_scholarai.py` · **Throttle** : 3s/citation

---

## Phase 4 — Acquisition profonde (fulltext — chantier bloqué)

Lecture du texte intégral et Q&A ciblé (`/api/fulltext`, `/api/question`,
`/api/analyze_project`). **Statut 2026-06-29 : endpoints testés et bloqués.**

**Contrainte clé confirmée** : `/api/fulltext?pdf_id=PDF_URL:<url>` retourne
**404** même sur des PDFs open-access (PMC) — "publishers block programmatic
access". `add_to_project?paper_id=DOI:` échoue aussi (403 sur le download).
Le hint ScholarAI lui-même : *"manually upload the PDF to a project"*.

→ L'acquisition profonde exige le projet **`sol_vivant_corpus`** (doctrine §5)
alimenté par **upload PDF manuel** (étape JMJ). Ce n'est pas un chemin API-only.

---

## Phase 5 — Bypass Jenni thésaurus (defs) — chantier partiel

Remplacer le round-trip docx Jenni (`enrich_thesaurus --export` → Jenni → import)
par appel API direct pour les définitions thésaurus incomplètes.

```
  termes WHERE length(definition) < 150
       │  GET /api/abstracts?query=<EN>&keywords=<strate>&generative_mode=true
       ▼  (le generative = moteur Jenni, mais answer TRONQUÉE ~180c)
       ▼  + découverte papiers pertinents → mirror jenni_sources
  rapport MD jmj/rapports/audit/thesaurus_api_<axis>_<date>.md
       (draft EN pour relecture JMJ — jamais d'écrasement de terms.fr/definition)
```

**Script** : `tools/admin/enrich_thesaurus_api.py`
**Verdict validation** : découverte excellente (papiers pertinents), MAIS
l'answer API est tronquée (~180c) — insuffisant pour une def complète (les defs
thésaurus font 400-500c). **Jenni reste l'outil de synthèse full-text** ; le
script est utile comme **discovery + mirror** (trouve et verse les papiers),
la rédaction def reste Jenni/analyze_project.

---

## Tables DB impliquées

| Table | Effectif | Rôle | Phase(s) | L/E |
|-------|----------|------|----------|-----|
| `jenni_sources` | 9592 | Métadonnées sources (DOI, auteurs, `resume_court`) | 1, 2, 4, 5 | R+W |
| `source_usages` | 18891 | Liens sources ↔ entités (fiches, prompts, cards) | 1, 4 | W |
| `refs` | 364 | Évidence chiffrée typée (kind, valeur, `source_id`) | 4 | W |
| `ref_links` | 1295 | Liens génériques refs ↔ targets | 4 | W |
| `audit_log` | — | Journal des opérations (chaque UPDATE batch) | 2, 5 | W |

---

## Antisymétrie : ScholarAI direct vs Jenni

| Critère | ScholarAI direct (scripts) | Jenni (web UI) |
|---------|---------------------------|----------------|
| Évidence | Brute (abstract, métadonnées) | Synthétisée (bloc Références rédigé) |
| Hallucination | Aucune (données brutes) | Risque (couche LLM) |
| Vérifiabilité | DOI + abstract traçables | Citations à re-vérifier |
| Francophone | HAL compble ; ScholarAI = biais US (§5) | Idem backend |
| Automatisation | Scripts (bulk, reprise, throttle) | Manuel (paste prompt → docx) |
| Coût | API pay-per-task ; plan premium illimité JMJ | Inclus dans abonnement |
| Rédaction full-text | Limitée (answer ~180c tronquée) | ✅ RAG full-text (analyseur) |

**Règle pratique** : pour le **sourçage amont** (réunir les refs AVANT
rédaction), ScholarAI direct est supérieur. Pour la **rédaction** (synthèse
narrative, defs longues), Jenni reste l'outil — mais ses valeurs chiffrées
doivent être **recroisées** avec les sources primaires.

---

## Config et authentification

Les clés API sont lues par `lib.config.get_secret()` — loader centralisé (Phase 2
restructuration 2026-06-30). Ordre de résolution : **export shell (`~/.bashrc`) >
fichier `.env` à la racine** (gitignoré, voir `.env.example`). Aucune clé n'est
jamais stockée en DB ni committée.

| Config | Emplacement | Détail |
|--------|-------------|--------|
| `SCHOLARAI_API_KEY` | `.env` (racine) ou export shell | 64 chars, header `x-scholarai-api-key` |
| `ZOTERO_API_KEY` | `.env` (racine) ou export shell | API web Zotero (library + write) |
| `DEEPSEEK_API_KEY` | `.env` (racine) ou export shell | DeepSeek V4 pro (gâche 3 factuel + pipeline hybride thésaurus). Modèle + thinking pilotés par config DB (`api.deepseek_*`) |
| `veille.scholarai_enrich_throttle_s` | Table `config` DB | Throttle enrichment ScholarAI (défaut 3.0) |
| HAL / Crossref | Aucune auth | APIs publiques |

**Mise en place** : `cp .env.example .env` puis renseigner les 3 clés.

## Voir aussi

- BQ `doctrine_scholarai_couche_evidence` — statut épistémologique + catalogue endpoints définitif
- BQ `doctrine_deepseek_api` — intégration API DeepSeek (V4 pro, thinking, dépréciation reasoner)
- BQ `workflow_zotero_biblio` — sync Zotero ↔ jenni_sources
- BQ `wf_audit_factuel` — workflow vérification factuelle (gâche 3)
- BQ `wf_source_integration` — workflow intégration source (arbitrage conscient)
- `architecture.md` — architecture DB générale
- `gestion_sessions.md` — cycle de session
