import prisma from '../../config/database';

/**
 * Convertir une heure HH:MM en minutes depuis minuit
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convertir des minutes depuis minuit en heure HH:MM
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Ajouter des minutes à une heure
 */
function addMinutesToTime(time: string, minutesToAdd: number): string {
  const totalMinutes = timeToMinutes(time) + minutesToAdd;
  return minutesToTime(totalMinutes);
}

/**
 * Vérifier si deux créneaux horaires se chevauchent
 */
function timeSlotsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);

  return start1Min < end2Min && end1Min > start2Min;
}

/**
 * Générer des créneaux horaires par intervalles de X minutes
 */
function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number
): string[] {
  const slots: string[] = [];
  let currentMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  while (currentMinutes < endMinutes) {
    slots.push(minutesToTime(currentMinutes));
    currentMinutes += intervalMinutes;
  }

  return slots;
}

/**
 * Interface pour un créneau disponible
 */
interface AvailableSlot {
  time: string;
  available: boolean;
  reason?: string;
}

/**
 * Calculer les créneaux disponibles pour un professionnel à une date donnée
 *
 * @param professionalId - ID du professionnel
 * @param date - Date cible (DateTime)
 * @param serviceDuration - Durée du service en minutes
 * @returns Liste des créneaux disponibles
 */
export async function calculateAvailableSlots(
  professionalId: string,
  date: Date,
  serviceDuration: number
): Promise<AvailableSlot[]> {
  // 1. Vérifier si le jour est bloqué (vacances, maladie, etc.)
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const blockedDay = await prisma.availability.findFirst({
    where: {
      professionalId,
      date: {
        gte: targetDate,
        lt: nextDay,
      },
      isAvailable: false,
    },
  });

  if (blockedDay) {
    return [];
  }

  // 2. Récupérer l'horaire template pour ce jour de la semaine
  const dayOfWeek = date.getDay(); // 0 = Dimanche, 1 = Lundi, etc.

  const workingSchedule = await prisma.workingSchedule.findFirst({
    where: {
      professionalId,
      dayOfWeek,
      isActive: true,
    },
  });

  // Si pas d'horaire configuré, retourner vide
  if (!workingSchedule) {
    return [];
  }

  const { startTime: workStart, endTime: workEnd } = workingSchedule;

  // 3. Récupérer les pauses pour ce jour
  const breaks = await prisma.breakPeriod.findMany({
    where: {
      professionalId,
      OR: [
        { dayOfWeek: null }, // Pauses tous les jours
        { dayOfWeek }, // Pauses pour ce jour spécifique
      ],
      isActive: true,
    },
  });

  // 4. Récupérer les réservations existantes pour ce jour
  const existingBookings = await prisma.booking.findMany({
    where: {
      professionalId,
      bookingDate: {
        gte: targetDate,
        lt: nextDay,
      },
      status: {
        notIn: ['CANCELLED', 'NO_SHOW'],
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  // 5. Générer tous les créneaux possibles de 30 minutes
  const allSlots = generateTimeSlots(workStart, workEnd, 30);

  // 6. Vérifier la disponibilité de chaque créneau
  const availableSlots: AvailableSlot[] = allSlots.map((slotStart) => {
    const slotEnd = addMinutesToTime(slotStart, serviceDuration);

    // Vérifier si le créneau dépasse l'heure de fin de travail
    if (timeToMinutes(slotEnd) > timeToMinutes(workEnd)) {
      return {
        time: slotStart,
        available: false,
        reason: 'Dépasse les heures de travail',
      };
    }

    // Vérifier si le créneau chevauche une pause
    for (const breakPeriod of breaks) {
      if (timeSlotsOverlap(slotStart, slotEnd, breakPeriod.startTime, breakPeriod.endTime)) {
        return {
          time: slotStart,
          available: false,
          reason: `Pause: ${breakPeriod.label || 'Pause'}`,
        };
      }
    }

    // Vérifier si le créneau chevauche une réservation existante
    for (const booking of existingBookings) {
      if (timeSlotsOverlap(slotStart, slotEnd, booking.startTime, booking.endTime)) {
        return {
          time: slotStart,
          available: false,
          reason: 'Déjà réservé',
        };
      }
    }

    // Créneau disponible
    return {
      time: slotStart,
      available: true,
    };
  });

  return availableSlots;
}

/**
 * Vérifier si un créneau horaire spécifique est disponible
 */
export async function isSlotAvailable(
  professionalId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<{ available: boolean; reason?: string }> {
  // 1. Vérifier si le jour est bloqué
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const blockedDay = await prisma.availability.findFirst({
    where: {
      professionalId,
      date: {
        gte: targetDate,
        lt: nextDay,
      },
      isAvailable: false,
    },
  });

  if (blockedDay) {
    return { available: false, reason: `Jour bloqué: ${blockedDay.reason}` };
  }

  // 2. Vérifier l'horaire de travail
  const dayOfWeek = date.getDay();

  const workingSchedule = await prisma.workingSchedule.findFirst({
    where: {
      professionalId,
      dayOfWeek,
      isActive: true,
    },
  });

  if (!workingSchedule) {
    return { available: false, reason: 'Pas d\'horaire configuré pour ce jour' };
  }

  // Vérifier que le créneau est dans les heures de travail
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const workStartMin = timeToMinutes(workingSchedule.startTime);
  const workEndMin = timeToMinutes(workingSchedule.endTime);

  if (startMin < workStartMin || endMin > workEndMin) {
    return { available: false, reason: 'En dehors des heures de travail' };
  }

  // 3. Vérifier les pauses
  const breaks = await prisma.breakPeriod.findMany({
    where: {
      professionalId,
      OR: [
        { dayOfWeek: null },
        { dayOfWeek },
      ],
      isActive: true,
    },
  });

  for (const breakPeriod of breaks) {
    if (timeSlotsOverlap(startTime, endTime, breakPeriod.startTime, breakPeriod.endTime)) {
      return {
        available: false,
        reason: `Conflit avec pause: ${breakPeriod.label || 'Pause'}`,
      };
    }
  }

  // 4. Vérifier les réservations existantes
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      professionalId,
      bookingDate: {
        gte: targetDate,
        lt: nextDay,
      },
      status: {
        notIn: ['CANCELLED', 'NO_SHOW'],
      },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      OR: [
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } },
          ],
        },
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } },
          ],
        },
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } },
          ],
        },
      ],
    },
  });

  if (conflictingBooking) {
    return {
      available: false,
      reason: `Conflit avec réservation ${conflictingBooking.bookingNumber}`,
    };
  }

  return { available: true };
}

/**
 * Obtenir les horaires de travail d'un professionnel pour la semaine
 */
export async function getWeeklySchedule(professionalId: string) {
  const schedules = await prisma.workingSchedule.findMany({
    where: { professionalId, isActive: true },
    orderBy: { dayOfWeek: 'asc' },
  });

  // Retourner un objet avec tous les jours (0-6)
  const weekSchedule = {
    0: null, // Dimanche
    1: null, // Lundi
    2: null, // Mardi
    3: null, // Mercredi
    4: null, // Jeudi
    5: null, // Vendredi
    6: null, // Samedi
  };

  for (const schedule of schedules) {
    weekSchedule[schedule.dayOfWeek as keyof typeof weekSchedule] = {
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    };
  }

  return weekSchedule;
}

export {
  timeToMinutes,
  minutesToTime,
  addMinutesToTime,
  timeSlotsOverlap,
  generateTimeSlots,
};
