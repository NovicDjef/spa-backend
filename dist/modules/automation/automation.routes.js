"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const automation_controller_1 = require("./automation.controller");
const router = (0, express_1.Router)();
// Toutes les routes sont protégées - ADMIN uniquement
// Routes pour les feedbacks clients
router.get('/feedbacks/stats', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(automation_controller_1.getFeedbackStats));
router.get('/feedbacks/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(automation_controller_1.getFeedbackById));
router.get('/feedbacks', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(automation_controller_1.getAllFeedbacks));
// Routes pour les logs d'emails
router.get('/email-logs/stats', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(automation_controller_1.getEmailStats));
router.get('/email-logs', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(automation_controller_1.getAllEmailLogs));
// Routes pour les notes avec statut d'email
router.get('/notes', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(automation_controller_1.getNotesWithEmailStatus));
exports.default = router;
//# sourceMappingURL=automation.routes.js.map