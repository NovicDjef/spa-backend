import { Router } from 'express';
import {
  getMyCalendar,
  getAllCalendar,
  getAvailableSlots,
} from './calendar.controller';
import {
  getAuthUrl,
  handleOAuthCallback,
  getCalendarStatus,
} from './oauth.controller';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/calendar/my-bookings
 * @desc    Récupérer le calendrier du technicien (vue personnelle)
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE)
 */
router.get(
  '/my-bookings',
  authenticate,
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE'),
  asyncHandler(getMyCalendar)
);

/**
 * @route   GET /api/calendar/all-bookings
 * @desc    Récupérer le calendrier complet (vue admin/secrétaire)
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.get(
  '/all-bookings',
  authenticate,
  authorize('ADMIN', 'SECRETAIRE'),
  asyncHandler(getAllCalendar)
);

/**
 * @route   GET /api/calendar/available-slots
 * @desc    Récupérer les créneaux horaires disponibles pour un technicien
 * @access  Public
 */
router.get('/available-slots', asyncHandler(getAvailableSlots));

/**
 * @route   GET /api/calendar/auth/url
 * @desc    Obtenir l'URL d'autorisation Google OAuth2
 * @access  Public (restreindre en production)
 */
router.get('/auth/url', asyncHandler(getAuthUrl));

/**
 * @route   POST /api/calendar/auth/callback
 * @desc    Échanger le code d'autorisation contre un refresh token
 * @access  Public (restreindre en production)
 */
router.post('/auth/callback', asyncHandler(handleOAuthCallback));

/**
 * @route   GET /api/calendar/status
 * @desc    Vérifier le statut de la configuration Google Calendar
 * @access  Public
 */
router.get('/status', asyncHandler(getCalendarStatus));

export default router;
