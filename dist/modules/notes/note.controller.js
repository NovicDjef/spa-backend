"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNote = exports.updateNote = exports.createNote = exports.getNotesByClient = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
// Schéma de validation
const createNoteSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Le contenu de la note est requis'),
});
/**
 * @desc    Récupérer toutes les notes d'un client
 * @route   GET /api/notes/:clientId
 * @access  Privé (Professionnels)
 */
const getNotesByClient = async (req, res) => {
    const { clientId } = req.params;
    // Vérifier que le client existe
    const client = await database_1.default.clientProfile.findUnique({
        where: { id: clientId },
    });
    if (!client) {
        throw new errorHandler_1.AppError('Client non trouvé', 404);
    }
    // Récupérer les notes
    const notes = await database_1.default.note.findMany({
        where: { clientId },
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
    });
    res.status(200).json({
        success: true,
        data: notes,
    });
};
exports.getNotesByClient = getNotesByClient;
/**
 * @desc    Ajouter une note à un dossier client
 * @route   POST /api/notes/:clientId
 * @access  Privé (Professionnels)
 */
const createNote = async (req, res) => {
    const { clientId } = req.params;
    const validatedData = createNoteSchema.parse(req.body);
    // Vérifier que le client existe
    const client = await database_1.default.clientProfile.findUnique({
        where: { id: clientId },
    });
    if (!client) {
        throw new errorHandler_1.AppError('Client non trouvé', 404);
    }
    // Vérifier que le professionnel a accès à ce client (assigné ou ADMIN/SECRETAIRE)
    const user = req.user;
    if (user.role === 'MASSOTHERAPEUTE' || user.role === 'ESTHETICIENNE') {
        // Utiliser findFirst au lieu de findUnique car la contrainte unique a été supprimée
        // pour permettre les ré-assignations multiples
        const assignment = await database_1.default.assignment.findFirst({
            where: {
                clientId,
                professionalId: user.id,
            },
        });
        if (!assignment) {
            throw new errorHandler_1.AppError('Vous n\'avez pas accès à ce dossier client', 403);
        }
    }
    // Créer la note
    const note = await database_1.default.note.create({
        data: {
            content: validatedData.content,
            clientId,
            authorId: req.user.id,
        },
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
    });
    res.status(201).json({
        success: true,
        message: 'Note ajoutée avec succès',
        data: note,
    });
};
exports.createNote = createNote;
/**
 * @desc    Modifier une note
 * @route   PUT /api/notes/:noteId
 * @access  Privé (Professionnels - auteur uniquement, 24h max sauf ADMIN)
 */
const updateNote = async (req, res) => {
    const { noteId } = req.params;
    const { content } = req.body;
    if (!content) {
        throw new errorHandler_1.AppError('Le contenu est requis', 400);
    }
    // Vérifier que la note existe
    const note = await database_1.default.note.findUnique({
        where: { id: noteId },
    });
    if (!note) {
        throw new errorHandler_1.AppError('Note non trouvée', 404);
    }
    const user = req.user;
    // Vérifier que l'utilisateur est l'auteur
    if (note.authorId !== user.id && user.role !== 'ADMIN') {
        throw new errorHandler_1.AppError('Vous ne pouvez modifier que vos propres notes', 403);
    }
    // Vérifier la limite de 24h (sauf pour ADMIN)
    if (user.role !== 'ADMIN') {
        const noteAge = Date.now() - new Date(note.createdAt).getTime();
        const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
        if (noteAge > twentyFourHoursInMs) {
            throw new errorHandler_1.AppError('Vous ne pouvez plus modifier cette note (limite de 24h dépassée)', 403);
        }
    }
    // Mettre à jour
    const updatedNote = await database_1.default.note.update({
        where: { id: noteId },
        data: { content },
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
    });
    res.status(200).json({
        success: true,
        message: 'Note mise à jour avec succès',
        data: updatedNote,
    });
};
exports.updateNote = updateNote;
/**
 * @desc    Supprimer une note
 * @route   DELETE /api/notes/:noteId
 * @access  Privé (Professionnels - auteur uniquement dans les 24h, ADMIN sans limite)
 */
const deleteNote = async (req, res) => {
    const { noteId } = req.params;
    // Vérifier que la note existe
    const note = await database_1.default.note.findUnique({
        where: { id: noteId },
    });
    if (!note) {
        throw new errorHandler_1.AppError('Note non trouvée', 404);
    }
    const user = req.user;
    // Vérifier que l'utilisateur est l'auteur ou ADMIN
    if (note.authorId !== user.id && user.role !== 'ADMIN') {
        throw new errorHandler_1.AppError('Vous ne pouvez supprimer que vos propres notes', 403);
    }
    // Vérifier la limite de 24h (sauf pour ADMIN)
    if (user.role !== 'ADMIN') {
        const noteAge = Date.now() - new Date(note.createdAt).getTime();
        const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
        if (noteAge > twentyFourHoursInMs) {
            throw new errorHandler_1.AppError('Vous ne pouvez plus supprimer cette note (limite de 24h dépassée)', 403);
        }
    }
    // Supprimer
    await database_1.default.note.delete({
        where: { id: noteId },
    });
    res.status(200).json({
        success: true,
        message: 'Note supprimée avec succès',
    });
};
exports.deleteNote = deleteNote;
//# sourceMappingURL=note.controller.js.map