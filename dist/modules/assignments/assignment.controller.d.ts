import { Response } from 'express';
import { AuthRequest } from '../auth/auth';
/**
 * @desc    Assigner un client à un professionnel
 * @route   POST /api/assignments
 * @access  Privé (SECRETAIRE, ADMIN uniquement)
 */
export declare const assignClient: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Supprimer la plus récente assignation d'un client à un professionnel
 * @route   DELETE /api/assignments/:clientId/:professionalId
 * @access  Privé (SECRETAIRE, ADMIN uniquement)
 * @note    Supprime uniquement la plus récente assignation. Pour supprimer toutes les assignations,
 *          appelez cette route plusieurs fois ou utilisez DELETE /api/assignments/all/:clientId/:professionalId
 */
export declare const removeAssignment: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer toutes les assignations d'un client
 * @route   GET /api/assignments/client/:clientId
 * @access  Privé (SECRETAIRE, ADMIN uniquement)
 */
export declare const getClientAssignments: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer tous les clients assignés à un professionnel
 * @route   GET /api/assignments/professional/:professionalId
 * @access  Privé (Le professionnel lui-même, ou SECRETAIRE/ADMIN)
 */
export declare const getProfessionalAssignments: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer TOUTES les assignations (pour admin/secrétaire)
 * @route   GET /api/assignments
 * @access  Privé (SECRETAIRE, ADMIN uniquement)
 */
export declare const getAllAssignments: (_req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=assignment.controller.d.ts.map