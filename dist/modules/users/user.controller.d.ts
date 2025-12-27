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
/**
 * @desc    Récupérer les avis détaillés d'un employé
 * @route   GET /api/users/:id/reviews
 * @access  Privé (ADMIN uniquement)
 */
export declare const getUserReviews: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Changer son propre mot de passe (pour tous les employés)
 * @route   PUT /api/users/me/change-password
 * @access  Privé (Tous les employés connectés)
 */
export declare const changeOwnPassword: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer son propre profil et le mettre à jour
 * @route   GET /api/users/me
 * @access  Privé (Tous les employés connectés)
 */
export declare const getMyProfile: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Mettre à jour son propre profil (nom, prénom, téléphone, adresse, photo)
 * @route   PUT /api/users/me
 * @access  Privé (Tous les employés connectés)
 */
export declare const updateMyProfile: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Uploader sa signature (pour les reçus d'assurance)
 * @route   POST /api/users/me/upload-signature
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE)
 */
export declare const uploadSignature: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer sa signature
 * @route   GET /api/users/me/signature
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE)
 */
export declare const getMySignature: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Supprimer sa signature
 * @route   DELETE /api/users/me/signature
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE)
 */
export declare const deleteMySignature: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map