import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import {
  getProfessionals,
  getProfessionalById,
  getProfessionalStats,
} from './professional.controller';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Récupérer la liste des professionnels (SECRETAIRE, ADMIN uniquement)
router.get(
  '/',
  authorize('SECRETAIRE', 'ADMIN'),
  asyncHandler(getProfessionals)
);

// Récupérer un professionnel par ID (SECRETAIRE, ADMIN uniquement)
router.get(
  '/:id',
  authorize('SECRETAIRE', 'ADMIN'),
  asyncHandler(getProfessionalById)
);

// Récupérer les statistiques d'un professionnel
router.get(
  '/:id/stats',
  asyncHandler(getProfessionalStats)
);

export default router;
