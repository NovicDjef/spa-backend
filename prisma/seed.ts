import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...\n');

  // ============================================
  // CRÉER LES UTILISATEURS (EMPLOYÉS)
  // ============================================

  // 1. Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@spa.com' },
    update: {},
    create: {
      email: 'admin@spa.com',
      telephone: '5141111111',
      password: adminPassword,
      role: 'ADMIN',
      nom: 'Admin',
      prenom: 'Principal',
    },
  });
  console.log('✅ Admin créé:', admin.email);

  // 2. Secrétaire
  const secretairePassword = await bcrypt.hash('secretaire123', 10);
  const secretaire = await prisma.user.upsert({
    where: { email: 'secretaire@spa.com' },
    update: {},
    create: {
      email: 'secretaire@spa.com',
      telephone: '5142222222',
      password: secretairePassword,
      role: 'SECRETAIRE',
      nom: 'Dubois',
      prenom: 'Marie',
    },
  });
  console.log('✅ Secrétaire créée:', secretaire.email);

  // 3. Massothérapeute 1
  const masso1Password = await bcrypt.hash('masso123', 10);
  const massotherapeute1 = await prisma.user.upsert({
    where: { email: 'masso1@spa.com' },
    update: {},
    create: {
      email: 'masso1@spa.com',
      telephone: '5143333333',
      password: masso1Password,
      role: 'MASSOTHERAPEUTE',
      nom: 'Martin',
      prenom: 'Sophie',
    },
  });
  console.log('✅ Massothérapeute 1 créé:', massotherapeute1.email);

  // 4. Massothérapeute 2
  const masso2Password = await bcrypt.hash('masso123', 10);
  const massotherapeute2 = await prisma.user.upsert({
    where: { email: 'masso2@spa.com' },
    update: {},
    create: {
      email: 'masso2@spa.com',
      telephone: '5143333334',
      password: masso2Password,
      role: 'MASSOTHERAPEUTE',
      nom: 'Leblanc',
      prenom: 'Pierre',
    },
  });
  console.log('✅ Massothérapeute 2 créé:', massotherapeute2.email);

  // 5. Esthéticienne 1
  const estheticienne1Password = await bcrypt.hash('esthetique123', 10);
  const estheticienne1 = await prisma.user.upsert({
    where: { email: 'esthetique1@spa.com' },
    update: {},
    create: {
      email: 'esthetique1@spa.com',
      telephone: '5144444444',
      password: estheticienne1Password,
      role: 'ESTHETICIENNE',
      nom: 'Tremblay',
      prenom: 'Julie',
    },
  });
  console.log('✅ Esthéticienne 1 créée:', estheticienne1.email);

  // 6. Esthéticienne 2
  const estheticienne2Password = await bcrypt.hash('esthetique123', 10);
  const estheticienne2 = await prisma.user.upsert({
    where: { email: 'esthetique2@spa.com' },
    update: {},
    create: {
      email: 'esthetique2@spa.com',
      telephone: '5144444445',
      password: estheticienne2Password,
      role: 'ESTHETICIENNE',
      nom: 'Gagnon',
      prenom: 'Isabelle',
    },
  });
  console.log('✅ Esthéticienne 2 créée:', estheticienne2.email);

  console.log('\n');

  // ============================================
  // CRÉER DES CLIENTS EXEMPLE
  // ============================================

  // Client 1 - Massothérapie
  const client1 = await prisma.clientProfile.upsert({
    where: { courriel: 'jean.dupont@example.com' },
    update: {},
    create: {
      nom: 'Dupont',
      prenom: 'Jean',
      adresse: '123 Rue Example',
      ville: 'Montréal',
      codePostal: 'H1H 1H1',
      telCellulaire: '5145555555',
      courriel: 'jean.dupont@example.com',
      dateNaissance: new Date('1985-05-15'),
      gender: 'HOMME',
      serviceType: 'MASSOTHERAPIE',
      assuranceCouvert: true,
      raisonConsultation: 'Douleurs au dos et aux épaules',
      zonesDouleur: ['dos-bas', 'epaule-droite', 'epaule-gauche'],
      mauxDeDos: true,
      douleurMusculaire: true,
      stresse: true,
    },
  });
  console.log('✅ Client 1 (Massothérapie) créé:', client1.courriel);

  // Client 2 - Massothérapie
  const client2 = await prisma.clientProfile.upsert({
    where: { courriel: 'marie.laflamme@example.com' },
    update: {},
    create: {
      nom: 'Laflamme',
      prenom: 'Marie',
      adresse: '456 Avenue des Érables',
      ville: 'Laval',
      codePostal: 'H7L 2K3',
      telCellulaire: '5145555556',
      courriel: 'marie.laflamme@example.com',
      dateNaissance: new Date('1990-08-22'),
      gender: 'FEMME',
      serviceType: 'MASSOTHERAPIE',
      assuranceCouvert: false,
      raisonConsultation: 'Migraines et tensions cervicales',
      zonesDouleur: ['cou', 'tete'],
      migraine: true,
      mauxDeTete: true,
      stresse: true,
      insomnie: true,
    },
  });
  console.log('✅ Client 2 (Massothérapie) créé:', client2.courriel);

  // Client 3 - Esthétique
  const client3 = await prisma.clientProfile.upsert({
    where: { courriel: 'sophie.beaulieu@example.com' },
    update: {},
    create: {
      nom: 'Beaulieu',
      prenom: 'Sophie',
      adresse: '789 Boulevard Saint-Laurent',
      ville: 'Montréal',
      codePostal: 'H2X 1Y5',
      telCellulaire: '5145555557',
      courriel: 'sophie.beaulieu@example.com',
      dateNaissance: new Date('1988-03-10'),
      gender: 'FEMME',
      serviceType: 'ESTHETIQUE',
      assuranceCouvert: false,
      etatPeau: 'Mixte avec zone T grasse',
      etatPores: 'Dilatés au niveau du nez',
      fumeur: 'Non',
      niveauStress: 'Modéré',
      expositionSoleil: 'Occasionnelle',
      protectionSolaire: 'Toujours',
      suffisanceEau: 'Oui',
    },
  });
  console.log('✅ Client 3 (Esthétique) créé:', client3.courriel);

  // Client 4 - Esthétique
  const client4 = await prisma.clientProfile.upsert({
    where: { courriel: 'claudia.roy@example.com' },
    update: {},
    create: {
      nom: 'Roy',
      prenom: 'Claudia',
      adresse: '321 Rue Notre-Dame',
      ville: 'Québec',
      codePostal: 'G1K 4E9',
      telCellulaire: '5145555558',
      courriel: 'claudia.roy@example.com',
      dateNaissance: new Date('1995-11-30'),
      gender: 'FEMME',
      serviceType: 'ESTHETIQUE',
      assuranceCouvert: false,
      etatPeau: 'Sèche et sensible',
      etatPores: 'Peu visibles',
      fumeur: 'Non',
      niveauStress: 'Élevé',
      expositionSoleil: 'Rare',
      protectionSolaire: 'Parfois',
      suffisanceEau: 'Non',
    },
  });
  console.log('✅ Client 4 (Esthétique) créé:', client4.courriel);

  console.log('\n');

  // ============================================
  // CRÉER DES ASSIGNATIONS
  // ============================================

  // Assigner client1 (massothérapie) au massothérapeute1
  await prisma.assignment.upsert({
    where: {
      clientId_professionalId: {
        clientId: client1.id,
        professionalId: massotherapeute1.id,
      },
    },
    update: {},
    create: {
      clientId: client1.id,
      professionalId: massotherapeute1.id,
    },
  });
  console.log('✅ Client 1 assigné au massothérapeute 1');

  // Assigner client2 (massothérapie) aux deux massothérapeutes
  await prisma.assignment.upsert({
    where: {
      clientId_professionalId: {
        clientId: client2.id,
        professionalId: massotherapeute1.id,
      },
    },
    update: {},
    create: {
      clientId: client2.id,
      professionalId: massotherapeute1.id,
    },
  });
  console.log('✅ Client 2 assigné au massothérapeute 1');

  await prisma.assignment.upsert({
    where: {
      clientId_professionalId: {
        clientId: client2.id,
        professionalId: massotherapeute2.id,
      },
    },
    update: {},
    create: {
      clientId: client2.id,
      professionalId: massotherapeute2.id,
    },
  });
  console.log('✅ Client 2 assigné au massothérapeute 2');

  // Assigner client3 (esthétique) à l'esthéticienne1
  await prisma.assignment.upsert({
    where: {
      clientId_professionalId: {
        clientId: client3.id,
        professionalId: estheticienne1.id,
      },
    },
    update: {},
    create: {
      clientId: client3.id,
      professionalId: estheticienne1.id,
    },
  });
  console.log('✅ Client 3 assigné à l\'esthéticienne 1');

  // Assigner client4 (esthétique) à l'esthéticienne2
  await prisma.assignment.upsert({
    where: {
      clientId_professionalId: {
        clientId: client4.id,
        professionalId: estheticienne2.id,
      },
    },
    update: {},
    create: {
      clientId: client4.id,
      professionalId: estheticienne2.id,
    },
  });
  console.log('✅ Client 4 assigné à l\'esthéticienne 2');

  console.log('\n');

  // ============================================
  // CRÉER DES NOTES EXEMPLE
  // ============================================

  // Note du massothérapeute 1 pour client1
  await prisma.note.create({
    data: {
      content:
        'Premier traitement effectué. Le client a bien répondu aux manipulations au niveau du dos. Tensions importantes au niveau des trapèzes. Recommandé: 2 séances par semaine pendant 3 semaines.',
      clientId: client1.id,
      authorId: massotherapeute1.id,
    },
  });
  console.log('✅ Note créée pour client 1');

  // Note du massothérapeute 1 pour client2
  await prisma.note.create({
    data: {
      content:
        'Séance de massage relaxant pour soulager les migraines. Travail sur les cervicales et le cuir chevelu. La cliente rapporte une diminution de la douleur après le traitement.',
      clientId: client2.id,
      authorId: massotherapeute1.id,
    },
  });
  console.log('✅ Note créée pour client 2 par massothérapeute 1');

  // Note du massothérapeute 2 pour client2
  await prisma.note.create({
    data: {
      content:
        'Deuxième séance. Continuité du traitement pour les migraines. Bon progrès observé. La cliente dort mieux depuis la dernière séance.',
      clientId: client2.id,
      authorId: massotherapeute2.id,
    },
  });
  console.log('✅ Note créée pour client 2 par massothérapeute 2');

  // Note de l'esthéticienne 1 pour client3
  await prisma.note.create({
    data: {
      content:
        'Soin du visage pour peau mixte. Nettoyage en profondeur et extraction des comédons. Application d\'un masque purifiant. La cliente a apprécié le traitement.',
      clientId: client3.id,
      authorId: estheticienne1.id,
    },
  });
  console.log('✅ Note créée pour client 3');

  console.log('\n🎉 Seeding terminé avec succès !\n');

  // Afficher les informations de connexion
  console.log('═══════════════════════════════════════════════════════');
  console.log('📋 COMPTES DE TEST CRÉÉS');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('👨‍💼 ADMIN');
  console.log('   Email: admin@spa.com');
  console.log('   Mot de passe: admin123\n');

  console.log('👩‍💼 SECRÉTAIRE');
  console.log('   Email: secretaire@spa.com');
  console.log('   Mot de passe: secretaire123\n');

  console.log('💆 MASSOTHÉRAPEUTE 1');
  console.log('   Email: masso1@spa.com');
  console.log('   Mot de passe: masso123');
  console.log('   Clients assignés: 2\n');

  console.log('💆 MASSOTHÉRAPEUTE 2');
  console.log('   Email: masso2@spa.com');
  console.log('   Mot de passe: masso123');
  console.log('   Clients assignés: 1\n');

  console.log('💅 ESTHÉTICIENNE 1');
  console.log('   Email: esthetique1@spa.com');
  console.log('   Mot de passe: esthetique123');
  console.log('   Clients assignés: 1\n');

  console.log('💅 ESTHÉTICIENNE 2');
  console.log('   Email: esthetique2@spa.com');
  console.log('   Mot de passe: esthetique123');
  console.log('   Clients assignés: 1\n');

  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
