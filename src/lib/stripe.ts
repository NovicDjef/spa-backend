import Stripe from 'stripe';

// Vérifier si la clé Stripe est définie
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('⚠️  STRIPE_SECRET_KEY n\'est pas défini. Les paiements ne fonctionneront pas.');
  console.warn('   Consultez STRIPE-SETUP.md pour configurer Stripe.');
}

// Initialiser Stripe (ou créer un mock si la clé n'est pas définie)
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null as any; // Mock pour permettre au serveur de démarrer sans Stripe

// Taux de taxes du Québec
export const TPS_RATE = 0.05; // 5%
export const TVQ_RATE = 0.09975; // 9.975%

/**
 * Calculer les taxes et le total
 * @param subtotal - Montant avant taxes
 * @param isGiftCard - Si c'est une carte cadeau (pas de taxes)
 */
export function calculateTaxes(subtotal: number, isGiftCard: boolean = false) {
  if (isGiftCard) {
    return {
      taxTPS: 0,
      taxTVQ: 0,
      total: subtotal,
    };
  }

  const taxTPS = subtotal * TPS_RATE;
  const taxTVQ = subtotal * TVQ_RATE;
  const total = subtotal + taxTPS + taxTVQ;

  return {
    taxTPS: Math.round(taxTPS * 100) / 100, // Arrondir à 2 décimales
    taxTVQ: Math.round(taxTVQ * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Convertir un montant en cents pour Stripe
 * Stripe utilise les plus petites unités (cents pour CAD)
 */
export function toStripeAmount(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convertir un montant Stripe (cents) en dollars
 */
export function fromStripeAmount(amount: number): number {
  return amount / 100;
}

/**
 * Créer un Payment Intent Stripe
 */
export async function createPaymentIntent(
  amount: number,
  metadata: Record<string, string>,
  customerEmail?: string
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: toStripeAmount(amount),
    currency: 'cad',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
    receipt_email: customerEmail,
  });

  return paymentIntent;
}

/**
 * Créer ou récupérer un client Stripe
 */
export async function getOrCreateStripeCustomer(
  email: string,
  name?: string,
  phone?: string
) {
  // Rechercher si le client existe déjà
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Créer un nouveau client
  const customer = await stripe.customers.create({
    email,
    name,
    phone,
  });

  return customer;
}

/**
 * Créer un remboursement
 */
export async function createRefund(paymentIntentId: string, reason?: string) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    reason: reason as Stripe.RefundCreateParams.Reason,
  });

  return refund;
}

/**
 * Vérifier la signature d'un webhook Stripe
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET est manquant');
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    return event;
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error}`);
  }
}
