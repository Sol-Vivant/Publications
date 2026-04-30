# Guide Git — Le Sol Vivant

## Demarrage (une seule fois)

```bash
# Cloner le depot
git clone {GITHUB_TOOLS_URL}.git
cd Tools

# Cloner Publications dedans (depot separe pour le site web)
git clone {GITHUB_PUB_URL}.git
```

## Commandes quotidiennes

### Recuperer les dernieres modifications

```bash
cd ~/Documents/Sol_Vivant/GitHub/Tools
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
git add tools/jenni/export_jenni_doc.py  # un autre fichier
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

## Publications (depot separe)

```bash
# Generer les fichiers dans Publications/
cd ~/Documents/Sol_Vivant/GitHub/Tools
python3 tools/docs/gen_archive.py --db sol_vivant.db
python3 tools/docs/gen_cahier.py --db sol_vivant.db
python3 tools/docs/gen_concept_cards.py --db sol_vivant.db
python3 tools/docs/gen_esclaves_calc.py --db sol_vivant.db
python3 tools/docs/gen_explorer.py --db sol_vivant.db
python3 tools/docs/gen_lifofer.py --db sol_vivant.db
python3 tools/docs/gen_mo_calc.py --db sol_vivant.db
python3 tools/docs/gen_readme.py --db sol_vivant.db
python3 tools/docs/gen_reports.py --db sol_vivant.db
python3 tools/docs/gen_technique.py --db sol_vivant.db
python3 tools/docs/gen_triangle_textures.py --db sol_vivant.db
python3 tools/docs/gen_web.py --db sol_vivant.db
python3 tools/docs/gen_workflows.py --db sol_vivant.db
python3 tools/jenni/export_jenni_doc.py --db sol_vivant.db --all

# Verifier les fichiers generes
ls Publications/web/
ls Publications/cartographie/
ls Publications/prompts/

# Copier vers le depot Pages et pousser
cd Publications
git add -A
git commit -m "Mise a jour du site"
git push origin main
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

```bash
# La DB ne peut pas etre mergee — choisir une version :
git checkout --ours sol_vivant.db     # garder MA version
git checkout --theirs sol_vivant.db   # garder la version du SERVEUR
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

## Regles du projet

1. **main = production** — on travaille directement sur main
2. **Branches = exploration** — pour tester sans risque
3. **La DB est binaire** — pas de merge possible, un seul editeur a la fois
4. **Publications/ est dans .gitignore** — c'est un depot separe
5. **Toujours commiter avant de quitter** — `git add -A && git commit -m "WIP" && git push`
