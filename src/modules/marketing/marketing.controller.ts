import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../auth/auth';
import { sendMarketingEmail } from '../../lib/email';

/**
 * @desc    Récupérer les contacts clients avec filtres avancés
 * @route   GET /api/marketing/contacts
 * @access  Privé (ADMIN uniquement)
 */
export const getContacts = async (req: AuthRequest, res: Response) => {
  const {
    serviceType,
    lastVisitMonths,
    lastVisitYears,
    gender,
    search
  } = req.query;

  let where: any = {};

  // Filtre par type de service
  if (serviceType && (serviceType === 'MASSOTHERAPIE' || serviceType === 'ESTHETIQUE')) {
    where.serviceType = serviceType;
  }

  // Filtre par genre
  if (gender && ['HOMME', 'FEMME', 'AUTRE'].includes(gender as string)) {
    where.gender = gender;
  }

  // Recherche
  if (search) {
    where.OR = [
      { nom: { contains: search as string, mode: 'insensitive' } },
      { prenom: { contains: search as string, mode: 'insensitive' } },
      { courriel: { contains: search as string, mode: 'insensitive' } },
      { telCellulaire: { contains: search as string } },
    ];
  }

  // Récupérer les clients avec leurs dernières notes
  const clients = await prisma.clientProfile.findMany({
    where,
    select: {
      id: true,
      nom: true,
      prenom: true,
      courriel: true,
      telCellulaire: true,
      telMaison: true,
      telBureau: true,
      serviceType: true,
      gender: true,
      createdAt: true,
      notes: {
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      nom: 'asc',
    },
  });

  // Filtrer par date de dernière visite (basé sur la dernière note)
  let filteredClients = clients;

  if (lastVisitMonths) {
    const months = parseInt(lastVisitMonths as string);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    filteredClients = clients.filter(client => {
      if (client.notes.length === 0) {
        // Client n'a jamais eu de note (jamais de visite)
        return true;
      }
      const lastVisitDate = new Date(client.notes[0].createdAt);
      return lastVisitDate < cutoffDate;
    });
  }

  if (lastVisitYears) {
    const years = parseInt(lastVisitYears as string);
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - years);

    filteredClients = clients.filter(client => {
      if (client.notes.length === 0) {
        return true;
      }
      const lastVisitDate = new Date(client.notes[0].createdAt);
      return lastVisitDate < cutoffDate;
    });
  }

  // Formater les résultats
  const contacts = filteredClients.map(client => ({
    id: client.id,
    nom: client.nom,
    prenom: client.prenom,
    nomComplet: `${client.prenom} ${client.nom}`,
    courriel: client.courriel,
    telCellulaire: client.telCellulaire,
    telMaison: client.telMaison,
    telBureau: client.telBureau,
    serviceType: client.serviceType,
    gender: client.gender,
    dateInscription: client.createdAt,
    derniereVisite: client.notes.length > 0 ? client.notes[0].createdAt : null,
    joursSansVisite: client.notes.length > 0
      ? Math.floor((Date.now() - new Date(client.notes[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : null,
  }));

  res.status(200).json({
    success: true,
    data: {
      contacts,
      total: contacts.length,
      filters: {
        serviceType: serviceType || 'tous',
        lastVisitMonths: lastVisitMonths || 'tous',
        lastVisitYears: lastVisitYears || 'tous',
        gender: gender || 'tous',
      },
    },
  });
};

/**
 * @desc    Exporter les contacts en CSV
 * @route   GET /api/marketing/contacts/export
 * @access  Privé (ADMIN uniquement)
 */
export const exportContacts = async (req: AuthRequest, res: Response) => {
  const { serviceType } = req.query;

  let where: any = {};

  if (serviceType && (serviceType === 'MASSOTHERAPIE' || serviceType === 'ESTHETIQUE')) {
    where.serviceType = serviceType;
  }

  const clients = await prisma.clientProfile.findMany({
    where,
    select: {
      nom: true,
      prenom: true,
      courriel: true,
      telCellulaire: true,
      telMaison: true,
      telBureau: true,
      serviceType: true,
      gender: true,
      ville: true,
      createdAt: true,
      notes: {
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      nom: 'asc',
    },
  });

  // Générer le CSV
  const csvHeaders = 'Nom,Prénom,Email,Téléphone Cellulaire,Téléphone Maison,Téléphone Bureau,Service,Genre,Ville,Date Inscription,Dernière Visite\n';

  const csvRows = clients.map(client => {
    const derniereVisite = client.notes.length > 0
      ? new Date(client.notes[0].createdAt).toISOString().split('T')[0]
      : 'Jamais';

    return [
      client.nom,
      client.prenom,
      client.courriel,
      client.telCellulaire,
      client.telMaison || '',
      client.telBureau || '',
      client.serviceType,
      client.gender,
      client.ville,
      new Date(client.createdAt).toISOString().split('T')[0],
      derniereVisite,
    ].join(',');
  }).join('\n');

  const csv = csvHeaders + csvRows;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=contacts-clients.csv');
  res.status(200).send(csv);
};

/**
 * @desc    Envoyer un email à un client spécifique
 * @route   POST /api/marketing/send-email/individual
 * @access  Privé (ADMIN uniquement)
 */
const sendIndividualEmailSchema = z.object({
  clientId: z.string().min(1, 'L\'ID du client est requis'),
  subject: z.string().min(1, 'Le sujet est requis'),
  message: z.string().min(1, 'Le message est requis'),
});

export const sendIndividualEmail = async (req: AuthRequest, res: Response) => {
  const validatedData = sendIndividualEmailSchema.parse(req.body);

  // Vérifier que le client existe
  const client = await prisma.clientProfile.findUnique({
    where: { id: validatedData.clientId },
    select: {
      id: true,
      nom: true,
      prenom: true,
      courriel: true,
    },
  });

  if (!client) {
    throw new AppError('Client non trouvé', 404);
  }

  // Envoyer l'email
  try {
    await sendMarketingEmail(
      client.courriel,
      client.prenom,
      validatedData.subject,
      validatedData.message
    );

    res.status(200).json({
      success: true,
      message: `Email envoyé avec succès à ${client.prenom} ${client.nom}`,
      data: {
        recipient: {
          nom: client.nom,
          prenom: client.prenom,
          email: client.courriel,
        },
      },
    });
  } catch (error) {
    throw new AppError('Erreur lors de l\'envoi de l\'email', 500);
  }
};

/**
 * @desc    Envoyer un email en masse (campagne)
 * @route   POST /api/marketing/send-email/campaign
 * @access  Privé (ADMIN uniquement)
 */
const sendCampaignEmailSchema = z.object({
  clientIds: z.array(z.string()).min(1, 'Au moins un client doit être sélectionné'),
  subject: z.string().min(1, 'Le sujet est requis'),
  message: z.string().min(1, 'Le message est requis'),
});

export const sendCampaignEmail = async (req: AuthRequest, res: Response) => {
  const validatedData = sendCampaignEmailSchema.parse(req.body);

  // Récupérer les clients
  const clients = await prisma.clientProfile.findMany({
    where: {
      id: {
        in: validatedData.clientIds,
      },
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      courriel: true,
    },
  });

  if (clients.length === 0) {
    throw new AppError('Aucun client trouvé', 404);
  }

  // Envoyer les emails (en parallèle pour optimiser)
  const emailPromises = clients.map(client =>
    sendMarketingEmail(
      client.courriel,
      client.prenom,
      validatedData.subject,
      validatedData.message
    ).catch(error => ({
      error: true,
      client: client.courriel,
      message: error.message,
    }))
  );

  const results = await Promise.all(emailPromises);

  // Compter les succès et échecs
  const failures = results.filter((r: any) => r?.error);
  const successes = results.length - failures.length;

  res.status(200).json({
    success: true,
    message: `Campagne envoyée: ${successes} réussis, ${failures.length} échecs`,
    data: {
      totalSent: successes,
      totalFailed: failures.length,
      totalClients: clients.length,
      failures: failures.length > 0 ? failures : undefined,
    },
  });
};

/**
 * @desc    Obtenir des statistiques pour les campagnes
 * @route   GET /api/marketing/stats
 * @access  Privé (ADMIN uniquement)
 */
export const getMarketingStats = async (req: AuthRequest, res: Response) => {
  // Total de clients
  const totalClients = await prisma.clientProfile.count();

  // Par type de service
  const clientsByService = await prisma.clientProfile.groupBy({
    by: ['serviceType'],
    _count: true,
  });

  // Par genre
  const clientsByGender = await prisma.clientProfile.groupBy({
    by: ['gender'],
    _count: true,
  });

  // Clients sans visite récente (plus de 3 mois)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const allClients = await prisma.clientProfile.findMany({
    select: {
      id: true,
      notes: {
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  const inactiveClients = allClients.filter(client => {
    if (client.notes.length === 0) return true;
    return new Date(client.notes[0].createdAt) < threeMonthsAgo;
  });

  // Nouveaux clients (moins de 30 jours)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newClients = await prisma.clientProfile.count({
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
  });

  res.status(200).json({
    success: true,
    data: {
      totalClients,
      newClientsLast30Days: newClients,
      inactiveClients3Months: inactiveClients.length,
      clientsByService: clientsByService.reduce((acc: any, item) => {
        acc[item.serviceType] = item._count;
        return acc;
      }, {}),
      clientsByGender: clientsByGender.reduce((acc: any, item) => {
        acc[item.gender] = item._count;
        return acc;
      }, {}),
    },
  });
};
