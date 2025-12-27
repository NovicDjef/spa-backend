"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const review_controller_1 = require("./review.controller");
const router = (0, express_1.Router)();
// Route publique - Créer un avis
router.post('/', (0, errorHandler_1.asyncHandler)(review_controller_1.createReview));
// Route protégée - Récupérer tous les avis (ADMIN uniquement)
// IMPORTANT: Cette route DOIT être AVANT /:professionalId pour éviter les conflits
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(review_controller_1.getAllReviews));
// Route publique - Récupérer les avis d'un professionnel
router.get('/:professionalId', (0, errorHandler_1.asyncHandler)(review_controller_1.getReviewsByProfessional));
exports.default = router;
//# sourceMappingURL=review.routes.js.map