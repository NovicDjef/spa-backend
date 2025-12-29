import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../auth/auth';

// Schéma de validation pour la création d'un employé
const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  telephone: z.string().min(10, 'Le téléphone doit contenir au moins 10 caractères'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: z.enum(['SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN']),
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  isActive: z.boolean().default(true),
});

/**
 * @desc    Créer un employé (par l'admin)
 * @route   POST /api/users
 * @access  Privé (ADMIN uniquement)
 */
export const createUser = async (req: AuthRequest, res: Response) => {
  // Validation
  const validatedData = createUserSchema.parse(req.body);

  // Vérifier si l'email existe déjà
  const existingEmail = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (existingEmail) {
    throw new AppError('Cet email est déjà utilisé', 400);
  }

  // Vérifier si le téléphone existe déjà
  const existingPhone = await prisma.user.findUnique({
    where: { telephone: validatedData.telephone },
  });

  if (existingPhone) {
    throw new AppError('Ce numéro de téléphone est déjà utilisé', 400);
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(validatedData.password, 12);

  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: {
      email: validatedData.email,
      telephone: validatedData.telephone,
      password: hashedPassword,
      role: validatedData.role,
      nom: validatedData.nom,
      prenom: validatedData.prenom,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      telephone: true,
      nom: true,
      prenom: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  // IMPORTANT: Retourner le mot de passe en clair pour que l'admin puisse le donner à l'employé
  res.status(201).json({
    success: true,
    message: 'Employé créé avec succès',
    data: {
      user,
      // Le mot de passe en clair pour que l'admin le note
      plainPassword: validatedData.password,
    },
  });
};

/**
 * @desc    Récupérer tous les employés
 * @route   GET /api/users
 * @access  Privé (ADMIN uniquement)
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const { role, search, includeInactive } = req.query;

  let where: any = {};

  // Filtrer par statut actif (par défaut, exclure les utilisateurs bloqués)
  // Sauf si includeInactive=true (pour l'admin qui veut voir tous les utilisateurs)
  if (includeInactive !== 'true') {
    where.isActive = true;
  }

  // Filtrer par rôle
  if (role && ['SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'].includes(role as string)) {
    where.role = role;
  }

  // Recherche
  if (search) {
    where.OR = [
      { nom: { contains: search as string, mode: 'insensitive' } },
      { prenom: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { telephone: { contains: search as string } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      _count: {
        select: {
          assignedClients: true,
          notesCreated: true,
          reviewsReceived: true,
        },
      },
      reviewsReceived: {
        select: { rating: true }
      }
    },
    orderBy: [
      { role: 'asc' },
      { nom: 'asc' },
    ],
  });

  // Calculer la moyenne pour chaque user
  const usersWithStats = users.map(user => {
    const reviewsCount = user.reviewsReceived.length;
    const averageRating = reviewsCount > 0
      ? user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
      : null;

    return {
      id: user.id,
      email: user.email,
      telephone: user.telephone,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      _count: {
        assignedClients: user._count.assignedClients,
        notesCreated: user._count.notesCreated,
        reviewsReceived: user._count.reviewsReceived
      },
      averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null
    };
  });

  res.status(200).json({
    success: true,
    data: usersWithStats,
  });
};

/**
 * @desc    Récupérer un employé par ID
 * @route   GET /api/users/:id
 * @access  Privé (ADMIN uniquement)
 */
export const getUserById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      telephone: true,
      nom: true,
      prenom: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      assignedClients: {
        include: {
          client: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              serviceType: true,
              courriel: true,
              telCellulaire: true,
            },
          },
        },
      },
      notesCreated: {
        select: {
          id: true,
          createdAt: true,
          client: {
            select: {
              nom: true,
              prenom: true,
            },
          },
        },
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!user) {
    throw new AppError('Employé non trouvé', 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};

/**
 * @desc    Mettre à jour un employé
 * @route   PUT /api/users/:id
 * @access  Privé (ADMIN uniquement)
 */
export const updateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { email, telephone, nom, prenom, role, password } = req.body;

  // Vérifier que l'employé existe
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new AppError('Employé non trouvé', 404);
  }

  // Préparer les données de mise à jour
  const updateData: any = {};

  if (email) {
    // Vérifier l'unicité de l'email
    const emailExists = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id },
      },
    });

    if (emailExists) {
      throw new AppError('Cet email est déjà utilisé', 400);
    }

    updateData.email = email;
  }

  if (telephone) {
    // Vérifier l'unicité du téléphone
    const phoneExists = await prisma.user.findFirst({
      where: {
        telephone,
        id: { not: id },
      },
    });

    if (phoneExists) {
      throw new AppError('Ce numéro de téléphone est déjà utilisé', 400);
    }

    updateData.telephone = telephone;
  }

  if (nom) updateData.nom = nom;
  if (prenom) updateData.prenom = prenom;
  if (role) updateData.role = role;

  // Si un nouveau mot de passe est fourni
  if (password) {
    updateData.password = await bcrypt.hash(password, 12);
  }

  // Mettre à jour
  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      telephone: true,
      nom: true,
      prenom: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  // Si le mot de passe a été changé, retourner le nouveau mot de passe en clair
  const response: any = {
    success: true,
    message: 'Employé mis à jour avec succès',
    data: updatedUser,
  };

  if (password) {
    response.data.plainPassword = password;
  }

  res.status(200).json(response);
};

/**
 * @desc    Supprimer un employé
 * @route   DELETE /api/users/:id
 * @access  Privé (ADMIN uniquement)
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const currentUserId = req.user!.id;

  // Empêcher l'admin de se supprimer lui-même
  if (id === currentUserId) {
    throw new AppError('Vous ne pouvez pas supprimer votre propre compte', 400);
  }

  // Vérifier que l'employé existe
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError('Employé non trouvé', 404);
  }

  // Supprimer
  await prisma.user.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Employé supprimé avec succès',
  });
};

/**
 * @desc    Réinitialiser le mot de passe d'un employé
 * @route   POST /api/users/:id/reset-password
 * @access  Privé (ADMIN uniquement)
 */
export const resetPassword = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    throw new AppError('Le mot de passe doit contenir au moins 6 caractères', 400);
  }

  // Vérifier que l'employé existe
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError('Employé non trouvé', 404);
  }

  // Hasher le nouveau mot de passe
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Mettre à jour
  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  res.status(200).json({
    success: true,
    message: 'Mot de passe réinitialisé avec succès',
    data: {
      // Retourner le mot de passe en clair pour que l'admin puisse le donner à l'employé
      plainPassword: newPassword,
    },
  });
};

/**
 * @desc    Activer/Désactiver un employé
 * @route   PATCH /api/users/:id/toggle-status
 * @access  Privé (ADMIN uniquement)
 */
export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Vérifier que l'employé existe
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError('Employé non trouvé', 404);
  }

  // Empêcher l'admin de se désactiver lui-même
  if (user.id === req.user!.id) {
    throw new AppError('Vous ne pouvez pas désactiver votre propre compte', 400);
  }

  // Empêcher de désactiver un autre ADMIN
  if (user.role === 'ADMIN' && user.isActive) {
    throw new AppError('Vous ne pouvez pas désactiver un compte administrateur', 400);
  }

  // Inverser le statut
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      email: true,
      nom: true,
      prenom: true,
      role: true,
      isActive: true,
    },
  });

  res.status(200).json({
    success: true,
    message: updatedUser.isActive
      ? `Employé ${updatedUser.nom} ${updatedUser.prenom} activé avec succès`
      : `Employé ${updatedUser.nom} ${updatedUser.prenom} désactivé avec succès`,
    data: updatedUser,
  });
};

/**
 * @desc    Récupérer les avis détaillés d'un employé
 * @route   GET /api/users/:id/reviews
 * @access  Privé (ADMIN uniquement)
 */
export const getUserReviews = async (req: AuthRequest, res: Response) => {
  // Vérifier admin
  if (req.user!.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Accès interdit'
    });
  }

  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      nom: true,
      prenom: true
    }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilisateur introuvable'
    });
  }

  const reviews = await prisma.review.findMany({
    where: { professionalId: id },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };

  reviews.forEach(review => {
    ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
  });

  return res.json({
    success: true,
    data: {
      user,
      statistics: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution
      },
      recentReviews: reviews
    }
  });
};

/**
 * @desc    Changer son propre mot de passe (pour tous les employés)
 * @route   PUT /api/users/me/change-password
 * @access  Privé (Tous les employés connectés)
 */
export const changeOwnPassword = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  // Validation
  if (!currentPassword || !newPassword) {
    throw new AppError('L\'ancien et le nouveau mot de passe sont requis', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('Le nouveau mot de passe doit contenir au moins 6 caractères', 400);
  }

  // Récupérer l'utilisateur avec le mot de passe
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('Utilisateur non trouvé', 404);
  }

  // Vérifier l'ancien mot de passe
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new AppError('Mot de passe actuel incorrect', 400);
  }

  // Hasher le nouveau mot de passe
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Mettre à jour le mot de passe
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  res.status(200).json({
    success: true,
    message: 'Mot de passe modifié avec succès',
  });
};

/**
 * @desc    Récupérer son propre profil et le mettre à jour
 * @route   GET /api/users/me
 * @access  Privé (Tous les employés connectés)
 */
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      telephone: true,
      nom: true,
      prenom: true,
      role: true,
      adresse: true,
      numeroOrdre: true,
      photoUrl: true,
      signatureUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('Utilisateur non trouvé', 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};

/**
 * @desc    Mettre à jour son propre profil (nom, prénom, téléphone, adresse, photo)
 * @route   PUT /api/users/me
 * @access  Privé (Tous les employés connectés)
 */
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { nom, prenom, telephone, adresse, photoUrl, numeroOrdre } = req.body;

  // Préparer les données de mise à jour
  const updateData: any = {};

  if (nom) updateData.nom = nom;
  if (prenom) updateData.prenom = prenom;
  if (adresse !== undefined) updateData.adresse = adresse;
  if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
  if (numeroOrdre !== undefined) updateData.numeroOrdre = numeroOrdre;

  if (telephone) {
    // Vérifier l'unicité du téléphone
    const phoneExists = await prisma.user.findFirst({
      where: {
        telephone,
        id: { not: userId },
      },
    });

    if (phoneExists) {
      throw new AppError('Ce numéro de téléphone est déjà utilisé', 400);
    }

    updateData.telephone = telephone;
  }

  // Mettre à jour le profil
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      telephone: true,
      nom: true,
      prenom: true,
      role: true,
      adresse: true,
      numeroOrdre: true,
      photoUrl: true,
      isActive: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Profil mis à jour avec succès',
    data: updatedUser,
  });
};

/**
 * @desc    Uploader sa signature (pour les reçus d'assurance)
 * @route   POST /api/users/me/upload-signature
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE)
 */
export const uploadSignature = async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  if (!req.file) {
    throw new AppError('Aucun fichier fourni', 400);
  }

  // Supprimer l'ancienne signature si elle existe
  if (user.signatureUrl) {
    const oldSignaturePath = path.join(process.cwd(), user.signatureUrl);
    if (fs.existsSync(oldSignaturePath)) {
      fs.unlinkSync(oldSignaturePath);
    }
  }

  const signatureUrl = `uploads/signatures/${req.file.filename}`;

  // Mettre à jour la base de données
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { signatureUrl },
    select: {
      id: true,
      nom: true,
      prenom: true,
      signatureUrl: true,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Signature uploadée avec succès',
    data: updatedUser,
  });
};

/**
 * @desc    Récupérer sa signature
 * @route   GET /api/users/me/signature
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE)
 */
export const getMySignature = async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      signatureUrl: true,
    },
  });

  if (!userData?.signatureUrl) {
    throw new AppError('Aucune signature trouvée', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      signatureUrl: userData.signatureUrl,
    },
  });
};

/**
 * @desc    Supprimer sa signature
 * @route   DELETE /api/users/me/signature
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE)
 */
export const deleteMySignature = async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      signatureUrl: true,
    },
  });

  if (!userData?.signatureUrl) {
    throw new AppError('Aucune signature à supprimer', 404);
  }

  // Supprimer le fichier physique
  const signaturePath = path.join(process.cwd(), userData.signatureUrl);
  if (fs.existsSync(signaturePath)) {
    fs.unlinkSync(signaturePath);
  }

  // Mettre à jour la base de données
  await prisma.user.update({
    where: { id: user.id },
    data: { signatureUrl: null },
  });

  res.status(200).json({
    success: true,
    message: 'Signature supprimée avec succès',
  });
};
