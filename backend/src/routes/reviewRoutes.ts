/**
 * Review Routes
 * Routes for review endpoints
 */

import express from "express";
import * as reviewController from "../controllers/reviewController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/v1/reviews
 * Create a review for an order
 */
router.post("/", reviewController.createReview);

/**
 * GET /api/v1/reviews/my-reviews
 * Get user's reviews
 */
router.get("/my-reviews", reviewController.getMyReviews);

/**
 * GET /api/v1/reviews/:id
 * Get review by ID
 */
router.get("/:id", reviewController.getReviewById);

/**
 * PUT /api/v1/reviews/:id
 * Update review
 */
router.put("/:id", reviewController.updateReview);

/**
 * DELETE /api/v1/reviews/:id
 * Delete review
 */
router.delete("/:id", reviewController.deleteReview);

export default router;
