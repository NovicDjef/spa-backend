"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = void 0;
const stripe_1 = require("../../lib/stripe");
const database_1 = __importDefault(require("../../config/database"));
const email_1 = require("../../lib/email");
const googleCalendar_1 = require("../../lib/googleCalendar");
/**
 * @desc    Gérer les webhooks Stripe
 * @route   POST /api/payments/webhook
 * @access  Public (mais sécurisé par signature Stripe)
 */
const handleStripeWebhook = async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
        return res.status(400).json({
            success: false,
            message: 'Signature Stripe manquante',
        });
    }
    let event;
    try {
        // Vérifier la signature du webhook
        event = (0, stripe_1.constructWebhookEvent)(req.body, signature);
    }
    catch (error) {
        console.error('❌ Erreur de vérification du webhook:', error);
        return res.status(400).json({
            success: false,
            message: 'Signature invalide',
        });
    }
    console.log(`✅ Webhook reçu: ${event.type}`);
    // Gérer les différents types d'événements
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object);
                break;
            case 'charge.refunded':
                await handleChargeRefunded(event.data.object);
                break;
            case 'charge.dispute.created':
                await handleDisputeCreated(event.data.object);
                break;
            default:
                console.log(`ℹ️ Événement non géré: ${event.type}`);
        }
        return res.json({ received: true });
    }
    catch (error) {
        console.error('❌ Erreur lors du traitement du webhook:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors du traitement du webhook',
        });
    }
};
exports.handleStripeWebhook = handleStripeWebhook;
/**
 * Gérer un paiement réussi
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
    console.log(`💳 Paiement réussi: ${paymentIntent.id}`);
    // Récupérer le paiement dans la base de données
    const payment = await database_1.default.payment.findUnique({
        where: { stripePaymentId: paymentIntent.id },
        include: {
            booking: true,
            giftCard: true,
            gymSubscription: true,
            order: true,
        },
    });
    if (!payment) {
        console.error(`❌ Paiement non trouvé pour PaymentIntent: ${paymentIntent.id}`);
        return;
    }
    // Récupérer le receipt URL via latest_charge
    const stripe = (await Promise.resolve().then(() => __importStar(require('../../lib/stripe')))).stripe;
    const paymentIntentWithCharge = await stripe.paymentIntents.retrieve(paymentIntent.id, { expand: ['latest_charge'] });
    const receiptUrl = paymentIntentWithCharge.latest_charge &&
        typeof paymentIntentWithCharge.latest_charge !== 'string'
        ? paymentIntentWithCharge.latest_charge.receipt_url
        : null;
    // Mettre à jour le statut du paiement
    await database_1.default.payment.update({
        where: { id: payment.id },
        data: {
            status: 'SUCCEEDED',
            receiptUrl: receiptUrl || undefined,
        },
    });
    // Activer l'entité associée selon le type
    if (payment.booking) {
        console.log(`📅 Confirmation de la réservation: ${payment.booking.bookingNumber}`);
        await database_1.default.booking.update({
            where: { id: payment.booking.id },
            data: { status: 'CONFIRMED' },
        });
        // Récupérer les détails pour l'email
        const booking = await database_1.default.booking.findUnique({
            where: { id: payment.booking.id },
            include: {
                service: {
                    select: { name: true },
                },
                package: {
                    select: { name: true },
                },
                professional: {
                    select: { nom: true, prenom: true },
                },
            },
        });
        if (booking) {
            const serviceName = booking.service?.name || booking.package?.name || 'Service';
            const professionalName = booking.professional
                ? `${booking.professional.prenom} ${booking.professional.nom}`
                : 'Notre équipe';
            try {
                await (0, email_1.sendBookingConfirmation)({
                    bookingNumber: booking.bookingNumber,
                    clientName: booking.clientName,
                    clientEmail: booking.clientEmail,
                    serviceName,
                    professionalName,
                    bookingDate: booking.bookingDate,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    total: parseFloat(booking.total.toString()),
                    address: process.env.SPA_ADDRESS || undefined,
                });
                console.log(`✅ Email de confirmation envoyé à ${booking.clientEmail}`);
            }
            catch (error) {
                console.error(`❌ Erreur lors de l'envoi de l'email de confirmation:`, error);
            }
            // Créer l'événement Google Calendar
            try {
                const googleEventId = await (0, googleCalendar_1.createCalendarEvent)({
                    id: booking.id,
                    bookingNumber: booking.bookingNumber,
                    clientName: booking.clientName,
                    clientEmail: booking.clientEmail,
                    clientPhone: booking.clientPhone,
                    serviceName,
                    professionalName,
                    bookingDate: booking.bookingDate,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    specialNotes: booking.specialNotes || undefined,
                });
                // Sauvegarder l'ID de l'événement Google Calendar
                if (googleEventId) {
                    await database_1.default.booking.update({
                        where: { id: booking.id },
                        data: { googleCalendarEventId: googleEventId },
                    });
                    console.log(`✅ Événement Google Calendar créé et lié à la réservation`);
                }
            }
            catch (error) {
                console.error(`❌ Erreur lors de la création de l'événement Google Calendar:`, error);
            }
        }
    }
    if (payment.giftCard) {
        console.log(`🎁 Activation de la carte cadeau: ${payment.giftCard.code}`);
        await database_1.default.giftCard.update({
            where: { id: payment.giftCard.id },
            data: { isActive: true },
        });
        try {
            await (0, email_1.sendGiftCardEmail)({
                code: payment.giftCard.code,
                amount: parseFloat(payment.giftCard.amount.toString()),
                recipientName: payment.giftCard.recipientName,
                recipientEmail: payment.giftCard.recipientEmail,
                senderName: payment.giftCard.purchasedBy || 'Un ami',
                message: payment.giftCard.message || undefined,
            });
            console.log(`✅ Carte cadeau envoyée à ${payment.giftCard.recipientEmail}`);
        }
        catch (error) {
            console.error(`❌ Erreur lors de l'envoi de la carte cadeau:`, error);
        }
    }
    if (payment.gymSubscription) {
        console.log(`🏋️ Activation de l'abonnement gym`);
        await database_1.default.gymSubscription.update({
            where: { id: payment.gymSubscription.id },
            data: { isActive: true },
        });
        // Récupérer les détails de l'abonnement
        const subscription = await database_1.default.gymSubscription.findUnique({
            where: { id: payment.gymSubscription.id },
            include: {
                membership: {
                    select: { name: true, type: true },
                },
            },
        });
        if (subscription && subscription.membership) {
            try {
                await (0, email_1.sendGymSubscriptionConfirmation)({
                    clientName: subscription.clientName,
                    clientEmail: subscription.clientEmail,
                    membershipName: subscription.membership.name,
                    membershipType: subscription.membership.type,
                    startDate: subscription.startDate,
                    endDate: subscription.endDate,
                    total: parseFloat(payment.amount.toString()),
                });
                console.log(`✅ Email de confirmation d'abonnement envoyé à ${subscription.clientEmail}`);
            }
            catch (error) {
                console.error(`❌ Erreur lors de l'envoi de l'email d'abonnement:`, error);
            }
        }
    }
    if (payment.order) {
        console.log(`📦 Confirmation de la commande: ${payment.order.orderNumber}`);
        await database_1.default.order.update({
            where: { id: payment.order.id },
            data: { status: 'PAID' },
        });
        // TODO: Envoyer email de confirmation de commande
        console.log(`📧 TODO: Envoyer confirmation de commande`);
    }
    console.log(`✅ Paiement traité avec succès: ${paymentIntent.id}`);
}
/**
 * Gérer un paiement échoué
 */
async function handlePaymentIntentFailed(paymentIntent) {
    console.log(`❌ Paiement échoué: ${paymentIntent.id}`);
    const payment = await database_1.default.payment.findUnique({
        where: { stripePaymentId: paymentIntent.id },
        include: {
            booking: true,
        },
    });
    if (!payment) {
        console.error(`❌ Paiement non trouvé pour PaymentIntent: ${paymentIntent.id}`);
        return;
    }
    // Mettre à jour le statut du paiement
    await database_1.default.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
    });
    // Annuler la réservation si c'en est une
    if (payment.booking) {
        await database_1.default.booking.update({
            where: { id: payment.booking.id },
            data: { status: 'CANCELLED' },
        });
        // TODO: Envoyer email d'échec de paiement
        console.log(`📧 TODO: Notifier l'échec du paiement à ${payment.booking.clientEmail}`);
        // Supprimer l'événement Google Calendar (s'il existe)
        if (payment.booking.googleCalendarEventId) {
            try {
                await (0, googleCalendar_1.deleteCalendarEvent)(payment.booking.googleCalendarEventId);
                console.log(`✅ Événement Google Calendar supprimé (paiement échoué)`);
            }
            catch (error) {
                console.error(`❌ Erreur lors de la suppression de l'événement Google Calendar:`, error);
            }
        }
    }
    console.log(`ℹ️ Paiement marqué comme échoué: ${paymentIntent.id}`);
}
/**
 * Gérer un remboursement
 */
async function handleChargeRefunded(charge) {
    console.log(`💰 Remboursement effectué: ${charge.id}`);
    const payment = await database_1.default.payment.findFirst({
        where: { stripePaymentId: charge.payment_intent },
        include: {
            booking: true,
            giftCard: true,
            gymSubscription: true,
        },
    });
    if (!payment) {
        console.error(`❌ Paiement non trouvé pour le remboursement`);
        return;
    }
    // Mettre à jour le statut du paiement
    await database_1.default.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
    });
    // Mettre à jour l'entité associée
    if (payment.booking) {
        await database_1.default.booking.update({
            where: { id: payment.booking.id },
            data: { status: 'CANCELLED' },
        });
        console.log(`📧 TODO: Notifier le remboursement à ${payment.booking.clientEmail}`);
        // Annuler l'événement Google Calendar
        if (payment.booking.googleCalendarEventId) {
            try {
                await (0, googleCalendar_1.cancelCalendarEvent)(payment.booking.googleCalendarEventId, 'Remboursement effectué');
                console.log(`✅ Événement Google Calendar annulé`);
            }
            catch (error) {
                console.error(`❌ Erreur lors de l'annulation de l'événement Google Calendar:`, error);
            }
        }
    }
    if (payment.giftCard) {
        await database_1.default.giftCard.update({
            where: { id: payment.giftCard.id },
            data: { isActive: false },
        });
    }
    if (payment.gymSubscription) {
        await database_1.default.gymSubscription.update({
            where: { id: payment.gymSubscription.id },
            data: { isActive: false },
        });
    }
    console.log(`✅ Remboursement traité: ${charge.id}`);
}
/**
 * Gérer une contestation de paiement
 */
async function handleDisputeCreated(dispute) {
    console.log(`⚠️ Contestation créée: ${dispute.id}`);
    console.log(`Montant: ${dispute.amount / 100} ${dispute.currency}`);
    console.log(`Raison: ${dispute.reason}`);
    // TODO: Notifier l'admin par email
    console.log(`📧 TODO: Notifier l'admin d'une contestation`);
    // Le paiement reste en statut SUCCEEDED jusqu'à résolution de la contestation
    // Stripe gère automatiquement les fonds en attente
}
//# sourceMappingURL=webhook.controller.js.map