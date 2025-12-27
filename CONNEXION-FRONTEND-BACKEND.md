# 🔗 Guide de Connexion Frontend-Backend

Ce guide explique comment connecter votre frontend Next.js au backend Node.js/Express.

## 📋 Architecture

```
┌─────────────────┐         HTTP/REST API         ┌─────────────────┐
│                 │ ◄──────────────────────────► │                 │
│  Frontend       │         Port 3000             │   Backend       │
│  Next.js        │         Port 5000             │   Express.js    │
│                 │                                │                 │
└─────────────────┘                                └────────┬────────┘
                                                            │
                                                            ▼
                                                   ┌─────────────────┐
                                                   │   PostgreSQL    │
                                                   │   Database      │
                                                   └─────────────────┘
```

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend

```bash
cd spa-backend
npm install
cp .env.example .env
# Configurer DATABASE_URL dans .env
npx prisma generate
npx prisma db push
npm run prisma:seed  # Créer des données de test
npm run dev          # Démarre sur http://localhost:5000
```

### 2. Démarrer le Frontend

```bash
cd spa-frontend
npm install
npm run dev          # Démarre sur http://localhost:3000
```

## 🔧 Configuration Frontend

### Créer le fichier `.env.local` dans le frontend

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Pour la production
# NEXT_PUBLIC_API_URL=https://votre-api.com/api
```

### Créer un service API (`src/services/api.ts`)

```typescript
// src/services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Fonction helper pour les requêtes
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Une erreur est survenue');
  }

  return data;
}

// Services
export const authService = {
  async login(email: string, password: string) {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data.data;
  },

  async register(userData: any) {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export const clientService = {
  async createClient(clientData: any) {
    return fetchAPI('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },

  async getClients(params?: { search?: string; serviceType?: string; page?: number }) {
    const queryString = new URLSearchParams(params as any).toString();
    return fetchAPI(`/clients${queryString ? `?${queryString}` : ''}`);
  },

  async getClientById(id: string) {
    return fetchAPI(`/clients/${id}`);
  },

  async updateClient(id: string, data: any) {
    return fetchAPI(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteClient(id: string) {
    return fetchAPI(`/clients/${id}`, {
      method: 'DELETE',
    });
  },

  async searchClients(query: string) {
    return fetchAPI(`/clients/search/${query}`);
  },
};

export const noteService = {
  async getNotesByClient(clientId: string) {
    return fetchAPI(`/notes/${clientId}`);
  },

  async createNote(clientId: string, content: string) {
    return fetchAPI(`/notes/${clientId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async updateNote(noteId: string, content: string) {
    return fetchAPI(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  async deleteNote(noteId: string) {
    return fetchAPI(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  },
};

export const traitementService = {
  async getTraitementsByClient(clientId: string) {
    return fetchAPI(`/traitements/${clientId}`);
  },

  async createTraitement(clientId: string, data: any) {
    return fetchAPI(`/traitements/${clientId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTraitement(traitementId: string, data: any) {
    return fetchAPI(`/traitements/${traitementId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTraitement(traitementId: string) {
    return fetchAPI(`/traitements/${traitementId}`, {
      method: 'DELETE',
    });
  },
};
```

## 📝 Exemples d'Utilisation

### Exemple 1: Créer un client (formulaire)

```typescript
// Dans votre composant de formulaire
import { clientService } from '@/services/api';

const handleSubmit = async (formData) => {
  try {
    const response = await clientService.createClient(formData);
    console.log('Client créé:', response.data);
    router.push('/client/confirmation');
  } catch (error) {
    console.error('Erreur:', error.message);
    alert(error.message);
  }
};
```

### Exemple 2: Connexion professionnel

```typescript
// Page de connexion
import { authService } from '@/services/api';

const handleLogin = async (e) => {
  e.preventDefault();
  
  try {
    const data = await authService.login(email, password);
    console.log('Connecté:', data.user);
    router.push('/professionnel/dashboard');
  } catch (error) {
    setError(error.message);
  }
};
```

### Exemple 3: Récupérer la liste des clients

```typescript
// Dashboard professionnel
import { clientService } from '@/services/api';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await clientService.getClients();
      setClients(response.data.clients);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      {clients.map((client) => (
        <div key={client.id}>
          {client.prenom} {client.nom}
        </div>
      ))}
    </div>
  );
}
```

### Exemple 4: Ajouter une note

```typescript
// Composant de détail client
import { noteService } from '@/services/api';

const handleAddNote = async () => {
  try {
    const response = await noteService.createNote(clientId, noteContent);
    console.log('Note ajoutée:', response.data);
    // Recharger les notes
    loadNotes();
  } catch (error) {
    alert(error.message);
  }
};
```

## 🔐 Gestion de l'Authentification

### Créer un Context d'authentification

```typescript
// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/api';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = authService.getUser();
    setUser(storedUser);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser(data.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
}
```

### Protection des routes

```typescript
// src/components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/professionnel/connexion');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Chargement...</div>;
  }

  return <>{children}</>;
}
```

## 🐛 Gestion des Erreurs

### Créer un composant d'erreur

```typescript
// src/components/ErrorMessage.tsx
export function ErrorMessage({ error }: { error: string | null }) {
  if (!error) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
      {error}
    </div>
  );
}
```

## 🚀 Déploiement

### Backend (Heroku)

```bash
cd spa-backend
heroku create votre-app-backend
heroku addons:create heroku-postgresql
heroku config:set JWT_SECRET=votre_secret
heroku config:set FRONTEND_URL=https://votre-frontend.vercel.app
git push heroku main
```

### Frontend (Vercel)

```bash
cd spa-frontend
vercel
# Configurer la variable NEXT_PUBLIC_API_URL dans Vercel
```

## ✅ Checklist de Connexion

- [ ] Backend démarré sur le port 5000
- [ ] Frontend démarré sur le port 3000
- [ ] CORS configuré dans le backend
- [ ] Variable NEXT_PUBLIC_API_URL configurée
- [ ] Service API créé dans le frontend
- [ ] Test de création d'un client
- [ ] Test de connexion professionnel
- [ ] Test de récupération des clients
- [ ] Test d'ajout de notes

## 🎯 Prochaines Étapes

1. Tester toutes les routes API avec Postman
2. Implémenter la page de connexion dans le frontend
3. Implémenter le dashboard professionnel
4. Implémenter la page de détail client
5. Implémenter l'ajout de notes
6. Ajouter la gestion des erreurs globale
7. Optimiser les performances (React Query)

---

Votre backend et frontend sont maintenant connectés! 🎉
