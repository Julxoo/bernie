#!/bin/bash

# Script pour déplacer les fichiers vers la nouvelle structure

echo "Début du déplacement des fichiers..."

# 1. Déplacer les fichiers UI vers les sous-dossiers appropriés
# Navigation
mkdir -p src/components/ui/navigation
git mv src/components/ui/mobile-nav-bar.tsx src/components/ui/navigation/ 2>/dev/null || mv src/components/ui/mobile-nav-bar.tsx src/components/ui/navigation/ 2>/dev/null
git mv src/components/ui/navigation.tsx src/components/ui/navigation/main-navigation.tsx 2>/dev/null || mv src/components/ui/navigation.tsx src/components/ui/navigation/main-navigation.tsx 2>/dev/null
git mv src/components/ui/breadcrumb.tsx src/components/ui/navigation/ 2>/dev/null || mv src/components/ui/breadcrumb.tsx src/components/ui/navigation/ 2>/dev/null

# Inputs
mkdir -p src/components/ui/inputs
git mv src/components/ui/input.tsx src/components/ui/inputs/ 2>/dev/null || mv src/components/ui/input.tsx src/components/ui/inputs/ 2>/dev/null
git mv src/components/ui/select.tsx src/components/ui/inputs/ 2>/dev/null || mv src/components/ui/select.tsx src/components/ui/inputs/ 2>/dev/null
git mv src/components/ui/textarea.tsx src/components/ui/inputs/ 2>/dev/null || mv src/components/ui/textarea.tsx src/components/ui/inputs/ 2>/dev/null
git mv src/components/ui/checkbox.tsx src/components/ui/inputs/ 2>/dev/null || mv src/components/ui/checkbox.tsx src/components/ui/inputs/ 2>/dev/null

# Feedback
mkdir -p src/components/ui/feedback
git mv src/components/ui/skeleton.tsx src/components/ui/feedback/ 2>/dev/null || mv src/components/ui/skeleton.tsx src/components/ui/feedback/ 2>/dev/null
git mv src/components/ui/progress.tsx src/components/ui/feedback/ 2>/dev/null || mv src/components/ui/progress.tsx src/components/ui/feedback/ 2>/dev/null
git mv src/components/ui/sonner.tsx src/components/ui/feedback/ 2>/dev/null || mv src/components/ui/sonner.tsx src/components/ui/feedback/ 2>/dev/null

# Layout
mkdir -p src/components/ui/layout
git mv src/components/ui/card.tsx src/components/ui/layout/ 2>/dev/null || mv src/components/ui/card.tsx src/components/ui/layout/ 2>/dev/null
git mv src/components/ui/separator.tsx src/components/ui/layout/ 2>/dev/null || mv src/components/ui/separator.tsx src/components/ui/layout/ 2>/dev/null
git mv src/components/ui/scroll-area.tsx src/components/ui/layout/ 2>/dev/null || mv src/components/ui/scroll-area.tsx src/components/ui/layout/ 2>/dev/null

# Overlays
mkdir -p src/components/ui/overlays
git mv src/components/ui/dialog.tsx src/components/ui/overlays/ 2>/dev/null || mv src/components/ui/dialog.tsx src/components/ui/overlays/ 2>/dev/null
git mv src/components/ui/sheet.tsx src/components/ui/overlays/ 2>/dev/null || mv src/components/ui/sheet.tsx src/components/ui/overlays/ 2>/dev/null
git mv src/components/ui/tooltip.tsx src/components/ui/overlays/ 2>/dev/null || mv src/components/ui/tooltip.tsx src/components/ui/overlays/ 2>/dev/null

# Data display
mkdir -p src/components/ui/data-display
git mv src/components/ui/badge.tsx src/components/ui/data-display/ 2>/dev/null || mv src/components/ui/badge.tsx src/components/ui/data-display/ 2>/dev/null
git mv src/components/ui/tabs.tsx src/components/ui/data-display/ 2>/dev/null || mv src/components/ui/tabs.tsx src/components/ui/data-display/ 2>/dev/null

# 2. Déplacer les utilitaires vers leurs nouveaux dossiers
git mv src/utils/utils.ts src/utils/common/index.ts 2>/dev/null || mv src/utils/utils.ts src/utils/common/index.ts 2>/dev/null
git mv src/utils/supabase/* src/services/supabase/ 2>/dev/null || mv src/utils/supabase/* src/services/supabase/ 2>/dev/null
rmdir src/utils/supabase 2>/dev/null

# 3. Déplacer le provider d'application
git mv src/components/app-provider.tsx src/providers/app-provider.tsx 2>/dev/null || mv src/components/app-provider.tsx src/providers/app-provider.tsx 2>/dev/null

# 4. Créer un fichier de configuration pour les constantes
touch src/config/constants.ts

echo "Déplacement des fichiers terminé!" 