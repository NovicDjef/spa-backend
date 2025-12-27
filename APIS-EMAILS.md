# 📧 APIs d'Envoi d'Emails - Guide Complet

## 🎯 APIs Principales

### 1️⃣ **Envoyer un Reçu au Client (Massothérapeute)**

**Route :** `POST /api/receipts/send`

**Utilisation :** Après avoir prévisualisé le reçu, le massothérapeute peut l'envoyer au client.

**Headers :**
```json
{
  "Authorization": "Bearer <token_massotherapeute>",
  "Content-Type": "application/json"
}
```

**Body :**
```json
{
  "clientId": "cm123abc",
  "serviceName": "Massage thérapeutique",
  "duration": 60,
  "treatmentDate": "2025-12-26",
  "treatmentTime": "14:30"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Reçu créé et envoyé au client avec succès",
  "data": {
    "id": "receipt_123",
    "receiptNumber": 42,
    "clientName": "Jean Dupont",
    "serviceName": "Massage thérapeutique",
    "total": 114.98,
    "emailSent": true,
    "emailSentAt": "2025-12-26T14:30:00.000Z"
  }
}
```

**Ce qui se passe :**
- ✅ Crée le reçu en base de données
- ✅ Génère le PDF avec logo et taxes
- ✅ Envoie l'email au client avec le PDF en pièce jointe
- ✅ Incrémente automatiquement le numéro de reçu

---

### 2️⃣ **Email Marketing Individuel (Admin)**

**Route :** `POST /api/marketing/send-email/individual`

**Utilisation :** Envoyer un email marketing à UN client spécifique.

**Headers :**
```json
{
  "Authorization": "Bearer <token_admin>",
  "Content-Type": "application/json"
}
```

**Body :**
```json
{
  "clientId": "cm123abc",
  "subject": "🌸 Offre exclusive pour vous!",
  "message": "<p>Bonjour Marie,</p><p>Profitez de 20% de réduction...</p>"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Email envoyé avec succès à Marie Dupont",
  "data": {
    "recipient": {
      "nom": "Dupont",
      "prenom": "Marie",
      "email": "marie@example.com"
    }
  }
}
```

---

### 3️⃣ **Campagne Email Marketing en Masse (Admin)**

**Route :** `POST /api/marketing/send-email/campaign`

**Utilisation :** Envoyer un email marketing à PLUSIEURS clients en même temps.

**Headers :**
```json
{
  "Authorization": "Bearer <token_admin>",
  "Content-Type": "application/json"
}
```

**Body :**
```json
{
  "clientIds": ["cm123abc", "cm456def", "cm789ghi"],
  "subject": "🌸 Offre exclusive pour vous!",
  "message": "<p>Bonjour,</p><p>Profitez de 20% de réduction...</p>"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Campagne envoyée: 3 réussis, 0 échecs",
  "data": {
    "totalSent": 3,
    "totalFailed": 0,
    "totalClients": 3
  }
}
```

---

### 4️⃣ **Générer un Message avec ChatGPT (Admin)**

**Route :** `POST /api/marketing/generate-message`

**Utilisation :** Générer automatiquement un message marketing avec ChatGPT (max 150 mots).

**Headers :**
```json
{
  "Authorization": "Bearer <token_admin>",
  "Content-Type": "application/json"
}
```

**Body :**
```json
{
  "prompt": "Proposer une réduction de 20% sur les massages thérapeutiques",
  "clients": ["cm123abc", "cm456def"],
  "additionalContext": "Clients qui n'ont pas visité depuis 6 mois"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Message généré avec succès (aperçu avec placeholders remplacés)",
  "data": {
    "subject": "Soulagez vos tensions - 20% de réduction",
    "message": "<p>Bonjour Marie Dupont,</p><p>Profitez de...</p>",
    "messageTemplate": "<p>Bonjour {prenom} {nom},</p><p>Profitez de...</p>",
    "clientsCount": 2,
    "serviceType": "MASSOTHERAPIE"
  }
}
```

**Note :** Le message généré est limité à **150 mots maximum** pour ne pas décourager le lecteur.

---

### 5️⃣ **Campagne ChatGPT Personnalisée (Admin)**

**Route :** `POST /api/marketing/send-chatgpt-campaign`

**Utilisation :** Générer ET envoyer des emails personnalisés avec ChatGPT pour chaque client.

**Headers :**
```json
{
  "Authorization": "Bearer <token_admin>",
  "Content-Type": "application/json"
}
```

**Body :**
```json
{
  "clientIds": ["cm123abc", "cm456def"],
  "subject": "Soulagez vos tensions - 20% de réduction",
  "messageTemplate": "<p>Bonjour {prenom} {nom},</p><p>Profitez de 20%...</p>"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Campagne ChatGPT envoyée: 2 emails envoyés avec succès",
  "data": {
    "totalSent": 2,
    "totalFailed": 0,
    "totalClients": 2
  }
}
```

**Particularité :**
- Les placeholders `{prenom}` et `{nom}` sont remplacés automatiquement
- Chaque client reçoit un email personnalisé
- Messages limités à **150 mots**

---

## 🔄 Workflow Complet

### Pour les Massothérapeutes (Reçus)

1. **Prévisualiser** → `POST /api/receipts/preview`
2. **Envoyer au client** → `POST /api/receipts/send` ✅

### Pour les Admins (Marketing)

**Option A : Message manuel**
1. Rédiger le message
2. Envoyer → `POST /api/marketing/send-email/campaign`

**Option B : Message ChatGPT (recommandé)**
1. Générer le message → `POST /api/marketing/generate-message`
2. Prévisualiser et valider
3. Envoyer → `POST /api/marketing/send-chatgpt-campaign`

---

## 📊 Limites et Quotas

### SendGrid (Plan Gratuit)
- **100 emails par jour**
- Statistiques complètes
- Taux d'ouverture et clics

### ChatGPT
- Messages limités à **150 mots maximum**
- Placeholders `{prenom}` et `{nom}` pour personnalisation
- Génération automatique du sujet

---

## ✅ Points Importants

### Reçus
- ✅ Numérotation automatique par thérapeute
- ✅ Génération PDF avec logo et taxes
- ✅ Email avec PDF en pièce jointe
- ✅ Envoi automatique au client

### Marketing
- ✅ Messages courts (150 mots max)
- ✅ Personnalisation avec `{prenom}` et `{nom}`
- ✅ HTML avec styles inline
- ✅ Tracking dans la base de données
- ✅ Statistiques SendGrid

---

## 🔒 Sécurité

**Authentification requise :**
- Reçus : `MASSOTHERAPEUTE`, `ESTHETICIENNE`, ou `ADMIN`
- Marketing : `ADMIN` uniquement

**Headers requis :**
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 📚 Exemples Frontend

### Envoyer un Reçu (Massothérapeute)

```javascript
const sendReceipt = async (receiptData) => {
  const response = await fetch('/api/receipts/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(receiptData)
  });

  const result = await response.json();

  if (result.success) {
    alert('Reçu envoyé au client avec succès!');
  }
};
```

### Campagne Marketing (Admin)

```javascript
const sendCampaign = async (campaignData) => {
  const response = await fetch('/api/marketing/send-email/campaign', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      clientIds: selectedClients,
      subject: emailSubject,
      message: emailMessage
    })
  });

  const result = await response.json();
  console.log(`${result.data.totalSent} emails envoyés!`);
};
```

---

## 🎯 Résumé Rapide

| Route | Utilisation | Qui ? |
|-------|-------------|-------|
| `POST /api/receipts/send` | Envoyer reçu au client | Massothérapeute |
| `POST /api/marketing/send-email/individual` | Email à 1 client | Admin |
| `POST /api/marketing/send-email/campaign` | Email à plusieurs clients | Admin |
| `POST /api/marketing/generate-message` | Générer avec ChatGPT | Admin |
| `POST /api/marketing/send-chatgpt-campaign` | Générer + Envoyer | Admin |

---

✅ **Tout est configuré et prêt à l'emploi !**
