# 🎯 Guide de Finalisation - Système de Réservation Spa

## ✅ COMPLÉTÉ (11/21 tâches)

### Phase 1-3: Infrastructure ✅
1. **Schéma Prisma** - 5 nouveaux modèles créés et migrés
2. **Services métier** - availability, booking-history, notification
3. **Socket.io** - Temps réel avec JWT auth
4. **Réservations** - Dual flow (en ligne + manuel) avec historique

### Fichiers créés:
- ✅ `prisma/schema.prisma` - Modèles: BookingStatusHistory, WorkingSchedule, BreakPeriod, Notification, SystemSettings
- ✅ `src/modules/availability/availability.service.ts` - Créneaux 30min, horaires template
- ✅ `src/modules/bookings/booking-history.service.ts` - Traçabilité complète
- ✅ `src/modules/notifications/notification.service.ts` - Rappels automatiques
- ✅ `src/lib/socket.ts` - WebSocket temps réel
- ✅ `src/modules/bookings/booking.controller.enhanced.ts` - Réservations online + drag & drop
- ✅ `src/modules/bookings/booking.routes.ts` - Routes mises à jour

---

## 📋 À FAIRE (10 tâches restantes)

### Tâche 12: Créer working-schedule.controller.ts

**Fichier:** `src/modules/availability/working-schedule.controller.ts`

```typescript
import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../auth/auth';

/**
 * Définir l'horaire hebdomadaire d'un technicien
 * POST /api/availability/working-schedule
 */
export const setWorkingSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { professionalId, schedules } = req.body;
    // schedules = [{ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }, ...]

    if (!professionalId || !Array.isArray(schedules)) {
      return res.status(400).json({ success: false, message: 'Données invalides' });
    }

    // Supprimer anciens horaires
    await prisma.workingSchedule.deleteMany({
      where: { professionalId },
    });

    // Créer nouveaux horaires
    const created = await prisma.workingSchedule.createMany({
      data: schedules.map((s: any) => ({
        professionalId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isActive: true,
      })),
    });

    res.json({ success: true, message: `${created.count} horaires créés` });
  } catch (error) {
    console.error('Erreur setWorkingSchedule:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Obtenir l'horaire hebdomadaire d'un technicien
 * GET /api/availability/working-schedule/:professionalId
 */
export const getWorkingSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { professionalId } = req.params;

    const schedules = await prisma.workingSchedule.findMany({
      where: { professionalId, isActive: true },
      orderBy: { dayOfWeek: 'asc' },
    });

    // Convertir en objet avec tous les jours
    const weekSchedule: any = {};
    for (let i = 0; i <= 6; i++) {
      const schedule = schedules.find((s) => s.dayOfWeek === i);
      weekSchedule[i] = schedule
        ? { startTime: schedule.startTime, endTime: schedule.endTime }
        : null;
    }

    res.json({ success: true, data: weekSchedule });
  } catch (error) {
    console.error('Erreur getWorkingSchedule:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Ajouter une pause
 * POST /api/availability/breaks
 */
export const addBreak = async (req: AuthRequest, res: Response) => {
  try {
    const { professionalId, dayOfWeek, startTime, endTime, label } = req.body;

    const breakPeriod = await prisma.breakPeriod.create({
      data: {
        professionalId,
        dayOfWeek: dayOfWeek !== undefined ? dayOfWeek : null, // null = tous les jours
        startTime,
        endTime,
        label: label || 'Pause',
        isActive: true,
      },
    });

    res.status(201).json({ success: true, data: breakPeriod });
  } catch (error) {
    console.error('Erreur addBreak:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Obtenir les pauses d'un technicien
 * GET /api/availability/breaks/:professionalId
 */
export const getBreaks = async (req: AuthRequest, res: Response) => {
  try {
    const { professionalId } = req.params;

    const breaks = await prisma.breakPeriod.findMany({
      where: { professionalId, isActive: true },
      orderBy: { dayOfWeek: 'asc' },
    });

    res.json({ success: true, data: breaks });
  } catch (error) {
    console.error('Erreur getBreaks:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Supprimer une pause
 * DELETE /api/availability/breaks/:id
 */
export const deleteBreak = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.breakPeriod.delete({ where: { id } });

    res.json({ success: true, message: 'Pause supprimée' });
  } catch (error) {
    console.error('Erreur deleteBreak:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
```

---

### Tâche 13: Modifier availability.routes.ts

**Fichier:** `src/modules/availability/availability.routes.ts`

**Ajouter à la fin:**
```typescript
import {
  setWorkingSchedule,
  getWorkingSchedule,
  addBreak,
  getBreaks,
  deleteBreak,
} from './working-schedule.controller';

// Routes horaires template
router.post(
  '/working-schedule',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(setWorkingSchedule)
);

router.get(
  '/working-schedule/:professionalId',
  authenticate,
  authorize('ADMIN', 'SECRETAIRE'),
  asyncHandler(getWorkingSchedule)
);

// Routes pauses
router.post('/breaks', authenticate, authorize('ADMIN'), asyncHandler(addBreak));
router.get(
  '/breaks/:professionalId',
  authenticate,
  authorize('ADMIN', 'SECRETAIRE'),
  asyncHandler(getBreaks)
);
router.delete(
  '/breaks/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(deleteBreak)
);
```

---

### Tâche 14: Modifier calendar.controller.ts

**Fichier:** `src/modules/calendar/calendar.controller.ts`

**Dans la fonction `getAvailableSlots` (ligne ~214), remplacer par:**
```typescript
import { calculateAvailableSlots } from '../availability/availability.service';

export const getAvailableSlots = async (req: AuthRequest, res: Response) => {
  const { professionalId, date, duration } = req.query;

  if (!professionalId || !date) {
    return res.status(400).json({
      success: false,
      message: 'professionalId et date requis',
    });
  }

  const targetDate = new Date(date as string);
  const serviceDuration = duration ? parseInt(duration as string) : 60;

  const slots = await calculateAvailableSlots(
    professionalId as string,
    targetDate,
    serviceDuration
  );

  const availableSlots = slots
    .filter((slot) => slot.available)
    .map((slot) => slot.time);

  return res.json({
    success: true,
    data: {
      date: targetDate,
      slots: availableSlots,
    },
  });
};
```

---

### Tâches 15-16: Recherche clients (Autocomplete + Historique)

**Fichier:** `src/modules/clients/client.controller.ts`

**Ajouter à la fin:**
```typescript
/**
 * Autocomplete clients (recherche temps réel)
 * GET /api/clients/autocomplete?q=dupont
 */
export const autocompleteClients = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || (q as string).length < 2) {
      return res.json({ success: true, data: [] });
    }

    const clients = await prisma.clientProfile.findMany({
      where: {
        OR: [
          { nom: { contains: q as string, mode: 'insensitive' } },
          { prenom: { contains: q as string, mode: 'insensitive' } },
          { telCellulaire: { contains: q as string } },
          { courriel: { contains: q as string, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        telCellulaire: true,
        courriel: true,
        serviceType: true,
      },
      take: 10,
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
    });

    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Erreur autocomplete:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Historique complet des réservations d'un client
 * GET /api/clients/:id/bookings
 */
export const getClientBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { includeHistory = 'true' } = req.query;

    const client = await prisma.clientProfile.findUnique({ where: { id } });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client non trouvé' });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { clientEmail: client.courriel },
          { clientPhone: client.telCellulaire },
        ],
      },
      include: {
        professional: {
          select: { id: true, nom: true, prenom: true, role: true },
        },
        service: { select: { name: true, duration: true } },
        package: { select: { name: true, variant: true } },
        payment: { select: { status: true, amount: true } },
        ...(includeHistory === 'true'
          ? { statusHistory: { orderBy: { changedAt: 'desc' as const } } }
          : {}),
      },
      orderBy: [{ bookingDate: 'desc' }, { startTime: 'desc' }],
    });

    const now = new Date();
    const stats = {
      total: bookings.length,
      completed: bookings.filter((b) => b.status === 'COMPLETED').length,
      cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
      noShow: bookings.filter((b) => b.status === 'NO_SHOW').length,
      upcoming: bookings.filter(
        (b) =>
          b.bookingDate >= now &&
          !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(b.status)
      ).length,
    };

    res.json({
      success: true,
      data: {
        client: {
          id,
          nom: client.nom,
          prenom: client.prenom,
          courriel: client.courriel,
          telCellulaire: client.telCellulaire,
          serviceType: client.serviceType,
        },
        bookings,
        stats,
      },
    });
  } catch (error) {
    console.error('Erreur getClientBookings:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
```

**Routes (`client.routes.ts`):**
```typescript
router.get('/autocomplete', authenticate, asyncHandler(autocompleteClients));
router.get('/:id/bookings', authenticate, asyncHandler(getClientBookings));
```

---

### Tâche 17: Modifier scheduler.ts

**Fichier:** `src/lib/scheduler.ts`

**Remplacer la fonction de rappel par:**
```typescript
import { getPendingNotifications, markNotificationAsSent, markNotificationAsFailed } from '../modules/notifications/notification.service';
import { sendBookingReminder } from './email';

async function processScheduledNotifications() {
  console.log('🔍 Vérification notifications programmées...');

  const notifications = await getPendingNotifications();

  console.log(`📧 ${notifications.length} notification(s) à envoyer`);

  for (const notif of notifications) {
    try {
      if (notif.type === 'BOOKING_REMINDER' && notif.bookingId) {
        const booking = await prisma.booking.findUnique({
          where: { id: notif.bookingId },
          include: { service: true, package: true, professional: true },
        });

        if (!booking || booking.status !== 'CONFIRMED') {
          await markNotificationAsFailed(notif.id, 'Booking not confirmed');
          continue;
        }

        // Envoyer email
        await sendBookingReminder({
          bookingNumber: booking.bookingNumber,
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          serviceName: booking.service?.name || booking.package?.name || 'Service',
          professionalName: booking.professional
            ? `${booking.professional.prenom} ${booking.professional.nom}`
            : 'Notre équipe',
          bookingDate: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          total: parseFloat(booking.total.toString()),
          address: process.env.SPA_ADDRESS || '',
        });

        await markNotificationAsSent(notif.id);
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent: true },
        });

        console.log(`✅ Rappel envoyé: ${booking.bookingNumber}`);
      }
    } catch (error) {
      console.error(`❌ Erreur notification ${notif.id}:`, error);
      await markNotificationAsFailed(
        notif.id,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}

// Modifier le cron pour 30 minutes
cron.schedule('*/30 * * * *', processScheduledNotifications);
```

---

### Tâches 18-19: Module Settings

**Créer:** `src/modules/settings/settings.controller.ts`

```typescript
import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../auth/auth';

export const getAllSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.systemSettings.findMany();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getSetting = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;
    const setting = await prisma.systemSettings.findUnique({ where: { key } });

    if (!setting) {
      return res.status(404).json({ success: false, message: 'Setting non trouvé' });
    }

    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const upsertSetting = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    const setting = await prisma.systemSettings.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });

    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
```

**Créer:** `src/modules/settings/settings.routes.ts`

```typescript
import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import * as settingsController from './settings.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', asyncHandler(settingsController.getAllSettings));
router.get('/:key', asyncHandler(settingsController.getSetting));
router.put('/:key', asyncHandler(settingsController.upsertSetting));

export default router;
```

**Dans `server.ts`, ajouter:**
```typescript
import settingsRoutes from './modules/settings/settings.routes';
app.use('/api/settings', settingsRoutes);
```

---

### Tâche 20: Seed données initiales

**Créer:** `prisma/seed-booking-system.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed système de réservation...');

  // 1. Settings système
  await prisma.systemSettings.upsert({
    where: { key: 'SLOT_INTERVAL' },
    update: {},
    create: {
      key: 'SLOT_INTERVAL',
      value: '30',
      description: 'Intervalle des créneaux horaires en minutes',
    },
  });

  await prisma.systemSettings.upsert({
    where: { key: 'DEFAULT_WORK_START' },
    update: {},
    create: {
      key: 'DEFAULT_WORK_START',
      value: '09:00',
      description: 'Heure de début par défaut',
    },
  });

  await prisma.systemSettings.upsert({
    where: { key: 'DEFAULT_WORK_END' },
    update: {},
    create: {
      key: 'DEFAULT_WORK_END',
      value: '17:00',
      description: 'Heure de fin par défaut',
    },
  });

  // 2. Horaires par défaut pour tous les techniciens
  const professionals = await prisma.user.findMany({
    where: {
      role: { in: ['MASSOTHERAPEUTE', 'ESTHETICIENNE'] },
      isActive: true,
    },
  });

  for (const pro of professionals) {
    console.log(`⏰ Configuration horaires: ${pro.prenom} ${pro.nom}`);

    // Lundi-Vendredi: 9h-17h
    for (let day = 1; day <= 5; day++) {
      await prisma.workingSchedule.upsert({
        where: {
          professionalId_dayOfWeek: {
            professionalId: pro.id,
            dayOfWeek: day,
          },
        },
        update: {},
        create: {
          professionalId: pro.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isActive: true,
        },
      });
    }

    // Pause lunch 12h-13h tous les jours
    await prisma.breakPeriod.create({
      data: {
        professionalId: pro.id,
        dayOfWeek: null, // Tous les jours
        startTime: '12:00',
        endTime: '13:00',
        label: 'Lunch',
        isActive: true,
      },
    });
  }

  console.log('✅ Seed terminé!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Exécuter:**
```bash
npx tsx prisma/seed-booking-system.ts
```

---

## 🧪 Tests à effectuer

1. **Créneaux 30min**: Créer réservation à 10:00 ✓, 10:30 ✓, 10:15 ✗
2. **Réservation manuelle**: Admin crée réservation → vérifier historique
3. **Réservation en ligne**: Client réserve → paiement Stripe → confirmation
4. **Drag & drop**: Déplacer réservation → vérifier historique
5. **Socket.io**: 2 utilisateurs connectés → créer booking → vérifier événement reçu
6. **Autocomplete**: Taper "dup" → résultats < 200ms
7. **Horaires template**: Définir Lun-Ven 9h-17h → vérifier créneaux disponibles
8. **Pauses**: Ajouter lunch 12h-13h → vérifier créneaux bloqués

---

## 📚 Documentation complète

Le plan complet est sauvegardé dans:
`/Users/novicmelataguia/.claude/plans/sorted-squishing-cupcake.md`

---

## 🚀 Démarrer le serveur

```bash
npm run dev
```

Le serveur démarrera avec:
- ✅ Socket.io activé
- ✅ Routes de réservation (online + manual)
- ✅ Historique et traçabilité
- ✅ Notifications programmées
