import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import {
  getAllFeedbacks,
  getFeedbackStats,
  getFeedbackById,
  getAllEmailLogs,
  getEmailStats,
  getNotesWithEmailStatus
} from './automation.controller';

const router = Router();

// Toutes les routes sont protégées - ADMIN uniquement

// Routes pour les feedbacks clients
router.get(
  '/feedbacks/stats',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(getFeedbackStats)
);

router.get(
  '/feedbacks/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(getFeedbackById)
);

router.get(
  '/feedbacks',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(getAllFeedbacks)
);

// Routes pour les logs d'emails
router.get(
  '/email-logs/stats',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(getEmailStats)
);

router.get(
  '/email-logs',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(getAllEmailLogs)
);

// Routes pour les notes avec statut d'email
router.get(
  '/notes',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(getNotesWithEmailStatus)
);

export default router;
