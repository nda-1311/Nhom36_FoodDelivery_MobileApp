/**
 * Order Routes
 *
 * Defines all order-related routes (all protected):
 * - POST / - Create order from cart
 * - GET / - Get user's orders
 * - GET /:id - Get order by ID
 * - PUT /:id/status - Update order status (admin/restaurant)
 * - POST /:id/cancel - Cancel order
 * - GET /:id/tracking - Get order tracking history
 */

import { Router } from "express";
import * as orderController from "../controllers/orderController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All order routes require authentication
router.use(authenticateToken);

// Order routes
router.post("/", orderController.createOrder);
router.get("/", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);
router.put("/:id/status", orderController.updateOrderStatus);
router.post("/:id/cancel", orderController.cancelOrder);
router.get("/:id/tracking", orderController.getOrderTracking);

export default router;
