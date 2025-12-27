import { Request, Response } from 'express';
/**
 * @desc    Récupérer toutes les catégories de services avec leurs services
 * @route   GET /api/public/services
 * @access  Public
 */
export declare const getAllServices: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer un service par son slug
 * @route   GET /api/public/services/:slug
 * @access  Public
 */
export declare const getServiceBySlug: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer tous les forfaits disponibles
 * @route   GET /api/public/packages
 * @access  Public
 */
export declare const getAllPackages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer un forfait par son slug
 * @route   GET /api/public/packages/:slug
 * @access  Public
 */
export declare const getPackageBySlug: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer tous les types d'abonnements gym
 * @route   GET /api/public/gym-memberships
 * @access  Public
 */
export declare const getGymMemberships: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer les professionnels disponibles pour un service
 * @route   GET /api/public/professionals
 * @access  Public
 */
export declare const getAvailableProfessionals: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=services.controller.d.ts.map