# 📋 Gestion des Assignations de Clients

## 🎯 Vue d'ensemble

Le système d'assignation permet à la **secrétaire** et à l'**admin** d'assigner des clients aux techniciens (massothérapeutes et esthéticiennes). Chaque assignation crée un nouvel enregistrement avec une date, permettant de suivre l'historique complet.

---

## ✨ Fonctionnalités Clés

### 1. Assignations Multiples
- ✅ Un client peut être assigné **plusieurs fois** au même technicien
- ✅ Chaque assignation a sa propre **date et heure** (`assignedAt`)
- ✅ Les assignations sont **triées par date décroissante** (les plus récentes en premier)

### 2. Badge "Nouveau" (Frontend)
- 🆕 Les clients récemment assignés affichent un badge **"Nouveau"**
- ✅ Le badge disparaît **dès qu'une note est ajoutée** au dossier du client
- 🎯 Cela rappelle au technicien de **remplir les notes** après chaque rendez-vous

### 3. Annulation d'Assignation
- ✅ Possibilité d'annuler une assignation erronée
- ✅ **Seule la plus récente assignation** est supprimée
- ✅ Les anciennes assignations sont **préservées**
- 🔒 Protège l'historique des assignations

---

## 🔌 APIs Disponibles

### 1️⃣ Récupérer Toutes les Assignations (Admin/Secrétaire)

**Route :** `GET /api/assignments`

**Autorisation :** `SECRETAIRE`, `ADMIN` uniquement

**Utilisation :** Récupérer toutes les assignations effectuées, triées par date (les plus récentes en haut).

**Headers :**
```json
{
  "Authorization": "Bearer <token_secretaire_ou_admin>"
}
```

**Réponse :**
```json
{
  "success": true,
  "total": 25,
  "data": [
    {
      "id": "assignment_latest",
      "clientId": "cm123abc",
      "professionalId": "user_456def",
      "assignedAt": "2025-12-26T14:30:00.000Z",
      "client": {
        "id": "cm123abc",
        "nom": "Dupont",
        "prenom": "Marie",
        "courriel": "marie@example.com",
        "telephone": "418-555-1234",
        "serviceType": "MASSOTHERAPIE"
      },
      "professional": {
        "id": "user_456def",
        "nom": "Tremblay",
        "prenom": "Jean",
        "email": "jean@sparenaissance.com",
        "role": "MASSOTHERAPEUTE"
      }
    },
    {
      "id": "assignment_previous",
      "clientId": "cm789xyz",
      "professionalId": "user_101abc",
      "assignedAt": "2025-12-26T10:15:00.000Z",
      "client": {
        "id": "cm789xyz",
        "nom": "Gagnon",
        "prenom": "Sophie",
        "courriel": "sophie@example.com",
        "telephone": "418-555-5678",
        "serviceType": "ESTHETIQUE"
      },
      "professional": {
        "id": "user_101abc",
        "nom": "Leblanc",
        "prenom": "Catherine",
        "email": "catherine@sparenaissance.com",
        "role": "ESTHETICIENNE"
      }
    }
  ]
}
```

**Affichage par Jour (Frontend) :**

Pour grouper les assignations par jour côté frontend :

```javascript
const groupByDay = (assignments) => {
  const grouped = {};

  assignments.forEach(assignment => {
    const date = new Date(assignment.assignedAt).toLocaleDateString('fr-CA');

    if (!grouped[date]) {
      grouped[date] = [];
    }

    grouped[date].push(assignment);
  });

  return grouped;
};

// Exemple d'utilisation
const allAssignments = await fetch('/api/assignments');
const grouped = groupByDay(allAssignments.data);

// Résultat:
// {
//   "2025-12-26": [assignment1, assignment2, assignment3],
//   "2025-12-25": [assignment4, assignment5],
//   "2025-12-24": [assignment6]
// }
```

---

### 2️⃣ Assigner un Client à un Technicien

**Route :** `POST /api/assignments`

**Autorisation :** `SECRETAIRE`, `ADMIN` uniquement

**Headers :**
```json
{
  "Authorization": "Bearer <token_secretaire_ou_admin>",
  "Content-Type": "application/json"
}
```

**Body :**
```json
{
  "clientId": "cm123abc",
  "professionalId": "user_456def"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Client assigné avec succès",
  "data": {
    "id": "assignment_789ghi",
    "clientId": "cm123abc",
    "professionalId": "user_456def",
    "assignedAt": "2025-12-26T14:30:00.000Z",
    "client": {
      "id": "cm123abc",
      "nom": "Dupont",
      "prenom": "Marie",
      "serviceType": "MASSOTHERAPIE"
    },
    "professional": {
      "id": "user_456def",
      "nom": "Tremblay",
      "prenom": "Jean",
      "email": "jean@sparenaissance.com",
      "role": "MASSOTHERAPEUTE"
    }
  }
}
```

**Validations automatiques :**
- ✅ Le client existe
- ✅ Le technicien existe
- ✅ Le technicien n'est pas une secrétaire
- ✅ Cohérence service/rôle :
  - Client MASSOTHERAPIE → MASSOTHERAPEUTE ou ADMIN
  - Client ESTHETIQUE → ESTHETICIENNE ou ADMIN

---

### 2️⃣ Annuler une Assignation (Erreur)

**Route :** `DELETE /api/assignments/:clientId/:professionalId`

**Autorisation :** `SECRETAIRE`, `ADMIN` uniquement

**Utilisation :** Annuler la **plus récente assignation** en cas d'erreur.

**Headers :**
```json
{
  "Authorization": "Bearer <token_secretaire_ou_admin>"
}
```

**Exemple :**
```bash
DELETE /api/assignments/cm123abc/user_456def
```

**Réponse :**
```json
{
  "success": true,
  "message": "Assignation supprimée avec succès"
}
```

**⚠️ IMPORTANT :**
- Supprime **UNIQUEMENT** la plus récente assignation de ce client à ce technicien
- Les assignations précédentes sont **préservées**
- Si aucune assignation n'existe, retourne une erreur 404

---

### 3️⃣ Voir les Assignations d'un Client

**Route :** `GET /api/assignments/client/:clientId`

**Autorisation :** `SECRETAIRE`, `ADMIN` uniquement

**Exemple :**
```bash
GET /api/assignments/client/cm123abc
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "assignment_new",
      "clientId": "cm123abc",
      "professionalId": "user_456def",
      "assignedAt": "2025-12-26T14:30:00.000Z",
      "professional": {
        "id": "user_456def",
        "nom": "Tremblay",
        "prenom": "Jean",
        "role": "MASSOTHERAPEUTE"
      }
    },
    {
      "id": "assignment_old",
      "clientId": "cm123abc",
      "professionalId": "user_789ghi",
      "assignedAt": "2025-11-15T10:00:00.000Z",
      "professional": {
        "id": "user_789ghi",
        "nom": "Leblanc",
        "prenom": "Sophie",
        "role": "MASSOTHERAPEUTE"
      }
    }
  ]
}
```

---

### 4️⃣ Voir les Clients Assignés à un Technicien

**Route :** `GET /api/assignments/professional/:professionalId`

**Autorisation :** Le technicien lui-même, `SECRETAIRE`, ou `ADMIN`

**Exemple :**
```bash
GET /api/assignments/professional/user_456def
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "assignment_123",
      "clientId": "cm123abc",
      "professionalId": "user_456def",
      "assignedAt": "2025-12-26T14:30:00.000Z",
      "client": {
        "id": "cm123abc",
        "nom": "Dupont",
        "prenom": "Marie",
        "courriel": "marie@example.com",
        "telephone": "418-555-1234",
        "serviceType": "MASSOTHERAPIE"
      }
    }
  ]
}
```

---

## 🎬 Scénarios d'utilisation

### Scénario 1 : Assignation Normale

**Contexte :** Marie arrive pour un massage. La secrétaire l'assigne au massothérapeute Jean.

**Action :**
```bash
POST /api/assignments
{
  "clientId": "marie_123",
  "professionalId": "jean_456"
}
```

**Résultat :**
- ✅ Assignation créée
- 🆕 Badge "Nouveau" affiché côté frontend pour Jean
- ⏳ Badge disparaît quand Jean ajoute une note au dossier de Marie

---

### Scénario 2 : Correction d'Erreur

**Contexte :** La secrétaire assigne Marie au massothérapeute Jean **par erreur**. Elle voulait l'assigner à Sophie.

**Actions :**

1. **Annuler l'assignation erronée :**
```bash
DELETE /api/assignments/marie_123/jean_456
```

2. **Créer la bonne assignation :**
```bash
POST /api/assignments
{
  "clientId": "marie_123",
  "professionalId": "sophie_789"
}
```

**Résultat :**
- ✅ L'assignation à Jean est supprimée
- ✅ Marie est maintenant assignée à Sophie
- 🆕 Badge "Nouveau" affiché pour Sophie
- 📜 Si Marie avait déjà été assignée à Jean dans le passé, ces anciennes assignations sont **préservées**

---

### Scénario 3 : Client Régulier

**Contexte :** Marie est une cliente régulière qui vient chaque mois voir Jean.

**Timeline :**

1. **Octobre 2025 :** Assignation 1 → Note ajoutée → Badge disparu
2. **Novembre 2025 :** Assignation 2 → Note ajoutée → Badge disparu
3. **Décembre 2025 :** Assignation 3 → 🆕 Badge "Nouveau" affiché

**Base de données :**
```
Assignment 1 : marie_123 → jean_456 (2025-10-15)
Assignment 2 : marie_123 → jean_456 (2025-11-20)
Assignment 3 : marie_123 → jean_456 (2025-12-26) ← Plus récente
```

**Si annulation :**
```bash
DELETE /api/assignments/marie_123/jean_456
```
→ Supprime **uniquement** l'assignation 3 (décembre)
→ Les assignations 1 et 2 (octobre et novembre) sont **préservées**

---

## 🔍 Logique du Badge "Nouveau"

### Côté Frontend

Le badge "Nouveau" est affiché pour les clients assignés **sans note récente**.

**Logique suggérée :**

```javascript
// Pour chaque client assigné
const showNewBadge = (assignment, clientNotes) => {
  // Vérifier si une note a été ajoutée APRÈS cette assignation
  const hasNoteAfterAssignment = clientNotes.some(note =>
    new Date(note.createdAt) > new Date(assignment.assignedAt)
  );

  return !hasNoteAfterAssignment;
};
```

**Exemple :**

```javascript
// Assignation : 2025-12-26 à 14h30
// Note ajoutée : 2025-12-26 à 15h00
// → Badge disparaît ✅

// Assignation : 2025-12-26 à 14h30
// Note ajoutée : 2025-12-25 à 10h00 (AVANT l'assignation)
// → Badge reste affiché 🆕
```

---

## 📊 Récapitulatif des Routes

| Méthode | Route | Rôle | Description |
|---------|-------|------|-------------|
| `GET` | `/api/assignments` | SECRETAIRE, ADMIN | Voir TOUTES les assignations (triées par date) |
| `POST` | `/api/assignments` | SECRETAIRE, ADMIN | Assigner un client à un technicien |
| `DELETE` | `/api/assignments/:clientId/:professionalId` | SECRETAIRE, ADMIN | Annuler la plus récente assignation |
| `GET` | `/api/assignments/client/:clientId` | SECRETAIRE, ADMIN | Voir les assignations d'un client |
| `GET` | `/api/assignments/professional/:professionalId` | Technicien, SECRETAIRE, ADMIN | Voir les clients assignés à un technicien |

---

## ✅ Points Importants

### Historique Préservé
- ✅ Chaque assignation est un **nouvel enregistrement**
- ✅ L'annulation ne supprime **QUE la plus récente**
- ✅ L'historique complet est **toujours disponible**

### Permissions
- 🔒 Seules la **secrétaire** et l'**admin** peuvent assigner/annuler
- 👀 Les techniciens peuvent **voir leurs propres assignations**
- 👀 La secrétaire et l'admin peuvent **tout voir**

### Validations
- ✅ Cohérence service/rôle automatique
- ✅ Impossible d'assigner à une secrétaire
- ✅ Vérifications d'existence (client, technicien)

---

## 🔧 Exemples de Code Frontend

### Assigner un Client

```javascript
const assignClient = async (clientId, professionalId) => {
  const response = await fetch('/api/assignments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      clientId,
      professionalId
    })
  });

  const result = await response.json();

  if (result.success) {
    alert('Client assigné avec succès!');
  }
};
```

### Annuler une Assignation Erronée

```javascript
const cancelAssignment = async (clientId, professionalId) => {
  const response = await fetch(
    `/api/assignments/${clientId}/${professionalId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const result = await response.json();

  if (result.success) {
    alert('Assignation annulée avec succès!');
  }
};
```

### Afficher les Clients avec Badge "Nouveau"

```javascript
const getAssignedClients = async (professionalId) => {
  // Récupérer les assignations
  const assignmentsRes = await fetch(
    `/api/assignments/professional/${professionalId}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  const assignments = await assignmentsRes.json();

  // Pour chaque client, vérifier s'il y a une note récente
  const clientsWithBadge = await Promise.all(
    assignments.data.map(async (assignment) => {
      // Récupérer les notes du client
      const notesRes = await fetch(
        `/api/notes/client/${assignment.clientId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const notes = await notesRes.json();

      // Vérifier si une note a été ajoutée après l'assignation
      const hasNoteAfterAssignment = notes.data.some(note =>
        new Date(note.createdAt) > new Date(assignment.assignedAt)
      );

      return {
        ...assignment,
        showNewBadge: !hasNoteAfterAssignment
      };
    })
  );

  return clientsWithBadge;
};
```

---

## 🎯 Résumé

Le système d'assignation est déjà **parfaitement conçu** pour votre cas d'usage :

✅ **Assignations multiples** : Un client peut être assigné plusieurs fois au même technicien
✅ **Annulation ciblée** : Supprime uniquement la plus récente assignation
✅ **Historique préservé** : Les anciennes assignations restent intactes
✅ **Badge "Nouveau"** : Rappelle au technicien de remplir les notes
✅ **Permissions strictes** : Seules la secrétaire et l'admin peuvent gérer les assignations

**Tout est prêt à l'emploi !** 🚀
