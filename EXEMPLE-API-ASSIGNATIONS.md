# 📋 Exemples d'Utilisation - API Assignations

## 🎯 API : Récupérer Toutes les Assignations

Cette API permet à l'**admin** et à la **secrétaire** de voir toutes les assignations effectuées, triées par date (les plus récentes en haut).

---

## 🔌 Détails de l'API

**Route :** `GET /api/assignments`

**Autorisation :** `SECRETAIRE`, `ADMIN` uniquement

**Headers requis :**
```json
{
  "Authorization": "Bearer <token_secretaire_ou_admin>"
}
```

---

## 📊 Exemple de Réponse

```json
{
  "success": true,
  "total": 3,
  "data": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9",
      "clientId": "cm123abc",
      "professionalId": "user_456def",
      "createdById": "user_sec123",
      "assignedAt": "2025-12-26T14:30:00.000Z",
      "client": {
        "id": "cm123abc",
        "nom": "Dupont",
        "prenom": "Marie",
        "courriel": "marie@example.com",
        "telCellulaire": "418-555-1234",
        "serviceType": "MASSOTHERAPIE"
      },
      "professional": {
        "id": "user_456def",
        "nom": "Tremblay",
        "prenom": "Jean",
        "email": "jean@sparenaissance.com",
        "role": "MASSOTHERAPEUTE"
      },
      "createdBy": {
        "id": "user_sec123",
        "nom": "Gagnon",
        "prenom": "Julie",
        "email": "julie@sparenaissance.com",
        "role": "SECRETAIRE"
      }
    },
    {
      "id": "clx9z8y7x6w5v4u3t2s1",
      "clientId": "cm789xyz",
      "professionalId": "user_101abc",
      "createdById": "user_admin456",
      "assignedAt": "2025-12-26T10:15:00.000Z",
      "client": {
        "id": "cm789xyz",
        "nom": "Gagnon",
        "prenom": "Sophie",
        "courriel": "sophie@example.com",
        "telCellulaire": "418-555-5678",
        "serviceType": "ESTHETIQUE"
      },
      "professional": {
        "id": "user_101abc",
        "nom": "Leblanc",
        "prenom": "Catherine",
        "email": "catherine@sparenaissance.com",
        "role": "ESTHETICIENNE"
      },
      "createdBy": {
        "id": "user_admin456",
        "nom": "Martin",
        "prenom": "Diane",
        "email": "diane@sparenaissance.com",
        "role": "ADMIN"
      }
    },
    {
      "id": "clxa1b2c3d4e5f6g7h8i",
      "clientId": "cm456def",
      "professionalId": "user_456def",
      "createdById": "user_sec123",
      "assignedAt": "2025-12-25T16:00:00.000Z",
      "client": {
        "id": "cm456def",
        "nom": "Bouchard",
        "prenom": "Pierre",
        "courriel": "pierre@example.com",
        "telCellulaire": "418-555-9012",
        "serviceType": "MASSOTHERAPIE"
      },
      "professional": {
        "id": "user_456def",
        "nom": "Tremblay",
        "prenom": "Jean",
        "email": "jean@sparenaissance.com",
        "role": "MASSOTHERAPEUTE"
      },
      "createdBy": {
        "id": "user_sec123",
        "nom": "Gagnon",
        "prenom": "Julie",
        "email": "julie@sparenaissance.com",
        "role": "SECRETAIRE"
      }
    }
  ]
}
```

---

## 🆕 Nouvelle Fonctionnalité : Traçabilité des Assignations

**Qui a créé cette assignation ?**

Chaque assignation inclut maintenant les informations de la personne (secrétaire ou admin) qui l'a créée :

```json
"createdBy": {
  "id": "user_sec123",
  "nom": "Gagnon",
  "prenom": "Julie",
  "email": "julie@sparenaissance.com",
  "role": "SECRETAIRE"
}
```

**Pourquoi c'est important ?**
- ✅ **Traçabilité** : Savoir qui a assigné chaque client
- ✅ **Responsabilité** : Identifier la personne responsable de l'assignation
- ✅ **Audit** : Suivre les actions de chaque secrétaire/admin
- ✅ **Multi-secrétaires** : Gérer plusieurs secrétaires facilement

**Note pour les anciennes assignations :**
Les assignations créées avant cette fonctionnalité auront `createdBy: null`. Seules les nouvelles assignations incluront automatiquement le créateur.

---

## 💻 Exemples de Code Frontend

### 1. Récupérer Toutes les Assignations (Simple)

```javascript
const getAllAssignments = async () => {
  const token = localStorage.getItem('token'); // Ou depuis votre state management

  const response = await fetch('http://localhost:5003/api/assignments', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();

  if (result.success) {
    console.log(`Total d'assignations: ${result.total}`);
    console.log('Assignations:', result.data);
    return result.data;
  } else {
    console.error('Erreur:', result.message);
  }
};

// Utilisation
getAllAssignments();
```

---

### 2. Afficher les Assignations Groupées par Jour

```javascript
const getAssignmentsByDay = async () => {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:5003/api/assignments', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();

  if (result.success) {
    // Grouper par jour
    const grouped = {};

    result.data.forEach(assignment => {
      // Formater la date en YYYY-MM-DD
      const date = new Date(assignment.assignedAt).toLocaleDateString('fr-CA');

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(assignment);
    });

    return grouped;
  }
};

// Utilisation
const assignmentsByDay = await getAssignmentsByDay();

// Résultat:
// {
//   "2025-12-26": [assignment1, assignment2],
//   "2025-12-25": [assignment3]
// }
```

---

### 3. Affichage avec React

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedByDay, setGroupedByDay] = useState({});

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:5003/api/assignments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setAssignments(response.data.data);

      // Grouper par jour
      const grouped = groupByDay(response.data.data);
      setGroupedByDay(grouped);

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des assignations:', error);
      setLoading(false);
    }
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div>Chargement des assignations...</div>;
  }

  return (
    <div className="assignments-page">
      <h1>Toutes les Assignations ({assignments.length})</h1>

      {Object.keys(groupedByDay).length === 0 ? (
        <p>Aucune assignation pour le moment.</p>
      ) : (
        Object.keys(groupedByDay)
          .sort((a, b) => new Date(b) - new Date(a)) // Tri décroissant
          .map(date => (
            <div key={date} className="day-group">
              <h2>{formatDate(date)}</h2>

              <div className="assignments-list">
                {groupedByDay[date].map(assignment => (
                  <div key={assignment.id} className="assignment-card">
                    <div className="assignment-time">
                      {formatTime(assignment.assignedAt)}
                    </div>

                    <div className="assignment-details">
                      <div className="client-info">
                        <strong>{assignment.client.prenom} {assignment.client.nom}</strong>
                        <span className="service-type">{assignment.client.serviceType}</span>
                      </div>

                      <div className="professional-info">
                        Assigné à : {assignment.professional.prenom} {assignment.professional.nom}
                        <span className="role">({assignment.professional.role})</span>
                      </div>

                      <div className="contact-info">
                        📧 {assignment.client.courriel}
                        <br />
                        📱 {assignment.client.telCellulaire}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
};

export default AssignmentsPage;
```

---

### 4. Affichage avec Vue.js

```vue
<template>
  <div class="assignments-page">
    <h1>Toutes les Assignations ({{ assignments.length }})</h1>

    <div v-if="loading">Chargement des assignations...</div>

    <div v-else>
      <div
        v-for="(dayAssignments, date) in sortedGroupedByDay"
        :key="date"
        class="day-group"
      >
        <h2>{{ formatDate(date) }}</h2>

        <div class="assignments-list">
          <div
            v-for="assignment in dayAssignments"
            :key="assignment.id"
            class="assignment-card"
          >
            <div class="assignment-time">
              {{ formatTime(assignment.assignedAt) }}
            </div>

            <div class="assignment-details">
              <div class="client-info">
                <strong>{{ assignment.client.prenom }} {{ assignment.client.nom }}</strong>
                <span class="service-type">{{ assignment.client.serviceType }}</span>
              </div>

              <div class="professional-info">
                Assigné à : {{ assignment.professional.prenom }} {{ assignment.professional.nom }}
                <span class="role">({{ assignment.professional.role }})</span>
              </div>

              <div class="contact-info">
                📧 {{ assignment.client.courriel }}<br />
                📱 {{ assignment.client.telCellulaire }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AssignmentsPage',

  data() {
    return {
      assignments: [],
      loading: true,
      groupedByDay: {}
    };
  },

  computed: {
    sortedGroupedByDay() {
      const sorted = {};
      const dates = Object.keys(this.groupedByDay).sort((a, b) => new Date(b) - new Date(a));

      dates.forEach(date => {
        sorted[date] = this.groupedByDay[date];
      });

      return sorted;
    }
  },

  mounted() {
    this.fetchAssignments();
  },

  methods: {
    async fetchAssignments() {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get('http://localhost:5003/api/assignments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        this.assignments = response.data.data;
        this.groupByDay();
        this.loading = false;
      } catch (error) {
        console.error('Erreur lors du chargement des assignations:', error);
        this.loading = false;
      }
    },

    groupByDay() {
      const grouped = {};

      this.assignments.forEach(assignment => {
        const date = new Date(assignment.assignedAt).toLocaleDateString('fr-CA');

        if (!grouped[date]) {
          grouped[date] = [];
        }

        grouped[date].push(assignment);
      });

      this.groupedByDay = grouped;
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    formatTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.assignments-page {
  padding: 20px;
}

.day-group {
  margin-bottom: 40px;
}

.day-group h2 {
  color: #2c5f2d;
  border-bottom: 2px solid #2c5f2d;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.assignments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.assignment-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  gap: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.assignment-time {
  font-weight: bold;
  color: #2c5f2d;
  min-width: 80px;
}

.assignment-details {
  flex: 1;
}

.client-info {
  margin-bottom: 10px;
}

.service-type {
  background: #2c5f2d;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 10px;
}

.professional-info {
  color: #666;
  margin-bottom: 8px;
}

.role {
  font-size: 12px;
  color: #999;
}

.contact-info {
  font-size: 14px;
  color: #888;
}
</style>
```

---

---

### 5. Afficher Qui a Créé Chaque Assignation

```jsx
const AssignmentCard = ({ assignment }) => {
  return (
    <div className="assignment-card">
      <div className="assignment-header">
        <span className="assignment-time">
          {new Date(assignment.assignedAt).toLocaleTimeString('fr-FR')}
        </span>

        {/* Badge indiquant qui a créé l'assignation */}
        {assignment.createdBy && (
          <span className="created-by-badge">
            Assigné par : {assignment.createdBy.prenom} {assignment.createdBy.nom}
            ({assignment.createdBy.role})
          </span>
        )}
      </div>

      <div className="client-info">
        <strong>{assignment.client.prenom} {assignment.client.nom}</strong>
        <span className="service-type">{assignment.client.serviceType}</span>
      </div>

      <div className="professional-info">
        Assigné à : {assignment.professional.prenom} {assignment.professional.nom}
      </div>
    </div>
  );
};
```

**Style CSS suggéré :**

```css
.created-by-badge {
  background: #f0f0f0;
  color: #555;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: normal;
}

.created-by-badge.SECRETAIRE {
  background: #e3f2fd;
  color: #1976d2;
}

.created-by-badge.ADMIN {
  background: #fff3e0;
  color: #f57c00;
}
```

---

## 📊 Cas d'Utilisation

### Scénario 1 : Dashboard de la Secrétaire

La secrétaire veut voir toutes les assignations de la journée pour vérifier si tous les clients ont été assignés correctement.

```javascript
const getTodayAssignments = async () => {
  const allAssignments = await getAllAssignments();

  const today = new Date().toLocaleDateString('fr-CA');

  const todayAssignments = allAssignments.filter(assignment => {
    const assignmentDate = new Date(assignment.assignedAt).toLocaleDateString('fr-CA');
    return assignmentDate === today;
  });

  console.log(`Assignations aujourd'hui: ${todayAssignments.length}`);
  return todayAssignments;
};
```

---

### Scénario 2 : Statistiques d'Assignations

L'admin veut voir combien de clients ont été assignés à chaque technicien.

```javascript
const getAssignmentStatsByProfessional = async () => {
  const allAssignments = await getAllAssignments();

  const stats = {};

  allAssignments.forEach(assignment => {
    const professionalName = `${assignment.professional.prenom} ${assignment.professional.nom}`;

    if (!stats[professionalName]) {
      stats[professionalName] = {
        count: 0,
        role: assignment.professional.role
      };
    }

    stats[professionalName].count++;
  });

  return stats;
};

// Résultat:
// {
//   "Jean Tremblay": { count: 15, role: "MASSOTHERAPEUTE" },
//   "Catherine Leblanc": { count: 8, role: "ESTHETICIENNE" }
// }
```

---

### Scénario 3 : Filtrer par Type de Service

Voir toutes les assignations pour un type de service spécifique (MASSOTHERAPIE ou ESTHETIQUE).

```javascript
const getAssignmentsByServiceType = async (serviceType) => {
  const allAssignments = await getAllAssignments();

  return allAssignments.filter(
    assignment => assignment.client.serviceType === serviceType
  );
};

// Utilisation
const massotherapieAssignments = await getAssignmentsByServiceType('MASSOTHERAPIE');
const esthetiqueAssignments = await getAssignmentsByServiceType('ESTHETIQUE');
```

---

### Scénario 4 : Voir les Assignations par Secrétaire/Admin

L'admin veut voir combien d'assignations chaque secrétaire a créées.

```javascript
const getAssignmentsByCreator = async () => {
  const allAssignments = await getAllAssignments();

  const statsByCreator = {};

  allAssignments.forEach(assignment => {
    // Gérer les anciennes assignations sans créateur
    if (!assignment.createdBy) {
      if (!statsByCreator['Non spécifié']) {
        statsByCreator['Non spécifié'] = {
          count: 0,
          role: 'N/A',
          assignments: []
        };
      }
      statsByCreator['Non spécifié'].count++;
      statsByCreator['Non spécifié'].assignments.push(assignment);
      return;
    }

    const creatorName = `${assignment.createdBy.prenom} ${assignment.createdBy.nom}`;

    if (!statsByCreator[creatorName]) {
      statsByCreator[creatorName] = {
        count: 0,
        role: assignment.createdBy.role,
        email: assignment.createdBy.email,
        assignments: []
      };
    }

    statsByCreator[creatorName].count++;
    statsByCreator[creatorName].assignments.push(assignment);
  });

  return statsByCreator;
};

// Résultat:
// {
//   "Julie Gagnon": {
//     count: 15,
//     role: "SECRETAIRE",
//     email: "julie@sparenaissance.com",
//     assignments: [...]
//   },
//   "Diane Martin": {
//     count: 10,
//     role: "ADMIN",
//     email: "diane@sparenaissance.com",
//     assignments: [...]
//   },
//   "Non spécifié": {
//     count: 5,
//     role: "N/A",
//     assignments: [...] // Anciennes assignations
//   }
// }
```

---

### Scénario 5 : Filtrer les Assignations d'une Secrétaire Spécifique

```javascript
const getAssignmentsBySecretaire = async (secretaireId) => {
  const allAssignments = await getAllAssignments();

  return allAssignments.filter(
    assignment => assignment.createdById === secretaireId
  );
};

// Utilisation
const julieAssignments = await getAssignmentsBySecretaire('user_sec123');
console.log(`Julie a créé ${julieAssignments.length} assignations`);
```

---

## ✅ Points Importants

1. **Tri automatique** : Les assignations sont déjà triées par date décroissante (les plus récentes en haut)
2. **Groupement par jour** : Se fait côté frontend pour plus de flexibilité
3. **Informations complètes** : Chaque assignation inclut les détails du client, du professionnel ET du créateur
4. **Traçabilité** : Le champ `createdBy` indique qui (secrétaire ou admin) a créé l'assignation
5. **Total inclus** : Le champ `total` indique le nombre total d'assignations
6. **Permissions** : Uniquement accessible aux rôles `SECRETAIRE` et `ADMIN`
7. **Anciennes assignations** : Les assignations créées avant cette fonctionnalité auront `createdBy: null`

---

## 🔒 Gestion des Erreurs

```javascript
const getAllAssignmentsWithErrorHandling = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Vous devez être connecté');
    }

    const response = await fetch('http://localhost:5003/api/assignments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      } else if (response.status === 403) {
        throw new Error('Accès refusé. Réservé aux secrétaires et admins.');
      } else {
        throw new Error('Erreur lors du chargement des assignations');
      }
    }

    const result = await response.json();
    return result.data;

  } catch (error) {
    console.error('Erreur:', error.message);
    alert(error.message);
    return [];
  }
};
```

---

## 🎯 Résumé

✅ **API prête à l'emploi** : `GET /api/assignments`
✅ **Tri automatique** : Les plus récentes en haut
✅ **Données complètes** : Client + Professionnel
✅ **Sécurisé** : SECRETAIRE et ADMIN uniquement
✅ **Facile à intégrer** : Exemples React et Vue.js fournis

**L'API est maintenant disponible et fonctionnelle !** 🚀
