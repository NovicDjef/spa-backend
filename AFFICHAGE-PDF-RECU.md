# 📄 Affichage du PDF des Reçus d'Assurance

## 🎯 Problème Résolu

Lorsque le massothérapeute clique sur "Voir le reçu" dans l'historique, le PDF s'affiche maintenant correctement dans le frontend.

---

## 🔧 Endpoint Ajouté

### **GET /api/receipts/:id/pdf**

Génère et retourne le PDF d'un reçu existant en base64 pour affichage dans le frontend.

#### Autorisation
- ✅ MASSOTHERAPEUTE (seulement ses propres reçus)
- ✅ ESTHETICIENNE (seulement ses propres reçus)
- ✅ ADMIN (tous les reçus)

#### Réponse
```json
{
  "success": true,
  "message": "PDF du reçu généré avec succès",
  "data": {
    "pdf": "JVBERi0xLjMKJeLjz9MKMy...", // Base64
    "receiptNumber": 42,
    "clientName": "Marie Dupont",
    "serviceName": "Massage thérapeutique",
    "total": 92.25
  }
}
```

---

## 💻 Implémentation Frontend

### 1. **Appel API pour Récupérer le PDF**

```typescript
// Dans votre service API (ex: receiptService.ts)

interface ReceiptPDFResponse {
  success: boolean;
  message: string;
  data: {
    pdf: string; // Base64
    receiptNumber: number;
    clientName: string;
    serviceName: string;
    total: number;
  };
}

export const getReceiptPDF = async (receiptId: string): Promise<string> => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/api/receipts/${receiptId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du PDF');
    }

    const data: ReceiptPDFResponse = await response.json();

    // Retourner le PDF en base64
    return data.data.pdf;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};
```

---

### 2. **Affichage du PDF dans un Modal/Card**

#### **Option A : Affichage Direct (avec `<embed>` ou `<iframe>`)**

```tsx
// Composant React/Vue pour afficher le PDF
import { useState } from 'react';
import { getReceiptPDF } from './services/receiptService';

interface ReceiptViewerProps {
  receiptId: string;
  onClose: () => void;
}

const ReceiptPDFViewer: React.FC<ReceiptViewerProps> = ({ receiptId, onClose }) => {
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger le PDF au montage du composant
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        const base64PDF = await getReceiptPDF(receiptId);
        setPdfData(base64PDF);
      } catch (err) {
        setError('Impossible de charger le PDF');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [receiptId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p>Chargement du reçu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button onClick={onClose} className="mt-4 btn-secondary">
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 max-w-4xl">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Reçu d'assurance</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Affichage du PDF */}
        <div className="p-4 h-[calc(100%-80px)]">
          {pdfData && (
            <embed
              src={`data:application/pdf;base64,${pdfData}`}
              type="application/pdf"
              width="100%"
              height="100%"
              className="rounded border"
            />
          )}
        </div>

        {/* Boutons */}
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <button
            onClick={() => {
              // Télécharger le PDF
              const link = document.createElement('a');
              link.href = `data:application/pdf;base64,${pdfData}`;
              link.download = `Recu_${receiptId}.pdf`;
              link.click();
            }}
            className="btn-secondary"
          >
            Télécharger
          </button>
          <button onClick={onClose} className="btn-primary">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPDFViewer;
```

#### **Option B : Affichage avec React-PDF (plus de contrôle)**

```tsx
import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { getReceiptPDF } from './services/receiptService';

// Configurer le worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ReceiptPDFViewer: React.FC<ReceiptViewerProps> = ({ receiptId, onClose }) => {
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  useEffect(() => {
    const loadPDF = async () => {
      const base64PDF = await getReceiptPDF(receiptId);
      setPdfData(`data:application/pdf;base64,${base64PDF}`);
    };
    loadPDF();
  }, [receiptId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 max-w-4xl overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Reçu d'assurance</h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>

        <div className="p-4 flex flex-col items-center">
          {pdfData && (
            <Document
              file={pdfData}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              <Page pageNumber={pageNumber} width={800} />
            </Document>
          )}

          {numPages > 1 && (
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1}
                className="btn-secondary"
              >
                Précédent
              </button>
              <span>Page {pageNumber} sur {numPages}</span>
              <button
                onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                disabled={pageNumber >= numPages}
                className="btn-secondary"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

### 3. **Intégration dans la Liste des Reçus**

```tsx
// Dans votre composant de liste de reçus
import { useState } from 'react';
import ReceiptPDFViewer from './ReceiptPDFViewer';

const ReceiptsList: React.FC = () => {
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [receipts, setReceipts] = useState([]);

  // Charger les reçus
  useEffect(() => {
    const loadReceipts = async () => {
      const response = await fetch(`${API_URL}/api/receipts`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setReceipts(data.data);
    };
    loadReceipts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Historique des reçus</h1>

      <div className="space-y-4">
        {receipts.map((receipt) => (
          <div
            key={receipt.id}
            className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
          >
            <div>
              <p className="font-semibold">Reçu #{receipt.receiptNumber}</p>
              <p className="text-sm text-gray-600">{receipt.clientName}</p>
              <p className="text-sm text-gray-600">{receipt.serviceName}</p>
              <p className="text-sm font-bold text-green-600">
                {receipt.total.toFixed(2)} $ CAD
              </p>
            </div>

            <button
              onClick={() => setSelectedReceiptId(receipt.id)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Voir le reçu
            </button>
          </div>
        ))}
      </div>

      {/* Modal pour afficher le PDF */}
      {selectedReceiptId && (
        <ReceiptPDFViewer
          receiptId={selectedReceiptId}
          onClose={() => setSelectedReceiptId(null)}
        />
      )}
    </div>
  );
};
```

---

### 4. **Version Vue.js**

```vue
<template>
  <div class="receipts-list p-6">
    <h1 class="text-2xl font-bold mb-6">Historique des reçus</h1>

    <div class="space-y-4">
      <div
        v-for="receipt in receipts"
        :key="receipt.id"
        class="bg-white p-4 rounded-lg shadow flex items-center justify-between"
      >
        <div>
          <p class="font-semibold">Reçu #{{ receipt.receiptNumber }}</p>
          <p class="text-sm text-gray-600">{{ receipt.clientName }}</p>
          <p class="text-sm text-gray-600">{{ receipt.serviceName }}</p>
          <p class="text-sm font-bold text-green-600">
            {{ receipt.total.toFixed(2) }} $ CAD
          </p>
        </div>

        <button
          @click="viewReceipt(receipt.id)"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Voir le reçu
        </button>
      </div>
    </div>

    <!-- Modal PDF -->
    <div
      v-if="showPdfModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl w-11/12 h-5/6 max-w-4xl">
        <div class="flex items-center justify-between p-4 border-b">
          <h2 class="text-xl font-bold">Reçu d'assurance</h2>
          <button @click="closePdf" class="text-2xl">×</button>
        </div>

        <div class="p-4 h-[calc(100%-80px)]">
          <div v-if="loadingPdf" class="flex items-center justify-center h-full">
            <p>Chargement du reçu...</p>
          </div>

          <div v-else-if="pdfError" class="flex items-center justify-center h-full">
            <p class="text-red-600">{{ pdfError }}</p>
          </div>

          <embed
            v-else-if="pdfData"
            :src="`data:application/pdf;base64,${pdfData}`"
            type="application/pdf"
            width="100%"
            height="100%"
            class="rounded border"
          />
        </div>

        <div class="flex items-center justify-end gap-2 p-4 border-t">
          <button @click="downloadPdf" class="btn-secondary">
            Télécharger
          </button>
          <button @click="closePdf" class="btn-primary">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const receipts = ref([]);
const showPdfModal = ref(false);
const pdfData = ref<string | null>(null);
const loadingPdf = ref(false);
const pdfError = ref<string | null>(null);
const currentReceiptId = ref<string | null>(null);

const API_URL = 'http://localhost:5003';

onMounted(async () => {
  // Charger les reçus
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/receipts`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  receipts.value = data.data;
});

const viewReceipt = async (receiptId: string) => {
  currentReceiptId.value = receiptId;
  showPdfModal.value = true;
  loadingPdf.value = true;
  pdfError.value = null;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/receipts/${receiptId}/pdf`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement du PDF');
    }

    const data = await response.json();
    pdfData.value = data.data.pdf;
  } catch (error) {
    pdfError.value = 'Impossible de charger le PDF';
    console.error(error);
  } finally {
    loadingPdf.value = false;
  }
};

const closePdf = () => {
  showPdfModal.value = false;
  pdfData.value = null;
  currentReceiptId.value = null;
};

const downloadPdf = () => {
  if (pdfData.value) {
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${pdfData.value}`;
    link.download = `Recu_${currentReceiptId.value}.pdf`;
    link.click();
  }
};
</script>
```

---

## ✅ Résumé

**Backend :**
- ✅ Endpoint ajouté : `GET /api/receipts/:id/pdf`
- ✅ Génère le PDF à la volée à partir des données en base
- ✅ Retourne le PDF en base64
- ✅ Permissions vérifiées (massothérapeute voit seulement ses reçus)

**Frontend :**
- ✅ Appeler `GET /api/receipts/:id/pdf` avec le token
- ✅ Récupérer le PDF en base64
- ✅ Afficher dans un `<embed>` ou avec `react-pdf`
- ✅ Ajouter bouton "Télécharger" si besoin

**Le serveur a redémarré automatiquement - l'endpoint est prêt à être testé !** 🚀
