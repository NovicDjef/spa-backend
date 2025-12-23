import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../auth/auth';

/**
 * @desc    Récupérer les disponibilités d'un professionnel
 * @route   GET /api/availability
 * @access  Privé (ADMIN, SECRETAIRE)
 */
export const getAvailabilities = async (req: AuthRequest, res: Response) => {
  const { professionalId, startDate, endDate } = req.query;

  if (!professionalId) {
    return res.status(400).json({
      success: false,
      message: 'professionalId est requis',
    });
  }

  const where: any = {
    professionalId: professionalId as string,
  };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.date.lte = new Date(endDate as string);
    }
  }

  const availabilities = await prisma.availability.findMany({
    where,
    orderBy: {
      date: 'asc',
    },
  });

  return res.json({
    success: true,
    data: availabilities,
  });
};

/**
 * @desc    Définir les heures de travail d'un professionnel
 * @route   POST /api/availability/working-hours
 * @access  Privé (ADMIN, SECRETAIRE)
 */
export const setWorkingHours = async (req: AuthRequest, res: Response) => {
  const { professionalId, date, startTime, endTime } = req.body;

  if (!professionalId || !date || !startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: 'professionalId, date, startTime et endTime sont requis',
    });
  }

  // Valider le format des heures (HH:MM)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return res.status(400).json({
      success: false,
      message: 'Format d\'heure invalide. Utilisez HH:MM',
    });
  }

  // Vérifier que startTime < endTime
  if (startTime >= endTime) {
    return res.status(400).json({
      success: false,
      message: 'L\'heure de début doit être avant l\'heure de fin',
    });
  }

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  // Vérifier si une disponibilité existe déjà pour cette date
  const existingAvailability = await prisma.availability.findFirst({
    where: {
      professionalId,
      date: targetDate,
    },
  });

  let availability;

  if (existingAvailability) {
    // Mettre à jour
    availability = await prisma.availability.update({
      where: { id: existingAvailability.id },
      data: {
        startTime,
        endTime,
        isAvailable: true,
        reason: null,
      },
    });
  } else {
    // Créer
    availability = await prisma.availability.create({
      data: {
        professionalId,
        date: targetDate,
        startTime,
        endTime,
        isAvailable: true,
      },
    });
  }

  return res.json({
    success: true,
    message: 'Heures de travail définies avec succès',
    data: availability,
  });
};

/**
 * @desc    Bloquer le calendrier d'un professionnel
 * @route   POST /api/availability/block
 * @access  Privé (ADMIN uniquement)
 */
export const blockSchedule = async (req: AuthRequest, res: Response) => {
  const { professionalId, date, reason } = req.body;

  if (!professionalId || !date) {
    return res.status(400).json({
      success: false,
      message: 'professionalId et date sont requis',
    });
  }

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  // Vérifier s'il y a des réservations existantes pour cette date
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

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
  });

  if (existingBookings.length > 0) {
    return res.status(409).json({
      success: false,
      message: `Impossible de bloquer cette date: ${existingBookings.length} réservation(s) existante(s)`,
      bookings: existingBookings.map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        clientName: b.clientName,
        startTime: b.startTime,
        endTime: b.endTime,
      })),
    });
  }

  // Vérifier si une disponibilité existe déjà
  const existingAvailability = await prisma.availability.findFirst({
    where: {
      professionalId,
      date: targetDate,
    },
  });

  let availability;

  if (existingAvailability) {
    // Mettre à jour
    availability = await prisma.availability.update({
      where: { id: existingAvailability.id },
      data: {
        isAvailable: false,
        reason: reason || 'Indisponible',
        startTime: null,
        endTime: null,
      },
    });
  } else {
    // Créer
    availability = await prisma.availability.create({
      data: {
        professionalId,
        date: targetDate,
        isAvailable: false,
        reason: reason || 'Indisponible',
      },
    });
  }

  return res.json({
    success: true,
    message: 'Calendrier bloqué avec succès',
    data: availability,
  });
};

/**
 * @desc    Débloquer le calendrier d'un professionnel
 * @route   POST /api/availability/unblock
 * @access  Privé (ADMIN uniquement)
 */
export const unblockSchedule = async (req: AuthRequest, res: Response) => {
  const { professionalId, date, startTime, endTime } = req.body;

  if (!professionalId || !date) {
    return res.status(400).json({
      success: false,
      message: 'professionalId et date sont requis',
    });
  }

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  // Trouver la disponibilité
  const existingAvailability = await prisma.availability.findFirst({
    where: {
      professionalId,
      date: targetDate,
    },
  });

  if (!existingAvailability) {
    return res.status(404).json({
      success: false,
      message: 'Aucun blocage trouvé pour cette date',
    });
  }

  // Si des heures sont fournies, les utiliser, sinon utiliser des heures par défaut
  const newStartTime = startTime || '09:00';
  const newEndTime = endTime || '17:00';

  // Valider le format des heures
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(newStartTime) || !timeRegex.test(newEndTime)) {
    return res.status(400).json({
      success: false,
      message: 'Format d\'heure invalide. Utilisez HH:MM',
    });
  }

  const availability = await prisma.availability.update({
    where: { id: existingAvailability.id },
    data: {
      isAvailable: true,
      reason: null,
      startTime: newStartTime,
      endTime: newEndTime,
    },
  });

  return res.json({
    success: true,
    message: 'Calendrier débloqué avec succès',
    data: availability,
  });
};

/**
 * @desc    Supprimer une disponibilité
 * @route   DELETE /api/availability/:id
 * @access  Privé (ADMIN uniquement)
 */
export const deleteAvailability = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const availability = await prisma.availability.findUnique({
    where: { id },
  });

  if (!availability) {
    return res.status(404).json({
      success: false,
      message: 'Disponibilité non trouvée',
    });
  }

  await prisma.availability.delete({
    where: { id },
  });

  return res.json({
    success: true,
    message: 'Disponibilité supprimée avec succès',
  });
};

/**
 * @desc    Créer des disponibilités en masse (par exemple pour une semaine)
 * @route   POST /api/availability/bulk
 * @access  Privé (ADMIN uniquement)
 */
export const createBulkAvailabilities = async (
  req: AuthRequest,
  res: Response
) => {
  const { professionalId, startDate, endDate, startTime, endTime, daysOfWeek } =
    req.body;

  if (!professionalId || !startDate || !endDate || !startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message:
        'professionalId, startDate, endDate, startTime et endTime sont requis',
    });
  }

  // Valider le format des heures
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return res.status(400).json({
      success: false,
      message: 'Format d\'heure invalide. Utilisez HH:MM',
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Générer toutes les dates entre startDate et endDate
  const dates: Date[] = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    // Si daysOfWeek est fourni, vérifier si le jour correspond
    if (
      !daysOfWeek ||
      (Array.isArray(daysOfWeek) && daysOfWeek.includes(currentDate.getDay()))
    ) {
      const dateToAdd = new Date(currentDate);
      dateToAdd.setHours(0, 0, 0, 0);
      dates.push(dateToAdd);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Créer les disponibilités
  const availabilities = await Promise.all(
    dates.map(async (date) => {
      // Vérifier si existe déjà
      const existing = await prisma.availability.findFirst({
        where: {
          professionalId,
          date,
        },
      });

      if (existing) {
        // Mettre à jour
        return prisma.availability.update({
          where: { id: existing.id },
          data: {
            startTime,
            endTime,
            isAvailable: true,
          },
        });
      } else {
        // Créer
        return prisma.availability.create({
          data: {
            professionalId,
            date,
            startTime,
            endTime,
            isAvailable: true,
          },
        });
      }
    })
  );

  return res.json({
    success: true,
    message: `${availabilities.length} disponibilités créées/mises à jour avec succès`,
    data: {
      count: availabilities.length,
      availabilities,
    },
  });
};
