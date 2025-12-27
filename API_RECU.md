# API pour Envoyer le Reçu au Client

## Workflow Simplifié (2 étapes)

### ✅ Étape 1 : Prévisualiser le reçu
```http
POST /api/receipts/preview
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": "clxxx123",
  "noteId": "note_xxx123",
  "serviceId": "service_xxx123",
  "serviceName": "Massage thérapeutique",
  "duration": 60,
  "treatmentDate": "2025-12-25",
  "treatmentTime": "14:30"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Aperçu du reçu généré avec succès",
  "data": {
    "pdf": "base64_encoded_pdf...",
    "receiptNumber": 42,
    "subtotal": 100.00,
    "taxTPS": 5.00,
    "taxTVQ": 9.98,
    "total": 114.98
  }
}
```

### ✅ Étape 2 : Envoyer le reçu au client

**⭐ NOUVELLE API - C'est celle que vous cherchiez !**

```http
POST /api/receipts/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": "clxxx123",
  "noteId": "note_xxx123",
  "serviceId": "service_xxx123",
  "serviceName": "Massage thérapeutique",
  "duration": 60,
  "treatmentDate": "2025-12-25",
  "treatmentTime": "14:30"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Reçu créé et envoyé au client avec succès",
  "data": {
    "id": "receipt_abc123",
    "receiptNumber": 42,
    "clientName": "Jean Dupont",
    "serviceName": "Massage thérapeutique",
    "total": 114.98,
    "emailSent": true,
    "emailSentAt": "2025-12-25T14:30:00.000Z"
  }
}
```

---

## Exemple Frontend (React/TypeScript)

```typescript
// 1. Prévisualiser le reçu
const handlePreview = async () => {
  const response = await fetch('/api/receipts/preview', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(receiptData)
  });

  const result = await response.json();

  // Afficher le PDF en base64
  setPdfPreview(result.data.pdf);
};

// 2. Envoyer le reçu au client après validation
const handleSendToClient = async () => {
  const response = await fetch('/api/receipts/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(receiptData) // Même données que preview
  });

  const result = await response.json();

  if (result.success) {
    alert('Reçu envoyé au client avec succès !');
  }
};
```

---

## Notes Importantes

- ✅ **Même body** pour `/preview` et `/send`
- ✅ Le reçu est créé en BD et envoyé par email au client
- ✅ Le client reçoit le PDF en pièce jointe
- ✅ L'email du client est masqué pour le thérapeute (***@***.***)
- ✅ Numérotation automatique par thérapeute
- ✅ Calcul automatique des taxes (TPS 5% + TVQ 9.975%)

---

## Autres Routes Disponibles

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/receipts/preview` | POST | Prévisualise le reçu (ne sauvegarde pas) |
| **`/api/receipts/send`** | **POST** | **Crée et envoie le reçu au client** ⭐ |
| `/api/receipts/:id/resend` | POST | Renvoie un reçu déjà envoyé |
| `/api/receipts` | GET | Liste tous les reçus |
| `/api/receipts/:id` | GET | Récupère un reçu par ID |
