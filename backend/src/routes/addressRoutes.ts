/**
 * Address Routes
 * Routes for address management endpoints
 */

import express from "express";
import * as addressController from "../controllers/addressController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/v1/addresses
 * Create a new address
 */
router.post("/", addressController.createAddress);

/**
 * GET /api/v1/addresses
 * Get user's addresses
 */
router.get("/", addressController.getUserAddresses);

/**
 * GET /api/v1/addresses/:id
 * Get address by ID
 */
router.get("/:id", addressController.getAddressById);

/**
 * PUT /api/v1/addresses/:id
 * Update address
 */
router.put("/:id", addressController.updateAddress);

/**
 * PUT /api/v1/addresses/:id/default
 * Set address as default
 */
router.put("/:id/default", addressController.setDefaultAddress);

/**
 * DELETE /api/v1/addresses/:id
 * Delete address
 */
router.delete("/:id", addressController.deleteAddress);

export default router;
