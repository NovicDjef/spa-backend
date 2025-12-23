import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed - Spa Renaissance...');

  // ============================================
  // 1. CATÉGORIES DE SERVICES
  // ============================================
  console.log('📂 Création des catégories...');

  const medicoEsthetiqueCategory = await prisma.serviceCategory.upsert({
    where: { name: 'MEDICO_ESTHETIQUE' },
    update: {},
    create: {
      name: 'MEDICO_ESTHETIQUE',
      description: 'Médico-Esthétique - Soins avancés pour le visage et le corps',
      displayOrder: 1,
      isActive: true,
    },
  });

  const esthetiqueCategory = await prisma.serviceCategory.upsert({
    where: { name: 'ESTHETIQUE' },
    update: {},
    create: {
      name: 'ESTHETIQUE',
      description: 'Esthétique - Soins de beauté et bien-être',
      displayOrder: 2,
      isActive: true,
    },
  });

  const detenteBienEtreCategory = await prisma.serviceCategory.upsert({
    where: { name: 'DETENTE_BIEN_ETRE' },
    update: {},
    create: {
      name: 'DETENTE_BIEN_ETRE',
      description: 'Détente/Bien-être - Massages et relaxation',
      displayOrder: 3,
      isActive: true,
    },
  });

  const soinsJambesFormeCategory = await prisma.serviceCategory.upsert({
    where: { name: 'SOINS_JAMBES_FORME' },
    update: {},
    create: {
      name: 'SOINS_JAMBES_FORME',
      description: 'Soins/Jambes et forme - Fitness et santé',
      displayOrder: 4,
      isActive: true,
    },
  });

  console.log('✅ Catégories créées');

  // ============================================
  // 2. SERVICES MÉDICO-ESTHÉTIQUE
  // ============================================
  console.log('💉 Création des services médico-esthétiques...');

  const medicoServices = [
    {
      name: 'Endermologie Visage',
      slug: 'endermologie-visage',
      description: 'Traitement par endermologie pour rajeunir et tonifier le visage',
      duration: 45,
      price: 95.00,
      categoryId: medicoEsthetiqueCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Endermologie Corps',
      slug: 'endermologie-corps',
      description: 'Traitement anti-cellulite et raffermissant pour le corps',
      duration: 60,
      price: 120.00,
      categoryId: medicoEsthetiqueCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Radiofréquence Visage',
      slug: 'radiofrequence-visage',
      description: 'Lifting non invasif par radiofréquence pour le visage',
      duration: 45,
      price: 110.00,
      categoryId: medicoEsthetiqueCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Radiofréquence Corps',
      slug: 'radiofrequence-corps',
      description: 'Raffermissement et remodelage corporel par radiofréquence',
      duration: 60,
      price: 135.00,
      categoryId: medicoEsthetiqueCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'IPL (Lumière Pulsée Intense)',
      slug: 'ipl-lumiere-pulsee',
      description: 'Traitement photorajeunissement et épilation permanente',
      duration: 30,
      price: 150.00,
      categoryId: medicoEsthetiqueCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Oxygénothérapie',
      slug: 'oxygenotherapie',
      description: 'Soin oxygénant pour revitaliser la peau',
      duration: 45,
      price: 95.00,
      categoryId: medicoEsthetiqueCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Électrocoagulation',
      slug: 'electrocoagulation',
      description: 'Traitement des imperfections cutanées par électrocoagulation',
      duration: 30,
      price: 80.00,
      categoryId: medicoEsthetiqueCategory.id,
      requiresProfessional: true,
    },
  ];

  for (const service of medicoServices) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: { ...service, isActive: true },
    });
  }

  console.log('✅ Services médico-esthétiques créés');

  // ============================================
  // 3. SERVICES ESTHÉTIQUE
  // ============================================
  console.log('💅 Création des services esthétiques...');

  const esthetiqueServices = [
    {
      name: 'Épilation Visage',
      slug: 'epilation-visage',
      description: 'Épilation complète ou partielle du visage',
      duration: 30,
      price: 35.00,
      categoryId: esthetiqueCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Épilation Jambes Complètes',
      slug: 'epilation-jambes-completes',
      description: 'Épilation des jambes au complet',
      duration: 45,
      price: 55.00,
      categoryId: esthetiqueCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Épilation Maillot',
      slug: 'epilation-maillot',
      description: 'Épilation zone maillot (classique ou intégral)',
      duration: 30,
      price: 45.00,
      categoryId: esthetiqueCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Soin Visage Complet',
      slug: 'soin-visage-complet',
      description: 'Soin du visage personnalisé avec nettoyage, exfoliation et masque',
      duration: 60,
      price: 95.00,
      categoryId: esthetiqueCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Soin Visage Express',
      slug: 'soin-visage-express',
      description: 'Soin rapide pour rafraîchir et hydrater',
      duration: 30,
      price: 55.00,
      categoryId: esthetiqueCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Pédicure Spa',
      slug: 'pedicure-spa',
      description: 'Soin complet des pieds avec exfoliation et massage',
      duration: 60,
      price: 65.00,
      categoryId: esthetiqueCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Manucure Spa',
      slug: 'manucure-spa',
      description: 'Soin des mains avec exfoliation et massage',
      duration: 45,
      price: 45.00,
      categoryId: esthetiqueCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Pédicure/Manucure Combo',
      slug: 'pedicure-manucure-combo',
      description: 'Soin complet des mains et des pieds',
      duration: 90,
      price: 95.00,
      categoryId: esthetiqueCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Coiffure Femme',
      slug: 'coiffure-femme',
      description: 'Coupe et brushing professionnel',
      duration: 60,
      price: 55.00,
      categoryId: esthetiqueCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Coloration',
      slug: 'coloration',
      description: 'Coloration capillaire complète ou mèches',
      duration: 90,
      price: 85.00,
      categoryId: esthetiqueCategory.id,
      requiresProfessional: true,
    },
  ];

  for (const service of esthetiqueServices) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: { ...service, isActive: true },
    });
  }

  console.log('✅ Services esthétiques créés');

  // ============================================
  // 4. SERVICES DÉTENTE/BIEN-ÊTRE
  // ============================================
  console.log('🧘 Création des services détente/bien-être...');

  const detenteServices = [
    {
      name: 'Pressothérapie',
      slug: 'pressotherapie',
      description: 'Drainage lymphatique par compression pneumatique',
      duration: 45,
      price: 75.00,
      categoryId: detenteBienEtreCategory.id,
      requiresProfessional: false,
    },
    {
      name: 'Massage Suédois 60 min',
      slug: 'massage-suedois-60',
      description: 'Massage relaxant traditionnel suédois',
      duration: 60,
      price: 105.00,
      categoryId: detenteBienEtreCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Massage Suédois 90 min',
      slug: 'massage-suedois-90',
      description: 'Massage relaxant suédois prolongé',
      duration: 90,
      price: 145.00,
      categoryId: detenteBienEtreCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Massage Thérapeutique 60 min',
      slug: 'massage-therapeutique-60',
      description: 'Massage ciblé pour soulager les tensions musculaires',
      duration: 60,
      price: 115.00,
      categoryId: detenteBienEtreCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Massage Thérapeutique 90 min',
      slug: 'massage-therapeutique-90',
      description: 'Massage thérapeutique complet pour un soulagement profond',
      duration: 90,
      price: 155.00,
      categoryId: detenteBienEtreCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Massage Pierres Chaudes',
      slug: 'massage-pierres-chaudes',
      description: 'Massage aux pierres chaudes pour une détente profonde',
      duration: 75,
      price: 135.00,
      categoryId: detenteBienEtreCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Hydromassage',
      slug: 'hydromassage',
      description: 'Massage par jets d\'eau dans un bain thermal',
      duration: 30,
      price: 55.00,
      categoryId: detenteBienEtreCategory.id,
      requiresProfessional: false,
    },
    {
      name: 'Soin Kobido (Massage Japonais)',
      slug: 'soin-kobido',
      description: 'Massage facial japonais anti-âge',
      duration: 60,
      price: 125.00,
      categoryId: detenteBienEtreCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Exfoliation Visage',
      slug: 'exfoliation-visage',
      description: 'Gommage profond pour une peau lumineuse',
      duration: 30,
      price: 45.00,
      categoryId: detenteBienEtreCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Ostéopathie',
      slug: 'osteopathie',
      description: 'Traitement ostéopathique pour rééquilibrer le corps',
      duration: 60,
      price: 125.00,
      categoryId: detenteBienEtreCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Acupuncture',
      slug: 'acupuncture',
      description: 'Séance d\'acupuncture traditionnelle chinoise',
      duration: 60,
      price: 110.00,
      categoryId: detenteBienEtreCategory.id,
      requiresProfessional: true,
    },
  ];

  for (const service of detenteServices) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: { ...service, isActive: true },
    });
  }

  console.log('✅ Services détente/bien-être créés');

  // ============================================
  // 5. SERVICES SOINS/JAMBES ET FORME
  // ============================================
  console.log('🏋️ Création des services soins/jambes et forme...');

  const formeServices = [
    {
      name: 'Séance de Yoga',
      slug: 'seance-yoga',
      description: 'Cours de yoga pour le corps et l\'esprit',
      duration: 60,
      price: 25.00,
      categoryId: soinsJambesFormeCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Aérobique',
      slug: 'aerobique',
      description: 'Cours d\'aérobique dynamique',
      duration: 60,
      price: 20.00,
      categoryId: soinsJambesFormeCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Entraînement Personnalisé',
      slug: 'entrainement-personnalise',
      description: 'Session d\'entraînement avec coach personnel',
      duration: 60,
      price: 75.00,
      categoryId: soinsJambesFormeCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Soins Diététiques - Consultation',
      slug: 'soins-dietetiques-consultation',
      description: 'Consultation avec nutritionniste',
      duration: 60,
      price: 95.00,
      categoryId: soinsJambesFormeCategory.id,
      requiresProfessional: true,
    },
    {
      name: 'Consultation Médicale',
      slug: 'consultation-medicale',
      description: 'Consultation médicale pour tous',
      duration: 30,
      price: 85.00,
      categoryId: soinsJambesFormeCategory.id,
      requiresProfessional: true,
    },
  ];

  for (const service of formeServices) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: { ...service, isActive: true },
    });
  }

  console.log('✅ Services soins/jambes et forme créés');

  // ============================================
  // 6. FORFAITS/PACKAGES
  // ============================================
  console.log('📦 Création des forfaits...');

  // Package 1: Détente Complète
  const detenteCompletePackage = await prisma.package.upsert({
    where: { slug: 'forfait-detente-complete' },
    update: {},
    create: {
      name: 'Forfait Détente Complète',
      slug: 'forfait-detente-complete',
      description: 'Journée de détente avec massage, soin visage et accès thermal',
      variant: 'Journée',
      price: 245.00,
      isActive: true,
    },
  });

  // Package 2: Beauté & Bien-être
  const beauteEtrePackage = await prisma.package.upsert({
    where: { slug: 'forfait-beaute-bien-etre' },
    update: {},
    create: {
      name: 'Forfait Beauté & Bien-être',
      slug: 'forfait-beaute-bien-etre',
      description: 'Soin visage, manucure/pédicure et massage relaxant',
      variant: 'Premium',
      price: 285.00,
      isActive: true,
    },
  });

  // Package 3: Médico-Esthétique Complet
  const medicoCompletPackage = await prisma.package.upsert({
    where: { slug: 'forfait-medico-esthetique' },
    update: {},
    create: {
      name: 'Forfait Médico-Esthétique',
      slug: 'forfait-medico-esthetique',
      description: 'Programme de 3 séances: Radiofréquence + Endermologie + IPL',
      variant: '3 séances',
      price: 375.00,
      isActive: true,
    },
  });

  console.log('✅ Forfaits créés');

  // ============================================
  // 7. ABONNEMENTS GYM
  // ============================================
  console.log('🏋️ Création des abonnements gym...');

  const gymMemberships = [
    {
      type: '1_DAY',
      name: 'Accès Gym 1 Jour',
      price: 15.00,
      duration: 1,
      description: 'Accès au gym et installations pour 1 journée',
      displayOrder: 1,
    },
    {
      type: '1_WEEK',
      name: 'Abonnement Gym 1 Semaine',
      price: 45.00,
      duration: 7,
      description: 'Accès illimité au gym pendant 1 semaine',
      displayOrder: 2,
    },
    {
      type: '1_MONTH',
      name: 'Abonnement Gym 1 Mois',
      price: 65.00,
      duration: 30,
      description: 'Accès illimité au gym pendant 1 mois',
      displayOrder: 3,
    },
    {
      type: '3_MONTHS',
      name: 'Abonnement Gym 3 Mois',
      price: 175.00,
      duration: 90,
      description: 'Accès illimité au gym pendant 3 mois',
      displayOrder: 4,
    },
    {
      type: '1_YEAR',
      name: 'Abonnement Gym 1 An',
      price: 550.00,
      duration: 365,
      description: 'Accès illimité au gym pendant 1 an',
      displayOrder: 5,
    },
  ];

  for (const membership of gymMemberships) {
    await prisma.gymMembership.upsert({
      where: { type: membership.type },
      update: membership,
      create: { ...membership, isActive: true },
    });
  }

  console.log('✅ Abonnements gym créés');

  // ============================================
  // 8. UTILISATEURS
  // ============================================
  console.log('👤 Création des utilisateurs...');

  // Admin
  const hashedPasswordAdmin = await bcrypt.hash('Admin@2024', 10);
  await prisma.user.upsert({
    where: { email: 'admin@sparenaissance.com' },
    update: {},
    create: {
      email: 'admin@sparenaissance.com',
      password: hashedPasswordAdmin,
      nom: 'Admin',
      prenom: 'Spa Renaissance',
      role: 'ADMIN',
      telephone: '819-646-0606',
      isActive: true,
    },
  });

  // Secrétaire
  const hashedPasswordSecretaire = await bcrypt.hash('Secretaire@2024', 10);
  await prisma.user.upsert({
    where: { email: 'secretaire@sparenaissance.com' },
    update: {},
    create: {
      email: 'secretaire@sparenaissance.com',
      password: hashedPasswordSecretaire,
      nom: 'Réception',
      prenom: 'Sophie',
      role: 'SECRETAIRE',
      telephone: '819-646-0607',
      isActive: true,
    },
  });

  // Massothérapeutes
  const hashedPasswordMasso1 = await bcrypt.hash('Masso@2024', 10);
  await prisma.user.upsert({
    where: { email: 'marie.dubois@sparenaissance.com' },
    update: {},
    create: {
      email: 'marie.dubois@sparenaissance.com',
      password: hashedPasswordMasso1,
      nom: 'Dubois',
      prenom: 'Marie',
      role: 'MASSOTHERAPEUTE',
      telephone: '819-646-0608',
      isActive: true,
    },
  });

  const hashedPasswordMasso2 = await bcrypt.hash('Masso@2024', 10);
  await prisma.user.upsert({
    where: { email: 'jean.tremblay@sparenaissance.com' },
    update: {},
    create: {
      email: 'jean.tremblay@sparenaissance.com',
      password: hashedPasswordMasso2,
      nom: 'Tremblay',
      prenom: 'Jean',
      role: 'MASSOTHERAPEUTE',
      telephone: '819-646-0609',
      isActive: true,
    },
  });

  // Esthéticiennes
  const hashedPasswordEsthet1 = await bcrypt.hash('Esthet@2024', 10);
  await prisma.user.upsert({
    where: { email: 'sophie.martin@sparenaissance.com' },
    update: {},
    create: {
      email: 'sophie.martin@sparenaissance.com',
      password: hashedPasswordEsthet1,
      nom: 'Martin',
      prenom: 'Sophie',
      role: 'ESTHETICIENNE',
      telephone: '819-646-0610',
      isActive: true,
    },
  });

  const hashedPasswordEsthet2 = await bcrypt.hash('Esthet@2024', 10);
  await prisma.user.upsert({
    where: { email: 'isabelle.gagnon@sparenaissance.com' },
    update: {},
    create: {
      email: 'isabelle.gagnon@sparenaissance.com',
      password: hashedPasswordEsthet2,
      nom: 'Gagnon',
      prenom: 'Isabelle',
      role: 'ESTHETICIENNE',
      telephone: '819-646-0611',
      isActive: true,
    },
  });

  console.log('✅ Utilisateurs créés');

  console.log('\n🎉 Seed terminé avec succès!');
  console.log('\n📊 Résumé:');
  console.log('  - 4 catégories de services');
  console.log('  - 33 services individuels');
  console.log('  - 3 forfaits/packages');
  console.log('  - 5 abonnements gym');
  console.log('  - 6 utilisateurs (1 admin, 1 secrétaire, 2 massothérapeutes, 2 esthéticiennes)');
  console.log('\n📞 Contact: 819-646-0606');
  console.log('📍 Adresse: Spa Renaissance');
  console.log('⏰ Heures: Lun-Sam 9h00-21h00, Dim Fermé');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
