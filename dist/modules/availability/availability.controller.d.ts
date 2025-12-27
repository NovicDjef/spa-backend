import { Response } from 'express';
import { AuthRequest } from '../auth/auth';
/**
 * @desc    Récupérer les disponibilités d'un professionnel
 * @route   GET /api/availability
 * @access  Privé (ADMIN, SECRETAIRE)
 */
export declare const getAvailabilities: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Définir les heures de travail d'un professionnel
 * @route   POST /api/availability/working-hours
 * @access  Privé (ADMIN, SECRETAIRE)
 */
export declare const setWorkingHours: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Bloquer le calendrier d'un professionnel
 * @route   POST /api/availability/block
 * @access  Privé (ADMIN uniquement)
 */
export declare const blockSchedule: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Débloquer le calendrier d'un professionnel
 * @route   POST /api/availability/unblock
 * @access  Privé (ADMIN uniquement)
 */
export declare const unblockSchedule: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Supprimer une disponibilité
 * @route   DELETE /api/availability/:id
 * @access  Privé (ADMIN uniquement)
 */
export declare const deleteAvailability: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Créer des disponibilités en masse (par exemple pour une semaine)
 * @route   POST /api/availability/bulk
 * @access  Privé (ADMIN uniquement)
 */
export declare const createBulkAvailabilities: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=availability.controller.d.ts.map