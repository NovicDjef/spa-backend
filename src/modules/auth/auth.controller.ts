import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

// Schémas de validation
const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  telephone: z.string().min(10, 'Le téléphone doit contenir au moins 10 caractères'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: z.enum(['SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN']),
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

/**
 * Générer un token JWT
 */
const generateToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @desc    Inscription d'un professionnel
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response) => {
  // Validation
  const validatedData = registerSchema.parse(req.body);

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

  // Générer le token
  const token = generateToken(user.id, user.email, user.role);

  res.status(201).json({
    success: true,
    message: 'Inscription réussie',
    data: {
      user,
      token,
    },
  });
};

/**
 * @desc    Connexion
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
  // Validation
  const validatedData = loginSchema.parse(req.body);

  // Trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (!user || !user.password) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }

  // Vérifier le mot de passe
  const isPasswordValid = await bcrypt.compare(
    validatedData.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }

  // Vérifier que le compte est actif (sauf pour les ADMIN)
  if (!user.isActive && user.role !== 'ADMIN') {
    throw new AppError('Votre compte a été désactivé. Contactez un administrateur.', 403);
  }

  // Générer le token
  const token = generateToken(user.id, user.email, user.role);

  res.status(200).json({
    success: true,
    message: 'Connexion réussie',
    data: {
      user: {
        id: user.id,
        email: user.email,
        telephone: user.telephone,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
      },
      token,
    },
  });
};

/**
 * @desc    Rafraîchir le token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('Token manquant', 400);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role: string;
    };

    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Générer un nouveau token
    const newToken = generateToken(user.id, user.email, user.role);

    res.status(200).json({
      success: true,
      message: 'Token rafraîchi',
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    throw new AppError('Token invalide ou expiré', 401);
  }
};
