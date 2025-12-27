# 🌐 API Publique - Guide d'Utilisation

Ce guide explique comment utiliser l'API publique pour créer le site web client du spa.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Services disponibles](#services-disponibles)
3. [Forfaits/Packages](#forfaitspackages)
4. [Abonnements Gym](#abonnements-gym)
5. [Disponibilités et réservation](#disponibilités-et-réservation)
6. [Processus de réservation complet](#processus-de-réservation-complet)

---

## Vue d'ensemble

L'API publique permet aux clients de:
- ✅ Consulter les services et forfaits disponibles
- ✅ Voir les professionnels (massothérapeutes/esthéticiennes)
- ✅ Vérifier les disponibilités en temps réel
- ✅ Créer une réservation avec paiement Stripe
- ✅ Acheter des cartes cadeaux
- ✅ S'abonner au gym

**Base URL**: `http://localhost:5003/api/public`

---

## Services disponibles

### 📍 GET /api/public/services

Récupère toutes les catégories avec leurs services actifs.

**Réponse**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_123",
      "name": "MASSOTHERAPIE",
      "description": "Services de massothérapie professionnelle",
      "services": [
        {
          "id": "service_123",
          "name": "Massage Découverte 50 min",
          "slug": "massage-decouverte-50",
          "description": "Un massage relaxant pour découvrir nos techniques",
          "duration": 50,
          "price": 103.00,
          "imageUrl": "https://..."
        }
      ]
    },
    {
      "id": "cat_456",
      "name": "ESTHETIQUE",
      "description": "Soins esthétiques et du visage",
      "services": [...]
    }
  ]
}
```

**Filtres disponibles**:
```
GET /api/public/services?categoryName=MASSOTHERAPIE
```

---

### 📍 GET /api/public/services/:slug

Récupère les détails d'un service spécifique.

**Exemple**:
```bash
GET /api/public/services/massage-decouverte-50
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "service_123",
    "name": "Massage Découverte 50 min",
    "slug": "massage-decouverte-50",
    "description": "Un massage relaxant pour découvrir nos techniques de massothérapie",
    "duration": 50,
    "price": 103.00,
    "imageUrl": "https://...",
    "requiresProfessional": true,
    "category": {
      "id": "cat_123",
      "name": "MASSOTHERAPIE",
      "description": "Services de massothérapie professionnelle"
    }
  }
}
```

---

## Forfaits/Packages

### 📍 GET /api/public/packages

Récupère tous les forfaits disponibles.

**Réponse**:
```json
{
  "success": true,
  "data": [
    {
      "id": "pkg_123",
      "name": "Le Forfait Basque",
      "slug": "forfait-basque-petite",
      "description": "Massage sous la pluie, pédicure spa, pressothérapie...",
      "variant": "Petite",
      "price": 148.00,
      "imageUrl": "https://...",
      "services": [
        {
          "serviceName": "Massage sous la pluie",
          "quantity": 1,
          "isOptional": false
        }
      ]
    }
  ]
}
```

---

### 📍 GET /api/public/packages/:slug

Récupère les détails d'un forfait spécifique.

**Exemple**:
```bash
GET /api/public/packages/forfait-basque-petite
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "pkg_123",
    "name": "Le Forfait Basque",
    "slug": "forfait-basque-petite",
    "description": "Massage sous la pluie, pédicure spa, pressothérapie, neuro spa, accès thermal, endermolift",
    "variant": "Petite",
    "price": 148.00,
    "imageUrl": "https://...",
    "services": [
      {
        "serviceId": "service_123",
        "serviceName": "Massage sous la pluie",
        "serviceDuration": 50,
        "serviceDescription": "Expérience unique...",
        "quantity": 1,
        "isOptional": false,
        "extraCost": null
      }
    ]
  }
}
```

---

## Abonnements Gym

### 📍 GET /api/public/gym-memberships

Récupère tous les types d'abonnements gym.

**Réponse**:
```json
{
  "success": true,
  "data": [
    {
      "id": "gym_123",
      "type": "1_DAY",
      "name": "Accès Gym 1 Jour",
      "price": 15.00,
      "duration": 1,
      "description": "Accès au gym pour 1 journée"
    },
    {
      "id": "gym_456",
      "type": "1_MONTH",
      "name": "Abonnement Gym 1 Mois",
      "price": 50.00,
      "duration": 30,
      "description": "Accès illimité au gym pendant 1 mois"
    }
  ]
}
```

---

## Disponibilités et réservation

### 📍 GET /api/public/professionals

Récupère la liste des professionnels disponibles.

**Filtres**:
```
GET /api/public/professionals?serviceType=MASSOTHERAPIE
GET /api/public/professionals?serviceType=ESTHETIQUE
```

**Réponse**:
```json
{
  "success": true,
  "data": [
    {
      "id": "prof_123",
      "name": "Marie Dubois",
      "photoUrl": "https://...",
      "speciality": "Massothérapie"
    },
    {
      "id": "prof_456",
      "name": "Sophie Martin",
      "photoUrl": "https://...",
      "speciality": "Esthétique"
    }
  ]
}
```

---

### 📍 GET /api/public/available-slots

Récupère les créneaux horaires disponibles pour un professionnel.

**Paramètres requis**:
- `professionalId` - ID du professionnel
- `date` - Date au format YYYY-MM-DD
- `duration` - Durée du service en minutes

**Exemple**:
```bash
GET /api/public/available-slots?professionalId=prof_123&date=2025-01-20&duration=50
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "date": "2025-01-20T00:00:00.000Z",
    "isBlocked": false,
    "slots": [
      "09:00",
      "09:15",
      "09:30",
      "10:00",
      "10:15",
      "11:00",
      "14:00",
      "15:30"
    ]
  }
}
```

**Si le professionnel est bloqué**:
```json
{
  "success": true,
  "data": {
    "date": "2025-01-20T00:00:00.000Z",
    "isBlocked": true,
    "reason": "Vacances",
    "slots": []
  }
}
```

---

## Processus de réservation complet

### Flux de réservation typique:

```
1. Client choisit un service
   ↓
2. GET /api/public/services/:slug
   → Récupère les détails du service
   ↓
3. GET /api/public/professionals?serviceType=MASSOTHERAPIE
   → Client choisit un professionnel
   ↓
4. GET /api/public/available-slots
   → Client choisit une date et voir les créneaux disponibles
   ↓
5. POST /api/payments/create-intent/booking
   → Créer le Payment Intent Stripe
   ↓
6. Frontend affiche le formulaire de paiement Stripe
   → Client entre ses infos de carte
   ↓
7. Stripe confirme le paiement (webhook automatique)
   → Réservation confirmée automatiquement
```

---

### Exemple Complet en JavaScript

```javascript
// 1. Récupérer les services
const servicesResponse = await fetch('http://localhost:5003/api/public/services');
const { data: categories } = await servicesResponse.json();

// 2. Client choisit "Massage Découverte 50 min"
const service = categories[0].services[0];

// 3. Récupérer les professionnels
const profsResponse = await fetch(
  'http://localhost:5003/api/public/professionals?serviceType=MASSOTHERAPIE'
);
const { data: professionals } = await profsResponse.json();

// 4. Client choisit une date et un professionnel
const selectedDate = '2025-01-20';
const selectedProfessional = professionals[0];

// 5. Vérifier les disponibilités
const slotsResponse = await fetch(
  `http://localhost:5003/api/public/available-slots?professionalId=${selectedProfessional.id}&date=${selectedDate}&duration=${service.duration}`
);
const { data: availability } = await slotsResponse.json();

// 6. Client choisit un créneau
const selectedSlot = availability.slots[0]; // "09:00"

// 7. Calculer l'heure de fin
const endTime = calculateEndTime(selectedSlot, service.duration); // "10:30"

// 8. Créer le Payment Intent
const paymentResponse = await fetch(
  'http://localhost:5003/api/payments/create-intent/booking',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceId: service.id,
      professionalId: selectedProfessional.id,
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      clientPhone: '5141234567',
      bookingDate: selectedDate,
      startTime: selectedSlot,
      endTime: endTime,
      specialNotes: 'Première visite'
    })
  }
);

const { data: payment } = await paymentResponse.json();

// 9. Afficher le formulaire Stripe
const stripe = Stripe('pk_test_votre_cle_publique');
const { error } = await stripe.confirmCardPayment(payment.clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  }
});

if (error) {
  // Afficher l'erreur
  console.error(error.message);
} else {
  // Paiement réussi! Le webhook Stripe confirmera automatiquement la réservation
  console.log('✅ Réservation confirmée!');
  console.log('Numéro de réservation:', payment.booking.bookingNumber);
}
```

---

### Helper: Calculer l'heure de fin

```javascript
function calculateEndTime(startTime, durationMinutes) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;

  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;

  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

// Exemple:
calculateEndTime('09:00', 50); // "09:50"
calculateEndTime('09:00', 80); // "10:20"
```

---

## 🎯 Calcul des Taxes

Les taxes sont calculées automatiquement côté serveur:

```javascript
// Pour un massage à 108$
{
  "subtotal": 108.00,
  "taxTPS": 5.40,    // 5%
  "taxTVQ": 10.77,   // 9.975%
  "total": 124.17    // 108 + 5.40 + 10.77
}

// Pour une carte cadeau (PAS de taxes)
{
  "amount": 100.00,
  "total": 100.00    // Pas de taxes!
}
```

---

## 🔒 Sécurité

### Points importants:

1. **Toutes les routes sont publiques** - Pas d'authentification requise
2. **Validation côté serveur** - Tous les montants sont recalculés
3. **Stripe gère les paiements** - Aucune info de carte n'est stockée
4. **Webhooks sécurisés** - Signature Stripe vérifiée

---

## 📱 Exemple de Page Produit

```jsx
// React Component Example
function ServicePage({ slug }) {
  const [service, setService] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);

  // 1. Charger le service
  useEffect(() => {
    fetch(`/api/public/services/${slug}`)
      .then(res => res.json())
      .then(data => setService(data.data));
  }, [slug]);

  // 2. Charger les professionnels
  useEffect(() => {
    if (service) {
      fetch(`/api/public/professionals?serviceType=${service.category.name}`)
        .then(res => res.json())
        .then(data => setProfessionals(data.data));
    }
  }, [service]);

  // 3. Charger les disponibilités quand une date est sélectionnée
  const handleDateChange = (date, professionalId) => {
    setSelectedDate(date);
    fetch(`/api/public/available-slots?professionalId=${professionalId}&date=${date}&duration=${service.duration}`)
      .then(res => res.json())
      .then(data => setAvailableSlots(data.data.slots));
  };

  return (
    <div>
      <h1>{service?.name}</h1>
      <p>{service?.description}</p>
      <p>Durée: {service?.duration} min</p>
      <p>Prix: {service?.price}$ (+ taxes)</p>

      <select onChange={(e) => handleDateChange(selectedDate, e.target.value)}>
        {professionals.map(prof => (
          <option key={prof.id} value={prof.id}>{prof.name}</option>
        ))}
      </select>

      <input
        type="date"
        onChange={(e) => handleDateChange(e.target.value, selectedProfessional)}
      />

      <div>
        {availableSlots.map(slot => (
          <button key={slot} onClick={() => bookSlot(slot)}>
            {slot}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 🚀 Prochaines Étapes

Une fois l'API publique configurée, vous pouvez:

1. ✅ Créer le frontend avec React/Next.js
2. ✅ Intégrer Stripe Elements pour les paiements
3. ✅ Ajouter Google Calendar pour sync les rendez-vous
4. ✅ Configurer les notifications par email/SMS

---

Tout est prêt pour créer votre site web! 🎉
