import { Response } from 'express';
import { AuthRequest } from '../auth/auth';
/**
 * @desc    Créer une nouvelle réservation
 * @route   POST /api/bookings
 * @access  Privé (ADMIN, SECRETAIRE)
 */
export declare const createBooking: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer toutes les réservations (avec filtres)
 * @route   GET /api/bookings
 * @access  Privé (ADMIN, SECRETAIRE)
 */
export declare const getAllBookings: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Récupérer une réservation par son ID
 * @route   GET /api/bookings/:id
 * @access  Privé (ADMIN, SECRETAIRE, MASSOTHERAPEUTE, ESTHETICIENNE)
 */
export declare const getBookingById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Changer le statut d'une réservation
 * @route   PATCH /api/bookings/:id/status
 * @access  Privé (ADMIN, SECRETAIRE, MASSOTHERAPEUTE, ESTHETICIENNE)
 */
export declare const updateBookingStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Modifier une réservation (date, heure, service)
 * @route   PUT /api/bookings/:id
 * @access  Privé (ADMIN, SECRETAIRE)
 */
export declare const updateBooking: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Annuler une réservation
 * @route   DELETE /api/bookings/:id
 * @access  Privé (ADMIN, SECRETAIRE)
 */
export declare const cancelBooking: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=booking.controller.d.ts.map