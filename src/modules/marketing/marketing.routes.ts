import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import {
  getContacts,
  exportContacts,
  sendIndividualEmail,
  sendCampaignEmail,
  getMarketingStats,
  generateCampaignMessage,
  sendAiCampaign,
  sendChatGPTCampaign,
  getEmailLogs,
  getEmailStats,
  getEmailLogById,
  getCampaigns,
  getCampaignById,
  resendFailedEmails,
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

/**
 * @route   POST /api/marketing/generate-message
 * @desc    Générer un message marketing avec ChatGPT
 * @access  ADMIN uniquement
 */
router.post('/generate-message', asyncHandler(generateCampaignMessage));

// Routes supprimées - utilisez /send-email/individual ou /send-email/campaign à la place

/**
 * @route   GET /api/marketing/email-logs
 * @desc    Récupérer tous les logs d'emails avec filtres
 * @access  ADMIN uniquement
 */
router.get('/email-logs', asyncHandler(getEmailLogs));

/**
 * @route   GET /api/marketing/email-stats
 * @desc    Obtenir les statistiques des emails envoyés
 * @access  ADMIN uniquement
 */
router.get('/email-stats', asyncHandler(getEmailStats));

/**
 * @route   GET /api/marketing/email-logs/:id
 * @desc    Récupérer les détails d'un email spécifique
 * @access  ADMIN uniquement
 */
router.get('/email-logs/:id', asyncHandler(getEmailLogById));

/**
 * @route   GET /api/marketing/campaigns
 * @desc    Récupérer l'historique des campagnes marketing
 * @access  ADMIN uniquement
 */
router.get('/campaigns', asyncHandler(getCampaigns));

/**
 * @route   GET /api/marketing/campaigns/:id
 * @desc    Récupérer les détails d'une campagne spécifique avec tous ses emails
 * @access  ADMIN uniquement
 */
router.get('/campaigns/:id', asyncHandler(getCampaignById));

/**
 * @route   POST /api/marketing/campaigns/:id/resend-failed
 * @desc    Renvoyer les emails échoués d'une campagne
 * @access  ADMIN uniquement
 */
router.post('/campaigns/:id/resend-failed', asyncHandler(resendFailedEmails));

export default router;
