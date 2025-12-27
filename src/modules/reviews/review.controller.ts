import { Request, Response } from 'express';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import prisma from '../../config/database';
import { AuthRequest } from '../auth/auth';

// Schéma de validation pour la création d'un avis
const createReviewSchema = z.object({
  professionalId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
});

/**
 * @desc    Créer un avis anonyme (PUBLIC)
 * @route   POST /api/reviews
 * @access  Public
 */
export const createReview = async (req: Request, res: Response) => {
  try {
    // Validation
    const data = createReviewSchema.parse(req.body);

    // Vérifier que le professionnel existe et est actif
    const professional = await prisma.user.findUnique({
      where: { id: data.professionalId },
      select: { id: true, isActive: true, role: true }
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professionnel introuvable'
      });
    }

    if (!professional.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Ce professionnel n\'est plus actif'
      });
    }

    if (!['MASSOTHERAPEUTE', 'ESTHETICIENNE'].includes(professional.role)) {
      return res.status(400).json({
        success: false,
        message: 'Seuls les massothérapeutes et esthéticiennes peuvent recevoir des avis'
      });
    }

    // Sanitize le commentaire
    const sanitizedComment = data.comment
      ? sanitizeHtml(data.comment, { allowedTags: [], allowedAttributes: {} })
      : null;

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        professionalId: data.professionalId,
        rating: data.rating,
        comment: sanitizedComment,
        isAnonymous: true
      },
      select: {
        id: true,
        rating: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Avis enregistré avec succès',
      data: review
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors
      });
    }

    console.error('Erreur création avis:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * @desc    Récupérer tous les avis avec pagination et filtres (ADMIN)
 * @route   GET /api/reviews
 * @access  Privé (ADMIN uniquement)
 */
export const getAllReviews = async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', professionalId, rating } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Construire les filtres
  const where: any = {};
  if (professionalId) {
    where.professionalId = professionalId;
  }
  if (rating) {
    where.rating = parseInt(rating as string);
  }

  // Récupérer les avis avec pagination
  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
      where,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        professional: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum
    }),
    prisma.review.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / limitNum);

  return res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    }
  });
};

/**
 * @desc    Récupérer les avis et statistiques d'un professionnel (PUBLIC)
 * @route   GET /api/reviews/:professionalId
 * @access  Public
 */
export const getReviewsByProfessional = async (req: Request, res: Response) => {
  const { professionalId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { professionalId },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  return res.json({
    success: true,
    data: {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      reviews
    }
  });
};
