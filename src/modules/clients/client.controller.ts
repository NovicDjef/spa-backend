import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../auth/auth';
import { sendWelcomeEmail } from '../../lib/email';

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
  telCellulaire: z.string().min(10, 'Le téléphone cellulaire est requis'),
  courriel: z.string().email('Email invalide'),
  dateNaissance: z.string().min(1, 'La date de naissance est requise'),
  occupation: z.string().optional(),
  gender: z.enum(['HOMME', 'FEMME']),
  serviceType: z.enum(['MASSOTHERAPIE', 'ESTHETIQUE']),
  assuranceCouvert: z.boolean().optional(),

  // Informations médicales (optionnelles)
  raisonConsultation: z.string().optional(),
  diagnosticMedical: z.boolean().optional(),
  diagnosticMedicalDetails: z.string().optional(),
  medicaments: z.boolean().optional(),
  medicamentsDetails: z.string().optional(),
  accidents: z.boolean().optional(),
  accidentsDetails: z.string().optional(),
  operationsChirurgicales: z.boolean().optional(),
  operationsChirurgicalesDetails: z.string().optional(),
  traitementsActuels: z.string().optional(),
  problemesCardiaques: z.boolean().optional(),
  problemesCardiaquesDetails: z.string().optional(),
  maladiesGraves: z.boolean().optional(),
  maladiesGravesDetails: z.string().optional(),
  ortheses: z.boolean().optional(),
  orthesesDetails: z.string().optional(),
  allergies: z.boolean().optional(),
  allergiesDetails: z.string().optional(),

  // Conditions médicales
  raideurs: z.boolean().optional(),
  arthrose: z.boolean().optional(),
  hernieDiscale: z.boolean().optional(),
  oedeme: z.boolean().optional(),
  tendinite: z.boolean().optional(),
  mauxDeTete: z.boolean().optional(),
  flatulence: z.boolean().optional(),
  troublesCirculatoires: z.boolean().optional(),
  hypothyroidie: z.boolean().optional(),
  diabete: z.boolean().optional(),
  stresse: z.boolean().optional(),
  premenopause: z.boolean().optional(),
  douleurMusculaire: z.boolean().optional(),
  fibromyalgie: z.boolean().optional(),
  rhumatisme: z.boolean().optional(),
  sciatique: z.boolean().optional(),
  bursite: z.boolean().optional(),
  migraine: z.boolean().optional(),
  diarrhee: z.boolean().optional(),
  phlebite: z.boolean().optional(),
  hypertension: z.boolean().optional(),
  hypoglycemie: z.boolean().optional(),
  burnOut: z.boolean().optional(),
  menopause: z.boolean().optional(),
  inflammationAigue: z.boolean().optional(),
  arteriosclerose: z.boolean().optional(),
  osteoporose: z.boolean().optional(),
  mauxDeDos: z.boolean().optional(),
  fatigueDesJambes: z.boolean().optional(),
  troublesDigestifs: z.boolean().optional(),
  constipation: z.boolean().optional(),
  hyperthyroidie: z.boolean().optional(),
  hypotension: z.boolean().optional(),
  insomnie: z.boolean().optional(),
  depressionNerveuse: z.boolean().optional(),
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
  fumeur: z.boolean().optional(),
  niveauStress: z.string().optional(),
  expositionSoleil: z.boolean().optional(),
  protectionSolaire: z.boolean().optional(),
  suffisanceEau: z.boolean().optional(),
  travailExterieur: z.boolean().optional(),
  bainChauds: z.boolean().optional(),
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
      zonesDouleur: validatedData.zonesDouleur || [],
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

  // Récupérer les clients avec pagination
  const [clients, total] = await Promise.all([
    prisma.clientProfile.findMany({
      where,
      include: {
        notes: {
          select: {
            id: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limitNum,
    }),
    prisma.clientProfile.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      clients,
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
  // SECRETAIRE/ADMIN: Accès total (pas de restriction)

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

  const clients = await prisma.clientProfile.findMany({
    where: {
      OR: [
        { nom: { contains: query, mode: 'insensitive' } },
        { prenom: { contains: query, mode: 'insensitive' } },
        { telCellulaire: { contains: query } },
        { adresse: { contains: query, mode: 'insensitive' } },
        { courriel: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          telephone: true,
        },
      },
    },
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
