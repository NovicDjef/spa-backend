import { Response } from 'express';
import { AuthRequest } from '../auth/auth';
/**
 * @desc    Récupérer tous les feedbacks clients avec pagination et filtres (ADMIN)
 * @route   GET /api/automation/feedbacks
 * @access  Privé (ADMIN uniquement)
 */
export declare const getAllFeedbacks: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer les statistiques sur les feedbacks clients (ADMIN)
 * @route   GET /api/automation/feedbacks/stats
 * @access  Privé (ADMIN uniquement)
 */
export declare const getFeedbackStats: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer tous les logs d'emails avec pagination et filtres (ADMIN)
 * @route   GET /api/automation/email-logs
 * @access  Privé (ADMIN uniquement)
 */
export declare const getAllEmailLogs: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer les statistiques sur les emails envoyés (ADMIN)
 * @route   GET /api/automation/email-logs/stats
 * @access  Privé (ADMIN uniquement)
 */
export declare const getEmailStats: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer un feedback spécifique par ID (ADMIN)
 * @route   GET /api/automation/feedbacks/:id
 * @access  Privé (ADMIN uniquement)
 */
export declare const getFeedbackById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer les notes avec statut d'email (ADMIN)
 * @route   GET /api/automation/notes
 * @access  Privé (ADMIN uniquement)
 */
export declare const getNotesWithEmailStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=automation.controller.d.ts.map