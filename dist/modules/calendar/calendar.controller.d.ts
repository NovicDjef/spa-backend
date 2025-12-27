import { Response } from 'express';
import { AuthRequest } from '../auth/auth';
/**
 * @desc    Récupérer le calendrier du technicien (vue personnelle)
 * @route   GET /api/calendar/my-bookings
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE)
 */
export declare const getMyCalendar: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer le calendrier complet (vue admin/secrétaire)
 * @route   GET /api/calendar/all-bookings
 * @access  Privé (ADMIN, SECRETAIRE)
 */
export declare const getAllCalendar: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer les créneaux horaires disponibles pour un technicien
 * @route   GET /api/calendar/available-slots
 * @access  Public
 */
export declare const getAvailableSlots: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=calendar.controller.d.ts.map