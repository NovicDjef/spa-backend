import { Request, Response } from 'express';
/**
 * @desc    Gérer les webhooks Stripe
 * @route   POST /api/payments/webhook
 * @access  Public (mais sécurisé par signature Stripe)
 */
export declare const handleStripeWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=webhook.controller.d.ts.map