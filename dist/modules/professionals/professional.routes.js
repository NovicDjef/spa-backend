"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const professional_controller_1 = require("./professional.controller");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent une authentification
router.use(auth_1.authenticate);
// Récupérer la liste des professionnels (SECRETAIRE, ADMIN uniquement)
router.get('/', (0, auth_1.authorize)('SECRETAIRE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(professional_controller_1.getProfessionals));
// Récupérer un professionnel par ID (SECRETAIRE, ADMIN uniquement)
router.get('/:id', (0, auth_1.authorize)('SECRETAIRE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(professional_controller_1.getProfessionalById));
// Récupérer les statistiques d'un professionnel
router.get('/:id/stats', (0, errorHandler_1.asyncHandler)(professional_controller_1.getProfessionalStats));
exports.default = router;
//# sourceMappingURL=professional.routes.js.map