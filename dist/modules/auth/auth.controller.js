"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
// Schémas de validation
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    telephone: zod_1.z.string().min(10, 'Le téléphone doit contenir au moins 10 caractères'),
    password: zod_1.z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    role: zod_1.z.enum(['SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN']),
    nom: zod_1.z.string().min(1, 'Le nom est requis'),
    prenom: zod_1.z.string().min(1, 'Le prénom est requis'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string().min(1, 'Le mot de passe est requis'),
});
/**
 * Générer un token JWT
 */
const generateToken = (userId, email, role) => {
    return jsonwebtoken_1.default.sign({ id: userId, email, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};
/**
 * @desc    Inscription d'un professionnel
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
    // Validation
    const validatedData = registerSchema.parse(req.body);
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
exports.register = register;
/**
 * @desc    Connexion
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    // Validation
    const validatedData = loginSchema.parse(req.body);
    // Trouver l'utilisateur
    const user = await database_1.default.user.findUnique({
        where: { email: validatedData.email },
    });
    if (!user || !user.password) {
        throw new errorHandler_1.AppError('Email ou mot de passe incorrect', 401);
    }
    // Vérifier le mot de passe
    const isPasswordValid = await bcryptjs_1.default.compare(validatedData.password, user.password);
    if (!isPasswordValid) {
        throw new errorHandler_1.AppError('Email ou mot de passe incorrect', 401);
    }
    // Vérifier que le compte est actif (sauf pour les ADMIN)
    if (!user.isActive && user.role !== 'ADMIN') {
        throw new errorHandler_1.AppError('Votre compte a été désactivé. Contactez un administrateur.', 403);
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
exports.login = login;
/**
 * @desc    Rafraîchir le token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        throw new errorHandler_1.AppError('Token manquant', 400);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Vérifier que l'utilisateur existe toujours
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            throw new errorHandler_1.AppError('Utilisateur non trouvé', 404);
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
    }
    catch (error) {
        throw new errorHandler_1.AppError('Token invalide ou expiré', 401);
    }
};
exports.refreshToken = refreshToken;
//# sourceMappingURL=auth.controller.js.map