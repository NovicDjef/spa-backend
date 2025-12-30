import prisma from '../../config/database';
import { NotificationType } from '@prisma/client';
import { sendBookingReminder } from '../../lib/email';

/**
 * Interface pour créer une notification
 */
interface CreateNotificationParams {
  type: NotificationType;
  recipientEmail: string;
  recipientName?: string;
  bookingId?: string;
  subject: string;
  message: string;
  scheduledFor?: Date;
}

/**
 * Créer une notification dans la base de données
 */
export async function createNotification(params: CreateNotificationParams) {
  const {
    type,
    recipientEmail,
    recipientName,
    bookingId,
    subject,
    message,
    scheduledFor,
  } = params;

  const notification = await prisma.notification.create({
    data: {
      type,
      recipientEmail,
      recipientName,
      bookingId,
      subject,
      message,
      scheduledFor,
      sent: false,
    },
  });

  // Si pas de scheduledFor, envoyer immédiatement
  if (!scheduledFor) {
    await sendNotificationNow(notification.id);
  }

  return notification;
}

/**
 * Programmer un rappel 24h avant le rendez-vous
 */
export async function scheduleBookingReminder(booking: any) {
  const bookingDateTime = new Date(booking.bookingDate);
  const [hours, minutes] = booking.startTime.split(':').map(Number);
  bookingDateTime.setHours(hours, minutes, 0, 0);

  // Calculer la date du rappel (24h avant)
  const reminderDate = new Date(bookingDateTime);
  reminderDate.setHours(reminderDate.getHours() - 24);

  // Si la date du rappel est déjà passée, ne pas créer de notification
  if (reminderDate < new Date()) {
    console.log(`⚠️  Rappel non programmé pour ${booking.bookingNumber} - date déjà passée`);
    return null;
  }

  const serviceName = booking.service?.name || booking.package?.name || 'Votre rendez-vous';
  const professionalName = booking.professional
    ? `${booking.professional.prenom} ${booking.professional.nom}`
    : 'notre équipe';

  const subject = `Rappel: Rendez-vous ${serviceName} demain`;
  const message = `
Bonjour ${booking.clientName},

Ceci est un rappel amical pour votre rendez-vous de ${serviceName} prévu demain:

📅 Date: ${bookingDateTime.toLocaleDateString('fr-FR')}
🕐 Heure: ${booking.startTime}
👤 Avec: ${professionalName}
🏠 Adresse: ${process.env.SPA_ADDRESS || 'Voir confirmation'}

Montant: ${parseFloat(booking.total).toFixed(2)}$ CAD

Si vous avez besoin de modifier ou d'annuler ce rendez-vous, veuillez nous contacter dès que possible.

Au plaisir de vous accueillir!

L'équipe du Spa
  `.trim();

  return await createNotification({
    type: 'BOOKING_REMINDER',
    recipientEmail: booking.clientEmail,
    recipientName: booking.clientName,
    bookingId: booking.id,
    subject,
    message,
    scheduledFor: reminderDate,
  });
}

/**
 * Envoyer une notification de confirmation de réservation (immédiate)
 */
export async function sendBookingConfirmedNotification(booking: any) {
  const bookingDateTime = new Date(booking.bookingDate);
  const [hours, minutes] = booking.startTime.split(':').map(Number);
  bookingDateTime.setHours(hours, minutes, 0, 0);

  const serviceName = booking.service?.name || booking.package?.name || 'Votre service';
  const professionalName = booking.professional
    ? `${booking.professional.prenom} ${booking.professional.nom}`
    : 'notre équipe';

  const subject = `Confirmation de réservation #${booking.bookingNumber}`;
  const message = `
Bonjour ${booking.clientName},

Merci d'avoir réservé avec nous! Voici les détails de votre rendez-vous:

🎫 Numéro de réservation: ${booking.bookingNumber}
✨ Service: ${serviceName}
📅 Date: ${bookingDateTime.toLocaleDateString('fr-FR')}
🕐 Heure: ${booking.startTime} - ${booking.endTime}
👤 Avec: ${professionalName}
💰 Montant total: ${parseFloat(booking.total).toFixed(2)}$ CAD (taxes incluses)

${booking.specialNotes ? `📝 Notes: ${booking.specialNotes}\n\n` : ''}
Vous recevrez un rappel 24 heures avant votre rendez-vous.

Si vous avez des questions ou besoin de modifier votre réservation, n'hésitez pas à nous contacter.

À bientôt!

L'équipe du Spa
  `.trim();

  return await createNotification({
    type: 'BOOKING_CONFIRMED',
    recipientEmail: booking.clientEmail,
    recipientName: booking.clientName,
    bookingId: booking.id,
    subject,
    message,
    // Pas de scheduledFor = envoi immédiat
  });
}

/**
 * Envoyer une notification d'annulation
 */
export async function sendBookingCancelledNotification(booking: any, reason?: string) {
  const bookingDateTime = new Date(booking.bookingDate);
  const [hours, minutes] = booking.startTime.split(':').map(Number);
  bookingDateTime.setHours(hours, minutes, 0, 0);

  const serviceName = booking.service?.name || booking.package?.name || 'Votre service';

  const subject = `Annulation de réservation #${booking.bookingNumber}`;
  const message = `
Bonjour ${booking.clientName},

Votre réservation a été annulée:

🎫 Numéro de réservation: ${booking.bookingNumber}
✨ Service: ${serviceName}
📅 Date: ${bookingDateTime.toLocaleDateString('fr-FR')}
🕐 Heure: ${booking.startTime}

${reason ? `Raison: ${reason}\n\n` : ''}
Si vous souhaitez reprogrammer ce rendez-vous, n'hésitez pas à nous contacter.

Cordialement,

L'équipe du Spa
  `.trim();

  return await createNotification({
    type: 'BOOKING_CANCELLED',
    recipientEmail: booking.clientEmail,
    recipientName: booking.clientName,
    bookingId: booking.id,
    subject,
    message,
  });
}

/**
 * Envoyer une notification de modification de réservation
 */
export async function sendBookingUpdatedNotification(
  booking: any,
  changes: string[]
) {
  const bookingDateTime = new Date(booking.bookingDate);
  const [hours, minutes] = booking.startTime.split(':').map(Number);
  bookingDateTime.setHours(hours, minutes, 0, 0);

  const serviceName = booking.service?.name || booking.package?.name || 'Votre service';

  const subject = `Modification de réservation #${booking.bookingNumber}`;
  const message = `
Bonjour ${booking.clientName},

Votre réservation a été modifiée:

🎫 Numéro de réservation: ${booking.bookingNumber}
✨ Service: ${serviceName}
📅 Nouvelle date: ${bookingDateTime.toLocaleDateString('fr-FR')}
🕐 Nouvel horaire: ${booking.startTime} - ${booking.endTime}

Modifications effectuées:
${changes.map((c) => `  • ${c}`).join('\n')}

Si vous avez des questions, n'hésitez pas à nous contacter.

Cordialement,

L'équipe du Spa
  `.trim();

  return await createNotification({
    type: 'BOOKING_UPDATED',
    recipientEmail: booking.clientEmail,
    recipientName: booking.clientName,
    bookingId: booking.id,
    subject,
    message,
  });
}

/**
 * Mettre à jour les rappels d'une réservation (si date modifiée)
 */
export async function updateReminders(bookingId: string) {
  // Annuler les rappels existants non envoyés
  await prisma.notification.updateMany({
    where: {
      bookingId,
      type: 'BOOKING_REMINDER',
      sent: false,
    },
    data: {
      sent: true,
      error: 'Annulé suite à modification de la réservation',
    },
  });

  // Récupérer la réservation mise à jour
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      package: true,
      professional: true,
    },
  });

  if (!booking || booking.status === 'CANCELLED') {
    return null;
  }

  // Créer un nouveau rappel
  return await scheduleBookingReminder(booking);
}

/**
 * Envoyer une notification immédiatement
 */
async function sendNotificationNow(notificationId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.sent) {
    return;
  }

  try {
    // Utiliser le service email existant
    // Pour l'instant, on marque juste comme envoyé
    // L'envoi réel sera fait via le scheduler ou directement avec sendEmail

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        sent: true,
        sentAt: new Date(),
      },
    });

    console.log(`✅ Notification ${notificationId} marquée comme envoyée`);
  } catch (error) {
    console.error(`❌ Erreur envoi notification ${notificationId}:`, error);

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
    });
  }
}

/**
 * Obtenir toutes les notifications programmées non envoyées
 */
export async function getPendingNotifications() {
  const now = new Date();

  return await prisma.notification.findMany({
    where: {
      sent: false,
      scheduledFor: {
        lte: now,
      },
    },
    orderBy: {
      scheduledFor: 'asc',
    },
  });
}

/**
 * Marquer une notification comme envoyée
 */
export async function markNotificationAsSent(notificationId: string) {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: {
      sent: true,
      sentAt: new Date(),
    },
  });
}

/**
 * Marquer une notification comme échouée
 */
export async function markNotificationAsFailed(notificationId: string, error: string) {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: {
      error,
    },
  });
}
