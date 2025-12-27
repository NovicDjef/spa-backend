import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...');

  // ============================================
  // 1. CATÉGORIES DE SERVICES
  // ============================================
  console.log('📂 Création des catégories...');

  const massotherapieCategory = await prisma.serviceCategory.upsert({
    where: { name: 'MASSOTHERAPIE' },
    update: {},
    create: {
      name: 'MASSOTHERAPIE',
      description: 'Services de massothérapie professionnelle',
      displayOrder: 1,
      isActive: true,
    },
  });

  const esthetiqueCategory = await prisma.serviceCategory.upsert({
    where: { name: 'ESTHETIQUE' },
    update: {},
    create: {
      name: 'ESTHETIQUE',
      description: 'Soins esthétiques et du visage',
      displayOrder: 2,
      isActive: true,
    },
  });

  const thermalCategory = await prisma.serviceCategory.upsert({
    where: { name: 'THERMAL' },
    update: {},
    create: {
      name: 'THERMAL',
      description: 'Accès aux installations thermales',
      displayOrder: 3,
      isActive: true,
    },
  });

  console.log('✅ Catégories créées');

  // ============================================
  // 2. SERVICES DE MASSOTHÉRAPIE
  // ============================================
  console.log('💆 Création des services de massothérapie...');

  const services = [
    {
      name: 'Massage Découverte 50 min',
      slug: 'massage-decouverte-50',
      description: 'Un massage relaxant pour découvrir nos techniques de massothérapie',
      duration: 50,
      price: 103.00,
      categoryId: massotherapieCategory.id,
    },
    {
      name: 'Massage Découverte 80 min',
      slug: 'massage-decouverte-80',
      description: 'Un massage relaxant prolongé pour une détente complète',
      duration: 80,
      price: 133.00,
      categoryId: massotherapieCategory.id,
    },
    {
      name: 'Massage Thérapeutique 50 min',
      slug: 'massage-therapeutique-50',
      description: 'Massage ciblé pour soulager les tensions musculaires',
      duration: 50,
      price: 108.00,
      categoryId: massotherapieCategory.id,
    },
    {
      name: 'Massage Thérapeutique 80 min',
      slug: 'massage-therapeutique-80',
      description: 'Massage thérapeutique complet pour un soulagement profond',
      duration: 80,
      price: 138.00,
      categoryId: massotherapieCategory.id,
    },
    {
      name: 'Massage Dos & Nuque 50 min',
      slug: 'massage-dos-nuque-50',
      description: 'Massage concentré sur le dos et la nuque',
      duration: 50,
      price: 108.00,
      categoryId: massotherapieCategory.id,
    },
    {
      name: 'Massage des Tissus Profonds 50 min',
      slug: 'massage-tissus-profonds-50',
      description: 'Massage en profondeur pour relâcher les tensions chroniques',
      duration: 50,
      price: 128.00,
      categoryId: massotherapieCategory.id,
    },
    {
      name: 'Massage des Tissus Profonds 80 min',
      slug: 'massage-tissus-profonds-80',
      description: 'Massage deep tissue prolongé pour un relâchement complet',
      duration: 80,
      price: 153.00,
      categoryId: massotherapieCategory.id,
    },
    {
      name: 'Massage Sous la Pluie',
      slug: 'massage-sous-la-pluie',
      description: 'Expérience unique de massage sous une pluie thérapeutique',
      duration: 50,
      price: 147.00,
      categoryId: massotherapieCategory.id,
    },
    {
      name: 'Flush Massage',
      slug: 'flush-massage',
      description: 'Massage de drainage pour éliminer les toxines',
      duration: 45,
      price: 90.00,
      categoryId: massotherapieCategory.id,
    },
    {
      name: 'Kinéthérapie 60 min',
      slug: 'kinetherapie-60',
      description: 'Thérapie par le mouvement pour restaurer la mobilité',
      duration: 60,
      price: 110.00,
      categoryId: massotherapieCategory.id,
    },
    {
      name: 'Massage Reiki',
      slug: 'massage-reiki',
      description: 'Massage énergétique pour rééquilibrer le corps et l\'esprit',
      duration: 60,
      price: 110.00,
      categoryId: massotherapieCategory.id,
    },
    {
      name: 'Massage Femme Enceinte 50 min',
      slug: 'massage-femme-enceinte-50',
      description: 'Massage adapté pour les femmes enceintes',
      duration: 50,
      price: 110.00,
      categoryId: massotherapieCategory.id,
    },
    {
      name: 'Massage Femme Enceinte 80 min',
      slug: 'massage-femme-enceinte-80',
      description: 'Massage prolongé spécialement conçu pour les futures mamans',
      duration: 80,
      price: 140.00,
      categoryId: massotherapieCategory.id,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
  }

  console.log('✅ Services de massothérapie créés');

  // ============================================
  // 3. SERVICE THERMAL
  // ============================================
  console.log('🌡️ Création des services thermaux...');

  await prisma.service.upsert({
    where: { slug: 'acces-thermal' },
    update: {},
    create: {
      name: 'Accès Thermal',
      slug: 'acces-thermal',
      description: 'Accès aux installations thermales (bain vapeur, hammam, eucalyptus)',
      duration: 180, // 3 heures
      price: 58.00,
      categoryId: thermalCategory.id,
      requiresProfessional: false,
    },
  });

  console.log('✅ Services thermaux créés');

  // ============================================
  // 4. FORFAITS/PACKAGES
  // ============================================
  console.log('📦 Création des forfaits...');

  // Le forfait Basque
  const forfaitBasquePetite = await prisma.package.upsert({
    where: { slug: 'forfait-basque-petite' },
    update: {},
    create: {
      name: 'Le Forfait Basque',
      slug: 'forfait-basque-petite',
      description: 'Massage sous la pluie, pédicure spa, pressothérapie, neuro spa, accès thermal, endermolift',
      price: 148.00,
      variant: 'Petite',
      isActive: true,
    },
  });

  const forfaitBasqueGrande = await prisma.package.upsert({
    where: { slug: 'forfait-basque-grande' },
    update: {},
    create: {
      name: 'Le Forfait Basque',
      slug: 'forfait-basque-grande',
      description: 'Massage sous la pluie, pédicure spa, pressothérapie, neuro spa, accès thermal, endermolift',
      price: 176.00,
      variant: 'Grande',
      isActive: true,
    },
  });

  // Le forfait Boule
  const forfaitBoulePetite = await prisma.package.upsert({
    where: { slug: 'forfait-boule-petite' },
    update: {},
    create: {
      name: 'Le Forfait Boule',
      slug: 'forfait-boule-petite',
      description: 'Massage découverte 80min, photomodulation, soin du visage de base, accès thermal, carte cadeau 25$ Bistro 7',
      price: 185.00,
      variant: 'Petite Boule',
      isActive: true,
    },
  });

  const forfaitBouleGrosse = await prisma.package.upsert({
    where: { slug: 'forfait-boule-grosse' },
    update: {},
    create: {
      name: 'Le Forfait Boule',
      slug: 'forfait-boule-grosse',
      description: 'Massage découverte 80min, photomodulation, soin du visage de base, accès thermal, carte cadeau 25$ Bistro 7',
      price: 165.00,
      variant: 'Grosse Boule',
      isActive: true,
    },
  });

  // Le forfait Renaissance
  const forfaitRenaissanceGrande = await prisma.package.upsert({
    where: { slug: 'forfait-renaissance-grande' },
    update: {},
    create: {
      name: 'Le Forfait Renaissance',
      slug: 'forfait-renaissance-grande',
      description: 'Massage découverte 80min, accès thermal',
      price: 148.00,
      variant: 'Grande',
      isActive: true,
    },
  });

  const forfaitRenaissanceBasque = await prisma.package.upsert({
    where: { slug: 'forfait-renaissance-basque' },
    update: {},
    create: {
      name: 'Le Forfait Renaissance',
      slug: 'forfait-renaissance-basque',
      description: 'Massage découverte 80min, accès thermal',
      price: 176.00,
      variant: 'Basque',
      isActive: true,
    },
  });

  // Le multi Manouin
  await prisma.package.upsert({
    where: { slug: 'multi-manouin' },
    update: {},
    create: {
      name: 'Le Multi Manouin',
      slug: 'multi-manouin',
      description: 'Choisir 1 parmi: Massage dos nuque, Flush massage, Infrathérapie (45min) + Choisir 1 parmi: Pressothérapie, Neuro Spa, Psio',
      price: 128.00,
      isActive: true,
    },
  });

  // Le multi Carossol
  await prisma.package.upsert({
    where: { slug: 'multi-carossol' },
    update: {},
    create: {
      name: 'Le Multi Carossol',
      slug: 'multi-carossol',
      description: 'Choisir 1 parmi: Massage sous la pluie ou Massage découverte 80min + Pédicure spa, facial de base, accès thermal, carte cadeau Bistro 7 25$',
      price: 198.00,
      isActive: true,
    },
  });

  // Forfait Thermal Plus
  await prisma.package.upsert({
    where: { slug: 'forfait-thermal-plus' },
    update: {},
    create: {
      name: 'Le Forfait Thermal Plus',
      slug: 'forfait-thermal-plus',
      description: '2 accès thermal, carte cadeau 50$ au Bistro 7, 1 nuitée en occupation double',
      price: 169.00,
      isActive: true,
    },
  });

  // Forfait VIP Thermal
  await prisma.package.upsert({
    where: { slug: 'forfait-vip-thermal' },
    update: {},
    create: {
      name: 'Le Forfait VIP Thermal',
      slug: 'forfait-vip-thermal',
      description: '3 mois illimités (du lundi au jeudi)',
      price: 299.00,
      isActive: true,
    },
  });

  console.log('✅ Forfaits créés');

  // ============================================
  // 5. ABONNEMENTS GYM
  // ============================================
  console.log('🏋️ Création des abonnements gym...');

  const gymMemberships = [
    {
      type: '1_DAY',
      name: 'Accès Gym 1 Jour',
      price: 15.00,
      duration: 1,
      description: 'Accès au gym pour 1 journée',
    },
    {
      type: '1_MONTH',
      name: 'Abonnement Gym 1 Mois',
      price: 50.00,
      duration: 30,
      description: 'Accès illimité au gym pendant 1 mois',
    },
    {
      type: '3_MONTHS',
      name: 'Abonnement Gym 3 Mois',
      price: 135.00,
      duration: 90,
      description: 'Accès illimité au gym pendant 3 mois (économie de 10%)',
    },
    {
      type: '6_MONTHS',
      name: 'Abonnement Gym 6 Mois',
      price: 240.00,
      duration: 180,
      description: 'Accès illimité au gym pendant 6 mois (économie de 20%)',
    },
    {
      type: '1_YEAR',
      name: 'Abonnement Gym 1 An',
      price: 420.00,
      duration: 365,
      description: 'Accès illimité au gym pendant 1 an (économie de 30%)',
    },
  ];

  for (const membership of gymMemberships) {
    await prisma.gymMembership.upsert({
      where: { type: membership.type },
      update: {},
      create: membership,
    });
  }

  console.log('✅ Abonnements gym créés');

  // ============================================
  // 6. ADMIN PAR DÉFAUT
  // ============================================
  console.log('👤 Création de l\'admin par défaut...');

  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@spa.com' },
    update: {},
    create: {
      email: 'admin@spa.com',
      telephone: '1234567890',
      password: hashedPassword,
      role: 'ADMIN',
      nom: 'Administrateur',
      prenom: 'Principal',
      isActive: true,
    },
  });

  console.log('✅ Admin créé (email: admin@spa.com, password: Admin@123)');

  console.log('\n🎉 Seed terminé avec succès!');
  console.log('\n📊 Résumé:');
  console.log('- 3 catégories de services');
  console.log('- 14 services individuels');
  console.log('- 9 forfaits');
  console.log('- 5 types d\'abonnements gym');
  console.log('- 1 compte admin\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
