"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_controller_1 = require("./services.controller");
const calendar_controller_1 = require("../calendar/calendar.controller");
const errorHandler_1 = require("../../middleware/errorHandler");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/public/services
 * @desc    Récupérer toutes les catégories avec leurs services
 * @access  Public
 */
router.get('/services', (0, errorHandler_1.asyncHandler)(services_controller_1.getAllServices));
/**
 * @route   GET /api/public/services/:slug
 * @desc    Récupérer un service par son slug
 * @access  Public
 */
router.get('/services/:slug', (0, errorHandler_1.asyncHandler)(services_controller_1.getServiceBySlug));
/**
 * @route   GET /api/public/packages
 * @desc    Récupérer tous les forfaits
 * @access  Public
 */
router.get('/packages', (0, errorHandler_1.asyncHandler)(services_controller_1.getAllPackages));
/**
 * @route   GET /api/public/packages/:slug
 * @desc    Récupérer un forfait par son slug
 * @access  Public
 */
router.get('/packages/:slug', (0, errorHandler_1.asyncHandler)(services_controller_1.getPackageBySlug));
/**
 * @route   GET /api/public/gym-memberships
 * @desc    Récupérer tous les types d'abonnements gym
 * @access  Public
 */
router.get('/gym-memberships', (0, errorHandler_1.asyncHandler)(services_controller_1.getGymMemberships));
/**
 * @route   GET /api/public/professionals
 * @desc    Récupérer les professionnels disponibles
 * @access  Public
 */
router.get('/professionals', (0, errorHandler_1.asyncHandler)(services_controller_1.getAvailableProfessionals));
/**
 * @route   GET /api/public/available-slots
 * @desc    Récupérer les créneaux horaires disponibles
 * @access  Public
 */
router.get('/available-slots', (0, errorHandler_1.asyncHandler)(calendar_controller_1.getAvailableSlots));
exports.default = router;
//# sourceMappingURL=public.routes.js.map