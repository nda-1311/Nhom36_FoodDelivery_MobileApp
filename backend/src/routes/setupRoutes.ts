/**
 * TEMPORARY ADMIN SETUP ENDPOINT - DELETE AFTER USE
 *
 * This endpoint allows updating a user's role to ADMIN
 * Should be removed after initial admin setup
 */

import { Request, Response, Router } from "express";
import { db } from "../config/database";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.post(
  "/make-admin",
  asyncHandler(async (req: Request, res: Response) => {
    const { email, secretKey } = req.body;

    // Simple secret key check (you can change this)
    if (secretKey !== "TEMP_ADMIN_SETUP_2024") {
      return res.status(403).json({
        success: false,
        message: "Invalid secret key",
      });
    }

    const user = await db.user.update({
      where: { email },
      data: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    res.json({
      success: true,
      message: "User updated to ADMIN successfully",
      data: user,
    });
  })
);

router.get(
  "/test-models",
  asyncHandler(async (req: Request, res: Response) => {
    const userCount = await db.user.count();
    const restaurantCount = await db.restaurant.count();
    const orderCount = await db.order.count();

    res.json({
      success: true,
      models: {
        users: userCount,
        restaurants: restaurantCount,
        orders: orderCount,
      },
    });
  })
);

export default router;
