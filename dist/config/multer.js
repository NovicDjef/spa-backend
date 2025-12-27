"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSignatureMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("../middleware/errorHandler");
// Configuration pour l'upload de signatures
const signatureStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/signatures/');
    },
    filename: (req, file, cb) => {
        // @ts-ignore - req.user existe grâce au middleware authenticate
        const userId = req.user.id;
        const ext = path_1.default.extname(file.originalname);
        const filename = `${userId}_signature${ext}`;
        cb(null, filename);
    },
});
// Filter pour accepter uniquement les images
const imageFilter = (_req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new errorHandler_1.AppError('Seuls les fichiers PNG et JPG sont autorisés', 400));
    }
};
// Export du middleware multer pour les signatures
exports.uploadSignatureMiddleware = (0, multer_1.default)({
    storage: signatureStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB maximum
    },
    fileFilter: imageFilter,
});
//# sourceMappingURL=multer.js.map