# 💳 Configuration Stripe - Guide Complet

Ce guide vous explique comment configurer Stripe pour accepter les paiements en ligne pour votre spa.

## 📋 Table des Matières

1. [Créer un compte Stripe](#1-créer-un-compte-stripe)
2. [Obtenir les clés API](#2-obtenir-les-clés-api)
3. [Configurer les variables d'environnement](#3-configurer-les-variables-denvironnement)
4. [Configurer les webhooks](#4-configurer-les-webhooks)
5. [Tester en mode test](#5-tester-en-mode-test)
6. [Passer en production](#6-passer-en-production)

---

## 1. Créer un compte Stripe

1. Allez sur [https://stripe.com](https://stripe.com)
2. Cliquez sur **"Sign up"**
3. Remplissez les informations de votre entreprise
4. Vérifiez votre email

---

## 2. Obtenir les clés API

### 🔑 Clés de Test (pour le développement)

1. Connectez-vous à [Stripe Dashboard](https://dashboard.stripe.com)
2. Assurez-vous que le mode **"Test"** est activé (toggle en haut à droite)
3. Allez dans **Developers → API keys**
4. Vous verrez deux clés:
   - **Publishable key** (commence par `pk_test_...`)
   - **Secret key** (commence par `sk_test_...`) - cliquez sur "Reveal test key"

### 📝 Copiez ces clés dans votre fichier `.env`:

```env
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_ICI
STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_ICI
```

⚠️ **IMPORTANT**: Ne partagez JAMAIS votre clé secrète (secret key)!

---

## 3. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet (si ce n'est pas déjà fait):

```bash
cp .env.example .env
```

Remplissez les variables Stripe:

```env
# Stripe Payment Configuration
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## 4. Configurer les Webhooks

Les webhooks permettent à Stripe de notifier votre serveur quand un paiement est effectué.

### 🔧 Configuration locale (avec Stripe CLI)

Pour tester localement:

1. **Installer Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows (avec Scoop)
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe
   ```

2. **Login à Stripe**:
   ```bash
   stripe login
   ```

3. **Écouter les webhooks localement**:
   ```bash
   stripe listen --forward-to localhost:5003/api/payments/webhook
   ```

   Cette commande affichera votre `webhook secret` - copiez-le dans `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

4. **Tester un paiement**:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

### 🌐 Configuration en production

1. Allez dans **Developers → Webhooks** dans le Stripe Dashboard
2. Cliquez sur **"Add endpoint"**
3. **URL du webhook**: `https://votre-domaine.com/api/payments/webhook`
4. **Événements à écouter**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `charge.dispute.created`
5. Cliquez sur **"Add endpoint"**
6. Copiez le **Signing secret** (`whsec_...`) et mettez-le dans `.env`

---

## 5. Tester en Mode Test

### 🧪 Cartes de test Stripe

Stripe fournit des numéros de carte pour tester:

| Numéro de carte         | Résultat                  |
|-------------------------|---------------------------|
| `4242 4242 4242 4242`   | ✅ Paiement réussi        |
| `4000 0000 0000 0002`   | ❌ Carte déclinée         |
| `4000 0025 0000 3155`   | 🔐 Nécessite 3D Secure   |

**Autres informations de test**:
- **Date d'expiration**: N'importe quelle date future (ex: 12/34)
- **CVC**: N'importe quel 3 chiffres (ex: 123)
- **Code postal**: N'importe quel code postal valide

### 📝 Tester une réservation

```bash
# Exemple avec curl
curl -X POST http://localhost:5003/api/payments/create-intent/booking \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "ID_DU_SERVICE",
    "professionalId": "ID_DU_PROFESSIONNEL",
    "clientName": "John Doe",
    "clientEmail": "john@example.com",
    "clientPhone": "5141234567",
    "bookingDate": "2025-01-15",
    "startTime": "10:00",
    "endTime": "11:30"
  }'
```

Réponse:
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxxxxxxxxxxxx",
    "booking": {
      "id": "...",
      "bookingNumber": "BK1234567890",
      "subtotal": 108.00,
      "taxTPS": 5.40,
      "taxTVQ": 10.77,
      "total": 124.17
    }
  }
}
```

---

## 6. Passer en Production

### ⚠️ Avant de passer en production

1. **Vérifier votre compte Stripe**:
   - Allez dans **Settings → Business settings**
   - Complétez toutes les informations requises
   - Activez votre compte (peut prendre 1-2 jours)

2. **Obtenir les clés de production**:
   - Dans le Stripe Dashboard, passez en mode **Live** (toggle en haut)
   - Allez dans **Developers → API keys**
   - Copiez vos clés de **production** (`pk_live_...` et `sk_live_...`)

3. **Mettre à jour `.env` en production**:
   ```env
   STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_PRODUCTION
   STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_CLE_PRODUCTION
   ```

4. **Configurer le webhook de production**:
   - Créez un nouveau endpoint avec l'URL de production
   - Mettez à jour `STRIPE_WEBHOOK_SECRET` avec le nouveau secret

5. **Activer HTTPS**:
   - Stripe requiert HTTPS en production
   - Configurez un certificat SSL (Let's Encrypt gratuit)

---

## 📊 APIs de Paiement Disponibles

### 1. Créer un Payment Intent pour une Réservation
```
POST /api/payments/create-intent/booking
```

**Body**:
```json
{
  "serviceId": "service_id",
  "packageId": null,
  "professionalId": "prof_id",
  "clientName": "John Doe",
  "clientEmail": "john@example.com",
  "clientPhone": "5141234567",
  "bookingDate": "2025-01-15",
  "startTime": "10:00",
  "endTime": "11:30",
  "specialNotes": "Première visite"
}
```

### 2. Créer un Payment Intent pour une Carte Cadeau
```
POST /api/payments/create-intent/gift-card
```

**Body**:
```json
{
  "amount": 100,
  "recipientName": "Jane Doe",
  "recipientEmail": "jane@example.com",
  "senderName": "John Doe",
  "senderEmail": "john@example.com",
  "message": "Joyeux anniversaire!"
}
```

### 3. Créer un Payment Intent pour un Abonnement Gym
```
POST /api/payments/create-intent/gym-subscription
```

**Body**:
```json
{
  "membershipId": "membership_id",
  "clientName": "John Doe",
  "clientEmail": "john@example.com",
  "clientPhone": "5141234567"
}
```

### 4. Confirmer un Paiement
```
POST /api/payments/confirm
```

**Body**:
```json
{
  "paymentIntentId": "pi_xxxxxxxxxxxxx"
}
```

### 5. Rembourser un Paiement (Admin)
```
POST /api/payments/refund
Headers: Authorization: Bearer {admin_token}
```

**Body**:
```json
{
  "paymentId": "payment_id",
  "reason": "Annulation par le client"
}
```

---

## 🧪 Tests Recommandés

1. **Test de paiement réussi**:
   - Carte: `4242 4242 4242 4242`
   - Vérifier que la réservation passe à `CONFIRMED`
   - Vérifier que le webhook est reçu

2. **Test de paiement échoué**:
   - Carte: `4000 0000 0000 0002`
   - Vérifier que la réservation reste `PENDING` ou passe à `CANCELLED`

3. **Test de remboursement**:
   - Créer une réservation avec paiement réussi
   - Appeler `/api/payments/refund`
   - Vérifier que le remboursement apparaît dans Stripe Dashboard

4. **Test de carte cadeau**:
   - Créer une carte cadeau
   - Vérifier que le code est généré
   - Vérifier qu'elle est activée après paiement

---

## 🚨 Sécurité

### ✅ Bonnes Pratiques

1. **Ne jamais exposer la clé secrète**:
   - Gardez `STRIPE_SECRET_KEY` uniquement côté serveur
   - N'envoyez jamais cette clé au frontend

2. **Vérifier les signatures des webhooks**:
   - Notre code vérifie automatiquement les signatures
   - Cela empêche les faux webhooks

3. **Valider les montants**:
   - Toujours recalculer le montant côté serveur
   - Ne jamais faire confiance aux montants envoyés par le client

4. **Logs et monitoring**:
   - Surveillez les webhooks dans **Stripe Dashboard → Developers → Webhooks → Logs**
   - Configurez des alertes pour les paiements échoués

---

## 📞 Support

- **Documentation Stripe**: https://stripe.com/docs
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Dashboard Stripe**: https://dashboard.stripe.com

---

## 🎯 Calcul des Taxes (Québec)

Notre système calcule automatiquement les taxes québécoises:

- **TPS (Fédérale)**: 5%
- **TVQ (Provinciale)**: 9.975%
- **Total**: 14.975%

**Exception**: Les cartes cadeaux ne sont PAS taxées.

**Exemple pour un massage à 108$**:
```
Subtotal: 108.00$
TPS (5%):   5.40$
TVQ (9.975%): 10.77$
─────────────────
Total:    124.17$
```

---

Tout est configuré! 🎉

Pour tester, démarrez votre serveur:
```bash
npm run dev
```

Et utilisez les endpoints `/api/payments/*` pour créer des paiements.
