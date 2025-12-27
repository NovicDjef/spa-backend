import { Router } from 'express';
import {
  getAvailabilities,
  setWorkingHours,
  blockSchedule,
  unblockSchedule,
  deleteAvailability,
  createBulkAvailabilities,
} from './availability.controller';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/availability
 * @desc    Récupérer les disponibilités d'un professionnel
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'SECRETAIRE'),
  asyncHandler(getAvailabilities)
);

/**
 * @route   POST /api/availability/working-hours
 * @desc    Définir les heures de travail d'un professionnel
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.post(
  '/working-hours',
  authenticate,
  authorize('ADMIN', 'SECRETAIRE'),
  asyncHandler(setWorkingHours)
);

/**
 * @route   POST /api/availability/block
 * @desc    Bloquer le calendrier d'un professionnel
 * @access  Privé (ADMIN uniquement)
 */
router.post(
  '/block',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(blockSchedule)
);

/**
 * @route   POST /api/availability/unblock
 * @desc    Débloquer le calendrier d'un professionnel
 * @access  Privé (ADMIN uniquement)
 */
router.post(
  '/unblock',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(unblockSchedule)
);

/**
 * @route   POST /api/availability/bulk
 * @desc    Créer des disponibilités en masse
 * @access  Privé (ADMIN uniquement)
 */
router.post(
  '/bulk',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(createBulkAvailabilities)
);

/**
 * @route   DELETE /api/availability/:id
 * @desc    Supprimer une disponibilité
 * @access  Privé (ADMIN uniquement)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(deleteAvailability)
);

export default router;
