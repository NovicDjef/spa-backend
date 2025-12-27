"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TVQ_RATE = exports.TPS_RATE = exports.stripe = void 0;
exports.calculateTaxes = calculateTaxes;
exports.toStripeAmount = toStripeAmount;
exports.fromStripeAmount = fromStripeAmount;
exports.createPaymentIntent = createPaymentIntent;
exports.getOrCreateStripeCustomer = getOrCreateStripeCustomer;
exports.createRefund = createRefund;
exports.constructWebhookEvent = constructWebhookEvent;
const stripe_1 = __importDefault(require("stripe"));
// Vérifier si la clé Stripe est définie
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    console.warn('⚠️  STRIPE_SECRET_KEY n\'est pas défini. Les paiements ne fonctionneront pas.');
    console.warn('   Consultez STRIPE-SETUP.md pour configurer Stripe.');
}
// Initialiser Stripe (ou créer un mock si la clé n'est pas définie)
exports.stripe = stripeSecretKey
    ? new stripe_1.default(stripeSecretKey, {
        apiVersion: '2025-12-15.clover',
        typescript: true,
    })
    : null; // Mock pour permettre au serveur de démarrer sans Stripe
// Taux de taxes du Québec
exports.TPS_RATE = 0.05; // 5%
exports.TVQ_RATE = 0.09975; // 9.975%
/**
 * Calculer les taxes et le total
 * @param subtotal - Montant avant taxes
 * @param isGiftCard - Si c'est une carte cadeau (pas de taxes)
 */
function calculateTaxes(subtotal, isGiftCard = false) {
    if (isGiftCard) {
        return {
            taxTPS: 0,
            taxTVQ: 0,
            total: subtotal,
        };
    }
    const taxTPS = subtotal * exports.TPS_RATE;
    const taxTVQ = subtotal * exports.TVQ_RATE;
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
function toStripeAmount(amount) {
    return Math.round(amount * 100);
}
/**
 * Convertir un montant Stripe (cents) en dollars
 */
function fromStripeAmount(amount) {
    return amount / 100;
}
/**
 * Créer un Payment Intent Stripe
 */
async function createPaymentIntent(amount, metadata, customerEmail) {
    const paymentIntent = await exports.stripe.paymentIntents.create({
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
async function getOrCreateStripeCustomer(email, name, phone) {
    // Rechercher si le client existe déjà
    const existingCustomers = await exports.stripe.customers.list({
        email,
        limit: 1,
    });
    if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
    }
    // Créer un nouveau client
    const customer = await exports.stripe.customers.create({
        email,
        name,
        phone,
    });
    return customer;
}
/**
 * Créer un remboursement
 */
async function createRefund(paymentIntentId, reason) {
    const refund = await exports.stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: reason,
    });
    return refund;
}
/**
 * Vérifier la signature d'un webhook Stripe
 */
function constructWebhookEvent(payload, signature) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET est manquant');
    }
    try {
        const event = exports.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        return event;
    }
    catch (error) {
        throw new Error(`Webhook signature verification failed: ${error}`);
    }
}
//# sourceMappingURL=stripe.js.map