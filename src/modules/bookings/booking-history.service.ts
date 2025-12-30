import prisma from '../../config/database';
import { BookingStatus } from '@prisma/client';

/**
 * Interface pour logger un changement de statut
 */
interface LogStatusChangeParams {
  bookingId: string;
  changedById: string;
  changedBy: string;
  changedByRole: string;
  oldStatus?: BookingStatus;
  newStatus: BookingStatus;
  reason?: string;
  notes?: string;
}

/**
 * Interface pour logger un déplacement de réservation (drag & drop)
 */
interface LogBookingMoveParams {
  bookingId: string;
  changedById: string;
  changedBy: string;
  changedByRole: string;
  oldDate?: Date;
  newDate?: Date;
  oldStartTime?: string;
  newStartTime?: string;
  oldEndTime?: string;
  newEndTime?: string;
  oldProfessionalId?: string;
  newProfessionalId?: string;
  reason?: string;
  notes?: string;
}

/**
 * Enregistrer un changement de statut dans l'historique
 */
export async function logStatusChange(params: LogStatusChangeParams) {
  const {
    bookingId,
    changedById,
    changedBy,
    changedByRole,
    oldStatus,
    newStatus,
    reason,
    notes,
  } = params;

  await prisma.bookingStatusHistory.create({
    data: {
      bookingId,
      changedById,
      changedBy,
      changedByRole,
      oldStatus,
      newStatus,
      reason,
      notes,
    },
  });
}

/**
 * Enregistrer un déplacement de réservation (drag & drop)
 */
export async function logBookingMove(params: LogBookingMoveParams) {
  const {
    bookingId,
    changedById,
    changedBy,
    changedByRole,
    oldDate,
    newDate,
    oldStartTime,
    newStartTime,
    oldEndTime,
    newEndTime,
    oldProfessionalId,
    newProfessionalId,
    reason,
    notes,
  } = params;

  // Récupérer le statut actuel de la réservation
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { status: true },
  });

  if (!booking) {
    throw new Error('Réservation non trouvée');
  }

  await prisma.bookingStatusHistory.create({
    data: {
      bookingId,
      changedById,
      changedBy,
      changedByRole,
      oldStatus: booking.status,
      newStatus: booking.status, // Le statut ne change pas, juste la date/heure/technicien
      oldDate,
      newDate,
      oldStartTime,
      newStartTime,
      oldEndTime,
      newEndTime,
      oldProfessionalId,
      newProfessionalId,
      reason: reason || 'Réservation déplacée',
      notes,
    },
  });
}

/**
 * Récupérer tout l'historique d'une réservation
 */
export async function getBookingHistory(bookingId: string) {
  const history = await prisma.bookingStatusHistory.findMany({
    where: { bookingId },
    orderBy: { changedAt: 'desc' },
  });

  return history.map((entry) => {
    const changes: string[] = [];

    // Changement de statut
    if (entry.oldStatus && entry.newStatus && entry.oldStatus !== entry.newStatus) {
      changes.push(`Statut: ${entry.oldStatus} → ${entry.newStatus}`);
    } else if (!entry.oldStatus && entry.newStatus) {
      changes.push(`Statut initial: ${entry.newStatus}`);
    }

    // Changement de date
    if (entry.oldDate && entry.newDate) {
      const oldDateStr = entry.oldDate.toLocaleDateString('fr-FR');
      const newDateStr = entry.newDate.toLocaleDateString('fr-FR');
      if (oldDateStr !== newDateStr) {
        changes.push(`Date: ${oldDateStr} → ${newDateStr}`);
      }
    }

    // Changement d'heure de début
    if (entry.oldStartTime && entry.newStartTime && entry.oldStartTime !== entry.newStartTime) {
      changes.push(`Heure début: ${entry.oldStartTime} → ${entry.newStartTime}`);
    }

    // Changement d'heure de fin
    if (entry.oldEndTime && entry.newEndTime && entry.oldEndTime !== entry.newEndTime) {
      changes.push(`Heure fin: ${entry.oldEndTime} → ${entry.newEndTime}`);
    }

    // Changement de professionnel
    if (
      entry.oldProfessionalId &&
      entry.newProfessionalId &&
      entry.oldProfessionalId !== entry.newProfessionalId
    ) {
      changes.push(`Technicien modifié`);
    }

    return {
      id: entry.id,
      changes,
      changedBy: entry.changedBy,
      changedByRole: entry.changedByRole,
      changedAt: entry.changedAt,
      reason: entry.reason,
      notes: entry.notes,
      // Données brutes pour le frontend
      raw: {
        oldStatus: entry.oldStatus,
        newStatus: entry.newStatus,
        oldDate: entry.oldDate,
        newDate: entry.newDate,
        oldStartTime: entry.oldStartTime,
        newStartTime: entry.newStartTime,
        oldEndTime: entry.oldEndTime,
        newEndTime: entry.newEndTime,
        oldProfessionalId: entry.oldProfessionalId,
        newProfessionalId: entry.newProfessionalId,
      },
    };
  });
}

/**
 * Obtenir le dernier changement de statut d'une réservation
 */
export async function getLastStatusChange(bookingId: string) {
  const lastChange = await prisma.bookingStatusHistory.findFirst({
    where: { bookingId },
    orderBy: { changedAt: 'desc' },
  });

  return lastChange;
}

/**
 * Compter le nombre de modifications d'une réservation
 */
export async function getChangeCount(bookingId: string): Promise<number> {
  const count = await prisma.bookingStatusHistory.count({
    where: { bookingId },
  });

  return count;
}
