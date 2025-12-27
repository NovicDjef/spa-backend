/**
 * Remplace les placeholders dans un message par les vraies valeurs du client
 * @param message Le message avec placeholders {prenom}, {nom}
 * @param prenom Le prénom du client
 * @param nom Le nom du client
 * @returns Le message personnalisé
 */
export declare function replacePlaceholders(message: string, prenom: string, nom: string): string;
/**
 * Génère un message marketing avec placeholders pour personnalisation
 * @param prompt Le prompt de l'utilisateur (ex: "Proposer une réduction de 10% sur les massages")
 * @param serviceType Type de service (MASSOTHERAPIE ou ESTHETIQUE) pour cibler l'expertise
 * @param additionalContext Contexte additionnel (type de clients, etc.)
 * @returns Le message généré par ChatGPT avec placeholders {prenom}, {nom}, {service}
 */
export declare function generateMarketingMessage(prompt: string, serviceType?: 'MASSOTHERAPIE' | 'ESTHETIQUE', additionalContext?: string): Promise<string>;
/**
 * Génère un message de suivi client personnalisé basé sur la note du thérapeute
 * @param noteContent Le contenu de la note du thérapeute
 * @param clientFirstName Le prénom du client
 * @param clientLastName Le nom du client
 * @param therapistName Le nom du thérapeute
 * @param serviceType Type de service (MASSOTHERAPIE ou ESTHETIQUE)
 * @returns Un objet avec le sujet et le message généré
 */
export declare function generateClientFollowUpMessage(noteContent: string, clientFirstName: string, clientLastName: string, therapistName: string, serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE'): Promise<{
    subject: string;
    message: string;
}>;
/**
 * Génère un objet/sujet d'email accrocheur avec ChatGPT
 * @param prompt Le prompt de l'utilisateur
 * @returns Le sujet d'email généré
 */
export declare function generateEmailSubject(prompt: string): Promise<string>;
//# sourceMappingURL=chatgpt.d.ts.map