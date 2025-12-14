# 📚 Documentation complète des API - Spa Renaissance

## 🔗 URL de base
```
http://localhost:5000/api
```

## 🔑 Authentification

La plupart des routes nécessitent un token JWT dans le header:
```
Authorization: Bearer <votre_token_jwt>
```

---

## 1. 🔐 AUTHENTIFICATION (`/api/auth`)

### 1.1 Connexion
```http
POST /api/auth/login
```

**Accès:** Public

**Body:**
```json
{
  "email": "admin@spa.com",
  "password": "admin123"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "cuid123",
      "email": "admin@spa.com",
      "telephone": "5141111111",
      "nom": "Admin",
      "prenom": "Principal",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 2. 👥 GESTION DES EMPLOYÉS (`/api/users`) - ADMIN UNIQUEMENT

### 2.1 Créer un employé
```http
POST /api/users
```

**Accès:** ADMIN uniquement

**Body:**
```json
{
  "email": "sophie.martin@spa.com",
  "telephone": "5143333333",
  "password": "masso123",
  "role": "MASSOTHERAPEUTE",
  "nom": "Martin",
  "prenom": "Sophie"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Employé créé avec succès",
  "data": {
    "user": {
      "id": "cuid456",
      "email": "sophie.martin@spa.com",
      "telephone": "5143333333",
      "nom": "Martin",
      "prenom": "Sophie",
      "role": "MASSOTHERAPEUTE",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "plainPassword": "masso123"
  }
}
```

**⚠️ Important:** Le mot de passe en clair est retourné UNE SEULE FOIS lors de la création. L'admin doit le noter pour le donner à l'employé.

---

### 2.2 Récupérer tous les employés
```http
GET /api/users?role=MASSOTHERAPEUTE&search=martin
```

**Accès:** ADMIN uniquement

**Query params:**
- `role` (optionnel): SECRETAIRE, MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN
- `search` (optionnel): Recherche par nom, prénom, email, téléphone

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid456",
      "email": "sophie.martin@spa.com",
      "telephone": "5143333333",
      "nom": "Martin",
      "prenom": "Sophie",
      "role": "MASSOTHERAPEUTE",
      "createdAt": "2024-01-10T08:00:00.000Z",
      "_count": {
        "assignedClients": 8,
        "notesCreated": 45
      }
    }
  ]
}
```

---

### 2.3 Récupérer un employé par ID
```http
GET /api/users/:id
```

**Accès:** ADMIN uniquement

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "id": "cuid456",
    "email": "sophie.martin@spa.com",
    "telephone": "5143333333",
    "nom": "Martin",
    "prenom": "Sophie",
    "role": "MASSOTHERAPEUTE",
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-15T14:20:00.000Z",
    "assignedClients": [
      {
        "id": "assign123",
        "assignedAt": "2024-01-12T09:00:00.000Z",
        "client": {
          "id": "client123",
          "nom": "Dupont",
          "prenom": "Marie",
          "serviceType": "MASSOTHERAPIE"
        }
      }
    ],
    "notesCreated": [
      {
        "id": "note123",
        "createdAt": "2024-01-14T15:30:00.000Z",
        "client": {
          "nom": "Dupont",
          "prenom": "Marie"
        }
      }
    ]
  }
}
```

---

### 2.4 Mettre à jour un employé
```http
PUT /api/users/:id
```

**Accès:** ADMIN uniquement

**Body (tous les champs sont optionnels):**
```json
{
  "email": "nouveau.email@spa.com",
  "telephone": "5149999999",
  "nom": "NouveauNom",
  "prenom": "NouveauPrenom",
  "role": "ADMIN",
  "password": "nouveaumotdepasse123"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Employé mis à jour avec succès",
  "data": {
    "id": "cuid456",
    "email": "nouveau.email@spa.com",
    "telephone": "5149999999",
    "nom": "NouveauNom",
    "prenom": "NouveauPrenom",
    "role": "ADMIN",
    "updatedAt": "2024-01-16T10:00:00.000Z",
    "plainPassword": "nouveaumotdepasse123"
  }
}
```

**⚠️ Note:** Si le mot de passe est modifié, il est retourné en clair pour que l'admin puisse le donner à l'employé.

---

### 2.5 Supprimer un employé
```http
DELETE /api/users/:id
```

**Accès:** ADMIN uniquement

**Restrictions:**
- L'admin ne peut pas supprimer son propre compte

**Réponse (200):**
```json
{
  "success": true,
  "message": "Employé supprimé avec succès"
}
```

---

### 2.6 Réinitialiser le mot de passe d'un employé
```http
POST /api/users/:id/reset-password
```

**Accès:** ADMIN uniquement

**Body:**
```json
{
  "newPassword": "nouveaumotdepasse123"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Mot de passe réinitialisé avec succès",
  "data": {
    "plainPassword": "nouveaumotdepasse123"
  }
}
```

---

## 3. 👥 CLIENTS (`/api/clients`)

### 3.1 Créer un dossier client
```http
POST /api/clients
```

**Accès:** Public (formulaire client - AUCUNE AUTHENTIFICATION REQUISE)

**Body:**
```json
{
  "nom": "Dupont",
  "prenom": "Marie",
  "adresse": "123 Rue Example",
  "ville": "Montréal",
  "codePostal": "H1H 1H1",
  "telCellulaire": "5149876543",
  "courriel": "marie.dupont@example.com",
  "dateNaissance": "1990-05-15",
  "gender": "FEMME",
  "serviceType": "MASSOTHERAPIE",
  "assuranceCouvert": true,
  "raisonConsultation": "Douleurs au dos",
  "zonesDouleur": ["dos-bas", "epaule-droite"],
  "mauxDeDos": true,
  "stresse": true
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Dossier client créé avec succès",
  "data": {
    "id": "cuid123",
    "nom": "Dupont",
    "prenom": "Marie",
    "courriel": "marie.dupont@example.com"
  }
}
```

**⚠️ Important:** Un email de bienvenue est automatiquement envoyé au client.

---

### 3.2 Récupérer tous les clients
```http
GET /api/clients?search=dupont&serviceType=MASSOTHERAPIE&page=1&limit=20
```

**Accès:** Authentifié (tous les employés)

**Permissions:**
- **MASSOTHERAPEUTE/ESTHETICIENNE**: Voit uniquement ses clients assignés
- **SECRETAIRE/ADMIN**: Voit tous les clients

**Réponse:** Voir documentation complète

---

### 3.3 Modifier un client
```http
PUT /api/clients/:id
```

**Accès:** **ADMIN UNIQUEMENT**

**Body:** Mêmes champs que la création (partiels acceptés)

---

### 3.4 Supprimer un client
```http
DELETE /api/clients/:id
```

**Accès:** **ADMIN UNIQUEMENT**

---

## 4. 📝 NOTES (`/api/notes`)

### 4.1 Ajouter une note
```http
POST /api/notes/:clientId
```

**Accès:** MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN

**Permissions:** Le professionnel doit être assigné au client (sauf ADMIN)

**Body:**
```json
{
  "content": "Deuxième séance. Amélioration notable des douleurs..."
}
```

---

## 5. 🔗 ASSIGNATIONS (`/api/assignments`)

### 5.1 Assigner un client à un professionnel
```http
POST /api/assignments
```

**Accès:** SECRETAIRE, ADMIN uniquement

**Body:**
```json
{
  "clientId": "client123",
  "professionalId": "pro456"
}
```

---

## 6. 📧 MARKETING (`/api/marketing`) - ADMIN UNIQUEMENT

### 6.1 Récupérer les contacts avec filtres
```http
GET /api/marketing/contacts?serviceType=MASSOTHERAPIE&lastVisitMonths=3&gender=FEMME&search=dupont
```

**Accès:** ADMIN uniquement

**Query params:**
- `serviceType` (optionnel): MASSOTHERAPIE, ESTHETIQUE
- `lastVisitMonths` (optionnel): Nombre de mois depuis la dernière visite (ex: 1, 2, 3, 6)
- `lastVisitYears` (optionnel): Nombre d'années depuis la dernière visite (ex: 1, 2)
- `gender` (optionnel): HOMME, FEMME, AUTRE
- `search` (optionnel): Recherche par nom, prénom, email, téléphone

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "client123",
        "nom": "Dupont",
        "prenom": "Marie",
        "nomComplet": "Marie Dupont",
        "courriel": "marie.dupont@example.com",
        "telCellulaire": "5149876543",
        "telMaison": "5141234567",
        "telBureau": null,
        "serviceType": "MASSOTHERAPIE",
        "gender": "FEMME",
        "dateInscription": "2024-01-10T08:00:00.000Z",
        "derniereVisite": "2024-01-15T14:30:00.000Z",
        "joursSansVisite": 45
      }
    ],
    "total": 15,
    "filters": {
      "serviceType": "MASSOTHERAPIE",
      "lastVisitMonths": "3",
      "lastVisitYears": "tous",
      "gender": "FEMME"
    }
  }
}
```

---

### 6.2 Exporter les contacts en CSV
```http
GET /api/marketing/contacts/export?serviceType=MASSOTHERAPIE
```

**Accès:** ADMIN uniquement

**Query params:**
- `serviceType` (optionnel): MASSOTHERAPIE, ESTHETIQUE

**Réponse (200):**
Télécharge un fichier CSV `contacts-clients.csv` avec les colonnes:
- Nom, Prénom, Email, Téléphone Cellulaire, Téléphone Maison, Téléphone Bureau
- Service, Genre, Ville, Date Inscription, Dernière Visite

**Headers:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename=contacts-clients.csv
```

---

### 6.3 Envoyer un email à un client spécifique
```http
POST /api/marketing/send-email/individual
```

**Accès:** ADMIN uniquement

**Body:**
```json
{
  "clientId": "client123",
  "subject": "Offre exclusive pour vous",
  "message": "Bonjour,\n\nNous avons une promotion spéciale ce mois-ci : 20% de rabais sur tous les massages thérapeutiques.\n\nRéservez dès maintenant !"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Email envoyé avec succès à Marie Dupont",
  "data": {
    "recipient": {
      "nom": "Dupont",
      "prenom": "Marie",
      "email": "marie.dupont@example.com"
    }
  }
}
```

---

### 6.4 Envoyer une campagne email en masse
```http
POST /api/marketing/send-email/campaign
```

**Accès:** ADMIN uniquement

**Body:**
```json
{
  "clientIds": ["client123", "client456", "client789"],
  "subject": "Revenez nous voir - Offre spéciale",
  "message": "Cher client,\n\nCela fait quelques mois que nous ne vous avons pas vu. Nous vous offrons 15% de rabais sur votre prochain rendez-vous.\n\nÀ bientôt !"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Campagne envoyée: 25 réussis, 2 échecs",
  "data": {
    "totalSent": 25,
    "totalFailed": 2,
    "totalClients": 27,
    "failures": [
      {
        "error": true,
        "client": "invalidemail@example.com",
        "message": "Invalid email address"
      }
    ]
  }
}
```

**⚠️ Note:** Les emails sont envoyés en parallèle pour optimiser les performances. Les erreurs individuelles n'arrêtent pas toute la campagne.

---

### 6.5 Obtenir des statistiques marketing
```http
GET /api/marketing/stats
```

**Accès:** ADMIN uniquement

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "totalClients": 150,
    "newClientsLast30Days": 12,
    "inactiveClients3Months": 35,
    "clientsByService": {
      "MASSOTHERAPIE": 90,
      "ESTHETIQUE": 60
    },
    "clientsByGender": {
      "FEMME": 110,
      "HOMME": 35,
      "AUTRE": 5
    }
  }
}
```

---

### 6.6 Cas d'usage marketing

**Scénario 1: Cibler les clients inactifs depuis 3 mois**
```bash
# 1. Récupérer les clients inactifs
curl http://localhost:5000/api/marketing/contacts?lastVisitMonths=3 \
  -H "Authorization: Bearer <admin_token>"

# 2. Envoyer une campagne de réactivation
curl -X POST http://localhost:5000/api/marketing/send-email/campaign \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientIds": ["id1", "id2", "id3"],
    "subject": "Nous vous avons manqué!",
    "message": "Ça fait un moment! Revenez avec 20% de rabais."
  }'
```

**Scénario 2: Promotion ciblée par service**
```bash
# Récupérer tous les clients de massothérapie
curl http://localhost:5000/api/marketing/contacts?serviceType=MASSOTHERAPIE \
  -H "Authorization: Bearer <admin_token>"

# Envoyer une offre spéciale massage
curl -X POST http://localhost:5000/api/marketing/send-email/campaign \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientIds": [...],
    "subject": "Promotion massage suédois",
    "message": "Offre exclusive: 30% sur les massages suédois ce mois-ci!"
  }'
```

**Scénario 3: Exporter pour marketing externe**
```bash
# Télécharger tous les contacts en CSV
curl http://localhost:5000/api/marketing/contacts/export \
  -H "Authorization: Bearer <admin_token>" \
  -o contacts.csv
```

---

## 7. 📊 RÉSUMÉ DES PERMISSIONS PAR RÔLE

### 🔴 ADMIN (Accès complet)
- ✅ Créer/Modifier/Supprimer des employés
- ✅ Voir les mots de passe des employés (lors de création/modification)
- ✅ Modifier/Supprimer des clients
- ✅ Voir tous les clients
- ✅ Assigner des clients
- ✅ Ajouter/Modifier/Supprimer des notes
- ✅ Voir tous les professionnels
- ✅ **Accès marketing complet:**
  - Récupérer tous les contacts avec filtres avancés
  - Exporter les contacts en CSV
  - Envoyer des emails individuels ou en campagne
  - Voir les statistiques marketing

### 🟡 SECRÉTAIRE
- ✅ Voir tous les clients
- ✅ Assigner des clients aux professionnels
- ✅ Voir tous les professionnels
- ❌ Ne peut PAS modifier/supprimer des clients
- ❌ Ne peut PAS gérer les employés

### 🟢 MASSOTHÉRAPEUTE / ESTHÉTICIENNE
- ✅ Voir uniquement ses clients assignés
- ✅ Ajouter des notes aux clients assignés
- ✅ Modifier ses propres notes
- ❌ Ne peut PAS voir/modifier les notes des autres
- ❌ Ne peut PAS modifier/supprimer des clients
- ❌ Ne peut PAS assigner des clients

---

## 7. 🎯 WORKFLOW COMPLET

### Scénario: Nouveau client + Assignation + Traitement

```bash
# 1. CLIENT: Remplit le formulaire (PAS d'auth)
curl -X POST http://localhost:5000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"nom":"Tremblay","prenom":"Julie",...}'

# 2. ADMIN: Se connecte
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spa.com","password":"admin123"}'

# 3. ADMIN: Crée un compte massothérapeute
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"nouveau.masso@spa.com",
    "telephone":"5141234567",
    "password":"masso2024",
    "role":"MASSOTHERAPEUTE",
    "nom":"Nouveau",
    "prenom":"Massothérapeute"
  }'

# 4. SECRETAIRE: Se connecte
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"secretaire@spa.com","password":"secretaire123"}'

# 5. SECRETAIRE: Assigne la cliente au massothérapeute
curl -X POST http://localhost:5000/api/assignments \
  -H "Authorization: Bearer <secretaire_token>" \
  -H "Content-Type: application/json" \
  -d '{"clientId":"<client_id>","professionalId":"<masso_id>"}'

# 6. MASSOTHÉRAPEUTE: Se connecte
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nouveau.masso@spa.com","password":"masso2024"}'

# 7. MASSOTHÉRAPEUTE: Voit ses clients assignés
curl http://localhost:5000/api/clients \
  -H "Authorization: Bearer <masso_token>"

# 8. MASSOTHÉRAPEUTE: Ajoute une note
curl -X POST http://localhost:5000/api/notes/<client_id> \
  -H "Authorization: Bearer <masso_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Premier traitement effectué..."}'
```

---

## 8. 🎯 WORKFLOW MARKETING (ADMIN)

### Scénario: Campagne de réactivation pour clients inactifs

```bash
# 1. ADMIN: Se connecte
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spa.com","password":"admin123"}'

# 2. ADMIN: Consulte les statistiques
curl http://localhost:5000/api/marketing/stats \
  -H "Authorization: Bearer <admin_token>"

# Réponse: 35 clients inactifs depuis 3 mois

# 3. ADMIN: Récupère les contacts inactifs depuis 3 mois (MASSOTHERAPIE uniquement)
curl http://localhost:5000/api/marketing/contacts?lastVisitMonths=3&serviceType=MASSOTHERAPIE \
  -H "Authorization: Bearer <admin_token>"

# Réponse: Liste de 20 clients avec leurs coordonnées

# 4. ADMIN: Envoie une campagne ciblée
curl -X POST http://localhost:5000/api/marketing/send-email/campaign \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientIds": ["client1", "client2", "client3", ...],
    "subject": "Nous vous avons manqué! Offre spéciale 20%",
    "message": "Bonjour,\n\nNous avons remarqué que cela fait quelques mois que nous ne vous avons pas vu.\n\nPour vous remercier de votre fidélité, nous vous offrons 20% de rabais sur votre prochain massage thérapeutique.\n\nRéservez avant la fin du mois!\n\nÀ très bientôt,\nL'\''équipe du Spa Renaissance"
  }'

# Réponse: 18 emails envoyés avec succès, 2 échecs

# 5. ADMIN (optionnel): Exporte tous les contacts pour mailchimp
curl http://localhost:5000/api/marketing/contacts/export \
  -H "Authorization: Bearer <admin_token>" \
  -o contacts-export.csv
```

---

**Documentation générée pour Spa Renaissance Backend v1.0** 🌸
