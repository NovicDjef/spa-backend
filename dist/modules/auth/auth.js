"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../../middleware/errorHandler");
const database_1 = __importDefault(require("../../config/database"));
const authenticate = async (req, res, next) => {
    try {
        // Récupérer le token du header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('Token d\'authentification manquant', 401);
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new errorHandler_1.AppError('Token invalide', 401);
        }
        // Vérifier le token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Vérifier que l'utilisateur existe toujours
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
            },
        });
        if (!user) {
            throw new errorHandler_1.AppError('Utilisateur non trouvé', 401);
        }
        // Vérifier que l'employé est actif (sauf pour les ADMIN)
        if (!user.isActive && user.role !== 'ADMIN') {
            throw new errorHandler_1.AppError('Votre compte a été désactivé. Contactez un administrateur.', 403);
        }
        // Attacher l'utilisateur à la requête
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new errorHandler_1.AppError('Token invalide', 401));
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new errorHandler_1.AppError('Token expiré', 401));
        }
        next(error);
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.AppError('Non authentifié', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_1.AppError('Vous n\'avez pas les permissions nécessaires', 403));
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map