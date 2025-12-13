import { Router } from 'express';
import * as noteController from './note.controller';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/notes/:clientId
 * @desc    Récupérer toutes les notes d'un client
 * @access  Privé (Professionnels uniquement)
 */
router.get(
  '/:clientId',
  authenticate,
  asyncHandler(noteController.getNotesByClient)
);

/**
 * @route   POST /api/notes/:clientId
 * @desc    Ajouter une note à un dossier client
 * @access  Privé (Professionnels uniquement)
 */
router.post(
  '/:clientId',
  authenticate,
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'),
  asyncHandler(noteController.createNote)
);

/**
 * @route   PUT /api/notes/:noteId
 * @desc    Modifier une note (seulement l'auteur ou ADMIN)
 * @access  Privé
 */
router.put(
  '/:noteId',
  authenticate,
  asyncHandler(noteController.updateNote)
);

/**
 * @route   DELETE /api/notes/:noteId
 * @desc    Supprimer une note (ADMIN uniquement)
 * @access  Privé (ADMIN uniquement)
 */
router.delete(
  '/:noteId',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(noteController.deleteNote)
);

export default router;
