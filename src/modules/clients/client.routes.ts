import { Router } from 'express';
import * as clientController from './client.controller';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

/**
 * @route   POST /api/clients
 * @desc    Créer un nouveau client (formulaire public)
 * @access  Public
 */
router.post('/', asyncHandler(clientController.createClient));

/**
 * @route   GET /api/clients
 * @desc    Récupérer tous les clients (avec recherche et filtres)
 * @access  Privé (Professionnels uniquement)
 */
router.get(
  '/',
  authenticate,
  asyncHandler(clientController.getClients)
);

/**
 * @route   GET /api/clients/:id
 * @desc    Récupérer un client par ID
 * @access  Privé (Professionnels uniquement)
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(clientController.getClientById)
);

/**
 * @route   PUT /api/clients/:id
 * @desc    Mettre à jour un client
 * @access  Privé (ADMIN uniquement)
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(clientController.updateClient)
);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Supprimer un client
 * @access  Privé (ADMIN uniquement)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(clientController.deleteClient)
);

/**
 * @route   GET /api/clients/search/:query
 * @desc    Rechercher des clients
 * @access  Privé (Professionnels uniquement)
 */
router.get(
  '/search/:query',
  authenticate,
  asyncHandler(clientController.searchClients)
);

export default router;
