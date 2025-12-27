"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundPayment = exports.confirmPayment = exports.createGymSubscriptionPaymentIntent = exports.createGiftCardPaymentIntent = exports.createBookingPaymentIntent = void 0;
const database_1 = __importDefault(require("../../config/database"));
const stripe_1 = require("../../lib/stripe");
/**
 * @desc    Créer un Payment Intent pour une réservation
 * @route   POST /api/payments/create-intent/booking
 * @access  Public
 */
const createBookingPaymentIntent = async (req, res) => {
    const { serviceId, packageId, professionalId, clientName, clientEmail, clientPhone, bookingDate, startTime, endTime, specialNotes, } = req.body;
    // Validation
    if (!clientName || !clientEmail || !bookingDate || !startTime || !endTime) {
        return res.status(400).json({
            success: false,
            message: 'Informations client et horaires sont requis',
        });
    }
    if (!serviceId && !packageId) {
        return res.status(400).json({
            success: false,
            message: 'Un service ou un forfait doit être sélectionné',
        });
    }
    // Récupérer le service ou le forfait
    let subtotal = 0;
    let itemName = '';
    let service = null;
    let packageItem = null;
    if (serviceId) {
        service = await database_1.default.service.findUnique({
            where: { id: serviceId },
            include: { category: true },
        });
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service non trouvé',
            });
        }
        subtotal = parseFloat(service.price.toString());
        itemName = service.name;
    }
    else if (packageId) {
        packageItem = await database_1.default.package.findUnique({
            where: { id: packageId },
        });
        if (!packageItem) {
            return res.status(404).json({
                success: false,
                message: 'Forfait non trouvé',
            });
        }
        subtotal = parseFloat(packageItem.price.toString());
        itemName = `${packageItem.name}${packageItem.variant ? ` - ${packageItem.variant}` : ''}`;
    }
    // Calculer les taxes
    const { taxTPS, taxTVQ, total } = (0, stripe_1.calculateTaxes)(subtotal, false);
    // Créer ou récupérer le client Stripe
    const stripeCustomer = await (0, stripe_1.getOrCreateStripeCustomer)(clientEmail, clientName, clientPhone);
    // Créer le Payment Intent
    const paymentIntent = await (0, stripe_1.createPaymentIntent)(total, {
        type: 'booking',
        serviceId: serviceId || '',
        packageId: packageId || '',
        professionalId: professionalId || '',
        clientName,
        clientEmail,
        bookingDate,
        startTime,
        endTime,
    }, clientEmail);
    // Créer la réservation avec statut PENDING et le paiement
    const targetDate = new Date(bookingDate);
    targetDate.setHours(0, 0, 0, 0);
    const bookingNumber = `BK${Date.now()}`;
    const booking = await database_1.default.booking.create({
        data: {
            bookingNumber,
            type: serviceId ? 'SERVICE' : 'PACKAGE',
            professionalId,
            serviceId,
            packageId,
            clientName,
            clientPhone,
            clientEmail,
            bookingDate: targetDate,
            startTime,
            endTime,
            specialNotes,
            status: 'PENDING',
            subtotal,
            taxTPS,
            taxTVQ,
            total,
            payment: {
                create: {
                    stripePaymentId: paymentIntent.id,
                    stripeCustomerId: stripeCustomer.id,
                    amount: total,
                    status: 'PENDING',
                    paymentMethod: 'card',
                },
            },
        },
        include: {
            service: true,
            package: true,
            payment: true,
        },
    });
    return res.json({
        success: true,
        data: {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            booking: {
                id: booking.id,
                bookingNumber: booking.bookingNumber,
                itemName,
                bookingDate: booking.bookingDate,
                startTime: booking.startTime,
                endTime: booking.endTime,
                subtotal,
                taxTPS,
                taxTVQ,
                total,
            },
        },
    });
};
exports.createBookingPaymentIntent = createBookingPaymentIntent;
/**
 * @desc    Créer un Payment Intent pour une carte cadeau
 * @route   POST /api/payments/create-intent/gift-card
 * @access  Public
 */
const createGiftCardPaymentIntent = async (req, res) => {
    const { amount, recipientName, recipientEmail, message, senderName, senderEmail, } = req.body;
    // Validation
    if (!amount || !recipientName || !recipientEmail || !senderEmail) {
        return res.status(400).json({
            success: false,
            message: 'Montant, nom du destinataire et email du destinataire sont requis',
        });
    }
    if (amount < 25 || amount > 500) {
        return res.status(400).json({
            success: false,
            message: 'Le montant doit être entre 25$ et 500$',
        });
    }
    // Les cartes cadeaux ne sont PAS taxées
    const { total } = (0, stripe_1.calculateTaxes)(amount, true);
    // Créer ou récupérer le client Stripe
    const stripeCustomer = await (0, stripe_1.getOrCreateStripeCustomer)(senderEmail, senderName);
    // Créer le Payment Intent
    const paymentIntent = await (0, stripe_1.createPaymentIntent)(total, {
        type: 'gift_card',
        recipientName,
        recipientEmail,
        senderName: senderName || '',
        senderEmail,
        amount: amount.toString(),
    }, senderEmail);
    // Générer un code unique pour la carte cadeau
    const giftCardCode = `GC${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;
    // Créer la carte cadeau avec statut PENDING
    const giftCard = await database_1.default.giftCard.create({
        data: {
            code: giftCardCode,
            amount,
            balance: amount,
            recipientName,
            recipientEmail,
            message,
            purchasedBy: senderEmail, // Email de l'acheteur
            isActive: false, // Sera activé après le paiement
            payment: {
                create: {
                    stripePaymentId: paymentIntent.id,
                    stripeCustomerId: stripeCustomer.id,
                    amount: total,
                    status: 'PENDING',
                    paymentMethod: 'card',
                },
            },
        },
        include: {
            payment: true,
        },
    });
    return res.json({
        success: true,
        data: {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            giftCard: {
                id: giftCard.id,
                code: giftCard.code,
                amount,
                recipientName,
                recipientEmail,
            },
        },
    });
};
exports.createGiftCardPaymentIntent = createGiftCardPaymentIntent;
/**
 * @desc    Créer un Payment Intent pour un abonnement gym
 * @route   POST /api/payments/create-intent/gym-subscription
 * @access  Public
 */
const createGymSubscriptionPaymentIntent = async (req, res) => {
    const { membershipId, clientName, clientEmail, clientPhone } = req.body;
    // Validation
    if (!membershipId || !clientName || !clientEmail) {
        return res.status(400).json({
            success: false,
            message: 'Type d\'abonnement et informations client sont requis',
        });
    }
    // Récupérer le type d'abonnement
    const membership = await database_1.default.gymMembership.findUnique({
        where: { id: membershipId },
    });
    if (!membership) {
        return res.status(404).json({
            success: false,
            message: 'Type d\'abonnement non trouvé',
        });
    }
    const subtotal = parseFloat(membership.price.toString());
    // Calculer les taxes
    const { taxTPS, taxTVQ, total } = (0, stripe_1.calculateTaxes)(subtotal, false);
    // Créer ou récupérer le client Stripe
    const stripeCustomer = await (0, stripe_1.getOrCreateStripeCustomer)(clientEmail, clientName, clientPhone);
    // Calculer les dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + membership.duration);
    // Créer le Payment Intent
    const paymentIntent = await (0, stripe_1.createPaymentIntent)(total, {
        type: 'gym_subscription',
        membershipId,
        clientName,
        clientEmail,
        membershipType: membership.type,
        duration: membership.duration.toString(),
    }, clientEmail);
    // Créer l'abonnement avec statut PENDING
    const subscription = await database_1.default.gymSubscription.create({
        data: {
            membershipId,
            clientName,
            clientEmail,
            clientPhone,
            startDate,
            endDate,
            isActive: false, // Sera activé après le paiement
            payment: {
                create: {
                    stripePaymentId: paymentIntent.id,
                    stripeCustomerId: stripeCustomer.id,
                    amount: total,
                    status: 'PENDING',
                    paymentMethod: 'card',
                },
            },
        },
        include: {
            membership: true,
            payment: true,
        },
    });
    return res.json({
        success: true,
        data: {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            subscription: {
                id: subscription.id,
                membershipName: membership.name,
                membershipType: membership.type,
                duration: membership.duration,
                startDate,
                endDate,
                subtotal,
                taxTPS,
                taxTVQ,
                total,
            },
        },
    });
};
exports.createGymSubscriptionPaymentIntent = createGymSubscriptionPaymentIntent;
/**
 * @desc    Confirmer le paiement (webhook ou client-side)
 * @route   POST /api/payments/confirm
 * @access  Public
 */
const confirmPayment = async (req, res) => {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) {
        return res.status(400).json({
            success: false,
            message: 'Payment Intent ID est requis',
        });
    }
    // Récupérer le Payment Intent depuis Stripe
    const paymentIntent = await stripe_1.stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
            success: false,
            message: 'Le paiement n\'a pas réussi',
            status: paymentIntent.status,
        });
    }
    // Mettre à jour le paiement dans la base de données
    const payment = await database_1.default.payment.findUnique({
        where: { stripePaymentId: paymentIntentId },
        include: {
            booking: true,
            giftCard: true,
            gymSubscription: true,
            order: true,
        },
    });
    if (!payment) {
        return res.status(404).json({
            success: false,
            message: 'Paiement non trouvé',
        });
    }
    // Récupérer les charges du Payment Intent
    const paymentIntentWithCharges = await stripe_1.stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] });
    const receiptUrl = paymentIntentWithCharges.latest_charge &&
        typeof paymentIntentWithCharges.latest_charge !== 'string'
        ? paymentIntentWithCharges.latest_charge.receipt_url
        : null;
    // Mettre à jour le statut du paiement
    await database_1.default.payment.update({
        where: { id: payment.id },
        data: {
            status: 'SUCCEEDED',
            receiptUrl: receiptUrl || undefined,
        },
    });
    // Mettre à jour l'entité associée
    if (payment.booking) {
        await database_1.default.booking.update({
            where: { id: payment.booking.id },
            data: { status: 'CONFIRMED' },
        });
    }
    if (payment.giftCard) {
        await database_1.default.giftCard.update({
            where: { id: payment.giftCard.id },
            data: { isActive: true },
        });
    }
    if (payment.gymSubscription) {
        await database_1.default.gymSubscription.update({
            where: { id: payment.gymSubscription.id },
            data: { isActive: true },
        });
    }
    if (payment.order) {
        await database_1.default.order.update({
            where: { id: payment.order.id },
            data: { status: 'PAID' },
        });
    }
    return res.json({
        success: true,
        message: 'Paiement confirmé avec succès',
        data: {
            paymentId: payment.id,
            status: 'SUCCEEDED',
        },
    });
};
exports.confirmPayment = confirmPayment;
/**
 * @desc    Rembourser un paiement
 * @route   POST /api/payments/refund
 * @access  Privé (ADMIN)
 */
const refundPayment = async (req, res) => {
    const { paymentId, reason } = req.body;
    if (!paymentId) {
        return res.status(400).json({
            success: false,
            message: 'Payment ID est requis',
        });
    }
    // Récupérer le paiement
    const payment = await database_1.default.payment.findUnique({
        where: { id: paymentId },
        include: {
            booking: true,
            giftCard: true,
            gymSubscription: true,
        },
    });
    if (!payment) {
        return res.status(404).json({
            success: false,
            message: 'Paiement non trouvé',
        });
    }
    if (payment.status !== 'SUCCEEDED') {
        return res.status(400).json({
            success: false,
            message: 'Seuls les paiements réussis peuvent être remboursés',
        });
    }
    if (!payment.stripePaymentId) {
        return res.status(400).json({
            success: false,
            message: 'Paiement Stripe ID manquant',
        });
    }
    // Créer le remboursement sur Stripe
    const refund = await (0, stripe_1.createRefund)(payment.stripePaymentId, reason);
    // Mettre à jour le statut du paiement
    await database_1.default.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
    });
    // Mettre à jour l'entité associée
    if (payment.booking) {
        await database_1.default.booking.update({
            where: { id: payment.booking.id },
            data: { status: 'CANCELLED' },
        });
    }
    if (payment.giftCard) {
        await database_1.default.giftCard.update({
            where: { id: payment.giftCard.id },
            data: { isActive: false },
        });
    }
    if (payment.gymSubscription) {
        await database_1.default.gymSubscription.update({
            where: { id: payment.gymSubscription.id },
            data: { isActive: false },
        });
    }
    return res.json({
        success: true,
        message: 'Remboursement effectué avec succès',
        data: {
            refundId: refund.id,
            amount: refund.amount / 100,
            status: refund.status,
        },
    });
};
exports.refundPayment = refundPayment;
//# sourceMappingURL=payment.controller.js.map