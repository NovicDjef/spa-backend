# 🔒 Nouvelles Fonctionnalités de Sécurité et Permissions

## ✅ Fonctionnalités Implémentées

### 1. **Système de Blocage des Employés** 🚫

L'ADMIN peut maintenant activer/désactiver n'importe quel employé (SECRETAIRE, MASSOTHERAPEUTE, ESTHETICIENNE).

**Nouveau champ dans le modèle User:**
```prisma
isActive  Boolean  @default(true)
```

**Comportement:**
- Un employé désactivé ne peut PAS se connecter
- Un employé désactivé ne peut PAS accéder aux dossiers clients
- L'ADMIN ne peut PAS se désactiver lui-même
- L'ADMIN ne peut PAS désactiver un autre ADMIN

**Nouvelle route:**
```http
PATCH /api/users/:id/toggle-status
Authorization: Bearer <admin_token>

Body:
{
  "isActive": false  // true pour activer, false pour désactiver
}
```

---

### 2. **Secret Médical - Protection des Notes** 🏥

La SECRETAIRE ne peut plus voir les notes médicales des clients.

**Modifications:**
- `GET /api/clients` - La SECRETAIRE voit la liste des clients SANS les notes
- `GET /api/clients/:id` - La SECRETAIRE est BLOQUÉE (erreur 403)
- Seuls MASSOTHERAPEUTE, ESTHETICIENNE et ADMIN peuvent consulter les dossiers complets

**Message d'erreur:**
```
"Accès refusé. Le secret médical vous empêche de consulter les dossiers clients."
```

---

### 3. **Permissions des Notes - Limite de 24h** ⏰

Les professionnels peuvent modifier/supprimer leurs notes UNIQUEMENT pendant 24h après création.

**Règles:**
- ✅ Un professionnel peut modifier/supprimer UNIQUEMENT ses propres notes
- ✅ Un professionnel peut modifier/supprimer UNIQUEMENT pendant 24h
- ✅ L'ADMIN peut modifier/supprimer TOUTES les notes à TOUT moment
- ❌ Un MASSOTHERAPEUTE ne peut PAS modifier la note d'un autre MASSOTHERAPEUTE

**Routes modifiées:**
```http
PUT /api/notes/:noteId
DELETE /api/notes/:noteId
```

**Messages d'erreur:**
```json
// Si pas l'auteur
{
  "error": "Vous ne pouvez modifier que vos propres notes"
}

// Si > 24h
{
  "error": "Vous ne pouvez plus modifier cette note (limite de 24h dépassée)"
}
```

---

### 4. **Clients Multi-Professionnels** 👥

Un client peut être assigné à plusieurs professionnels (ex: 2 MASSOTHERAPEUTE).

**Comportement:**
- Tous les professionnels assignés peuvent voir le dossier du client
- Tous les professionnels assignés peuvent ajouter des notes
- Chaque professionnel ne peut modifier que ses propres notes
- Toutes les notes sont visibles par tous les professionnels assignés

---

## 🔄 Migrations Prisma Requises

### ⚠️ IMPORTANT - À FAIRE AVANT DE DÉMARRER

Le schéma Prisma a été modifié. Vous devez créer une migration:

```bash
# 1. Générer le client Prisma
npx prisma generate

# 2. Créer et appliquer la migration
npx prisma migrate dev --name add_isActive_field

# 3. (Optionnel) Mettre à jour les données de seed
npm run prisma:seed
```

---

## 📊 Matrice des Permissions

| Action | ADMIN | SECRETAIRE | MASSO/ESTH (assigné) | MASSO/ESTH (non assigné) |
|--------|-------|------------|---------------------|-------------------------|
| **Connexion (compte actif)** | ✅ | ✅ | ✅ | ✅ |
| **Connexion (compte inactif)** | ✅ | ❌ | ❌ | ❌ |
| **Voir liste clients** | ✅ | ✅ (sans notes) | ✅ (assignés seulement) | ❌ |
| **Voir dossier client complet** | ✅ | ❌ | ✅ (assignés seulement) | ❌ |
| **Voir notes du client** | ✅ | ❌ | ✅ (assignés seulement) | ❌ |
| **Ajouter note** | ✅ | ❌ | ✅ (assignés seulement) | ❌ |
| **Modifier sa note (<24h)** | ✅ | ❌ | ✅ | ❌ |
| **Modifier sa note (>24h)** | ✅ | ❌ | ❌ | ❌ |
| **Modifier note d'un autre** | ✅ | ❌ | ❌ | ❌ |
| **Supprimer sa note (<24h)** | ✅ | ❌ | ✅ | ❌ |
| **Supprimer sa note (>24h)** | ✅ | ❌ | ❌ | ❌ |
| **Supprimer note d'un autre** | ✅ | ❌ | ❌ | ❌ |
| **Assigner clients** | ✅ | ✅ | ❌ | ❌ |
| **Bloquer/débloquer employés** | ✅ | ❌ | ❌ | ❌ |

---

## 📝 Fichiers Modifiés

### Schéma Prisma
- ✅ `prisma/schema.prisma` - Ajout du champ `isActive`

### Authentification
- ✅ `src/modules/auth/auth.ts` - Vérification `isActive` dans le middleware
- ✅ `src/modules/auth/auth.controller.ts` - Vérification `isActive` au login

### Clients
- ✅ `src/modules/clients/client.controller.ts`:
  - `getClients()` - Masquage des notes pour SECRETAIRE
  - `getClientById()` - Blocage de la SECRETAIRE

### Notes
- ✅ `src/modules/notes/note.controller.ts`:
  - `updateNote()` - Limite de 24h + vérification auteur
  - `deleteNote()` - Limite de 24h + vérification auteur

### Utilisateurs (Employés)
- ✅ `src/modules/users/user.controller.ts` - Nouveau: `toggleUserStatus()`
- ✅ `src/modules/users/user.routes.ts` - Nouvelle route: `PATCH /:id/toggle-status`

---

## 🧪 Tests Recommandés

### Test 1: Bloquer un Employé

```bash
# 1. Connexion ADMIN
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spa.com","password":"admin123"}'

# 2. Désactiver un massothérapeute
curl -X PATCH http://localhost:5001/api/users/<masso_id>/toggle-status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'

# 3. Essayer de se connecter avec le compte désactivé
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"masso1@spa.com","password":"masso123"}'

# Résultat attendu: Erreur 403 "Votre compte a été désactivé"
```

### Test 2: SECRETAIRE ne voit pas les notes

```bash
# 1. Connexion SECRETAIRE
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"secretaire@spa.com","password":"secretaire123"}'

# 2. Voir la liste des clients (SANS notes)
curl http://localhost:5001/api/clients \
  -H "Authorization: Bearer <secretaire_token>"

# Résultat: clients visibles mais aucune note

# 3. Essayer de voir un dossier complet
curl http://localhost:5001/api/clients/<client_id> \
  -H "Authorization: Bearer <secretaire_token>"

# Résultat attendu: Erreur 403 "Le secret médical vous empêche..."
```

### Test 3: Limite de 24h pour modifier une note

```bash
# 1. Connexion MASSOTHERAPEUTE
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"masso1@spa.com","password":"masso123"}'

# 2. Créer une note
curl -X POST http://localhost:5001/api/notes/<client_id> \
  -H "Authorization: Bearer <masso_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Nouvelle note de test"}'

# 3. Modifier immédiatement (< 24h) - DOIT FONCTIONNER
curl -X PUT http://localhost:5001/api/notes/<note_id> \
  -H "Authorization: Bearer <masso_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Note modifiée"}'

# 4. Attendre 24h+ et essayer de modifier
# Résultat attendu: Erreur 403 "limite de 24h dépassée"

# 5. ADMIN peut toujours modifier
curl -X PUT http://localhost:5001/api/notes/<note_id> \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Admin modifie après 24h"}'

# Résultat: SUCCÈS
```

### Test 4: Client avec plusieurs professionnels

```bash
# 1. ADMIN assigne un client à 2 MASSOTHERAPEUTE
curl -X POST http://localhost:5001/api/assignments \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"clientId":"<client_id>","professionalId":"<masso1_id>"}'

curl -X POST http://localhost:5001/api/assignments \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"clientId":"<client_id>","professionalId":"<masso2_id>"}'

# 2. MASSO1 ajoute une note
curl -X POST http://localhost:5001/api/notes/<client_id> \
  -H "Authorization: Bearer <masso1_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Note de MASSO1"}'

# 3. MASSO2 peut voir cette note
curl http://localhost:5001/api/clients/<client_id> \
  -H "Authorization: Bearer <masso2_token>"

# Résultat: MASSO2 voit la note de MASSO1

# 4. MASSO2 ne peut PAS modifier la note de MASSO1
curl -X PUT http://localhost:5001/api/notes/<note_id> \
  -H "Authorization: Bearer <masso2_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Tentative modification"}'

# Résultat attendu: Erreur 403 "Vous ne pouvez modifier que vos propres notes"
```

---

## 🎯 Cas d'Usage Réels

### Scénario 1: Employé en Congé

```
Un MASSOTHERAPEUTE part en congé sabbatique pour 6 mois.
L'ADMIN désactive son compte pour éviter tout accès non autorisé.

Action: PATCH /api/users/:id/toggle-status { "isActive": false }

Résultat:
- Le MASSOTHERAPEUTE ne peut plus se connecter
- Ses clients sont toujours visibles dans la liste
- Un autre MASSOTHERAPEUTE peut être assigné à ses clients
```

### Scénario 2: Client Suivi par Plusieurs Professionnels

```
Une cliente vient pour MASSOTHERAPIE et ESTHETIQUE.
Elle est assignée à:
- Sophie (MASSOTHERAPEUTE)
- Julie (ESTHETICIENNE)

Résultats:
- Sophie voit toutes les notes de massothérapie
- Julie voit toutes les notes d'esthétique
- Sophie ne voit PAS les notes de Julie (et vice-versa)
- ADMIN voit TOUTES les notes
- SECRETAIRE ne voit AUCUNE note
```

### Scénario 3: Correction Rapide de Note

```
Un MASSOTHERAPEUTE écrit une note avec une faute.
Il a 24h pour la corriger.

Jour 1 (< 24h):
- PUT /api/notes/:id → SUCCÈS

Jour 2 (> 24h):
- PUT /api/notes/:id → ERREUR 403

Solution: Demander à l'ADMIN de faire la correction
```

---

## ⚠️ Points d'Attention

### 1. Migration de Base de Données

**CRITIQUE:** Le champ `isActive` doit être ajouté à la table `User`.

```bash
npx prisma migrate dev --name add_isActive_field
```

Tous les employés existants auront `isActive = true` par défaut.

### 2. Frontend

Le frontend doit être mis à jour pour:
- Afficher l'état actif/inactif des employés
- Permettre à l'ADMIN de bloquer/débloquer
- Gérer l'erreur "Compte désactivé" au login
- Masquer les notes pour la SECRETAIRE
- Gérer l'erreur "Limite de 24h dépassée"

### 3. Emails

Considérer d'envoyer un email à l'employé quand:
- Son compte est désactivé
- Son compte est réactivé

### 4. Audit Trail

Pour un suivi complet, considérer d'ajouter:
- Table `AuditLog` pour tracker qui a désactivé qui et quand
- Log des tentatives de connexion avec compte désactivé

---

## 📚 Documentation API Mise à Jour

Voir `API-DOCUMENTATION-COMPLETE.md` pour la documentation complète de toutes les routes.

**Nouvelle route ajoutée:**
- `PATCH /api/users/:id/toggle-status` - Activer/Désactiver un employé

**Routes modifiées:**
- `GET /api/clients` - Comportement différent pour SECRETAIRE
- `GET /api/clients/:id` - SECRETAIRE bloquée
- `PUT /api/notes/:noteId` - Limite de 24h ajoutée
- `DELETE /api/notes/:noteId` - Limite de 24h ajoutée

---

**Date d'implémentation:** 2025-12-13
**Version:** 2.0 - Sécurité et Permissions
