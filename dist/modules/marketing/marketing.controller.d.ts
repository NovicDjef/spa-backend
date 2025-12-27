import { Response } from 'express';
import { AuthRequest } from '../auth/auth';
/**
 * @desc    Récupérer les contacts clients avec filtres avancés
 * @route   GET /api/marketing/contacts
 * @access  Privé (ADMIN uniquement)
 */
export declare const getContacts: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Exporter les contacts en CSV
 * @route   GET /api/marketing/contacts/export
 * @access  Privé (ADMIN uniquement)
 */
export declare const exportContacts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const sendIndividualEmail: (req: AuthRequest, res: Response) => Promise<void>;
export declare const sendCampaignEmail: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Obtenir des statistiques pour les campagnes
 * @route   GET /api/marketing/stats
 * @access  Privé (ADMIN uniquement)
 */
export declare const getMarketingStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const generateCampaignMessage: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * Wrapper intelligent qui détecte automatiquement si c'est un envoi individuel ou de groupe
 */
export declare const sendChatGPTCampaign: (req: AuthRequest, res: Response) => Promise<void>;
export declare const sendAiCampaign: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer les logs d'emails avec filtres et pagination
 * @route   GET /api/marketing/email-logs
 * @access  Privé (ADMIN uniquement)
 */
export declare const getEmailLogs: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Obtenir les statistiques des emails envoyés
 * @route   GET /api/marketing/email-stats
 * @access  Privé (ADMIN uniquement)
 */
export declare const getEmailStats: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer les détails d'un email spécifique
 * @route   GET /api/marketing/email-logs/:id
 * @access  Privé (ADMIN uniquement)
 */
export declare const getEmailLogById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer l'historique des campagnes
 * @route   GET /api/marketing/campaigns
 * @access  Privé (ADMIN uniquement)
 */
export declare const getCampaigns: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer les détails d'une campagne spécifique
 * @route   GET /api/marketing/campaigns/:id
 * @access  Privé (ADMIN uniquement)
 */
export declare const getCampaignById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Renvoyer les emails échoués d'une campagne
 * @route   POST /api/marketing/campaigns/:id/resend-failed
 * @access  Privé (ADMIN uniquement)
 */
export declare const resendFailedEmails: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=marketing.controller.d.ts.map