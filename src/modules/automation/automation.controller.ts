import { Request, Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../auth/auth';

/**
 * @desc    Récupérer tous les feedbacks clients avec pagination et filtres (ADMIN)
 * @route   GET /api/automation/feedbacks
 * @access  Privé (ADMIN uniquement)
 */
export const getAllFeedbacks = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', hasResponded, rating } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construire les filtres
    const where: any = {};
    if (hasResponded !== undefined) {
      where.hasResponded = hasResponded === 'true';
    }
    if (rating) {
      where.rating = parseInt(rating as string);
    }

    // Récupérer les feedbacks avec pagination
    const [feedbacks, totalCount] = await Promise.all([
      prisma.clientFeedback.findMany({
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
      prisma.clientFeedback.count({ where })
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
  } catch (error) {
    console.error('Erreur récupération feedbacks:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * @desc    Récupérer les statistiques sur les feedbacks clients (ADMIN)
 * @route   GET /api/automation/feedbacks/stats
 * @access  Privé (ADMIN uniquement)
 */
export const getFeedbackStats = async (req: AuthRequest, res: Response) => {
  try {
    // Récupérer tous les feedbacks
    const allFeedbacks = await prisma.clientFeedback.findMany({
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
  } catch (error) {
    console.error('Erreur récupération stats feedbacks:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * @desc    Récupérer tous les logs d'emails avec pagination et filtres (ADMIN)
 * @route   GET /api/automation/email-logs
 * @access  Privé (ADMIN uniquement)
 */
export const getAllEmailLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', type, clientEmail } = req.query;

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
        mode: 'insensitive'
      };
    }

    // Récupérer les logs avec pagination
    const [logs, totalCount] = await Promise.all([
      prisma.emailLog.findMany({
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
      prisma.emailLog.count({ where })
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
  } catch (error) {
    console.error('Erreur récupération logs emails:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * @desc    Récupérer les statistiques sur les emails envoyés (ADMIN)
 * @route   GET /api/automation/email-logs/stats
 * @access  Privé (ADMIN uniquement)
 */
export const getEmailStats = async (req: AuthRequest, res: Response) => {
  try {
    // Récupérer tous les logs
    const allLogs = await prisma.emailLog.findMany({
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
    const emailsByType: Record<string, number> = {};
    allLogs.forEach(log => {
      emailsByType[log.type] = (emailsByType[log.type] || 0) + 1;
    });

    // Emails envoyés par jour (derniers 7 jours)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const recentEmails = allLogs.filter(log =>
      new Date(log.sentAt) >= sevenDaysAgo
    );

    // Grouper par date
    const emailsByDay: Record<string, number> = {};
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
  } catch (error) {
    console.error('Erreur récupération stats emails:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * @desc    Récupérer un feedback spécifique par ID (ADMIN)
 * @route   GET /api/automation/feedbacks/:id
 * @access  Privé (ADMIN uniquement)
 */
export const getFeedbackById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.clientFeedback.findUnique({
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
  } catch (error) {
    console.error('Erreur récupération feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * @desc    Récupérer les notes avec statut d'email (ADMIN)
 * @route   GET /api/automation/notes
 * @access  Privé (ADMIN uniquement)
 */
export const getNotesWithEmailStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', emailSent } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construire les filtres
    const where: any = {};
    if (emailSent !== undefined) {
      where.emailSent = emailSent === 'true';
    }

    // Récupérer les notes avec pagination
    const [notes, totalCount] = await Promise.all([
      prisma.note.findMany({
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
      prisma.note.count({ where })
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
  } catch (error) {
    console.error('Erreur récupération notes:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
