"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const availability_controller_1 = require("./availability.controller");
const auth_1 = require("../auth/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/availability
 * @desc    Récupérer les disponibilités d'un professionnel
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SECRETAIRE'), (0, errorHandler_1.asyncHandler)(availability_controller_1.getAvailabilities));
/**
 * @route   POST /api/availability/working-hours
 * @desc    Définir les heures de travail d'un professionnel
 * @access  Privé (ADMIN, SECRETAIRE)
 */
router.post('/working-hours', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SECRETAIRE'), (0, errorHandler_1.asyncHandler)(availability_controller_1.setWorkingHours));
/**
 * @route   POST /api/availability/block
 * @desc    Bloquer le calendrier d'un professionnel
 * @access  Privé (ADMIN uniquement)
 */
router.post('/block', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(availability_controller_1.blockSchedule));
/**
 * @route   POST /api/availability/unblock
 * @desc    Débloquer le calendrier d'un professionnel
 * @access  Privé (ADMIN uniquement)
 */
router.post('/unblock', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(availability_controller_1.unblockSchedule));
/**
 * @route   POST /api/availability/bulk
 * @desc    Créer des disponibilités en masse
 * @access  Privé (ADMIN uniquement)
 */
router.post('/bulk', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(availability_controller_1.createBulkAvailabilities));
/**
 * @route   DELETE /api/availability/:id
 * @desc    Supprimer une disponibilité
 * @access  Privé (ADMIN uniquement)
 */
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(availability_controller_1.deleteAvailability));
exports.default = router;
//# sourceMappingURL=availability.routes.js.map