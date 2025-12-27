import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../../middleware/errorHandler';
import prisma from '../../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    signatureUrl?: string | null;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Récupérer le token du header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token d\'authentification manquant', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Token invalide', 401);
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role: string;
    };

    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        signatureUrl: true,
      },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 401);
    }

    // Vérifier que l'employé est actif (sauf pour les ADMIN)
    if (!user.isActive && user.role !== 'ADMIN') {
      throw new AppError('Votre compte a été désactivé. Contactez un administrateur.', 403);
    }

    // Attacher l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Token invalide', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expiré', 401));
    }
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Non authentifié', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Vous n\'avez pas les permissions nécessaires', 403)
      );
    }

    next();
  };
};
