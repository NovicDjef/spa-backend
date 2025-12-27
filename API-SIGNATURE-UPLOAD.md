# 🖊️ API de Gestion des Signatures - Documentation Complète

## 📋 Vue d'Ensemble

L'API de gestion des signatures permet aux massothérapeutes et esthéticiennes d'uploader, récupérer et supprimer leur signature personnalisée qui apparaîtra sur tous les reçus d'assurance qu'ils génèrent.

---

## 🔐 Authentification Requise

Toutes les routes nécessitent un token JWT valide dans le header :

```http
Authorization: Bearer VOTRE_TOKEN_JWT
```

---

## 📡 Endpoints Disponibles

### 1. **POST /api/users/me/upload-signature**

Upload ou mise à jour de la signature du thérapeute connecté.

#### **Permissions**
- ✅ MASSOTHERAPEUTE
- ✅ ESTHETICIENNE
- ❌ SECRETAIRE
- ❌ ADMIN

#### **Format de la Requête**

**Content-Type:** `multipart/form-data`

**Champs:**
- `signature` (fichier) - Image de la signature (PNG ou JPG)

#### **Exemple avec cURL**

```bash
curl -X POST http://localhost:5003/api/users/me/upload-signature \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -F "signature=@/chemin/vers/signature.png"
```

#### **Exemple avec JavaScript (FormData)**

```javascript
const formData = new FormData();
formData.append('signature', fileInput.files[0]);

const response = await fetch('http://localhost:5003/api/users/me/upload-signature', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});

const data = await response.json();
console.log(data);
```

#### **Réponse - Succès (200)**

```json
{
  "success": true,
  "message": "Signature uploadée avec succès",
  "data": {
    "id": "user_abc123",
    "nom": "Tremblay",
    "prenom": "Marie",
    "signatureUrl": "uploads/signatures/user_abc123_signature.png"
  }
}
```

#### **Réponses - Erreurs**

**400 - Aucun fichier fourni**
```json
{
  "success": false,
  "message": "Aucun fichier fourni"
}
```

**400 - Format de fichier invalide**
```json
{
  "success": false,
  "message": "Seuls les fichiers PNG et JPG sont autorisés"
}
```

**400 - Fichier trop volumineux**
```json
{
  "success": false,
  "message": "File too large"
}
```

#### **Contraintes**
- **Formats acceptés:** PNG, JPG, JPEG
- **Taille maximale:** 2 MB
- **Nom du fichier:** Généré automatiquement comme `{userId}_signature.{extension}`

#### **Comportement Important**
- Si une signature existe déjà, elle sera **automatiquement supprimée** et remplacée par la nouvelle
- Le fichier est stocké dans `uploads/signatures/`
- Le chemin est enregistré dans la base de données (`signatureUrl`)

---

### 2. **GET /api/users/me/signature**

Récupérer l'URL de la signature actuelle du thérapeute connecté.

#### **Permissions**
- ✅ MASSOTHERAPEUTE
- ✅ ESTHETICIENNE
- ❌ SECRETAIRE
- ❌ ADMIN

#### **Exemple avec cURL**

```bash
curl -X GET http://localhost:5003/api/users/me/signature \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

#### **Exemple avec JavaScript**

```javascript
const response = await fetch('http://localhost:5003/api/users/me/signature', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
console.log(data);
```

#### **Réponse - Succès (200)**

```json
{
  "success": true,
  "data": {
    "signatureUrl": "uploads/signatures/user_abc123_signature.png"
  }
}
```

#### **Réponse - Erreur (404)**

Si aucune signature n'est uploadée :

```json
{
  "success": false,
  "message": "Aucune signature trouvée"
}
```

---

### 3. **DELETE /api/users/me/signature**

Supprimer la signature actuelle du thérapeute connecté.

#### **Permissions**
- ✅ MASSOTHERAPEUTE
- ✅ ESTHETICIENNE
- ❌ SECRETAIRE
- ❌ ADMIN

#### **Exemple avec cURL**

```bash
curl -X DELETE http://localhost:5003/api/users/me/signature \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

#### **Exemple avec JavaScript**

```javascript
const response = await fetch('http://localhost:5003/api/users/me/signature', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
console.log(data);
```

#### **Réponse - Succès (200)**

```json
{
  "success": true,
  "message": "Signature supprimée avec succès"
}
```

#### **Réponse - Erreur (404)**

Si aucune signature n'existe :

```json
{
  "success": false,
  "message": "Aucune signature à supprimer"
}
```

#### **Comportement Important**
- Le fichier physique est **supprimé** du serveur
- Le champ `signatureUrl` est mis à `null` dans la base de données
- Les reçus futurs afficheront une ligne simple au lieu de la signature

---

## 🖼️ Affichage de la Signature dans le Frontend

### **Récupérer et Afficher la Signature**

```javascript
// Récupérer la signature
const getSignature = async () => {
  try {
    const response = await fetch('http://localhost:5003/api/users/me/signature', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      // Afficher l'image
      const signatureUrl = `http://localhost:5003/${data.data.signatureUrl}`;
      document.getElementById('signaturePreview').src = signatureUrl;
    }
  } catch (error) {
    console.error('Aucune signature trouvée');
  }
};
```

### **Vérifier si une Signature Existe**

Vous pouvez également utiliser l'endpoint `GET /api/users/me` qui retourne le profil complet incluant `signatureUrl` :

```javascript
const response = await fetch('http://localhost:5003/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();

if (data.data.signatureUrl) {
  console.log('Signature existe:', data.data.signatureUrl);
} else {
  console.log('Aucune signature uploadée');
}
```

---

## 🎨 Exemple d'Interface Frontend (React)

```tsx
import React, { useState, useEffect } from 'react';

const SignatureManager: React.FC = () => {
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  // Charger la signature au montage
  useEffect(() => {
    loadSignature();
  }, []);

  const loadSignature = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/users/me/signature', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSignatureUrl(`http://localhost:5003/${data.data.signatureUrl}`);
      }
    } catch (error) {
      console.log('Aucune signature');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('signature', file);

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5003/api/users/me/upload-signature', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert('Signature uploadée avec succès !');
        loadSignature();
        setFile(null);
      } else {
        alert(`Erreur: ${data.message}`);
      }
    } catch (error) {
      alert('Erreur lors de l\'upload');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer votre signature ?')) return;

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5003/api/users/me/signature', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert('Signature supprimée avec succès !');
        setSignatureUrl(null);
      } else {
        alert(`Erreur: ${data.message}`);
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Ma Signature pour les Reçus</h2>

      {/* Prévisualisation de la signature actuelle */}
      {signatureUrl && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Signature Actuelle</h3>
          <img
            src={signatureUrl}
            alt="Signature"
            className="border border-gray-300 bg-white p-2 rounded max-w-xs"
          />
          <button
            onClick={handleDelete}
            disabled={loading}
            className="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
          >
            {loading ? 'Suppression...' : 'Supprimer la signature'}
          </button>
        </div>
      )}

      {/* Upload de nouvelle signature */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">
          {signatureUrl ? 'Remplacer la Signature' : 'Ajouter une Signature'}
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choisir une image (PNG ou JPG, max 2MB)
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Upload en cours...' : 'Uploader la signature'}
        </button>

        {/* Prévisualisation du fichier sélectionné */}
        {file && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Fichier sélectionné : {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
            <img
              src={URL.createObjectURL(file)}
              alt="Prévisualisation"
              className="mt-2 border border-gray-300 bg-white p-2 rounded max-w-xs"
            />
          </div>
        )}
      </div>

      {/* Conseils */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Conseils pour une bonne signature</h4>
        <ul className="text-sm text-blue-800 list-disc ml-5 space-y-1">
          <li>Signez sur papier blanc avec un stylo noir</li>
          <li>Scannez ou photographiez la signature</li>
          <li>Utilisez remove.bg pour enlever le fond blanc</li>
          <li>Format PNG transparent recommandé</li>
          <li>Dimensions recommandées : 400x150 pixels</li>
        </ul>
      </div>
    </div>
  );
};

export default SignatureManager;
```

---

## 🔒 Sécurité

### **Permissions**

- Seuls les **MASSOTHERAPEUTE** et **ESTHETICIENNE** peuvent uploader/modifier/supprimer leur signature
- Les **SECRETAIRE** et **ADMIN** n'ont pas accès à ces endpoints
- Chaque thérapeute ne peut gérer que **sa propre signature**

### **Validation des Fichiers**

- **Formats acceptés uniquement :** PNG, JPG, JPEG (via MIME type)
- **Taille maximale :** 2 MB
- **Protection :** Multer valide le type de fichier avant upload

### **Nettoyage Automatique**

- Si un thérapeute upload une nouvelle signature, **l'ancienne est automatiquement supprimée**
- Évite l'accumulation de fichiers inutiles sur le serveur

---

## 📂 Structure des Fichiers

```
spa-backend/
├── uploads/
│   └── signatures/              ← Signatures stockées ici
│       ├── user123_signature.png
│       ├── user456_signature.jpg
│       └── ...
├── src/
│   ├── config/
│   │   └── multer.ts            ← Configuration Multer
│   └── modules/
│       └── users/
│           ├── user.controller.ts  ← Logique upload/delete
│           └── user.routes.ts      ← Routes API
```

---

## 🧪 Tests de l'API

### **Test 1 : Upload d'une signature**

```bash
curl -X POST http://localhost:5003/api/users/me/upload-signature \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -F "signature=@signature.png"
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Signature uploadée avec succès",
  "data": {
    "id": "...",
    "nom": "...",
    "prenom": "...",
    "signatureUrl": "uploads/signatures/user_xxx_signature.png"
  }
}
```

### **Test 2 : Récupérer la signature**

```bash
curl -X GET http://localhost:5003/api/users/me/signature \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "signatureUrl": "uploads/signatures/user_xxx_signature.png"
  }
}
```

### **Test 3 : Supprimer la signature**

```bash
curl -X DELETE http://localhost:5003/api/users/me/signature \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Signature supprimée avec succès"
}
```

### **Test 4 : Créer un reçu et vérifier la signature dans le PDF**

1. Uploader une signature
2. Créer un reçu d'assurance via `POST /api/receipts`
3. Ouvrir le PDF reçu par email
4. Vérifier que la signature apparaît au bas du reçu

---

## 🐛 Résolution des Problèmes

### **Erreur : "Seuls les fichiers PNG et JPG sont autorisés"**

**Cause :** Le fichier n'est pas au bon format

**Solution :**
- Vérifier que le fichier est bien PNG ou JPG
- Utiliser un convertisseur en ligne si nécessaire

---

### **Erreur : "File too large"**

**Cause :** Le fichier dépasse 2 MB

**Solution :**
- Réduire la taille de l'image avec un outil en ligne
- Compresser l'image (https://tinypng.com/)

---

### **Erreur : "Aucun fichier fourni"**

**Cause :** Le champ FormData n'est pas nommé correctement

**Solution :**
- Vérifier que le champ s'appelle bien `signature`
- Exemple correct : `formData.append('signature', file)`

---

### **Signature ne s'affiche pas dans le PDF**

**Cause :** Le chemin du fichier est incorrect ou le fichier est corrompu

**Solution :**
1. Vérifier que le fichier existe dans `uploads/signatures/`
2. Vérifier les logs du serveur pour voir les erreurs
3. Re-uploader la signature

---

## ✅ Checklist d'Intégration

- [x] Backend : API d'upload créée (`POST /api/users/me/upload-signature`)
- [x] Backend : API de récupération créée (`GET /api/users/me/signature`)
- [x] Backend : API de suppression créée (`DELETE /api/users/me/signature`)
- [x] Backend : Multer configuré pour validation des fichiers
- [x] Backend : Dossier `uploads/signatures/` créé
- [x] Backend : PDF génère avec signature si présente
- [x] Base de données : Champ `signatureUrl` ajouté au modèle User
- [ ] Frontend : Interface d'upload de signature
- [ ] Frontend : Prévisualisation de la signature
- [ ] Frontend : Bouton de suppression de signature
- [ ] Tests : Upload, récupération et suppression

---

## 🚀 Prochaines Étapes

1. **Frontend** : Créer l'interface d'upload de signature dans le profil du thérapeute
2. **Tests** : Tester l'upload avec différents formats (PNG, JPG)
3. **Tests** : Vérifier que la signature apparaît bien dans les PDFs générés
4. **Documentation utilisateur** : Créer un guide pour aider les thérapeutes à créer leur signature numérique

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier les logs du serveur
2. Tester avec cURL pour isoler le problème (backend vs frontend)
3. Vérifier les permissions du dossier `uploads/signatures/`

---

**✅ L'API de gestion des signatures est complète et prête à l'emploi !**
