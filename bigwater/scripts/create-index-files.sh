#!/bin/bash

# Script pour créer des fichiers index.ts dans les dossiers principaux

echo "Création des fichiers index.ts..."

# Fonction pour créer un fichier index.ts qui exporte tous les fichiers dans un dossier
create_index_file() {
  local dir=$1
  local index_file="${dir}/index.ts"
  
  echo "Création de ${index_file}..."
  
  # Entête du fichier
  echo "// Index file for ${dir}" > "${index_file}"
  echo "" >> "${index_file}"
  
  # Trouver tous les fichiers .ts et .tsx dans le répertoire (sauf index.ts)
  for file in $(find "${dir}" -maxdepth 1 -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "index.ts"); do
    base_name=$(basename "${file}")
    name_without_ext="${base_name%.*}"
    
    # Ajouter l'export
    echo "export * from './${name_without_ext}';" >> "${index_file}"
  done
  
  echo "" >> "${index_file}"
}

# Créer des index pour les dossiers principaux
for dir in src/components/ui/{data-display,inputs,layout,navigation,feedback,overlays} src/utils/{common,validation,formatting} src/providers src/hooks src/services/{api,supabase}; do
  if [ -d "${dir}" ]; then
    create_index_file "${dir}"
  fi
done

# Créer un index pour le dossier config
cat > src/config/index.ts << EOL
// Configuration exports
export * from './constants';

// Autres exports de configuration peuvent être ajoutés ici
EOL

# Créer un fichier pour les constantes
cat > src/config/constants.ts << EOL
/**
 * Fichier de constantes globales pour l'application
 */

// Couleurs de l'application
export const COLORS = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  // Ajouter d'autres palettes de couleurs au besoin
};

// Configuration des routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  VIDEOS: '/videos',
  CATEGORIES: '/categories',
  PROFILE: '/profile',
  ADMIN: '/admin',
};

// Autres constantes globales
export const APP_NAME = 'BigWater';
export const DEFAULT_LOCALE = 'fr';
export const API_PAGE_SIZE = 20;
EOL

echo "Création des fichiers index.ts terminée!" 