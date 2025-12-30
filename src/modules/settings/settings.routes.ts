import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import * as settingsController from './settings.controller';

const router = Router();

// Toutes les routes nécessitent l'authentification et le rôle ADMIN
router.use(authenticate);
router.use(authorize('ADMIN'));

/**
 * @route   GET /api/settings
 * @desc    Récupérer tous les paramètres système
 * @access  Privé (ADMIN)
 */
router.get('/', asyncHandler(settingsController.getAllSettings));

/**
 * @route   POST /api/settings/batch
 * @desc    Récupérer plusieurs paramètres par leurs clés
 * @access  Privé (ADMIN)
 */
router.post('/batch', asyncHandler(settingsController.getBatchSettings));

/**
 * @route   GET /api/settings/:key
 * @desc    Récupérer un paramètre par sa clé
 * @access  Privé (ADMIN)
 */
router.get('/:key', asyncHandler(settingsController.getSetting));

/**
 * @route   PUT /api/settings/:key
 * @desc    Créer ou mettre à jour un paramètre
 * @access  Privé (ADMIN)
 */
router.put('/:key', asyncHandler(settingsController.upsertSetting));

/**
 * @route   DELETE /api/settings/:key
 * @desc    Supprimer un paramètre
 * @access  Privé (ADMIN)
 */
router.delete('/:key', asyncHandler(settingsController.deleteSetting));

export default router;
