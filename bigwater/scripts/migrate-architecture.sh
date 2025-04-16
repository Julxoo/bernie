#!/bin/bash

# Script principal pour exécuter toutes les migrations d'architecture

echo "==== Début de la migration de l'architecture du projet ===="
echo

# Vérifier que tous les scripts nécessaires existent
for script in rename-files.sh restructure-folders.sh move-files.sh create-index-files.sh; do
  if [ ! -f "scripts/${script}" ]; then
    echo "Erreur: Le script scripts/${script} n'existe pas."
    exit 1
  fi
done

# 1. Renommer les fichiers en kebab-case
echo "1. Renommage des fichiers en kebab-case..."
./scripts/rename-files.sh
echo

# 2. Restructurer les dossiers
echo "2. Restructuration des dossiers..."
./scripts/restructure-folders.sh
echo

# 3. Déplacer les fichiers vers les nouveaux dossiers
echo "3. Déplacement des fichiers vers la nouvelle structure..."
./scripts/move-files.sh
echo

# 4. Créer les fichiers d'index
echo "4. Création des fichiers index.ts..."
./scripts/create-index-files.sh
echo

# 5. Vérifier que le fichier ARCHITECTURE.md existe
if [ ! -f "ARCHITECTURE.md" ]; then
  echo "⚠️ Le fichier ARCHITECTURE.md n'existe pas. Veuillez le créer pour documenter l'architecture."
else
  echo "✅ Le fichier ARCHITECTURE.md existe."
fi

echo
echo "==== Migration de l'architecture terminée ===="
echo
echo "Vous pouvez maintenant exécuter 'npm run lint' pour vérifier les erreurs ESLint."
echo "Si des erreurs sont trouvées, elles devront être corrigées manuellement."
echo
echo "Consultez le fichier ARCHITECTURE.md pour plus d'informations sur la nouvelle structure du projet." 