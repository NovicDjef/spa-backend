import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import {
  assignClient,
  removeAssignment,
  getClientAssignments,
  getProfessionalAssignments,
  getAllAssignments,
} from './assignment.controller';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// IMPORTANT: La route GET / doit être AVANT la route POST /
// pour éviter que GET / soit interprété comme POST /:quelquechose

// Récupérer TOUTES les assignations (SECRETAIRE, ADMIN uniquement)
router.get(
  '/',
  authorize('SECRETAIRE', 'ADMIN'),
  asyncHandler(getAllAssignments)
);

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
