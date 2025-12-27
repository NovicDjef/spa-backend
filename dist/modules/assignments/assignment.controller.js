"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAssignments = exports.getProfessionalAssignments = exports.getClientAssignments = exports.removeAssignment = exports.assignClient = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
// Schéma de validation pour l'assignation
const assignmentSchema = zod_1.z.object({
    clientId: zod_1.z.string().min(1, 'L\'ID du client est requis'),
    professionalId: zod_1.z.string().min(1, 'L\'ID du professionnel est requis'),
});
/**
 * @desc    Assigner un client à un professionnel
 * @route   POST /api/assignments
 * @access  Privé (SECRETAIRE, ADMIN uniquement)
 */
const assignClient = async (req, res) => {
    // Validation
    const validatedData = assignmentSchema.parse(req.body);
    // Vérifier que le client existe
    const client = await database_1.default.clientProfile.findUnique({
        where: { id: validatedData.clientId },
    });
    if (!client) {
        throw new errorHandler_1.AppError('Client non trouvé', 404);
    }
    // Vérifier que le professionnel existe
    const professional = await database_1.default.user.findUnique({
        where: { id: validatedData.professionalId },
    });
    if (!professional) {
        throw new errorHandler_1.AppError('Professionnel non trouvé', 404);
    }
    // Vérifier que le professionnel n'est pas SECRETAIRE
    if (professional.role === 'SECRETAIRE') {
        throw new errorHandler_1.AppError('Impossible d\'assigner un client à une secrétaire', 400);
    }
    // Vérifier la cohérence service/rôle
    if (client.serviceType === 'MASSOTHERAPIE' &&
        professional.role !== 'MASSOTHERAPEUTE' &&
        professional.role !== 'ADMIN') {
        throw new errorHandler_1.AppError('Un client massothérapie doit être assigné à un massothérapeute', 400);
    }
    if (client.serviceType === 'ESTHETIQUE' &&
        professional.role !== 'ESTHETICIENNE' &&
        professional.role !== 'ADMIN') {
        throw new errorHandler_1.AppError('Un client esthétique doit être assigné à une esthéticienne', 400);
    }
    // Créer une NOUVELLE assignation (permet les ré-assignations)
    // Chaque assignation crée un nouvel enregistrement avec une nouvelle date assignedAt
    // Cela permet au professionnel de voir les "nouveaux rendez-vous" en haut de sa liste
    const assignment = await database_1.default.assignment.create({
        data: {
            clientId: validatedData.clientId,
            professionalId: validatedData.professionalId,
            createdById: req.user.id, // Enregistrer qui a créé cette assignation
        },
        include: {
            client: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    serviceType: true,
                },
            },
            professional: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                    role: true,
                },
            },
            createdBy: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
    res.status(201).json({
        success: true,
        message: 'Client assigné avec succès',
        data: assignment,
    });
};
exports.assignClient = assignClient;
/**
 * @desc    Supprimer la plus récente assignation d'un client à un professionnel
 * @route   DELETE /api/assignments/:clientId/:professionalId
 * @access  Privé (SECRETAIRE, ADMIN uniquement)
 * @note    Supprime uniquement la plus récente assignation. Pour supprimer toutes les assignations,
 *          appelez cette route plusieurs fois ou utilisez DELETE /api/assignments/all/:clientId/:professionalId
 */
const removeAssignment = async (req, res) => {
    const { clientId, professionalId } = req.params;
    // Trouver la plus récente assignation pour ce client-professionnel
    const assignment = await database_1.default.assignment.findFirst({
        where: {
            clientId,
            professionalId,
        },
        orderBy: {
            assignedAt: 'desc',
        },
    });
    if (!assignment) {
        throw new errorHandler_1.AppError('Aucune assignation trouvée pour ce client et ce professionnel', 404);
    }
    // Supprimer cette assignation spécifique
    await database_1.default.assignment.delete({
        where: {
            id: assignment.id,
        },
    });
    res.status(200).json({
        success: true,
        message: 'Assignation supprimée avec succès',
    });
};
exports.removeAssignment = removeAssignment;
/**
 * @desc    Récupérer toutes les assignations d'un client
 * @route   GET /api/assignments/client/:clientId
 * @access  Privé (SECRETAIRE, ADMIN uniquement)
 */
const getClientAssignments = async (req, res) => {
    const { clientId } = req.params;
    const assignments = await database_1.default.assignment.findMany({
        where: { clientId },
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
            createdBy: {
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
            assignedAt: 'desc',
        },
    });
    res.status(200).json({
        success: true,
        data: assignments,
    });
};
exports.getClientAssignments = getClientAssignments;
/**
 * @desc    Récupérer tous les clients assignés à un professionnel
 * @route   GET /api/assignments/professional/:professionalId
 * @access  Privé (Le professionnel lui-même, ou SECRETAIRE/ADMIN)
 */
const getProfessionalAssignments = async (req, res) => {
    const { professionalId } = req.params;
    const user = req.user;
    // Vérifier les permissions: le professionnel peut voir ses propres assignations
    // La secrétaire et l'admin peuvent voir les assignations de tous
    if (user.id !== professionalId &&
        user.role !== 'SECRETAIRE' &&
        user.role !== 'ADMIN') {
        throw new errorHandler_1.AppError('Vous n\'avez pas accès à ces informations', 403);
    }
    const assignments = await database_1.default.assignment.findMany({
        where: { professionalId },
        include: {
            client: true,
            createdBy: {
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
            assignedAt: 'desc',
        },
    });
    res.status(200).json({
        success: true,
        data: assignments,
    });
};
exports.getProfessionalAssignments = getProfessionalAssignments;
/**
 * @desc    Récupérer TOUTES les assignations (pour admin/secrétaire)
 * @route   GET /api/assignments
 * @access  Privé (SECRETAIRE, ADMIN uniquement)
 */
const getAllAssignments = async (_req, res) => {
    // Récupérer toutes les assignations avec les informations du client, du professionnel et du créateur
    const assignments = await database_1.default.assignment.findMany({
        include: {
            client: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    courriel: true,
                    telCellulaire: true,
                    serviceType: true,
                },
            },
            professional: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                    role: true,
                },
            },
            createdBy: {
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
            assignedAt: 'desc', // Les plus récentes en haut
        },
    });
    res.status(200).json({
        success: true,
        data: assignments,
        total: assignments.length,
    });
};
exports.getAllAssignments = getAllAssignments;
//# sourceMappingURL=assignment.controller.js.map