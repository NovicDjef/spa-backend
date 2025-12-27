# 🤖 Emails Automatiques de Suivi Client

## 🎯 Vue d'ensemble

Système d'envoi **automatique** d'emails de suivi personnalisés aux clients après chaque soin. Dès qu'un massothérapeute ou une esthéticienne ajoute une note au dossier client, un email professionnel est généré par l'IA et envoyé instantanément.

---

## ✨ Fonctionnement Automatique

### Déclencheur : Ajout d'une Note

Quand un thérapeute ajoute une note au dossier client (`POST /api/notes/:clientId`), le processus suivant se déclenche **automatiquement** :

```
1. Massothérapeute ajoute une note au dossier client
   ↓
2. ChatGPT analyse la note et génère un message personnalisé
   ↓
3. Email envoyé automatiquement au client
   ↓
4. Note marquée comme "email envoyé"
```

**Temps de traitement :** ~2-5 secondes après l'ajout de la note

---

## 📧 Contenu de l'Email Généré

### Structure du Message (120-150 mots)

L'IA génère un message professionnel et personnalisé contenant :

1. ✅ **Salutation personnalisée** avec le nom du client
2. ✅ **Remerciement chaleureux** pour sa visite
3. ✅ **Résumé professionnel** du traitement (basé sur la note du thérapeute)
4. ✅ **Conseils pratiques** personnalisés (2-3 maximum)
5. ✅ **Recommandation de suivi** SI pertinent selon la note
6. ✅ **Lien vers le formulaire d'avis** : https://dospa.novic.dev/avis
7. ✅ **Mentions obligatoires** :
   - Email automatique (ne pas répondre)
   - Formulaire anonyme
   - Amélioration du service
8. ✅ **Signature** du thérapeute

---

## 💡 Exemple de Message Généré

### Note du Thérapeute

```
Client présentait des tensions importantes dans le haut du dos
et les épaules. Massage thérapeutique profond de 60 minutes
avec focus sur les trapèzes. Client a bien répondu au traitement.
Recommander un suivi dans 2 semaines pour maintenir les résultats.
```

### Email Envoyé au Client

**Sujet :** Votre soin au Spa Renaissance - Conseils personnalisés

**Message :**

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #2c5f2d 0%, #1a3d1f 100%);
              color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">Spa Renaissance</h1>
    <p style="margin: 10px 0 0 0; font-size: 14px;">Suivi de votre soin</p>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; color: #333;">Bonjour Marie,</p>

    <p style="line-height: 1.6; color: #555;">
      Merci d'avoir choisi le Spa Renaissance pour votre soin de massothérapie.
      Nous avons traité les tensions importantes dans votre haut du dos et vos
      épaules avec un massage thérapeutique profond ciblant particulièrement
      les trapèzes.
    </p>

    <p style="line-height: 1.6; color: #555;">
      <strong style="color: #2c5f2d;">Conseils pour prolonger les bienfaits :</strong><br>
      • Appliquez de la chaleur sur les zones traitées<br>
      • Hydratez-vous bien dans les 24 heures<br>
      • Évitez les activités intenses pendant 24-48 heures
    </p>

    <p style="line-height: 1.6; color: #555;">
      Pour maintenir ces résultats positifs, nous vous recommandons un suivi
      dans environ 2 semaines.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://dospa.novic.dev/avis"
         style="background: #2c5f2d; color: white; padding: 12px 30px;
                text-decoration: none; border-radius: 5px; display: inline-block;
                font-weight: bold;">
        ⭐ Partagez votre avis
      </a>
    </div>

    <div style="background: #e8f5e9; padding: 15px; border-radius: 5px;
                margin-top: 20px; font-size: 13px; color: #666;">
      <p style="margin: 0 0 10px 0;">
        <strong>Note importante :</strong>
      </p>
      <p style="margin: 0 0 5px 0;">
        • Ce courriel est automatique et ne nécessite pas de réponse.
      </p>
      <p style="margin: 0 0 5px 0;">
        • Le formulaire d'avis est entièrement anonyme - vos informations
        personnelles ne sont pas enregistrées.
      </p>
      <p style="margin: 0;">
        • Votre avis nous aide à améliorer nos services pour mieux vous satisfaire.
      </p>
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;
                text-align: center; color: #777;">
      <p style="margin: 0; font-style: italic;">Jean Tremblay, Massothérapeute</p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Spa Renaissance</p>
      <p style="margin: 5px 0 0 0; font-size: 12px;">
        📍 451 avenue Arnaud, suite 101, Sept-Îles, QC G4R 3B3<br>
        📞 418-968-0606 | ✉️ info@sparenaissance.ca
      </p>
    </div>
  </div>
</div>
```

---

## 🔧 Configuration Technique

### Prérequis

1. ✅ **SendGrid** configuré (envoi des emails)
2. ✅ **OpenAI API** configurée (génération des messages)
3. ✅ **Variables d'environnement** dans `.env` :

```env
# OpenAI (ChatGPT)
OPENAI_API_KEY=sk-proj-...

# SendGrid (Emails)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxx...
SMTP_FROM=info@sparenaissance.ca

# Informations du Spa
SPA_NAME=Spa Renaissance
SPA_ADDRESS=451 avenue Arnaud, suite 101, Sept-Îles, Québec G4R 3B3
SPA_PHONE=418-968-0606
SPA_EMAIL=info@sparenaissance.ca
```

---

## 📊 Workflow Détaillé

### 1. Massothérapeute Ajoute une Note

**Route :** `POST /api/notes/:clientId`

```javascript
// Exemple d'ajout de note
const response = await fetch(`/api/notes/${clientId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: "Client présentait des tensions dans le haut du dos..."
  })
});
```

### 2. Processus Automatique (Backend)

```typescript
// 1. Note créée en base de données
const note = await prisma.note.create({ ... });

// 2. Processus asynchrone lancé
(async () => {
  // 3. Récupération des infos client et thérapeute
  const client = { prenom, nom, courriel, serviceType }
  const therapist = { prenom, nom }

  // 4. ChatGPT génère le message personnalisé
  const { subject, message } = await generateClientFollowUpMessage(
    noteContent,
    clientFirstName,
    clientLastName,
    therapistName,
    serviceType
  );

  // 5. Email envoyé au client
  await sendEmail({
    to: client.courriel,
    subject,
    html: message
  });

  // 6. Note marquée comme "email envoyé"
  await prisma.note.update({
    where: { id: note.id },
    data: {
      emailSent: true,
      emailSentAt: new Date()
    }
  });
})();

// 7. Réponse immédiate au thérapeute (sans attendre l'email)
return { success: true, message: "Note ajoutée avec succès" };
```

### 3. Client Reçoit l'Email

Le client reçoit l'email dans les **2-5 secondes** suivant l'ajout de la note.

---

## 🎨 Règles de Génération IA

### Longueur

- **Minimum :** 120 mots
- **Maximum :** 150 mots
- **Raison :** Maintenir l'attention du client, éviter les messages trop longs

### Ton et Style

- ✅ Professionnel mais **chaleureux et humain**
- ✅ Courtois et respectueux
- ✅ Rassurant et bienveillant
- ✅ Écrit comme si c'était le thérapeute lui-même
- ❌ PAS de ton robotique ou générique

### Recommandations de Suivi

**Intelligent et Contextuel :**

- ✅ **OUI** si la note indique :
  - Douleurs persistantes
  - Tensions importantes
  - Traitement en plusieurs séances
  - Besoin de suivi médical

- ❌ **NON** si la note indique :
  - Soin simple de détente
  - Massage relaxant
  - Client en bonne forme
  - Pas de problème particulier

**Exemples de recommandations :**
- "Nous vous recommandons un suivi dans environ 2 semaines"
- "Un rendez-vous de suivi dans 10 jours serait bénéfique"
- "Pour maintenir ces résultats, revenez dans 3 semaines"

---

## 🔍 Traçabilité

### Champs de la Table `Note`

```prisma
model Note {
  id          String   @id @default(cuid())
  content     String
  clientId    String
  authorId    String

  // Traçabilité de l'email automatique
  emailSent   Boolean   @default(false)
  emailSentAt DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Vérifier si l'Email a été Envoyé

```javascript
const note = await prisma.note.findUnique({
  where: { id: noteId }
});

if (note.emailSent) {
  console.log(`Email envoyé le ${note.emailSentAt}`);
} else {
  console.log('Email non envoyé');
}
```

---

## 🛡️ Gestion des Erreurs

### Cas où l'Email N'est PAS Envoyé

1. **Client sans email** :
   ```
   Console: "Client Marie Dupont n'a pas d'email - Email de suivi non envoyé"
   ```

2. **Erreur ChatGPT** :
   ```
   Console: "❌ Erreur lors de l'envoi de l'email de suivi: ..."
   Note créée QUAND MÊME (ne bloque pas le processus)
   ```

3. **Erreur SendGrid** :
   ```
   Console: "❌ Erreur lors de l'envoi de l'email de suivi: ..."
   Note créée QUAND MÊME
   ```

### Logs Console

**Succès :**
```
📧 Génération du message de suivi pour Marie Dupont...
✅ Email de suivi envoyé à Marie Dupont (marie@example.com)
```

**Échec :**
```
❌ Erreur lors de l'envoi de l'email de suivi: [détails de l'erreur]
```

---

## ⚠️ Points Importants

### 1. Processus Asynchrone

L'email est envoyé en **arrière-plan** pour ne pas ralentir la réponse API :

```typescript
// Processus asynchrone (ne bloque pas)
(async () => {
  await sendEmail(...);
})();

// Réponse immédiate au thérapeute
return { success: true };
```

**Avantage :** Le thérapeute obtient une réponse immédiate, même si l'email prend quelques secondes à être généré et envoyé.

### 2. Coûts

**OpenAI (ChatGPT-4) :**
- ~0.03$ - 0.06$ par message généré
- 2 appels API par email (sujet + message)
- **Total :** ~0.06$ - 0.12$ par email

**SendGrid :**
- Gratuit (100 emails/jour)
- Au-delà : 0.0006$ par email

### 3. Limite de Mots

**120-150 mots maximum** pour :
- ✅ Maintenir l'attention du client
- ✅ Garantir que le message sera lu en entier
- ✅ Éviter les messages trop longs et ennuyeux

### 4. Personnalisation

Chaque message est **unique** et **personnalisé** :
- ✅ Basé sur la note spécifique du thérapeute
- ✅ Adapté au type de soin (massothérapie ou esthétique)
- ✅ Conseils pertinents au cas du client
- ✅ Recommandations intelligentes selon le besoin

---

## 📈 Statistiques et Suivi

### Voir les Notes avec Emails Envoyés

```javascript
// Toutes les notes avec emails envoyés
const notesWithEmails = await prisma.note.findMany({
  where: {
    emailSent: true
  },
  include: {
    author: true,
    client: true
  }
});

console.log(`${notesWithEmails.length} emails de suivi envoyés`);
```

### Taux d'Envoi par Thérapeute

```javascript
const stats = await prisma.note.groupBy({
  by: ['authorId'],
  _count: {
    _all: true
  },
  _sum: {
    emailSent: true
  }
});

stats.forEach(stat => {
  const total = stat._count._all;
  const sent = stat._sum.emailSent || 0;
  const rate = (sent / total * 100).toFixed(1);
  console.log(`Thérapeute ${stat.authorId}: ${rate}% d'emails envoyés`);
});
```

---

## ✅ Avantages du Système

### Pour les Clients

1. ✅ **Suivi personnalisé** après chaque soin
2. ✅ **Conseils pratiques** adaptés à leur cas
3. ✅ **Sentiment de soin continu** et d'attention
4. ✅ **Rappel pour donner un avis** (amélioration du service)
5. ✅ **Recommandations professionnelles** pour leur bien-être

### Pour le Spa

1. ✅ **Automatisation complète** (pas de travail manuel)
2. ✅ **Image professionnelle** renforcée
3. ✅ **Fidélisation client** améliorée
4. ✅ **Collecte d'avis** facilitée
5. ✅ **Recommandations de suivi** augmentent les réservations
6. ✅ **Traçabilité** de chaque interaction

### Pour les Thérapeutes

1. ✅ **Gain de temps** (pas besoin d'écrire manuellement)
2. ✅ **Messages professionnels** garantis
3. ✅ **Focus sur le soin** plutôt que sur l'administratif
4. ✅ **Suivi client** assuré automatiquement

---

## 🎯 Résumé

**Fonctionnalité :** Email automatique de suivi personnalisé après chaque note ajoutée au dossier client

**Déclencheur :** Création d'une note (`POST /api/notes/:clientId`)

**Processus :**
1. Note créée
2. ChatGPT génère un message personnalisé (120-150 mots)
3. Email envoyé automatiquement au client
4. Note marquée comme "email envoyé"

**Temps :** 2-5 secondes

**Contenu :** Remerciement + Résumé + Conseils + Suivi + Lien avis + Mentions

**Configuration requise :**
- ✅ OpenAI API Key
- ✅ SendGrid configuré

**Coût par email :** ~0.06$ - 0.12$

**🚀 Système opérationnel et automatique !**
