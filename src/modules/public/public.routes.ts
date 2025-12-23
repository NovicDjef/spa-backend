import { Router } from 'express';
import {
  getAllServices,
  getServiceBySlug,
  getAllPackages,
  getPackageBySlug,
  getGymMemberships,
  getAvailableProfessionals,
} from './services.controller';
import { getAvailableSlots } from '../calendar/calendar.controller';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/public/services
 * @desc    Récupérer toutes les catégories avec leurs services
 * @access  Public
 */
router.get('/services', asyncHandler(getAllServices));

/**
 * @route   GET /api/public/services/:slug
 * @desc    Récupérer un service par son slug
 * @access  Public
 */
router.get('/services/:slug', asyncHandler(getServiceBySlug));

/**
 * @route   GET /api/public/packages
 * @desc    Récupérer tous les forfaits
 * @access  Public
 */
router.get('/packages', asyncHandler(getAllPackages));

/**
 * @route   GET /api/public/packages/:slug
 * @desc    Récupérer un forfait par son slug
 * @access  Public
 */
router.get('/packages/:slug', asyncHandler(getPackageBySlug));

/**
 * @route   GET /api/public/gym-memberships
 * @desc    Récupérer tous les types d'abonnements gym
 * @access  Public
 */
router.get('/gym-memberships', asyncHandler(getGymMemberships));

/**
 * @route   GET /api/public/professionals
 * @desc    Récupérer les professionnels disponibles
 * @access  Public
 */
router.get('/professionals', asyncHandler(getAvailableProfessionals));

/**
 * @route   GET /api/public/available-slots
 * @desc    Récupérer les créneaux horaires disponibles
 * @access  Public
 */
router.get('/available-slots', asyncHandler(getAvailableSlots));

export default router;
