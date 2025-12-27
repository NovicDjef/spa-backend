"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const webhook_controller_1 = require("./webhook.controller");
const auth_1 = require("../auth/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const express_2 = __importDefault(require("express"));
const router = (0, express_1.Router)();
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
router.post('/webhook', express_2.default.raw({ type: 'application/json' }), (0, errorHandler_1.asyncHandler)(webhook_controller_1.handleStripeWebhook));
/**
 * @route   POST /api/payments/create-intent/booking
 * @desc    Créer un Payment Intent pour une réservation
 * @access  Public
 */
router.post('/create-intent/booking', (0, errorHandler_1.asyncHandler)(payment_controller_1.createBookingPaymentIntent));
/**
 * @route   POST /api/payments/create-intent/gift-card
 * @desc    Créer un Payment Intent pour une carte cadeau
 * @access  Public
 */
router.post('/create-intent/gift-card', (0, errorHandler_1.asyncHandler)(payment_controller_1.createGiftCardPaymentIntent));
/**
 * @route   POST /api/payments/create-intent/gym-subscription
 * @desc    Créer un Payment Intent pour un abonnement gym
 * @access  Public
 */
router.post('/create-intent/gym-subscription', (0, errorHandler_1.asyncHandler)(payment_controller_1.createGymSubscriptionPaymentIntent));
/**
 * @route   POST /api/payments/confirm
 * @desc    Confirmer un paiement (client-side)
 * @access  Public
 */
router.post('/confirm', (0, errorHandler_1.asyncHandler)(payment_controller_1.confirmPayment));
/**
 * @route   POST /api/payments/refund
 * @desc    Rembourser un paiement
 * @access  Privé (ADMIN uniquement)
 */
router.post('/refund', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(payment_controller_1.refundPayment));
exports.default = router;
//# sourceMappingURL=payment.routes.js.map