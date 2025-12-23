import { Request, Response } from 'express';
import prisma from '../../config/database';

/**
 * @desc    Récupérer toutes les catégories de services avec leurs services
 * @route   GET /api/public/services
 * @access  Public
 */
export const getAllServices = async (req: Request, res: Response) => {
  const { categoryName } = req.query;

  const where: any = {
    isActive: true,
  };

  if (categoryName) {
    where.category = {
      name: categoryName as string,
    };
  }

  // Récupérer les catégories avec leurs services actifs
  const categories = await prisma.serviceCategory.findMany({
    where: {
      isActive: true,
    },
    include: {
      services: {
        where: {
          isActive: true,
        },
        orderBy: {
          price: 'asc',
        },
      },
    },
    orderBy: {
      displayOrder: 'asc',
    },
  });

  return res.json({
    success: true,
    data: categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      services: category.services.map((service) => ({
        id: service.id,
        name: service.name,
        slug: service.slug,
        description: service.description,
        duration: service.duration,
        price: parseFloat(service.price.toString()),
        imageUrl: service.imageUrl,
      })),
    })),
  });
};

/**
 * @desc    Récupérer un service par son slug
 * @route   GET /api/public/services/:slug
 * @access  Public
 */
export const getServiceBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service non trouvé',
    });
  }

  if (!service.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Ce service n\'est plus disponible',
    });
  }

  return res.json({
    success: true,
    data: {
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      duration: service.duration,
      price: parseFloat(service.price.toString()),
      imageUrl: service.imageUrl,
      requiresProfessional: service.requiresProfessional,
      category: service.category,
    },
  });
};

/**
 * @desc    Récupérer tous les forfaits disponibles
 * @route   GET /api/public/packages
 * @access  Public
 */
export const getAllPackages = async (req: Request, res: Response) => {
  const packages = await prisma.package.findMany({
    where: {
      isActive: true,
    },
    include: {
      services: {
        include: {
          service: {
            select: {
              name: true,
              duration: true,
            },
          },
        },
      },
    },
    orderBy: {
      price: 'asc',
    },
  });

  return res.json({
    success: true,
    data: packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      slug: pkg.slug,
      description: pkg.description,
      variant: pkg.variant,
      price: parseFloat(pkg.price.toString()),
      imageUrl: pkg.imageUrl,
      services: pkg.services.map((ps) => ({
        serviceName: ps.service.name,
        quantity: ps.quantity,
        isOptional: ps.isOptional,
      })),
    })),
  });
};

/**
 * @desc    Récupérer un forfait par son slug
 * @route   GET /api/public/packages/:slug
 * @access  Public
 */
export const getPackageBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  const packageItem = await prisma.package.findUnique({
    where: { slug },
    include: {
      services: {
        include: {
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!packageItem) {
    return res.status(404).json({
      success: false,
      message: 'Forfait non trouvé',
    });
  }

  if (!packageItem.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Ce forfait n\'est plus disponible',
    });
  }

  return res.json({
    success: true,
    data: {
      id: packageItem.id,
      name: packageItem.name,
      slug: packageItem.slug,
      description: packageItem.description,
      variant: packageItem.variant,
      price: parseFloat(packageItem.price.toString()),
      imageUrl: packageItem.imageUrl,
      services: packageItem.services.map((ps) => ({
        serviceId: ps.service.id,
        serviceName: ps.service.name,
        serviceDuration: ps.service.duration,
        serviceDescription: ps.service.description,
        quantity: ps.quantity,
        isOptional: ps.isOptional,
        extraCost: ps.extraCost ? parseFloat(ps.extraCost.toString()) : null,
      })),
    },
  });
};

/**
 * @desc    Récupérer tous les types d'abonnements gym
 * @route   GET /api/public/gym-memberships
 * @access  Public
 */
export const getGymMemberships = async (req: Request, res: Response) => {
  const memberships = await prisma.gymMembership.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  });

  return res.json({
    success: true,
    data: memberships.map((membership) => ({
      id: membership.id,
      type: membership.type,
      name: membership.name,
      price: parseFloat(membership.price.toString()),
      duration: membership.duration,
      description: membership.description,
    })),
  });
};

/**
 * @desc    Récupérer les professionnels disponibles pour un service
 * @route   GET /api/public/professionals
 * @access  Public
 */
export const getAvailableProfessionals = async (
  req: Request,
  res: Response
) => {
  const { serviceType } = req.query;

  const where: any = {
    isActive: true,
    role: {
      in: ['MASSOTHERAPEUTE', 'ESTHETICIENNE'],
    },
  };

  // Filtrer par type de service si spécifié
  if (serviceType === 'MASSOTHERAPIE') {
    where.role = 'MASSOTHERAPEUTE';
  } else if (serviceType === 'ESTHETIQUE') {
    where.role = 'ESTHETICIENNE';
  }

  const professionals = await prisma.user.findMany({
    where,
    select: {
      id: true,
      nom: true,
      prenom: true,
      photoUrl: true,
      role: true,
    },
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
  });

  return res.json({
    success: true,
    data: professionals.map((prof) => ({
      id: prof.id,
      name: `${prof.prenom} ${prof.nom}`,
      photoUrl: prof.photoUrl,
      speciality: prof.role === 'MASSOTHERAPEUTE' ? 'Massothérapie' : 'Esthétique',
    })),
  });
};
