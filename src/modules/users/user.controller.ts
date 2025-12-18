import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
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
    },
    select: {
      id: true,
      email: true,
      telephone: true,
      nom: true,
      prenom: true,
      role: true,
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
  const { role, search } = req.query;

  let where: any = {};

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
    select: {
      id: true,
      email: true,
      telephone: true,
      nom: true,
      prenom: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          assignedClients: true,
          notesCreated: true,
        },
      },
    },
    orderBy: [
      { role: 'asc' },
      { nom: 'asc' },
    ],
  });

  res.status(200).json({
    success: true,
    data: users,
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
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    throw new AppError('Le statut isActive doit être un booléen', 400);
  }

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
  if (user.role === 'ADMIN' && !isActive) {
    throw new AppError('Vous ne pouvez pas désactiver un compte administrateur', 400);
  }

  // Mettre à jour le statut
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive },
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
    message: isActive
      ? `Employé ${updatedUser.nom} ${updatedUser.prenom} activé avec succès`
      : `Employé ${updatedUser.nom} ${updatedUser.prenom} désactivé avec succès`,
    data: updatedUser,
  });
};
