import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../auth/auth';
import { AppError } from '../../middleware/errorHandler';

/**
 * @desc    Récupérer tous les paramètres système
 * @route   GET /api/settings
 * @access  Privé (ADMIN)
 */
export const getAllSettings = async (_req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.systemSettings.findMany({
      orderBy: { key: 'asc' },
    });

    return res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Erreur récupération paramètres:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
};

/**
 * @desc    Récupérer un paramètre par sa clé
 * @route   GET /api/settings/:key
 * @access  Privé (ADMIN)
 */
export const getSetting = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;

    const setting = await prisma.systemSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Paramètre non trouvé',
      });
    }

    return res.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error('Erreur récupération paramètre:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
};

/**
 * @desc    Créer ou mettre à jour un paramètre
 * @route   PUT /api/settings/:key
 * @access  Privé (ADMIN)
 */
export const upsertSetting = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    if (!value) {
      return res.status(400).json({
        success: false,
        message: 'La valeur est requise',
      });
    }

    // Convertir la valeur en chaîne JSON si c'est un objet
    let valueString: string;
    if (typeof value === 'string') {
      valueString = value;
    } else {
      valueString = JSON.stringify(value);
    }

    // Upsert (créer ou mettre à jour)
    const setting = await prisma.systemSettings.upsert({
      where: { key },
      update: {
        value: valueString,
        description: description || undefined,
        updatedAt: new Date(),
      },
      create: {
        key,
        value: valueString,
        description: description || null,
      },
    });

    return res.json({
      success: true,
      message: 'Paramètre enregistré avec succès',
      data: setting,
    });
  } catch (error) {
    console.error('Erreur enregistrement paramètre:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
};

/**
 * @desc    Supprimer un paramètre
 * @route   DELETE /api/settings/:key
 * @access  Privé (ADMIN)
 */
export const deleteSetting = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;

    // Vérifier que le paramètre existe
    const setting = await prisma.systemSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Paramètre non trouvé',
      });
    }

    // Supprimer le paramètre
    await prisma.systemSettings.delete({
      where: { key },
    });

    return res.json({
      success: true,
      message: 'Paramètre supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur suppression paramètre:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
};

/**
 * @desc    Récupérer plusieurs paramètres par leurs clés
 * @route   POST /api/settings/batch
 * @access  Privé (ADMIN)
 */
export const getBatchSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { keys } = req.body;

    if (!Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Un tableau de clés est requis',
      });
    }

    const settings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: keys,
        },
      },
    });

    // Créer un objet clé-valeur pour faciliter l'utilisation côté client
    const settingsMap: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value;
    });

    return res.json({
      success: true,
      data: settingsMap,
    });
  } catch (error) {
    console.error('Erreur récupération paramètres batch:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
};
