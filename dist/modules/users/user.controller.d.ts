import { Response } from 'express';
import { AuthRequest } from '../auth/auth';
/**
 * @desc    Créer un employé (par l'admin)
 * @route   POST /api/users
 * @access  Privé (ADMIN uniquement)
 */
export declare const createUser: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer tous les employés
 * @route   GET /api/users
 * @access  Privé (ADMIN uniquement)
 */
export declare const getAllUsers: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer un employé par ID
 * @route   GET /api/users/:id
 * @access  Privé (ADMIN uniquement)
 */
export declare const getUserById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Mettre à jour un employé
 * @route   PUT /api/users/:id
 * @access  Privé (ADMIN uniquement)
 */
export declare const updateUser: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Supprimer un employé
 * @route   DELETE /api/users/:id
 * @access  Privé (ADMIN uniquement)
 */
export declare const deleteUser: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Réinitialiser le mot de passe d'un employé
 * @route   POST /api/users/:id/reset-password
 * @access  Privé (ADMIN uniquement)
 */
export declare const resetPassword: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Activer/Désactiver un employé
 * @route   PATCH /api/users/:id/toggle-status
 * @access  Privé (ADMIN uniquement)
 */
export declare const toggleUserStatus: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map