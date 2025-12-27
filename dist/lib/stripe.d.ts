import Stripe from 'stripe';
export declare const stripe: any;
export declare const TPS_RATE = 0.05;
export declare const TVQ_RATE = 0.09975;
/**
 * Calculer les taxes et le total
 * @param subtotal - Montant avant taxes
 * @param isGiftCard - Si c'est une carte cadeau (pas de taxes)
 */
export declare function calculateTaxes(subtotal: number, isGiftCard?: boolean): {
    taxTPS: number;
    taxTVQ: number;
    total: number;
};
/**
 * Convertir un montant en cents pour Stripe
 * Stripe utilise les plus petites unités (cents pour CAD)
 */
export declare function toStripeAmount(amount: number): number;
/**
 * Convertir un montant Stripe (cents) en dollars
 */
export declare function fromStripeAmount(amount: number): number;
/**
 * Créer un Payment Intent Stripe
 */
export declare function createPaymentIntent(amount: number, metadata: Record<string, string>, customerEmail?: string): Promise<any>;
/**
 * Créer ou récupérer un client Stripe
 */
export declare function getOrCreateStripeCustomer(email: string, name?: string, phone?: string): Promise<any>;
/**
 * Créer un remboursement
 */
export declare function createRefund(paymentIntentId: string, reason?: string): Promise<any>;
/**
 * Vérifier la signature d'un webhook Stripe
 */
export declare function constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event;
//# sourceMappingURL=stripe.d.ts.map