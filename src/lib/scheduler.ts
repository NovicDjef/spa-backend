import cron from 'node-cron';
import prisma from '../config/database';
import { sendBookingReminder } from './email';

/**
 * Vérifie et envoie les rappels pour les réservations dans 24 heures
 */
async function checkAndSendReminders() {
  console.log('🔍 Vérification des rappels de réservation...');

  try {
    // Calculer la fenêtre de temps pour les réservations dans ~24 heures
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Fenêtre de tolérance: entre 23h30 et 24h30 à partir de maintenant
    const windowStart = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

    // Trouver toutes les réservations confirmées dans cette fenêtre
    // qui n'ont pas encore reçu de rappel
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        bookingDate: {
          gte: windowStart,
          lte: windowEnd,
        },
        reminderSent: false, // Vérifie qu'un rappel n'a pas déjà été envoyé
      },
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

    console.log(`📧 ${bookings.length} rappel(s) à envoyer`);

    // Envoyer un email de rappel pour chaque réservation
    for (const booking of bookings) {
      try {
        const serviceName = booking.service?.name || booking.package?.name || 'Votre rendez-vous';
        const professionalName = booking.professional
          ? `${booking.professional.prenom} ${booking.professional.nom}`
          : 'Notre équipe';

        await sendBookingReminder({
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

        // Marquer le rappel comme envoyé
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent: true },
        });

        console.log(`✅ Rappel envoyé pour la réservation ${booking.bookingNumber}`);
      } catch (error) {
        console.error(`❌ Erreur lors de l'envoi du rappel pour ${booking.bookingNumber}:`, error);
      }
    }

    console.log(`✅ Vérification des rappels terminée (${bookings.length} envoyés)`);
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des rappels:', error);
  }
}

/**
 * Démarre le planificateur de tâches
 */
export function startScheduler() {
  console.log('📅 Démarrage du planificateur de rappels...');

  // Exécuter toutes les heures à la minute 0
  // Format: minute heure jour mois jour-de-la-semaine
  cron.schedule('0 * * * *', async () => {
    await checkAndSendReminders();
  });

  // Également exécuter au démarrage (pour tester)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Mode développement: vérification immédiate des rappels');
    setTimeout(() => {
      checkAndSendReminders();
    }, 5000); // Attendre 5 secondes après le démarrage
  }

  console.log('✅ Planificateur de rappels démarré (exécution toutes les heures)');
}

/**
 * Fonction manuelle pour tester l'envoi de rappels
 */
export async function testReminders() {
  console.log('🧪 Test manuel des rappels...');
  await checkAndSendReminders();
}
