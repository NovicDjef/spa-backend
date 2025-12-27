import multer from 'multer';
import path from 'path';
import { AppError } from '../middleware/errorHandler';

// Configuration pour l'upload de signatures
const signatureStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/signatures/');
  },
  filename: (req, file, cb) => {
    // @ts-ignore - req.user existe grâce au middleware authenticate
    const userId = req.user!.id;
    const ext = path.extname(file.originalname);
    const filename = `${userId}_signature${ext}`;
    cb(null, filename);
  },
});

// Filter pour accepter uniquement les images
const imageFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Seuls les fichiers PNG et JPG sont autorisés', 400));
  }
};

// Export du middleware multer pour les signatures
export const uploadSignatureMiddleware = multer({
  storage: signatureStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB maximum
  },
  fileFilter: imageFilter,
});
