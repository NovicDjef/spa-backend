import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import { uploadSignatureMiddleware } from '../../config/multer';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetPassword,
  toggleUserStatus,
  getUserReviews,
  changeOwnPassword,
  getMyProfile,
  updateMyProfile,
  uploadSignature,
  getMySignature,
  deleteMySignature,
} from './user.controller';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// ============================================
// ROUTES POUR TOUS LES EMPLOYÉS (ME)
// ============================================

/**
 * @route   GET /api/users/me
 * @desc    Récupérer son propre profil
 * @access  Tous les employés connectés
 */
router.get('/me', asyncHandler(getMyProfile));

/**
 * @route   PUT /api/users/me
 * @desc    Mettre à jour son propre profil
 * @access  Tous les employés connectés
 */
router.put('/me', asyncHandler(updateMyProfile));

/**
 * @route   PUT /api/users/me/change-password
 * @desc    Changer son propre mot de passe
 * @access  Tous les employés connectés
 */
router.put('/me/change-password', asyncHandler(changeOwnPassword));

/**
 * @route   POST /api/users/me/upload-signature
 * @desc    Uploader sa signature pour les reçus d'assurance
 * @access  MASSOTHERAPEUTE et ESTHETICIENNE uniquement
 */
router.post(
  '/me/upload-signature',
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE'),
  uploadSignatureMiddleware.single('signature'),
  asyncHandler(uploadSignature)
);

/**
 * @route   GET /api/users/me/signature
 * @desc    Récupérer sa signature actuelle
 * @access  MASSOTHERAPEUTE et ESTHETICIENNE uniquement
 */
router.get(
  '/me/signature',
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE'),
  asyncHandler(getMySignature)
);

/**
 * @route   DELETE /api/users/me/signature
 * @desc    Supprimer sa signature
 * @access  MASSOTHERAPEUTE et ESTHETICIENNE uniquement
 */
router.delete(
  '/me/signature',
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE'),
  asyncHandler(deleteMySignature)
);

// ============================================
// ROUTES ADMIN UNIQUEMENT
// ============================================

/**
 * @route   POST /api/users
 * @desc    Créer un employé
 * @access  ADMIN uniquement
 */
router.post('/',
  authorize('ADMIN'),
  asyncHandler(createUser));

/**
 * @route   GET /api/users
 * @desc    Récupérer tous les employés
 * @access  ADMIN et SECRETAIRE uniquement
 */
router.get('/', 
  authorize('ADMIN', 'SECRETAIRE'),
  asyncHandler(getAllUsers));

/**
 * @route   GET /api/users/:id/reviews
 * @desc    Récupérer les avis détaillés d'un employé
 * @access  ADMIN uniquement
 */
router.get('/:id/reviews',
  authorize('ADMIN'),
  asyncHandler(getUserReviews));

/**
 * @route   GET /api/users/:id
 * @desc    Récupérer un employé par ID
 * @access  ADMIN uniquement
 */
router.get('/:id',
  authorize('ADMIN'),
  asyncHandler(getUserById));

/**
 * @route   PUT /api/users/:id
 * @desc    Mettre à jour un employé
 * @access  ADMIN uniquement
 */
router.put('/:id', 
  authorize('ADMIN'),
  asyncHandler(updateUser));

/**
 * @route   DELETE /api/users/:id
 * @desc    Supprimer un employé
 * @access  ADMIN uniquement
 */
router.delete('/:id', 
  authorize('ADMIN'),
  asyncHandler(deleteUser));

/**
 * @route   POST /api/users/:id/reset-password
 * @desc    Réinitialiser le mot de passe d'un employé
 * @access  ADMIN uniquement
 */
router.post('/:id/reset-password', 
  authorize('ADMIN'),
  asyncHandler(resetPassword));

/**
 * @route   PATCH /api/users/:id/toggle-status
 * @desc    Activer/Désactiver un employé
 * @access  ADMIN uniquement
 */
router.patch('/:id/toggle-status', 
  authorize('ADMIN'),
  asyncHandler(toggleUserStatus));

export default router;
