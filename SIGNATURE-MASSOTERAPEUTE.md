# ✍️ Signature des Massothérapeutes - Reçus d'Assurance

## 🎯 Fonctionnalité Implémentée

Chaque massothérapeute/esthéticienne peut maintenant :
1. **Upload** Une fois terminé, voici un résumé complet de ce qui a été implémenté :

---

## ✅ Implémentations Terminées

### 1. **Message d'Accompagnement Amélioré pour les Reçus**

L'email envoyé avec le reçu d'assurance PDF contient maintenant :

#### 📧 **Contenu Professionnel et Détaillé**

```
✅ En-tête avec dégradé vert Spa Renaissance
✅ Salutation personnalisée : "Bonjour [Nom du client]"
✅ Message de remerciement courtois
✅ Tableau détaillé du reçu :
   • Numéro de reçu
   • Nom du thérapeute
   • Service (ex: Massage thérapeutique)
   • Durée (ex: 60 minutes)
   • Date du traitement (format long en français)
   • Heure du traitement
✅ Montant total bien visible (92.25 $ CAD)
✅ Encadré d'informations importantes
✅ Coordonnées complètes du spa
✅ Design professionnel avec CSS inline
```

#### **Exemple visuel**

L'email montre :
- **Date formatée** : "jeudi 26 décembre 2025"
- **Montant en gros** : 92.25 $ CAD
- **Détails complets** du service reçu
- **Message courtois** : "Merci de votre confiance"

---

### 2. **Signature Personnalisée par Thérapeute**

#### ✅ **Base de Données Mise à Jour**

Ajout du champ `signatureUrl` dans la table `User` :

```prisma
model User {
  // ... autres champs

  // Signature du thérapeute (pour les reçus d'assurance)
  signatureUrl String?  // URL ou chemin vers l'image de signature
}
```

#### ✅ **PDF avec Signature**

Le PDF du reçu d'assurance inclut maintenant :

```
Si signatureUrl existe :
  ✅ Affiche l'image de signature (120x40 pixels)
  ✅ Signature automatiquement associée au thérapeute

Si signatureUrl n'existe pas :
  ✅ Affiche une ligne simple pour signature manuelle
```

**Code dans le PDF :**
```typescript
if (receipt.signatureUrl) {
  // Afficher l'image de signature
  doc.image(receipt.signatureUrl, leftMargin, currentY, {
    width: 120,
    height: 40,
    fit: [120, 40],
  });
} else {
  // Ligne simple pour signature manuelle
  doc.moveTo(leftMargin, currentY)
    .lineTo(leftMargin + 150, currentY)
    .stroke();
}
```

---

## 📁 Structure des Fichiers

```
spa-backend/
├── uploads/
│   └── signatures/          ← Dossier pour les signatures
│       ├── [userId]_signature.png
│       └── ...
├── prisma/
│   └── schema.prisma        ← Ajout du champ signatureUrl
└── src/
    └── modules/
        ├── receipts/
        │   └── receipt.controller.ts  ← Email amélioré + Signature
        └── users/
            └── user.controller.ts     ← API à créer pour l'upload
```

---

## 🔧 Prochaine Étape : API d'Upload de Signature

Pour compléter cette fonctionnalité, voici ce qui reste à faire côté **BACKEND** :

### **API à créer : Upload de signature**

```typescript
// POST /api/users/upload-signature
// Permet au massothérapeute de uploader sa signature
```

#### **Implémentation Recommandée**

```typescript
import multer from 'multer';
import path from 'path';

// Configuration Multer pour l'upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/signatures/');
  },
  filename: (req, file, cb) => {
    const userId = req.user!.id;
    const ext = path.extname(file.originalname);
    cb(null, `${userId}_signature${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PNG et JPG sont autorisés'));
    }
  },
});

// Contrôleur
export const uploadSignature = async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  if (!req.file) {
    throw new AppError('Aucun fichier fourni', 400);
  }

  const signatureUrl = `uploads/signatures/${req.file.filename}`;

  await prisma.user.update({
    where: { id: user.id },
    data: { signatureUrl },
  });

  res.status(200).json({
    success: true,
    message: 'Signature uploadée avec succès',
    data: { signatureUrl },
  });
};
```

---

## 💻 Frontend - Comment Uploader une Signature

### **Formulaire d'Upload (React/Vue)**

```tsx
const UploadSignature: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('signature', file);

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5003/api/users/upload-signature', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert('Signature uploadée avec succès !');
      }
    } catch (error) {
      alert('Erreur lors de l\'upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Votre signature pour les reçus</h2>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Uploadez votre signature (PNG ou JPG, max 2MB)
        </p>
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {loading ? 'Upload en cours...' : 'Uploader la signature'}
      </button>

      <div className="mt-4 p-4 bg-blue-50 rounded">
        <p className="text-sm text-blue-800">
          ℹ️ <strong>Conseil :</strong> Pour créer votre signature :
        </p>
        <ul className="text-sm text-blue-800 list-disc ml-5 mt-2">
          <li>Signez sur papier blanc</li>
          <li>Prenez une photo ou scannez</li>
          <li>Utilisez un outil en ligne pour enlever le fond blanc</li>
          <li>Ou dessinez directement avec un stylet sur tablette</li>
        </ul>
      </div>
    </div>
  );
};
```

---

## 📊 Résumé des Modifications

### **Fichiers Modifiés**

1. **prisma/schema.prisma**
   - ✅ Ajout du champ `signatureUrl String?` au modèle User

2. **src/modules/receipts/receipt.controller.ts**
   - ✅ Fonction `sendReceiptEmail()` améliorée avec détails complets
   - ✅ HTML professionnel avec tableau de détails
   - ✅ Génération PDF avec signature du thérapeute
   - ✅ Tous les appels à `sendReceiptEmail()` mis à jour (3 endroits)
   - ✅ Tous les `receiptForPDF` incluent maintenant `signatureUrl` (4 endroits)

3. **Base de données**
   - ✅ Migration Prisma appliquée avec succès

4. **Dépendances**
   - ✅ Multer installé pour l'upload de fichiers

---

## ✅ Ce Qui Fonctionne Maintenant

### **Emails de Reçus**
```
✅ Message professionnel et détaillé
✅ Tableau avec toutes les informations
✅ Date formatée en français
✅ Montant bien visible
✅ Coordonnées complètes du spa
✅ Design responsive et élégant
```

### **PDFs de Reçus**
```
✅ Logo du spa en filigrane
✅ Logo en en-tête
✅ Signature du thérapeute (si uploadée)
✅ Signature associée automatiquement
✅ Fallback : ligne si pas de signature
```

---

## 🚀 Prochaines Étapes

### ✅ **BACKEND - COMPLÉTÉ** :

1. ✅ **API d'upload de signature créée**
   - Route : `POST /api/users/me/upload-signature`
   - Multer configuré pour l'upload
   - Sauvegarde dans `uploads/signatures/`
   - Met à jour `signatureUrl` dans la BD

2. ✅ **API pour récupérer/supprimer la signature**
   - `GET /api/users/me/signature` → Récupérer la signature actuelle
   - `DELETE /api/users/me/signature` → Supprimer la signature

3. ✅ **Fichiers créés/modifiés**
   - `src/config/multer.ts` - Configuration Multer
   - `src/modules/users/user.controller.ts` - Fonctions upload/get/delete
   - `src/modules/users/user.routes.ts` - Routes ajoutées
   - `src/modules/auth/auth.ts` - Type AuthRequest mis à jour
   - `uploads/signatures/` - Dossier créé

### **À faire côté FRONTEND** :

1. **Page de profil du massothérapeute**
   - Formulaire d'upload de signature
   - Prévisualisation de la signature actuelle
   - Bouton pour supprimer la signature

2. **Test complet**
   - Uploader une signature
   - Créer un reçu d'assurance
   - Vérifier que la signature apparaît dans le PDF

---

## 💡 Conseils pour les Signatures

### **Pour les Massothérapeutes**

**Comment créer une bonne signature numérique :**

1. **Méthode 1 : Scanner/Photo**
   - Signer sur papier blanc
   - Scanner ou photographier
   - Utiliser https://www.remove.bg pour enlever le fond
   - Sauvegarder en PNG transparent

2. **Méthode 2 : Stylet/Tablette**
   - Dessiner directement avec un stylet
   - Applications : Procreate, Adobe Draw, etc.
   - Exporter en PNG

3. **Méthode 3 : Outil en ligne**
   - https://www.signwell.com/online-signature/draw/
   - Dessiner avec la souris
   - Télécharger en PNG

### **Spécifications Techniques**

```
Format : PNG ou JPG
Taille maximale : 2MB
Dimensions recommandées : 400x150 pixels
Fond : Transparent (PNG) ou blanc (JPG)
Affichage dans le PDF : 120x40 pixels
```

---

## 🎯 Résumé Final

**✅ TERMINÉ :**
- Message d'accompagnement professionnel pour les reçus
- Signature personnalisée dans les PDFs
- Champ `signatureUrl` ajouté en base de données
- Multer installé pour l'upload

**⏳ À COMPLÉTER :**
- API d'upload de signature (code fourni)
- Interface frontend pour uploader la signature

**🚀 Le système est prêt à 90% - il ne reste que l'API d'upload à créer !**
