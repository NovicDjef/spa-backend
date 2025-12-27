# Configuration de l'envoi d'emails

Ce guide explique comment configurer l'envoi d'emails pour votre application Spa Renaissance.

## Vue d'ensemble

Le système utilise **Nodemailer** pour envoyer des emails via SMTP. Vous devez configurer un compte email pour envoyer :
- Emails de bienvenue aux nouveaux clients
- Emails de confirmation de réservation
- **Campagnes marketing générées par IA**
- Rappels de rendez-vous
- Emails de feedback

## Options de configuration SMTP

Vous avez plusieurs options pour envoyer des emails :

### Option 1 : Gmail (Recommandé pour débuter) ⭐

**Avantages :**
- Gratuit jusqu'à 500 emails/jour
- Simple à configurer
- Fiable

**Étapes de configuration :**

1. **Créer un compte Gmail dédié** (ex: spa.renaissance.notifications@gmail.com)

2. **Activer l'authentification à 2 facteurs**
   - Aller sur : https://myaccount.google.com/security
   - Activer la validation en deux étapes

3. **Créer un mot de passe d'application**
   - Aller sur : https://myaccount.google.com/apppasswords
   - Sélectionner "Autre (nom personnalisé)"
   - Nommer : "Spa Backend API"
   - Copier le mot de passe généré (16 caractères)

4. **Configurer votre fichier .env**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=spa.renaissance.notifications@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Le mot de passe d'application
   SMTP_FROM=Spa Renaissance <spa.renaissance.notifications@gmail.com>
   ```

**Limites Gmail :**
- 500 emails par jour (largement suffisant pour commencer)
- 100 destinataires par email

---

### Option 2 : SendGrid (Recommandé pour production) 🚀

**Avantages :**
- 100 emails gratuits par jour (forever free)
- Excellente délivrabilité
- Statistiques détaillées (taux d'ouverture, clics)
- Idéal pour les campagnes marketing

**Étapes de configuration :**

1. **Créer un compte gratuit**
   - Aller sur : https://signup.sendgrid.com/
   - Plan gratuit : 100 emails/jour

2. **Créer une clé API**
   - Aller dans Settings → API Keys
   - Cliquer sur "Create API Key"
   - Nom : "Spa Backend API"
   - Permissions : Full Access
   - Copier la clé (commence par "SG.")

3. **Vérifier votre email d'expéditeur**
   - Aller dans Settings → Sender Authentication
   - Vérifier votre email ou domaine

4. **Configurer votre fichier .env**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Votre clé API
   SMTP_FROM=info@sparenaissance.ca
   ```

**Limites SendGrid Free :**
- 100 emails par jour
- Statistiques complètes
- Support email

---

### Option 3 : Mailgun

**Avantages :**
- 5,000 emails gratuits pendant 3 mois
- Bonne délivrabilité
- API puissante

**Configuration :**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASSWORD=votre-mot-de-passe-mailgun
SMTP_FROM=info@sparenaissance.ca
```

**Site :** https://www.mailgun.com/

---

### Option 4 : Service email professionnel (O365, Google Workspace)

Si vous avez déjà un email professionnel :

**Microsoft 365 / Outlook :**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=votre-email@votredomaine.com
SMTP_PASSWORD=votre-mot-de-passe
SMTP_FROM=info@sparenaissance.ca
```

**Google Workspace :**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@votredomaine.com
SMTP_PASSWORD=votre-mot-de-passe-application
SMTP_FROM=info@sparenaissance.ca
```

---

## Configuration recommandée par cas d'usage

### Développement / Test
- **Gmail** : Gratuit, facile, parfait pour tester

### Production (petit volume)
- **SendGrid Free** : 100 emails/jour, statistiques incluses

### Production (volume moyen)
- **SendGrid Essentials** : 40k emails/mois - 15$/mois
- Ou **Mailgun** : 5k emails gratuits puis payant

### Production (grand volume)
- **SendGrid Pro** : 100k emails/mois - 90$/mois
- Ou service d'email transactionnel dédié

---

## Configuration complète dans .env

Voici toutes les variables nécessaires pour le système d'emails :

```env
# Configuration SMTP (choisir selon votre fournisseur)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=spa.renaissance.notifications@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM=Spa Renaissance <spa.renaissance.notifications@gmail.com>

# Informations du Spa (utilisées dans les emails)
SPA_NAME=Spa Renaissance
SPA_ADDRESS=123 Rue Principale, Montréal, QC
SPA_PHONE=819-646-0606
SPA_EMAIL=info@sparenaissance.ca

# OpenAI pour génération de messages marketing
OPENAI_API_KEY=sk-votre-cle-api-openai
```

---

## Test de la configuration

Après avoir configuré votre .env, testez l'envoi d'email :

### 1. Démarrer le serveur
```bash
npm run dev
```

### 2. Créer un client de test (via l'interface ou API)

### 3. Envoyer un email de test

Le système enverra automatiquement un email de bienvenue lors de la création d'un client.

Vous pouvez aussi tester l'envoi d'une campagne marketing :
1. Sélectionner un client dans l'interface admin
2. Aller dans "Marketing"
3. Générer un message avec l'IA
4. Envoyer à un client test

---

## Vérification des logs

Le système affiche des logs pour chaque email envoyé :

```
✅ Email marketing envoyé à client@example.com
```

En cas d'erreur :
```
❌ Erreur envoi email marketing à client@example.com: [détails de l'erreur]
```

---

## Problèmes courants

### "Authentication failed" avec Gmail
- ✅ Vérifiez que l'authentification 2FA est activée
- ✅ Utilisez un mot de passe d'application, pas votre mot de passe Gmail
- ✅ Le format du mot de passe est : xxxx xxxx xxxx xxxx (avec espaces)

### "Connection timeout"
- ✅ Vérifiez votre pare-feu / antivirus
- ✅ Vérifiez que le port 587 est ouvert
- ✅ Essayez le port 465 avec `secure: true`

### Les emails arrivent dans les spams
- ✅ Utilisez SendGrid ou un service professionnel
- ✅ Configurez SPF, DKIM et DMARC pour votre domaine
- ✅ Évitez les mots comme "gratuit", "promo" en majuscules

### Limite de quota dépassée
- ✅ Gmail : max 500 emails/jour
- ✅ Passez à SendGrid ou un service payant

---

## Statistiques et tracking

### Avec SendGrid / Mailgun
Vous obtiendrez automatiquement :
- Taux d'ouverture
- Taux de clics
- Bounces (emails non délivrés)
- Spam reports

### Avec Gmail
Pas de statistiques automatiques. Les données sont enregistrées dans la table `EmailLog` de votre base de données.

---

## Sécurité

⚠️ **Important :**
- ❌ Ne JAMAIS committer le fichier `.env` dans Git
- ✅ Utiliser des mots de passe d'application, pas vos vrais mots de passe
- ✅ Créer un compte email dédié pour l'application
- ✅ Activer l'authentification 2FA sur ce compte

---

## Support

Pour plus d'aide :
- Gmail : https://support.google.com/mail/answer/185833
- SendGrid : https://docs.sendgrid.com/
- Mailgun : https://documentation.mailgun.com/

---

## Résumé rapide

**Pour démarrer rapidement (5 minutes) :**

1. Créer un compte Gmail dédié
2. Activer 2FA
3. Générer un mot de passe d'application
4. Copier dans `.env` :
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=votre-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   SMTP_FROM=Spa Renaissance <votre-email@gmail.com>
   ```
5. Redémarrer le serveur : `npm run dev`
6. Tester en créant un client ou en envoyant une campagne marketing

✅ C'est tout ! Vous pouvez maintenant envoyer des emails à vos clients.
