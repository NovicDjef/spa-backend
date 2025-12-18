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
//# sourceMappingURL=marketing.controller.d.ts.map