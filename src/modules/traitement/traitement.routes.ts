import { Router } from 'express';
import * as traitementController from './traitement.controller';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/traitements/:clientId
 * @desc    Récupérer tous les traitements d'un client
 * @access  Privé (Professionnels uniquement)
 */
router.get(
  '/:clientId',
  authenticate,
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE'),
  asyncHandler(traitementController.getTraitementsByClient)
);

/**
 * @route   POST /api/traitements/:clientId
 * @desc    Ajouter un traitement à un dossier client
 * @access  Privé (Professionnels uniquement)
 */
router.post(
  '/:clientId',
  authenticate,
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE'),
  asyncHandler(traitementController.createTraitement)
);

/**
 * @route   PUT /api/traitements/:traitementId
 * @desc    Modifier un traitement
 * @access  Privé (Professionnels uniquement)
 */
router.put(
  '/:traitementId',
  authenticate,
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE'),
  asyncHandler(traitementController.updateTraitement)
);

/**
 * @route   DELETE /api/traitements/:traitementId
 * @desc    Supprimer un traitement
 * @access  Privé (Professionnels uniquement)
 */
router.delete(
  '/:traitementId',
  authenticate,
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE'),
  asyncHandler(traitementController.deleteTraitement)
);

export default router;
