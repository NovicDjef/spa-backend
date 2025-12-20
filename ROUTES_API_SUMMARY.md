# 📚 Résumé des Routes API - Système d'Avis

## ✅ Status: Prêt pour le déploiement

Toutes les routes ont été testées et sont fonctionnelles.

---

## 🔓 Routes Publiques (Sans authentification)

### 1. Professionnels
```
GET /api/professionals/public
```
**Description:** Liste des professionnels actifs pour le formulaire d'avis
**Query Params:**
- `serviceType` (optionnel): "MASSOTHERAPIE" | "ESTHETIQUE"

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "prenom": "Marie",
      "nom": "Dupont",
      "role": "MASSOTHERAPEUTE",
      "isActive": true
    }
  ]
}
```

---

### 2. Créer un Avis
```
POST /api/reviews
```
**Description:** Créer un avis anonyme
**Body:**
```json
{
  "professionalId": "user_123",
  "rating": 5,
  "comment": "Excellent service!"
}
```

**Validation:**
- `professionalId`: string, requis
- `rating`: number (1-5), requis
- `comment`: string (max 1000 caractères), optionnel

**Réponse:**
```json
{
  "success": true,
  "message": "Avis enregistré avec succès",
  "data": {
    "id": "review_456",
    "rating": 5,
    "createdAt": "2024-12-20T05:30:00Z"
  }
}
```

---

### 3. Voir les Avis d'un Professionnel
```
GET /api/reviews/:professionalId
```
**Description:** Récupérer les statistiques et avis d'un professionnel

**Réponse:**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.7,
    "totalReviews": 23,
    "reviews": [
      {
        "id": "review_456",
        "rating": 5,
        "comment": "Excellent!",
        "createdAt": "2024-12-20T05:30:00Z"
      }
    ]
  }
}
```

---

## 🔒 Routes Protégées (Authentification ADMIN requise)

### 4. Liste de Tous les Avis
```
GET /api/reviews
Headers: Authorization: Bearer TOKEN_ADMIN
```
**Description:** Récupérer tous les avis avec pagination et filtres

**Query Params:**
- `page` (optionnel, défaut: 1) - Numéro de page
- `limit` (optionnel, défaut: 20) - Nombre d'avis par page
- `professionalId` (optionnel) - Filtrer par professionnel
- `rating` (optionnel) - Filtrer par note (1-5)

**Exemples:**
```bash
# Tous les avis
GET /api/reviews

# Page 2 avec 10 avis par page
GET /api/reviews?page=2&limit=10

# Filtrer par professionnel
GET /api/reviews?professionalId=USER_ID

# Filtrer par note 5 étoiles
GET /api/reviews?rating=5
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_123",
        "rating": 5,
        "comment": "Excellent service!",
        "createdAt": "2024-12-20T05:30:00Z",
        "professional": {
          "id": "user_456",
          "nom": "Dupont",
          "prenom": "Marie",
          "role": "MASSOTHERAPEUTE"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 45,
      "limit": 20,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### 5. Liste des Employés (avec statistiques d'avis)
```
GET /api/users
Headers: Authorization: Bearer TOKEN_ADMIN
```
**Description:** Liste de tous les employés avec leurs statistiques d'avis

**Query Params:**
- `role` (optionnel) - Filtrer par rôle
- `search` (optionnel) - Rechercher par nom, prénom, email

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "email": "marie@spa.com",
      "telephone": "0612345678",
      "nom": "Dupont",
      "prenom": "Marie",
      "role": "MASSOTHERAPEUTE",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "_count": {
        "assignedClients": 25,
        "notesCreated": 48,
        "reviewsReceived": 23
      },
      "averageRating": 4.7
    }
  ]
}
```

---

### 6. Détails des Avis d'un Employé
```
GET /api/users/:id/reviews
Headers: Authorization: Bearer TOKEN_ADMIN
```
**Description:** Récupérer les détails complets des avis d'un employé

**Réponse:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "nom": "Dupont",
      "prenom": "Marie"
    },
    "statistics": {
      "averageRating": 4.7,
      "totalReviews": 23,
      "ratingDistribution": {
        "1": 0,
        "2": 1,
        "3": 1,
        "4": 3,
        "5": 18
      }
    },
    "recentReviews": [
      {
        "id": "review_456",
        "rating": 5,
        "comment": "Excellent!",
        "createdAt": "2024-12-20T05:30:00Z"
      }
    ]
  }
}
```

---

## 🗄️ Base de Données

### Modèle Review
```prisma
model Review {
  id              String   @id @default(cuid())
  rating          Int      // 1-5
  comment         String?  @db.Text
  professionalId  String
  professional    User     @relation("ReceivedReviews", fields: [professionalId], references: [id], onDelete: Cascade)
  isAnonymous     Boolean  @default(true)
  createdAt       DateTime @default(now())

  @@index([professionalId])
  @@index([createdAt])
}
```

### Migration
```bash
Migration: 20251220052152_add_reviews_system
Status: ✅ Appliquée
```

---

## 🔧 Configuration Requise

### Variables d'Environnement (.env)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="votre_secret_jwt"
PORT=5003
NODE_ENV=production
FRONTEND_URL="https://votre-frontend.com"
```

### Dépendances Installées
- ✅ `zod` - Validation des données
- ✅ `sanitize-html` - Protection XSS
- ✅ `@types/sanitize-html` - Types TypeScript

---

## 🧪 Tests Postman/Curl

### Test Route Publique
```bash
# Liste des professionnels
curl http://localhost:5003/api/professionals/public

# Créer un avis
curl -X POST http://localhost:5003/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"professionalId":"USER_ID","rating":5,"comment":"Excellent!"}'

# Voir les avis d'un professionnel
curl http://localhost:5003/api/reviews/USER_ID
```

### Test Route Admin
```bash
# Liste de tous les avis
curl http://localhost:5003/api/reviews \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN"

# Liste des employés avec stats
curl http://localhost:5003/api/users \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN"

# Détails des avis d'un employé
curl http://localhost:5003/api/users/USER_ID/reviews \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN"
```

---

## 📦 Déploiement sur VPS

### Étapes
1. ✅ Code compilé sans erreurs
2. ✅ Migrations Prisma appliquées
3. ✅ Client Prisma généré
4. ✅ Toutes les routes testées

### Commandes sur le VPS
```bash
# 1. Cloner/Pull le code
git pull origin main

# 2. Installer les dépendances
npm install

# 3. Générer le client Prisma
npx prisma generate

# 4. Appliquer les migrations
npx prisma migrate deploy

# 5. Build
npm run build

# 6. Redémarrer le serveur (PM2)
pm2 restart spa-backend
# ou
pm2 reload spa-backend
```

---

## ✅ Checklist Pré-Déploiement

- [x] Schéma Prisma mis à jour
- [x] Migration créée et appliquée localement
- [x] Dépendances installées
- [x] Code TypeScript sans erreurs
- [x] Client Prisma généré
- [x] Routes publiques testées
- [x] Routes protégées testées
- [x] Middleware d'authentification configuré
- [x] Sanitization XSS en place
- [x] Validation des données avec Zod

---

## 🎯 Points Importants

1. **Sécurité:**
   - Routes publiques ne nécessitent PAS de token
   - Routes admin nécessitent un token JWT valide et rôle ADMIN
   - Commentaires sanitizés pour prévenir XSS

2. **Performance:**
   - Index sur `professionalId` et `createdAt`
   - Pagination sur la route GET /api/reviews
   - Limite de 20 avis pour route publique

3. **Validation:**
   - Rating entre 1 et 5
   - Commentaire max 1000 caractères
   - Seuls MASSOTHERAPEUTE et ESTHETICIENNE peuvent recevoir des avis

---

**🚀 Le système est prêt pour le déploiement!**
