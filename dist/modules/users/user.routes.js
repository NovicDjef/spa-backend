"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent l'authentification ET le rôle ADMIN
router.use(auth_1.authenticate);
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