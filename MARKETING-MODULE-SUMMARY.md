# 📧 Module Marketing - Résumé Complet

## ✅ Fonctionnalités Implémentées

### 1. Récupération des Contacts avec Filtres Avancés
**Route:** `GET /api/marketing/contacts`

**Filtres disponibles:**
- `serviceType`: MASSOTHERAPIE ou ESTHETIQUE
- `lastVisitMonths`: Nombre de mois depuis la dernière visite (1, 2, 3, 6, etc.)
- `lastVisitYears`: Nombre d'années depuis la dernière visite (1, 2, etc.)
- `gender`: HOMME, FEMME, AUTRE
- `search`: Recherche par nom, prénom, email, téléphone

**Calculs automatiques:**
- Dernière visite basée sur la note la plus récente
- Jours sans visite calculés automatiquement
- Identification des clients jamais venus

**Fichier:** `src/modules/marketing/marketing.controller.ts:13-137`

---

### 2. Export CSV des Contacts
**Route:** `GET /api/marketing/contacts/export`

**Fonctionnalités:**
- Export de tous les contacts en format CSV
- Colonnes: Nom, Prénom, Email, Téléphone Cellulaire, Téléphone Maison, Téléphone Bureau, Service, Genre, Ville, Date Inscription, Dernière Visite
- Téléchargement direct avec Content-Disposition header
- Filtrage par serviceType optionnel

**Fichier:** `src/modules/marketing/marketing.controller.ts:144-209`

---

### 3. Envoi d'Email Individuel
**Route:** `POST /api/marketing/send-email/individual`

**Corps de la requête:**
```json
{
  "clientId": "cuid123",
  "subject": "Sujet de l'email",
  "message": "Message personnalisé"
}
```

**Fonctionnalités:**
- Vérification que le client existe
- Email HTML personnalisé avec template Spa Renaissance
- Gestion des erreurs d'envoi
- Confirmation avec détails du destinataire

**Fichier:** `src/modules/marketing/marketing.controller.ts:222-263`

---

### 4. Campagne Email en Masse
**Route:** `POST /api/marketing/send-email/campaign`

**Corps de la requête:**
```json
{
  "clientIds": ["id1", "id2", "id3"],
  "subject": "Sujet de la campagne",
  "message": "Message pour tous"
}
```

**Fonctionnalités:**
- Envoi parallèle pour optimiser les performances (Promise.all)
- Gestion individuelle des erreurs (un échec n'arrête pas la campagne)
- Rapport détaillé: succès, échecs, total
- Liste des erreurs pour debugging

**Fichier:** `src/modules/marketing/marketing.controller.ts:276-328`

---

### 5. Statistiques Marketing
**Route:** `GET /api/marketing/stats`

**Données retournées:**
- Total de clients
- Nouveaux clients des 30 derniers jours
- Clients inactifs depuis 3 mois
- Répartition par type de service (MASSOTHERAPIE, ESTHETIQUE)
- Répartition par genre (HOMME, FEMME, AUTRE)

**Fichier:** `src/modules/marketing/marketing.controller.ts:335-403`

---

## 📁 Fichiers Créés/Modifiés

### Nouveaux Fichiers

1. **src/modules/marketing/marketing.controller.ts**
   - 5 fonctions de contrôleur
   - Validation Zod pour les emails
   - Logique de filtrage avancée

2. **src/modules/marketing/marketing.routes.ts**
   - 5 routes protégées par ADMIN
   - Middleware authenticate + authorize('ADMIN')
   - Documentation des routes

### Fichiers Modifiés

3. **src/lib/email.ts**
   - Ajout de `sendMarketingEmail()` fonction
   - Template HTML personnalisé pour marketing
   - Gestion des erreurs d'envoi

4. **server.ts**
   - Import de `marketingRoutes`
   - Montage de `/api/marketing`
   - Routes ajoutées au log de démarrage

5. **API-DOCUMENTATION-COMPLETE.md**
   - Section 6 complète sur le marketing
   - 5 endpoints documentés
   - 3 scénarios d'usage
   - Workflow marketing complet (section 8)
   - Permissions ADMIN mises à jour

---

## 🔒 Sécurité

**Toutes les routes marketing sont protégées:**
```typescript
router.use(authenticate);
router.use(authorize('ADMIN'));
```

- Seul le rôle ADMIN peut accéder au module marketing
- Authentification JWT requise sur toutes les routes
- Pas de bypass possible

---

## 🎯 Cas d'Usage Typiques

### Scénario 1: Campagne de Réactivation
```bash
# 1. Trouver les clients inactifs depuis 3 mois
GET /api/marketing/contacts?lastVisitMonths=3

# 2. Envoyer une offre de retour
POST /api/marketing/send-email/campaign
{
  "clientIds": [...],
  "subject": "Revenez nous voir - 20% de rabais",
  "message": "Nous vous avons manqué..."
}
```

### Scénario 2: Promotion par Service
```bash
# 1. Cibler uniquement les clients de massothérapie
GET /api/marketing/contacts?serviceType=MASSOTHERAPIE

# 2. Envoyer une promotion massage
POST /api/marketing/send-email/campaign
{
  "clientIds": [...],
  "subject": "Promotion massage suédois",
  "message": "30% de rabais ce mois-ci!"
}
```

### Scénario 3: Export pour MailChimp
```bash
# Exporter tous les contacts en CSV
GET /api/marketing/contacts/export
# Télécharge: contacts-clients.csv
```

---

## ⚙️ Logique Technique

### Calcul de la Dernière Visite
```typescript
// Récupère la note la plus récente par client
notes: {
  select: { createdAt: true },
  orderBy: { createdAt: 'desc' },
  take: 1,
}

// Calcule les jours sans visite
joursSansVisite: client.notes.length > 0
  ? Math.floor((Date.now() - new Date(client.notes[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
  : null
```

### Filtrage par Date
```typescript
// Filtrage côté application (pas Prisma)
if (lastVisitMonths) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  filteredClients = clients.filter(client => {
    if (client.notes.length === 0) return true; // Jamais venu
    return new Date(client.notes[0].createdAt) < cutoffDate;
  });
}
```

### Envoi Parallèle d'Emails
```typescript
// Promise.all pour optimiser les performances
const emailPromises = clients.map(client =>
  sendMarketingEmail(...)
    .catch(error => ({ error: true, client: client.courriel, message: error.message }))
);

const results = await Promise.all(emailPromises);

// Compter succès et échecs
const failures = results.filter(r => r?.error);
const successes = results.length - failures.length;
```

---

## 📊 Format des Réponses

### Exemple: Liste de Contacts
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "cuid123",
        "nom": "Dupont",
        "prenom": "Marie",
        "nomComplet": "Marie Dupont",
        "courriel": "marie@example.com",
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
      "gender": "tous"
    }
  }
}
```

### Exemple: Résultat de Campagne
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

---

## 🧪 Tests Suggérés

### Test 1: Récupération de Contacts
```bash
curl http://localhost:5000/api/marketing/contacts \
  -H "Authorization: Bearer <admin_token>"
```

### Test 2: Filtrage par Inactivité
```bash
curl "http://localhost:5000/api/marketing/contacts?lastVisitMonths=3&serviceType=MASSOTHERAPIE" \
  -H "Authorization: Bearer <admin_token>"
```

### Test 3: Email Individuel
```bash
curl -X POST http://localhost:5000/api/marketing/send-email/individual \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "cuid123",
    "subject": "Test Email",
    "message": "Ceci est un test"
  }'
```

### Test 4: Export CSV
```bash
curl http://localhost:5000/api/marketing/contacts/export \
  -H "Authorization: Bearer <admin_token>" \
  -o contacts.csv
```

### Test 5: Statistiques
```bash
curl http://localhost:5000/api/marketing/stats \
  -H "Authorization: Bearer <admin_token>"
```

---

## ✨ Fonctionnalités Futures Possibles

1. **Historique des Campagnes**
   - Table Campaign pour sauvegarder les campagnes envoyées
   - Statistiques de taux d'ouverture (avec tracking pixel)

2. **Templates d'Emails**
   - Modèles pré-définis
   - Variables dynamiques (nom, service, etc.)

3. **Planification d'Envoi**
   - Programmer des campagnes futures
   - Envoi automatique récurrent

4. **Segmentation Avancée**
   - Créer des segments de clients sauvegardés
   - Filtres combinés complexes

5. **A/B Testing**
   - Tester différents sujets/messages
   - Analyser les performances

---

**Module Marketing complété le:** 2025-12-13
**Documentation:** Voir `API-DOCUMENTATION-COMPLETE.md` section 6
