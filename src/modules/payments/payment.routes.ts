import { Router } from 'express';
import {
  createBookingPaymentIntent,
  createGiftCardPaymentIntent,
  createGymSubscriptionPaymentIntent,
  confirmPayment,
  refundPayment,
} from './payment.controller';
import { handleStripeWebhook } from './webhook.controller';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import express from 'express';

const router = Router();

/**
 * IMPORTANT: Le webhook Stripe doit recevoir le raw body (pas JSON parsé)
 * pour vérifier la signature. Cette route doit être définie AVANT le
 * middleware express.json() dans server.ts
 */

/**
 * @route   POST /api/payments/webhook
 * @desc    Webhook Stripe pour les événements de paiement
 * @access  Public (sécurisé par signature Stripe)
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(handleStripeWebhook)
);

/**
 * @route   POST /api/payments/create-intent/booking
 * @desc    Créer un Payment Intent pour une réservation
 * @access  Public
 */
router.post(
  '/create-intent/booking',
  asyncHandler(createBookingPaymentIntent)
);

/**
 * @route   POST /api/payments/create-intent/gift-card
 * @desc    Créer un Payment Intent pour une carte cadeau
 * @access  Public
 */
router.post(
  '/create-intent/gift-card',
  asyncHandler(createGiftCardPaymentIntent)
);

/**
 * @route   POST /api/payments/create-intent/gym-subscription
 * @desc    Créer un Payment Intent pour un abonnement gym
 * @access  Public
 */
router.post(
  '/create-intent/gym-subscription',
  asyncHandler(createGymSubscriptionPaymentIntent)
);

/**
 * @route   POST /api/payments/confirm
 * @desc    Confirmer un paiement (client-side)
 * @access  Public
 */
router.post('/confirm', asyncHandler(confirmPayment));

/**
 * @route   POST /api/payments/refund
 * @desc    Rembourser un paiement
 * @access  Privé (ADMIN uniquement)
 */
router.post(
  '/refund',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(refundPayment)
);

export default router;
