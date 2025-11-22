/**
 * Seed Routes
 * Routes for database seeding (development only)
 */

import express from 'express';
import { seedDatabase } from '../controllers/seedController';

const router = express.Router();

/**
 * POST /api/seed
 * Seed database with sample data
 */
router.post('/', seedDatabase);

export default router;
