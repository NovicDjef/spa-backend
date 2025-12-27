/**
 * Obtenir l'URL d'autorisation OAuth2 (pour la configuration initiale)
 */
export declare function getAuthorizationUrl(): string;
/**
 * Échanger le code d'autorisation contre un refresh token
 */
export declare function exchangeCodeForToken(code: string): Promise<{
    access_token: string | null | undefined;
    refresh_token: string | null | undefined;
    expiry_date: number | null | undefined;
}>;
/**
 * Créer un événement Google Calendar pour une réservation
 */
export declare function createCalendarEvent(booking: {
    id: string;
    bookingNumber: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    serviceName: string;
    professionalName: string;
    bookingDate: Date;
    startTime: string;
    endTime: string;
    specialNotes?: string;
}): Promise<string | null | undefined>;
/**
 * Mettre à jour un événement Google Calendar
 */
export declare function updateCalendarEvent(eventId: string, updates: {
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    serviceName?: string;
    professionalName?: string;
    bookingDate?: Date;
    startTime?: string;
    endTime?: string;
    specialNotes?: string;
}): Promise<boolean>;
/**
 * Supprimer un événement Google Calendar
 */
export declare function deleteCalendarEvent(eventId: string): Promise<boolean>;
/**
 * Annuler un événement (le marquer comme annulé sans le supprimer)
 */
export declare function cancelCalendarEvent(eventId: string, reason?: string): Promise<boolean>;
/**
 * Vérifier si Google Calendar est configuré
 */
export declare function isGoogleCalendarConfigured(): boolean;
/**
 * Afficher le statut de la configuration
 */
export declare function getConfigurationStatus(): {
    clientId: boolean;
    clientSecret: boolean;
    refreshToken: boolean;
    calendarId: string;
    configured: boolean;
};
//# sourceMappingURL=googleCalendar.d.ts.map