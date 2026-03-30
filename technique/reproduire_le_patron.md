# Reproduire le patron pour un autre corpus

## Principe

L'architecture Sol Vivant est un **patron generique** pour la production de corpus scientifiques structures. Elle s'appuie sur 3 outils :

- **Zotero** : gestion bibliographique (sources academiques)
- **Jenni AI** : redaction par assemblage de citations (moteur de recherche academique deguise en redacteur)
- **Claude** (Anthropic) : analyse, coherence terminologique, connexions inter-documents

La **base SQLite** est la source unique de verite : thesaurus, structure des documents, parametres, historique.

## Exemple : assistant psychiatrie TDAH enfants/adolescents

### Etape 1 — Definir le corpus

| Strate | Documents |
|--------|-----------|
| Fondements | Histoire du TDAH, neurobiologie |
| Diagnostic | Criteres DSM-5, diagnostic differentiel, comorbidites |
| Traitements | Pharmacologie, TCC, remediations cognitives |
| Famille | Guidance parentale, amenagements scolaires |
| Outils | Fiches FALC, supports visuels, echelles |

### Etape 2 — Creer la base

```sql
CREATE TABLE documents (code TEXT PRIMARY KEY, strate TEXT, titre TEXT);
CREATE TABLE terms (id INTEGER PRIMARY KEY, fr TEXT, en TEXT, definition TEXT, doc_code TEXT);
CREATE TABLE prompts (id INTEGER PRIMARY KEY, doc_code TEXT, type TEXT, chapitre INTEGER,
    section INTEGER, titre_h1 TEXT, titre_h2 TEXT, contexte_sci TEXT, instructions TEXT, ordre INTEGER);
CREATE TABLE config (categorie TEXT, cle TEXT, valeur TEXT, type TEXT, description TEXT,
    PRIMARY KEY (categorie, cle));
```

### Etape 3 — Peupler le thesaurus

Le thesaurus est la cle de voute. Pour le TDAH :

| Terme FR | Terme EN | Definition |
|----------|----------|------------|
| deficit attentionnel | attention deficit | Difficulte persistante a maintenir l'attention... |
| hyperactivite motrice | motor hyperactivity | Agitation motrice excessive... |
| fonctions executives | executive functions | Ensemble des processus cognitifs de haut niveau... |
| amenagement raisonnable | reasonable accommodation | Adaptation de l'environnement scolaire... |

### Etape 4 — Ecrire les prompts

Chaque section du corpus a un prompt avec :
- `contexte_sci` : pourquoi cette section existe
- `instructions` : quoi chercher, quels termes utiliser
- Les termes canoniques sont injectes automatiquement

### Etape 5 — Fiches FALC

Le FALC (Facile a Lire et a Comprendre) impose des regles specifiques :
- Phrases courtes (12-15 mots max)
- Un mot = un sens
- Pas de jargon, pas de metaphores
- Illustrations associees au texte
- Mise en page aeree

Le prompt Jenni pour une fiche FALC :

```
Redige une fiche FALC (Facile a Lire et a Comprendre) sur [sujet].
Regles FALC :
- Phrases de 12 mots maximum
- Mots simples, pas de jargon medical
- Une idee par phrase
- Utilise des exemples concrets du quotidien
- Le texte doit etre compris par un enfant de 10 ans
```

### Etape 6 — Workflow identique

```
base_tdah.db → export_prompts.py → Jenni → .docx → Claude (analyse) → contenu valide
```

Les scripts sont reutilisables tels quels — seul le contenu de la DB change.
