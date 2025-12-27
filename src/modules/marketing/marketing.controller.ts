import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../auth/auth';
import { sendMarketingEmail } from '../../lib/email';
import { generateMarketingMessage, generateEmailSubject, replacePlaceholders } from '../../lib/chatgpt';

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

  // Créer un enregistrement de campagne pour l'email individuel
  const campaign = await prisma.campaign.create({
    data: {
      name: `Email individuel: ${validatedData.subject} → ${client.prenom} ${client.nom}`,
      subject: validatedData.subject,
      messageTemplate: validatedData.message,
      createdBy: req.user!.id,
      totalRecipients: 1,
    },
  });

  console.log(`📧 Envoi d'email individuel à ${client.prenom} ${client.nom}...`);

  // Remplacer les placeholders {prenom} et {nom} dans le message si présents
  const personalizedMessage = replacePlaceholders(
    validatedData.message,
    client.prenom,
    client.nom
  );

  // Envoyer l'email
  try {
    await sendMarketingEmail(
      client.courriel,
      client.prenom,
      validatedData.subject,
      personalizedMessage
    );

    // Logger le succès dans la base de données
    await prisma.emailLog.create({
      data: {
        type: 'PROMO',
        clientEmail: client.courriel,
        clientName: `${client.prenom} ${client.nom}`,
        subject: validatedData.subject,
        htmlContent: personalizedMessage,
        campaignId: campaign.id,
        status: 'sent',
      },
    });

    // Mettre à jour les statistiques de la campagne
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        successCount: 1,
      },
    });

    // Mettre à jour le compteur d'emails du client
    await prisma.clientProfile.update({
      where: { id: client.id },
      data: {
        promoEmailsSent: {
          increment: 1,
        },
        lastEmailSent: new Date(),
      },
    });

    console.log(`✅ Email individuel envoyé avec succès à ${client.prenom} ${client.nom}`);

    res.status(200).json({
      success: true,
      message: `Email envoyé avec succès à ${client.prenom} ${client.nom}`,
      data: {
        campaignId: campaign.id,
        recipient: {
          nom: client.nom,
          prenom: client.prenom,
          email: client.courriel,
        },
      },
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de l'envoi de l'email à ${client.courriel}:`, error);

    // Logger l'échec dans la base de données
    await prisma.emailLog.create({
      data: {
        type: 'PROMO',
        clientEmail: client.courriel,
        clientName: `${client.prenom} ${client.nom}`,
        subject: validatedData.subject,
        htmlContent: personalizedMessage,
        campaignId: campaign.id,
        status: 'failed',
        errorMessage: error.message,
      },
    });

    // Mettre à jour les statistiques de la campagne
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        failureCount: 1,
      },
    });

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

  // Créer un enregistrement de campagne
  const campaign = await prisma.campaign.create({
    data: {
      name: `Campagne: ${validatedData.subject}`,
      subject: validatedData.subject,
      messageTemplate: validatedData.message,
      createdBy: req.user!.id,
      totalRecipients: clients.length,
    },
  });

  console.log(`📊 Campagne créée: ${campaign.name} (${campaign.totalRecipients} destinataires)`);

  // Envoyer les emails et logger chacun
  const results = await Promise.allSettled(
    clients.map(async (client) => {
      try {
        // Remplacer les placeholders {prenom} et {nom} pour chaque client
        const personalizedMessage = replacePlaceholders(
          validatedData.message,
          client.prenom,
          client.nom
        );

        await sendMarketingEmail(
          client.courriel,
          client.prenom,
          validatedData.subject,
          personalizedMessage
        );

        // Logger le succès
        await prisma.emailLog.create({
          data: {
            type: 'PROMO',
            clientEmail: client.courriel,
            clientName: `${client.prenom} ${client.nom}`,
            subject: validatedData.subject,
            htmlContent: personalizedMessage,
            campaignId: campaign.id,
            status: 'sent',
          },
        });

        return { success: true, email: client.courriel };
      } catch (error: any) {
        // Remplacer les placeholders aussi pour le log d'erreur
        const personalizedMessage = replacePlaceholders(
          validatedData.message,
          client.prenom,
          client.nom
        );

        // Logger l'échec
        await prisma.emailLog.create({
          data: {
            type: 'PROMO',
            clientEmail: client.courriel,
            clientName: `${client.prenom} ${client.nom}`,
            subject: validatedData.subject,
            htmlContent: personalizedMessage,
            campaignId: campaign.id,
            status: 'failed',
            errorMessage: error.message,
          },
        });

        return { success: false, email: client.courriel, error: error.message };
      }
    })
  );

  // Compter les succès et échecs
  const successes = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  const failures = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

  // Mettre à jour les statistiques de la campagne
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      successCount: successes,
      failureCount: failures,
    },
  });

  res.status(200).json({
    success: true,
    message: `Campagne envoyée: ${successes} réussis, ${failures} échecs`,
    data: {
      campaignId: campaign.id,
      totalSent: successes,
      totalFailed: failures,
      totalClients: clients.length,
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

/**
 * @desc    Générer un message marketing avec ChatGPT
 * @route   POST /api/marketing/generate-message
 * @access  Privé (ADMIN uniquement)
 */
const generateMessageSchema = z.object({
  prompt: z.string().min(1, 'Le prompt est requis'),
  // Accepte soit un array d'IDs, soit un array d'objets clients complets
  clients: z.array(
    z.union([
      z.string(), // Format: juste l'ID
      z.object({  // Format: objet client complet du frontend
        id: z.string(),
        nom: z.string(),
        prenom: z.string(),
        courriel: z.string().email(),
        telCellulaire: z.string().optional(),
        serviceType: z.enum(['MASSOTHERAPIE', 'ESTHETIQUE']).optional(),
      })
    ])
  ).optional(),
  serviceType: z.enum(['MASSOTHERAPIE', 'ESTHETIQUE']).optional(),
  additionalContext: z.string().optional(),
});

export const generateCampaignMessage = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = generateMessageSchema.parse(req.body);

    // Déterminer le type de service (depuis les clients ou depuis le paramètre direct)
    let serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE' | undefined = validatedData.serviceType;

    if (!serviceType && validatedData.clients && validatedData.clients.length > 0) {
      const firstClient = validatedData.clients[0];
      if (typeof firstClient !== 'string' && firstClient.serviceType) {
        serviceType = firstClient.serviceType;
      }
    }

    // Générer le sujet de l'email avec ChatGPT
    const subject = await generateEmailSubject(validatedData.prompt);

    // Générer le message avec placeholders {prenom} et {nom}
    const messageTemplate = await generateMarketingMessage(
      validatedData.prompt,
      serviceType,
      validatedData.additionalContext
    );

    // Créer un aperçu avec des valeurs d'exemple UNIQUEMENT pour la prévisualisation
    const previewMessage = replacePlaceholders(messageTemplate, 'Marie', 'Dupont');

    const clientsCount = validatedData.clients?.length || 0;

    res.status(200).json({
      success: true,
      message: 'Message généré avec succès',
      data: {
        subject,
        message: messageTemplate, // Template avec placeholders {prenom} {nom} pour l'envoi
        preview: previewMessage, // Aperçu avec exemple "Marie Dupont" pour visualisation admin
        prompt: validatedData.prompt,
        clientsCount,
        serviceType,
        note: 'Le champ "message" contient le template avec placeholders {prenom} et {nom}. Le champ "preview" montre un exemple avec "Marie Dupont".'
      },
    });
  } catch (error: any) {
    console.error('Erreur génération message:', error);

    // Retourner une erreur plus explicite
    if (error.message?.includes('OpenAI')) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du message',
    });
    return;
  }
};

/**
 * Wrapper intelligent qui détecte automatiquement si c'est un envoi individuel ou de groupe
 */
export const sendChatGPTCampaign = async (req: AuthRequest, res: Response) => {
  // Détecter le format des données
  const body = req.body;

  // Format individuel: { clientId, subject, message }
  if (body.clientId && body.message && !body.clients && !body.messageTemplate) {
    return sendIndividualEmail(req, res);
  }

  // Format groupe: { clients, subject, messageTemplate }
  if ((body.clients || body.messageTemplate) && !body.clientId) {
    return sendAiCampaign(req, res);
  }

  // Fallback: essayer le format groupe par défaut
  return sendAiCampaign(req, res);
};

/**
 * @desc    Envoyer une campagne générée par IA avec logging
 * @route   POST /api/marketing/send-ai-campaign
 * @access  Privé (ADMIN uniquement)
 */
const sendAiCampaignSchema = z.object({
  // Accepte soit un array d'IDs, soit un array d'objets clients complets
  clients: z.array(
    z.union([
      z.string(), // Format: juste l'ID
      z.object({  // Format: objet client complet du frontend
        id: z.string(),
        nom: z.string(),
        prenom: z.string(),
        courriel: z.string().email(),
        telCellulaire: z.string().optional(),
        serviceType: z.enum(['MASSOTHERAPIE', 'ESTHETIQUE']).optional(),
      })
    ])
  ).min(1, 'Au moins un client doit être sélectionné'),
  subject: z.string().min(1, 'Le sujet est requis'),
  messageTemplate: z.string().min(1, 'Le template de message est requis'), // Template avec placeholders
  prompt: z.string().optional(), // Prompt pour référence
  serviceType: z.enum(['MASSOTHERAPIE', 'ESTHETIQUE']).optional(),
  additionalContext: z.string().optional(), // Contexte additionnel
});

export const sendAiCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = sendAiCampaignSchema.parse(req.body);

    // Préparer les données clients selon le format reçu
    let clientsData: Array<{ id: string; nom: string; prenom: string; courriel: string }> = [];

    // Vérifier si on a reçu des IDs ou des objets complets
    const firstClient = validatedData.clients[0];

    if (typeof firstClient === 'string') {
      // On a reçu des IDs, on doit récupérer les clients de la DB
      const clients = await prisma.clientProfile.findMany({
        where: {
          id: {
            in: validatedData.clients as string[],
          },
        },
        select: {
          id: true,
          nom: true,
          prenom: true,
          courriel: true,
        },
      });
      clientsData = clients;
    } else {
      // On a reçu des objets clients complets du frontend
      clientsData = validatedData.clients as Array<{ id: string; nom: string; prenom: string; courriel: string }>;
    }

    if (clientsData.length === 0) {
      throw new AppError('Aucun client trouvé', 404);
    }

    // Créer un enregistrement de campagne
    const campaign = await prisma.campaign.create({
      data: {
        name: `Campagne AI: ${validatedData.subject}`,
        subject: validatedData.subject,
        messageTemplate: validatedData.messageTemplate,
        createdBy: req.user!.id,
        totalRecipients: clientsData.length,
      },
    });

    console.log(`📊 Campagne AI créée: ${campaign.name} (${campaign.totalRecipients} destinataires)`);

    // Envoyer les emails et logger dans la base de données
    // Chaque client reçoit le message avec ses placeholders remplacés
    const results = await Promise.allSettled(
      clientsData.map(async (client) => {
        try {
          const clientFullName = `${client.prenom} ${client.nom}`;

          // Remplacer les placeholders {prenom} et {nom} par les vraies valeurs
          const personalizedMessage = replacePlaceholders(
            validatedData.messageTemplate,
            client.prenom,
            client.nom
          );

          console.log(`📧 Envoi du message personnalisé à ${clientFullName}...`);

          // Envoyer l'email avec le message personnalisé
          await sendMarketingEmail(
            client.courriel,
            client.prenom,
            validatedData.subject,
            personalizedMessage
          );

          // Logger l'email dans la base de données
          await prisma.emailLog.create({
            data: {
              type: 'PROMO',
              clientEmail: client.courriel,
              clientName: `${client.prenom} ${client.nom}`,
              subject: validatedData.subject,
              htmlContent: personalizedMessage,
              campaignId: campaign.id,
              status: 'sent',
            },
          });

          // Mettre à jour le compteur d'emails promo du client
          await prisma.clientProfile.update({
            where: { id: client.id },
            data: {
              promoEmailsSent: {
                increment: 1,
              },
              lastEmailSent: new Date(),
            },
          });

          console.log(`✅ Message personnalisé envoyé à ${clientFullName}`);

          return {
            success: true,
            email: client.courriel,
            clientName: clientFullName,
          };
        } catch (error: any) {
          console.error(`❌ Erreur envoi email à ${client.courriel}:`, error);

          // Logger l'échec
          await prisma.emailLog.create({
            data: {
              type: 'PROMO',
              clientEmail: client.courriel,
              clientName: `${client.prenom} ${client.nom}`,
              subject: validatedData.subject,
              htmlContent: replacePlaceholders(
                validatedData.messageTemplate,
                client.prenom,
                client.nom
              ),
              campaignId: campaign.id,
              status: 'failed',
              errorMessage: error.message,
            },
          });

          return {
            success: false,
            email: client.courriel,
            clientName: `${client.prenom} ${client.nom}`,
            error: error.message,
          };
        }
      })
    );

    // Compter les succès et échecs
    const successes = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failures = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

    // Mettre à jour les statistiques de la campagne
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        successCount: successes,
        failureCount: failures,
      },
    });

    res.status(200).json({
      success: true,
      message: `Campagne envoyée: ${successes} message(s) personnalisé(s) envoyé(s), ${failures} échec(s)`,
      data: {
        campaignId: campaign.id,
        totalSent: successes,
        totalFailed: failures,
        totalClients: clientsData.length,
        note: 'Chaque client a reçu un message unique personnalisé avec son nom et prénom',
        results: results.map((r) => {
          if (r.status === 'fulfilled') {
            return r.value;
          }
          return {
            success: false,
            error: 'Erreur inconnue',
          };
        }),
      },
    });
  } catch (error: any) {
    console.error('Erreur envoi campagne:', error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la campagne',
    });
    return;
  }
};

/**
 * @desc    Récupérer les logs d'emails avec filtres et pagination
 * @route   GET /api/marketing/email-logs
 * @access  Privé (ADMIN uniquement)
 */
export const getEmailLogs = async (req: AuthRequest, res: Response) => {
  const {
    type,           // FEEDBACK, PROMO, etc.
    clientEmail,    // Filtrer par email client
    startDate,      // Date de début
    endDate,        // Date de fin
    page = '1',     // Page actuelle
    limit = '50',   // Nombre par page
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Construire les filtres
  const where: any = {};

  if (type) {
    where.type = type;
  }

  if (clientEmail) {
    where.clientEmail = {
      contains: clientEmail as string,
      mode: 'insensitive',
    };
  }

  if (startDate || endDate) {
    where.sentAt = {};
    if (startDate) {
      where.sentAt.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.sentAt.lte = new Date(endDate as string);
    }
  }

  // Récupérer les logs
  const [logs, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      skip,
      take: limitNum,
      select: {
        id: true,
        type: true,
        clientEmail: true,
        clientName: true,
        subject: true,
        sentAt: true,
        opened: true,
        clicked: true,
      },
    }),
    prisma.emailLog.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
};

/**
 * @desc    Obtenir les statistiques des emails envoyés
 * @route   GET /api/marketing/email-stats
 * @access  Privé (ADMIN uniquement)
 */
export const getEmailStats = async (req: AuthRequest, res: Response) => {
  const { startDate, endDate } = req.query;

  const where: any = {};

  if (startDate || endDate) {
    where.sentAt = {};
    if (startDate) {
      where.sentAt.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.sentAt.lte = new Date(endDate as string);
    }
  }

  // Statistiques globales
  const [totalEmails, byType, recentLogs] = await Promise.all([
    // Total d'emails envoyés
    prisma.emailLog.count({ where }),

    // Emails par type
    prisma.emailLog.groupBy({
      by: ['type'],
      where,
      _count: true,
    }),

    // 10 derniers emails
    prisma.emailLog.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        clientEmail: true,
        clientName: true,
        subject: true,
        sentAt: true,
      },
    }),
  ]);

  // Statistiques par type
  const statsByType = byType.reduce((acc: any, item) => {
    acc[item.type] = item._count;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      totalEmails,
      byType: statsByType,
      recentLogs,
    },
  });
};

/**
 * @desc    Récupérer les détails d'un email spécifique
 * @route   GET /api/marketing/email-logs/:id
 * @access  Privé (ADMIN uniquement)
 */
export const getEmailLogById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const emailLog = await prisma.emailLog.findUnique({
    where: { id },
  });

  if (!emailLog) {
    throw new AppError('Log d\'email non trouvé', 404);
  }

  res.status(200).json({
    success: true,
    data: emailLog,
  });
};

/**
 * @desc    Récupérer l'historique des campagnes
 * @route   GET /api/marketing/campaigns
 * @access  Privé (ADMIN uniquement)
 */
export const getCampaigns = async (req: AuthRequest, res: Response) => {
  const {
    page = '1',
    limit = '20',
    startDate,
    endDate,
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Construire les filtres
  const where: any = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate as string);
    }
  }

  // Récupérer les campagnes avec les destinataires
  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      select: {
        id: true,
        name: true,
        subject: true,
        createdBy: true,
        createdAt: true,
        totalRecipients: true,
        successCount: true,
        failureCount: true,
        emails: {
          select: {
            clientName: true,
            clientEmail: true,
            status: true,
          },
        },
      },
    }),
    prisma.campaign.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      campaigns,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
};

/**
 * @desc    Récupérer les détails d'une campagne spécifique
 * @route   GET /api/marketing/campaigns/:id
 * @access  Privé (ADMIN uniquement)
 */
export const getCampaignById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      emails: {
        orderBy: { sentAt: 'desc' },
        select: {
          id: true,
          clientEmail: true,
          clientName: true,
          subject: true,
          status: true,
          errorMessage: true,
          sentAt: true,
          opened: true,
          clicked: true,
        },
      },
    },
  });

  if (!campaign) {
    throw new AppError('Campagne non trouvée', 404);
  }

  // Séparer les emails réussis et échoués
  const successfulEmails = campaign.emails.filter(e => e.status === 'sent');
  const failedEmails = campaign.emails.filter(e => e.status === 'failed' || e.status === 'bounced');

  res.status(200).json({
    success: true,
    data: {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        messageTemplate: campaign.messageTemplate,
        createdBy: campaign.createdBy,
        createdAt: campaign.createdAt,
        totalRecipients: campaign.totalRecipients,
        successCount: campaign.successCount,
        failureCount: campaign.failureCount,
      },
      successfulEmails,
      failedEmails,
      stats: {
        total: campaign.emails.length,
        successful: successfulEmails.length,
        failed: failedEmails.length,
        successRate: campaign.totalRecipients > 0
          ? ((successfulEmails.length / campaign.totalRecipients) * 100).toFixed(2) + '%'
          : '0%',
      },
    },
  });
};

/**
 * @desc    Renvoyer les emails échoués d'une campagne
 * @route   POST /api/marketing/campaigns/:id/resend-failed
 * @access  Privé (ADMIN uniquement)
 */
export const resendFailedEmails = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Récupérer la campagne
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      emails: {
        where: {
          status: {
            in: ['failed', 'bounced'],
          },
        },
        select: {
          id: true,
          clientEmail: true,
          clientName: true,
          subject: true,
          htmlContent: true,
        },
      },
    },
  });

  if (!campaign) {
    throw new AppError('Campagne non trouvée', 404);
  }

  if (campaign.emails.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'Aucun email échoué à renvoyer',
      data: {
        totalResent: 0,
        totalFailed: 0,
      },
    });
  }

  console.log(`🔄 Renvoi de ${campaign.emails.length} emails échoués de la campagne "${campaign.name}"`);

  // Renvoyer chaque email échoué
  const results = await Promise.allSettled(
    campaign.emails.map(async (emailLog) => {
      try {
        // Extraire le prénom du nom complet (si disponible)
        const prenom = emailLog.clientName?.split(' ')[0] || '';

        // Envoyer l'email
        await sendMarketingEmail(
          emailLog.clientEmail,
          prenom,
          emailLog.subject,
          emailLog.htmlContent
        );

        // Mettre à jour le log existant
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'sent',
            errorMessage: null,
            sentAt: new Date(),
          },
        });

        console.log(`✅ Email renvoyé avec succès à ${emailLog.clientEmail}`);

        return {
          success: true,
          email: emailLog.clientEmail,
        };
      } catch (error: any) {
        console.error(`❌ Échec du renvoi à ${emailLog.clientEmail}:`, error);

        // Mettre à jour avec la nouvelle erreur
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            errorMessage: `Échec du renvoi: ${error.message}`,
          },
        });

        return {
          success: false,
          email: emailLog.clientEmail,
          error: error.message,
        };
      }
    })
  );

  // Compter les succès et échecs
  const successes = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  const failures = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

  // Mettre à jour les statistiques de la campagne
  await prisma.campaign.update({
    where: { id },
    data: {
      successCount: {
        increment: successes,
      },
      failureCount: {
        decrement: successes, // Les échecs qui sont maintenant des succès
      },
    },
  });

  res.status(200).json({
    success: true,
    message: `Renvoi terminé: ${successes} réussis, ${failures} toujours en échec`,
    data: {
      totalResent: successes,
      totalFailed: failures,
      totalAttempted: campaign.emails.length,
    },
  });
  return;
};
