# ✅ Configuration SendGrid - Spa Renaissance

## 🔑 Clé API Configurée

La clé API SendGrid a été ajoutée dans le fichier `.env` :

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxx
SMTP_FROM=info@sparenaissance.ca
```

---

## ⚠️ IMPORTANT - Sécurité

**Votre clé API a été partagée en clair dans notre conversation.**

Pour des raisons de sécurité, vous devriez :

1. **Regénérer cette clé API** après avoir testé le système
2. **Ne JAMAIS partager de clés API** en clair (chat, email, etc.)
3. **Utiliser des variables d'environnement** (.env) qui ne sont jamais commitées dans Git

### Comment Regénérer la Clé API (après test)

1. Aller sur https://app.sendgrid.com/settings/api_keys
2. Cliquer sur la clé actuelle → "Delete"
3. Créer une nouvelle clé API avec les mêmes permissions
4. Copier la nouvelle clé dans `.env` → `SMTP_PASSWORD`

---

## 📧 Étapes Supplémentaires dans SendGrid

### 1. **Vérifier l'Adresse Email d'Envoi**

SendGrid requiert que vous vérifiez l'adresse email `info@sparenaissance.ca` :

#### **Option A : Single Sender Verification (Recommandé pour débuter)**

1. Aller sur https://app.sendgrid.com/settings/sender_auth/senders
2. Cliquer sur **"Create New Sender"**
3. Remplir :
   ```
   From Name: Spa Renaissance
   From Email Address: info@sparenaissance.ca
   Reply To: info@sparenaissance.ca
   Company: Spa Renaissance
   Address: 451 avenue Arnaud, suite 101
   City: Sept-Îles
   State/Province: Québec
   Zip Code: G4R 3B3
   Country: Canada
   ```
4. Cliquer sur **"Create"**
5. **Vérifier votre email** : SendGrid enverra un email de confirmation à `info@sparenaissance.ca`
6. Cliquer sur le lien de vérification dans l'email

#### **Option B : Domain Authentication (Recommandé pour production)**

Si vous avez accès au DNS de `sparenaissance.com` :

1. Aller sur https://app.sendgrid.com/settings/sender_auth
2. Cliquer sur **"Authenticate Your Domain"**
3. Suivre les instructions pour ajouter les enregistrements DNS
4. Une fois validé, tous les emails de `@sparenaissance.com` seront autorisés

---

### 2. **Vérifier les Permissions de l'API Key**

1. Aller sur https://app.sendgrid.com/settings/api_keys
2. Cliquer sur votre clé API
3. Vérifier que **"Mail Send"** est activé avec **"Full Access"**

---

## 🧪 Tester l'Envoi d'Emails

### Test 1 : Email de Reçu d'Assurance

1. **Créer un reçu** via l'API :

```bash
curl -X POST http://localhost:5003/api/receipts/send \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "ID_DU_CLIENT",
    "serviceName": "Massage thérapeutique",
    "duration": 60,
    "treatmentDate": "2025-12-26",
    "treatmentTime": "14:00"
  }'
```

2. **Vérifier** :
   - Le client devrait recevoir un email avec le reçu PDF en pièce jointe
   - Vérifier dans les logs du serveur : `✅ Email envoyé avec succès`
   - Si erreur, vérifier dans SendGrid Activity Feed

---

### Test 2 : Email de Suivi Client (avec IA)

1. **Ajouter une note** à un dossier client :

```bash
curl -X POST http://localhost:5003/api/notes/ID_DU_CLIENT \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Client présentait des tensions importantes dans le haut du dos. Massage thérapeutique de 60 minutes effectué avec succès. Client très satisfait."
  }'
```

2. **Vérifier** :
   - Le client devrait recevoir un email de suivi personnalisé (généré par ChatGPT)
   - Email contient le logo du Spa Renaissance
   - Email contient le lien vers https://dospa.novic.dev/avis
   - Logs : `📧 Génération du message de suivi...` puis `✅ Email de suivi envoyé`

---

## 📊 Monitoring des Emails

### SendGrid Activity Feed

Pour voir tous les emails envoyés :

1. Aller sur https://app.sendgrid.com/email_activity
2. Vous verrez :
   - **Processed** : Email accepté par SendGrid
   - **Delivered** : Email délivré avec succès
   - **Bounce** : Email rejeté (adresse invalide)
   - **Opened** : Email ouvert par le destinataire
   - **Clicked** : Lien dans l'email cliqué

---

## ❌ Résolution des Erreurs Courantes

### Erreur 1 : "Sender identity pending verification"

**Problème** : L'adresse email d'envoi n'est pas vérifiée

**Solution** :
1. Vérifier que `info@sparenaissance.ca` existe et que vous avez accès
2. Compléter la vérification Single Sender (voir étape 1 ci-dessus)
3. Cliquer sur le lien dans l'email de SendGrid

---

### Erreur 2 : "Invalid API key"

**Problème** : La clé API est incorrecte ou expirée

**Solution** :
1. Vérifier que la clé commence par `SG.`
2. Vérifier qu'il n'y a pas d'espaces avant/après dans `.env`
3. Regénérer une nouvelle clé API si nécessaire

---

### Erreur 3 : "Connection timeout" ou "SMTP error"

**Problème** : Problème de connexion SMTP

**Solution** :
1. Vérifier que `SMTP_PORT=587` (pas 465)
2. Vérifier que `SMTP_USER=apikey` (exactement ce mot)
3. Vérifier le pare-feu ou antivirus qui pourrait bloquer le port 587

---

### Erreur 4 : Email non reçu mais aucune erreur

**Problème** : Email envoyé mais bloqué par le spam

**Solution** :
1. Vérifier les dossiers spam/courrier indésirable
2. Compléter l'authentification de domaine (Domain Authentication)
3. Vérifier dans SendGrid Activity Feed le statut

---

## 📝 Logs à Surveiller

### Logs de Succès

**Reçu d'assurance :**
```
✅ Email envoyé avec succès
```

**Email de suivi :**
```
📧 Génération du message de suivi pour Marie Dupont...
✅ Email de suivi envoyé à Marie Dupont (marie@example.com)
```

### Logs d'Erreur

```
❌ Erreur lors de l'envoi de l'email : [détails]
```

Si vous voyez cette erreur :
1. Copier le message d'erreur complet
2. Vérifier dans SendGrid Activity Feed
3. Vérifier que l'adresse email est vérifiée

---

## 🔍 Checklist de Configuration

- ✅ Clé API SendGrid ajoutée dans `.env`
- ⏳ **À FAIRE** : Vérifier l'adresse `info@sparenaissance.ca` dans SendGrid (Single Sender)
- ⏳ **À FAIRE** : Tester l'envoi d'un reçu d'assurance
- ⏳ **À FAIRE** : Tester l'envoi d'un email de suivi client
- ⏳ **À FAIRE** : Vérifier les emails dans SendGrid Activity Feed
- ⏳ **APRÈS TEST** : Regénérer la clé API pour sécurité

---

## 🚀 Prochaines Étapes

1. **Vérifier `info@sparenaissance.ca`** dans SendGrid (Single Sender Verification)
2. **Tester** l'envoi d'un reçu d'assurance
3. **Tester** l'envoi d'un email de suivi client
4. **Vérifier** dans SendGrid Activity Feed que les emails sont bien délivrés
5. **Regénérer** la clé API pour sécurité (après test)

---

## 📞 Support

- **SendGrid Docs** : https://docs.sendgrid.com/
- **Support SendGrid** : https://support.sendgrid.com/
- **Status SendGrid** : https://status.sendgrid.com/

---

**✅ SendGrid est configuré ! Il ne reste qu'à vérifier l'adresse email et tester l'envoi.**
