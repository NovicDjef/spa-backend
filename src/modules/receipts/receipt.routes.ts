import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import {
  createReceipt,
  createAndSendReceipt,
  getReceipts,
  getReceiptById,
  resendReceipt,
  getMassageServices,
  previewReceipt,
  getReceiptPDF,
} from './receipt.controller';

const router = Router();

/**
 * @route   GET /api/receipts/massage-services
 * @desc    Récupérer la liste des services de massage avec leurs prix
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.get(
  '/massage-services',
  authenticate,
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'),
  asyncHandler(getMassageServices)
);

/**
 * @route   POST /api/receipts/preview
 * @desc    Générer un aperçu du reçu PDF sans le sauvegarder ni l'envoyer
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.post(
  '/preview',
  authenticate,
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'),
  asyncHandler(previewReceipt)
);

/**
 * @route   POST /api/receipts/send
 * @desc    Créer un reçu et l'envoyer au client (après prévisualisation)
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.post(
  '/send',
  authenticate,
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'),
  asyncHandler(createAndSendReceipt)
);

/**
 * @route   POST /api/receipts
 * @desc    Créer un reçu d'assurance et l'envoyer au client (OLD - rétrocompatibilité)
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.post(
  '/',
  authenticate,
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'),
  asyncHandler(createReceipt)
);

/**
 * @route   GET /api/receipts
 * @desc    Récupérer tous les reçus créés par le thérapeute
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.get(
  '/',
  authenticate,
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'),
  asyncHandler(getReceipts)
);

/**
 * @route   GET /api/receipts/:id/pdf
 * @desc    Générer et afficher le PDF d'un reçu existant
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.get(
  '/:id/pdf',
  authenticate,
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'),
  asyncHandler(getReceiptPDF)
);

/**
 * @route   GET /api/receipts/:id
 * @desc    Récupérer un reçu par ID
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.get(
  '/:id',
  authenticate,
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'),
  asyncHandler(getReceiptById)
);

/**
 * @route   POST /api/receipts/:id/resend
 * @desc    Renvoyer un reçu par email au client (si déjà envoyé)
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
router.post(
  '/:id/resend',
  authenticate,
  authorize('MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'),
  asyncHandler(resendReceipt)
);

export default router;
