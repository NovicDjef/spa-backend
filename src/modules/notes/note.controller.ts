import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../auth/auth';
import { generateClientFollowUpMessage } from '../../lib/chatgpt';
import { sendEmail } from '../../lib/email';

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
    // Utiliser findFirst au lieu de findUnique car la contrainte unique a été supprimée
    // pour permettre les ré-assignations multiples
    const assignment = await prisma.assignment.findFirst({
      where: {
        clientId,
        professionalId: user.id,
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

  // 🤖 AUTOMATISATION : Envoyer un email de suivi au client
  // Processus asynchrone pour ne pas bloquer la réponse
  (async () => {
    try {
      // Récupérer les informations complètes de l'auteur (thérapeute)
      const therapist = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          nom: true,
          prenom: true,
        },
      });

      if (!therapist) {
        console.error('Thérapeute introuvable pour l\'envoi de l\'email de suivi');
        return;
      }

      const therapistName = `${therapist.prenom} ${therapist.nom}`;

      // Vérifier que le client a un email
      if (!client.courriel) {
        console.log(`Client ${client.prenom} ${client.nom} n'a pas d'email - Email de suivi non envoyé`);
        return;
      }

      // Générer le message personnalisé avec ChatGPT
      console.log(`📧 Génération du message de suivi pour ${client.prenom} ${client.nom}...`);

      const { subject, message } = await generateClientFollowUpMessage(
        validatedData.content,
        client.prenom,
        client.nom,
        therapistName,
        client.serviceType
      );

      // Envoyer l'email
      await sendEmail({
        to: client.courriel,
        subject,
        html: message,
      });

      // Marquer la note comme envoyée
      await prisma.note.update({
        where: { id: note.id },
        data: {
          emailSent: true,
          emailSentAt: new Date(),
        },
      });

      console.log(`✅ Email de suivi envoyé à ${client.prenom} ${client.nom} (${client.courriel})`);

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de suivi:', error);
      // Ne pas bloquer la création de la note si l'email échoue
    }
  })();

  res.status(201).json({
    success: true,
    message: 'Note ajoutée avec succès',
    data: note,
  });
};

/**
 * @desc    Modifier une note
 * @route   PUT /api/notes/:noteId
 * @access  Privé (Professionnels - auteur uniquement, 24h max sauf ADMIN)
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

  const user = req.user!;

  // Vérifier que l'utilisateur est l'auteur
  if (note.authorId !== user.id && user.role !== 'ADMIN') {
    throw new AppError('Vous ne pouvez modifier que vos propres notes', 403);
  }

  // Vérifier la limite de 24h (sauf pour ADMIN)
  if (user.role !== 'ADMIN') {
    const noteAge = Date.now() - new Date(note.createdAt).getTime();
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

    if (noteAge > twentyFourHoursInMs) {
      throw new AppError('Vous ne pouvez plus modifier cette note (limite de 24h dépassée)', 403);
    }
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
 * @access  Privé (Professionnels - auteur uniquement dans les 24h, ADMIN sans limite)
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

  const user = req.user!;

  // Vérifier que l'utilisateur est l'auteur ou ADMIN
  if (note.authorId !== user.id && user.role !== 'ADMIN') {
    throw new AppError('Vous ne pouvez supprimer que vos propres notes', 403);
  }

  // Vérifier la limite de 24h (sauf pour ADMIN)
  if (user.role !== 'ADMIN') {
    const noteAge = Date.now() - new Date(note.createdAt).getTime();
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

    if (noteAge > twentyFourHoursInMs) {
      throw new AppError('Vous ne pouvez plus supprimer cette note (limite de 24h dépassée)', 403);
    }
  }

  // Supprimer
  await prisma.note.delete({
    where: { id: noteId },
  });

  res.status(200).json({
    success: true,
    message: 'Note supprimée avec succès',
  });
};
