"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const multer_1 = require("../../config/multer");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent l'authentification
router.use(auth_1.authenticate);
// ============================================
// ROUTES POUR TOUS LES EMPLOYÉS (ME)
// ============================================
/**
 * @route   GET /api/users/me
 * @desc    Récupérer son propre profil
 * @access  Tous les employés connectés
 */
router.get('/me', (0, errorHandler_1.asyncHandler)(user_controller_1.getMyProfile));
/**
 * @route   PUT /api/users/me
 * @desc    Mettre à jour son propre profil
 * @access  Tous les employés connectés
 */
router.put('/me', (0, errorHandler_1.asyncHandler)(user_controller_1.updateMyProfile));
/**
 * @route   PUT /api/users/me/change-password
 * @desc    Changer son propre mot de passe
 * @access  Tous les employés connectés
 */
router.put('/me/change-password', (0, errorHandler_1.asyncHandler)(user_controller_1.changeOwnPassword));
/**
 * @route   POST /api/users/me/upload-signature
 * @desc    Uploader sa signature pour les reçus d'assurance
 * @access  MASSOTHERAPEUTE et ESTHETICIENNE uniquement
 */
router.post('/me/upload-signature', (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE'), multer_1.uploadSignatureMiddleware.single('signature'), (0, errorHandler_1.asyncHandler)(user_controller_1.uploadSignature));
/**
 * @route   GET /api/users/me/signature
 * @desc    Récupérer sa signature actuelle
 * @access  MASSOTHERAPEUTE et ESTHETICIENNE uniquement
 */
router.get('/me/signature', (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE'), (0, errorHandler_1.asyncHandler)(user_controller_1.getMySignature));
/**
 * @route   DELETE /api/users/me/signature
 * @desc    Supprimer sa signature
 * @access  MASSOTHERAPEUTE et ESTHETICIENNE uniquement
 */
router.delete('/me/signature', (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE'), (0, errorHandler_1.asyncHandler)(user_controller_1.deleteMySignature));
// ============================================
// ROUTES ADMIN UNIQUEMENT
// ============================================
/**
 * @route   POST /api/users
 * @desc    Créer un employé
 * @access  ADMIN uniquement
 */
router.post('/', (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(user_controller_1.createUser));
/**
 * @route   GET /api/users
 * @desc    Récupérer tous les employés
 * @access  ADMIN et SECRETAIRE uniquement
 */
router.get('/', (0, auth_1.authorize)('ADMIN', 'SECRETAIRE'), (0, errorHandler_1.asyncHandler)(user_controller_1.getAllUsers));
/**
 * @route   GET /api/users/:id/reviews
 * @desc    Récupérer les avis détaillés d'un employé
 * @access  ADMIN uniquement
 */
router.get('/:id/reviews', (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(user_controller_1.getUserReviews));
/**
 * @route   GET /api/users/:id
 * @desc    Récupérer un employé par ID
 * @access  ADMIN uniquement
 */
router.get('/:id', (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(user_controller_1.getUserById));
/**
 * @route   PUT /api/users/:id
 * @desc    Mettre à jour un employé
 * @access  ADMIN uniquement
 */
router.put('/:id', (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(user_controller_1.updateUser));
/**
 * @route   DELETE /api/users/:id
 * @desc    Supprimer un employé
 * @access  ADMIN uniquement
 */
router.delete('/:id', (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(user_controller_1.deleteUser));
/**
 * @route   POST /api/users/:id/reset-password
 * @desc    Réinitialiser le mot de passe d'un employé
 * @access  ADMIN uniquement
 */
router.post('/:id/reset-password', (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(user_controller_1.resetPassword));
/**
 * @route   PATCH /api/users/:id/toggle-status
 * @desc    Activer/Désactiver un employé
 * @access  ADMIN uniquement
 */
router.patch('/:id/toggle-status', (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(user_controller_1.toggleUserStatus));
exports.default = router;
//# sourceMappingURL=user.routes.js.map