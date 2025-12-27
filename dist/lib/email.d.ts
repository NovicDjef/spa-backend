/**
 * Email de bienvenue pour les nouveaux clients
 */
export declare function sendWelcomeEmail(email: string, prenom: string, serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE'): Promise<void>;
/**
 * Email marketing pour campagnes ADMIN
 */
export declare function sendMarketingEmail(email: string, prenom: string, subject: string, message: string): Promise<void>;
/**
 * Email de confirmation de réservation
 */
export declare function sendBookingConfirmation(booking: {
    bookingNumber: string;
    clientName: string;
    clientEmail: string;
    serviceName: string;
    professionalName: string;
    bookingDate: Date;
    startTime: string;
    endTime: string;
    total: number;
    address?: string;
}): Promise<void>;
/**
 * Email de rappel 24h avant le rendez-vous
 */
export declare function sendBookingReminder(booking: {
    bookingNumber: string;
    clientName: string;
    clientEmail: string;
    serviceName: string;
    professionalName: string;
    bookingDate: Date;
    startTime: string;
    address?: string;
}): Promise<void>;
/**
 * Email de carte cadeau
 */
export declare function sendGiftCardEmail(giftCard: {
    code: string;
    amount: number;
    recipientName: string;
    recipientEmail: string;
    senderName?: string;
    message?: string;
}): Promise<void>;
/**
 * Email de confirmation d'abonnement gym
 */
export declare function sendGymSubscriptionConfirmation(subscription: {
    clientName: string;
    clientEmail: string;
    membershipName: string;
    membershipType: string;
    startDate: Date;
    endDate: Date;
    total: number;
}): Promise<void>;
/**
 * Email générique (pour les messages automatisés par IA)
 */
export declare function sendEmail(options: {
    to: string;
    subject: string;
    html: string;
}): Promise<void>;
/**
 * Tester la connexion SMTP
 */
export declare function testEmailConnection(): Promise<boolean>;
//# sourceMappingURL=email.d.ts.map