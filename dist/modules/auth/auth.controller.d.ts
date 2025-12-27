import { Request, Response } from 'express';
/**
 * @desc    Inscription d'un professionnel
 * @route   POST /api/auth/register
 * @access  Public
 */
export declare const register: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    Connexion
 * @route   POST /api/auth/login
 * @access  Public
 */
export declare const login: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    Rafraîchir le token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export declare const refreshToken: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map