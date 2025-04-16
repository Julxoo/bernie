#!/bin/bash

# Script de restructuration des dossiers du projet

echo "Début de la restructuration des dossiers..."

# 1. Déplacer les hooks du dossier components vers le dossier hooks à la racine
mkdir -p src/hooks
git mv src/components/hooks/* src/hooks/ 2>/dev/null || mv src/components/hooks/* src/hooks/ 2>/dev/null
rmdir src/components/hooks 2>/dev/null

# 2. Déplacer les providers vers un dossier dédié
mkdir -p src/providers
if [ -d "src/components/providers" ]; then
  git mv src/components/providers/* src/providers/ 2>/dev/null || mv src/components/providers/* src/providers/ 2>/dev/null
  rmdir src/components/providers 2>/dev/null
fi

# 3. Organiser les types
if [ ! -d "src/types/video" ]; then
  mkdir -p src/types/video
fi
if [ ! -d "src/types/ui" ]; then
  mkdir -p src/types/ui
fi

# 4. Améliorer la structure des services
mkdir -p src/services/api
mkdir -p src/services/supabase

# 5. Consolider les utilitaires dans un seul dossier
mkdir -p src/utils/common
mkdir -p src/utils/validation
mkdir -p src/utils/formatting

# 6. Organiser les composants UI par fonctionnalité
mkdir -p src/components/ui/data-display
mkdir -p src/components/ui/inputs
mkdir -p src/components/ui/layout
mkdir -p src/components/ui/navigation
mkdir -p src/components/ui/feedback
mkdir -p src/components/ui/overlays

# 7. Mettre en place un dossier pour les constantes et configurations
mkdir -p src/config

echo "Restructuration des dossiers terminée!" 