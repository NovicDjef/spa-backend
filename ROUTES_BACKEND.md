# Routes Backend à Créer pour le Système d'Avis

## 📋 Liste des Routes

### 1. GET /api/professionals/public (PUBLIC)
**Fichier:** `src/controllers/professionalController.ts`

**Description:** Retourne la liste des professionnels actifs pour le formulaire d'avis

**Query Parameters:**
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

**Code Prisma:**
```typescript
export async function getPublicProfessionals(req, res) {
  const { serviceType } = req.query;

  const where: any = {
    isActive: true,
    role: {
      in: ['MASSOTHERAPEUTE', 'ESTHETICIENNE']
    }
  };

  if (serviceType === 'MASSOTHERAPIE') {
    where.role = 'MASSOTHERAPEUTE';
  } else if (serviceType === 'ESTHETIQUE') {
    where.role = 'ESTHETICIENNE';
  }

  const professionals = await prisma.user.findMany({
    where,
    select: {
      id: true,
      prenom: true,
      nom: true,
      role: true,
      isActive: true
    },
    orderBy: [
      { nom: 'asc' },
      { prenom: 'asc' }
    ]
  });

  res.json({
    success: true,
    data: professionals
  });
}
```

---

### 2. POST /api/reviews (PUBLIC)
**Fichier:** `src/controllers/reviewController.ts`

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
- `rating`: number, requis, entre 1 et 5
- `comment`: string, optionnel, max 1000 caractères

**Réponse Success:**
```json
{
  "success": true,
  "message": "Avis enregistré avec succès",
  "data": {
    "id": "review_456",
    "rating": 5,
    "createdAt": "2024-12-19T10:30:00Z"
  }
}
```

**Code Complet:**
```typescript
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

const createReviewSchema = z.object({
  professionalId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
});

export async function createReview(req, res) {
  try {
    // Validation
    const data = createReviewSchema.parse(req.body);

    // Vérifier que le professionnel existe et est actif
    const professional = await prisma.user.findUnique({
      where: { id: data.professionalId },
      select: { id: true, isActive: true, role: true }
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professionnel introuvable'
      });
    }

    if (!professional.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Ce professionnel n\'est plus actif'
      });
    }

    if (!['MASSOTHERAPEUTE', 'ESTHETICIENNE'].includes(professional.role)) {
      return res.status(400).json({
        success: false,
        message: 'Seuls les massothérapeutes et esthéticiennes peuvent recevoir des avis'
      });
    }

    // Sanitize le commentaire
    const sanitizedComment = data.comment
      ? sanitizeHtml(data.comment, { allowedTags: [], allowedAttributes: {} })
      : null;

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        professionalId: data.professionalId,
        rating: data.rating,
        comment: sanitizedComment,
        isAnonymous: true
      },
      select: {
        id: true,
        rating: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Avis enregistré avec succès',
      data: review
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors
      });
    }

    console.error('Erreur création avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
}
```

**Dépendances à installer:**
```bash
npm install zod sanitize-html
npm install --save-dev @types/sanitize-html
```

---

### 3. GET /api/reviews/:professionalId (PUBLIC)
**Fichier:** `src/controllers/reviewController.ts`

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
        "createdAt": "2024-12-19T10:30:00Z"
      }
    ]
  }
}
```

**Code:**
```typescript
export async function getReviewsByProfessional(req, res) {
  const { professionalId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { professionalId },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  res.json({
    success: true,
    data: {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      reviews
    }
  });
}
```

---

### 4. GET /api/users (MODIFIER - Token ADMIN)
**Fichier:** `src/controllers/userController.ts`

**Description:** Modifier la route existante pour inclure les stats d'avis

**Modifications à apporter:**
```typescript
export async function getUsers(req, res) {
  // Vérification admin existante...

  const { role, search } = req.query;

  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { nom: { contains: search, mode: 'insensitive' } },
      { prenom: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      _count: {
        select: {
          assignedClients: true,
          notesCreated: true,
          reviewsReceived: true  // ⭐ AJOUTER
        }
      },
      reviewsReceived: {
        select: { rating: true }  // ⭐ AJOUTER
      }
    },
    orderBy: [
      { nom: 'asc' },
      { prenom: 'asc' }
    ]
  });

  // ⭐ AJOUTER: Calculer la moyenne pour chaque user
  const usersWithStats = users.map(user => {
    const reviewsCount = user.reviewsReceived.length;
    const averageRating = reviewsCount > 0
      ? user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
      : null;

    return {
      id: user.id,
      email: user.email,
      telephone: user.telephone,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      _count: {
        assignedClients: user._count.assignedClients,
        notesCreated: user._count.notesCreated,
        reviewsReceived: user._count.reviewsReceived
      },
      averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null
    };
  });

  res.json({
    success: true,
    data: usersWithStats
  });
}
```

---

### 5. GET /api/users/:id/reviews (NOUVEAU - Token ADMIN)
**Fichier:** `src/controllers/userController.ts`

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
        "5": 18,
        "4": 3,
        "3": 1,
        "2": 1,
        "1": 0
      }
    },
    "recentReviews": [
      {
        "id": "review_456",
        "rating": 5,
        "comment": "Excellent!",
        "createdAt": "2024-12-19T10:30:00Z"
      }
    ]
  }
}
```

**Code:**
```typescript
export async function getUserReviews(req, res) {
  // Vérifier admin
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Accès interdit'
    });
  }

  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      nom: true,
      prenom: true
    }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilisateur introuvable'
    });
  }

  const reviews = await prisma.review.findMany({
    where: { professionalId: id },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };

  reviews.forEach(review => {
    ratingDistribution[review.rating]++;
  });

  res.json({
    success: true,
    data: {
      user,
      statistics: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution
      },
      recentReviews: reviews
    }
  });
}
```

---

## 🗄️ Schéma Prisma

**Fichier:** `prisma/schema.prisma`

```prisma
// Nouveau modèle à ajouter
model Review {
  id              String   @id @default(cuid())
  rating          Int      // 1-5
  comment         String?  @db.Text

  // Relation avec le professionnel
  professionalId  String
  professional    User     @relation("ReceivedReviews", fields: [professionalId], references: [id], onDelete: Cascade)

  // Métadonnées
  isAnonymous     Boolean  @default(true)
  createdAt       DateTime @default(now())

  // Index pour performance
  @@index([professionalId])
  @@index([createdAt])
}

// Modifier le modèle User existant
model User {
  // ... tous les champs existants ...

  // ⭐ AJOUTER cette ligne:
  reviewsReceived  Review[]  @relation("ReceivedReviews")
}
```

**Commandes à exécuter:**
```bash
npx prisma migrate dev --name add_reviews_system
npx prisma generate
```

---

## 📁 Structure des Fichiers

```
src/
├── controllers/
│   ├── professionalController.ts    # NOUVEAU - Créer ce fichier
│   ├── reviewController.ts          # NOUVEAU - Créer ce fichier
│   └── userController.ts            # MODIFIER - Ajouter getUserReviews + modifier getUsers
├── routes/
│   ├── professionals.ts             # NOUVEAU - Créer ce fichier
│   ├── reviews.ts                   # NOUVEAU - Créer ce fichier
│   └── users.ts                     # MODIFIER - Ajouter route /:id/reviews
└── app.ts ou index.ts               # MODIFIER - Enregistrer les nouvelles routes
```

---

## 🛣️ Enregistrement des Routes

**Fichier:** `src/app.ts` ou `src/index.ts`

```typescript
import professionalRoutes from './routes/professionals';
import reviewRoutes from './routes/reviews';
import userRoutes from './routes/users';

// Enregistrer les routes
app.use('/api/professionals', professionalRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
```

**Fichier:** `src/routes/professionals.ts` (NOUVEAU)
```typescript
import express from 'express';
import { getPublicProfessionals } from '../controllers/professionalController';

const router = express.Router();

router.get('/public', getPublicProfessionals);

export default router;
```

**Fichier:** `src/routes/reviews.ts` (NOUVEAU)
```typescript
import express from 'express';
import { createReview, getReviewsByProfessional } from '../controllers/reviewController';

const router = express.Router();

router.post('/', createReview);
router.get('/:professionalId', getReviewsByProfessional);

export default router;
```

**Fichier:** `src/routes/users.ts` (MODIFIER)
```typescript
import express from 'express';
import { getUsers, getUserReviews } from '../controllers/userController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getUsers);
router.get('/:id/reviews', authMiddleware, adminMiddleware, getUserReviews); // ⭐ AJOUTER

export default router;
```

---

## ✅ Checklist d'Implémentation

### Backend
- [ ] Modifier `prisma/schema.prisma` (ajouter modèle Review + relation User)
- [ ] Exécuter `npx prisma migrate dev --name add_reviews_system`
- [ ] Exécuter `npx prisma generate`
- [ ] Installer dépendances: `npm install zod sanitize-html`
- [ ] Créer `src/controllers/professionalController.ts`
- [ ] Créer `src/controllers/reviewController.ts`
- [ ] Modifier `src/controllers/userController.ts` (ajouter getUserReviews + modifier getUsers)
- [ ] Créer `src/routes/professionals.ts`
- [ ] Créer `src/routes/reviews.ts`
- [ ] Modifier `src/routes/users.ts` (ajouter route /:id/reviews)
- [ ] Modifier `src/app.ts` (enregistrer les routes)
- [ ] Tester avec Postman/Insomnia

### Frontend (✅ Déjà fait)
- [x] Redux API configuré
- [x] Composants reviews créés
- [x] Page publique /avis créée
- [x] Page admin modifiée

---

## 🧪 Tests

### Test 1: Liste professionnels
```bash
curl http://localhost:3000/api/professionals/public
```

### Test 2: Créer un avis
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "professionalId": "USER_ID_ICI",
    "rating": 5,
    "comment": "Test avis"
  }'
```

### Test 3: Voir avis d'un professionnel
```bash
curl http://localhost:3000/api/reviews/USER_ID_ICI
```

### Test 4: Liste employés (avec token admin)
```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### Test 5: Détails avis employé (avec token admin)
```bash
curl http://localhost:3000/api/users/USER_ID_ICI/reviews \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

## 📝 Notes Importantes

1. **Sécurité:**
   - Les routes publiques ne nécessitent PAS de token
   - Les routes admin nécessitent un token JWT valide et rôle ADMIN
   - Les commentaires sont sanitizés pour prévenir XSS

2. **Performance:**
   - Index sur `professionalId` et `createdAt` dans le modèle Review
   - Limite de 20 avis pour la route publique
   - Limite de 50 avis pour la route admin

3. **Validation:**
   - Utilisation de Zod pour valider les inputs
   - Rating doit être entre 1 et 5
   - Commentaire max 1000 caractères

4. **Rate Limiting (Optionnel):**
   - Recommandé: max 5 avis/heure par IP
   - Utiliser express-rate-limit

---

## 🚀 Ordre d'Implémentation Recommandé

1. ✅ Schéma Prisma + migration
2. ✅ Route GET /api/professionals/public
3. ✅ Route POST /api/reviews
4. ✅ Route GET /api/reviews/:professionalId
5. ✅ Modifier GET /api/users
6. ✅ Route GET /api/users/:id/reviews
7. ✅ Tests avec Postman
8. ✅ Tests frontend

---

Bon courage pour l'implémentation backend! 🎯
