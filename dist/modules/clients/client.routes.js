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
const clientController = __importStar(require("./client.controller"));
const auth_1 = require("../auth/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/clients
 * @desc    Créer un nouveau client (formulaire public)
 * @access  Public
 */
router.post('/', (0, errorHandler_1.asyncHandler)(clientController.createClient));
/**
 * @route   GET /api/clients
 * @desc    Récupérer tous les clients (avec recherche et filtres)
 * @access  Privé (Professionnels uniquement)
 */
router.get('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(clientController.getClients));
/**
 * @route   GET /api/clients/:id
 * @desc    Récupérer un client par ID
 * @access  Privé (Professionnels uniquement)
 */
router.get('/:id', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(clientController.getClientById));
/**
 * @route   PUT /api/clients/:id
 * @desc    Mettre à jour un client
 * @access  Privé (ADMIN uniquement)
 */
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(clientController.updateClient));
/**
 * @route   DELETE /api/clients/:id
 * @desc    Supprimer un client
 * @access  Privé (ADMIN uniquement)
 */
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, errorHandler_1.asyncHandler)(clientController.deleteClient));
/**
 * @route   GET /api/clients/search/:query
 * @desc    Rechercher des clients
 * @access  Privé (Professionnels uniquement)
 */
router.get('/search/:query', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(clientController.searchClients));
exports.default = router;
//# sourceMappingURL=client.routes.js.map