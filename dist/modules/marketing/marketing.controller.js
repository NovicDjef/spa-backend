"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendFailedEmails = exports.getCampaignById = exports.getCampaigns = exports.getEmailLogById = exports.getEmailStats = exports.getEmailLogs = exports.sendAiCampaign = exports.sendChatGPTCampaign = exports.generateCampaignMessage = exports.getMarketingStats = exports.sendCampaignEmail = exports.sendIndividualEmail = exports.exportContacts = exports.getContacts = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
const email_1 = require("../../lib/email");
const chatgpt_1 = require("../../lib/chatgpt");
/**
 * @desc    Récupérer les contacts clients avec filtres avancés
 * @route   GET /api/marketing/contacts
 * @access  Privé (ADMIN uniquement)
 */
const getContacts = async (req, res) => {
    const { serviceType, lastVisitMonths, lastVisitYears, gender, search } = req.query;
    let where = {};
    // Filtre par type de service
    if (serviceType && (serviceType === 'MASSOTHERAPIE' || serviceType === 'ESTHETIQUE')) {
        where.serviceType = serviceType;
    }
    // Filtre par genre
    if (gender && ['HOMME', 'FEMME', 'AUTRE'].includes(gender)) {
        where.gender = gender;
    }
    // Recherche
    if (search) {
        where.OR = [
            { nom: { contains: search, mode: 'insensitive' } },
            { prenom: { contains: search, mode: 'insensitive' } },
            { courriel: { contains: search, mode: 'insensitive' } },
            { telCellulaire: { contains: search } },
        ];
    }
    // Récupérer les clients avec leurs dernières notes
    const clients = await database_1.default.clientProfile.findMany({
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
        const months = parseInt(lastVisitMonths);
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
        const years = parseInt(lastVisitYears);
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
exports.getContacts = getContacts;
/**
 * @desc    Exporter les contacts en CSV
 * @route   GET /api/marketing/contacts/export
 * @access  Privé (ADMIN uniquement)
 */
const exportContacts = async (req, res) => {
    const { serviceType } = req.query;
    let where = {};
    if (serviceType && (serviceType === 'MASSOTHERAPIE' || serviceType === 'ESTHETIQUE')) {
        where.serviceType = serviceType;
    }
    const clients = await database_1.default.clientProfile.findMany({
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
exports.exportContacts = exportContacts;
/**
 * @desc    Envoyer un email à un client spécifique
 * @route   POST /api/marketing/send-email/individual
 * @access  Privé (ADMIN uniquement)
 */
const sendIndividualEmailSchema = zod_1.z.object({
    clientId: zod_1.z.string().min(1, 'L\'ID du client est requis'),
    subject: zod_1.z.string().min(1, 'Le sujet est requis'),
    message: zod_1.z.string().min(1, 'Le message est requis'),
});
const sendIndividualEmail = async (req, res) => {
    const validatedData = sendIndividualEmailSchema.parse(req.body);
    // Vérifier que le client existe
    const client = await database_1.default.clientProfile.findUnique({
        where: { id: validatedData.clientId },
        select: {
            id: true,
            nom: true,
            prenom: true,
            courriel: true,
        },
    });
    if (!client) {
        throw new errorHandler_1.AppError('Client non trouvé', 404);
    }
    // Créer un enregistrement de campagne pour l'email individuel
    const campaign = await database_1.default.campaign.create({
        data: {
            name: `Email individuel: ${validatedData.subject} → ${client.prenom} ${client.nom}`,
            subject: validatedData.subject,
            messageTemplate: validatedData.message,
            createdBy: req.user.id,
            totalRecipients: 1,
        },
    });
    console.log(`📧 Envoi d'email individuel à ${client.prenom} ${client.nom}...`);
    // Remplacer les placeholders {prenom} et {nom} dans le message si présents
    const personalizedMessage = (0, chatgpt_1.replacePlaceholders)(validatedData.message, client.prenom, client.nom);
    // Envoyer l'email
    try {
        await (0, email_1.sendMarketingEmail)(client.courriel, client.prenom, validatedData.subject, personalizedMessage);
        // Logger le succès dans la base de données
        await database_1.default.emailLog.create({
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
        await database_1.default.campaign.update({
            where: { id: campaign.id },
            data: {
                successCount: 1,
            },
        });
        // Mettre à jour le compteur d'emails du client
        await database_1.default.clientProfile.update({
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
    }
    catch (error) {
        console.error(`❌ Erreur lors de l'envoi de l'email à ${client.courriel}:`, error);
        // Logger l'échec dans la base de données
        await database_1.default.emailLog.create({
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
        await database_1.default.campaign.update({
            where: { id: campaign.id },
            data: {
                failureCount: 1,
            },
        });
        throw new errorHandler_1.AppError('Erreur lors de l\'envoi de l\'email', 500);
    }
};
exports.sendIndividualEmail = sendIndividualEmail;
/**
 * @desc    Envoyer un email en masse (campagne)
 * @route   POST /api/marketing/send-email/campaign
 * @access  Privé (ADMIN uniquement)
 */
const sendCampaignEmailSchema = zod_1.z.object({
    clientIds: zod_1.z.array(zod_1.z.string()).min(1, 'Au moins un client doit être sélectionné'),
    subject: zod_1.z.string().min(1, 'Le sujet est requis'),
    message: zod_1.z.string().min(1, 'Le message est requis'),
});
const sendCampaignEmail = async (req, res) => {
    const validatedData = sendCampaignEmailSchema.parse(req.body);
    // Récupérer les clients
    const clients = await database_1.default.clientProfile.findMany({
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
        throw new errorHandler_1.AppError('Aucun client trouvé', 404);
    }
    // Créer un enregistrement de campagne
    const campaign = await database_1.default.campaign.create({
        data: {
            name: `Campagne: ${validatedData.subject}`,
            subject: validatedData.subject,
            messageTemplate: validatedData.message,
            createdBy: req.user.id,
            totalRecipients: clients.length,
        },
    });
    console.log(`📊 Campagne créée: ${campaign.name} (${campaign.totalRecipients} destinataires)`);
    // Envoyer les emails et logger chacun
    const results = await Promise.allSettled(clients.map(async (client) => {
        try {
            // Remplacer les placeholders {prenom} et {nom} pour chaque client
            const personalizedMessage = (0, chatgpt_1.replacePlaceholders)(validatedData.message, client.prenom, client.nom);
            await (0, email_1.sendMarketingEmail)(client.courriel, client.prenom, validatedData.subject, personalizedMessage);
            // Logger le succès
            await database_1.default.emailLog.create({
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
        }
        catch (error) {
            // Remplacer les placeholders aussi pour le log d'erreur
            const personalizedMessage = (0, chatgpt_1.replacePlaceholders)(validatedData.message, client.prenom, client.nom);
            // Logger l'échec
            await database_1.default.emailLog.create({
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
    }));
    // Compter les succès et échecs
    const successes = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failures = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
    // Mettre à jour les statistiques de la campagne
    await database_1.default.campaign.update({
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
exports.sendCampaignEmail = sendCampaignEmail;
/**
 * @desc    Obtenir des statistiques pour les campagnes
 * @route   GET /api/marketing/stats
 * @access  Privé (ADMIN uniquement)
 */
const getMarketingStats = async (req, res) => {
    // Total de clients
    const totalClients = await database_1.default.clientProfile.count();
    // Par type de service
    const clientsByService = await database_1.default.clientProfile.groupBy({
        by: ['serviceType'],
        _count: true,
    });
    // Par genre
    const clientsByGender = await database_1.default.clientProfile.groupBy({
        by: ['gender'],
        _count: true,
    });
    // Clients sans visite récente (plus de 3 mois)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const allClients = await database_1.default.clientProfile.findMany({
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
        if (client.notes.length === 0)
            return true;
        return new Date(client.notes[0].createdAt) < threeMonthsAgo;
    });
    // Nouveaux clients (moins de 30 jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newClients = await database_1.default.clientProfile.count({
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
            clientsByService: clientsByService.reduce((acc, item) => {
                acc[item.serviceType] = item._count;
                return acc;
            }, {}),
            clientsByGender: clientsByGender.reduce((acc, item) => {
                acc[item.gender] = item._count;
                return acc;
            }, {}),
        },
    });
};
exports.getMarketingStats = getMarketingStats;
/**
 * @desc    Générer un message marketing avec ChatGPT
 * @route   POST /api/marketing/generate-message
 * @access  Privé (ADMIN uniquement)
 */
const generateMessageSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(1, 'Le prompt est requis'),
    // Accepte soit un array d'IDs, soit un array d'objets clients complets
    clients: zod_1.z.array(zod_1.z.union([
        zod_1.z.string(), // Format: juste l'ID
        zod_1.z.object({
            id: zod_1.z.string(),
            nom: zod_1.z.string(),
            prenom: zod_1.z.string(),
            courriel: zod_1.z.string().email(),
            telCellulaire: zod_1.z.string().optional(),
            serviceType: zod_1.z.enum(['MASSOTHERAPIE', 'ESTHETIQUE']).optional(),
        })
    ])).optional(),
    serviceType: zod_1.z.enum(['MASSOTHERAPIE', 'ESTHETIQUE']).optional(),
    additionalContext: zod_1.z.string().optional(),
});
const generateCampaignMessage = async (req, res) => {
    try {
        const validatedData = generateMessageSchema.parse(req.body);
        // Déterminer le type de service (depuis les clients ou depuis le paramètre direct)
        let serviceType = validatedData.serviceType;
        if (!serviceType && validatedData.clients && validatedData.clients.length > 0) {
            const firstClient = validatedData.clients[0];
            if (typeof firstClient !== 'string' && firstClient.serviceType) {
                serviceType = firstClient.serviceType;
            }
        }
        // Générer le sujet de l'email avec ChatGPT
        const subject = await (0, chatgpt_1.generateEmailSubject)(validatedData.prompt);
        // Générer le message avec placeholders {prenom} et {nom}
        const messageTemplate = await (0, chatgpt_1.generateMarketingMessage)(validatedData.prompt, serviceType, validatedData.additionalContext);
        // Créer un aperçu avec des valeurs d'exemple UNIQUEMENT pour la prévisualisation
        const previewMessage = (0, chatgpt_1.replacePlaceholders)(messageTemplate, 'Marie', 'Dupont');
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
    }
    catch (error) {
        console.error('Erreur génération message:', error);
        // Retourner une erreur plus explicite
        if (error.message?.includes('OpenAI')) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
            return;
        }
        if (error instanceof zod_1.z.ZodError) {
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
exports.generateCampaignMessage = generateCampaignMessage;
/**
 * Wrapper intelligent qui détecte automatiquement si c'est un envoi individuel ou de groupe
 */
const sendChatGPTCampaign = async (req, res) => {
    // Détecter le format des données
    const body = req.body;
    // Format individuel: { clientId, subject, message }
    if (body.clientId && body.message && !body.clients && !body.messageTemplate) {
        return (0, exports.sendIndividualEmail)(req, res);
    }
    // Format groupe: { clients, subject, messageTemplate }
    if ((body.clients || body.messageTemplate) && !body.clientId) {
        return (0, exports.sendAiCampaign)(req, res);
    }
    // Fallback: essayer le format groupe par défaut
    return (0, exports.sendAiCampaign)(req, res);
};
exports.sendChatGPTCampaign = sendChatGPTCampaign;
/**
 * @desc    Envoyer une campagne générée par IA avec logging
 * @route   POST /api/marketing/send-ai-campaign
 * @access  Privé (ADMIN uniquement)
 */
const sendAiCampaignSchema = zod_1.z.object({
    // Accepte soit un array d'IDs, soit un array d'objets clients complets
    clients: zod_1.z.array(zod_1.z.union([
        zod_1.z.string(), // Format: juste l'ID
        zod_1.z.object({
            id: zod_1.z.string(),
            nom: zod_1.z.string(),
            prenom: zod_1.z.string(),
            courriel: zod_1.z.string().email(),
            telCellulaire: zod_1.z.string().optional(),
            serviceType: zod_1.z.enum(['MASSOTHERAPIE', 'ESTHETIQUE']).optional(),
        })
    ])).min(1, 'Au moins un client doit être sélectionné'),
    subject: zod_1.z.string().min(1, 'Le sujet est requis'),
    messageTemplate: zod_1.z.string().min(1, 'Le template de message est requis'), // Template avec placeholders
    prompt: zod_1.z.string().optional(), // Prompt pour référence
    serviceType: zod_1.z.enum(['MASSOTHERAPIE', 'ESTHETIQUE']).optional(),
    additionalContext: zod_1.z.string().optional(), // Contexte additionnel
});
const sendAiCampaign = async (req, res) => {
    try {
        const validatedData = sendAiCampaignSchema.parse(req.body);
        // Préparer les données clients selon le format reçu
        let clientsData = [];
        // Vérifier si on a reçu des IDs ou des objets complets
        const firstClient = validatedData.clients[0];
        if (typeof firstClient === 'string') {
            // On a reçu des IDs, on doit récupérer les clients de la DB
            const clients = await database_1.default.clientProfile.findMany({
                where: {
                    id: {
                        in: validatedData.clients,
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
        }
        else {
            // On a reçu des objets clients complets du frontend
            clientsData = validatedData.clients;
        }
        if (clientsData.length === 0) {
            throw new errorHandler_1.AppError('Aucun client trouvé', 404);
        }
        // Créer un enregistrement de campagne
        const campaign = await database_1.default.campaign.create({
            data: {
                name: `Campagne AI: ${validatedData.subject}`,
                subject: validatedData.subject,
                messageTemplate: validatedData.messageTemplate,
                createdBy: req.user.id,
                totalRecipients: clientsData.length,
            },
        });
        console.log(`📊 Campagne AI créée: ${campaign.name} (${campaign.totalRecipients} destinataires)`);
        // Envoyer les emails et logger dans la base de données
        // Chaque client reçoit le message avec ses placeholders remplacés
        const results = await Promise.allSettled(clientsData.map(async (client) => {
            try {
                const clientFullName = `${client.prenom} ${client.nom}`;
                // Remplacer les placeholders {prenom} et {nom} par les vraies valeurs
                const personalizedMessage = (0, chatgpt_1.replacePlaceholders)(validatedData.messageTemplate, client.prenom, client.nom);
                console.log(`📧 Envoi du message personnalisé à ${clientFullName}...`);
                // Envoyer l'email avec le message personnalisé
                await (0, email_1.sendMarketingEmail)(client.courriel, client.prenom, validatedData.subject, personalizedMessage);
                // Logger l'email dans la base de données
                await database_1.default.emailLog.create({
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
                await database_1.default.clientProfile.update({
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
            }
            catch (error) {
                console.error(`❌ Erreur envoi email à ${client.courriel}:`, error);
                // Logger l'échec
                await database_1.default.emailLog.create({
                    data: {
                        type: 'PROMO',
                        clientEmail: client.courriel,
                        clientName: `${client.prenom} ${client.nom}`,
                        subject: validatedData.subject,
                        htmlContent: (0, chatgpt_1.replacePlaceholders)(validatedData.messageTemplate, client.prenom, client.nom),
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
        }));
        // Compter les succès et échecs
        const successes = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
        const failures = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
        // Mettre à jour les statistiques de la campagne
        await database_1.default.campaign.update({
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
    }
    catch (error) {
        console.error('Erreur envoi campagne:', error);
        if (error instanceof zod_1.z.ZodError) {
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
exports.sendAiCampaign = sendAiCampaign;
/**
 * @desc    Récupérer les logs d'emails avec filtres et pagination
 * @route   GET /api/marketing/email-logs
 * @access  Privé (ADMIN uniquement)
 */
const getEmailLogs = async (req, res) => {
    const { type, // FEEDBACK, PROMO, etc.
    clientEmail, // Filtrer par email client
    startDate, // Date de début
    endDate, // Date de fin
    page = '1', // Page actuelle
    limit = '50', // Nombre par page
     } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    // Construire les filtres
    const where = {};
    if (type) {
        where.type = type;
    }
    if (clientEmail) {
        where.clientEmail = {
            contains: clientEmail,
            mode: 'insensitive',
        };
    }
    if (startDate || endDate) {
        where.sentAt = {};
        if (startDate) {
            where.sentAt.gte = new Date(startDate);
        }
        if (endDate) {
            where.sentAt.lte = new Date(endDate);
        }
    }
    // Récupérer les logs
    const [logs, total] = await Promise.all([
        database_1.default.emailLog.findMany({
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
        database_1.default.emailLog.count({ where }),
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
exports.getEmailLogs = getEmailLogs;
/**
 * @desc    Obtenir les statistiques des emails envoyés
 * @route   GET /api/marketing/email-stats
 * @access  Privé (ADMIN uniquement)
 */
const getEmailStats = async (req, res) => {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate || endDate) {
        where.sentAt = {};
        if (startDate) {
            where.sentAt.gte = new Date(startDate);
        }
        if (endDate) {
            where.sentAt.lte = new Date(endDate);
        }
    }
    // Statistiques globales
    const [totalEmails, byType, recentLogs] = await Promise.all([
        // Total d'emails envoyés
        database_1.default.emailLog.count({ where }),
        // Emails par type
        database_1.default.emailLog.groupBy({
            by: ['type'],
            where,
            _count: true,
        }),
        // 10 derniers emails
        database_1.default.emailLog.findMany({
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
    const statsByType = byType.reduce((acc, item) => {
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
exports.getEmailStats = getEmailStats;
/**
 * @desc    Récupérer les détails d'un email spécifique
 * @route   GET /api/marketing/email-logs/:id
 * @access  Privé (ADMIN uniquement)
 */
const getEmailLogById = async (req, res) => {
    const { id } = req.params;
    const emailLog = await database_1.default.emailLog.findUnique({
        where: { id },
    });
    if (!emailLog) {
        throw new errorHandler_1.AppError('Log d\'email non trouvé', 404);
    }
    res.status(200).json({
        success: true,
        data: emailLog,
    });
};
exports.getEmailLogById = getEmailLogById;
/**
 * @desc    Récupérer l'historique des campagnes
 * @route   GET /api/marketing/campaigns
 * @access  Privé (ADMIN uniquement)
 */
const getCampaigns = async (req, res) => {
    const { page = '1', limit = '20', startDate, endDate, } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    // Construire les filtres
    const where = {};
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
            where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
            where.createdAt.lte = new Date(endDate);
        }
    }
    // Récupérer les campagnes
    const [campaigns, total] = await Promise.all([
        database_1.default.campaign.findMany({
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
            },
        }),
        database_1.default.campaign.count({ where }),
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
exports.getCampaigns = getCampaigns;
/**
 * @desc    Récupérer les détails d'une campagne spécifique
 * @route   GET /api/marketing/campaigns/:id
 * @access  Privé (ADMIN uniquement)
 */
const getCampaignById = async (req, res) => {
    const { id } = req.params;
    const campaign = await database_1.default.campaign.findUnique({
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
        throw new errorHandler_1.AppError('Campagne non trouvée', 404);
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
exports.getCampaignById = getCampaignById;
/**
 * @desc    Renvoyer les emails échoués d'une campagne
 * @route   POST /api/marketing/campaigns/:id/resend-failed
 * @access  Privé (ADMIN uniquement)
 */
const resendFailedEmails = async (req, res) => {
    const { id } = req.params;
    // Récupérer la campagne
    const campaign = await database_1.default.campaign.findUnique({
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
        throw new errorHandler_1.AppError('Campagne non trouvée', 404);
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
    const results = await Promise.allSettled(campaign.emails.map(async (emailLog) => {
        try {
            // Extraire le prénom du nom complet (si disponible)
            const prenom = emailLog.clientName?.split(' ')[0] || '';
            // Envoyer l'email
            await (0, email_1.sendMarketingEmail)(emailLog.clientEmail, prenom, emailLog.subject, emailLog.htmlContent);
            // Mettre à jour le log existant
            await database_1.default.emailLog.update({
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
        }
        catch (error) {
            console.error(`❌ Échec du renvoi à ${emailLog.clientEmail}:`, error);
            // Mettre à jour avec la nouvelle erreur
            await database_1.default.emailLog.update({
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
    }));
    // Compter les succès et échecs
    const successes = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failures = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
    // Mettre à jour les statistiques de la campagne
    await database_1.default.campaign.update({
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
exports.resendFailedEmails = resendFailedEmails;
//# sourceMappingURL=marketing.controller.js.map