"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const calendar_controller_1 = require("./calendar.controller");
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
exports.default = router;
//# sourceMappingURL=calendar.routes.js.map