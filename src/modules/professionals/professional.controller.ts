import { Request, Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../auth/auth';

/**
 * @desc    Récupérer la liste des professionnels actifs pour le formulaire d'avis (PUBLIC)
 * @route   GET /api/professionals/public
 * @access  Public
 */
export const getPublicProfessionals = async (req: Request, res: Response) => {
  const { serviceType } = req.query;

  const where: any = {
    isActive: true,
    role: {
      in: ['MASSOTHERAPEUTE', 'ESTHETICIENNE']
    }
  };

  if (serviceType === 'MASSOTHERAPIE') {
    where.role = 'MASSOTHERAPEUTE';
  } else if (serviceType === 'ESTHETIQUE') {
    where.role = 'ESTHETICIENNE';
  }

  const professionals = await prisma.user.findMany({
    where,
    select: {
      id: true,
      prenom: true,
      nom: true,
      role: true,
      isActive: true
    },
    orderBy: [
      { nom: 'asc' },
      { prenom: 'asc' }
    ]
  });

  res.json({
    success: true,
    data: professionals
  });
};

/**
 * @desc    Récupérer la liste des professionnels (MASSOTHERAPEUTE, ESTHETICIENNE)
 * @route   GET /api/professionals
 * @access  Privé (SECRETAIRE, ADMIN uniquement)
 */
export const getProfessionals = async (req: AuthRequest, res: Response) => {
  const { role, search } = req.query;

  let where: any = {
    role: {
      in: ['MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'],
    },
  };

  // Filtrer par rôle spécifique
  if (role && (role === 'MASSOTHERAPEUTE' || role === 'ESTHETICIENNE' || role === 'ADMIN')) {
    where.role = role;
  }

  // Recherche par nom, prénom ou email
  if (search) {
    where.OR = [
      { nom: { contains: search as string, mode: 'insensitive' } },
      { prenom: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const professionals = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      telephone: true,
      nom: true,
      prenom: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          assignedClients: true,
        },
      },
    },
    orderBy: [
      { role: 'asc' },
      { nom: 'asc' },
    ],
  });

  res.status(200).json({
    success: true,
    data: professionals,
  });
};

/**
 * @desc    Récupérer un professionnel par ID avec ses assignations
 * @route   GET /api/professionals/:id
 * @access  Privé (SECRETAIRE, ADMIN uniquement)
 */
export const getProfessionalById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const professional = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      telephone: true,
      nom: true,
      prenom: true,
      role: true,
      createdAt: true,
      assignedClients: {
        include: {
          client: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              serviceType: true,
              courriel: true,
              telCellulaire: true,
            },
          },
        },
        orderBy: {
          assignedAt: 'desc',
        },
      },
    },
  });

  if (!professional) {
    return res.status(404).json({
      success: false,
      error: 'Professionnel non trouvé',
    });
  }

  return res.status(200).json({
    success: true,
    data: professional,
  });
};

/**
 * @desc    Récupérer les statistiques d'un professionnel
 * @route   GET /api/professionals/:id/stats
 * @access  Privé (Le professionnel lui-même, ou SECRETAIRE/ADMIN)
 */
export const getProfessionalStats = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  // Vérifier les permissions
  if (user.id !== id && user.role !== 'SECRETAIRE' && user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Vous n\'avez pas accès à ces informations',
    });
  }

  const [totalClients, totalNotes] = await Promise.all([
    prisma.assignment.count({
      where: { professionalId: id },
    }),
    prisma.note.count({
      where: { authorId: id },
    }),
  ]);

  // Clients par type de service
  const clientsByService = await prisma.assignment.groupBy({
    by: ['clientId'],
    where: { professionalId: id },
    _count: true,
  });

  // Récupérer les types de service
  const clientIds = clientsByService.map((item) => item.clientId);
  const clients = await prisma.clientProfile.findMany({
    where: { id: { in: clientIds } },
    select: { serviceType: true },
  });

  const massotherapieCount = clients.filter(
    (c) => c.serviceType === 'MASSOTHERAPIE'
  ).length;
  const esthetiqueCount = clients.filter(
    (c) => c.serviceType === 'ESTHETIQUE'
  ).length;

  return res.status(200).json({
    success: true,
    data: {
      totalClients,
      totalNotes,
      clientsByService: {
        MASSOTHERAPIE: massotherapieCount,
        ESTHETIQUE: esthetiqueCount,
      },
    },
  });
};
