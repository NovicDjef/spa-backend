"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUserStatus = exports.resetPassword = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.createUser = void 0;
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
// Schéma de validation pour la création d'un employé
const createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    telephone: zod_1.z.string().min(10, 'Le téléphone doit contenir au moins 10 caractères'),
    password: zod_1.z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    role: zod_1.z.enum(['SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN']),
    nom: zod_1.z.string().min(1, 'Le nom est requis'),
    prenom: zod_1.z.string().min(1, 'Le prénom est requis'),
});
/**
 * @desc    Créer un employé (par l'admin)
 * @route   POST /api/users
 * @access  Privé (ADMIN uniquement)
 */
const createUser = async (req, res) => {
    // Validation
    const validatedData = createUserSchema.parse(req.body);
    // Vérifier si l'email existe déjà
    const existingEmail = await database_1.default.user.findUnique({
        where: { email: validatedData.email },
    });
    if (existingEmail) {
        throw new errorHandler_1.AppError('Cet email est déjà utilisé', 400);
    }
    // Vérifier si le téléphone existe déjà
    const existingPhone = await database_1.default.user.findUnique({
        where: { telephone: validatedData.telephone },
    });
    if (existingPhone) {
        throw new errorHandler_1.AppError('Ce numéro de téléphone est déjà utilisé', 400);
    }
    // Hasher le mot de passe
    const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 12);
    // Créer l'utilisateur
    const user = await database_1.default.user.create({
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
exports.createUser = createUser;
/**
 * @desc    Récupérer tous les employés
 * @route   GET /api/users
 * @access  Privé (ADMIN uniquement)
 */
const getAllUsers = async (req, res) => {
    const { role, search } = req.query;
    let where = {};
    // Filtrer par rôle
    if (role && ['SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN'].includes(role)) {
        where.role = role;
    }
    // Recherche
    if (search) {
        where.OR = [
            { nom: { contains: search, mode: 'insensitive' } },
            { prenom: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { telephone: { contains: search } },
        ];
    }
    const users = await database_1.default.user.findMany({
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
exports.getAllUsers = getAllUsers;
/**
 * @desc    Récupérer un employé par ID
 * @route   GET /api/users/:id
 * @access  Privé (ADMIN uniquement)
 */
const getUserById = async (req, res) => {
    const { id } = req.params;
    const user = await database_1.default.user.findUnique({
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
        throw new errorHandler_1.AppError('Employé non trouvé', 404);
    }
    res.status(200).json({
        success: true,
        data: user,
    });
};
exports.getUserById = getUserById;
/**
 * @desc    Mettre à jour un employé
 * @route   PUT /api/users/:id
 * @access  Privé (ADMIN uniquement)
 */
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, telephone, nom, prenom, role, password } = req.body;
    // Vérifier que l'employé existe
    const existingUser = await database_1.default.user.findUnique({
        where: { id },
    });
    if (!existingUser) {
        throw new errorHandler_1.AppError('Employé non trouvé', 404);
    }
    // Préparer les données de mise à jour
    const updateData = {};
    if (email) {
        // Vérifier l'unicité de l'email
        const emailExists = await database_1.default.user.findFirst({
            where: {
                email,
                id: { not: id },
            },
        });
        if (emailExists) {
            throw new errorHandler_1.AppError('Cet email est déjà utilisé', 400);
        }
        updateData.email = email;
    }
    if (telephone) {
        // Vérifier l'unicité du téléphone
        const phoneExists = await database_1.default.user.findFirst({
            where: {
                telephone,
                id: { not: id },
            },
        });
        if (phoneExists) {
            throw new errorHandler_1.AppError('Ce numéro de téléphone est déjà utilisé', 400);
        }
        updateData.telephone = telephone;
    }
    if (nom)
        updateData.nom = nom;
    if (prenom)
        updateData.prenom = prenom;
    if (role)
        updateData.role = role;
    // Si un nouveau mot de passe est fourni
    if (password) {
        updateData.password = await bcryptjs_1.default.hash(password, 12);
    }
    // Mettre à jour
    const updatedUser = await database_1.default.user.update({
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
    const response = {
        success: true,
        message: 'Employé mis à jour avec succès',
        data: updatedUser,
    };
    if (password) {
        response.data.plainPassword = password;
    }
    res.status(200).json(response);
};
exports.updateUser = updateUser;
/**
 * @desc    Supprimer un employé
 * @route   DELETE /api/users/:id
 * @access  Privé (ADMIN uniquement)
 */
const deleteUser = async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user.id;
    // Empêcher l'admin de se supprimer lui-même
    if (id === currentUserId) {
        throw new errorHandler_1.AppError('Vous ne pouvez pas supprimer votre propre compte', 400);
    }
    // Vérifier que l'employé existe
    const user = await database_1.default.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new errorHandler_1.AppError('Employé non trouvé', 404);
    }
    // Supprimer
    await database_1.default.user.delete({
        where: { id },
    });
    res.status(200).json({
        success: true,
        message: 'Employé supprimé avec succès',
    });
};
exports.deleteUser = deleteUser;
/**
 * @desc    Réinitialiser le mot de passe d'un employé
 * @route   POST /api/users/:id/reset-password
 * @access  Privé (ADMIN uniquement)
 */
const resetPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        throw new errorHandler_1.AppError('Le mot de passe doit contenir au moins 6 caractères', 400);
    }
    // Vérifier que l'employé existe
    const user = await database_1.default.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new errorHandler_1.AppError('Employé non trouvé', 404);
    }
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
    // Mettre à jour
    await database_1.default.user.update({
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
exports.resetPassword = resetPassword;
/**
 * @desc    Activer/Désactiver un employé
 * @route   PATCH /api/users/:id/toggle-status
 * @access  Privé (ADMIN uniquement)
 */
const toggleUserStatus = async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
        throw new errorHandler_1.AppError('Le statut isActive doit être un booléen', 400);
    }
    // Vérifier que l'employé existe
    const user = await database_1.default.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new errorHandler_1.AppError('Employé non trouvé', 404);
    }
    // Empêcher l'admin de se désactiver lui-même
    if (user.id === req.user.id) {
        throw new errorHandler_1.AppError('Vous ne pouvez pas désactiver votre propre compte', 400);
    }
    // Empêcher de désactiver un autre ADMIN
    if (user.role === 'ADMIN' && !isActive) {
        throw new errorHandler_1.AppError('Vous ne pouvez pas désactiver un compte administrateur', 400);
    }
    // Mettre à jour le statut
    const updatedUser = await database_1.default.user.update({
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
exports.toggleUserStatus = toggleUserStatus;
//# sourceMappingURL=user.controller.js.map