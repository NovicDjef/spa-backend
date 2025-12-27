import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import {
  getProfessionals,
  getProfessionalById,
  getProfessionalStats,
  getPublicProfessionals,
} from './professional.controller';

const router = Router();

// Route publique - PAS d'authentification
router.get('/public', asyncHandler(getPublicProfessionals));

// Récupérer la liste des professionnels (SECRETAIRE, ADMIN uniquement)
router.get(
  '/',
  authenticate,
  authorize('SECRETAIRE', 'ADMIN'),
  asyncHandler(getProfessionals)
);

// Récupérer les statistiques d'un professionnel (AVANT /:id pour éviter les conflits)
router.get(
  '/:id/stats',
  authenticate,
  asyncHandler(getProfessionalStats)
);

// Récupérer un professionnel par ID (SECRETAIRE, ADMIN uniquement)
router.get(
  '/:id',
  authenticate,
  authorize('SECRETAIRE', 'ADMIN'),
  asyncHandler(getProfessionalById)
);

export default router;
