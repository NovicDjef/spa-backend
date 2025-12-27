"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotesWithEmailStatus = exports.getFeedbackById = exports.getEmailStats = exports.getAllEmailLogs = exports.getFeedbackStats = exports.getAllFeedbacks = void 0;
const database_1 = __importDefault(require("../../config/database"));
/**
 * @desc    Récupérer tous les feedbacks clients avec pagination et filtres (ADMIN)
 * @route   GET /api/automation/feedbacks
 * @access  Privé (ADMIN uniquement)
 */
const getAllFeedbacks = async (req, res) => {
    try {
        const { page = '1', limit = '20', hasResponded, rating } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Construire les filtres
        const where = {};
        if (hasResponded !== undefined) {
            where.hasResponded = hasResponded === 'true';
        }
        if (rating) {
            where.rating = parseInt(rating);
        }
        // Récupérer les feedbacks avec pagination
        const [feedbacks, totalCount] = await Promise.all([
            database_1.default.clientFeedback.findMany({
                where,
                select: {
                    id: true,
                    token: true,
                    noteId: true,
                    clientEmail: true,
                    clientName: true,
                    rating: true,
                    comment: true,
                    wouldReturn: true,
                    wouldRecommend: true,
                    hasResponded: true,
                    respondedAt: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum
            }),
            database_1.default.clientFeedback.count({ where })
        ]);
        const totalPages = Math.ceil(totalCount / limitNum);
        return res.json({
            success: true,
            data: {
                feedbacks,
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
    }
    catch (error) {
        console.error('Erreur récupération feedbacks:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};
exports.getAllFeedbacks = getAllFeedbacks;
/**
 * @desc    Récupérer les statistiques sur les feedbacks clients (ADMIN)
 * @route   GET /api/automation/feedbacks/stats
 * @access  Privé (ADMIN uniquement)
 */
const getFeedbackStats = async (req, res) => {
    try {
        // Récupérer tous les feedbacks
        const allFeedbacks = await database_1.default.clientFeedback.findMany({
            select: {
                rating: true,
                hasResponded: true,
                wouldReturn: true,
                wouldRecommend: true
            }
        });
        const totalFeedbacksSent = allFeedbacks.length;
        const totalResponded = allFeedbacks.filter(f => f.hasResponded).length;
        const responseRate = totalFeedbacksSent > 0
            ? (totalResponded / totalFeedbacksSent) * 100
            : 0;
        // Calculer la moyenne des notes
        const respondedFeedbacks = allFeedbacks.filter(f => f.hasResponded && f.rating);
        const averageRating = respondedFeedbacks.length > 0
            ? respondedFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / respondedFeedbacks.length
            : 0;
        // Calculer les statistiques wouldReturn et wouldRecommend
        const wouldReturnCount = allFeedbacks.filter(f => f.wouldReturn === true).length;
        const wouldRecommendCount = allFeedbacks.filter(f => f.wouldRecommend === true).length;
        // Distribution des notes
        const ratingDistribution = {
            1: respondedFeedbacks.filter(f => f.rating === 1).length,
            2: respondedFeedbacks.filter(f => f.rating === 2).length,
            3: respondedFeedbacks.filter(f => f.rating === 3).length,
            4: respondedFeedbacks.filter(f => f.rating === 4).length,
            5: respondedFeedbacks.filter(f => f.rating === 5).length
        };
        return res.json({
            success: true,
            data: {
                totalFeedbacksSent,
                totalResponded,
                responseRate: Math.round(responseRate * 10) / 10,
                averageRating: Math.round(averageRating * 10) / 10,
                wouldReturnCount,
                wouldReturnRate: totalResponded > 0
                    ? Math.round((wouldReturnCount / totalResponded) * 100 * 10) / 10
                    : 0,
                wouldRecommendCount,
                wouldRecommendRate: totalResponded > 0
                    ? Math.round((wouldRecommendCount / totalResponded) * 100 * 10) / 10
                    : 0,
                ratingDistribution
            }
        });
    }
    catch (error) {
        console.error('Erreur récupération stats feedbacks:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};
exports.getFeedbackStats = getFeedbackStats;
/**
 * @desc    Récupérer tous les logs d'emails avec pagination et filtres (ADMIN)
 * @route   GET /api/automation/email-logs
 * @access  Privé (ADMIN uniquement)
 */
const getAllEmailLogs = async (req, res) => {
    try {
        const { page = '1', limit = '20', type, clientEmail } = req.query;
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
                mode: 'insensitive'
            };
        }
        // Récupérer les logs avec pagination
        const [logs, totalCount] = await Promise.all([
            database_1.default.emailLog.findMany({
                where,
                select: {
                    id: true,
                    type: true,
                    clientEmail: true,
                    clientName: true,
                    subject: true,
                    noteId: true,
                    promotionId: true,
                    sentAt: true,
                    opened: true,
                    clicked: true
                },
                orderBy: { sentAt: 'desc' },
                skip,
                take: limitNum
            }),
            database_1.default.emailLog.count({ where })
        ]);
        const totalPages = Math.ceil(totalCount / limitNum);
        return res.json({
            success: true,
            data: {
                logs,
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
    }
    catch (error) {
        console.error('Erreur récupération logs emails:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};
exports.getAllEmailLogs = getAllEmailLogs;
/**
 * @desc    Récupérer les statistiques sur les emails envoyés (ADMIN)
 * @route   GET /api/automation/email-logs/stats
 * @access  Privé (ADMIN uniquement)
 */
const getEmailStats = async (req, res) => {
    try {
        // Récupérer tous les logs
        const allLogs = await database_1.default.emailLog.findMany({
            select: {
                type: true,
                opened: true,
                clicked: true,
                sentAt: true
            }
        });
        const totalEmailsSent = allLogs.length;
        const totalOpened = allLogs.filter(log => log.opened).length;
        const totalClicked = allLogs.filter(log => log.clicked).length;
        const openRate = totalEmailsSent > 0
            ? (totalOpened / totalEmailsSent) * 100
            : 0;
        const clickRate = totalEmailsSent > 0
            ? (totalClicked / totalEmailsSent) * 100
            : 0;
        // Distribution par type
        const emailsByType = {};
        allLogs.forEach(log => {
            emailsByType[log.type] = (emailsByType[log.type] || 0) + 1;
        });
        // Emails envoyés par jour (derniers 7 jours)
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        const recentEmails = allLogs.filter(log => new Date(log.sentAt) >= sevenDaysAgo);
        // Grouper par date
        const emailsByDay = {};
        recentEmails.forEach(log => {
            const date = new Date(log.sentAt).toISOString().split('T')[0];
            emailsByDay[date] = (emailsByDay[date] || 0) + 1;
        });
        return res.json({
            success: true,
            data: {
                totalEmailsSent,
                totalOpened,
                totalClicked,
                openRate: Math.round(openRate * 10) / 10,
                clickRate: Math.round(clickRate * 10) / 10,
                emailsByType,
                emailsByDay,
                last7DaysCount: recentEmails.length
            }
        });
    }
    catch (error) {
        console.error('Erreur récupération stats emails:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};
exports.getEmailStats = getEmailStats;
/**
 * @desc    Récupérer un feedback spécifique par ID (ADMIN)
 * @route   GET /api/automation/feedbacks/:id
 * @access  Privé (ADMIN uniquement)
 */
const getFeedbackById = async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await database_1.default.clientFeedback.findUnique({
            where: { id },
            select: {
                id: true,
                token: true,
                noteId: true,
                clientEmail: true,
                clientName: true,
                rating: true,
                comment: true,
                wouldReturn: true,
                wouldRecommend: true,
                hasResponded: true,
                respondedAt: true,
                createdAt: true
            }
        });
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback introuvable'
            });
        }
        return res.json({
            success: true,
            data: feedback
        });
    }
    catch (error) {
        console.error('Erreur récupération feedback:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};
exports.getFeedbackById = getFeedbackById;
/**
 * @desc    Récupérer les notes avec statut d'email (ADMIN)
 * @route   GET /api/automation/notes
 * @access  Privé (ADMIN uniquement)
 */
const getNotesWithEmailStatus = async (req, res) => {
    try {
        const { page = '1', limit = '20', emailSent } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Construire les filtres
        const where = {};
        if (emailSent !== undefined) {
            where.emailSent = emailSent === 'true';
        }
        // Récupérer les notes avec pagination
        const [notes, totalCount] = await Promise.all([
            database_1.default.note.findMany({
                where,
                select: {
                    id: true,
                    content: true,
                    emailSent: true,
                    emailSentAt: true,
                    feedbackToken: true,
                    createdAt: true,
                    client: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            courriel: true
                        }
                    },
                    author: {
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
            database_1.default.note.count({ where })
        ]);
        const totalPages = Math.ceil(totalCount / limitNum);
        return res.json({
            success: true,
            data: {
                notes,
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
    }
    catch (error) {
        console.error('Erreur récupération notes:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};
exports.getNotesWithEmailStatus = getNotesWithEmailStatus;
//# sourceMappingURL=automation.controller.js.map