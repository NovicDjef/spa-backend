import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../auth/auth';

// Schéma de validation pour l'assignation
const assignmentSchema = z.object({
  clientId: z.string().min(1, 'L\'ID du client est requis'),
  professionalId: z.string().min(1, 'L\'ID du professionnel est requis'),
});

/**
 * @desc    Assigner un client à un professionnel
 * @route   POST /api/assignments
 * @access  Privé (SECRETAIRE, ADMIN uniquement)
 */
export const assignClient = async (req: AuthRequest, res: Response) => {
  // Validation
  const validatedData = assignmentSchema.parse(req.body);

  // Vérifier que le client existe
  const client = await prisma.clientProfile.findUnique({
    where: { id: validatedData.clientId },
  });

  if (!client) {
    throw new AppError('Client non trouvé', 404);
  }

  // Vérifier que le professionnel existe
  const professional = await prisma.user.findUnique({
    where: { id: validatedData.professionalId },
  });

  if (!professional) {
    throw new AppError('Professionnel non trouvé', 404);
  }

  // Vérifier que le professionnel n'est pas SECRETAIRE
  if (professional.role === 'SECRETAIRE') {
    throw new AppError('Impossible d\'assigner un client à une secrétaire', 400);
  }

  // Vérifier la cohérence service/rôle
  if (
    client.serviceType === 'MASSOTHERAPIE' &&
    professional.role !== 'MASSOTHERAPEUTE' &&
    professional.role !== 'ADMIN'
  ) {
    throw new AppError(
      'Un client massothérapie doit être assigné à un massothérapeute',
      400
    );
  }

  if (
    client.serviceType === 'ESTHETIQUE' &&
    professional.role !== 'ESTHETICIENNE' &&
    professional.role !== 'ADMIN'
  ) {
    throw new AppError(
      'Un client esthétique doit être assigné à une esthéticienne',
      400
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
    include: {
      client: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          serviceType: true,
        },
      },
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
  });

  res.status(201).json({
    success: true,
    message: 'Client assigné avec succès',
    data: assignment,
  });
};

/**
 * @desc    Supprimer une assignation
 * @route   DELETE /api/assignments/:clientId/:professionalId
 * @access  Privé (SECRETAIRE, ADMIN uniquement)
 */
export const removeAssignment = async (req: AuthRequest, res: Response) => {
  const { clientId, professionalId } = req.params;

  // Vérifier que l'assignation existe
  const assignment = await prisma.assignment.findUnique({
    where: {
      clientId_professionalId: {
        clientId,
        professionalId,
      },
    },
  });

  if (!assignment) {
    throw new AppError('Assignation non trouvée', 404);
  }

  // Supprimer l'assignation
  await prisma.assignment.delete({
    where: {
      clientId_professionalId: {
        clientId,
        professionalId,
      },
    },
  });

  res.status(200).json({
    success: true,
    message: 'Assignation supprimée avec succès',
  });
};

/**
 * @desc    Récupérer toutes les assignations d'un client
 * @route   GET /api/assignments/client/:clientId
 * @access  Privé (SECRETAIRE, ADMIN uniquement)
 */
export const getClientAssignments = async (req: AuthRequest, res: Response) => {
  const { clientId } = req.params;

  const assignments = await prisma.assignment.findMany({
    where: { clientId },
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
    orderBy: {
      assignedAt: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    data: assignments,
  });
};

/**
 * @desc    Récupérer tous les clients assignés à un professionnel
 * @route   GET /api/assignments/professional/:professionalId
 * @access  Privé (Le professionnel lui-même, ou SECRETAIRE/ADMIN)
 */
export const getProfessionalAssignments = async (
  req: AuthRequest,
  res: Response
) => {
  const { professionalId } = req.params;
  const user = req.user!;

  // Vérifier les permissions: le professionnel peut voir ses propres assignations
  // La secrétaire et l'admin peuvent voir les assignations de tous
  if (
    user.id !== professionalId &&
    user.role !== 'SECRETAIRE' &&
    user.role !== 'ADMIN'
  ) {
    throw new AppError('Vous n\'avez pas accès à ces informations', 403);
  }

  const assignments = await prisma.assignment.findMany({
    where: { professionalId },
    include: {
      client: true,
    },
    orderBy: {
      assignedAt: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    data: assignments,
  });
};
