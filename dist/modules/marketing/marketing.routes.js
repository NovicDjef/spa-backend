"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const marketing_controller_1 = require("./marketing.controller");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent l'authentification ET le rôle ADMIN
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('ADMIN'));
/**
 * @route   GET /api/marketing/contacts
 * @desc    Récupérer les contacts clients avec filtres avancés
 * @access  ADMIN uniquement
 */
router.get('/contacts', (0, errorHandler_1.asyncHandler)(marketing_controller_1.getContacts));
/**
 * @route   GET /api/marketing/contacts/export
 * @desc    Exporter les contacts en CSV
 * @access  ADMIN uniquement
 */
router.get('/contacts/export', (0, errorHandler_1.asyncHandler)(marketing_controller_1.exportContacts));
/**
 * @route   POST /api/marketing/send-email/individual
 * @desc    Envoyer un email à un client spécifique
 * @access  ADMIN uniquement
 */
router.post('/send-email/individual', (0, errorHandler_1.asyncHandler)(marketing_controller_1.sendIndividualEmail));
/**
 * @route   POST /api/marketing/send-email/campaign
 * @desc    Envoyer un email en masse (campagne)
 * @access  ADMIN uniquement
 */
router.post('/send-email/campaign', (0, errorHandler_1.asyncHandler)(marketing_controller_1.sendCampaignEmail));
/**
 * @route   GET /api/marketing/stats
 * @desc    Obtenir des statistiques pour les campagnes
 * @access  ADMIN uniquement
 */
router.get('/stats', (0, errorHandler_1.asyncHandler)(marketing_controller_1.getMarketingStats));
exports.default = router;
//# sourceMappingURL=marketing.routes.js.map