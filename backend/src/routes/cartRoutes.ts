/**
 * Cart Routes
 *
 * Defines all cart-related routes (all protected):
 * - GET / - Get user's cart
 * - POST / - Add item to cart
 * - PUT /:id - Update cart item quantity
 * - DELETE /:id - Remove item from cart
 * - DELETE / - Clear entire cart
 * - GET /count - Get cart item count
 */

import { Router } from "express";
import * as cartController from "../controllers/cartController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All cart routes require authentication
router.use(authenticateToken);

// Cart routes
router.get("/count", cartController.getCartCount);
router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/:id", cartController.updateCartItem);
router.delete("/:id", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

export default router;
