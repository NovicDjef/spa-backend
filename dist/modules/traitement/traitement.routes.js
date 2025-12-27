"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const traitementController = __importStar(require("./traitement.controller"));
const auth_1 = require("../auth/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/traitements/:clientId
 * @desc    Récupérer tous les traitements d'un client
 * @access  Privé (Professionnels uniquement)
 */
router.get('/:clientId', auth_1.authenticate, (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE'), (0, errorHandler_1.asyncHandler)(traitementController.getTraitementsByClient));
/**
 * @route   POST /api/traitements/:clientId
 * @desc    Ajouter un traitement à un dossier client
 * @access  Privé (Professionnels uniquement)
 */
router.post('/:clientId', auth_1.authenticate, (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE'), (0, errorHandler_1.asyncHandler)(traitementController.createTraitement));
/**
 * @route   PUT /api/traitements/:traitementId
 * @desc    Modifier un traitement
 * @access  Privé (Professionnels uniquement)
 */
router.put('/:traitementId', auth_1.authenticate, (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE'), (0, errorHandler_1.asyncHandler)(traitementController.updateTraitement));
/**
 * @route   DELETE /api/traitements/:traitementId
 * @desc    Supprimer un traitement
 * @access  Privé (Professionnels uniquement)
 */
router.delete('/:traitementId', auth_1.authenticate, (0, auth_1.authorize)('MASSOTHERAPEUTE', 'ESTHETICIENNE'), (0, errorHandler_1.asyncHandler)(traitementController.deleteTraitement));
exports.default = router;
//# sourceMappingURL=traitement.routes.js.map