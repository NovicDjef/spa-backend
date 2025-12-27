"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchClients = exports.deleteClient = exports.updateClient = exports.getClientById = exports.getClients = exports.createClient = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
const email_1 = require("../../lib/email");
/**
 * PROTECTION DE LA VIE PRIVÉE
 * Masque les informations sensibles des clients pour les massothérapeutes et esthéticiennes
 * Les massothérapeutes peuvent voir les infos médicales (nécessaires au traitement)
 * mais PAS les infos de contact (téléphone, email, adresse)
 */
const hideSensitiveClientInfo = (client, userRole) => {
    // ADMIN et SECRETAIRE voient tout
    if (userRole === 'ADMIN' || userRole === 'SECRETAIRE') {
        return client;
    }
    // MASSOTHERAPEUTE et ESTHETICIENNE: Masquer infos de contact
    const { courriel, telCellulaire, telMaison, telBureau, adresse, ville, codePostal, ...clientWithoutSensitiveInfo } = client;
    return {
        ...clientWithoutSensitiveInfo,
        // Masquer les infos de contact avec des valeurs censurées
        courriel: '***@***.***',
        telCellulaire: '***-***-****',
        telMaison: telMaison ? '***-***-****' : null,
        telBureau: telBureau ? '***-***-****' : null,
        adresse: '***',
        ville: '***',
        codePostal: '***',
    };
};
// Helper pour transformer "OUI"/"NON" en boolean
const booleanOrString = zod_1.z
    .union([
    zod_1.z.boolean(),
    zod_1.z.enum(['OUI', 'NON', 'oui', 'non', 'true', 'false']),
])
    .transform((val) => {
    if (val === true || val === 'OUI' || val === 'oui' || val === 'true') {
        return true;
    }
    if (val === false || val === 'NON' || val === 'non' || val === 'false') {
        return false;
    }
    return val;
})
    .nullable()
    .optional();
// Schéma de validation pour la création d'un client
const createClientSchema = zod_1.z.object({
    // Informations personnelles
    nom: zod_1.z.string().min(1, 'Le nom est requis'),
    prenom: zod_1.z.string().min(1, 'Le prénom est requis'),
    adresse: zod_1.z.string().min(1, 'L\'adresse est requise'),
    ville: zod_1.z.string().min(1, 'La ville est requise'),
    codePostal: zod_1.z.string().min(1, 'Le code postal est requis'),
    telMaison: zod_1.z.string().optional(),
    telBureau: zod_1.z.string().optional(),
    telCellulaire: zod_1.z.string().min(9, 'Le téléphone cellulaire doit contenir au moins 9 chiffres'),
    courriel: zod_1.z.string().email('Email invalide'),
    dateNaissance: zod_1.z.string().min(1, 'La date de naissance est requise'),
    occupation: zod_1.z.string().optional(),
    gender: zod_1.z.enum(['HOMME', 'FEMME', 'AUTRE']),
    serviceType: zod_1.z.enum(['MASSOTHERAPIE', 'ESTHETIQUE']),
    assuranceCouvert: booleanOrString,
    // Informations médicales (optionnelles)
    raisonConsultation: zod_1.z.string().nullable().optional(),
    diagnosticMedical: booleanOrString.optional(),
    diagnosticMedicalDetails: zod_1.z.string().nullable().optional(),
    medicaments: booleanOrString.optional(),
    medicamentsDetails: zod_1.z.string().nullable().optional(),
    accidents: booleanOrString.optional(),
    accidentsDetails: zod_1.z.string().nullable().optional(),
    operationsChirurgicales: booleanOrString.optional(),
    operationsChirurgicalesDetails: zod_1.z.string().optional(),
    traitementsActuels: zod_1.z.string().optional(),
    problemesCardiaques: zod_1.z.boolean().optional(),
    problemesCardiaquesDetails: zod_1.z.string().nullable().optional(),
    maladiesGraves: booleanOrString.optional(),
    maladiesGravesDetails: zod_1.z.string().nullable().optional(),
    ortheses: booleanOrString.optional(),
    orthesesDetails: zod_1.z.string().nullable().optional(),
    allergies: booleanOrString.optional(),
    allergiesDetails: zod_1.z.string().nullable().optional(),
    // Conditions médicales
    raideurs: booleanOrString.optional(),
    arthrose: booleanOrString.optional(),
    hernieDiscale: booleanOrString.optional(),
    oedeme: booleanOrString.optional(),
    tendinite: booleanOrString.optional(),
    mauxDeTete: booleanOrString.optional(),
    flatulence: booleanOrString.optional(),
    troublesCirculatoires: booleanOrString.optional(),
    hypothyroidie: booleanOrString.optional(),
    diabete: booleanOrString.optional(),
    stresse: booleanOrString.optional(),
    premenopause: booleanOrString.optional(),
    douleurMusculaire: booleanOrString.optional(),
    fibromyalgie: booleanOrString.optional(),
    rhumatisme: booleanOrString.optional(),
    sciatique: booleanOrString.optional(),
    bursite: booleanOrString.optional(),
    migraine: booleanOrString.optional(),
    diarrhee: booleanOrString.optional(),
    phlebite: booleanOrString.optional(),
    hypertension: booleanOrString.optional(),
    hypoglycemie: booleanOrString.optional(),
    burnOut: booleanOrString.optional(),
    menopause: booleanOrString.optional(),
    inflammationAigue: booleanOrString.optional(),
    arteriosclerose: booleanOrString.optional(),
    osteoporose: booleanOrString.optional(),
    mauxDeDos: booleanOrString.optional(),
    fatigueDesJambes: booleanOrString.optional(),
    troublesDigestifs: booleanOrString.optional(),
    constipation: booleanOrString.optional(),
    hyperthyroidie: booleanOrString.optional(),
    hypotension: booleanOrString.optional(),
    insomnie: booleanOrString.optional(),
    depressionNerveuse: booleanOrString.optional(),
    autres: zod_1.z.string().optional(),
    // Zones de douleur
    zonesDouleur: zod_1.z.array(zod_1.z.string()).optional(),
    // Informations esthétique
    etatPeau: zod_1.z.string().optional(),
    etatPores: zod_1.z.string().optional(),
    coucheCornee: zod_1.z.string().optional(),
    irrigationSanguine: zod_1.z.string().optional(),
    impuretes: zod_1.z.string().optional(),
    sensibiliteCutanee: zod_1.z.string().optional(),
    autreMaladieDetails: zod_1.z.string().nullable().optional(),
    autreMaladie: zod_1.z.boolean().optional(),
    fumeur: zod_1.z.enum(['OUI', 'NON', 'OCCASIONNEL',]).nullable().optional(),
    niveauStress: zod_1.z.string().optional(),
    expositionSoleil: zod_1.z.enum(['RARE', 'MODEREE', 'FREQUENTE', 'TRES_FREQUENTE']).optional().nullable(),
    protectionSolaire: zod_1.z.enum(['TOUJOURS', 'SOUVENT', 'RAREMENT', 'JAMAIS']).optional().nullable(),
    suffisanceEau: zod_1.z.enum(['OUI', 'NON']).optional().nullable(),
    travailExterieur: zod_1.z.enum(['OUI', 'NON']).optional().nullable(),
    bainChauds: zod_1.z.enum(['OUI', 'NON']).optional().nullable(),
    routineSoins: zod_1.z.any().optional(),
    changementsRecents: zod_1.z.any().optional(),
    preferencePeau: zod_1.z.string().optional(),
    diagnosticVisuelNotes: zod_1.z.any().optional(),
});
/**
 * @desc    Créer un nouveau client (SANS compte utilisateur)
 * @route   POST /api/clients
 * @access  Public
 */
const createClient = async (req, res) => {
    // Validation
    const validatedData = createClientSchema.parse(req.body);
    // Vérifier l'unicité de l'email dans ClientProfile
    const existingEmail = await database_1.default.clientProfile.findUnique({
        where: { courriel: validatedData.courriel },
    });
    if (existingEmail) {
        throw new errorHandler_1.AppError('Cet email est déjà utilisé', 400);
    }
    // Vérifier l'unicité du téléphone dans ClientProfile
    const existingPhone = await database_1.default.clientProfile.findUnique({
        where: { telCellulaire: validatedData.telCellulaire },
    });
    if (existingPhone) {
        throw new errorHandler_1.AppError('Ce numéro de téléphone est déjà utilisé', 400);
    }
    // Créer le profil client directement (SANS User)
    const client = await database_1.default.clientProfile.create({
        data: {
            ...validatedData,
            dateNaissance: new Date(validatedData.dateNaissance),
            zonesDouleur: validatedData.zonesDouleur ?? [],
        },
    });
    // Envoyer l'email de confirmation (async, ne bloque pas la réponse)
    (0, email_1.sendWelcomeEmail)(client.courriel, client.prenom, client.serviceType);
    res.status(201).json({
        success: true,
        message: 'Dossier client créé avec succès',
        data: client,
    });
};
exports.createClient = createClient;
/**
 * @desc    Récupérer tous les clients (avec permissions par rôle)
 * @route   GET /api/clients
 * @access  Privé (Professionnels uniquement)
 */
const getClients = async (req, res) => {
    const { search, serviceType, page = '1', limit = '20' } = req.query;
    const user = req.user;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    let where = {};
    // PERMISSIONS PAR RÔLE
    // MASSOTHERAPEUTE/ESTHETICIENNE: Voir uniquement leurs clients assignés
    if (user.role === 'MASSOTHERAPEUTE' || user.role === 'ESTHETICIENNE') {
        where.assignments = {
            some: {
                professionalId: user.id,
            },
        };
    }
    // SECRETAIRE/ADMIN: Voir tous les clients (pas de restriction)
    // Filtre de recherche
    if (search) {
        where.OR = [
            { nom: { contains: search, mode: 'insensitive' } },
            { prenom: { contains: search, mode: 'insensitive' } },
            { telCellulaire: { contains: search } },
            { courriel: { contains: search, mode: 'insensitive' } },
        ];
    }
    // Filtre par type de service
    if (serviceType && (serviceType === 'MASSOTHERAPIE' || serviceType === 'ESTHETIQUE')) {
        where.serviceType = serviceType;
    }
    // SECRET MÉDICAL: SECRETAIRE ne voit QUE les infos d'identification
    // Les infos médicales restent PRIVÉES entre le client et le professionnel
    const isSecretaire = user.role === 'SECRETAIRE';
    const selectFields = isSecretaire ? {
        // SECRETAIRE: SEULEMENT les infos d'identification (pour assigner)
        id: true,
        nom: true,
        prenom: true,
        telCellulaire: true,
        courriel: true,
        serviceType: true,
        createdAt: true,
        // AUCUNE info médicale, AUCUNE note, AUCUNE préférence
    } : undefined; // MASSOTHERAPEUTE/ESTHETICIENNE/ADMIN: TOUT
    const includeRelations = {
        assignments: {
            include: {
                professional: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                assignedAt: 'desc',
            },
        },
        // Notes: SECRETAIRE ne les voit PAS
        ...(isSecretaire ? {} : {
            notes: {
                select: {
                    id: true,
                    createdAt: true,
                    authorId: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
        }),
    };
    // Récupérer les clients avec pagination (sans tri pour l'instant)
    const [clientsRaw, total] = await Promise.all([
        database_1.default.clientProfile.findMany({
            where,
            ...(selectFields ? { select: { ...selectFields, ...includeRelations } } : { include: includeRelations }),
        }),
        database_1.default.clientProfile.count({ where }),
    ]);
    // Pour MASSOTHERAPEUTE/ESTHETICIENNE: Ajouter assignedAt, hasNoteAfterAssignment et trier par date
    let clients = clientsRaw;
    if (user.role === 'MASSOTHERAPEUTE' || user.role === 'ESTHETICIENNE') {
        // Enrichir chaque client avec la date de la plus récente assignation à ce professionnel
        // ET vérifier si une note a été ajoutée après l'assignation
        clients = clientsRaw.map(client => {
            const myAssignment = client.assignments.find(assignment => assignment.professionalId === user.id);
            const assignedAt = myAssignment?.assignedAt || client.createdAt;
            // Vérifier si le professionnel a ajouté une note APRÈS la date d'assignation
            // Cela détermine si le badge "Nouveau RDV" doit être affiché
            const hasNoteAfterAssignment = client.notes?.some((note) => {
                return (note.authorId === user.id &&
                    new Date(note.createdAt) > new Date(assignedAt));
            }) || false;
            return {
                ...client,
                assignedAt,
                hasNoteAfterAssignment, // true = badge caché, false = badge affiché
            };
        });
        // Trier par assignedAt DESC (plus récent en premier)
        clients.sort((a, b) => {
            return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime();
        });
    }
    else {
        // Pour ADMIN/SECRETAIRE: Trier par createdAt DESC
        clients.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }
    // Appliquer la pagination APRÈS le tri
    const paginatedClients = clients.slice(skip, skip + limitNum);
    // PROTECTION DE LA VIE PRIVÉE: Masquer les infos sensibles pour les massothérapeutes
    const clientsWithPrivacy = paginatedClients.map(client => hideSensitiveClientInfo(client, user.role));
    res.status(200).json({
        success: true,
        data: {
            clients: clientsWithPrivacy,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        },
    });
};
exports.getClients = getClients;
/**
 * @desc    Récupérer un client par ID (avec vérification des permissions)
 * @route   GET /api/clients/:id
 * @access  Privé (Professionnels uniquement)
 */
const getClientById = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    // SECRET MEDICAL: La SECRETAIRE ne peut PAS consulter les dossiers clients (notes médicales)
    if (user.role === 'SECRETAIRE') {
        throw new errorHandler_1.AppError('Accès refusé. Le secret médical vous empêche de consulter les dossiers clients.', 403);
    }
    const client = await database_1.default.clientProfile.findUnique({
        where: { id },
        include: {
            notes: {
                include: {
                    author: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            email: true,
                            role: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
            assignments: {
                include: {
                    professional: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            },
        },
    });
    if (!client) {
        throw new errorHandler_1.AppError('Client non trouvé', 404);
    }
    // VÉRIFICATION DES PERMISSIONS
    // MASSOTHERAPEUTE/ESTHETICIENNE: Vérifier que le client leur est assigné
    if (user.role === 'MASSOTHERAPEUTE' || user.role === 'ESTHETICIENNE') {
        const isAssigned = client.assignments.some((assignment) => assignment.professionalId === user.id);
        if (!isAssigned) {
            throw new errorHandler_1.AppError('Vous n\'avez pas accès à ce dossier client', 403);
        }
    }
    // ADMIN: Accès total
    // PROTECTION DE LA VIE PRIVÉE: Masquer les infos sensibles pour les massothérapeutes
    const clientWithPrivacy = hideSensitiveClientInfo(client, user.role);
    res.status(200).json({
        success: true,
        data: clientWithPrivacy,
    });
};
exports.getClientById = getClientById;
/**
 * @desc    Mettre à jour un client
 * @route   PUT /api/clients/:id
 * @access  Privé (Professionnels)
 */
const updateClient = async (req, res) => {
    const { id } = req.params;
    // Vérifier que le client existe
    const existingClient = await database_1.default.clientProfile.findUnique({
        where: { id },
    });
    if (!existingClient) {
        throw new errorHandler_1.AppError('Client non trouvé', 404);
    }
    // Mettre à jour
    const updatedClient = await database_1.default.clientProfile.update({
        where: { id },
        data: req.body,
    });
    res.status(200).json({
        success: true,
        message: 'Client mis à jour avec succès',
        data: updatedClient,
    });
};
exports.updateClient = updateClient;
/**
 * @desc    Supprimer un client
 * @route   DELETE /api/clients/:id
 * @access  Privé (Professionnels)
 */
const deleteClient = async (req, res) => {
    const { id } = req.params;
    const client = await database_1.default.clientProfile.findUnique({
        where: { id },
    });
    if (!client) {
        throw new errorHandler_1.AppError('Client non trouvé', 404);
    }
    // Supprimer (cascade supprimera aussi l'utilisateur)
    await database_1.default.clientProfile.delete({
        where: { id },
    });
    res.status(200).json({
        success: true,
        message: 'Client supprimé avec succès',
    });
};
exports.deleteClient = deleteClient;
/**
 * @desc    Rechercher des clients
 * @route   GET /api/clients/search/:query
 * @access  Privé (Professionnels)
 */
const searchClients = async (req, res) => {
    const { query } = req.params;
    const user = req.user;
    // SECRET MÉDICAL: SECRETAIRE ne voit QUE les infos d'identification
    const isSecretaire = user.role === 'SECRETAIRE';
    const selectFields = isSecretaire ? {
        // SECRETAIRE: SEULEMENT les infos d'identification
        id: true,
        nom: true,
        prenom: true,
        telCellulaire: true,
        courriel: true,
        serviceType: true,
        createdAt: true,
    } : undefined; // MASSOTHERAPEUTE/ESTHETICIENNE/ADMIN: TOUT
    const clients = await database_1.default.clientProfile.findMany({
        where: {
            OR: [
                { nom: { contains: query, mode: 'insensitive' } },
                { prenom: { contains: query, mode: 'insensitive' } },
                { telCellulaire: { contains: query } },
                { courriel: { contains: query, mode: 'insensitive' } },
            ],
        },
        ...(selectFields ? { select: selectFields } : {}),
        take: 20,
        orderBy: {
            createdAt: 'desc',
        },
    });
    // PROTECTION DE LA VIE PRIVÉE: Masquer les infos sensibles pour les massothérapeutes
    const clientsWithPrivacy = clients.map(client => hideSensitiveClientInfo(client, user.role));
    res.status(200).json({
        success: true,
        data: clientsWithPrivacy,
    });
};
exports.searchClients = searchClients;
//# sourceMappingURL=client.controller.js.map