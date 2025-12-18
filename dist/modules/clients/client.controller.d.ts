import { Request, Response } from 'express';
import { AuthRequest } from '../auth/auth';
/**
 * @desc    Créer un nouveau client (SANS compte utilisateur)
 * @route   POST /api/clients
 * @access  Public
 */
export declare const createClient: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    Récupérer tous les clients (avec permissions par rôle)
 * @route   GET /api/clients
 * @access  Privé (Professionnels uniquement)
 */
export declare const getClients: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Récupérer un client par ID (avec vérification des permissions)
 * @route   GET /api/clients/:id
 * @access  Privé (Professionnels uniquement)
 */
export declare const getClientById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Mettre à jour un client
 * @route   PUT /api/clients/:id
 * @access  Privé (Professionnels)
 */
export declare const updateClient: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Supprimer un client
 * @route   DELETE /api/clients/:id
 * @access  Privé (Professionnels)
 */
export declare const deleteClient: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @desc    Rechercher des clients
 * @route   GET /api/clients/search/:query
 * @access  Privé (Professionnels)
 */
export declare const searchClients: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=client.controller.d.ts.map