"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const professional_controller_1 = require("./professional.controller");
const router = (0, express_1.Router)();
// Route publique - PAS d'authentification
router.get('/public', (0, errorHandler_1.asyncHandler)(professional_controller_1.getPublicProfessionals));
// Récupérer la liste des professionnels (SECRETAIRE, ADMIN uniquement)
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('SECRETAIRE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(professional_controller_1.getProfessionals));
// Récupérer les statistiques d'un professionnel (AVANT /:id pour éviter les conflits)
router.get('/:id/stats', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(professional_controller_1.getProfessionalStats));
// Récupérer un professionnel par ID (SECRETAIRE, ADMIN uniquement)
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)('SECRETAIRE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(professional_controller_1.getProfessionalById));
exports.default = router;
//# sourceMappingURL=professional.routes.js.map