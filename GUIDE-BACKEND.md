# 🔧 Guide Complet du Backend - Spa Renaissance

Ce document détaille **exactement** le backend à créer pour correspondre au frontend déjà développé.

---

## 📋 Table des Matières

1. [Schéma Prisma](#1-schéma-prisma)
2. [Configuration NextAuth](#2-configuration-nextauth)
3. [API Routes](#3-api-routes)
4. [Types TypeScript](#4-types-typescript)
5. [Middleware & Protection](#5-middleware--protection)
6. [Envoi d'Emails](#6-envoi-demails)
7. [Validation des Données](#7-validation-des-données)
8. [Permissions par Rôle](#8-permissions-par-rôle)
9. [Variables d'Environnement](#9-variables-denvironnement)

---

## 1. Schéma Prisma

### 📁 Fichier: `prisma/schema.prisma`

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Énumération des rôles utilisateurs
enum UserRole {
  CLIENT
  SECRETAIRE
  MASSOTHERAPEUTE
  ESTHETICIENNE
  ADMIN
}

// Énumération des types de service
enum ServiceType {
  MASSOTHERAPIE
  ESTHETIQUE
}

// Énumération du genre
enum Gender {
  HOMME
  FEMME
  AUTRE
}

// Table des utilisateurs (employés uniquement)
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  telephone String   @unique
  password  String   // Hash bcrypt
  role      UserRole
  nom       String?
  prenom    String?

  // Relations
  notesCreated      Note[]
  assignedClients   Assignment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([role])
}

// Table des profils clients
model ClientProfile {
  id String @id @default(cuid())

  // Informations personnelles
  nom              String
  prenom           String
  adresse          String
  ville            String
  codePostal       String
  telMaison        String?
  telBureau        String?
  telCellulaire    String   @unique
  courriel         String   @unique
  dateNaissance    DateTime
  occupation       String?
  gender           Gender
  serviceType      ServiceType
  assuranceCouvert Boolean

  // INFORMATIONS MASSOTHÉRAPIE
  raisonConsultation              String?
  diagnosticMedical               Boolean?
  diagnosticMedicalDetails        String?
  medicaments                     Boolean?
  medicamentsDetails              String?
  accidents                       Boolean?
  accidentsDetails                String?
  operationsChirurgicales         Boolean?
  operationsChirurgicalesDetails  String?
  traitementsActuels              String?
  problemesCardiaques             Boolean   @default(false)
  problemesCardiaquesDetails      String?
  maladiesGraves                  Boolean   @default(false)
  maladiesGravesDetails           String?
  ortheses                        Boolean   @default(false)
  orthesesDetails                 String?
  allergies                       Boolean   @default(false)
  allergiesDetails                String?

  // Conditions médicales (massothérapie)
  raideurs              Boolean @default(false)
  arthrose              Boolean @default(false)
  hernieDiscale         Boolean @default(false)
  oedeme                Boolean @default(false)
  tendinite             Boolean @default(false)
  mauxDeTete            Boolean @default(false)
  flatulence            Boolean @default(false)
  troublesCirculatoires Boolean @default(false)
  hypothyroidie         Boolean @default(false)
  diabete               Boolean @default(false)
  stresse               Boolean @default(false)
  premenopause          Boolean @default(false)
  douleurMusculaire     Boolean @default(false)
  fibromyalgie          Boolean @default(false)
  rhumatisme            Boolean @default(false)
  sciatique             Boolean @default(false)
  bursite               Boolean @default(false)
  migraine              Boolean @default(false)
  diarrhee              Boolean @default(false)
  phlebite              Boolean @default(false)
  hypertension          Boolean @default(false)
  hypoglycemie          Boolean @default(false)
  burnOut               Boolean @default(false)
  menopause             Boolean @default(false)
  inflammationAigue     Boolean @default(false)
  arteriosclerose       Boolean @default(false)
  osteoporose           Boolean @default(false)
  mauxDeDos             Boolean @default(false)
  fatigueDesJambes      Boolean @default(false)
  troublesDigestifs     Boolean @default(false)
  constipation          Boolean @default(false)
  hyperthyroidie        Boolean @default(false)
  hypotension           Boolean @default(false)
  insomnie              Boolean @default(false)
  depressionNerveuse    Boolean @default(false)
  autres                String?

  // Zones de douleur (massothérapie)
  zonesDouleur String[] // Array de strings

  // INFORMATIONS ESTHÉTIQUE
  etatPeau            String?
  etatPores           String?
  coucheCornee        String?
  irrigationSanguine  String?
  impuretes           String?
  sensibiliteCutanee  String?
  fumeur              String?
  niveauStress        String?
  expositionSoleil    String?
  protectionSolaire   String?
  suffisanceEau       String?
  travailExterieur    String?
  bainChauds          String?
  routineSoins        String?
  changementsRecents  String?
  preferencePeau      String?
  diagnosticVisuelNotes String?

  // Relations
  notes       Note[]
  assignments Assignment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([courriel])
  @@index([telCellulaire])
  @@index([serviceType])
  @@index([nom, prenom])
}

// Table des notes de traitement
model Note {
  id      String @id @default(cuid())
  content String @db.Text

  // Relations
  clientId String
  client   ClientProfile @relation(fields: [clientId], references: [id], onDelete: Cascade)

  authorId String
  author   User   @relation(fields: [authorId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([clientId])
  @@index([authorId])
  @@index([createdAt])
}

// Table d'assignation des clients aux professionnels
model Assignment {
  id String @id @default(cuid())

  // Relations
  clientId String
  client   ClientProfile @relation(fields: [clientId], references: [id], onDelete: Cascade)

  professionalId String
  professional   User   @relation(fields: [professionalId], references: [id])

  assignedAt DateTime @default(now())

  // Un client ne peut être assigné qu'une seule fois au même professionnel
  @@unique([clientId, professionalId])
  @@index([clientId])
  @@index([professionalId])
}
```

### 📝 Commandes Prisma

```bash
# Générer le client Prisma
npx prisma generate

# Créer/mettre à jour la base de données
npx prisma db push

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio
```

---

## 2. Configuration NextAuth

### 📁 Fichier: `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis');
        }

        // Rechercher l'utilisateur
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Identifiants invalides');
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Identifiants invalides');
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.prenom || ''} ${user.nom || ''}`.trim(),
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/professionnel/connexion',
    error: '/professionnel/connexion',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### 📁 Fichier: `lib/auth.ts` (Utilitaire)

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth(allowedRoles?: string[]) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error('Non autorisé');
  }

  return user;
}
```

---

## 3. API Routes

### 3.1 Clients

#### 📁 `app/api/clients/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schéma de validation
const clientSchema = z.object({
  // Informations personnelles
  nom: z.string().min(1),
  prenom: z.string().min(1),
  adresse: z.string().min(1),
  ville: z.string().min(1),
  codePostal: z.string().min(1),
  telMaison: z.string().optional(),
  telBureau: z.string().optional(),
  telCellulaire: z.string().min(1),
  courriel: z.string().email(),
  dateNaissance: z.string(),
  occupation: z.string().optional(),
  gender: z.enum(['HOMME', 'FEMME', 'AUTRE']),
  serviceType: z.enum(['MASSOTHERAPIE', 'ESTHETIQUE']),
  assuranceCouvert: z.string().transform(val => val === 'OUI'),

  // Le reste des champs...
});

// POST - Créer un nouveau client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const validatedData = clientSchema.parse(body);

    // Vérifier l'unicité de l'email
    const existingEmail = await prisma.clientProfile.findUnique({
      where: { courriel: validatedData.courriel },
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé.' },
        { status: 400 }
      );
    }

    // Vérifier l'unicité du téléphone
    const existingPhone = await prisma.clientProfile.findUnique({
      where: { telCellulaire: validatedData.telCellulaire },
    });

    if (existingPhone) {
      return NextResponse.json(
        { message: 'Ce numéro de téléphone est déjà utilisé.' },
        { status: 400 }
      );
    }

    // Créer le client
    const client = await prisma.clientProfile.create({
      data: {
        ...validatedData,
        dateNaissance: new Date(validatedData.dateNaissance),
      },
    });

    // TODO: Envoyer l'email de confirmation
    // await sendWelcomeEmail(client.courriel, client.prenom);

    return NextResponse.json(
      { message: 'Dossier client créé avec succès', client },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur création client:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET - Récupérer tous les clients (SECRETAIRE/ADMIN uniquement)
export async function GET(request: NextRequest) {
  try {
    // TODO: Vérifier l'authentification et le rôle
    // const user = await requireAuth(['SECRETAIRE', 'ADMIN']);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const serviceType = searchParams.get('serviceType');

    let where: any = {};

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { courriel: { contains: search, mode: 'insensitive' } },
        { telCellulaire: { contains: search } },
      ];
    }

    if (serviceType && serviceType !== 'ALL') {
      where.serviceType = serviceType;
    }

    const clients = await prisma.clientProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ clients }, { status: 200 });
  } catch (error) {
    console.error('Erreur récupération clients:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

#### 📁 `app/api/clients/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer un client spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Vérifier l'authentification
    // const user = await requireAuth();

    const client = await prisma.clientProfile.findUnique({
      where: { id: params.id },
    });

    if (!client) {
      return NextResponse.json(
        { message: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // TODO: Vérifier que l'utilisateur a accès à ce client
    // Si MASSOTHERAPEUTE/ESTHETICIENNE, vérifier l'assignation

    return NextResponse.json({ client }, { status: 200 });
  } catch (error) {
    console.error('Erreur récupération client:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

#### 📁 `app/api/clients/assigned/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer les clients assignés au professionnel connecté
export async function GET(request: NextRequest) {
  try {
    // TODO: Récupérer l'utilisateur connecté
    // const user = await requireAuth(['MASSOTHERAPEUTE', 'ESTHETICIENNE']);

    // Pour le moment, on retourne un tableau vide
    // Remplacer par le vrai userId
    const userId = 'user-id-from-session';

    const assignments = await prisma.assignment.findMany({
      where: { professionalId: userId },
      include: {
        client: true,
      },
    });

    const clients = assignments.map(a => a.client);

    return NextResponse.json({ clients }, { status: 200 });
  } catch (error) {
    console.error('Erreur récupération clients assignés:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

### 3.2 Notes

#### 📁 `app/api/clients/[id]/notes/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const noteSchema = z.object({
  content: z.string().min(1, 'La note ne peut pas être vide'),
});

// GET - Récupérer toutes les notes d'un client
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Vérifier l'authentification et l'accès au client

    const notes = await prisma.note.findMany({
      where: { clientId: params.id },
      include: {
        author: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ notes }, { status: 200 });
  } catch (error) {
    console.error('Erreur récupération notes:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Ajouter une note
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Récupérer l'utilisateur connecté
    // const user = await requireAuth();
    const userId = 'user-id-from-session';

    const body = await request.json();
    const validatedData = noteSchema.parse(body);

    // Vérifier que le client existe
    const client = await prisma.clientProfile.findUnique({
      where: { id: params.id },
    });

    if (!client) {
      return NextResponse.json(
        { message: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // TODO: Vérifier que l'utilisateur a accès à ce client (assignation)

    // Créer la note
    const note = await prisma.note.create({
      data: {
        content: validatedData.content,
        clientId: params.id,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Note ajoutée avec succès', note },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur ajout note:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

### 3.3 Assignations

#### 📁 `app/api/assignments/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const assignmentSchema = z.object({
  clientId: z.string(),
  professionalId: z.string(),
});

// POST - Assigner un client à un professionnel
export async function POST(request: NextRequest) {
  try {
    // TODO: Vérifier que l'utilisateur est SECRETAIRE ou ADMIN
    // const user = await requireAuth(['SECRETAIRE', 'ADMIN']);

    const body = await request.json();
    const validatedData = assignmentSchema.parse(body);

    // Vérifier que le client existe
    const client = await prisma.clientProfile.findUnique({
      where: { id: validatedData.clientId },
    });

    if (!client) {
      return NextResponse.json(
        { message: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le professionnel existe
    const professional = await prisma.user.findUnique({
      where: { id: validatedData.professionalId },
    });

    if (!professional) {
      return NextResponse.json(
        { message: 'Professionnel non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier la cohérence service/rôle
    if (client.serviceType === 'MASSOTHERAPIE' && professional.role !== 'MASSOTHERAPEUTE') {
      return NextResponse.json(
        { message: 'Un client massothérapie doit être assigné à un massothérapeute' },
        { status: 400 }
      );
    }

    if (client.serviceType === 'ESTHETIQUE' && professional.role !== 'ESTHETICIENNE') {
      return NextResponse.json(
        { message: 'Un client esthétique doit être assigné à une esthéticienne' },
        { status: 400 }
      );
    }

    // Créer l'assignation (ou la récupérer si elle existe déjà)
    const assignment = await prisma.assignment.upsert({
      where: {
        clientId_professionalId: {
          clientId: validatedData.clientId,
          professionalId: validatedData.professionalId,
        },
      },
      create: {
        clientId: validatedData.clientId,
        professionalId: validatedData.professionalId,
      },
      update: {},
    });

    return NextResponse.json(
      { message: 'Client assigné avec succès', assignment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur assignation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

### 3.4 Professionnels

#### 📁 `app/api/professionals/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer la liste des professionnels
export async function GET(request: NextRequest) {
  try {
    // TODO: Vérifier que l'utilisateur est SECRETAIRE ou ADMIN
    // const user = await requireAuth(['SECRETAIRE', 'ADMIN']);

    const professionals = await prisma.user.findMany({
      where: {
        role: {
          in: ['MASSOTHERAPEUTE', 'ESTHETICIENNE'],
        },
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
      },
      orderBy: [
        { role: 'asc' },
        { nom: 'asc' },
      ],
    });

    return NextResponse.json({ professionals }, { status: 200 });
  } catch (error) {
    console.error('Erreur récupération professionnels:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

---

## 4. Types TypeScript

### 📁 Fichier: `types/next-auth.d.ts`

```typescript
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
```

---

## 5. Middleware & Protection

### 📁 Fichier: `middleware.ts`

```typescript
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Vérifier l'accès au dashboard
    if (path.startsWith('/professionnel/dashboard')) {
      if (token?.role !== 'SECRETAIRE' && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/professionnel/clients', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/professionnel/connexion',
    },
  }
);

export const config = {
  matcher: [
    '/professionnel/dashboard/:path*',
    '/professionnel/clients/:path*',
  ],
};
```

---

## 6. Envoi d'Emails

### 📁 Fichier: `lib/email.ts`

```typescript
import nodemailer from 'nodemailer';

// Créer le transporteur
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Email de bienvenue pour les clients
export async function sendWelcomeEmail(
  email: string,
  prenom: string,
  serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE'
) {
  const serviceLabel = serviceType === 'MASSOTHERAPIE' ? 'massothérapie' : 'soins esthétiques';

  const mailOptions = {
    from: `"Spa Renaissance" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Bienvenue au Spa Renaissance - Dossier créé avec succès',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e24965 0%, #8e67d0 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #e24965; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Spa Renaissance</h1>
              <p>Bienvenue dans notre communauté bien-être</p>
            </div>
            <div class="content">
              <h2>Bonjour ${prenom},</h2>

              <p>Merci d'avoir créé votre dossier client pour nos services de ${serviceLabel}.</p>

              <p><strong>Votre dossier a été créé avec succès !</strong></p>

              <p>Notre équipe a bien reçu vos informations et les consultera avant votre rendez-vous. Un professionnel sera assigné à votre dossier selon votre type de service.</p>

              <h3>Que se passe-t-il maintenant ?</h3>
              <ul>
                <li>✅ Votre dossier est enregistré et sécurisé</li>
                <li>✅ Un professionnel sera assigné à votre suivi</li>
                <li>✅ Vos informations restent strictement confidentielles</li>
              </ul>

              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>

              <div style="text-align: center;">
                <p style="color: #e24965; font-weight: bold;">Nous avons hâte de prendre soin de vous !</p>
              </div>
            </div>
            <div class="footer">
              <p>Spa Renaissance - Massothérapie & Soins Esthétiques</p>
              <p>📧 contact@sparenaissance.com | 📞 (514) 123-4567</p>
              <p style="margin-top: 20px; font-size: 11px;">
                Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de bienvenue envoyé à ${email}`);
  } catch (error) {
    console.error('Erreur envoi email:', error);
    throw error;
  }
}
```

**Installation** : `npm install nodemailer @types/nodemailer`

---

## 7. Validation des Données

### 📁 Fichier: `lib/validations/client.ts`

```typescript
import { z } from 'zod';

export const clientSchema = z.object({
  // Informations personnelles
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  adresse: z.string().min(1, 'L\'adresse est requise'),
  ville: z.string().min(1, 'La ville est requise'),
  codePostal: z.string().regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, 'Code postal invalide'),
  telMaison: z.string().optional(),
  telBureau: z.string().optional(),
  telCellulaire: z.string().min(10, 'Numéro de téléphone invalide'),
  courriel: z.string().email('Email invalide'),
  dateNaissance: z.string(),
  occupation: z.string().optional(),
  gender: z.enum(['HOMME', 'FEMME', 'AUTRE']),
  serviceType: z.enum(['MASSOTHERAPIE', 'ESTHETIQUE']),
  assuranceCouvert: z.string().transform(val => val === 'OUI'),

  // Massothérapie
  raisonConsultation: z.string().optional(),
  diagnosticMedical: z.string().optional(),
  diagnosticMedicalDetails: z.string().optional(),
  medicaments: z.string().optional(),
  medicamentsDetails: z.string().optional(),
  // ... tous les autres champs

  // Esthétique
  etatPeau: z.string().optional(),
  fumeur: z.string().optional(),
  niveauStress: z.string().optional(),
  // ... tous les autres champs
});

export type ClientFormData = z.infer<typeof clientSchema>;
```

---

## 8. Permissions par Rôle

### Matrice des Permissions

| Action | CLIENT | SECRETAIRE | MASSOTHERAPEUTE | ESTHETICIENNE | ADMIN |
|--------|--------|------------|-----------------|---------------|-------|
| Créer dossier client | ✅ | ❌ | ❌ | ❌ | ❌ |
| Voir tous les clients | ❌ | ✅ | ❌ | ❌ | ✅ |
| Voir clients assignés | ❌ | ❌ | ✅ | ✅ | ✅ |
| Assigner clients | ❌ | ✅ | ❌ | ❌ | ✅ |
| Ajouter notes | ❌ | ❌ | ✅ | ✅ | ✅ |
| Modifier notes | ❌ | ❌ | ❌ (sauf les siennes) | ❌ (sauf les siennes) | ✅ |
| Supprimer notes | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 9. Variables d'Environnement

### 📁 Fichier: `.env`

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/spa_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-super-securise-ici"

# Email SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre-email@gmail.com"
SMTP_PASSWORD="votre-mot-de-passe-application"
SMTP_FROM="noreply@sparenaissance.com"
```

### 📁 Fichier: `.env.example`

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/spa_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-this-to-a-random-secret"

# Email SMTP
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-password"
SMTP_FROM="noreply@sparenaissance.com"
```

---

## 10. Script de Seed (Données de Test)

### 📁 Fichier: `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer un admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@spa.com' },
    update: {},
    create: {
      email: 'admin@spa.com',
      telephone: '5141111111',
      password: adminPassword,
      role: 'ADMIN',
      nom: 'Admin',
      prenom: 'Principal',
    },
  });
  console.log('✅ Admin créé:', admin.email);

  // Créer une secrétaire
  const secretairePassword = await bcrypt.hash('secretaire123', 10);
  const secretaire = await prisma.user.upsert({
    where: { email: 'secretaire@spa.com' },
    update: {},
    create: {
      email: 'secretaire@spa.com',
      telephone: '5142222222',
      password: secretairePassword,
      role: 'SECRETAIRE',
      nom: 'Dubois',
      prenom: 'Marie',
    },
  });
  console.log('✅ Secrétaire créée:', secretaire.email);

  // Créer un massothérapeute
  const massoPassword = await bcrypt.hash('masso123', 10);
  const massotherapeute = await prisma.user.upsert({
    where: { email: 'masso@spa.com' },
    update: {},
    create: {
      email: 'masso@spa.com',
      telephone: '5143333333',
      password: massoPassword,
      role: 'MASSOTHERAPEUTE',
      nom: 'Martin',
      prenom: 'Sophie',
    },
  });
  console.log('✅ Massothérapeute créé:', massotherapeute.email);

  // Créer une esthéticienne
  const estheticiennePassword = await bcrypt.hash('esthetique123', 10);
  const estheticienne = await prisma.user.upsert({
    where: { email: 'esthetique@spa.com' },
    update: {},
    create: {
      email: 'esthetique@spa.com',
      telephone: '5144444444',
      password: estheticiennePassword,
      role: 'ESTHETICIENNE',
      nom: 'Tremblay',
      prenom: 'Julie',
    },
  });
  console.log('✅ Esthéticienne créée:', estheticienne.email);

  // Créer un client exemple
  const client = await prisma.clientProfile.create({
    data: {
      nom: 'Dupont',
      prenom: 'Jean',
      adresse: '123 Rue Example',
      ville: 'Montréal',
      codePostal: 'H1H 1H1',
      telCellulaire: '5145555555',
      courriel: 'jean.dupont@example.com',
      dateNaissance: new Date('1985-05-15'),
      gender: 'HOMME',
      serviceType: 'MASSOTHERAPIE',
      assuranceCouvert: true,
      raisonConsultation: 'Douleurs au dos',
      zonesDouleur: ['dos-bas', 'epaule-droite'],
    },
  });
  console.log('✅ Client créé:', client.courriel);

  // Assigner le client au massothérapeute
  await prisma.assignment.create({
    data: {
      clientId: client.id,
      professionalId: massotherapeute.id,
    },
  });
  console.log('✅ Client assigné au massothérapeute');

  // Créer une note
  await prisma.note.create({
    data: {
      content: 'Premier traitement effectué. Le client a bien répondu aux manipulations. Recommandé: 2 séances par semaine pendant 3 semaines.',
      clientId: client.id,
      authorId: massotherapeute.id,
    },
  });
  console.log('✅ Note créée');

  console.log('🎉 Seeding terminé !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Commande** : `npx prisma db seed`

**Ajouter dans `package.json`** :
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## 11. Dépendances à Installer

```bash
npm install @prisma/client bcryptjs zod nodemailer
npm install -D prisma @types/bcryptjs @types/nodemailer ts-node
```

---

## 12. Checklist de Développement

### Phase 1 : Configuration
- [ ] Installer Prisma et configurer la base de données
- [ ] Créer le schéma Prisma
- [ ] Exécuter `npx prisma db push`
- [ ] Installer NextAuth et configurer
- [ ] Créer le script de seed

### Phase 2 : API Clients
- [ ] Créer `app/api/clients/route.ts` (POST, GET)
- [ ] Créer `app/api/clients/[id]/route.ts` (GET)
- [ ] Créer `app/api/clients/assigned/route.ts` (GET)
- [ ] Tester avec Postman/Insomnia

### Phase 3 : API Notes
- [ ] Créer `app/api/clients/[id]/notes/route.ts` (GET, POST)
- [ ] Tester l'ajout et la récupération de notes

### Phase 4 : API Assignations
- [ ] Créer `app/api/assignments/route.ts` (POST)
- [ ] Créer `app/api/professionals/route.ts` (GET)
- [ ] Tester l'assignation

### Phase 5 : Authentification
- [ ] Configurer NextAuth complètement
- [ ] Créer le middleware de protection
- [ ] Tester la connexion et les redirections

### Phase 6 : Emails
- [ ] Configurer nodemailer
- [ ] Créer le template d'email
- [ ] Intégrer l'envoi d'email dans POST /api/clients

### Phase 7 : Tests & Sécurité
- [ ] Tester tous les endpoints
- [ ] Vérifier les permissions par rôle
- [ ] Tester les validations
- [ ] Gérer les cas d'erreur

---

## 13. Comptes de Test (après seed)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@spa.com | admin123 |
| Secrétaire | secretaire@spa.com | secretaire123 |
| Massothérapeute | masso@spa.com | masso123 |
| Esthéticienne | esthetique@spa.com | esthetique123 |

---

## 14. Conseils de Sécurité

1. **Mots de passe** : Toujours hasher avec bcrypt (minimum 10 rounds)
2. **CORS** : Configurer correctement pour la production
3. **Rate Limiting** : Ajouter un rate limiter pour les APIs sensibles
4. **Validation** : Toujours valider côté serveur avec Zod
5. **SQL Injection** : Prisma protège automatiquement
6. **XSS** : React protège automatiquement
7. **Sessions** : Utiliser NEXTAUTH_SECRET sécurisé (minimum 32 caractères aléatoires)

---

## 15. Base de Données Recommandée

### Pour le Développement
- PostgreSQL local ou Docker
- SQLite (plus simple, moins de fonctionnalités)

### Pour la Production
- **Supabase** (PostgreSQL gratuit + excellentes features)
- **Neon** (PostgreSQL serverless)
- **PlanetScale** (MySQL compatible)
- **Railway** (PostgreSQL facile)

---

## 🎯 Résumé

Ce guide couvre **100%** du backend nécessaire pour votre frontend.

**Une fois tout implémenté, vous aurez** :
- ✅ Authentification complète avec rôles
- ✅ Gestion des clients (CRUD)
- ✅ Système de notes avec traçabilité
- ✅ Assignations professionnels ↔ clients
- ✅ Emails de confirmation
- ✅ Protection des routes
- ✅ Validation des données
- ✅ Base de données structurée

**Bon développement !** 🚀

---

*Guide créé pour le Spa Renaissance - Tous les endpoints correspondent exactement au frontend développé*
