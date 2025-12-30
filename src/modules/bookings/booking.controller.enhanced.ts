import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../auth/auth';
import { isSlotAvailable } from '../availability/availability.service';
import { logStatusChange, logBookingMove, getBookingHistory } from './booking-history.service';
import {
  scheduleBookingReminder,
  sendBookingConfirmedNotification,
  sendBookingCancelledNotification,
  sendBookingUpdatedNotification,
  updateReminders,
} from '../notifications/notification.service';
import {
  emitNewBooking,
  emitBookingUpdate,
  emitBookingStatusChange,
  emitBookingCancelled,
  emitBookingMoved,
} from '../../lib/socket';

/**
 * Valider qu'une heure est sur un créneau de 30 minutes
 */
const isValidTimeSlot = (time: string): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  return minutes === 0 || minutes === 30;
};

/**
 * RÉSERVATION MANUELLE (Admin/Secrétaire depuis le calendrier)
 * @route POST /api/bookings
 * @access Privé (ADMIN, SECRETAIRE)
 */
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const {
      professionalId,
      serviceId,
      packageId,
      clientName,
      clientPhone,
      clientEmail,
      bookingDate,
      startTime,
      endTime,
      specialNotes,
    } = req.body;

    // Validation des champs requis
    if (!clientName || !clientPhone || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Nom, téléphone, date et heures sont requis',
      });
    }

    if (!serviceId && !packageId) {
      return res.status(400).json({
        success: false,
        message: 'Un service ou forfait doit être sélectionné',
      });
    }

    if (!professionalId) {
      return res.status(400).json({
        success: false,
        message: 'Un professionnel doit être assigné',
      });
    }

    // Validation créneaux 30min
    if (!isValidTimeSlot(startTime) || !isValidTimeSlot(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Les heures doivent être sur des créneaux de 30 minutes (ex: 10:00, 10:30)',
      });
    }

    const targetDate = new Date(bookingDate);
    targetDate.setHours(0, 0, 0, 0);

    // Vérifier disponibilité via le service
    const availability = await isSlotAvailable(
      professionalId,
      targetDate,
      startTime,
      endTime
    );

    if (!availability.available) {
      return res.status(409).json({
        success: false,
        message: availability.reason || 'Créneau non disponible',
      });
    }

    // Récupérer service/forfait pour le prix
    let subtotal = 0;
    let service = null;
    let packageItem = null;

    if (serviceId) {
      service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!service) {
        return res.status(404).json({ success: false, message: 'Service non trouvé' });
      }
      subtotal = parseFloat(service.price.toString());
    } else if (packageId) {
      packageItem = await prisma.package.findUnique({ where: { id: packageId } });
      if (!packageItem) {
        return res.status(404).json({ success: false, message: 'Forfait non trouvé' });
      }
      subtotal = parseFloat(packageItem.price.toString());
    }

    // Calculer taxes
    const taxTPS = subtotal * 0.05;
    const taxTVQ = subtotal * 0.09975;
    const total = subtotal + taxTPS + taxTVQ;

    // Générer numéro unique
    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Créer réservation
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        type: serviceId ? 'SERVICE' : 'PACKAGE',
        professionalId,
        serviceId,
        packageId,
        clientName,
        clientPhone,
        clientEmail: clientEmail || '',
        bookingDate: targetDate,
        startTime,
        endTime,
        specialNotes,
        status: 'CONFIRMED', // Confirmé d'office car créé par staff
        subtotal,
        taxTPS,
        taxTVQ,
        total,
        createdById: req.user!.id,
        payment: {
          create: {
            amount: total,
            paymentMethod: 'CASH', // Paiement manuel en personne
            status: 'PENDING',
          },
        },
      },
      include: {
        professional: {
          select: { id: true, nom: true, prenom: true, photoUrl: true },
        },
        service: true,
        package: true,
        payment: true,
      },
    });

    // Enregistrer historique
    await logStatusChange({
      bookingId: booking.id,
      changedById: req.user!.id,
      changedBy: req.user!.email,
      changedByRole: req.user!.role,
      newStatus: 'CONFIRMED',
      reason: 'Réservation créée par staff',
    });

    // Programmer rappels
    await scheduleBookingReminder(booking);
    await sendBookingConfirmedNotification(booking);

    // Notifier temps réel
    emitNewBooking(booking);

    return res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: booking,
    });
  } catch (error) {
    console.error('Erreur création réservation:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
};

/**
 * RÉSERVATION EN LIGNE (Clients depuis le site)
 * @route POST /api/bookings/online
 * @access Public
 */
export const createOnlineBooking = async (req: any, res: Response) => {
  try {
    const {
      professionalId,
      serviceId,
      packageId,
      clientName,
      clientPhone,
      clientEmail,
      bookingDate,
      startTime,
      endTime,
      specialNotes,
    } = req.body;

    // Validations
    if (!clientName || !clientEmail || !clientPhone || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis',
      });
    }

    if (!serviceId && !packageId) {
      return res.status(400).json({
        success: false,
        message: 'Sélectionnez un service ou forfait',
      });
    }

    if (!professionalId) {
      return res.status(400).json({
        success: false,
        message: 'Sélectionnez un professionnel',
      });
    }

    // Validation créneaux 30min
    if (!isValidTimeSlot(startTime) || !isValidTimeSlot(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez sélectionner un créneau valide',
      });
    }

    const targetDate = new Date(bookingDate);
    targetDate.setHours(0, 0, 0, 0);

    // Vérifier disponibilité
    const availability = await isSlotAvailable(
      professionalId,
      targetDate,
      startTime,
      endTime
    );

    if (!availability.available) {
      return res.status(409).json({
        success: false,
        message: 'Ce créneau n\'est plus disponible',
      });
    }

    // Récupérer service/forfait
    let subtotal = 0;
    let service = null;
    let packageItem = null;

    if (serviceId) {
      service = await prisma.service.findUnique({ where: { id: serviceId, isActive: true } });
      if (!service) {
        return res.status(404).json({ success: false, message: 'Service indisponible' });
      }
      subtotal = parseFloat(service.price.toString());
    } else if (packageId) {
      packageItem = await prisma.package.findUnique({ where: { id: packageId, isActive: true } });
      if (!packageItem) {
        return res.status(404).json({ success: false, message: 'Forfait indisponible' });
      }
      subtotal = parseFloat(packageItem.price.toString());
    }

    // Calculer taxes
    const taxTPS = subtotal * 0.05;
    const taxTVQ = subtotal * 0.09975;
    const total = subtotal + taxTPS + taxTVQ;

    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Créer réservation (PENDING en attendant paiement)
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        type: serviceId ? 'SERVICE' : 'PACKAGE',
        professionalId,
        serviceId,
        packageId,
        clientName,
        clientPhone,
        clientEmail,
        bookingDate: targetDate,
        startTime,
        endTime,
        specialNotes,
        status: 'PENDING', // En attente du paiement
        subtotal,
        taxTPS,
        taxTVQ,
        total,
        payment: {
          create: {
            amount: total,
            status: 'PENDING',
          },
        },
      },
      include: {
        professional: { select: { id: true, nom: true, prenom: true } },
        service: true,
        package: true,
        payment: true,
      },
    });

    // Créer session Stripe Checkout
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: service ? service.name : packageItem!.name,
              description: `Réservation pour le ${targetDate.toLocaleDateString('fr-CA')} à ${startTime}`,
            },
            unit_amount: Math.round(total * 100), // Stripe utilise centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/booking/cancelled`,
      client_reference_id: booking.id,
      customer_email: clientEmail,
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
      },
    });

    // Historique
    await logStatusChange({
      bookingId: booking.id,
      changedById: booking.id, // Pas d'utilisateur authentifié
      changedBy: clientName,
      changedByRole: 'CLIENT',
      newStatus: 'PENDING',
      reason: 'Réservation en ligne créée',
    });

    return res.status(201).json({
      success: true,
      message: 'Réservation créée - procédez au paiement',
      data: {
        booking,
        checkoutUrl: session.url,
        sessionId: session.id,
      },
    });
  } catch (error) {
    console.error('Erreur réservation en ligne:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
};

/**
 * Déplacer une réservation (drag & drop)
 * @route PATCH /api/bookings/:id/move
 * @access Privé (ADMIN, SECRETAIRE)
 */
export const moveBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newDate, newStartTime, newProfessionalId } = req.body;

    // Validation créneaux 30min
    if (newStartTime && !isValidTimeSlot(newStartTime)) {
      return res.status(400).json({
        success: false,
        message: 'L\'heure doit être sur un créneau de 30 minutes',
      });
    }

    // Récupérer réservation actuelle
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true, package: true },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
    }

    if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de déplacer une réservation terminée ou annulée',
      });
    }

    // Calculer durée du service
    const duration = booking.service?.duration || 60;
    const newEndTime = newStartTime
      ? `${String(Math.floor((parseInt(newStartTime.split(':')[0]) * 60 + parseInt(newStartTime.split(':')[1]) + duration) / 60)).padStart(2, '0')}:${String((parseInt(newStartTime.split(':')[0]) * 60 + parseInt(newStartTime.split(':')[1]) + duration) % 60).padStart(2, '0')}`
      : booking.endTime;

    const finalDate = newDate ? new Date(newDate) : booking.bookingDate;
    finalDate.setHours(0, 0, 0, 0);

    const finalProfessionalId = newProfessionalId || booking.professionalId!;
    const finalStartTime = newStartTime || booking.startTime;

    // Vérifier disponibilité
    const availability = await isSlotAvailable(
      finalProfessionalId,
      finalDate,
      finalStartTime,
      newEndTime,
      id
    );

    if (!availability.available) {
      return res.status(409).json({
        success: false,
        message: availability.reason || 'Créneau non disponible',
      });
    }

    // Mettre à jour
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        bookingDate: finalDate,
        startTime: finalStartTime,
        endTime: newEndTime,
        professionalId: finalProfessionalId,
      },
      include: {
        professional: { select: { id: true, nom: true, prenom: true, photoUrl: true } },
        service: true,
        package: true,
      },
    });

    // Historique
    await logBookingMove({
      bookingId: id,
      changedById: req.user!.id,
      changedBy: req.user!.email,
      changedByRole: req.user!.role,
      oldDate: booking.bookingDate,
      newDate: finalDate,
      oldStartTime: booking.startTime,
      newStartTime: finalStartTime,
      oldEndTime: booking.endTime,
      newEndTime,
      oldProfessionalId: booking.professionalId || undefined,
      newProfessionalId: finalProfessionalId,
    });

    // Mettre à jour rappels si date changée
    if (newDate) {
      await updateReminders(id);
    }

    // Socket.io
    emitBookingMoved(updatedBooking, booking.bookingDate, finalDate, booking.startTime, finalStartTime);

    return res.json({
      success: true,
      message: 'Réservation déplacée avec succès',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Erreur déplacement réservation:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
};

/**
 * Obtenir l'historique d'une réservation
 * @route GET /api/bookings/:id/history
 * @access Privé
 */
export const getBookingHistoryById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const history = await getBookingHistory(id);

    return res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

// Exporter aussi les fonctions existantes que vous avez déjà (getAllBookings, updateBookingStatus, etc.)
// Je les ajoute ici pour référence - vous devrez fusionner avec votre code existant

export { isValidTimeSlot };
