import { Response } from 'express';
import { AuthRequest } from '../auth/auth';
/**
 * @desc    Créer un reçu et l'envoyer au client (après prévisualisation)
 * @route   POST /api/receipts/send
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export declare const createAndSendReceipt: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Créer un reçu d'assurance et l'envoyer au client (OLD - conservé pour rétrocompatibilité)
 * @route   POST /api/receipts
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export declare const createReceipt: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer tous les reçus créés par un thérapeute
 * @route   GET /api/receipts
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export declare const getReceipts: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer un reçu par ID
 * @route   GET /api/receipts/:id
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export declare const getReceiptById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @desc    Renvoyer un reçu par email
 * @route   POST /api/receipts/:id/resend
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export declare const resendReceipt: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer la liste des services de massage avec leurs prix
 * @route   GET /api/receipts/massage-services
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export declare const getMassageServices: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Générer un aperçu du reçu PDF sans le sauvegarder ni l'envoyer
 * @route   POST /api/receipts/preview
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export declare const previewReceipt: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Générer et afficher le PDF d'un reçu existant
 * @route   GET /api/receipts/:id/pdf
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export declare const getReceiptPDF: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=receipt.controller.d.ts.map