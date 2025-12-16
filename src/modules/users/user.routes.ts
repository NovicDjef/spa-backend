import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetPassword,
  toggleUserStatus,
} from './user.controller';

const router = Router();

// Toutes les routes nécessitent l'authentification ET le rôle ADMIN
router.use(authenticate);

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
