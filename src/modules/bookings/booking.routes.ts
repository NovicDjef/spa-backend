import { Router } from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updateBooking,
  cancelBooking,
} from './booking.controller';
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

export default router;
