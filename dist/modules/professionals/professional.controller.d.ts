import { Request, Response } from 'express';
import { AuthRequest } from '../auth/auth';
/**
 * @desc    Récupérer la liste des professionnels actifs pour le formulaire d'avis (PUBLIC)
 * @route   GET /api/professionals/public
 * @access  Public
 */
export declare const getPublicProfessionals: (req: Request, res: Response) => Promise<void>;
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
export declare const getProfessionalById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer les statistiques d'un professionnel
 * @route   GET /api/professionals/:id/stats
 * @access  Privé (Le professionnel lui-même, ou SECRETAIRE/ADMIN)
 */
export declare const getProfessionalStats: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=professional.controller.d.ts.map