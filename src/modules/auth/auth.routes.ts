import { Router } from 'express';
import * as authController from './auth.controller';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un professionnel
 * @access  Public
 */
router.post('/register', asyncHandler(authController.register));

/**
 * @route   POST /api/auth/login
 * @desc    Connexion
 * @access  Public
 */
router.post('/login', asyncHandler(authController.login));

/**
 * @route   POST /api/auth/refresh
 * @desc    Rafraîchir le token
 * @access  Public
 */
router.post('/refresh', asyncHandler(authController.refreshToken));

export default router;
