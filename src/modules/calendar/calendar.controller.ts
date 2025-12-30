import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../auth/auth';
import { calculateAvailableSlots } from '../availability/availability.service';

/**
 * @desc    Récupérer le calendrier du technicien (vue personnelle)
 * @route   GET /api/calendar/my-bookings
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE)
 */
export const getMyCalendar = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { date } = req.query; // Format: YYYY-MM-DD

  // Si pas de date, utiliser aujourd'hui
  const targetDate = date ? new Date(date as string) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Récupérer les réservations du technicien pour cette date
  const bookings = await prisma.booking.findMany({
    where: {
      professionalId: userId,
      bookingDate: {
        gte: targetDate,
        lt: nextDay,
      },
    },
    include: {
      service: {
        select: {
          name: true,
          duration: true,
        },
      },
      package: {
        select: {
          name: true,
          variant: true,
        },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  // Vérifier si le technicien est bloqué ce jour
  const availability = await prisma.availability.findFirst({
    where: {
      professionalId: userId,
      date: targetDate,
      isAvailable: false,
    },
  });

  return res.json({
    success: true,
    data: {
      date: targetDate,
      isBlocked: !!availability,
      blockReason: availability?.reason || null,
      bookings: bookings.map((booking) => ({
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        clientName: booking.clientName,
        clientPhone: booking.clientPhone,
        serviceName: booking.service?.name || booking.package?.name,
        serviceVariant: booking.package?.variant || null,
        duration: booking.service?.duration || null,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        specialNotes: booking.specialNotes,
        total: booking.total,
      })),
    },
  });
};

/**
 * @desc    Récupérer le calendrier complet (vue admin/secrétaire)
 * @route   GET /api/calendar/all-bookings
 * @access  Privé (ADMIN, SECRETAIRE)
 */
export const getAllCalendar = async (req: AuthRequest, res: Response) => {
  const { date } = req.query; // Format: YYYY-MM-DD

  // Vérifier permissions
  if (req.user!.role !== 'ADMIN' && req.user!.role !== 'SECRETAIRE') {
    return res.status(403).json({
      success: false,
      message: 'Accès interdit',
    });
  }

  const targetDate = date ? new Date(date as string) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Récupérer tous les professionnels actifs (massothérapeutes et esthéticiennes)
  const professionals = await prisma.user.findMany({
    where: {
      role: {
        in: ['MASSOTHERAPEUTE', 'ESTHETICIENNE'],
      },
      isActive: true,
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      photoUrl: true,
      role: true,
    },
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
  });

  // Récupérer toutes les réservations de la journée
  const bookings = await prisma.booking.findMany({
    where: {
      bookingDate: {
        gte: targetDate,
        lt: nextDay,
      },
    },
    include: {
      professional: {
        select: {
          id: true,
          nom: true,
          prenom: true,
        },
      },
      service: {
        select: {
          name: true,
          duration: true,
        },
      },
      package: {
        select: {
          name: true,
          variant: true,
        },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  // Récupérer les disponibilités/blocages
  const availabilities = await prisma.availability.findMany({
    where: {
      date: targetDate,
    },
  });

  // Organiser les données par professionnel
  const calendarData = professionals.map((prof) => {
    const profBookings = bookings.filter(
      (b) => b.professionalId === prof.id
    );

    const profAvailability = availabilities.find(
      (a) => a.professionalId === prof.id
    );

    return {
      professional: {
        id: prof.id,
        nom: prof.nom,
        prenom: prof.prenom,
        photoUrl: prof.photoUrl,
        role: prof.role,
      },
      isBlocked: profAvailability ? !profAvailability.isAvailable : false,
      blockReason: profAvailability?.reason || null,
      bookings: profBookings.map((booking) => ({
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        clientName: booking.clientName,
        clientPhone: booking.clientPhone,
        serviceName: booking.service?.name || booking.package?.name,
        serviceVariant: booking.package?.variant || null,
        duration: booking.service?.duration || null,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        specialNotes: booking.specialNotes,
        total: booking.total,
      })),
    };
  });

  return res.json({
    success: true,
    data: {
      date: targetDate,
      professionals: calendarData,
    },
  });
};

/**
 * @desc    Récupérer les créneaux horaires disponibles pour un technicien
 * @route   GET /api/calendar/available-slots
 * @access  Public
 */
export const getAvailableSlots = async (req: AuthRequest, res: Response) => {
  const { professionalId, date, duration } = req.query;

  if (!professionalId || !date || !duration) {
    return res.status(400).json({
      success: false,
      message: 'professionalId, date et duration sont requis',
    });
  }

  const targetDate = new Date(date as string);
  targetDate.setHours(0, 0, 0, 0);

  const serviceDuration = parseInt(duration as string);

  // Utiliser le service de calcul de disponibilités (30 minutes, template + exceptions)
  const slots = await calculateAvailableSlots(
    professionalId as string,
    targetDate,
    serviceDuration
  );

  // Vérifier si le jour est bloqué (aucun créneau disponible)
  const isBlocked = slots.length === 0;

  // Si bloqué, essayer de récupérer la raison
  let blockReason = null;
  if (isBlocked) {
    const blockedAvailability = await prisma.availability.findFirst({
      where: {
        professionalId: professionalId as string,
        date: targetDate,
        isAvailable: false,
      },
    });
    blockReason = blockedAvailability?.reason || 'Aucun horaire de travail configuré';
  }

  // Extraire uniquement les créneaux disponibles
  const availableSlots = slots
    .filter((slot) => slot.available)
    .map((slot) => slot.time);

  return res.json({
    success: true,
    data: {
      date: targetDate,
      isBlocked,
      reason: blockReason,
      slots: availableSlots,
    },
  });
};
