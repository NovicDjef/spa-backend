import cron from 'node-cron';
import prisma from '../config/database';
import { sendBookingReminder } from './email';

/**
 * Traite toutes les notifications programmées qui sont prêtes à être envoyées
 */
async function processScheduledNotifications() {
  console.log('🔍 Vérification des notifications programmées...');

  try {
    const now = new Date();

    // Récupérer toutes les notifications non envoyées dont la date programmée est passée
    const notifications = await prisma.notification.findMany({
      where: {
        sent: false,
        scheduledFor: {
          lte: now,
        },
      },
    });

    console.log(`📧 ${notifications.length} notification(s) à envoyer`);

    // Traiter chaque notification
    for (const notification of notifications) {
      try {
        // Traiter uniquement les rappels de réservation
        if (notification.type === 'BOOKING_REMINDER' && notification.bookingId) {
          // Récupérer la réservation avec toutes les relations nécessaires
          const booking = await prisma.booking.findUnique({
            where: { id: notification.bookingId },
            include: {
              service: { select: { name: true } },
              package: { select: { name: true } },
              professional: { select: { nom: true, prenom: true } },
            },
          });

          // Vérifier que la réservation existe et est toujours confirmée
          if (!booking) {
            console.log(
              `⚠️  Notification ${notification.id}: Réservation non trouvée, marquage comme envoyée`
            );
            await prisma.notification.update({
              where: { id: notification.id },
              data: {
                sent: true,
                sentAt: now,
                error: 'Réservation non trouvée',
              },
            });
            continue;
          }

          if (booking.status !== 'CONFIRMED') {
            console.log(
              `⚠️  Notification ${notification.id}: Réservation ${booking.bookingNumber} n'est plus confirmée (statut: ${booking.status})`
            );
            await prisma.notification.update({
              where: { id: notification.id },
              data: {
                sent: true,
                sentAt: now,
                error: `Réservation non confirmée (statut: ${booking.status})`,
              },
            });
            continue;
          }

          // Envoyer le rappel
          const serviceName =
            booking.service?.name || booking.package?.name || 'Votre rendez-vous';
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
            address: process.env.SPA_ADDRESS || undefined,
          });

          // Marquer la notification comme envoyée
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              sent: true,
              sentAt: now,
            },
          });

          // Marquer le rappel comme envoyé dans la réservation
          await prisma.booking.update({
            where: { id: booking.id },
            data: { reminderSent: true },
          });

          console.log(
            `✅ Rappel envoyé pour la réservation ${booking.bookingNumber} (notification ${notification.id})`
          );
        } else {
          // Autres types de notifications - déjà envoyées lors de leur création
          // Juste les marquer comme traitées
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              sent: true,
              sentAt: now,
            },
          });

          console.log(`✅ Notification ${notification.id} (${notification.type}) marquée comme traitée`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de l'envoi de la notification ${notification.id}:`, error);

        // Enregistrer l'erreur dans la notification
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          },
        });
      }
    }

    console.log(`✅ Traitement des notifications terminé (${notifications.length} traitées)`);
  } catch (error) {
    console.error('❌ Erreur lors du traitement des notifications:', error);
  }
}

/**
 * Démarre le planificateur de tâches
 */
export function startScheduler() {
  console.log('📅 Démarrage du planificateur de notifications...');

  // Exécuter toutes les 30 minutes
  // Format: minute heure jour mois jour-de-la-semaine
  // */30 signifie "toutes les 30 minutes"
  cron.schedule('*/30 * * * *', async () => {
    await processScheduledNotifications();
  });

  // Également exécuter au démarrage (pour tester)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Mode développement: vérification immédiate des notifications');
    setTimeout(() => {
      processScheduledNotifications();
    }, 5000); // Attendre 5 secondes après le démarrage
  }

  console.log('✅ Planificateur de notifications démarré (exécution toutes les 30 minutes)');
}

/**
 * Fonction manuelle pour tester le traitement des notifications
 */
export async function testNotifications() {
  console.log('🧪 Test manuel du traitement des notifications...');
  await processScheduledNotifications();
}
