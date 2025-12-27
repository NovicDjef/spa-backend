"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("./booking.controller");
const auth_1 = require("../auth/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/bookings
 * @desc    Créer une nouvelle réservation
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SECRETAIRE'), (0, errorHandler_1.asyncHandler)(booking_controller_1.createBooking));
/**
 * @route   GET /api/bookings
 * @desc    Récupérer toutes les réservations (avec filtres)
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SECRETAIRE'), (0, errorHandler_1.asyncHandler)(booking_controller_1.getAllBookings));
/**
 * @route   GET /api/bookings/:id
 * @desc    Récupérer une réservation par son ID
 * @access  Privé (ADMIN, SECRETAIRE, MASSOTHERAPEUTE, ESTHETICIENNE)
 */
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE'), (0, errorHandler_1.asyncHandler)(booking_controller_1.getBookingById));
/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Changer le statut d'une réservation
 * @access  Privé (ADMIN, SECRETAIRE, MASSOTHERAPEUTE, ESTHETICIENNE)
 */
router.patch('/:id/status', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE'), (0, errorHandler_1.asyncHandler)(booking_controller_1.updateBookingStatus));
/**
 * @route   PUT /api/bookings/:id
 * @desc    Modifier une réservation (date, heure, service)
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SECRETAIRE'), (0, errorHandler_1.asyncHandler)(booking_controller_1.updateBooking));
/**
 * @route   DELETE /api/bookings/:id
 * @desc    Annuler une réservation
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SECRETAIRE'), (0, errorHandler_1.asyncHandler)(booking_controller_1.cancelBooking));
exports.default = router;
//# sourceMappingURL=booking.routes.js.map