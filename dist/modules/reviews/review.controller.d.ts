import { Request, Response } from 'express';
import { AuthRequest } from '../auth/auth';
/**
 * @desc    Créer un avis anonyme (PUBLIC)
 * @route   POST /api/reviews
 * @access  Public
 */
export declare const createReview: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer tous les avis avec pagination et filtres (ADMIN)
 * @route   GET /api/reviews
 * @access  Privé (ADMIN uniquement)
 */
export declare const getAllReviews: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer les avis et statistiques d'un professionnel (PUBLIC)
 * @route   GET /api/reviews/:professionalId
 * @access  Public
 */
export declare const getReviewsByProfessional: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=review.controller.d.ts.map