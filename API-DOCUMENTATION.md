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

### 1.1 Inscription d'un employé
```http
POST /api/auth/register
```

**Accès:** Public (mais en production, devrait être protégé)

**Body:**
```json
{
  "email": "exemple@spa.com",
  "telephone": "5141234567",
  "password": "motdepasse123",
  "role": "MASSOTHERAPEUTE", // ou ESTHETICIENNE, SECRETAIRE, ADMIN
  "nom": "Dupont",
  "prenom": "Jean"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "user": {
      "id": "cuid123",
      "email": "exemple@spa.com",
      "telephone": "5141234567",
      "nom": "Dupont",
      "prenom": "Jean",
      "role": "MASSOTHERAPEUTE",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.2 Connexion
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

### 1.3 Rafraîchir le token
```http
POST /api/auth/refresh
```

**Accès:** Public

**Body:**
```json
{
  "token": "ancien_token_jwt"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Token rafraîchi",
  "data": {
    "token": "nouveau_token_jwt"
  }
}
```

---

## 2. 👥 CLIENTS (`/api/clients`)

### 2.1 Créer un dossier client
```http
POST /api/clients
```

**Accès:** Public (formulaire client)

**Body:**
```json
{
  "nom": "Dupont",
  "prenom": "Marie",
  "adresse": "123 Rue Example",
  "ville": "Montréal",
  "codePostal": "H1H 1H1",
  "telMaison": "5141234567",
  "telBureau": "5147654321",
  "telCellulaire": "5149876543",
  "courriel": "marie.dupont@example.com",
  "dateNaissance": "1990-05-15",
  "occupation": "Enseignante",
  "gender": "FEMME", // HOMME, FEMME, AUTRE
  "serviceType": "MASSOTHERAPIE", // ou ESTHETIQUE
  "assuranceCouvert": true,

  // Pour MASSOTHERAPIE
  "raisonConsultation": "Douleurs au dos",
  "diagnosticMedical": true,
  "diagnosticMedicalDetails": "Hernie discale L4-L5",
  "medicaments": true,
  "medicamentsDetails": "Ibuprofène 400mg au besoin",
  "zonesDouleur": ["dos-bas", "epaule-droite"],
  "mauxDeDos": true,
  "douleurMusculaire": true,
  "stresse": true,

  // Pour ESTHETIQUE
  "etatPeau": "Mixte",
  "fumeur": "Non",
  "niveauStress": "Modéré",
  "expositionSoleil": "Occasionnelle"
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
    "courriel": "marie.dupont@example.com",
    "serviceType": "MASSOTHERAPIE",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2.2 Récupérer tous les clients
```http
GET /api/clients?search=dupont&serviceType=MASSOTHERAPIE&page=1&limit=20
```

**Accès:** Authentifié (tous les employés)

**Permissions:**
- MASSOTHERAPEUTE/ESTHETICIENNE: Voit uniquement ses clients assignés
- SECRETAIRE/ADMIN: Voit tous les clients

**Query params:**
- `search` (optionnel): Recherche par nom, prénom, email, téléphone
- `serviceType` (optionnel): MASSOTHERAPIE ou ESTHETIQUE
- `page` (optionnel, défaut: 1)
- `limit` (optionnel, défaut: 20)

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "cuid123",
        "nom": "Dupont",
        "prenom": "Marie",
        "courriel": "marie.dupont@example.com",
        "telCellulaire": "5149876543",
        "serviceType": "MASSOTHERAPIE",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "notes": [
          {
            "id": "note123",
            "createdAt": "2024-01-16T14:00:00.000Z"
          }
        ],
        "assignments": [
          {
            "id": "assign123",
            "professional": {
              "id": "pro123",
              "nom": "Martin",
              "prenom": "Sophie",
              "role": "MASSOTHERAPEUTE"
            }
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### 2.3 Récupérer un client par ID
```http
GET /api/clients/:id
```

**Accès:** Authentifié

**Permissions:**
- MASSOTHERAPEUTE/ESTHETICIENNE: Uniquement si le client leur est assigné
- SECRETAIRE/ADMIN: Tous les clients

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "id": "cuid123",
    "nom": "Dupont",
    "prenom": "Marie",
    "adresse": "123 Rue Example",
    "ville": "Montréal",
    "codePostal": "H1H 1H1",
    "telCellulaire": "5149876543",
    "courriel": "marie.dupont@example.com",
    "dateNaissance": "1990-05-15T00:00:00.000Z",
    "gender": "FEMME",
    "serviceType": "MASSOTHERAPIE",
    "assuranceCouvert": true,
    "raisonConsultation": "Douleurs au dos",
    "zonesDouleur": ["dos-bas", "epaule-droite"],
    "notes": [
      {
        "id": "note123",
        "content": "Premier traitement effectué...",
        "createdAt": "2024-01-16T14:00:00.000Z",
        "author": {
          "id": "pro123",
          "nom": "Martin",
          "prenom": "Sophie",
          "email": "sophie.martin@spa.com",
          "role": "MASSOTHERAPEUTE"
        }
      }
    ],
    "assignments": [
      {
        "id": "assign123",
        "assignedAt": "2024-01-15T11:00:00.000Z",
        "professional": {
          "id": "pro123",
          "nom": "Martin",
          "prenom": "Sophie",
          "role": "MASSOTHERAPEUTE"
        }
      }
    ]
  }
}
```

---

### 2.4 Mettre à jour un client
```http
PUT /api/clients/:id
```

**Accès:** SECRETAIRE, ADMIN uniquement

**Body:** Mêmes champs que la création (partiels acceptés)

**Réponse (200):**
```json
{
  "success": true,
  "message": "Client mis à jour avec succès",
  "data": {
    "id": "cuid123",
    "nom": "Dupont",
    "prenom": "Marie",
    "updatedAt": "2024-01-17T09:00:00.000Z"
  }
}
```

---

### 2.5 Supprimer un client
```http
DELETE /api/clients/:id
```

**Accès:** ADMIN uniquement

**Réponse (200):**
```json
{
  "success": true,
  "message": "Client supprimé avec succès"
}
```

---

### 2.6 Rechercher des clients
```http
GET /api/clients/search/:query
```

**Accès:** Authentifié

**Exemple:** `GET /api/clients/search/dupont`

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid123",
      "nom": "Dupont",
      "prenom": "Marie",
      "courriel": "marie.dupont@example.com",
      "telCellulaire": "5149876543"
    }
  ]
}
```

---

## 3. 📝 NOTES (`/api/notes`)

### 3.1 Récupérer les notes d'un client
```http
GET /api/notes/:clientId
```

**Accès:** Authentifié

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "note123",
      "content": "Premier traitement effectué. Le client a bien répondu...",
      "clientId": "client123",
      "createdAt": "2024-01-16T14:00:00.000Z",
      "updatedAt": "2024-01-16T14:00:00.000Z",
      "author": {
        "id": "pro123",
        "nom": "Martin",
        "prenom": "Sophie",
        "email": "sophie.martin@spa.com",
        "role": "MASSOTHERAPEUTE"
      }
    }
  ]
}
```

---

### 3.2 Ajouter une note
```http
POST /api/notes/:clientId
```

**Accès:** MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN

**Permissions:** Le professionnel doit être assigné au client (sauf ADMIN)

**Body:**
```json
{
  "content": "Deuxième séance. Amélioration notable des douleurs au dos. Le client rapporte mieux dormir depuis la dernière séance."
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Note ajoutée avec succès",
  "data": {
    "id": "note456",
    "content": "Deuxième séance. Amélioration notable...",
    "clientId": "client123",
    "createdAt": "2024-01-18T15:30:00.000Z",
    "author": {
      "id": "pro123",
      "nom": "Martin",
      "prenom": "Sophie",
      "email": "sophie.martin@spa.com",
      "role": "MASSOTHERAPEUTE"
    }
  }
}
```

---

### 3.3 Modifier une note
```http
PUT /api/notes/:noteId
```

**Accès:** Authentifié

**Permissions:**
- L'auteur de la note peut la modifier
- L'ADMIN peut modifier toutes les notes

**Body:**
```json
{
  "content": "Contenu modifié de la note..."
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Note mise à jour avec succès",
  "data": {
    "id": "note123",
    "content": "Contenu modifié de la note...",
    "updatedAt": "2024-01-18T16:00:00.000Z"
  }
}
```

---

### 3.4 Supprimer une note
```http
DELETE /api/notes/:noteId
```

**Accès:** ADMIN uniquement

**Réponse (200):**
```json
{
  "success": true,
  "message": "Note supprimée avec succès"
}
```

---

## 4. 🔗 ASSIGNATIONS (`/api/assignments`)

### 4.1 Assigner un client à un professionnel
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

**Validations:**
- Le client et le professionnel doivent exister
- Un client MASSOTHERAPIE doit être assigné à un MASSOTHERAPEUTE
- Un client ESTHETIQUE doit être assigné à une ESTHETICIENNE
- Un client peut être assigné à plusieurs professionnels

**Réponse (201):**
```json
{
  "success": true,
  "message": "Client assigné avec succès",
  "data": {
    "id": "assign123",
    "clientId": "client123",
    "professionalId": "pro456",
    "assignedAt": "2024-01-15T11:00:00.000Z",
    "client": {
      "id": "client123",
      "nom": "Dupont",
      "prenom": "Marie",
      "serviceType": "MASSOTHERAPIE"
    },
    "professional": {
      "id": "pro456",
      "nom": "Martin",
      "prenom": "Sophie",
      "email": "sophie.martin@spa.com",
      "role": "MASSOTHERAPEUTE"
    }
  }
}
```

---

### 4.2 Supprimer une assignation
```http
DELETE /api/assignments/:clientId/:professionalId
```

**Accès:** SECRETAIRE, ADMIN uniquement

**Réponse (200):**
```json
{
  "success": true,
  "message": "Assignation supprimée avec succès"
}
```

---

### 4.3 Récupérer les assignations d'un client
```http
GET /api/assignments/client/:clientId
```

**Accès:** SECRETAIRE, ADMIN uniquement

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "assign123",
      "assignedAt": "2024-01-15T11:00:00.000Z",
      "professional": {
        "id": "pro123",
        "nom": "Martin",
        "prenom": "Sophie",
        "email": "sophie.martin@spa.com",
        "role": "MASSOTHERAPEUTE"
      }
    },
    {
      "id": "assign456",
      "assignedAt": "2024-01-16T09:00:00.000Z",
      "professional": {
        "id": "pro789",
        "nom": "Leblanc",
        "prenom": "Pierre",
        "email": "pierre.leblanc@spa.com",
        "role": "MASSOTHERAPEUTE"
      }
    }
  ]
}
```

---

### 4.4 Récupérer les clients assignés à un professionnel
```http
GET /api/assignments/professional/:professionalId
```

**Accès:** Authentifié

**Permissions:**
- Le professionnel peut voir ses propres assignations
- SECRETAIRE/ADMIN peuvent voir les assignations de tous

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "assign123",
      "assignedAt": "2024-01-15T11:00:00.000Z",
      "client": {
        "id": "client123",
        "nom": "Dupont",
        "prenom": "Marie",
        "courriel": "marie.dupont@example.com",
        "telCellulaire": "5149876543",
        "serviceType": "MASSOTHERAPIE",
        "dateNaissance": "1990-05-15T00:00:00.000Z"
      }
    }
  ]
}
```

---

## 5. 👨‍⚕️ PROFESSIONNELS (`/api/professionals`)

### 5.1 Récupérer la liste des professionnels
```http
GET /api/professionals?role=MASSOTHERAPEUTE&search=sophie
```

**Accès:** SECRETAIRE, ADMIN uniquement

**Query params:**
- `role` (optionnel): MASSOTHERAPEUTE, ESTHETICIENNE, ou ADMIN
- `search` (optionnel): Recherche par nom, prénom, email

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "pro123",
      "email": "sophie.martin@spa.com",
      "telephone": "5143333333",
      "nom": "Martin",
      "prenom": "Sophie",
      "role": "MASSOTHERAPEUTE",
      "createdAt": "2024-01-10T08:00:00.000Z",
      "_count": {
        "assignedClients": 5
      }
    }
  ]
}
```

---

### 5.2 Récupérer un professionnel par ID
```http
GET /api/professionals/:id
```

**Accès:** SECRETAIRE, ADMIN uniquement

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "id": "pro123",
    "email": "sophie.martin@spa.com",
    "telephone": "5143333333",
    "nom": "Martin",
    "prenom": "Sophie",
    "role": "MASSOTHERAPEUTE",
    "createdAt": "2024-01-10T08:00:00.000Z",
    "assignedClients": [
      {
        "id": "assign123",
        "assignedAt": "2024-01-15T11:00:00.000Z",
        "client": {
          "id": "client123",
          "nom": "Dupont",
          "prenom": "Marie",
          "serviceType": "MASSOTHERAPIE",
          "courriel": "marie.dupont@example.com",
          "telCellulaire": "5149876543"
        }
      }
    ]
  }
}
```

---

### 5.3 Récupérer les statistiques d'un professionnel
```http
GET /api/professionals/:id/stats
```

**Accès:** Authentifié

**Permissions:**
- Le professionnel peut voir ses propres stats
- SECRETAIRE/ADMIN peuvent voir les stats de tous

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "totalClients": 12,
    "totalNotes": 45,
    "clientsByService": {
      "MASSOTHERAPIE": 8,
      "ESTHETIQUE": 4
    }
  }
}
```

---

## 6. ❌ CODES D'ERREUR

### Erreurs communes

**400 - Bad Request**
```json
{
  "success": false,
  "error": "Données invalides",
  "details": "Validation errors..."
}
```

**401 - Unauthorized**
```json
{
  "success": false,
  "error": "Token d'authentification manquant"
}
```

**403 - Forbidden**
```json
{
  "success": false,
  "error": "Vous n'avez pas les permissions nécessaires"
}
```

**404 - Not Found**
```json
{
  "success": false,
  "error": "Client non trouvé"
}
```

**500 - Server Error**
```json
{
  "success": false,
  "error": "Une erreur interne est survenue"
}
```

---

## 7. 📊 EXEMPLES D'UTILISATION

### Exemple 1: Workflow complet - Nouvelle cliente

```bash
# 1. La cliente remplit le formulaire (pas besoin d'auth)
curl -X POST http://localhost:5000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Tremblay",
    "prenom": "Julie",
    "courriel": "julie.tremblay@example.com",
    "telCellulaire": "5141234567",
    "dateNaissance": "1992-03-20",
    "gender": "FEMME",
    "serviceType": "MASSOTHERAPIE",
    "assuranceCouvert": true,
    "adresse": "456 Rue Example",
    "ville": "Montréal",
    "codePostal": "H2X 1Y5",
    "raisonConsultation": "Maux de tête",
    "zonesDouleur": ["cou", "tete"]
  }'

# 2. La secrétaire se connecte
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "secretaire@spa.com",
    "password": "secretaire123"
  }'

# 3. La secrétaire voit tous les clients
curl http://localhost:5000/api/clients \
  -H "Authorization: Bearer <token_secretaire>"

# 4. La secrétaire assigne la cliente à un massothérapeute
curl -X POST http://localhost:5000/api/assignments \
  -H "Authorization: Bearer <token_secretaire>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "<client_id>",
    "professionalId": "<massotherapeute_id>"
  }'

# 5. Le massothérapeute se connecte
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "masso1@spa.com",
    "password": "masso123"
  }'

# 6. Le massothérapeute voit ses clients assignés
curl http://localhost:5000/api/clients \
  -H "Authorization: Bearer <token_masso>"

# 7. Le massothérapeute ajoute une note après le traitement
curl -X POST http://localhost:5000/api/notes/<client_id> \
  -H "Authorization: Bearer <token_masso>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Premier traitement effectué. Tensions au niveau cervical. Plan: 2 séances/semaine x 3 semaines."
  }'
```

---

## 8. 🔒 RÉSUMÉ DES PERMISSIONS

| Route | CLIENT | SECRETAIRE | MASSO/ESTHETICIENNE | ADMIN |
|-------|--------|------------|---------------------|-------|
| POST /api/clients | ✅ | ❌ | ❌ | ❌ |
| GET /api/clients | ❌ | ✅ (tous) | ✅ (assignés) | ✅ (tous) |
| GET /api/clients/:id | ❌ | ✅ | ✅ (si assigné) | ✅ |
| PUT /api/clients/:id | ❌ | ✅ | ❌ | ✅ |
| DELETE /api/clients/:id | ❌ | ❌ | ❌ | ✅ |
| POST /api/notes/:clientId | ❌ | ❌ | ✅ (si assigné) | ✅ |
| PUT /api/notes/:noteId | ❌ | ❌ | ✅ (auteur) | ✅ |
| DELETE /api/notes/:noteId | ❌ | ❌ | ❌ | ✅ |
| POST /api/assignments | ❌ | ✅ | ❌ | ✅ |
| GET /api/professionals | ❌ | ✅ | ❌ | ✅ |

---

**Documentation générée pour Spa Renaissance Backend v1.0** 🌸
