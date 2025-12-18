import { Response } from 'express';
import { AuthRequest } from '../auth/auth';
/**
 * @desc    Récupérer tous les traitements d'un client
 * @route   GET /api/traitements/:clientId
 * @access  Privé (Professionnels)
 */
export declare const getTraitementsByClient: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Ajouter un traitement à un dossier client
 * @route   POST /api/traitements/:clientId
 * @access  Privé (Professionnels)
 */
export declare const createTraitement: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Modifier un traitement
 * @route   PUT /api/traitements/:traitementId
 * @access  Privé (Professionnels)
 */
export declare const updateTraitement: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Supprimer un traitement
 * @route   DELETE /api/traitements/:traitementId
 * @access  Privé (Professionnels)
 */
export declare const deleteTraitement: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=traitement.controller.d.ts.map