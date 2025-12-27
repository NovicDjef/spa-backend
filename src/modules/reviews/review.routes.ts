import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import {
  createReview,
  getReviewsByProfessional,
  getAllReviews,
} from './review.controller';

const router = Router();

// Route publique - Créer un avis
router.post('/', asyncHandler(createReview));

// Route protégée - Récupérer tous les avis (ADMIN uniquement)
// IMPORTANT: Cette route DOIT être AVANT /:professionalId pour éviter les conflits
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(getAllReviews)
);

// Route publique - Récupérer les avis d'un professionnel
router.get('/:professionalId', asyncHandler(getReviewsByProfessional));

export default router;
