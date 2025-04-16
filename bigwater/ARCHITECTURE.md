# Architecture du Projet BigWater

Ce document décrit l'architecture du projet BigWater, organisée selon les principes de développement modernes pour les applications Next.js.

## Structure des Dossiers

```
src/
├── app/                    # Routes et pages Next.js (App Router)
│   ├── (auth)/             # Groupe de routes d'authentification
│   ├── (dashboard)/        # Groupe de routes du tableau de bord
│   ├── globals.css         # Styles globaux
│   └── layout.tsx          # Layout principal de l'application
├── components/             # Composants React
│   ├── ui/                 # Composants UI génériques
│   │   ├── data-display/   # Composants d'affichage de données (Badge, Table, etc.)
│   │   ├── feedback/       # Composants de feedback (Alert, Progress, Skeleton, etc.)
│   │   ├── inputs/         # Composants de formulaires (Input, Select, Checkbox, etc.)
│   │   ├── layout/         # Composants de mise en page (Card, Container, etc.)
│   │   ├── navigation/     # Composants de navigation (Nav, Breadcrumb, etc.)
│   │   └── overlays/       # Composants de superposition (Dialog, Modal, Tooltip, etc.)
│   ├── video/              # Composants spécifiques au domaine vidéo
│   ├── categories/         # Composants spécifiques au domaine catégories
│   └── layout/             # Composants de mise en page spécifiques à l'application
├── config/                 # Configuration globale de l'application
│   ├── constants.ts        # Constantes globales
│   └── index.ts            # Point d'entrée pour les exports de configuration
├── hooks/                  # Hooks React personnalisés
├── lib/                    # Bibliothèques et utilitaires externes adaptés
├── providers/              # Providers de contexte React
├── services/               # Services métier et d'API
│   ├── api/                # Services d'API génériques
│   ├── supabase/           # Services spécifiques à Supabase
│   ├── auth/               # Services d'authentification
│   ├── video/              # Services liés aux vidéos
│   └── categories/         # Services liés aux catégories
├── types/                  # Définitions de types TypeScript
│   ├── api/                # Types pour les API
│   ├── auth/               # Types pour l'authentification
│   ├── common/             # Types communs
│   ├── dashboard/          # Types pour le tableau de bord
│   ├── ui/                 # Types pour les composants UI
│   └── video/              # Types pour les vidéos
└── utils/                  # Utilitaires
    ├── common/             # Utilitaires généraux
    ├── formatting/         # Fonctions de formatage
    └── validation/         # Fonctions de validation
```

## Principes Architecturaux

### 1. Séparation Client/Serveur

- Les composants serveur (sans interactivité) utilisent le modèle Server Component de Next.js
- Les composants client (interactifs) sont explicitement marqués avec `'use client'`
- La logique métier est séparée des composants UI pour faciliter les tests et la maintenance

### 2. Architecture par Domaines

- Les composants, services et types sont organisés par domaine fonctionnel (vidéo, catégories, etc.)
- Les composants génériques sont placés dans le dossier `ui` avec une organisation fonctionnelle

### 3. Conventions de Nommage

- Tous les fichiers suivent la convention de nommage kebab-case
- Les composants React suivent la convention PascalCase
- Les hooks commencent par "use" (ex: `useVideoPlayer`)
- Les services sont nommés en fonction de leur domaine (ex: `videoService`)

### 4. Externalisation de la Logique Backend

- Toute la logique d'API est isolée dans des services dédiés
- Les composants n'accèdent jamais directement aux sources de données
- Toutes les opérations asynchrones sont gérées dans les services ou les hooks

### 5. Types Stricts

- Tous les composants, fonctions et services sont strictement typés
- Les modèles de données sont définis avec des interfaces TypeScript
- Les enums et unions discriminées sont utilisés pour les types énumérés

## Bonnes Pratiques

### Création de Nouveaux Composants

1. Déterminer si le composant est générique (UI) ou spécifique au domaine
2. Placer le composant dans le dossier approprié selon sa catégorie
3. Suivre la convention de nommage kebab-case pour le fichier
4. Utiliser un préfixe "use" pour les hooks personnalisés

### Ajout de Nouvelles Fonctionnalités

1. Définir les types nécessaires dans le dossier `types`
2. Implémenter les services d'API dans le dossier `services`
3. Créer les hooks nécessaires pour encapsuler la logique
4. Développer les composants UI qui utilisent ces hooks
5. Intégrer les composants dans les pages d'application

### Maintenance du Code

1. Suivre les directives de structure de fichiers
2. Garder des composants de petite taille avec une responsabilité unique
3. Externaliser la logique complexe dans des hooks ou services
4. Maintenir la cohérence des types entre frontend et backend 