import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import {
  assignClient,
  removeAssignment,
  getClientAssignments,
  getProfessionalAssignments,
} from './assignment.controller';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Assigner un client à un professionnel (SECRETAIRE, ADMIN uniquement)
router.post(
  '/',
  authorize('SECRETAIRE', 'ADMIN'),
  asyncHandler(assignClient)
);

// Supprimer une assignation (SECRETAIRE, ADMIN uniquement)
router.delete(
  '/:clientId/:professionalId',
  authorize('SECRETAIRE', 'ADMIN'),
  asyncHandler(removeAssignment)
);

// Récupérer les assignations d'un client (SECRETAIRE, ADMIN uniquement)
router.get(
  '/client/:clientId',
  authorize('SECRETAIRE', 'ADMIN'),
  asyncHandler(getClientAssignments)
);

// Récupérer les clients assignés à un professionnel
router.get(
  '/professional/:professionalId',
  asyncHandler(getProfessionalAssignments)
);

export default router;
