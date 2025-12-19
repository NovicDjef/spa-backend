import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './modules/auth/auth.routes';
import clientRoutes from './modules/clients/client.routes';
import noteRoutes from './modules/notes/note.routes';
import assignmentRoutes from './modules/assignments/assignment.routes';
import professionalRoutes from './modules/professionals/professional.routes';
import userRoutes from './modules/users/user.routes';
import marketingRoutes from './modules/marketing/marketing.routes';

// Middleware d'erreur
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Sécurité
app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://dospa.novic.dev',
  'http://192.168.1.86:3000',
  'http://192.168.1.86:3001',
  'http://192.168.1.86:3002',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true, // En développement, permet toutes les origines
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);
app.set('trust proxy', 1);

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
app.use('/api/users', userRoutes);
app.use('/api/marketing', marketingRoutes);

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
       → POST   /api/auth/login
       → POST   /api/clients (public)
       → GET    /api/clients
       → POST   /api/users (admin - créer employé)
       → GET    /api/users (admin - liste employés)
       → POST   /api/assignments
       → POST   /api/notes/:clientId
       → GET    /api/marketing/contacts (admin - marketing)
       → POST   /api/marketing/send-email/campaign (admin)
    `);
  });
}

export default app;
