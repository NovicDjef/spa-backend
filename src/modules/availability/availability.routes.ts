import { Router } from 'express';
import {
  getAvailabilities,
  setWorkingHours,
  blockSchedule,
  unblockSchedule,
  deleteAvailability,
  createBulkAvailabilities,
} from './availability.controller';
import {
  setWorkingSchedule,
  getWorkingSchedule,
  addBreak,
  getBreaks,
  deleteBreak,
} from './working-schedule.controller';
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

/**
 * @route   POST /api/availability/working-schedule
 * @desc    Définir les horaires de travail hebdomadaires d'un professionnel
 * @access  Privé (ADMIN uniquement)
 */
router.post(
  '/working-schedule',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(setWorkingSchedule)
);

/**
 * @route   GET /api/availability/working-schedule/:professionalId
 * @desc    Récupérer les horaires de travail hebdomadaires d'un professionnel
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.get(
  '/working-schedule/:professionalId',
  authenticate,
  authorize('ADMIN', 'SECRETAIRE'),
  asyncHandler(getWorkingSchedule)
);

/**
 * @route   POST /api/availability/breaks
 * @desc    Ajouter une pause pour un professionnel
 * @access  Privé (ADMIN uniquement)
 */
router.post(
  '/breaks',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(addBreak)
);

/**
 * @route   GET /api/availability/breaks/:professionalId
 * @desc    Récupérer toutes les pauses d'un professionnel
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.get(
  '/breaks/:professionalId',
  authenticate,
  authorize('ADMIN', 'SECRETAIRE'),
  asyncHandler(getBreaks)
);

/**
 * @route   DELETE /api/availability/breaks/:id
 * @desc    Supprimer (désactiver) une pause
 * @access  Privé (ADMIN uniquement)
 */
router.delete(
  '/breaks/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(deleteBreak)
);

export default router;
