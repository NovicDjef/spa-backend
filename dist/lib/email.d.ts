/**
 * Email de bienvenue pour les nouveaux clients
 */
export declare function sendWelcomeEmail(email: string, prenom: string, serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE'): Promise<void>;
/**
 * Email marketing pour campagnes ADMIN
 */
export declare function sendMarketingEmail(email: string, prenom: string, subject: string, message: string): Promise<void>;
/**
 * Tester la connexion SMTP
 */
export declare function testEmailConnection(): Promise<boolean>;
//# sourceMappingURL=email.d.ts.map