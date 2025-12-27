"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewsByProfessional = exports.getAllReviews = exports.createReview = void 0;
const zod_1 = require("zod");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const database_1 = __importDefault(require("../../config/database"));
// Schéma de validation pour la création d'un avis
const createReviewSchema = zod_1.z.object({
    professionalId: zod_1.z.string(),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().max(1000).optional()
});
/**
 * @desc    Créer un avis anonyme (PUBLIC)
 * @route   POST /api/reviews
 * @access  Public
 */
const createReview = async (req, res) => {
    try {
        // Validation
        const data = createReviewSchema.parse(req.body);
        // Vérifier que le professionnel existe et est actif
        const professional = await database_1.default.user.findUnique({
            where: { id: data.professionalId },
            select: { id: true, isActive: true, role: true }
        });
        if (!professional) {
            return res.status(404).json({
                success: false,
                message: 'Professionnel introuvable'
            });
        }
        if (!professional.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Ce professionnel n\'est plus actif'
            });
        }
        if (!['MASSOTHERAPEUTE', 'ESTHETICIENNE'].includes(professional.role)) {
            return res.status(400).json({
                success: false,
                message: 'Seuls les massothérapeutes et esthéticiennes peuvent recevoir des avis'
            });
        }
        // Sanitize le commentaire
        const sanitizedComment = data.comment
            ? (0, sanitize_html_1.default)(data.comment, { allowedTags: [], allowedAttributes: {} })
            : null;
        // Créer l'avis
        const review = await database_1.default.review.create({
            data: {
                professionalId: data.professionalId,
                rating: data.rating,
                comment: sanitizedComment,
                isAnonymous: true
            },
            select: {
                id: true,
                rating: true,
                createdAt: true
            }
        });
        return res.status(201).json({
            success: true,
            message: 'Avis enregistré avec succès',
            data: review
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: error.errors
            });
        }
        console.error('Erreur création avis:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};
exports.createReview = createReview;
/**
 * @desc    Récupérer tous les avis avec pagination et filtres (ADMIN)
 * @route   GET /api/reviews
 * @access  Privé (ADMIN uniquement)
 */
const getAllReviews = async (req, res) => {
    const { page = '1', limit = '20', professionalId, rating } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    // Construire les filtres
    const where = {};
    if (professionalId) {
        where.professionalId = professionalId;
    }
    if (rating) {
        where.rating = parseInt(rating);
    }
    // Récupérer les avis avec pagination
    const [reviews, totalCount] = await Promise.all([
        database_1.default.review.findMany({
            where,
            select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                professional: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNum
        }),
        database_1.default.review.count({ where })
    ]);
    const totalPages = Math.ceil(totalCount / limitNum);
    return res.json({
        success: true,
        data: {
            reviews,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount,
                limit: limitNum,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            }
        }
    });
};
exports.getAllReviews = getAllReviews;
/**
 * @desc    Récupérer les avis et statistiques d'un professionnel (PUBLIC)
 * @route   GET /api/reviews/:professionalId
 * @access  Public
 */
const getReviewsByProfessional = async (req, res) => {
    const { professionalId } = req.params;
    const reviews = await database_1.default.review.findMany({
        where: { professionalId },
        select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;
    return res.json({
        success: true,
        data: {
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
            reviews
        }
    });
};
exports.getReviewsByProfessional = getReviewsByProfessional;
//# sourceMappingURL=review.controller.js.map