import { Response } from 'express';
import { AuthRequest } from '../auth/auth';
/**
 * @desc    Récupérer la liste des professionnels (MASSOTHERAPEUTE, ESTHETICIENNE)
 * @route   GET /api/professionals
 * @access  Privé (SECRETAIRE, ADMIN uniquement)
 */
export declare const getProfessionals: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer un professionnel par ID avec ses assignations
 * @route   GET /api/professionals/:id
 * @access  Privé (SECRETAIRE, ADMIN uniquement)
 */
export declare const getProfessionalById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @desc    Récupérer les statistiques d'un professionnel
 * @route   GET /api/professionals/:id/stats
 * @access  Privé (Le professionnel lui-même, ou SECRETAIRE/ADMIN)
 */
export declare const getProfessionalStats: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=professional.controller.d.ts.map