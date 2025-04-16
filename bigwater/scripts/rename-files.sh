#!/bin/bash

# Script pour renommer les fichiers PascalCase en kebab-case

# Fonction pour convertir PascalCase en kebab-case
function pascal_to_kebab() {
  echo "$1" | sed -E 's/([a-z0-9])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]'
}

# Liste des fichiers à renommer
FILES_TO_RENAME=(
  "src/components/video/NewCategoryDialog.tsx:src/components/video/new-category-dialog.tsx"
  "src/components/video/NewCategoryForm.tsx:src/components/video/new-category-form.tsx"
  "src/components/video/NewVideoDialog.tsx:src/components/video/new-video-dialog.tsx"
  "src/components/video/NewVideoForm.tsx:src/components/video/new-video-form.tsx"
  "src/components/video/VideoCard.tsx:src/components/video/video-card.tsx"
)

# Parcourir la liste et renommer les fichiers
for file_pair in "${FILES_TO_RENAME[@]}"; do
  old_path="${file_pair%%:*}"
  new_path="${file_pair##*:}"
  
  if [ -f "$old_path" ]; then
    echo "Renommage de $old_path vers $new_path"
    git mv "$old_path" "$new_path" || mv "$old_path" "$new_path"
  else
    echo "Fichier $old_path non trouvé, ignorer."
  fi
done

echo "Renommage terminé!" 