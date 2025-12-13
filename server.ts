import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './src/modules/auth/auth.routes';
import clientRoutes from './src/modules/clients/client.routes';
import noteRoutes from './src/modules/notes/note.routes';
import assignmentRoutes from './src/modules/assignments/assignment.routes';
import professionalRoutes from './src/modules/professionals/professional.routes';

// Middleware d'erreur
import { errorHandler } from './src/middleware/errorHandler';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Sécurité
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'API de gestion de spa opérationnelle',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/professionals', professionalRoutes);

// Route 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path
  });
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Démarrage du serveur
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║   🌸 API Gestion de Spa - Démarrée   ║
    ╚════════════════════════════════════════╝
    
    📍 Serveur: http://localhost:${PORT}
    🏥 Health: http://localhost:${PORT}/health
    🔧 Mode: ${process.env.NODE_ENV}
    🌐 CORS: ${process.env.FRONTEND_URL}
    
    📚 Routes disponibles:
       → POST   /api/auth/register
       → POST   /api/auth/login
       → GET    /api/clients
       → POST   /api/clients (public)
       → GET    /api/clients/:id
       → GET    /api/notes/:clientId
       → POST   /api/notes/:clientId
       → POST   /api/assignments
       → GET    /api/professionals
    `);
  });
}

export default app;
