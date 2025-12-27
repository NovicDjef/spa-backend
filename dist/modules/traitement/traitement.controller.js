"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTraitement = exports.updateTraitement = exports.createTraitement = exports.getTraitementsByClient = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
// Schéma de validation
const createTraitementSchema = zod_1.z.object({
    date: zod_1.z.string().optional(),
    soin: zod_1.z.string().min(1, 'Le type de soin est requis'),
    remarque: zod_1.z.string().optional(),
    prescription: zod_1.z.string().optional(),
});
/**
 * @desc    Récupérer tous les traitements d'un client
 * @route   GET /api/traitements/:clientId
 * @access  Privé (Professionnels)
 */
const getTraitementsByClient = async (req, res) => {
    const { clientId } = req.params;
    // Vérifier que le client existe
    const client = await database_1.default.clientProfile.findUnique({
        where: { id: clientId },
    });
    if (!client) {
        throw new errorHandler_1.AppError('Client non trouvé', 404);
    }
    // Récupérer les traitements
    const traitements = await database_1.default.traitement.findMany({
        where: { clientId },
        orderBy: {
            date: 'desc',
        },
    });
    res.status(200).json({
        success: true,
        data: traitements,
    });
};
exports.getTraitementsByClient = getTraitementsByClient;
/**
 * @desc    Ajouter un traitement à un dossier client
 * @route   POST /api/traitements/:clientId
 * @access  Privé (Professionnels)
 */
const createTraitement = async (req, res) => {
    const { clientId } = req.params;
    const validatedData = createTraitementSchema.parse(req.body);
    // Vérifier que le client existe
    const client = await database_1.default.clientProfile.findUnique({
        where: { id: clientId },
    });
    if (!client) {
        throw new errorHandler_1.AppError('Client non trouvé', 404);
    }
    // Créer le traitement
    const traitement = await database_1.default.traitement.create({
        data: {
            date: validatedData.date ? new Date(validatedData.date) : new Date(),
            soin: validatedData.soin,
            remarque: validatedData.remarque,
            prescription: validatedData.prescription,
            clientId,
        },
    });
    res.status(201).json({
        success: true,
        message: 'Traitement ajouté avec succès',
        data: traitement,
    });
};
exports.createTraitement = createTraitement;
/**
 * @desc    Modifier un traitement
 * @route   PUT /api/traitements/:traitementId
 * @access  Privé (Professionnels)
 */
const updateTraitement = async (req, res) => {
    const { traitementId } = req.params;
    // Vérifier que le traitement existe
    const traitement = await database_1.default.traitement.findUnique({
        where: { id: traitementId },
    });
    if (!traitement) {
        throw new errorHandler_1.AppError('Traitement non trouvé', 404);
    }
    // Mettre à jour
    const updatedTraitement = await database_1.default.traitement.update({
        where: { id: traitementId },
        data: {
            ...(req.body.date && { date: new Date(req.body.date) }),
            ...(req.body.soin && { soin: req.body.soin }),
            ...(req.body.remarque !== undefined && { remarque: req.body.remarque }),
            ...(req.body.prescription !== undefined && { prescription: req.body.prescription }),
        },
    });
    res.status(200).json({
        success: true,
        message: 'Traitement mis à jour avec succès',
        data: updatedTraitement,
    });
};
exports.updateTraitement = updateTraitement;
/**
 * @desc    Supprimer un traitement
 * @route   DELETE /api/traitements/:traitementId
 * @access  Privé (Professionnels)
 */
const deleteTraitement = async (req, res) => {
    const { traitementId } = req.params;
    // Vérifier que le traitement existe
    const traitement = await database_1.default.traitement.findUnique({
        where: { id: traitementId },
    });
    if (!traitement) {
        throw new errorHandler_1.AppError('Traitement non trouvé', 404);
    }
    // Supprimer
    await database_1.default.traitement.delete({
        where: { id: traitementId },
    });
    res.status(200).json({
        success: true,
        message: 'Traitement supprimé avec succès',
    });
};
exports.deleteTraitement = deleteTraitement;
//# sourceMappingURL=traitement.controller.js.map