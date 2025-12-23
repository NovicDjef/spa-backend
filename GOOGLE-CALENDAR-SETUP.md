# 📅 Configuration Google Calendar - Guide Complet

Ce guide vous explique comment configurer l'intégration Google Calendar pour synchroniser automatiquement les réservations.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Étape 1: Créer un projet Google Cloud](#étape-1-créer-un-projet-google-cloud)
4. [Étape 2: Activer Google Calendar API](#étape-2-activer-google-calendar-api)
5. [Étape 3: Créer les credentials OAuth2](#étape-3-créer-les-credentials-oauth2)
6. [Étape 4: Obtenir le Refresh Token](#étape-4-obtenir-le-refresh-token)
7. [Étape 5: Configuration du serveur](#étape-5-configuration-du-serveur)
8. [Tests et vérification](#tests-et-vérification)
9. [Résolution de problèmes](#résolution-de-problèmes)

---

## Vue d'ensemble

Une fois configuré, le système:
- ✅ **Crée automatiquement** un événement Google Calendar quand une réservation est confirmée
- ✅ **Envoie une invitation** par email au client (via Google Calendar)
- ✅ **Annule l'événement** si la réservation est annulée ou remboursée
- ✅ **Met à jour l'événement** si la réservation est modifiée
- ✅ **Synchronise** avec tous les appareils connectés au compte Google

**Flux automatique**:
```
Paiement confirmé → Réservation CONFIRMED → Événement Google Calendar créé
                                           → Invitation envoyée au client
```

---

## Prérequis

- Un compte Google (Gmail)
- Accès à Google Cloud Console
- Le serveur backend en cours d'exécution

---

## Étape 1: Créer un projet Google Cloud

### 1.1 Accéder à Google Cloud Console

Allez sur: https://console.cloud.google.com/

### 1.2 Créer un nouveau projet

1. Cliquez sur **"Sélectionner un projet"** en haut de la page
2. Cliquez sur **"Nouveau projet"**
3. Nom du projet: `Spa Management System` (ou votre choix)
4. Organisation: Laissez vide si c'est un projet personnel
5. Cliquez sur **"Créer"**

**Attendez quelques secondes** que le projet soit créé.

### 1.3 Sélectionner le projet

Assurez-vous que votre nouveau projet est sélectionné dans le menu déroulant en haut.

---

## Étape 2: Activer Google Calendar API

### 2.1 Accéder à la bibliothèque API

1. Dans le menu de gauche, allez à **"APIs & Services" > "Library"**
2. Ou utilisez ce lien direct: https://console.cloud.google.com/apis/library

### 2.2 Rechercher et activer Calendar API

1. Dans la barre de recherche, tapez: `Google Calendar API`
2. Cliquez sur **"Google Calendar API"**
3. Cliquez sur le bouton **"Activer"** (Enable)

**Attendez** que l'API soit activée (quelques secondes).

---

## Étape 3: Créer les credentials OAuth2

### 3.1 Configurer l'écran de consentement OAuth

1. Allez à **"APIs & Services" > "OAuth consent screen"**
2. Choisissez **"External"** (ou "Internal" si vous avez un workspace)
3. Cliquez sur **"Créer"**

**Remplissez le formulaire**:
- **App name**: `Spa Management System`
- **User support email**: Votre email
- **App logo**: (Optionnel)
- **Developer contact email**: Votre email
- Cliquez sur **"Enregistrer et continuer"**

### 3.2 Scopes (Permissions)

1. Cliquez sur **"Ajouter ou supprimer des scopes"**
2. Recherchez et sélectionnez:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
3. Cliquez sur **"Mettre à jour"**
4. Cliquez sur **"Enregistrer et continuer"**

### 3.3 Test users (si "External")

Si vous avez choisi "External":
1. Cliquez sur **"Ajouter des utilisateurs"**
2. Ajoutez votre email Google
3. Cliquez sur **"Enregistrer et continuer"**

Cliquez sur **"Retour au tableau de bord"**

### 3.4 Créer les credentials OAuth2

1. Allez à **"APIs & Services" > "Credentials"**
2. Cliquez sur **"Créer des identifiants" > "ID client OAuth"**
3. Type d'application: **"Application Web"**
4. Nom: `Spa Backend OAuth2`

**URIs de redirection autorisés**:
```
http://localhost:5003/api/calendar/oauth2callback
```

Si votre serveur est sur un autre port, ajustez l'URL.

5. Cliquez sur **"Créer"**

### 3.5 Télécharger les credentials

Une popup apparaît avec:
- **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxx`

**Copiez ces deux valeurs** (vous en aurez besoin pour `.env`).

---

## Étape 4: Obtenir le Refresh Token

Le Refresh Token permet au serveur d'accéder à Google Calendar sans intervention manuelle.

### 4.1 Configurer les variables d'environnement

Ajoutez dans votre fichier `.env`:

```env
# Google Calendar OAuth2
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:5003/api/calendar/oauth2callback
GOOGLE_CALENDAR_ID=primary
```

Remplacez les valeurs par celles que vous avez copiées à l'étape 3.5.

### 4.2 Redémarrer le serveur

```bash
npm run dev
```

### 4.3 Obtenir l'URL d'autorisation

**Méthode 1: Via API**

Ouvrez votre navigateur et allez sur:
```
http://localhost:5003/api/calendar/auth/url
```

Vous obtiendrez une réponse JSON avec un `authUrl`. **Copiez cette URL**.

**Méthode 2: Via curl**

```bash
curl http://localhost:5003/api/calendar/auth/url
```

### 4.4 Autoriser l'application

1. **Collez l'URL d'autorisation** dans votre navigateur
2. **Connectez-vous** avec votre compte Google
3. Google vous avertira que l'app n'est pas vérifiée
   - Cliquez sur **"Paramètres avancés"**
   - Cliquez sur **"Accéder à Spa Management System (non sécurisé)"**
4. **Autorisez** l'accès à Google Calendar
5. Vous serez redirigé vers une page d'erreur (`localhost:5003/api/calendar/oauth2callback?code=...`)

**C'est normal!** Copiez le **code** dans l'URL.

Exemple d'URL:
```
http://localhost:5003/api/calendar/oauth2callback?code=4/0AQlEd8w...
                                                         ^^^^^^^^^ Copiez cette partie
```

### 4.5 Échanger le code contre un Refresh Token

Utilisez curl ou Postman:

```bash
curl -X POST http://localhost:5003/api/calendar/auth/callback \
  -H "Content-Type: application/json" \
  -d '{"code": "4/0AQlEd8w..."}'
```

Remplacez `4/0AQlEd8w...` par le code que vous avez copié.

**Réponse**:
```json
{
  "success": true,
  "message": "Tokens obtenus avec succès!",
  "data": {
    "refresh_token": "1//0gXXXXXXXXXXXXXXXX",
    "access_token": "ya29.a0AXXXXXXXXXXXx",
    "expiry_date": 1234567890123
  },
  "instructions": [
    "Ajoutez ce REFRESH_TOKEN dans votre fichier .env:",
    "GOOGLE_REFRESH_TOKEN=1//0gXXXXXXXXXXXXXXXX",
    "",
    "Puis redémarrez le serveur."
  ]
}
```

**Copiez le `refresh_token`**.

---

## Étape 5: Configuration du serveur

### 5.1 Ajouter le Refresh Token

Ajoutez dans votre `.env`:

```env
# Google Calendar OAuth2
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:5003/api/calendar/oauth2callback
GOOGLE_REFRESH_TOKEN=1//0gXXXXXXXXXXXXXXXX
GOOGLE_CALENDAR_ID=primary

# Informations du spa (optionnel)
SPA_ADDRESS=123 Rue Principale, Montréal, QC H1A 1A1
```

### 5.2 Redémarrer le serveur

```bash
npm run dev
```

### 5.3 Vérifier la configuration

Allez sur:
```
http://localhost:5003/api/calendar/status
```

**Réponse attendue**:
```json
{
  "success": true,
  "data": {
    "clientId": true,
    "clientSecret": true,
    "refreshToken": true,
    "calendarId": "primary",
    "configured": true
  },
  "message": "Google Calendar est configuré et prêt à l'emploi"
}
```

Si `configured: true`, **félicitations!** 🎉 Google Calendar est configuré.

---

## Tests et vérification

### Test 1: Créer une réservation test

1. Créez un Payment Intent pour une réservation
2. Complétez le paiement (avec une carte test Stripe)
3. Vérifiez les logs du serveur:

```
✅ Webhook reçu: payment_intent.succeeded
💳 Paiement réussi: pi_123456
📅 Confirmation de la réservation: RES-ABC123
✅ Email de confirmation envoyé
✅ Événement Google Calendar créé: abc123xyz
✅ Événement Google Calendar créé et lié à la réservation
```

### Test 2: Vérifier dans Google Calendar

1. Ouvrez https://calendar.google.com
2. Connectez-vous avec le compte Google utilisé
3. Vous devriez voir l'événement apparaître:
   - **Titre**: `Massage Découverte 50 min - Marie Dubois`
   - **Date/Heure**: Selon la réservation
   - **Invités**: Email du client
   - **Description**: Détails de la réservation

### Test 3: Annuler une réservation

1. Créez un remboursement via l'API ou le dashboard Stripe
2. Vérifiez les logs:

```
💰 Remboursement effectué: ch_123456
✅ Événement Google Calendar annulé
```

3. Dans Google Calendar, l'événement devrait être marqué **[ANNULÉ]** en rouge

---

## Résolution de problèmes

### Erreur: "OAuth2 client non configuré"

**Cause**: Variables d'environnement manquantes

**Solution**:
1. Vérifiez que `.env` contient bien:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
2. Redémarrez le serveur

### Erreur: "Invalid grant" ou "Token has been expired or revoked"

**Cause**: Le Refresh Token a expiré ou a été révoqué

**Solution**:
1. Recommencez l'**Étape 4** (Obtenir le Refresh Token)
2. Remplacez `GOOGLE_REFRESH_TOKEN` dans `.env`
3. Redémarrez le serveur

### Erreur: "Insufficient Permission"

**Cause**: Les scopes OAuth2 sont incorrects

**Solution**:
1. Allez dans Google Cloud Console
2. **APIs & Services > OAuth consent screen**
3. Vérifiez que ces scopes sont activés:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
4. Recommencez l'**Étape 4** pour obtenir un nouveau token

### Erreur: "Calendar not found"

**Cause**: Le `GOOGLE_CALENDAR_ID` est incorrect

**Solution**:
1. Utilisez `primary` pour le calendrier principal
2. Ou trouvez l'ID du calendrier:
   - Allez sur https://calendar.google.com
   - Paramètres > Paramètres pour mes calendriers
   - Sélectionnez votre calendrier
   - Copiez l'**ID du calendrier**

### L'événement n'apparaît pas dans Google Calendar

**Vérifications**:
1. Consultez les logs du serveur - Y a-t-il une erreur?
2. Vérifiez `http://localhost:5003/api/calendar/status` - `configured: true`?
3. Vérifiez que vous êtes connecté au bon compte Google
4. Attendez quelques secondes et rafraîchissez Google Calendar

### Warning: "Google Calendar non configuré"

**Cause**: Le serveur fonctionne mais Google Calendar n'est pas configuré

**Impact**: Les réservations fonctionnent normalement, mais les événements Google Calendar ne sont pas créés

**Solution**: Configurez Google Calendar (Étapes 1-5) ou ignorez si vous ne souhaitez pas utiliser cette fonctionnalité

---

## Configuration pour la Production

### 1. Domaine personnalisé

Mettez à jour l'URI de redirection:

**Google Cloud Console**:
```
https://api.votre-spa.com/api/calendar/oauth2callback
```

**Variables d'environnement (.env.production)**:
```env
GOOGLE_REDIRECT_URI=https://api.votre-spa.com/api/calendar/oauth2callback
```

### 2. Publier l'application OAuth

Pour éviter l'écran "Application non vérifiée":

1. Google Cloud Console > **OAuth consent screen**
2. Cliquez sur **"Publier l'application"**
3. Soumettez l'application pour vérification (optionnel)

### 3. Sécuriser les routes OAuth

En production, **restreignez** l'accès aux routes OAuth:

```typescript
// src/modules/calendar/calendar.routes.ts
router.get(
  '/auth/url',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(getAuthUrl)
);

router.post(
  '/auth/callback',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(handleOAuthCallback)
);
```

### 4. Calendrier dédié (recommandé)

Au lieu d'utiliser `primary`, créez un calendrier dédié:

1. Google Calendar > **Créer un calendrier**
2. Nom: `Réservations Spa`
3. Copiez l'**ID du calendrier** dans les paramètres
4. Mettez à jour `.env`:
```env
GOOGLE_CALENDAR_ID=abc123@group.calendar.google.com
```

---

## Fonctionnalités Avancées

### Couleurs par type de service

Modifiez `src/lib/googleCalendar.ts`:

```typescript
let colorId = '9'; // Bleu par défaut

if (booking.serviceName.includes('Massage')) {
  colorId = '9'; // Bleu
} else if (booking.serviceName.includes('Esthétique')) {
  colorId = '5'; // Jaune
} else if (booking.serviceName.includes('Spa')) {
  colorId = '7'; // Cyan
}
```

**Couleurs disponibles**:
- 1: Lavande
- 2: Sauge
- 3: Raisin
- 4: Flamingo
- 5: Banane
- 6: Mandarine
- 7: Peacock
- 8: Graphite
- 9: Blueberry
- 10: Basilic
- 11: Tomate

### Notifications personnalisées

Modifiez les rappels:

```typescript
reminders: {
  useDefault: false,
  overrides: [
    { method: 'email', minutes: 24 * 60 },  // 24h
    { method: 'email', minutes: 2 * 60 },    // 2h
    { method: 'popup', minutes: 60 },        // 1h
  ],
}
```

### Calendriers multiples (par professionnel)

Si chaque professionnel a son propre calendrier:

```typescript
// Stocker le calendarId de chaque professionnel dans la DB
const professional = await prisma.user.findUnique({
  where: { id: booking.professionalId },
  select: { googleCalendarId: true },
});

const calendarId = professional?.googleCalendarId || 'primary';
```

---

## 📊 Checklist de Configuration

- [ ] Projet Google Cloud créé
- [ ] Google Calendar API activée
- [ ] Écran de consentement OAuth configuré
- [ ] Credentials OAuth2 créés
- [ ] `GOOGLE_CLIENT_ID` ajouté dans `.env`
- [ ] `GOOGLE_CLIENT_SECRET` ajouté dans `.env`
- [ ] Refresh Token obtenu
- [ ] `GOOGLE_REFRESH_TOKEN` ajouté dans `.env`
- [ ] Serveur redémarré
- [ ] `/api/calendar/status` retourne `configured: true`
- [ ] Test de création d'événement réussi
- [ ] Événement visible dans Google Calendar
- [ ] Test d'annulation d'événement réussi

---

## 🎉 Conclusion

Félicitations! Google Calendar est maintenant intégré à votre système de spa.

**Ce qui se passe automatiquement**:
- ✅ Événement créé lors du paiement confirmé
- ✅ Invitation envoyée au client par Google
- ✅ Événement annulé lors d'un remboursement
- ✅ Synchronisation sur tous les appareils

**Avantages**:
- 📱 Accessible depuis mobile, tablette, ordinateur
- 🔔 Rappels automatiques (Google + Email)
- 📧 Invitations professionnelles
- 🔄 Synchronisation en temps réel
- 👥 Partage facile avec l'équipe

Profitez de votre système de réservation complet! 🌸
