# 📧 Système de Notifications - Guide Complet

Ce guide explique comment fonctionne le système de notifications email automatiques du spa.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration](#configuration)
3. [Types d'emails](#types-demails)
4. [Rappels automatiques](#rappels-automatiques)
5. [Webhooks Stripe](#webhooks-stripe)
6. [Tests et débogage](#tests-et-débogage)

---

## Vue d'ensemble

Le système de notifications envoie automatiquement des emails professionnels aux clients pour:

- ✅ **Confirmations de réservation** - Dès que le paiement est validé
- ✅ **Rappels avant rendez-vous** - 24 heures avant l'appointment
- ✅ **Cartes cadeaux** - Livraison instantanée avec code
- ✅ **Abonnements gym** - Confirmation d'activation

**Architecture**:
```
Stripe Payment → Webhook → Email de confirmation
Scheduler (cron) → Rappels 24h avant
```

---

## Configuration

### 1. Variables d'environnement

Ajoutez ces variables dans votre fichier `.env`:

```env
# Configuration Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_FROM=noreply@votre-spa.com

# Informations du spa (optionnel)
SPA_NAME=Spa Renaissance
SPA_ADDRESS=123 Rue Principale, Montréal, QC H1A 1A1
SPA_PHONE=514-123-4567
SPA_EMAIL=info@votre-spa.com
```

### 2. Configuration Gmail (recommandé)

Si vous utilisez Gmail:

1. Activez la **vérification en 2 étapes** sur votre compte Google
2. Créez un **mot de passe d'application**:
   - Allez sur https://myaccount.google.com/security
   - Cliquez sur "Mots de passe des applications"
   - Générez un mot de passe pour "Mail"
3. Utilisez ce mot de passe dans `SMTP_PASS`

### 3. Autres fournisseurs SMTP

**SendGrid**:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
```

**Mailgun**:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre-mot-de-passe-mailgun
```

**AWS SES**:
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=votre-smtp-username
SMTP_PASS=votre-smtp-password
```

---

## Types d'emails

### 1. 📅 Confirmation de réservation

**Déclencheur**: Paiement Stripe réussi (webhook `payment_intent.succeeded`)

**Contenu**:
- Numéro de réservation
- Détails du service/forfait
- Nom du professionnel
- Date et heure
- Montant payé
- Adresse du spa
- Conseils pour la visite

**Template**: HTML avec design professionnel (gradient bleu/violet)

**Exemple**:
```
Objet: ✅ Réservation confirmée - #RES-ABC123

Bonjour Marie,

Votre réservation a été confirmée avec succès!

━━━━━━━━━━━━━━━━━━━━━
Service: Massage Découverte 50 min
Professionnel: Sophie Martin
Date: Lundi 20 janvier 2025
Heure: 09:00 - 09:50
Montant: 124.17 $
━━━━━━━━━━━━━━━━━━━━━

À bientôt!
Spa Renaissance
```

### 2. 🔔 Rappel de rendez-vous

**Déclencheur**: Scheduler automatique (24 heures avant)

**Fréquence**: Vérifié toutes les heures

**Contenu**:
- Message de rappel urgent
- Tous les détails de la réservation
- Conseils de préparation
- Adresse et contact

**Template**: HTML avec encadré orange pour l'urgence

**Exemple**:
```
Objet: 🔔 Rappel: Rendez-vous demain à 09:00

Bonjour Marie,

RAPPEL: Votre rendez-vous est dans 24 heures!

Rendez-vous demain (Lundi 20 janvier) à 09:00
Service: Massage Découverte
Avec: Sophie Martin

Conseils:
• Arrivez 10 minutes avant
• Portez des vêtements confortables
• Évitez de manger juste avant
```

### 3. 🎁 Carte cadeau

**Déclencheur**: Paiement Stripe réussi pour une carte cadeau

**Contenu**:
- Valeur de la carte
- Code unique à utiliser
- Message personnel de l'acheteur
- Instructions d'utilisation
- Bouton "Réserver maintenant"

**Template**: HTML avec design festif (gradient vert)

**Exemple**:
```
Objet: 🎁 Vous avez reçu une carte cadeau de 100$!

Bonjour Sophie,

Vous avez reçu une carte cadeau!

💝 VALEUR: 100.00 $
🔑 CODE: GIFT-XYZ789

Message de Jean:
"Bon anniversaire! Profite bien de ce moment de détente!"

Utilisez ce code lors de votre réservation.
```

### 4. 🏋️ Confirmation abonnement gym

**Déclencheur**: Paiement Stripe réussi pour un abonnement

**Contenu**:
- Type d'abonnement
- Dates de début et fin
- Montant payé
- Horaires du gym
- Informations pratiques

**Template**: HTML avec design fitness (gradient vert)

**Exemple**:
```
Objet: 🏋️ Abonnement gym activé!

Bonjour Marc,

Votre abonnement gym est maintenant actif!

Type: Abonnement 1 Mois
Début: 15 janvier 2025
Fin: 14 février 2025
Montant: 50.00 $

Horaires du gym:
Lun-Ven: 6h00 - 22h00
Sam-Dim: 8h00 - 20h00
```

---

## Rappels automatiques

### Fonctionnement

Le système utilise **node-cron** pour exécuter une tâche toutes les heures:

```typescript
// Exécution: toutes les heures à la minute 0 (9:00, 10:00, 11:00, etc.)
cron.schedule('0 * * * *', async () => {
  await checkAndSendReminders();
});
```

### Logique de détection

1. Calcule la fenêtre de temps: **23h30 à 24h30** à partir de maintenant
2. Trouve toutes les réservations **CONFIRMED** dans cette fenêtre
3. Filtre celles qui n'ont **pas encore reçu de rappel** (`reminderSent = false`)
4. Envoie l'email de rappel
5. Marque `reminderSent = true` dans la base de données

### Exemples de timing

**Scénario 1**:
- Réservation: Lundi 20 janvier à 14:00
- Rappel envoyé: Dimanche 19 janvier entre 13:30 et 15:30
- Status: `reminderSent = true`

**Scénario 2**:
- Réservation: Mardi 21 janvier à 09:00
- Rappel envoyé: Lundi 20 janvier entre 08:30 et 10:30

### Mode développement

En développement, une vérification est lancée **5 secondes après le démarrage** pour faciliter les tests:

```typescript
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    checkAndSendReminders();
  }, 5000);
}
```

### Tester manuellement

Pour tester le système de rappels sans attendre:

```typescript
import { testReminders } from './lib/scheduler';

// Appeler cette fonction pour déclencher une vérification immédiate
await testReminders();
```

---

## Webhooks Stripe

### Configuration

Les emails de confirmation sont déclenchés automatiquement par les webhooks Stripe.

**Événements gérés**:

| Événement | Action | Email envoyé |
|-----------|--------|--------------|
| `payment_intent.succeeded` | Paiement réussi | ✅ Confirmation |
| `payment_intent.payment_failed` | Paiement échoué | ❌ (TODO) |
| `charge.refunded` | Remboursement | ❌ (TODO) |

### Flux de confirmation

```
1. Client paie avec Stripe
   ↓
2. Stripe envoie webhook "payment_intent.succeeded"
   ↓
3. Backend vérifie la signature Stripe
   ↓
4. Mise à jour du statut: PENDING → CONFIRMED
   ↓
5. Récupération des détails (service, professionnel)
   ↓
6. Envoi de l'email de confirmation
   ↓
7. Log: ✅ Email envoyé
```

### Gestion des erreurs

Si l'envoi d'email échoue:
- ❌ Log de l'erreur dans la console
- ✅ La réservation reste **CONFIRMED**
- ✅ Le paiement est validé
- 🔄 Vous pouvez renvoyer l'email manuellement

**Code**:
```typescript
try {
  await sendBookingConfirmation({ /* ... */ });
  console.log(`✅ Email de confirmation envoyé`);
} catch (error) {
  console.error(`❌ Erreur lors de l'envoi de l'email:`, error);
  // La réservation reste confirmée même si l'email échoue
}
```

---

## Tests et débogage

### 1. Tester la configuration SMTP

Créez un fichier `test-email.ts`:

```typescript
import { sendBookingConfirmation } from './src/lib/email';

async function test() {
  try {
    await sendBookingConfirmation({
      bookingNumber: 'TEST-123',
      clientName: 'Test Client',
      clientEmail: 'votre-email@example.com',
      serviceName: 'Test Service',
      professionalName: 'Test Pro',
      bookingDate: new Date(),
      startTime: '09:00',
      endTime: '10:00',
      total: 100,
    });
    console.log('✅ Email envoyé avec succès!');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

test();
```

Exécutez:
```bash
npx tsx test-email.ts
```

### 2. Vérifier les logs

Les logs vous indiquent ce qui se passe:

**Démarrage**:
```
📅 Démarrage du planificateur de rappels...
🔧 Mode développement: vérification immédiate des rappels
✅ Planificateur de rappels démarré
```

**Webhook reçu**:
```
✅ Webhook reçu: payment_intent.succeeded
💳 Paiement réussi: pi_123456
📅 Confirmation de la réservation: RES-ABC123
✅ Email de confirmation envoyé à client@example.com
```

**Rappels**:
```
🔍 Vérification des rappels de réservation...
📧 2 rappel(s) à envoyer
✅ Rappel envoyé pour la réservation RES-ABC123
✅ Rappel envoyé pour la réservation RES-DEF456
✅ Vérification des rappels terminée (2 envoyés)
```

### 3. Problèmes courants

**Email non reçu**:
- ✅ Vérifiez le dossier spam
- ✅ Vérifiez `SMTP_USER` et `SMTP_PASS`
- ✅ Vérifiez que le port SMTP est correct (587 pour TLS)
- ✅ Pour Gmail: utilisez un mot de passe d'application

**Rappels non envoyés**:
- ✅ Vérifiez que `reminderSent = false` dans la base de données
- ✅ Vérifiez que la réservation est dans 23h30-24h30
- ✅ Vérifiez que le statut est `CONFIRMED`
- ✅ Regardez les logs du scheduler

**Erreur de connexion SMTP**:
```
Error: getaddrinfo ENOTFOUND smtp.gmail.com
```
→ Vérifiez votre connexion internet et le `SMTP_HOST`

**Authentification SMTP échouée**:
```
Error: Invalid login: 535 Authentication failed
```
→ Vérifiez votre `SMTP_USER` et `SMTP_PASS`

### 4. Mode debug

Pour activer plus de logs, ajoutez dans `.env`:

```env
DEBUG=nodemailer:*
NODE_ENV=development
```

---

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne committez jamais** vos identifiants SMTP dans Git
2. Utilisez des **mots de passe d'application** (pas votre mot de passe principal)
3. Activez la **vérification en 2 étapes** sur votre compte email
4. Utilisez **STARTTLS** (port 587) plutôt que SSL (port 465)
5. Limitez les **permissions** du compte email SMTP

### Variables sensibles

Ajoutez dans `.gitignore`:
```
.env
.env.local
.env.production
```

---

## 📊 Monitoring

### Métriques à surveiller

- **Taux de livraison**: % d'emails livrés avec succès
- **Taux d'ouverture**: % d'emails ouverts par les clients
- **Taux de spam**: % d'emails marqués comme spam
- **Erreurs SMTP**: Nombre d'échecs d'envoi

### Outils recommandés

- **SendGrid**: Analytics intégré, 100 emails/jour gratuits
- **Mailgun**: Logs détaillés, 5000 emails/mois gratuits
- **AWS SES**: Très fiable, 62,000 emails/mois gratuits

---

## 🚀 Prochaines étapes (optionnel)

### SMS Notifications

Pour ajouter des notifications SMS avec Twilio:

1. Installez le SDK Twilio:
```bash
npm install twilio
```

2. Créez `src/lib/sms.ts`:
```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendBookingSMS(phone: string, message: string) {
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
}
```

3. Intégrez dans les webhooks:
```typescript
await sendBookingSMS(
  booking.clientPhone,
  `Réservation confirmée! ${booking.bookingNumber}\nDate: ${formattedDate}\nHeure: ${booking.startTime}`
);
```

### Templates personnalisables

Créez des templates Handlebars pour permettre la personnalisation:

```bash
npm install handlebars
```

```typescript
import Handlebars from 'handlebars';
import fs from 'fs';

const template = Handlebars.compile(
  fs.readFileSync('./templates/booking-confirmation.hbs', 'utf-8')
);

const html = template({
  bookingNumber: 'RES-123',
  clientName: 'Marie',
  // ...
});
```

---

## ✅ Checklist de mise en production

- [ ] Configuration SMTP en production (SendGrid/Mailgun/SES)
- [ ] Tests d'envoi sur tous les types d'emails
- [ ] Vérification du dossier spam
- [ ] Configuration du domaine email (SPF, DKIM, DMARC)
- [ ] Monitoring des erreurs SMTP
- [ ] Backup des logs d'emails
- [ ] Rate limiting sur l'envoi d'emails
- [ ] Template responsive (mobile-friendly)
- [ ] Bouton de désabonnement (si newsletter)

---

Tout est prêt! 🎉 Votre système de notifications est opérationnel.
