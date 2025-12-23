import { Request, Response } from 'express';
import { constructWebhookEvent } from '../../lib/stripe';
import prisma from '../../config/database';
import Stripe from 'stripe';
import {
  sendBookingConfirmation,
  sendGiftCardEmail,
  sendGymSubscriptionConfirmation,
} from '../../lib/email';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  cancelCalendarEvent,
} from '../../lib/googleCalendar';

/**
 * @desc    Gérer les webhooks Stripe
 * @route   POST /api/payments/webhook
 * @access  Public (mais sécurisé par signature Stripe)
 */
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({
      success: false,
      message: 'Signature Stripe manquante',
    });
  }

  let event: Stripe.Event;

  try {
    // Vérifier la signature du webhook
    event = constructWebhookEvent(req.body, signature);
  } catch (error) {
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
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      default:
        console.log(`ℹ️ Événement non géré: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('❌ Erreur lors du traitement du webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement du webhook',
    });
  }
};

/**
 * Gérer un paiement réussi
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`💳 Paiement réussi: ${paymentIntent.id}`);

  // Récupérer le paiement dans la base de données
  const payment = await prisma.payment.findUnique({
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
  const stripe = (await import('../../lib/stripe')).stripe;
  const paymentIntentWithCharge = await stripe.paymentIntents.retrieve(
    paymentIntent.id,
    { expand: ['latest_charge'] }
  );

  const receiptUrl =
    paymentIntentWithCharge.latest_charge &&
    typeof paymentIntentWithCharge.latest_charge !== 'string'
      ? paymentIntentWithCharge.latest_charge.receipt_url
      : null;

  // Mettre à jour le statut du paiement
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'SUCCEEDED' as any,
      receiptUrl: receiptUrl || undefined,
    },
  });

  // Activer l'entité associée selon le type
  if (payment.booking) {
    console.log(`📅 Confirmation de la réservation: ${payment.booking.bookingNumber}`);
    await prisma.booking.update({
      where: { id: payment.booking.id },
      data: { status: 'CONFIRMED' },
    });

    // Récupérer les détails pour l'email
    const booking = await prisma.booking.findUnique({
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
        await sendBookingConfirmation({
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
      } catch (error) {
        console.error(`❌ Erreur lors de l'envoi de l'email de confirmation:`, error);
      }

      // Créer l'événement Google Calendar
      try {
        const googleEventId = await createCalendarEvent({
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
          await prisma.booking.update({
            where: { id: booking.id },
            data: { googleCalendarEventId: googleEventId },
          });
          console.log(`✅ Événement Google Calendar créé et lié à la réservation`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la création de l'événement Google Calendar:`, error);
      }
    }
  }

  if (payment.giftCard) {
    console.log(`🎁 Activation de la carte cadeau: ${payment.giftCard.code}`);
    await prisma.giftCard.update({
      where: { id: payment.giftCard.id },
      data: { isActive: true },
    });

    try {
      await sendGiftCardEmail({
        code: payment.giftCard.code,
        amount: parseFloat(payment.giftCard.amount.toString()),
        recipientName: payment.giftCard.recipientName,
        recipientEmail: payment.giftCard.recipientEmail,
        senderName: payment.giftCard.purchasedBy || 'Un ami',
        message: payment.giftCard.message || undefined,
      });
      console.log(`✅ Carte cadeau envoyée à ${payment.giftCard.recipientEmail}`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de la carte cadeau:`, error);
    }
  }

  if (payment.gymSubscription) {
    console.log(`🏋️ Activation de l'abonnement gym`);
    await prisma.gymSubscription.update({
      where: { id: payment.gymSubscription.id },
      data: { isActive: true },
    });

    // Récupérer les détails de l'abonnement
    const subscription = await prisma.gymSubscription.findUnique({
      where: { id: payment.gymSubscription.id },
      include: {
        membership: {
          select: { name: true, type: true },
        },
      },
    });

    if (subscription && subscription.membership) {
      try {
        await sendGymSubscriptionConfirmation({
          clientName: subscription.clientName,
          clientEmail: subscription.clientEmail,
          membershipName: subscription.membership.name,
          membershipType: subscription.membership.type,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          total: parseFloat(payment.amount.toString()),
        });
        console.log(`✅ Email de confirmation d'abonnement envoyé à ${subscription.clientEmail}`);
      } catch (error) {
        console.error(`❌ Erreur lors de l'envoi de l'email d'abonnement:`, error);
      }
    }
  }

  if (payment.order) {
    console.log(`📦 Confirmation de la commande: ${payment.order.orderNumber}`);
    await prisma.order.update({
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
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`❌ Paiement échoué: ${paymentIntent.id}`);

  const payment = await prisma.payment.findUnique({
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
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'FAILED' },
  });

  // Annuler la réservation si c'en est une
  if (payment.booking) {
    await prisma.booking.update({
      where: { id: payment.booking.id },
      data: { status: 'CANCELLED' },
    });

    // TODO: Envoyer email d'échec de paiement
    console.log(`📧 TODO: Notifier l'échec du paiement à ${payment.booking.clientEmail}`);

    // Supprimer l'événement Google Calendar (s'il existe)
    if (payment.booking.googleCalendarEventId) {
      try {
        await deleteCalendarEvent(payment.booking.googleCalendarEventId);
        console.log(`✅ Événement Google Calendar supprimé (paiement échoué)`);
      } catch (error) {
        console.error(`❌ Erreur lors de la suppression de l'événement Google Calendar:`, error);
      }
    }
  }

  console.log(`ℹ️ Paiement marqué comme échoué: ${paymentIntent.id}`);
}

/**
 * Gérer un remboursement
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`💰 Remboursement effectué: ${charge.id}`);

  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId: charge.payment_intent as string },
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
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'REFUNDED' },
  });

  // Mettre à jour l'entité associée
  if (payment.booking) {
    await prisma.booking.update({
      where: { id: payment.booking.id },
      data: { status: 'CANCELLED' },
    });
    console.log(`📧 TODO: Notifier le remboursement à ${payment.booking.clientEmail}`);

    // Annuler l'événement Google Calendar
    if (payment.booking.googleCalendarEventId) {
      try {
        await cancelCalendarEvent(
          payment.booking.googleCalendarEventId,
          'Remboursement effectué'
        );
        console.log(`✅ Événement Google Calendar annulé`);
      } catch (error) {
        console.error(`❌ Erreur lors de l'annulation de l'événement Google Calendar:`, error);
      }
    }
  }

  if (payment.giftCard) {
    await prisma.giftCard.update({
      where: { id: payment.giftCard.id },
      data: { isActive: false },
    });
  }

  if (payment.gymSubscription) {
    await prisma.gymSubscription.update({
      where: { id: payment.gymSubscription.id },
      data: { isActive: false },
    });
  }

  console.log(`✅ Remboursement traité: ${charge.id}`);
}

/**
 * Gérer une contestation de paiement
 */
async function handleDisputeCreated(dispute: Stripe.Dispute) {
  console.log(`⚠️ Contestation créée: ${dispute.id}`);
  console.log(`Montant: ${dispute.amount / 100} ${dispute.currency}`);
  console.log(`Raison: ${dispute.reason}`);

  // TODO: Notifier l'admin par email
  console.log(`📧 TODO: Notifier l'admin d'une contestation`);

  // Le paiement reste en statut SUCCEEDED jusqu'à résolution de la contestation
  // Stripe gère automatiquement les fonds en attente
}
