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

import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';
import {
  cacheMiddleware,
  invalidateCacheMiddleware,
} from '../middleware/cacheMiddleware';

const router = Router();

// All order routes require authentication
router.use(authenticateToken);

// Order routes
router.post(
  '/',
  invalidateCacheMiddleware({ patterns: ['orders:', 'cart:'] }),
  orderController.createOrder
);
router.get(
  '/',
  cacheMiddleware({
    ttl: 60,
    keyPrefix: 'orders:list',
    varyBy: ['userId', 'status'],
  }),
  orderController.getUserOrders
);
router.get(
  '/:id',
  cacheMiddleware({ ttl: 120, keyPrefix: 'orders:detail' }),
  orderController.getOrderById
);
router.put(
  '/:id/status',
  invalidateCacheMiddleware({ patterns: ['orders:'] }),
  orderController.updateOrderStatus
);
router.post(
  '/:id/cancel',
  invalidateCacheMiddleware({ patterns: ['orders:'] }),
  orderController.cancelOrder
);
router.get(
  '/:id/tracking',
  cacheMiddleware({ ttl: 30, keyPrefix: 'orders:tracking' }),
  orderController.getOrderTracking
);

export default router;
