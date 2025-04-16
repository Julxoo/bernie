# Documentation API BigWater

Cette documentation décrit les différentes routes API disponibles pour interagir avec la base de données BigWater.

## Base URL

Toutes les routes API sont accessibles à partir de `/api`.

## Authentification

La plupart des routes nécessitent une authentification via Supabase. Assurez-vous d'inclure le token d'authentification dans les en-têtes de vos requêtes.

## Formats de réponse

Toutes les réponses sont au format JSON. En cas de succès, les données sont renvoyées directement. En cas d'erreur, un objet avec une propriété `error` contenant le message d'erreur est renvoyé.

## Routes disponibles

### Category Videos

- `GET /api/category-videos` - Récupérer toutes les vidéos de catégorie avec filtrage optionnel
  - Paramètres de requête: `categoryId`, `status`
- `GET /api/category-videos/:id` - Récupérer une vidéo de catégorie spécifique
- `POST /api/category-videos` - Créer une nouvelle vidéo de catégorie
- `PUT /api/category-videos/:id` - Mettre à jour une vidéo de catégorie existante
- `DELETE /api/category-videos/:id` - Supprimer une vidéo de catégorie

### Profiles

- `GET /api/profiles` - Récupérer tous les profils avec filtrage optionnel
  - Paramètres de requête: `role`
- `GET /api/profiles/:id` - Récupérer un profil spécifique
- `POST /api/profiles` - Créer un nouveau profil
- `PUT /api/profiles/:id` - Mettre à jour un profil existant
- `DELETE /api/profiles/:id` - Supprimer un profil

### User Activity

- `GET /api/user-activity` - Récupérer toutes les activités utilisateur avec filtrage optionnel
  - Paramètres de requête: `userId`, `actionType`, `fromDate`, `toDate`
- `GET /api/user-activity/:id` - Récupérer une activité utilisateur spécifique
- `POST /api/user-activity` - Enregistrer une nouvelle activité utilisateur
- `DELETE /api/user-activity/:id` - Supprimer une activité utilisateur

### Video Categories

- `GET /api/video-categories` - Récupérer toutes les catégories de vidéos avec filtrage optionnel
  - Paramètres de requête: `userId`
- `GET /api/video-categories/:id` - Récupérer une catégorie de vidéos spécifique
- `POST /api/video-categories` - Créer une nouvelle catégorie de vidéos
- `PUT /api/video-categories/:id` - Mettre à jour une catégorie de vidéos existante
- `DELETE /api/video-categories/:id` - Supprimer une catégorie de vidéos (échoue si des vidéos y sont associées)

### Video Details

- `GET /api/video-details` - Récupérer tous les détails de vidéos avec filtrage optionnel
  - Paramètres de requête: `categoryVideoId`, `status`
- `GET /api/video-details/:id` - Récupérer des détails de vidéo spécifiques
- `POST /api/video-details` - Créer de nouveaux détails de vidéo
- `PUT /api/video-details/:id` - Mettre à jour des détails de vidéo existants
- `DELETE /api/video-details/:id` - Supprimer des détails de vidéo

## Exemples d'utilisation

### Récupérer les vidéos d'une catégorie spécifique

```javascript
const response = await fetch('/api/category-videos?categoryId=1');
const data = await response.json();
```

### Créer un nouveau profil

```javascript
const response = await fetch('/api/profiles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    role: 'admin',
    name: 'Utilisateur Test'
  })
});
const data = await response.json();
```

### Mettre à jour le statut d'une vidéo

```javascript
const response = await fetch('/api/video-details/5', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    production_status: 'finished'
  })
});
const data = await response.json();
``` 