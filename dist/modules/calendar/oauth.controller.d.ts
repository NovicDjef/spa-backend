import { Request, Response } from 'express';
/**
 * @desc    Obtenir l'URL d'autorisation Google OAuth2
 * @route   GET /api/calendar/auth/url
 * @access  Public (mais devrait être restreint en production)
 */
export declare const getAuthUrl: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Échanger le code d'autorisation contre un refresh token
 * @route   POST /api/calendar/auth/callback
 * @access  Public (mais devrait être restreint en production)
 */
export declare const handleOAuthCallback: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Vérifier le statut de la configuration Google Calendar
 * @route   GET /api/calendar/status
 * @access  Public
 */
export declare const getCalendarStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=oauth.controller.d.ts.map