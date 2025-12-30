import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed du système de réservation...\n');

  // ========================================
  // 1. PARAMÈTRES SYSTÈME
  // ========================================
  console.log('📋 Création des paramètres système...');

  const systemSettings = [
    {
      key: 'SLOT_INTERVAL',
      value: '30',
      description: 'Intervalle de temps pour les créneaux horaires (en minutes)',
    },
    {
      key: 'DEFAULT_WORK_START',
      value: '09:00',
      description: 'Heure de début de travail par défaut',
    },
    {
      key: 'DEFAULT_WORK_END',
      value: '17:00',
      description: 'Heure de fin de travail par défaut',
    },
    {
      key: 'REMINDER_HOURS_BEFORE',
      value: '24',
      description: 'Nombre d\'heures avant le rendez-vous pour envoyer un rappel',
    },
    {
      key: 'BOOKING_CANCELLATION_DEADLINE',
      value: '24',
      description: 'Délai minimum (en heures) pour annuler une réservation sans frais',
    },
    {
      key: 'ALLOW_ONLINE_BOOKING',
      value: 'true',
      description: 'Autoriser les réservations en ligne depuis le site web',
    },
    {
      key: 'MAX_ADVANCE_BOOKING_DAYS',
      value: '60',
      description: 'Nombre maximum de jours à l\'avance pour réserver en ligne',
    },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
      },
      create: setting,
    });
    console.log(`  ✅ ${setting.key}: ${setting.value}`);
  }

  console.log('✅ Paramètres système créés\n');

  // ========================================
  // 2. HORAIRES DE TRAVAIL TEMPLATE
  // ========================================
  console.log('📅 Configuration des horaires de travail...');

  // Récupérer tous les professionnels actifs
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
      role: true,
    },
  });

  console.log(`  📍 ${professionals.length} professionnel(s) trouvé(s)\n`);

  if (professionals.length === 0) {
    console.log('⚠️ Aucun professionnel trouvé. Assurez-vous d\'avoir des utilisateurs avec les rôles MASSOTHERAPEUTE ou ESTHETICIENNE.\n');
  }

  // Configuration par défaut : Lundi-Vendredi 9h-17h
  const weekdaySchedule = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Lundi
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Mardi
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Mercredi
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Jeudi
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Vendredi
  ];

  for (const professional of professionals) {
    console.log(`  👤 Configuration pour ${professional.prenom} ${professional.nom} (${professional.role})`);

    // Créer horaires de travail pour chaque jour de semaine
    for (const schedule of weekdaySchedule) {
      await prisma.workingSchedule.upsert({
        where: {
          professionalId_dayOfWeek: {
            professionalId: professional.id,
            dayOfWeek: schedule.dayOfWeek,
          },
        },
        update: {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: true,
        },
        create: {
          professionalId: professional.id,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: true,
        },
      });
    }

    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    console.log(`     ✅ Horaires créés : ${dayNames.join(', ')} (09:00-17:00)`);

    // Créer pause déjeuner (12:00-13:00, tous les jours travaillés)
    await prisma.breakPeriod.create({
      data: {
        professionalId: professional.id,
        dayOfWeek: null, // null = applicable à tous les jours
        startTime: '12:00',
        endTime: '13:00',
        label: 'Pause déjeuner',
        isActive: true,
      },
    });

    console.log(`     ✅ Pause déjeuner créée : 12:00-13:00 (tous les jours)\n`);
  }

  console.log('✅ Horaires de travail configurés\n');

  // ========================================
  // 3. STATISTIQUES FINALES
  // ========================================
  console.log('📊 Statistiques du seed:');

  const settingsCount = await prisma.systemSettings.count();
  const schedulesCount = await prisma.workingSchedule.count();
  const breaksCount = await prisma.breakPeriod.count();

  console.log(`  📋 Paramètres système: ${settingsCount}`);
  console.log(`  📅 Horaires de travail: ${schedulesCount}`);
  console.log(`  ☕ Pauses configurées: ${breaksCount}`);
  console.log(`  👥 Professionnels configurés: ${professionals.length}\n`);

  console.log('✅ Seed du système de réservation terminé avec succès!');
  console.log('\n📝 Prochaines étapes:');
  console.log('  1. Vérifiez les horaires avec GET /api/availability/working-schedule/:professionalId');
  console.log('  2. Testez les créneaux disponibles avec GET /api/calendar/available-slots');
  console.log('  3. Créez une première réservation avec POST /api/bookings');
  console.log('  4. Consultez les paramètres système avec GET /api/settings\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
