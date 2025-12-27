import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../auth/auth';

/**
 * @desc    Créer une nouvelle réservation
 * @route   POST /api/bookings
 * @access  Privé (ADMIN, SECRETAIRE)
 */
export const createBooking = async (req: AuthRequest, res: Response) => {
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

  // Validation
  if (!clientName || !clientPhone || !bookingDate || !startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: 'Nom du client, téléphone, date et heures sont requis',
    });
  }

  if (!serviceId && !packageId) {
    return res.status(400).json({
      success: false,
      message: 'Un service ou un forfait doit être sélectionné',
    });
  }

  // Vérifier que le créneau est disponible
  const targetDate = new Date(bookingDate);
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Vérifier les conflits de réservation
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
    return res.status(409).json({
      success: false,
      message: 'Ce créneau horaire est déjà réservé',
      conflict: {
        bookingNumber: conflictingBooking.bookingNumber,
        startTime: conflictingBooking.startTime,
        endTime: conflictingBooking.endTime,
      },
    });
  }

  // Récupérer le service ou le forfait pour calculer le prix
  let subtotal = 0;
  let service = null;
  let packageItem = null;

  if (serviceId) {
    service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé',
      });
    }

    subtotal = parseFloat(service.price.toString());
  } else if (packageId) {
    packageItem = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!packageItem) {
      return res.status(404).json({
        success: false,
        message: 'Forfait non trouvé',
      });
    }

    subtotal = parseFloat(packageItem.price.toString());
  }

  // Calculer les taxes (TPS 5% + TVQ 9.975%)
  const TPS_RATE = 0.05;
  const TVQ_RATE = 0.09975;

  const taxTPS = subtotal * TPS_RATE;
  const taxTVQ = subtotal * TVQ_RATE;
  const total = subtotal + taxTPS + taxTVQ;

  // Générer un numéro de réservation unique
  const bookingNumber = `BK${Date.now()}`;

  // Créer la réservation avec le paiement (à confirmer)
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
      status: 'PENDING',
      subtotal,
      taxTPS,
      taxTVQ,
      total,
      payment: {
        create: {
          amount: total,
          paymentMethod: 'PENDING', // À modifier lors du paiement réel
          status: 'PENDING',
        },
      },
    },
    include: {
      professional: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          photoUrl: true,
        },
      },
      service: {
        select: {
          name: true,
          duration: true,
          price: true,
        },
      },
      package: {
        select: {
          name: true,
          variant: true,
          price: true,
        },
      },
      payment: true,
    },
  });

  return res.status(201).json({
    success: true,
    message: 'Réservation créée avec succès',
    data: booking,
  });
};

/**
 * @desc    Récupérer toutes les réservations (avec filtres)
 * @route   GET /api/bookings
 * @access  Privé (ADMIN, SECRETAIRE)
 */
export const getAllBookings = async (req: AuthRequest, res: Response) => {
  const {
    page = '1',
    limit = '50',
    status,
    professionalId,
    startDate,
    endDate,
    search,
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (professionalId) {
    where.professionalId = professionalId;
  }

  if (startDate || endDate) {
    where.bookingDate = {};
    if (startDate) {
      where.bookingDate.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.bookingDate.lte = new Date(endDate as string);
    }
  }

  if (search) {
    where.OR = [
      { bookingNumber: { contains: search as string, mode: 'insensitive' } },
      { clientName: { contains: search as string, mode: 'insensitive' } },
      { clientPhone: { contains: search as string } },
    ];
  }

  const [bookings, totalCount] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        professional: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            photoUrl: true,
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
        payment: {
          select: {
            status: true,
            paymentMethod: true,
            amount: true,
          },
        },
      },
      orderBy: [{ bookingDate: 'desc' }, { startTime: 'desc' }],
      skip,
      take: limitNum,
    }),
    prisma.booking.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limitNum);

  return res.json({
    success: true,
    data: {
      bookings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    },
  });
};

/**
 * @desc    Récupérer une réservation par son ID
 * @route   GET /api/bookings/:id
 * @access  Privé (ADMIN, SECRETAIRE, MASSOTHERAPEUTE, ESTHETICIENNE)
 */
export const getBookingById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      professional: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          photoUrl: true,
          role: true,
        },
      },
      service: true,
      package: true,
      payment: true,
    },
  });

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Réservation non trouvée',
    });
  }

  // Si c'est un technicien, vérifier qu'il peut voir cette réservation
  if (
    req.user!.role === 'MASSOTHERAPEUTE' ||
    req.user!.role === 'ESTHETICIENNE'
  ) {
    if (booking.professionalId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit à cette réservation',
      });
    }
  }

  return res.json({
    success: true,
    data: booking,
  });
};

/**
 * @desc    Changer le statut d'une réservation
 * @route   PATCH /api/bookings/:id/status
 * @access  Privé (ADMIN, SECRETAIRE, MASSOTHERAPEUTE, ESTHETICIENNE)
 */
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    'PENDING',
    'CONFIRMED',
    'CLIENT_ARRIVED',
    'IN_PROGRESS',
    'COMPLETED',
    'NO_SHOW',
    'CANCELLED',
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Statut invalide',
      validStatuses,
    });
  }

  // Récupérer la réservation
  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Réservation non trouvée',
    });
  }

  // Vérifier les permissions
  const isTechnician =
    req.user!.role === 'MASSOTHERAPEUTE' ||
    req.user!.role === 'ESTHETICIENNE';

  if (isTechnician) {
    // Les techniciens ne peuvent modifier que leurs propres réservations
    if (booking.professionalId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit à cette réservation',
      });
    }

    // Les techniciens peuvent seulement marquer COMPLETED ou NO_SHOW
    if (status !== 'COMPLETED' && status !== 'NO_SHOW' && status !== 'CLIENT_ARRIVED' && status !== 'IN_PROGRESS') {
      return res.status(403).json({
        success: false,
        message: 'Vous pouvez seulement marquer CLIENT_ARRIVED, IN_PROGRESS, COMPLETED ou NO_SHOW',
      });
    }
  }

  // Mettre à jour le statut
  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: { status },
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
        },
      },
      package: {
        select: {
          name: true,
          variant: true,
        },
      },
    },
  });

  return res.json({
    success: true,
    message: 'Statut mis à jour avec succès',
    data: updatedBooking,
  });
};

/**
 * @desc    Modifier une réservation (date, heure, service)
 * @route   PUT /api/bookings/:id
 * @access  Privé (ADMIN, SECRETAIRE)
 */
export const updateBooking = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    professionalId,
    serviceId,
    packageId,
    bookingDate,
    startTime,
    endTime,
    specialNotes,
  } = req.body;

  // Vérifier que la réservation existe
  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Réservation non trouvée',
    });
  }

  // Ne pas permettre de modifier une réservation terminée ou annulée
  if (
    booking.status === 'COMPLETED' ||
    booking.status === 'CANCELLED' ||
    booking.status === 'NO_SHOW'
  ) {
    return res.status(400).json({
      success: false,
      message: 'Impossible de modifier une réservation terminée ou annulée',
    });
  }

  // Vérifier les conflits si les horaires changent
  if (bookingDate || startTime || endTime || professionalId) {
    const newDate = bookingDate ? new Date(bookingDate) : booking.bookingDate;
    newDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(newDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const newStartTime = startTime || booking.startTime;
    const newEndTime = endTime || booking.endTime;
    const newProfessionalId = professionalId || booking.professionalId;

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        id: { not: id }, // Exclure la réservation actuelle
        professionalId: newProfessionalId,
        bookingDate: {
          gte: newDate,
          lt: nextDay,
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: newStartTime } },
              { endTime: { gt: newStartTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: newEndTime } },
              { endTime: { gte: newEndTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: newStartTime } },
              { endTime: { lte: newEndTime } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Ce créneau horaire est déjà réservé',
        conflict: {
          bookingNumber: conflictingBooking.bookingNumber,
          startTime: conflictingBooking.startTime,
          endTime: conflictingBooking.endTime,
        },
      });
    }
  }

  // Recalculer le prix si le service ou le forfait change
  let updateData: any = {
    professionalId,
    bookingDate: bookingDate ? new Date(bookingDate) : undefined,
    startTime,
    endTime,
    specialNotes,
  };

  if (serviceId !== undefined || packageId !== undefined) {
    // Retirer l'ancien service/forfait
    updateData.serviceId = serviceId || null;
    updateData.packageId = packageId || null;

    // Recalculer le prix
    let subtotal = 0;

    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service non trouvé',
        });
      }

      subtotal = parseFloat(service.price.toString());
      updateData.type = 'SERVICE';
    } else if (packageId) {
      const packageItem = await prisma.package.findUnique({
        where: { id: packageId },
      });

      if (!packageItem) {
        return res.status(404).json({
          success: false,
          message: 'Forfait non trouvé',
        });
      }

      subtotal = parseFloat(packageItem.price.toString());
      updateData.type = 'PACKAGE';
    }

    // Calculer les taxes
    const TPS_RATE = 0.05;
    const TVQ_RATE = 0.09975;

    const taxTPS = subtotal * TPS_RATE;
    const taxTVQ = subtotal * TVQ_RATE;
    const total = subtotal + taxTPS + taxTVQ;

    updateData.subtotal = subtotal;
    updateData.taxTPS = taxTPS;
    updateData.taxTVQ = taxTVQ;
    updateData.total = total;

    // Mettre à jour le paiement aussi
    await prisma.payment.update({
      where: { id: booking.paymentId },
      data: { amount: total },
    });
  }

  // Mettre à jour la réservation
  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: {
      professional: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          photoUrl: true,
        },
      },
      service: true,
      package: true,
      payment: true,
    },
  });

  return res.json({
    success: true,
    message: 'Réservation mise à jour avec succès',
    data: updatedBooking,
  });
};

/**
 * @desc    Annuler une réservation
 * @route   DELETE /api/bookings/:id
 * @access  Privé (ADMIN, SECRETAIRE)
 */
export const cancelBooking = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { cancellationReason } = req.body;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      payment: true,
    },
  });

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Réservation non trouvée',
    });
  }

  if (booking.status === 'CANCELLED') {
    return res.status(400).json({
      success: false,
      message: 'Cette réservation est déjà annulée',
    });
  }

  // Mettre à jour la réservation et le paiement
  const [updatedBooking] = await Promise.all([
    prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        specialNotes: cancellationReason
          ? `${booking.specialNotes || ''}\nAnnulation: ${cancellationReason}`
          : booking.specialNotes,
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
          },
        },
        package: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.payment.update({
      where: { id: booking.paymentId },
      data: { status: 'CANCELLED' },
    }),
  ]);

  return res.json({
    success: true,
    message: 'Réservation annulée avec succès',
    data: updatedBooking,
  });
};
