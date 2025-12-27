import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

/**
 * Configuration et initialisation de Google Calendar API
 */

// Credentials OAuth2 depuis les variables d'environnement
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5003/api/calendar/oauth2callback';
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

// Timezone du spa (Montréal)
const TIMEZONE = 'America/Toronto';

/**
 * Créer un client OAuth2
 */
function getOAuth2Client(): OAuth2Client | null {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  Google Calendar: Client ID ou Secret manquant');
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  if (GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: GOOGLE_REFRESH_TOKEN,
    });
  }

  return oauth2Client;
}

/**
 * Obtenir l'URL d'autorisation OAuth2 (pour la configuration initiale)
 */
export function getAuthorizationUrl(): string {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    throw new Error('OAuth2 client non configuré');
  }

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force le refresh token
  });
}

/**
 * Échanger le code d'autorisation contre un refresh token
 */
export async function exchangeCodeForToken(code: string) {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    throw new Error('OAuth2 client non configuré');
  }

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  };
}

/**
 * Créer un événement Google Calendar pour une réservation
 */
export async function createCalendarEvent(booking: {
  id: string;
  bookingNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  professionalName: string;
  bookingDate: Date;
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  specialNotes?: string;
}) {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client || !GOOGLE_REFRESH_TOKEN) {
    console.warn('⚠️  Google Calendar non configuré - événement non créé');
    return null;
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Formater la date et l'heure
    const bookingDate = new Date(booking.bookingDate);
    const dateString = bookingDate.toISOString().split('T')[0]; // "2025-01-20"

    const startDateTime = `${dateString}T${booking.startTime}:00`; // "2025-01-20T09:00:00"
    const endDateTime = `${dateString}T${booking.endTime}:00`; // "2025-01-20T10:30:00"

    // Créer la description de l'événement
    const description = [
      `Réservation: ${booking.bookingNumber}`,
      `Client: ${booking.clientName}`,
      `Téléphone: ${booking.clientPhone}`,
      `Email: ${booking.clientEmail}`,
      booking.specialNotes ? `\nNotes: ${booking.specialNotes}` : '',
    ].filter(Boolean).join('\n');

    // Créer l'événement
    const event = {
      summary: `${booking.serviceName} - ${booking.clientName}`,
      description,
      location: process.env.SPA_ADDRESS || 'Spa Renaissance',
      start: {
        dateTime: startDateTime,
        timeZone: TIMEZONE,
      },
      end: {
        dateTime: endDateTime,
        timeZone: TIMEZONE,
      },
      attendees: [
        { email: booking.clientEmail, displayName: booking.clientName },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 heures avant
          { method: 'popup', minutes: 60 }, // 1 heure avant
        ],
      },
      colorId: '9', // Bleu (massothérapie/esthétique)
      extendedProperties: {
        private: {
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: GOOGLE_CALENDAR_ID,
      requestBody: event,
      sendUpdates: 'all', // Envoie un email d'invitation au client
    });

    console.log(`✅ Événement Google Calendar créé: ${response.data.id}`);
    return response.data.id; // Retourner l'ID de l'événement
  } catch (error: any) {
    console.error('❌ Erreur lors de la création de l\'événement Google Calendar:', error.message);
    return null;
  }
}

/**
 * Mettre à jour un événement Google Calendar
 */
export async function updateCalendarEvent(
  eventId: string,
  updates: {
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    serviceName?: string;
    professionalName?: string;
    bookingDate?: Date;
    startTime?: string;
    endTime?: string;
    specialNotes?: string;
  }
) {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client || !GOOGLE_REFRESH_TOKEN) {
    console.warn('⚠️  Google Calendar non configuré - événement non mis à jour');
    return false;
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Récupérer l'événement existant
    const existingEvent = await calendar.events.get({
      calendarId: GOOGLE_CALENDAR_ID,
      eventId,
    });

    // Préparer les mises à jour
    const updatedEvent: any = { ...existingEvent.data };

    if (updates.serviceName && updates.clientName) {
      updatedEvent.summary = `${updates.serviceName} - ${updates.clientName}`;
    }

    if (updates.bookingDate && updates.startTime && updates.endTime) {
      const bookingDate = new Date(updates.bookingDate);
      const dateString = bookingDate.toISOString().split('T')[0];
      updatedEvent.start = {
        dateTime: `${dateString}T${updates.startTime}:00`,
        timeZone: TIMEZONE,
      };
      updatedEvent.end = {
        dateTime: `${dateString}T${updates.endTime}:00`,
        timeZone: TIMEZONE,
      };
    }

    // Mettre à jour l'événement
    await calendar.events.update({
      calendarId: GOOGLE_CALENDAR_ID,
      eventId,
      requestBody: updatedEvent,
      sendUpdates: 'all', // Notifier les participants
    });

    console.log(`✅ Événement Google Calendar mis à jour: ${eventId}`);
    return true;
  } catch (error: any) {
    console.error('❌ Erreur lors de la mise à jour de l\'événement Google Calendar:', error.message);
    return false;
  }
}

/**
 * Supprimer un événement Google Calendar
 */
export async function deleteCalendarEvent(eventId: string) {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client || !GOOGLE_REFRESH_TOKEN) {
    console.warn('⚠️  Google Calendar non configuré - événement non supprimé');
    return false;
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: GOOGLE_CALENDAR_ID,
      eventId,
      sendUpdates: 'all', // Notifier les participants de l'annulation
    });

    console.log(`✅ Événement Google Calendar supprimé: ${eventId}`);
    return true;
  } catch (error: any) {
    console.error('❌ Erreur lors de la suppression de l\'événement Google Calendar:', error.message);
    return false;
  }
}

/**
 * Annuler un événement (le marquer comme annulé sans le supprimer)
 */
export async function cancelCalendarEvent(eventId: string, reason?: string) {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client || !GOOGLE_REFRESH_TOKEN) {
    console.warn('⚠️  Google Calendar non configuré - événement non annulé');
    return false;
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Récupérer l'événement
    const existingEvent = await calendar.events.get({
      calendarId: GOOGLE_CALENDAR_ID,
      eventId,
    });

    // Marquer comme annulé
    const updatedEvent = {
      ...existingEvent.data,
      summary: `[ANNULÉ] ${existingEvent.data.summary}`,
      description: `${existingEvent.data.description}\n\n⚠️ ANNULÉ${reason ? `: ${reason}` : ''}`,
      colorId: '11', // Rouge pour annulation
      status: 'cancelled',
    };

    await calendar.events.update({
      calendarId: GOOGLE_CALENDAR_ID,
      eventId,
      requestBody: updatedEvent,
      sendUpdates: 'all',
    });

    console.log(`✅ Événement Google Calendar annulé: ${eventId}`);
    return true;
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'annulation de l\'événement Google Calendar:', error.message);
    return false;
  }
}

/**
 * Vérifier si Google Calendar est configuré
 */
export function isGoogleCalendarConfigured(): boolean {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN);
}

/**
 * Afficher le statut de la configuration
 */
export function getConfigurationStatus() {
  return {
    clientId: !!GOOGLE_CLIENT_ID,
    clientSecret: !!GOOGLE_CLIENT_SECRET,
    refreshToken: !!GOOGLE_REFRESH_TOKEN,
    calendarId: GOOGLE_CALENDAR_ID,
    configured: isGoogleCalendarConfigured(),
  };
}
