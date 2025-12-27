"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const assignment_controller_1 = require("./assignment.controller");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent une authentification
router.use(auth_1.authenticate);
// IMPORTANT: La route GET / doit être AVANT la route POST /
// pour éviter que GET / soit interprété comme POST /:quelquechose
// Récupérer TOUTES les assignations (SECRETAIRE, ADMIN uniquement)
router.get('/', (0, auth_1.authorize)('SECRETAIRE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(assignment_controller_1.getAllAssignments));
// Assigner un client à un professionnel (SECRETAIRE, ADMIN uniquement)
router.post('/', (0, auth_1.authorize)('SECRETAIRE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(assignment_controller_1.assignClient));
// Supprimer une assignation (SECRETAIRE, ADMIN uniquement)
router.delete('/:clientId/:professionalId', (0, auth_1.authorize)('SECRETAIRE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(assignment_controller_1.removeAssignment));
// Récupérer les assignations d'un client (SECRETAIRE, ADMIN uniquement)
router.get('/client/:clientId', (0, auth_1.authorize)('SECRETAIRE', 'ADMIN'), (0, errorHandler_1.asyncHandler)(assignment_controller_1.getClientAssignments));
// Récupérer les clients assignés à un professionnel
router.get('/professional/:professionalId', (0, errorHandler_1.asyncHandler)(assignment_controller_1.getProfessionalAssignments));
exports.default = router;
//# sourceMappingURL=assignment.routes.js.map