import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Nettoyer la base de données
  await prisma.traitement.deleteMany();
  await prisma.note.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Base de données nettoyée');

  // Créer un massothérapeute
  const hashedPassword1 = await bcrypt.hash('password123', 12);
  const massotherapeute = await prisma.user.create({
    data: {
      email: 'massotherapeute@spa.com',
      telephone: '5141234567',
      password: hashedPassword1,
      role: 'MASSOTHERAPEUTE',
    },
  });
  console.log('✅ Massothérapeute créé:', massotherapeute.email);

  // Créer une esthéticienne
  const hashedPassword2 = await bcrypt.hash('password123', 12);
  const estheticienne = await prisma.user.create({
    data: {
      email: 'estheticienne@spa.com',
      telephone: '5149876543',
      password: hashedPassword2,
      role: 'ESTHETICIENNE',
    },
  });
  console.log('✅ Esthéticienne créée:', estheticienne.email);

  // Créer quelques clients exemples
  const client1User = await prisma.user.create({
    data: {
      email: 'client1@example.com',
      telephone: '5145551234',
      role: 'CLIENT',
    },
  });

  const client1 = await prisma.clientProfile.create({
    data: {
      userId: client1User.id,
      nom: 'Tremblay',
      prenom: 'Marie',
      adresse: '123 rue Principale',
      ville: 'Montréal',
      codePostal: 'H1A 1A1',
      telCellulaire: '5145551234',
      courriel: 'client1@example.com',
      dateNaissance: new Date('1985-06-15'),
      gender: 'FEMME',
      serviceType: 'MASSOTHERAPIE',
      assuranceCouvert: true,
      raideurs: true,
      mauxDeDos: true,
      stresse: true,
    },
  });
  console.log('✅ Client 1 créé:', client1.prenom, client1.nom);

  const client2User = await prisma.user.create({
    data: {
      email: 'client2@example.com',
      telephone: '5145555678',
      role: 'CLIENT',
    },
  });

  const client2 = await prisma.clientProfile.create({
    data: {
      userId: client2User.id,
      nom: 'Gagnon',
      prenom: 'Pierre',
      adresse: '456 avenue du Parc',
      ville: 'Québec',
      codePostal: 'G1R 2B4',
      telCellulaire: '5145555678',
      courriel: 'client2@example.com',
      dateNaissance: new Date('1978-03-22'),
      gender: 'HOMME',
      serviceType: 'MASSOTHERAPIE',
      assuranceCouvert: false,
      arthrose: true,
      hypertension: true,
    },
  });
  console.log('✅ Client 2 créé:', client2.prenom, client2.nom);

  const client3User = await prisma.user.create({
    data: {
      email: 'client3@example.com',
      telephone: '5145559012',
      role: 'CLIENT',
    },
  });

  const client3 = await prisma.clientProfile.create({
    data: {
      userId: client3User.id,
      nom: 'Lavoie',
      prenom: 'Sophie',
      adresse: '789 boulevard Saint-Laurent',
      ville: 'Montréal',
      codePostal: 'H2X 2V8',
      telCellulaire: '5145559012',
      courriel: 'client3@example.com',
      dateNaissance: new Date('1992-11-08'),
      gender: 'FEMME',
      serviceType: 'ESTHETIQUE',
      etatPeau: 'Sèche',
      fumeur: false,
      expositionSoleil: true,
      protectionSolaire: true,
    },
  });
  console.log('✅ Client 3 créé:', client3.prenom, client3.nom);

  // Ajouter des notes
  await prisma.note.create({
    data: {
      content: 'Première séance: Tensions importantes dans le haut du dos. Traitement de 60 minutes effectué.',
      clientId: client1.id,
      createdBy: massotherapeute.id,
    },
  });

  await prisma.note.create({
    data: {
      content: 'Deuxième séance: Amélioration significative. Le client rapporte moins de douleur.',
      clientId: client1.id,
      createdBy: massotherapeute.id,
    },
  });

  await prisma.note.create({
    data: {
      content: 'Consultation initiale: Douleurs chroniques au bas du dos depuis 2 ans.',
      clientId: client2.id,
      createdBy: massotherapeute.id,
    },
  });

  await prisma.note.create({
    data: {
      content: 'Première séance: Soin du visage hydratant. Peau très réactive aux produits.',
      clientId: client3.id,
      createdBy: estheticienne.id,
    },
  });

  console.log('✅ Notes créées');

  // Ajouter des traitements
  await prisma.traitement.create({
    data: {
      date: new Date('2024-12-01'),
      soin: 'Massage suédois',
      remarque: 'Durée: 60 minutes. Focus sur le haut du dos et les épaules.',
      clientId: client1.id,
    },
  });

  await prisma.traitement.create({
    data: {
      date: new Date('2024-12-08'),
      soin: 'Massage thérapeutique',
      remarque: 'Durée: 90 minutes. Traitement complet du dos.',
      clientId: client1.id,
    },
  });

  await prisma.traitement.create({
    data: {
      date: new Date('2024-12-05'),
      soin: 'Massage sportif',
      remarque: 'Durée: 60 minutes. Focus sur le bas du dos.',
      clientId: client2.id,
    },
  });

  await prisma.traitement.create({
    data: {
      date: new Date('2024-12-06'),
      soin: 'Soin hydratant du visage',
      remarque: 'Durée: 75 minutes. Utilisation de produits hypoallergéniques.',
      prescription: 'Crème hydratante La Biosthetique recommandée.',
      clientId: client3.id,
    },
  });

  console.log('✅ Traitements créés');

  console.log(`
  ╔════════════════════════════════════════╗
  ║   🌱 Seeding terminé avec succès!     ║
  ╚════════════════════════════════════════╝
  
  📧 Comptes professionnels créés:
  
  🧘 Massothérapeute:
     Email: massotherapeute@spa.com
     Mot de passe: password123
  
  💆 Esthéticienne:
     Email: estheticienne@spa.com
     Mot de passe: password123
  
  👥 Clients créés: 3
  📝 Notes créées: 4
  💉 Traitements créés: 4
  `);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
