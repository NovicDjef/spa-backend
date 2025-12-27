# 🚀 Guide de Démarrage - Spa Renaissance Backend

## 📋 Prérequis

- Node.js 18+ installé
- PostgreSQL installé et en cours d'exécution
- Compte email SMTP (Gmail recommandé)
- Git (optionnel)

---

## 🔧 Installation

### Étape 1: Installer les dépendances
```bash
npm install
```

Cette commande installe toutes les dépendances nécessaires:
- Express, TypeScript, Prisma
- Nodemailer pour les emails
- JWT pour l'authentification
- Bcrypt pour le hachage des mots de passe
- Zod pour la validation

---

### Étape 2: Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet:

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/spa_renaissance"

# JWT Secret (générer une clé aléatoire sécurisée)
JWT_SECRET="votre-secret-super-securise-changez-moi"

# Configuration SMTP pour les emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-application
SMTP_FROM=noreply@sparenaissance.com

# Frontend URL (pour CORS)
FRONTEND_URL=http://localhost:3000

# Port du serveur
PORT=5000

# Environment
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**⚠️ Important pour Gmail:**
- Activer l'authentification à deux facteurs
- Créer un "Mot de passe d'application" dans les paramètres Google
- Utiliser ce mot de passe dans `SMTP_PASSWORD`

**Générer un JWT_SECRET sécurisé:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### Étape 3: Créer la base de données PostgreSQL

**Option A: Ligne de commande**
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE spa_renaissance;

# Quitter
\q
```

**Option B: GUI (pgAdmin, DBeaver, etc.)**
- Créer une nouvelle base de données nommée `spa_renaissance`

---

### Étape 4: Générer le client Prisma

```bash
npx prisma generate
```

Cette commande génère le client TypeScript Prisma basé sur le schéma.

---

### Étape 5: Exécuter les migrations

```bash
npx prisma migrate dev --name init
```

Cette commande:
- Crée toutes les tables dans la base de données
- Applique le schéma Prisma
- Génère l'historique des migrations

**Tables créées:**
- User (employés uniquement)
- ClientProfile (clients sans authentification)
- Assignment (relation client-professionnel)
- Note (notes de traitement)
- Traitement (historique des traitements)

---

### Étape 6: Seed la base de données (optionnel mais recommandé)

```bash
npx prisma db seed
```

**Données créées:**

**6 Employés:**
| Email | Mot de passe | Rôle | Nom |
|-------|--------------|------|-----|
| admin@spa.com | admin123 | ADMIN | Admin Principal |
| secretaire@spa.com | secretaire123 | SECRETAIRE | Secrétaire Réception |
| masso1@spa.com | masso123 | MASSOTHERAPEUTE | Sophie Martin |
| masso2@spa.com | masso123 | MASSOTHERAPEUTE | Pierre Dubois |
| esthetique1@spa.com | esthetique123 | ESTHETICIENNE | Julie Tremblay |
| esthetique2@spa.com | esthetique123 | ESTHETICIENNE | Isabelle Roy |

**4 Clients:**
- 2 clients de massothérapie
- 2 clients d'esthétique
- Avec assignations aux professionnels
- Avec notes d'exemple

---

### Étape 7: Tester la connexion email (optionnel)

Créer un fichier `test-email.ts`:
```typescript
import { testEmailConnection } from './src/lib/email';

testEmailConnection()
  .then(success => {
    console.log(success ? '✅ Email configuré' : '❌ Erreur email');
    process.exit(0);
  });
```

Exécuter:
```bash
npx ts-node test-email.ts
```

---

## ▶️ Démarrage du Serveur

### Mode Développement (avec hot reload)
```bash
npm run dev
```

### Mode Production
```bash
npm run build
npm start
```

Le serveur démarre sur `http://localhost:5000`

---

## ✅ Vérification

### 1. Health Check
```bash
curl http://localhost:5000/health
```

Réponse attendue:
```json
{
  "status": "OK",
  "message": "API de gestion de spa opérationnelle",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "environment": "development"
}
```

### 2. Test de Connexion
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@spa.com",
    "password": "admin123"
  }'
```

Réponse attendue:
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@spa.com",
      "role": "ADMIN",
      "nom": "Admin",
      "prenom": "Principal"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Test de Route Protégée
```bash
# Récupérer le token de l'étape précédente
TOKEN="votre-token-jwt-ici"

curl http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Routes Disponibles

### Routes Publiques
- `POST /api/auth/login` - Connexion
- `POST /api/clients` - Création de dossier client (formulaire public)

### Routes Authentifiées

**ADMIN uniquement:**
- `POST /api/users` - Créer un employé
- `GET /api/users` - Liste des employés
- `PUT /api/users/:id` - Modifier un employé
- `DELETE /api/users/:id` - Supprimer un employé
- `PUT /api/clients/:id` - Modifier un client
- `DELETE /api/clients/:id` - Supprimer un client
- `GET /api/marketing/contacts` - Contacts marketing
- `POST /api/marketing/send-email/campaign` - Campagne email
- Toutes les routes `/api/marketing/*`

**SECRETAIRE + ADMIN:**
- `GET /api/clients` - Voir tous les clients
- `POST /api/assignments` - Assigner un client à un professionnel
- `GET /api/professionals` - Liste des professionnels

**MASSOTHERAPEUTE / ESTHETICIENNE + ADMIN:**
- `GET /api/clients` - Voir leurs clients assignés
- `POST /api/notes/:clientId` - Ajouter une note
- `PUT /api/notes/:id` - Modifier leur propre note
- `DELETE /api/notes/:id` - Supprimer leur propre note

---

## 🗂️ Structure du Projet

```
spa-backend/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   ├── seed.ts                # Données de test
│   └── migrations/            # Historique des migrations
├── src/
│   ├── config/
│   │   └── database.ts        # Configuration Prisma
│   ├── lib/
│   │   └── email.ts           # Fonctions d'envoi d'emails
│   ├── middleware/
│   │   └── errorHandler.ts   # Gestion globale des erreurs
│   └── modules/
│       ├── auth/              # Authentification
│       ├── users/             # Gestion employés (ADMIN)
│       ├── clients/           # Gestion clients
│       ├── notes/             # Notes de traitement
│       ├── assignments/       # Assignations client-pro
│       ├── professionals/     # Liste professionnels
│       └── marketing/         # Module marketing (ADMIN)
├── server.ts                  # Point d'entrée
├── .env                       # Variables d'environnement
├── package.json               # Dépendances
└── tsconfig.json              # Configuration TypeScript
```

---

## 🐛 Dépannage

### Erreur: Cannot find module 'nodemailer'
```bash
npm install
```

### Erreur: Prisma Client not generated
```bash
npx prisma generate
```

### Erreur: Database connection refused
- Vérifier que PostgreSQL est en cours d'exécution
- Vérifier `DATABASE_URL` dans `.env`
- Tester la connexion: `psql -U postgres`

### Erreur: Email not sending
- Vérifier les credentials SMTP dans `.env`
- Pour Gmail, utiliser un "Mot de passe d'application"
- Tester avec: `npx ts-node test-email.ts`

### Erreur: JWT invalid
- Vérifier que `JWT_SECRET` est défini dans `.env`
- Régénérer un token en se reconnectant

### TypeScript errors after schema changes
```bash
npx prisma generate
npx prisma migrate dev
```

---

## 📊 Prisma Studio (GUI Database)

Pour visualiser et éditer les données:
```bash
npx prisma studio
```

Ouvre une interface web sur `http://localhost:5555`

---

## 🔐 Sécurité

**Déjà implémenté:**
- ✅ Mots de passe hashés avec bcrypt (12 rounds)
- ✅ JWT pour l'authentification
- ✅ CORS configuré
- ✅ Helmet pour les headers de sécurité
- ✅ Rate limiting (100 requêtes / 15 min)
- ✅ Validation Zod sur toutes les entrées
- ✅ Authorization middleware par rôle

**Recommandations production:**
- Changer `JWT_SECRET` en production
- Utiliser HTTPS uniquement
- Configurer des secrets forts
- Activer les logs de sécurité
- Limiter les CORS à votre domaine frontend
- Utiliser un service email professionnel (SendGrid, Mailgun)

---

## 📝 Commandes Utiles

```bash
# Développement
npm run dev              # Démarre avec hot reload

# Production
npm run build            # Compile TypeScript
npm start                # Démarre le serveur compilé

# Base de données
npx prisma migrate dev   # Créer une migration
npx prisma migrate reset # Réinitialiser la DB
npx prisma db seed       # Seed les données
npx prisma studio        # GUI database

# Prisma
npx prisma generate      # Générer le client
npx prisma format        # Formatter schema.prisma

# Tests
npm test                 # Exécuter les tests (si configurés)
```

---

## 📖 Documentation

- **API Complete:** `API-DOCUMENTATION-COMPLETE.md`
- **Module Marketing:** `MARKETING-MODULE-SUMMARY.md`
- **Guide Backend:** `GUIDE-BACKEND.md`

---

## 🆘 Support

En cas de problème:
1. Vérifier les logs du serveur
2. Consulter la documentation API
3. Vérifier les variables d'environnement
4. Tester avec Prisma Studio

---

## ✅ Checklist de Démarrage

- [ ] Node.js 18+ installé
- [ ] PostgreSQL installé et démarré
- [ ] `npm install` exécuté
- [ ] `.env` créé et configuré
- [ ] Base de données `spa_renaissance` créée
- [ ] `npx prisma generate` exécuté
- [ ] `npx prisma migrate dev` exécuté
- [ ] `npx prisma db seed` exécuté (optionnel)
- [ ] Email SMTP configuré (Gmail app password)
- [ ] `npm run dev` démarre sans erreur
- [ ] `curl http://localhost:5000/health` retourne OK
- [ ] Login admin fonctionne

---

**Bon développement! 🌸**
