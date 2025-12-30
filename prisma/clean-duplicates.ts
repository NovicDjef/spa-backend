import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDuplicateClients() {
  console.log('🔍 Recherche des doublons...');

  // Trouver tous les numéros de téléphone en double
  const duplicates = await prisma.$queryRaw<{ telCellulaire: string; count: number }[]>`
    SELECT "telCellulaire", COUNT(*) as count
    FROM "ClientProfile"
    GROUP BY "telCellulaire"
    HAVING COUNT(*) > 1
  `;

  console.log(`📊 ${duplicates.length} numéros de téléphone en double trouvés`);

  for (const dup of duplicates) {
    console.log(`\n📱 Traitement du numéro: ${dup.telCellulaire} (${dup.count} entrées)`);

    // Récupérer tous les clients avec ce numéro
    const clients = await prisma.clientProfile.findMany({
      where: { telCellulaire: dup.telCellulaire },
      orderBy: { createdAt: 'desc' },
    });

    // Garder le plus récent, supprimer les autres
    const toKeep = clients[0];
    const toDelete = clients.slice(1);

    console.log(`  ✅ Garder: ${toKeep.prenom} ${toKeep.nom} (ID: ${toKeep.id}, créé le ${toKeep.createdAt})`);

    for (const client of toDelete) {
      console.log(`  ❌ Supprimer: ${client.prenom} ${client.nom} (ID: ${client.id}, créé le ${client.createdAt})`);

      // Supprimer le client (cascade supprimera notes et assignments)
      await prisma.clientProfile.delete({
        where: { id: client.id },
      });
    }
  }

  // Faire de même pour les emails
  console.log('\n🔍 Recherche des emails en double...');

  const emailDuplicates = await prisma.$queryRaw<{ courriel: string; count: number }[]>`
    SELECT "courriel", COUNT(*) as count
    FROM "ClientProfile"
    GROUP BY "courriel"
    HAVING COUNT(*) > 1
  `;

  console.log(`📊 ${emailDuplicates.length} emails en double trouvés`);

  for (const dup of emailDuplicates) {
    console.log(`\n📧 Traitement de l'email: ${dup.courriel} (${dup.count} entrées)`);

    const clients = await prisma.clientProfile.findMany({
      where: { courriel: dup.courriel },
      orderBy: { createdAt: 'desc' },
    });

    const toKeep = clients[0];
    const toDelete = clients.slice(1);

    console.log(`  ✅ Garder: ${toKeep.prenom} ${toKeep.nom} (ID: ${toKeep.id})`);

    for (const client of toDelete) {
      console.log(`  ❌ Supprimer: ${client.prenom} ${client.nom} (ID: ${client.id})`);

      await prisma.clientProfile.delete({
        where: { id: client.id },
      });
    }
  }

  console.log('\n✅ Nettoyage terminé!');
}

cleanDuplicateClients()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
