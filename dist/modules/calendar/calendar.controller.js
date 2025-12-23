"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableSlots = exports.getAllCalendar = exports.getMyCalendar = void 0;
const database_1 = __importDefault(require("../../config/database"));
/**
 * @desc    Récupérer le calendrier du technicien (vue personnelle)
 * @route   GET /api/calendar/my-bookings
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE)
 */
const getMyCalendar = async (req, res) => {
    const userId = req.user.id;
    const { date } = req.query; // Format: YYYY-MM-DD
    // Si pas de date, utiliser aujourd'hui
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    // Récupérer les réservations du technicien pour cette date
    const bookings = await database_1.default.booking.findMany({
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
    const availability = await database_1.default.availability.findFirst({
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
exports.getMyCalendar = getMyCalendar;
/**
 * @desc    Récupérer le calendrier complet (vue admin/secrétaire)
 * @route   GET /api/calendar/all-bookings
 * @access  Privé (ADMIN, SECRETAIRE)
 */
const getAllCalendar = async (req, res) => {
    const { date } = req.query; // Format: YYYY-MM-DD
    // Vérifier permissions
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SECRETAIRE') {
        return res.status(403).json({
            success: false,
            message: 'Accès interdit',
        });
    }
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    // Récupérer tous les professionnels actifs (massothérapeutes et esthéticiennes)
    const professionals = await database_1.default.user.findMany({
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
    const bookings = await database_1.default.booking.findMany({
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
    const availabilities = await database_1.default.availability.findMany({
        where: {
            date: targetDate,
        },
    });
    // Organiser les données par professionnel
    const calendarData = professionals.map((prof) => {
        const profBookings = bookings.filter((b) => b.professionalId === prof.id);
        const profAvailability = availabilities.find((a) => a.professionalId === prof.id);
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
exports.getAllCalendar = getAllCalendar;
/**
 * @desc    Récupérer les créneaux horaires disponibles pour un technicien
 * @route   GET /api/calendar/available-slots
 * @access  Public
 */
const getAvailableSlots = async (req, res) => {
    const { professionalId, date, duration } = req.query;
    if (!professionalId || !date || !duration) {
        return res.status(400).json({
            success: false,
            message: 'professionalId, date et duration sont requis',
        });
    }
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const serviceDuration = parseInt(duration);
    // Vérifier si le professionnel est bloqué ce jour
    const blockedAvailability = await database_1.default.availability.findFirst({
        where: {
            professionalId: professionalId,
            date: targetDate,
            isAvailable: false,
        },
    });
    if (blockedAvailability) {
        return res.json({
            success: true,
            data: {
                date: targetDate,
                isBlocked: true,
                reason: blockedAvailability.reason,
                slots: [],
            },
        });
    }
    // Récupérer les heures de travail du professionnel
    const workingHours = await database_1.default.availability.findFirst({
        where: {
            professionalId: professionalId,
            date: targetDate,
            isAvailable: true,
        },
    });
    // Si pas de disponibilité définie, utiliser des heures par défaut
    const startHour = workingHours?.startTime || '09:00';
    const endHour = workingHours?.endTime || '17:00';
    // Récupérer toutes les réservations existantes
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const existingBookings = await database_1.default.booking.findMany({
        where: {
            professionalId: professionalId,
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
    // Générer les créneaux disponibles
    const availableSlots = generateAvailableSlots(startHour, endHour, serviceDuration, existingBookings);
    return res.json({
        success: true,
        data: {
            date: targetDate,
            isBlocked: false,
            slots: availableSlots,
        },
    });
};
exports.getAvailableSlots = getAvailableSlots;
// Fonction helper pour générer les créneaux disponibles
function generateAvailableSlots(startHour, endHour, duration, existingBookings) {
    const slots = [];
    // Convertir les heures en minutes
    const [startH, startM] = startHour.split(':').map(Number);
    const [endH, endM] = endHour.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    // Générer tous les créneaux possibles (par pas de 15 minutes)
    for (let time = startMinutes; time + duration <= endMinutes; time += 15) {
        const slotStart = minutesToTime(time);
        const slotEnd = minutesToTime(time + duration);
        // Vérifier si le créneau est libre
        const isAvailable = !existingBookings.some((booking) => {
            return ((slotStart >= booking.startTime && slotStart < booking.endTime) ||
                (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
                (slotStart <= booking.startTime && slotEnd >= booking.endTime));
        });
        if (isAvailable) {
            slots.push(slotStart);
        }
    }
    return slots;
}
// Convertir des minutes en format HH:MM
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
//# sourceMappingURL=calendar.controller.js.map