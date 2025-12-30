import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../auth/auth';

/**
 * Valider le format d'une heure (HH:MM)
 */
const isValidTimeFormat = (time: string): boolean => {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
};

/**
 * Vérifier que startTime < endTime
 */
const isValidTimeRange = (startTime: string, endTime: string): boolean => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  return startTotalMinutes < endTotalMinutes;
};

/**
 * Définir ou mettre à jour les horaires de travail d'un professionnel
 * @route POST /api/availability/working-schedule
 * @access Privé (ADMIN)
 */
export const setWorkingSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { professionalId, schedules } = req.body;

    // Validation
    if (!professionalId) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID du professionnel est requis',
      });
    }

    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Les horaires sont requis (tableau de schedules)',
      });
    }

    // Vérifier que le professionnel existe
    const professional = await prisma.user.findUnique({
      where: { id: professionalId },
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professionnel non trouvé',
      });
    }

    if (!['MASSOTHERAPEUTE', 'ESTHETICIENNE'].includes(professional.role)) {
      return res.status(400).json({
        success: false,
        message: 'Cet utilisateur n\'est pas un professionnel',
      });
    }

    // Valider chaque horaire
    for (const schedule of schedules) {
      const { dayOfWeek, startTime, endTime } = schedule;

      if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
        return res.status(400).json({
          success: false,
          message: 'dayOfWeek doit être entre 0 (dimanche) et 6 (samedi)',
        });
      }

      if (!startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: 'startTime et endTime sont requis pour chaque horaire',
        });
      }

      if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
        return res.status(400).json({
          success: false,
          message: 'Format d\'heure invalide. Utilisez HH:MM (ex: 09:00)',
        });
      }

      if (!isValidTimeRange(startTime, endTime)) {
        return res.status(400).json({
          success: false,
          message: 'L\'heure de début doit être avant l\'heure de fin',
        });
      }
    }

    // Upsert pour chaque jour (créer ou mettre à jour)
    const upsertPromises = schedules.map((schedule: any) =>
      prisma.workingSchedule.upsert({
        where: {
          professionalId_dayOfWeek: {
            professionalId,
            dayOfWeek: schedule.dayOfWeek,
          },
        },
        update: {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: schedule.isActive !== undefined ? schedule.isActive : true,
        },
        create: {
          professionalId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: schedule.isActive !== undefined ? schedule.isActive : true,
        },
      })
    );

    const result = await Promise.all(upsertPromises);

    return res.status(200).json({
      success: true,
      message: 'Horaires de travail mis à jour avec succès',
      data: result,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des horaires:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
};

/**
 * Récupérer les horaires de travail d'un professionnel
 * @route GET /api/availability/working-schedule/:professionalId
 * @access Privé (ADMIN, SECRETAIRE)
 */
export const getWorkingSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { professionalId } = req.params;

    // Vérifier que le professionnel existe
    const professional = await prisma.user.findUnique({
      where: { id: professionalId },
      select: { id: true, nom: true, prenom: true, role: true },
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professionnel non trouvé',
      });
    }

    // Récupérer tous les horaires
    const schedules = await prisma.workingSchedule.findMany({
      where: { professionalId },
      orderBy: { dayOfWeek: 'asc' },
    });

    // Créer un objet avec tous les jours (0-6)
    const fullWeek = Array.from({ length: 7 }, (_, dayOfWeek) => {
      const existing = schedules.find((s) => s.dayOfWeek === dayOfWeek);

      return existing || {
        dayOfWeek,
        startTime: null,
        endTime: null,
        isActive: false,
      };
    });

    return res.json({
      success: true,
      data: {
        professional: {
          id: professional.id,
          nom: professional.nom,
          prenom: professional.prenom,
          role: professional.role,
        },
        schedules: fullWeek,
      },
    });
  } catch (error) {
    console.error('Erreur récupération horaires:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
};

/**
 * Ajouter une pause pour un professionnel
 * @route POST /api/availability/breaks
 * @access Privé (ADMIN)
 */
export const addBreak = async (req: AuthRequest, res: Response) => {
  try {
    const { professionalId, dayOfWeek, startTime, endTime, label } = req.body;

    // Validation
    if (!professionalId) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID du professionnel est requis',
      });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'startTime et endTime sont requis',
      });
    }

    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'heure invalide. Utilisez HH:MM',
      });
    }

    if (!isValidTimeRange(startTime, endTime)) {
      return res.status(400).json({
        success: false,
        message: 'L\'heure de début doit être avant l\'heure de fin',
      });
    }

    // Si dayOfWeek est fourni, le valider
    if (dayOfWeek !== null && dayOfWeek !== undefined) {
      if (dayOfWeek < 0 || dayOfWeek > 6) {
        return res.status(400).json({
          success: false,
          message: 'dayOfWeek doit être entre 0 et 6, ou null pour tous les jours',
        });
      }
    }

    // Vérifier que le professionnel existe
    const professional = await prisma.user.findUnique({
      where: { id: professionalId },
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professionnel non trouvé',
      });
    }

    if (!['MASSOTHERAPEUTE', 'ESTHETICIENNE'].includes(professional.role)) {
      return res.status(400).json({
        success: false,
        message: 'Cet utilisateur n\'est pas un professionnel',
      });
    }

    // Créer la pause
    const breakPeriod = await prisma.breakPeriod.create({
      data: {
        professionalId,
        dayOfWeek: dayOfWeek !== undefined ? dayOfWeek : null,
        startTime,
        endTime,
        label: label || 'Pause',
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Pause ajoutée avec succès',
      data: breakPeriod,
    });
  } catch (error) {
    console.error('Erreur ajout pause:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
};

/**
 * Récupérer toutes les pauses d'un professionnel
 * @route GET /api/availability/breaks/:professionalId
 * @access Privé (ADMIN, SECRETAIRE)
 */
export const getBreaks = async (req: AuthRequest, res: Response) => {
  try {
    const { professionalId } = req.params;

    // Vérifier que le professionnel existe
    const professional = await prisma.user.findUnique({
      where: { id: professionalId },
      select: { id: true, nom: true, prenom: true, role: true },
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professionnel non trouvé',
      });
    }

    // Récupérer toutes les pauses actives
    const breaks = await prisma.breakPeriod.findMany({
      where: {
        professionalId,
        isActive: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return res.json({
      success: true,
      data: {
        professional: {
          id: professional.id,
          nom: professional.nom,
          prenom: professional.prenom,
          role: professional.role,
        },
        breaks,
      },
    });
  } catch (error) {
    console.error('Erreur récupération pauses:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
};

/**
 * Supprimer une pause
 * @route DELETE /api/availability/breaks/:id
 * @access Privé (ADMIN)
 */
export const deleteBreak = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier que la pause existe
    const breakPeriod = await prisma.breakPeriod.findUnique({
      where: { id },
    });

    if (!breakPeriod) {
      return res.status(404).json({
        success: false,
        message: 'Pause non trouvée',
      });
    }

    // Soft delete (désactiver au lieu de supprimer)
    await prisma.breakPeriod.update({
      where: { id },
      data: { isActive: false },
    });

    return res.json({
      success: true,
      message: 'Pause supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur suppression pause:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
};
