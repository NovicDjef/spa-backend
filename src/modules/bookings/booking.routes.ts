import { Router } from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updateBooking,
  cancelBooking,
} from './booking.controller';
import {
  createOnlineBooking,
  moveBooking,
  getBookingHistoryById,
} from './booking.controller.enhanced';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

/**
 * @route   POST /api/bookings
 * @desc    Créer une nouvelle réservation
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SECRETAIRE'),
  asyncHandler(createBooking)
);

/**
 * @route   GET /api/bookings
 * @desc    Récupérer toutes les réservations (avec filtres)
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'SECRETAIRE'),
  asyncHandler(getAllBookings)
);

/**
 * @route   GET /api/bookings/:id
 * @desc    Récupérer une réservation par son ID
 * @access  Privé (ADMIN, SECRETAIRE, MASSOTHERAPEUTE, ESTHETICIENNE)
 */
router.get(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE'),
  asyncHandler(getBookingById)
);

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Changer le statut d'une réservation
 * @access  Privé (ADMIN, SECRETAIRE, MASSOTHERAPEUTE, ESTHETICIENNE)
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE'),
  asyncHandler(updateBookingStatus)
);

/**
 * @route   PUT /api/bookings/:id
 * @desc    Modifier une réservation (date, heure, service)
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SECRETAIRE'),
  asyncHandler(updateBooking)
);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Annuler une réservation
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SECRETAIRE'),
  asyncHandler(cancelBooking)
);

/**
 * @route   POST /api/bookings/online
 * @desc    Créer une réservation en ligne (depuis le site web)
 * @access  Public
 */
router.post('/online', asyncHandler(createOnlineBooking));

/**
 * @route   PATCH /api/bookings/:id/move
 * @desc    Déplacer une réservation (drag & drop)
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.patch(
  '/:id/move',
  authenticate,
  authorize('ADMIN', 'SECRETAIRE'),
  asyncHandler(moveBooking)
);

/**
 * @route   GET /api/bookings/:id/history
 * @desc    Obtenir l'historique d'une réservation
 * @access  Privé
 */
router.get('/:id/history', authenticate, asyncHandler(getBookingHistoryById));

export default router;
