"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Routes
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const client_routes_1 = __importDefault(require("./modules/clients/client.routes"));
const note_routes_1 = __importDefault(require("./modules/notes/note.routes"));
const assignment_routes_1 = __importDefault(require("./modules/assignments/assignment.routes"));
const professional_routes_1 = __importDefault(require("./modules/professionals/professional.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const marketing_routes_1 = __importDefault(require("./modules/marketing/marketing.routes"));
// Middleware d'erreur
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Sécurité
app.use((0, helmet_1.default)());
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
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true, // En développement, permet toutes les origines
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// Parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Compression
app.use((0, compression_1.default)());
// Logging
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'API de gestion de spa opérationnelle',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});
// Routes API
app.use('/api/auth', auth_routes_1.default);
app.use('/api/clients', client_routes_1.default);
app.use('/api/notes', note_routes_1.default);
app.use('/api/assignments', assignment_routes_1.default);
app.use('/api/professionals', professional_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/marketing', marketing_routes_1.default);
// Route 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Route non trouvée',
        path: req.path
    });
});
// Middleware de gestion d'erreurs
app.use(errorHandler_1.errorHandler);
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
exports.default = app;
//# sourceMappingURL=server.js.map