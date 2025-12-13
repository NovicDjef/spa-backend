import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Schéma de validation
const createTraitementSchema = z.object({
  date: z.string().optional(),
  soin: z.string().min(1, 'Le type de soin est requis'),
  remarque: z.string().optional(),
  prescription: z.string().optional(),
});

/**
 * @desc    Récupérer tous les traitements d'un client
 * @route   GET /api/traitements/:clientId
 * @access  Privé (Professionnels)
 */
export const getTraitementsByClient = async (req: AuthRequest, res: Response) => {
  const { clientId } = req.params;

  // Vérifier que le client existe
  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    throw new AppError('Client non trouvé', 404);
  }

  // Récupérer les traitements
  const traitements = await prisma.traitement.findMany({
    where: { clientId },
    orderBy: {
      date: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    data: traitements,
  });
};

/**
 * @desc    Ajouter un traitement à un dossier client
 * @route   POST /api/traitements/:clientId
 * @access  Privé (Professionnels)
 */
export const createTraitement = async (req: AuthRequest, res: Response) => {
  const { clientId } = req.params;
  const validatedData = createTraitementSchema.parse(req.body);

  // Vérifier que le client existe
  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    throw new AppError('Client non trouvé', 404);
  }

  // Créer le traitement
  const traitement = await prisma.traitement.create({
    data: {
      date: validatedData.date ? new Date(validatedData.date) : new Date(),
      soin: validatedData.soin,
      remarque: validatedData.remarque,
      prescription: validatedData.prescription,
      clientId,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Traitement ajouté avec succès',
    data: traitement,
  });
};

/**
 * @desc    Modifier un traitement
 * @route   PUT /api/traitements/:traitementId
 * @access  Privé (Professionnels)
 */
export const updateTraitement = async (req: AuthRequest, res: Response) => {
  const { traitementId } = req.params;

  // Vérifier que le traitement existe
  const traitement = await prisma.traitement.findUnique({
    where: { id: traitementId },
  });

  if (!traitement) {
    throw new AppError('Traitement non trouvé', 404);
  }

  // Mettre à jour
  const updatedTraitement = await prisma.traitement.update({
    where: { id: traitementId },
    data: {
      ...(req.body.date && { date: new Date(req.body.date) }),
      ...(req.body.soin && { soin: req.body.soin }),
      ...(req.body.remarque !== undefined && { remarque: req.body.remarque }),
      ...(req.body.prescription !== undefined && { prescription: req.body.prescription }),
    },
  });

  res.status(200).json({
    success: true,
    message: 'Traitement mis à jour avec succès',
    data: updatedTraitement,
  });
};

/**
 * @desc    Supprimer un traitement
 * @route   DELETE /api/traitements/:traitementId
 * @access  Privé (Professionnels)
 */
export const deleteTraitement = async (req: AuthRequest, res: Response) => {
  const { traitementId } = req.params;

  // Vérifier que le traitement existe
  const traitement = await prisma.traitement.findUnique({
    where: { id: traitementId },
  });

  if (!traitement) {
    throw new AppError('Traitement non trouvé', 404);
  }

  // Supprimer
  await prisma.traitement.delete({
    where: { id: traitementId },
  });

  res.status(200).json({
    success: true,
    message: 'Traitement supprimé avec succès',
  });
};
