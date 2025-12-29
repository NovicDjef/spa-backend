#!/usr/bin/env tsx
/**
 * Script pour débloquer tous les utilisateurs bloqués
 *
 * Usage:
 *   npm run unblock-users
 *   ou
 *   npx tsx scripts/unblock-all-users.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function unblockAllUsers() {
  try {
    console.log('🔍 Recherche des utilisateurs bloqués...\n');

    // Récupérer tous les utilisateurs bloqués
    const blockedUsers = await prisma.user.findMany({
      where: {
        isActive: false,
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
      },
    });

    if (blockedUsers.length === 0) {
      console.log('✅ Aucun utilisateur bloqué trouvé.\n');
      return;
    }

    console.log(`⚠️  ${blockedUsers.length} utilisateur(s) bloqué(s) trouvé(s):\n`);
    blockedUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.prenom} ${user.nom} (${user.email}) - ${user.role}`);
    });

    console.log('\n🔓 Déblocage en cours...\n');

    // Débloquer tous les utilisateurs
    const result = await prisma.user.updateMany({
      where: {
        isActive: false,
      },
      data: {
        isActive: true,
      },
    });

    console.log(`✅ ${result.count} utilisateur(s) débloqué(s) avec succès!\n`);

    // Afficher le statut final
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        isActive: true,
      },
      orderBy: {
        role: 'asc',
      },
    });

    console.log('=== 📋 Statut final de tous les utilisateurs ===\n');
    allUsers.forEach((user, index) => {
      const status = user.isActive ? '✅ ACTIF' : '❌ BLOQUÉ';
      console.log(`   ${index + 1}. ${user.prenom} ${user.nom} (${user.role}) - ${status}`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
unblockAllUsers();
