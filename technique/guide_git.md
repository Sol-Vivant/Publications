# Guide Git — Le Sol Vivant

## Demarrage (une seule fois)

```bash
# Cloner le depot
git clone {GITHUB_TOOLS_URL}.git
cd GLM_depot    # racine du repo (working dir canonique)

# Publications/ fait partie du depot principal — rien d'autre a cloner
```

## Commandes quotidiennes

### Recuperer les dernieres modifications

```bash
cd /home/jmj/glm/GLM_depot    # racine du depot
git pull origin main
```

### Voir l'etat du depot

```bash
git status              # fichiers modifies, non suivis
git log --oneline -10   # 10 derniers commits
git diff                # voir les modifications en detail
```

### Sauvegarder son travail (commit + push)

```bash
# 1. Voir ce qui a change
git status

# 2. Ajouter les fichiers modifies
git add sol_vivant.db                    # un fichier specifique
git add tools/docs/gen_readme.py         # un autre fichier (exemple)
git add -A                               # TOUT ajouter (attention)

# 3. Commiter avec un message
git commit -m "Description de ce qui a ete fait"

# 4. Pousser sur GitHub
git push origin main
```

### Annuler des modifications (avant commit)

```bash
# Annuler les modifications d'un fichier (revenir a la version du dernier commit)
git checkout -- sol_vivant.db

# Annuler tout (ATTENTION : perd tout le travail non commite)
git checkout -- .
```

### Creer une branche (exploration)

```bash
# Creer et basculer sur une nouvelle branche
git checkout -b test-nouveau-truc

# Travailler, commiter...
git add -A && git commit -m "test"

# Revenir sur main
git checkout main

# Si le test est bon, fusionner
git merge test-nouveau-truc

# Supprimer la branche
git branch -d test-nouveau-truc
```

## Regenerer le site (Publications/)

Publications/ est versionne dans le depot principal — il se commit avec le reste (pas de second depot). La regeneration est prise en charge par `session_end.py` (via `regen_all.py`) ; la propagation vers `main` est arbitree par JMJ (local-first).

```bash
# Regenerer toutes les pages et docs depuis la DB
python3 tools/regen_all.py --db sol_vivant.db

# Verifier puis commiter normalement
ls Publications/web/
git add -A && git commit -m "Regeneration site"
```

## Situations courantes

### "Je veux revenir a avant"

```bash
# Voir l'historique
git log --oneline -20

# Revenir a un commit specifique (SANS perdre l'historique)
git revert abc1234    # cree un nouveau commit qui annule abc1234
```

### "J'ai un conflit"

```bash
# Tirer les modifications du serveur
git pull origin main

# Si conflit : ouvrir le fichier, chercher les marqueurs <<<<<<< ======= >>>>>>>
# Corriger manuellement, puis :
git add fichier_corrige
git commit -m "Resolution du conflit"
git push origin main
```

### "La DB est en conflit" (fichier binaire)

La DB binaire **ne se merge pas** — jamais de résolution binaire à l’aveugle. Deux voies de restauration :

```bash
# Voie 1 : le backup du jour (auto au demarrage de session, backups/)
cp backups/sol_vivant_backup_<date>.db sol_vivant.db

# Voie 2 : le dump SQL versionne (regenere la DB complete)
gunzip -c backups/sol_vivant.sql.gz | sqlite3 sol_vivant.db

git add sol_vivant.db
git commit -m "Resolution conflit DB"
```

### "GitHub Desktop a fait un stash"

Le stash c'est une sauvegarde temporaire de tes modifications non commitees.

```bash
# Voir les stash
git stash list

# Recuperer le dernier stash
git stash pop

# Supprimer un stash
git stash drop
```

## Hooks (activation, une seule fois)

```bash
git config core.hooksPath .githooks/   # active le pre-commit du projet
```

Le pre-commit `.githooks/pre-commit` lance `check_forbidden_jenni.py` : il **bloque** le commit si du meta-vocab interdit apparait dans un contenu destine a Jenni. L'activation manuelle ci-dessus suffit (une fois par clone).

## Workflow de session

1. **Demarrage** — `session_start.py` : etat git (informationnel) + backup DB journalier + WAL checkpoint. **Aucun dashboard** — le briefing analytique est delegue au subagent `session-scribe`.
2. **Travail** — edition DB + scripts sur la branche courante, laissee a la discretion de l'utilisateur (doctrine local-first, cf. AGENTS.md).
3. **Cloture** — `session_end.py` : regen pages + `check_integrity` + dump SQL + commit de la branche courante vers son upstream + push (seulement si commits a pousser).

Detail complet : `gestion_sessions.md`.

## Regles du projet

1. **`origin/main` = source de verite** — on travaille sur la branche courante ; `session_end.py` commit et pousse vers son upstream. **JMJ arbitre les fusions vers main lui-même** (le script ne force jamais la topologie : ni merge forcé, ni checkout).
2. **Branches = exploration** — pour tester sans risque
3. **La DB est binaire** — pas de merge possible, un seul editeur a la fois ; versionnee via `backups/sol_vivant.sql.gz` (exclue de git depuis 2026-06-22)
4. **Publications/ est versionne dans le depot principal** — pages generees (`gen_*.py`), ne pas editer a la main
5. **Cloture par `session_end.py`** — regen + integrity + dump SQL + commit + push de la branche courante (pas de commit `WIP` manuel)
