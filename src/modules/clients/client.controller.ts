import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../auth/auth';
import { sendWelcomeEmail } from '../../lib/email';

// Helper pour transformer "OUI"/"NON" en boolean
const booleanOrString = z
  .union([
    z.boolean(),
    z.enum(['OUI', 'NON', 'oui', 'non', 'true', 'false']),
  ])
  .transform((val) => {
    if (val === true || val === 'OUI' || val === 'oui' || val === 'true') {
      return true;
    }
    if (val === false || val === 'NON' || val === 'non' || val === 'false') {
      return false;
    }
    return val;
  })
  .nullable()
  .optional();



// Schéma de validation pour la création d'un client
const createClientSchema = z.object({
  // Informations personnelles
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  adresse: z.string().min(1, 'L\'adresse est requise'),
  ville: z.string().min(1, 'La ville est requise'),
  codePostal: z.string().min(1, 'Le code postal est requis'),
  telMaison: z.string().optional(),
  telBureau: z.string().optional(),
  telCellulaire: z.string().min(9, 'Le téléphone cellulaire doit contenir au moins 9 chiffres'),
  courriel: z.string().email('Email invalide'),
  dateNaissance: z.string().min(1, 'La date de naissance est requise'),
  occupation: z.string().optional(),
  gender: z.enum(['HOMME', 'FEMME', 'AUTRE']),
  serviceType: z.enum(['MASSOTHERAPIE', 'ESTHETIQUE']),
  assuranceCouvert: booleanOrString,

  // Informations médicales (optionnelles)
  raisonConsultation: z.string().nullable().optional(),
  diagnosticMedical: booleanOrString.optional(),
  diagnosticMedicalDetails: z.string().nullable().optional(),
  medicaments: booleanOrString.optional(),
  medicamentsDetails: z.string().nullable().optional(),
  accidents: booleanOrString.optional(),
  accidentsDetails: z.string().nullable().optional(),
  operationsChirurgicales: booleanOrString.optional(),
  operationsChirurgicalesDetails: z.string().optional(),
  traitementsActuels: z.string().optional(),
  problemesCardiaques: z.boolean().optional(),
  problemesCardiaquesDetails: z.string().nullable().optional(),
  maladiesGraves: booleanOrString.optional(),
  maladiesGravesDetails: z.string().nullable().optional(),
  ortheses: booleanOrString.optional(),
  orthesesDetails: z.string().nullable().optional(),
  allergies: booleanOrString.optional(),
  allergiesDetails: z.string().nullable().optional(),

  // Conditions médicales
  raideurs: booleanOrString.optional(),
  arthrose: booleanOrString.optional(),
  hernieDiscale: booleanOrString.optional(),
  oedeme: booleanOrString.optional(),
  tendinite: booleanOrString.optional(),
  mauxDeTete: booleanOrString.optional(),
  flatulence: booleanOrString.optional(),
  troublesCirculatoires: booleanOrString.optional(),
  hypothyroidie: booleanOrString.optional(),
  diabete: booleanOrString.optional(),
  stresse: booleanOrString.optional(),
  premenopause: booleanOrString.optional(),
  douleurMusculaire: booleanOrString.optional(),
  fibromyalgie: booleanOrString.optional(),
  rhumatisme: booleanOrString.optional(),
  sciatique: booleanOrString.optional(),
  bursite: booleanOrString.optional(),
  migraine: booleanOrString.optional(),
  diarrhee: booleanOrString.optional(),
  phlebite: booleanOrString.optional(),
  hypertension: booleanOrString.optional(),
  hypoglycemie: booleanOrString.optional(),
  burnOut: booleanOrString.optional(),
  menopause: booleanOrString.optional(),
  inflammationAigue: booleanOrString.optional(),
  arteriosclerose: booleanOrString.optional(),
  osteoporose: booleanOrString.optional(),
  mauxDeDos: booleanOrString.optional(),
  fatigueDesJambes: booleanOrString.optional(),
  troublesDigestifs: booleanOrString.optional(),
  constipation: booleanOrString.optional(),
  hyperthyroidie: booleanOrString.optional(),
  hypotension: booleanOrString.optional(),
  insomnie: booleanOrString.optional(),
  depressionNerveuse: booleanOrString.optional(),
  autres: z.string().optional(),

  // Zones de douleur
  zonesDouleur: z.array(z.string()).optional(),

  // Informations esthétique
  etatPeau: z.string().optional(),
  etatPores: z.string().optional(),
  coucheCornee: z.string().optional(),
  irrigationSanguine: z.string().optional(),
  impuretes: z.string().optional(),
  sensibiliteCutanee: z.string().optional(),
  autreMaladieDetails: z.string().nullable().optional(),
  autreMaladie: z.boolean().optional(),
  fumeur: z.enum(['OUI', 'NON', 'OCCASIONNEL',]).nullable().optional(),
  niveauStress: z.string().optional(),
  expositionSoleil: z.enum(['RARE', 'MODEREE', 'FREQUENTE', 'TRES_FREQUENTE']) .optional().nullable(),
  protectionSolaire: z.enum(['TOUJOURS', 'SOUVENT', 'RAREMENT', 'JAMAIS']).optional().nullable(),
  suffisanceEau: z.enum(['OUI', 'NON']) .optional().nullable(),
  travailExterieur: z.enum(['OUI', 'NON']) .optional().nullable(),
  bainChauds: z.enum(['OUI', 'NON']) .optional().nullable(),
  routineSoins: z.any().optional(),
  changementsRecents: z.any().optional(),
  preferencePeau: z.string().optional(),
  diagnosticVisuelNotes: z.any().optional(),
});

/**
 * @desc    Créer un nouveau client (SANS compte utilisateur)
 * @route   POST /api/clients
 * @access  Public
 */
export const createClient = async (req: Request, res: Response) => {
  // Validation
  const validatedData = createClientSchema.parse(req.body);

  // Vérifier l'unicité de l'email dans ClientProfile
  const existingEmail = await prisma.clientProfile.findUnique({
    where: { courriel: validatedData.courriel },
  });

  if (existingEmail) {
    throw new AppError('Cet email est déjà utilisé', 400);
  }

  // Vérifier l'unicité du téléphone dans ClientProfile
  const existingPhone = await prisma.clientProfile.findUnique({
    where: { telCellulaire: validatedData.telCellulaire },
  });

  if (existingPhone) {
    throw new AppError('Ce numéro de téléphone est déjà utilisé', 400);
  }

  // Créer le profil client directement (SANS User)
const client = await prisma.clientProfile.create({
  data: {
    ...validatedData,
    dateNaissance: new Date(validatedData.dateNaissance),
    zonesDouleur: validatedData.zonesDouleur ?? [],
  },
});


  // Envoyer l'email de confirmation (async, ne bloque pas la réponse)
  sendWelcomeEmail(client.courriel, client.prenom, client.serviceType);

  res.status(201).json({
    success: true,
    message: 'Dossier client créé avec succès',
    data: client,
  });
};

/**
 * @desc    Récupérer tous les clients (avec permissions par rôle)
 * @route   GET /api/clients
 * @access  Privé (Professionnels uniquement)
 */
export const getClients = async (req: AuthRequest, res: Response) => {
  const { search, serviceType, page = '1', limit = '20' } = req.query;
  const user = req.user!;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  let where: any = {};

  // PERMISSIONS PAR RÔLE
  // MASSOTHERAPEUTE/ESTHETICIENNE: Voir uniquement leurs clients assignés
  if (user.role === 'MASSOTHERAPEUTE' || user.role === 'ESTHETICIENNE') {
    where.assignments = {
      some: {
        professionalId: user.id,
      },
    };
  }
  // SECRETAIRE/ADMIN: Voir tous les clients (pas de restriction)

  // Filtre de recherche
  if (search) {
    where.OR = [
      { nom: { contains: search as string, mode: 'insensitive' } },
      { prenom: { contains: search as string, mode: 'insensitive' } },
      { telCellulaire: { contains: search as string } },
      { courriel: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  // Filtre par type de service
  if (serviceType && (serviceType === 'MASSOTHERAPIE' || serviceType === 'ESTHETIQUE')) {
    where.serviceType = serviceType;
  }

  // SECRET MÉDICAL: SECRETAIRE ne voit QUE les infos d'identification
  // Les infos médicales restent PRIVÉES entre le client et le professionnel
  const isSecretaire = user.role === 'SECRETAIRE';

  const selectFields = isSecretaire ? {
    // SECRETAIRE: SEULEMENT les infos d'identification (pour assigner)
    id: true,
    nom: true,
    prenom: true,
    telCellulaire: true,
    courriel: true,
    serviceType: true,
    createdAt: true,
    // AUCUNE info médicale, AUCUNE note, AUCUNE préférence
  } : undefined; // MASSOTHERAPEUTE/ESTHETICIENNE/ADMIN: TOUT

  const includeRelations = {
    assignments: {
      include: {
        professional: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            role: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc' as const,
      },
    },
    // Notes: SECRETAIRE ne les voit PAS
    ...(isSecretaire ? {} : {
      notes: {
        select: {
          id: true,
          createdAt: true,
          authorId: true,
        },
        orderBy: {
          createdAt: 'desc' as const,
        },
      },
    }),
  };

  // Récupérer les clients avec pagination (sans tri pour l'instant)
  const [clientsRaw, total] = await Promise.all([
    prisma.clientProfile.findMany({
      where,
      ...(selectFields ? { select: { ...selectFields, ...includeRelations } } : { include: includeRelations }),
    }),
    prisma.clientProfile.count({ where }),
  ]);

  // Pour MASSOTHERAPEUTE/ESTHETICIENNE: Ajouter assignedAt, hasNoteAfterAssignment et trier par date
  let clients = clientsRaw;

  if (user.role === 'MASSOTHERAPEUTE' || user.role === 'ESTHETICIENNE') {
    // Enrichir chaque client avec la date de la plus récente assignation à ce professionnel
    // ET vérifier si une note a été ajoutée après l'assignation
    clients = clientsRaw.map(client => {
      const myAssignment = client.assignments.find(
        assignment => assignment.professionalId === user.id
      );

      const assignedAt = myAssignment?.assignedAt || client.createdAt;

      // Vérifier si le professionnel a ajouté une note APRÈS la date d'assignation
      // Cela détermine si le badge "Nouveau RDV" doit être affiché
      const hasNoteAfterAssignment = (client as any).notes?.some((note: any) => {
        return (
          note.authorId === user.id &&
          new Date(note.createdAt) > new Date(assignedAt)
        );
      }) || false;

      return {
        ...client,
        assignedAt,
        hasNoteAfterAssignment, // true = badge caché, false = badge affiché
      };
    });

    // Trier par assignedAt DESC (plus récent en premier)
    clients.sort((a: any, b: any) => {
      return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime();
    });
  } else {
    // Pour ADMIN/SECRETAIRE: Trier par createdAt DESC
    clients.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  // Appliquer la pagination APRÈS le tri
  const paginatedClients = clients.slice(skip, skip + limitNum);

  res.status(200).json({
    success: true,
    data: {
      clients: paginatedClients,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
};

/**
 * @desc    Récupérer un client par ID (avec vérification des permissions)
 * @route   GET /api/clients/:id
 * @access  Privé (Professionnels uniquement)
 */
export const getClientById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  // SECRET MEDICAL: La SECRETAIRE ne peut PAS consulter les dossiers clients (notes médicales)
  if (user.role === 'SECRETAIRE') {
    throw new AppError('Accès refusé. Le secret médical vous empêche de consulter les dossiers clients.', 403);
  }

  const client = await prisma.clientProfile.findUnique({
    where: { id },
    include: {
      notes: {
        include: {
          author: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      assignments: {
        include: {
          professional: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!client) {
    throw new AppError('Client non trouvé', 404);
  }

  // VÉRIFICATION DES PERMISSIONS
  // MASSOTHERAPEUTE/ESTHETICIENNE: Vérifier que le client leur est assigné
  if (user.role === 'MASSOTHERAPEUTE' || user.role === 'ESTHETICIENNE') {
    const isAssigned = client.assignments.some(
      (assignment) => assignment.professionalId === user.id
    );

    if (!isAssigned) {
      throw new AppError('Vous n\'avez pas accès à ce dossier client', 403);
    }
  }
  // ADMIN: Accès total

  res.status(200).json({
    success: true,
    data: client,
  });
};

/**
 * @desc    Mettre à jour un client
 * @route   PUT /api/clients/:id
 * @access  Privé (Professionnels)
 */
export const updateClient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  // Vérifier que le client existe
  const existingClient = await prisma.clientProfile.findUnique({
    where: { id },
  });

  if (!existingClient) {
    throw new AppError('Client non trouvé', 404);
  }

  // Mettre à jour
  const updatedClient = await prisma.clientProfile.update({
    where: { id },
    data: req.body,
  });

  res.status(200).json({
    success: true,
    message: 'Client mis à jour avec succès',
    data: updatedClient,
  });
};

/**
 * @desc    Supprimer un client
 * @route   DELETE /api/clients/:id
 * @access  Privé (Professionnels)
 */
export const deleteClient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const client = await prisma.clientProfile.findUnique({
    where: { id },
  });

  if (!client) {
    throw new AppError('Client non trouvé', 404);
  }

  // Supprimer (cascade supprimera aussi l'utilisateur)
  await prisma.clientProfile.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Client supprimé avec succès',
  });
};

/**
 * @desc    Rechercher des clients
 * @route   GET /api/clients/search/:query
 * @access  Privé (Professionnels)
 */
export const searchClients = async (req: AuthRequest, res: Response) => {
  const { query } = req.params;
  const user = req.user!;

  // SECRET MÉDICAL: SECRETAIRE ne voit QUE les infos d'identification
  const isSecretaire = user.role === 'SECRETAIRE';

  const selectFields = isSecretaire ? {
    // SECRETAIRE: SEULEMENT les infos d'identification
    id: true,
    nom: true,
    prenom: true,
    telCellulaire: true,
    courriel: true,
    serviceType: true,
    createdAt: true,
  } : undefined; // MASSOTHERAPEUTE/ESTHETICIENNE/ADMIN: TOUT

  const clients = await prisma.clientProfile.findMany({
    where: {
      OR: [
        { nom: { contains: query, mode: 'insensitive' } },
        { prenom: { contains: query, mode: 'insensitive' } },
        { telCellulaire: { contains: query } },
        { courriel: { contains: query, mode: 'insensitive' } },
      ],
    },
    ...(selectFields ? { select: selectFields } : {}),
    take: 20,
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    data: clients,
  });
};
