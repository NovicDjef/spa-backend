"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const calendar_controller_1 = require("./calendar.controller");
const oauth_controller_1 = require("./oauth.controller");
const auth_1 = require("../auth/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/calendar/my-bookings
 * @desc    Récupérer le calendrier du technicien (vue personnelle)
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE)
 */
router.get('/my-bookings', auth_1.authenticate, (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE'), (0, errorHandler_1.asyncHandler)(calendar_controller_1.getMyCalendar));
/**
 * @route   GET /api/calendar/all-bookings
 * @desc    Récupérer le calendrier complet (vue admin/secrétaire)
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.get('/all-bookings', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SECRETAIRE'), (0, errorHandler_1.asyncHandler)(calendar_controller_1.getAllCalendar));
/**
 * @route   GET /api/calendar/available-slots
 * @desc    Récupérer les créneaux horaires disponibles pour un technicien
 * @access  Public
 */
router.get('/available-slots', (0, errorHandler_1.asyncHandler)(calendar_controller_1.getAvailableSlots));
/**
 * @route   GET /api/calendar/auth/url
 * @desc    Obtenir l'URL d'autorisation Google OAuth2
 * @access  Public (restreindre en production)
 */
router.get('/auth/url', (0, errorHandler_1.asyncHandler)(oauth_controller_1.getAuthUrl));
/**
 * @route   POST /api/calendar/auth/callback
 * @desc    Échanger le code d'autorisation contre un refresh token
 * @access  Public (restreindre en production)
 */
router.post('/auth/callback', (0, errorHandler_1.asyncHandler)(oauth_controller_1.handleOAuthCallback));
/**
 * @route   GET /api/calendar/status
 * @desc    Vérifier le statut de la configuration Google Calendar
 * @access  Public
 */
router.get('/status', (0, errorHandler_1.asyncHandler)(oauth_controller_1.getCalendarStatus));
exports.default = router;
//# sourceMappingURL=calendar.routes.js.map