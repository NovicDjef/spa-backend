"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }
    // Erreurs Prisma
    if (err.name === 'PrismaClientKnownRequestError') {
        return res.status(400).json({
            success: false,
            error: 'Erreur de base de données',
            ...(process.env.NODE_ENV === 'development' && { details: err.message })
        });
    }
    // Erreurs de validation
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Erreur de validation',
            details: err.message
        });
    }
    // Erreur générique
    console.error('ERROR:', err);
    return res.status(500).json({
        success: false,
        error: 'Une erreur interne est survenue',
        ...(process.env.NODE_ENV === 'development' && {
            message: err.message,
            stack: err.stack
        })
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map