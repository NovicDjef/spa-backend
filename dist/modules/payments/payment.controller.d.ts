import { Response } from 'express';
import { AuthRequest } from '../auth/auth';
/**
 * @desc    Créer un Payment Intent pour une réservation
 * @route   POST /api/payments/create-intent/booking
 * @access  Public
 */
export declare const createBookingPaymentIntent: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Créer un Payment Intent pour une carte cadeau
 * @route   POST /api/payments/create-intent/gift-card
 * @access  Public
 */
export declare const createGiftCardPaymentIntent: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Créer un Payment Intent pour un abonnement gym
 * @route   POST /api/payments/create-intent/gym-subscription
 * @access  Public
 */
export declare const createGymSubscriptionPaymentIntent: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Confirmer le paiement (webhook ou client-side)
 * @route   POST /api/payments/confirm
 * @access  Public
 */
export declare const confirmPayment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @desc    Rembourser un paiement
 * @route   POST /api/payments/refund
 * @access  Privé (ADMIN)
 */
export declare const refundPayment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=payment.controller.d.ts.map