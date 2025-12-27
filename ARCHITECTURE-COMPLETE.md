# 🏗️ Architecture Complète - Frontend + Backend Séparés

## 📋 Vue d'ensemble

Votre système de gestion de spa est maintenant structuré en **deux projets indépendants**:

```
┌──────────────────────────────────────────────────────────┐
│                    ARCHITECTURE                          │
└──────────────────────────────────────────────────────────┘

┌─────────────────────┐                    ┌─────────────────────┐
│   spa-frontend      │                    │    spa-backend      │
│   (Next.js 14)      │ ◄────REST API────► │  (Node.js/Express)  │
│   Port: 3000        │                    │    Port: 5000       │
│   PWA Mobile-First  │                    │    JWT Auth         │
└─────────────────────┘                    └──────────┬──────────┘
                                                      │
                                                      │ Prisma ORM
                                                      ▼
                                           ┌─────────────────────┐
                                           │    PostgreSQL       │
                                           │     Database        │
                                           └─────────────────────┘
```

---

## 📦 Projets Créés

### 1. spa-backend (API REST)

**Localisation**: `/outputs/spa-backend/`

**Technologies**:
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- JWT (authentification)
- Zod (validation)
- Bcrypt (hashage mots de passe)

**Structure**:
```
spa-backend/
├── prisma/
│   ├── schema.prisma      # Schéma de la BD
│   └── seed.ts            # Données de test
├── src/
│   ├── config/
│   │   └── database.ts    # Configuration Prisma
│   ├── controllers/       # Logique métier
│   │   ├── auth.controller.ts
│   │   ├── client.controller.ts
│   │   ├── note.controller.ts
│   │   └── traitement.controller.ts
│   ├── middleware/        # Middleware
│   │   ├── auth.ts        # JWT auth
│   │   └── errorHandler.ts
│   ├── routes/            # Routes API
│   │   ├── auth.routes.ts
│   │   ├── client.routes.ts
│   │   ├── note.routes.ts
│   │   └── traitement.routes.ts
│   └── server.ts          # Point d'entrée
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

**Endpoints API Disponibles**:
```
POST   /api/auth/register      - Inscription professionnel
POST   /api/auth/login         - Connexion
POST   /api/clients            - Créer un client
GET    /api/clients            - Liste des clients (protégé)
GET    /api/clients/:id        - Détails client (protégé)
PUT    /api/clients/:id        - Modifier client (protégé)
DELETE /api/clients/:id        - Supprimer client (protégé)
GET    /api/notes/:clientId    - Notes d'un client (protégé)
POST   /api/notes/:clientId    - Ajouter une note (protégé)
GET    /api/traitements/:clientId - Traitements (protégé)
POST   /api/traitements/:clientId - Ajouter traitement (protégé)
```

### 2. spa-management (Frontend existant)

**Localisation**: `/outputs/spa-management/`

**Technologies**:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- PWA

**Ce qui existe déjà**:
- ✅ Page d'accueil avec sélection Client/Professionnel
- ✅ Sélection du type de service
- ✅ Formulaire massothérapie complet (4 étapes)
- ✅ Carte corporelle interactive
- ✅ Page de confirmation
- ✅ Design spa avec animations
- ✅ Configuration PWA

**Ce qu'il faut modifier**:
- ⚠️ Remplacer les appels API internes par des appels au backend
- ⚠️ Ajouter le service API client
- ⚠️ Créer la page de connexion professionnels
- ⚠️ Créer le dashboard professionnels
- ⚠️ Créer la vue détaillée client
- ⚠️ Implémenter la gestion des notes

---

## 🚀 Installation et Démarrage

### Étape 1: Backend

```bash
# 1. Aller dans le dossier backend
cd spa-backend

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres:
# - DATABASE_URL (PostgreSQL)
# - JWT_SECRET (générer un secret)

# 4. Initialiser la base de données
npx prisma generate
npx prisma db push

# 5. (Optionnel) Créer des données de test
npm run prisma:seed

# 6. Démarrer le serveur
npm run dev

# ✅ Backend démarré sur http://localhost:5000
```

### Étape 2: Frontend

```bash
# 1. Aller dans le dossier frontend
cd spa-management  # ou spa-frontend

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# 4. Démarrer le serveur
npm run dev

# ✅ Frontend démarré sur http://localhost:3000
```

---

## 🔧 Connexion Frontend ↔ Backend

### Créer le service API dans le frontend

**Fichier**: `spa-management/src/services/api.ts`

Voir le guide complet dans: `CONNEXION-FRONTEND-BACKEND.md`

Code de base:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Une erreur est survenue');
  }

  return data;
}

export const clientService = {
  async createClient(clientData: any) {
    return fetchAPI('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },
  // ... autres méthodes
};
```

### Modifier le formulaire client

Dans `spa-management/src/app/client/nouveau/massotherapie/page.tsx`:

```typescript
// Remplacer l'ancien code par:
import { clientService } from '@/services/api';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    await clientService.createClient({
      ...formData,
      serviceType: 'MASSOTHERAPIE',
    });
    
    setIsSuccess(true);
    setTimeout(() => {
      router.push('/client/confirmation');
    }, 2000);
  } catch (error) {
    alert(error.message);
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 🔐 Authentification

### Backend

Le backend utilise JWT pour l'authentification:

1. **Inscription**: POST `/api/auth/register`
2. **Connexion**: POST `/api/auth/login` → Retourne un token JWT
3. **Routes protégées**: Nécessitent le header `Authorization: Bearer <token>`

### Frontend

1. **Stocker le token** dans `localStorage` après connexion
2. **Inclure le token** dans toutes les requêtes authentifiées
3. **Vérifier l'auth** avant d'accéder aux pages protégées

Voir le guide complet dans `CONNEXION-FRONTEND-BACKEND.md`

---

## 📝 Comptes de Test

Après avoir exécuté `npm run prisma:seed` dans le backend:

**Massothérapeute**:
- Email: `massotherapeute@spa.com`
- Mot de passe: `password123`

**Esthéticienne**:
- Email: `estheticienne@spa.com`
- Mot de passe: `password123`

**Clients créés**: 3 clients exemples avec notes et traitements

---

## ✅ Checklist de Développement

### Backend (Terminé ✅)
- [x] Configuration Express + TypeScript
- [x] Schéma Prisma complet
- [x] Routes d'authentification (register, login)
- [x] CRUD clients complet
- [x] CRUD notes avec traçabilité
- [x] CRUD traitements
- [x] Middleware JWT
- [x] Validation avec Zod
- [x] Gestion d'erreurs
- [x] CORS configuré
- [x] Rate limiting
- [x] Script de seed

### Frontend (À compléter)
- [x] Page d'accueil
- [x] Sélection de service
- [x] Formulaire massothérapie
- [x] Carte corporelle
- [x] Page de confirmation
- [x] Design et animations
- [ ] Service API client (à créer)
- [ ] Formulaire esthétique
- [ ] Page de connexion professionnels
- [ ] Context d'authentification
- [ ] Dashboard liste clients
- [ ] Recherche et filtres
- [ ] Vue détaillée client
- [ ] Composant d'ajout de notes
- [ ] Affichage des traitements

---

## 🎯 Prochaines Étapes

### Priorité 1: Connexion de base
1. Créer le service API dans le frontend (`src/services/api.ts`)
2. Modifier le formulaire massothérapie pour utiliser le service
3. Tester la création d'un client via l'API

### Priorité 2: Authentification
4. Créer la page de connexion professionnels
5. Implémenter le Context d'authentification
6. Protéger les routes professionnels

### Priorité 3: Dashboard
7. Créer le dashboard liste clients
8. Implémenter la recherche
9. Créer la vue détaillée client
10. Implémenter l'ajout de notes

### Priorité 4: Compléter
11. Créer le formulaire esthétique
12. Optimiser les performances
13. Déployer backend et frontend

---

## 🚀 Déploiement

### Backend → Heroku ou Railway

```bash
cd spa-backend
heroku create spa-backend
heroku addons:create heroku-postgresql
heroku config:set JWT_SECRET=votre_secret
git push heroku main
```

### Frontend → Vercel

```bash
cd spa-management
vercel
# Configurer NEXT_PUBLIC_API_URL dans Vercel
```

---

## 📚 Documentation

### Fichiers de documentation créés:

1. **Backend**:
   - `spa-backend/README.md` - Documentation complète de l'API
   - Exemples de requêtes
   - Description de tous les endpoints

2. **Frontend** (existant):
   - `spa-management/README.md`
   - `spa-management/INSTALLATION.md`
   - `spa-management/FICHIERS-RESTANTS.md`
   - `spa-management/RECAPITULATIF.md`

3. **Connexion**:
   - `CONNEXION-FRONTEND-BACKEND.md` - Guide complet de connexion

---

## 💡 Avantages de cette Architecture

✅ **Séparation des préoccupations**
- Frontend et backend peuvent évoluer indépendamment
- Équipes peuvent travailler en parallèle

✅ **Scalabilité**
- Backend peut servir plusieurs clients (web, mobile, etc.)
- Chaque partie peut être scalée indépendamment

✅ **Déploiement flexible**
- Backend sur un serveur (Heroku, AWS, etc.)
- Frontend sur Vercel ou Netlify
- Utilisation de CDN pour le frontend

✅ **Sécurité**
- Backend protégé par JWT
- Validation des données côté serveur
- CORS configuré

✅ **Testabilité**
- API backend facilement testable avec Postman
- Tests unitaires sur chaque partie

---

## 🎉 Résumé

Vous avez maintenant:

1. ✅ **Backend complet** avec API REST fonctionnelle
2. ✅ **Frontend** avec formulaire massothérapie opérationnel
3. ✅ **Guide de connexion** pour lier les deux
4. ✅ **Documentation complète** de l'architecture
5. ✅ **Données de test** pour développer rapidement

**Prêt à coder!** 🚀

Consultez `CONNEXION-FRONTEND-BACKEND.md` pour connecter les deux projets.

---

*Architecture créée avec ❤️ pour votre spa*
