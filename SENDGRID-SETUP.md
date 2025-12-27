# 📧 Configuration SendGrid pour Spa Renaissance

## ✅ Avantages SendGrid

- **100 emails gratuits par jour** (forever free)
- Excellente délivrabilité (99%+)
- Statistiques détaillées (ouvertures, clics)
- Dashboard professionnel
- API simple et fiable

---

## 🚀 Étape 1 : Créer un compte SendGrid

1. **Inscription :**
   - Aller sur : https://signup.sendgrid.com/
   - Remplir le formulaire d'inscription
   - Confirmer votre email

2. **Compléter votre profil :**
   - Nom de l'entreprise : `Spa Renaissance`
   - Site web : `https://dospa.novic.dev`
   - Type : `Wellness & Healthcare`

---

## 🔑 Étape 2 : Créer une clé API

1. **Accéder aux API Keys :**
   - Aller dans le menu : **Settings → API Keys**
   - URL directe : https://app.sendgrid.com/settings/api_keys

2. **Créer la clé :**
   - Cliquer sur **"Create API Key"**
   - **Name :** `Spa-Backend-API`
   - **API Key Permissions :** Sélectionner **"Full Access"**
   - Cliquer sur **"Create & View"**

3. **Copier la clé :**
   - ⚠️ **IMPORTANT** : Copiez la clé immédiatement !
   - Elle commence par `SG.`
   - Exemple : `SG.abcd1234efgh5678ijkl9012mnop3456...`
   - Vous ne pourrez plus la voir après avoir fermé la fenêtre

---

## ✉️ Étape 3 : Vérifier votre email expéditeur

1. **Accéder à Sender Authentication :**
   - Aller dans : **Settings → Sender Authentication**
   - URL directe : https://app.sendgrid.com/settings/sender_auth

2. **Vérifier un seul expéditeur :**
   - Cliquer sur **"Verify a Single Sender"**
   - Cliquer sur **"Create New Sender"**

3. **Remplir le formulaire :**
   ```
   From Name:       Spa Renaissance
   From Email:      info@sparenaissance.ca  (ou votre email)
   Reply To:        info@sparenaissance.ca
   Company Address: 451 avenue Arnaud, suite 101
   City:            Sept-Îles
   State:           Québec
   Zip Code:        G4R 3B3
   Country:         Canada
   ```

4. **Vérifier l'email :**
   - Ouvrez votre boîte mail (`info@sparenaissance.ca`)
   - Cliquez sur le lien de vérification reçu
   - Attendez la confirmation

---

## ⚙️ Étape 4 : Configurer le fichier .env

Le fichier `.env` a déjà été préparé. **Remplacez simplement la clé API :**

```env
# Email SMTP Configuration - SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=VOTRE_CLE_API_SENDGRID_ICI  # ⬅️ REMPLACER ICI
SMTP_FROM=info@sparenaissance.ca
```

**Exemple après configuration :**
```env
SMTP_PASSWORD=SG.abcd1234efgh5678ijkl9012mnop3456.xyz789...
```

---

## 🧪 Étape 5 : Tester la configuration

Après avoir mis votre clé API dans `.env`, testez la configuration :

```bash
node test-sendgrid.js
```

**Résultat attendu :**
```
🧪 Test de la configuration SendGrid...

📧 Configuration détectée:
   Host: smtp.sendgrid.net
   Port: 587
   User: apikey
   From: info@sparenaissance.ca

🔌 Test 1: Vérification de la connexion SMTP...
✅ Connexion SMTP réussie!

📨 Test 2: Envoi d'un email de test...
   Destinataire: info@sparenaissance.ca
✅ Email de test envoyé avec succès!

╔════════════════════════════════════════╗
║   ✅ SendGrid configuré avec succès!  ║
╚════════════════════════════════════════╝
```

---

## 📊 Étape 6 : Vérifier les statistiques

1. **Dashboard SendGrid :**
   - Aller sur : https://app.sendgrid.com/statistics
   - Voir les emails envoyés, ouverts, cliqués

2. **Activity Feed :**
   - Aller sur : https://app.sendgrid.com/email_activity
   - Voir tous les emails envoyés en temps réel

---

## 🔄 Étape 7 : Redémarrer le serveur

```bash
# Arrêter le serveur actuel (Ctrl+C)
# Puis redémarrer
npm run dev
```

Le serveur va maintenant utiliser SendGrid pour tous les emails !

---

## 📧 Emails automatiques du système

Votre système enverra maintenant automatiquement :

✅ **Reçus d'assurance** aux clients (avec PDF)
✅ **Emails de bienvenue** aux nouveaux clients
✅ **Confirmations de réservation**
✅ **Rappels 24h avant** les rendez-vous
✅ **Cartes cadeaux** par email
✅ **Campagnes marketing** (admin)

---

## 🎯 Limites et quotas

### Plan Gratuit (Forever Free)
- **100 emails par jour**
- Statistiques complètes
- Support email
- Validité à vie

### Si vous dépassez 100 emails/jour
- **Essentials Plan** : 40 000 emails/mois pour 19.95$/mois
- Ou utiliser plusieurs clés API (pas recommandé)

---

## 🔒 Sécurité

### Protection de la clé API

⚠️ **IMPORTANT :**
- Ne JAMAIS commit la clé API sur Git
- Le fichier `.env` est déjà dans `.gitignore`
- En production, utilisez des variables d'environnement

### Régénérer une clé compromise

Si votre clé est exposée :
1. Aller sur https://app.sendgrid.com/settings/api_keys
2. Supprimer l'ancienne clé
3. Créer une nouvelle clé
4. Mettre à jour `.env`

---

## ❓ Dépannage

### Erreur : "The from address does not match a verified Sender Identity"

**Solution :** Vérifiez votre email expéditeur sur SendGrid
- https://app.sendgrid.com/settings/sender_auth

### Erreur : "Authentication failed"

**Solution :** Vérifiez que :
- `SMTP_USER` est exactement `apikey` (sans guillemets)
- `SMTP_PASSWORD` commence par `SG.`
- Il n'y a pas d'espaces avant/après

### Les emails n'arrivent pas

**Vérifications :**
1. Vérifier le dossier SPAM
2. Vérifier les statistiques SendGrid : https://app.sendgrid.com/statistics
3. Vérifier l'Activity Feed : https://app.sendgrid.com/email_activity

---

## 📚 Ressources

- **Dashboard :** https://app.sendgrid.com/
- **Documentation :** https://docs.sendgrid.com/
- **API Keys :** https://app.sendgrid.com/settings/api_keys
- **Sender Auth :** https://app.sendgrid.com/settings/sender_auth
- **Statistiques :** https://app.sendgrid.com/statistics
- **Support :** https://support.sendgrid.com/

---

## ✅ Checklist finale

- [ ] Compte SendGrid créé
- [ ] Clé API créée et copiée
- [ ] Email expéditeur vérifié
- [ ] `.env` configuré avec la clé API
- [ ] Test réussi avec `node test-sendgrid.js`
- [ ] Serveur redémarré
- [ ] Premier email de test reçu

---

🎉 **Félicitations !** Votre système d'envoi d'emails est maintenant opérationnel !
