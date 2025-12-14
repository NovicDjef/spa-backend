import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import {
  getContacts,
  exportContacts,
  sendIndividualEmail,
  sendCampaignEmail,
  getMarketingStats,
} from './marketing.controller';

const router = Router();

// Toutes les routes nécessitent l'authentification ET le rôle ADMIN
router.use(authenticate);
router.use(authorize('ADMIN'));

/**
 * @route   GET /api/marketing/contacts
 * @desc    Récupérer les contacts clients avec filtres avancés
 * @access  ADMIN uniquement
 */
router.get('/contacts', asyncHandler(getContacts));

/**
 * @route   GET /api/marketing/contacts/export
 * @desc    Exporter les contacts en CSV
 * @access  ADMIN uniquement
 */
router.get('/contacts/export', asyncHandler(exportContacts));

/**
 * @route   POST /api/marketing/send-email/individual
 * @desc    Envoyer un email à un client spécifique
 * @access  ADMIN uniquement
 */
router.post('/send-email/individual', asyncHandler(sendIndividualEmail));

/**
 * @route   POST /api/marketing/send-email/campaign
 * @desc    Envoyer un email en masse (campagne)
 * @access  ADMIN uniquement
 */
router.post('/send-email/campaign', asyncHandler(sendCampaignEmail));

/**
 * @route   GET /api/marketing/stats
 * @desc    Obtenir des statistiques pour les campagnes
 * @access  ADMIN uniquement
 */
router.get('/stats', asyncHandler(getMarketingStats));

export default router;
