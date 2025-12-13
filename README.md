# 🌸 Spa Renaissance - Backend API

Backend Express.js/TypeScript pour le système de gestion du Spa Renaissance avec authentification, gestion des clients et assignations des professionnels.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Structure du projet](#structure-du-projet)
- [API Endpoints](#api-endpoints)
- [Rôles et permissions](#rôles-et-permissions)
- [Base de données](#base-de-données)
- [Comptes de test](#comptes-de-test)

## ✨ Fonctionnalités

- ✅ Authentification JWT pour les employés
- ✅ Gestion des profils clients (massothérapie et esthétique)
- ✅ Système d'assignation des clients aux professionnels
- ✅ Gestion des notes de traitement avec traçabilité
- ✅ Permissions basées sur les rôles (RBAC)
- ✅ Envoi d'emails de confirmation
- ✅ Recherche et filtrage des clients
- ✅ Validation des données avec Zod
- ✅ Rate limiting et sécurité avec Helmet

## 🛠 Technologies utilisées

- **Runtime**: Node.js
- **Framework**: Express.js
- **Langage**: TypeScript
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Authentification**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Email**: Nodemailer
- **Sécurité**: Helmet, CORS, express-rate-limit
- **Hashage**: bcryptjs

## 📦 Prérequis

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm ou yarn

## 🚀 Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd spa-backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Créer le fichier .env**
```bash
cp .env.example .env
```

4. **Configurer les variables d'environnement** (voir section Configuration)

5. **Générer le client Prisma**
```bash
npm run prisma:generate
```

6. **Pousser le schéma vers la base de données**
```bash
npm run prisma:push
```

7. **Seeder la base de données (optionnel)**
```bash
npm run prisma:seed
```

## ⚙️ Configuration

Modifiez le fichier `.env` avec vos informations. Voir `.env.example` pour la liste complète des variables.

## 🏃‍♂️ Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm run build
npm start
```

## 🔐 Comptes de test

Après avoir exécuté `npm run prisma:seed`:

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@spa.com | admin123 |
| Secrétaire | secretaire@spa.com | secretaire123 |
| Massothérapeute 1 | masso1@spa.com | masso123 |
| Massothérapeute 2 | masso2@spa.com | masso123 |
| Esthéticienne 1 | esthetique1@spa.com | esthetique123 |
| Esthéticienne 2 | esthetique2@spa.com | esthetique123 |

