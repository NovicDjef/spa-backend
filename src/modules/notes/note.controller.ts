import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../auth/auth';

// Schéma de validation
const createNoteSchema = z.object({
  content: z.string().min(1, 'Le contenu de la note est requis'),
});

/**
 * @desc    Récupérer toutes les notes d'un client
 * @route   GET /api/notes/:clientId
 * @access  Privé (Professionnels)
 */
export const getNotesByClient = async (req: AuthRequest, res: Response) => {
  const { clientId } = req.params;

  // Vérifier que le client existe
  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    throw new AppError('Client non trouvé', 404);
  }

  // Récupérer les notes
  const notes = await prisma.note.findMany({
    where: { clientId },
    include: {
      author: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    data: notes,
  });
};

/**
 * @desc    Ajouter une note à un dossier client
 * @route   POST /api/notes/:clientId
 * @access  Privé (Professionnels)
 */
export const createNote = async (req: AuthRequest, res: Response) => {
  const { clientId } = req.params;
  const validatedData = createNoteSchema.parse(req.body);

  // Vérifier que le client existe
  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    throw new AppError('Client non trouvé', 404);
  }

  // Vérifier que le professionnel a accès à ce client (assigné ou ADMIN/SECRETAIRE)
  const user = req.user!;
  if (user.role === 'MASSOTHERAPEUTE' || user.role === 'ESTHETICIENNE') {
    const assignment = await prisma.assignment.findUnique({
      where: {
        clientId_professionalId: {
          clientId,
          professionalId: user.id,
        },
      },
    });

    if (!assignment) {
      throw new AppError('Vous n\'avez pas accès à ce dossier client', 403);
    }
  }

  // Créer la note
  const note = await prisma.note.create({
    data: {
      content: validatedData.content,
      clientId,
      authorId: req.user!.id,
    },
    include: {
      author: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Note ajoutée avec succès',
    data: note,
  });
};

/**
 * @desc    Modifier une note
 * @route   PUT /api/notes/:noteId
 * @access  Privé (Professionnels - auteur uniquement)
 */
export const updateNote = async (req: AuthRequest, res: Response) => {
  const { noteId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new AppError('Le contenu est requis', 400);
  }

  // Vérifier que la note existe
  const note = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!note) {
    throw new AppError('Note non trouvée', 404);
  }

  // Vérifier que l'utilisateur est l'auteur ou ADMIN
  if (note.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError('Vous ne pouvez modifier que vos propres notes', 403);
  }

  // Mettre à jour
  const updatedNote = await prisma.note.update({
    where: { id: noteId },
    data: { content },
    include: {
      author: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: 'Note mise à jour avec succès',
    data: updatedNote,
  });
};

/**
 * @desc    Supprimer une note
 * @route   DELETE /api/notes/:noteId
 * @access  Privé (Professionnels - auteur uniquement)
 */
export const deleteNote = async (req: AuthRequest, res: Response) => {
  const { noteId } = req.params;

  // Vérifier que la note existe
  const note = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!note) {
    throw new AppError('Note non trouvée', 404);
  }

  // Vérifier que l'utilisateur est ADMIN (seul l'admin peut supprimer)
  // Cette vérification est déjà faite par le middleware authorize('ADMIN')

  // Supprimer
  await prisma.note.delete({
    where: { id: noteId },
  });

  res.status(200).json({
    success: true,
    message: 'Note supprimée avec succès',
  });
};
