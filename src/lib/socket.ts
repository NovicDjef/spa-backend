import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

let io: Server | null = null;

/**
 * Interface pour le JWT décodé
 */
interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Interface pour le socket authentifié
 */
interface AuthenticatedSocket extends Socket {
  user?: JWTPayload;
}

/**
 * Initialiser Socket.io avec authentification JWT
 */
export function initializeSocket(server: HTTPServer): Server {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? [
            process.env.FRONTEND_URL,
            process.env.ADMIN_URL,
            'https://dospa.novic.dev',
          ].filter((url): url is string => Boolean(url))
        : true,
      credentials: true,
    },
  });

  // Middleware d'authentification
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Token manquant'));
      }

      // Vérifier le token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

      // Vérifier que l'utilisateur existe et est actif
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, isActive: true },
      });

      if (!user) {
        return next(new Error('Utilisateur non trouvé'));
      }

      if (!user.isActive && user.role !== 'ADMIN') {
        return next(new Error('Compte désactivé'));
      }

      // Attacher les infos utilisateur au socket
      socket.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      console.error('Erreur authentification Socket.io:', error);
      next(new Error('Authentification échouée'));
    }
  });

  // Gestion des connexions
  io.on('connection', (socket: AuthenticatedSocket) => {
    if (!socket.user) return;

    console.log(`✅ Socket connecté: ${socket.user.email} (${socket.user.role})`);

    // Rejoindre les rooms selon le rôle
    if (socket.user.role === 'ADMIN') {
      socket.join('admin-room');
      socket.join('calendar-updates');
    } else if (socket.user.role === 'SECRETAIRE') {
      socket.join('secretaire-room');
      socket.join('calendar-updates');
    } else if (socket.user.role === 'MASSOTHERAPEUTE' || socket.user.role === 'ESTHETICIENNE') {
      socket.join(`professional-${socket.user.id}`);
      socket.join('professional-room');
    }

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`❌ Socket déconnecté: ${socket.user?.email}`);
    });
  });

  console.log('🔌 Socket.io initialisé');

  return io;
}

/**
 * Obtenir l'instance Socket.io
 */
export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io non initialisé. Appelez initializeSocket() d\'abord.');
  }
  return io;
}

/**
 * Émettre un événement de nouvelle réservation
 */
export function emitNewBooking(booking: any) {
  if (!io) return;

  io.to('calendar-updates').emit('booking:created', {
    booking,
    timestamp: new Date(),
  });

  // Notifier spécifiquement le professionnel assigné
  if (booking.professionalId) {
    io.to(`professional-${booking.professionalId}`).emit('booking:assigned', {
      booking,
      timestamp: new Date(),
    });
  }

  console.log(`📢 Événement booking:created émis pour ${booking.bookingNumber}`);
}

/**
 * Émettre un événement de mise à jour de réservation
 */
export function emitBookingUpdate(booking: any) {
  if (!io) return;

  io.to('calendar-updates').emit('booking:updated', {
    booking,
    timestamp: new Date(),
  });

  // Notifier le professionnel assigné
  if (booking.professionalId) {
    io.to(`professional-${booking.professionalId}`).emit('booking:updated', {
      booking,
      timestamp: new Date(),
    });
  }

  console.log(`📢 Événement booking:updated émis pour ${booking.bookingNumber}`);
}

/**
 * Émettre un événement de changement de statut
 */
export function emitBookingStatusChange(booking: any, oldStatus: string, newStatus: string) {
  if (!io) return;

  io.to('calendar-updates').emit('booking:statusChanged', {
    booking,
    oldStatus,
    newStatus,
    timestamp: new Date(),
  });

  // Notifier le professionnel
  if (booking.professionalId) {
    io.to(`professional-${booking.professionalId}`).emit('booking:statusChanged', {
      booking,
      oldStatus,
      newStatus,
      timestamp: new Date(),
    });
  }

  console.log(`📢 Événement booking:statusChanged émis: ${oldStatus} → ${newStatus}`);
}

/**
 * Émettre un événement d'annulation de réservation
 */
export function emitBookingCancelled(bookingId: string, reason?: string) {
  if (!io) return;

  io.to('calendar-updates').emit('booking:cancelled', {
    bookingId,
    reason,
    timestamp: new Date(),
  });

  console.log(`📢 Événement booking:cancelled émis pour ${bookingId}`);
}

/**
 * Émettre un événement de déplacement de réservation (drag & drop)
 */
export function emitBookingMoved(
  booking: any,
  oldDate?: Date,
  newDate?: Date,
  oldTime?: string,
  newTime?: string
) {
  if (!io) return;

  io.to('calendar-updates').emit('booking:moved', {
    booking,
    changes: {
      oldDate,
      newDate,
      oldTime,
      newTime,
    },
    timestamp: new Date(),
  });

  // Notifier le professionnel
  if (booking.professionalId) {
    io.to(`professional-${booking.professionalId}`).emit('booking:moved', {
      booking,
      changes: {
        oldDate,
        newDate,
        oldTime,
        newTime,
      },
      timestamp: new Date(),
    });
  }

  console.log(`📢 Événement booking:moved émis pour ${booking.bookingNumber}`);
}

export { io };
