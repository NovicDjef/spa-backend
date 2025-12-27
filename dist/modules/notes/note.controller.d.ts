import { Response } from 'express';
import { AuthRequest } from '../auth/auth';
/**
 * @desc    Récupérer toutes les notes d'un client
 * @route   GET /api/notes/:clientId
 * @access  Privé (Professionnels)
 */
export declare const getNotesByClient: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Ajouter une note à un dossier client
 * @route   POST /api/notes/:clientId
 * @access  Privé (Professionnels)
 */
export declare const createNote: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Modifier une note
 * @route   PUT /api/notes/:noteId
 * @access  Privé (Professionnels - auteur uniquement, 24h max sauf ADMIN)
 */
export declare const updateNote: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Supprimer une note
 * @route   DELETE /api/notes/:noteId
 * @access  Privé (Professionnels - auteur uniquement dans les 24h, ADMIN sans limite)
 */
export declare const deleteNote: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=note.controller.d.ts.map