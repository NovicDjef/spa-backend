"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarStatus = exports.handleOAuthCallback = exports.getAuthUrl = void 0;
const googleCalendar_1 = require("../../lib/googleCalendar");
/**
 * @desc    Obtenir l'URL d'autorisation Google OAuth2
 * @route   GET /api/calendar/auth/url
 * @access  Public (mais devrait être restreint en production)
 */
const getAuthUrl = async (req, res) => {
    try {
        const authUrl = (0, googleCalendar_1.getAuthorizationUrl)();
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getAuthUrl = getAuthUrl;
/**
 * @desc    Échanger le code d'autorisation contre un refresh token
 * @route   POST /api/calendar/auth/callback
 * @access  Public (mais devrait être restreint en production)
 */
const handleOAuthCallback = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Le code d\'autorisation est requis',
            });
        }
        const tokens = await (0, googleCalendar_1.exchangeCodeForToken)(code);
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.handleOAuthCallback = handleOAuthCallback;
/**
 * @desc    Vérifier le statut de la configuration Google Calendar
 * @route   GET /api/calendar/status
 * @access  Public
 */
const getCalendarStatus = async (req, res) => {
    const status = (0, googleCalendar_1.getConfigurationStatus)();
    return res.json({
        success: true,
        data: status,
        message: status.configured
            ? 'Google Calendar est configuré et prêt à l\'emploi'
            : 'Google Calendar n\'est pas encore configuré',
    });
};
exports.getCalendarStatus = getCalendarStatus;
//# sourceMappingURL=oauth.controller.js.map