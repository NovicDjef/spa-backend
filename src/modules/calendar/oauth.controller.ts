import { Request, Response } from 'express';
import {
  getAuthorizationUrl,
  exchangeCodeForToken,
  getConfigurationStatus,
} from '../../lib/googleCalendar';

/**
 * @desc    Obtenir l'URL d'autorisation Google OAuth2
 * @route   GET /api/calendar/auth/url
 * @access  Public (mais devrait être restreint en production)
 */
export const getAuthUrl = async (req: Request, res: Response) => {
  try {
    const authUrl = getAuthorizationUrl();

    return res.json({
      success: true,
      data: {
        authUrl,
        instructions: [
          '1. Cliquez sur le lien ci-dessus',
          '2. Connectez-vous avec votre compte Google',
          '3. Autorisez l\'application à accéder à Google Calendar',
          '4. Copiez le code d\'autorisation fourni',
          '5. Utilisez POST /api/calendar/auth/callback avec le code',
        ],
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Échanger le code d'autorisation contre un refresh token
 * @route   POST /api/calendar/auth/callback
 * @access  Public (mais devrait être restreint en production)
 */
export const handleOAuthCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Le code d\'autorisation est requis',
      });
    }

    const tokens = await exchangeCodeForToken(code);

    return res.json({
      success: true,
      message: 'Tokens obtenus avec succès!',
      data: {
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        expiry_date: tokens.expiry_date,
      },
      instructions: [
        'Ajoutez ce REFRESH_TOKEN dans votre fichier .env:',
        `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`,
        '',
        'Puis redémarrez le serveur.',
      ],
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Vérifier le statut de la configuration Google Calendar
 * @route   GET /api/calendar/status
 * @access  Public
 */
export const getCalendarStatus = async (req: Request, res: Response) => {
  const status = getConfigurationStatus();

  return res.json({
    success: true,
    data: status,
    message: status.configured
      ? 'Google Calendar est configuré et prêt à l\'emploi'
      : 'Google Calendar n\'est pas encore configuré',
  });
};
