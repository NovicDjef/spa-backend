"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const receipt_controller_1 = require("./receipt.controller");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/receipts/massage-services
 * @desc    Récupérer la liste des services de massage avec leurs prix
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.get('/massage-services', auth_1.authenticate, (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(receipt_controller_1.getMassageServices));
/**
 * @route   POST /api/receipts/preview
 * @desc    Générer un aperçu du reçu PDF sans le sauvegarder ni l'envoyer
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.post('/preview', auth_1.authenticate, (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(receipt_controller_1.previewReceipt));
/**
 * @route   POST /api/receipts/send
 * @desc    Créer un reçu et l'envoyer au client (après prévisualisation)
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.post('/send', auth_1.authenticate, (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(receipt_controller_1.createAndSendReceipt));
/**
 * @route   POST /api/receipts
 * @desc    Créer un reçu d'assurance et l'envoyer au client (OLD - rétrocompatibilité)
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(receipt_controller_1.createReceipt));
/**
 * @route   GET /api/receipts
 * @desc    Récupérer tous les reçus créés par le thérapeute
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(receipt_controller_1.getReceipts));
/**
 * @route   GET /api/receipts/:id/pdf
 * @desc    Générer et afficher le PDF d'un reçu existant
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.get('/:id/pdf', auth_1.authenticate, (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(receipt_controller_1.getReceiptPDF));
/**
 * @route   GET /api/receipts/:id
 * @desc    Récupérer un reçu par ID
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(receipt_controller_1.getReceiptById));
/**
 * @route   POST /api/receipts/:id/resend
 * @desc    Renvoyer un reçu par email au client (si déjà envoyé)
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.post('/:id/resend', auth_1.authenticate, (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(receipt_controller_1.resendReceipt));
exports.default = router;
//# sourceMappingURL=receipt.routes.js.map