/**
 * Cart Service
 *
 * Handles all cart-related business logic:
 * - Get user cart
 * - Add item to cart
 * - Update cart item quantity
 * - Remove item from cart
 * - Clear cart
 * - Calculate cart totals
 */

import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

/**
 * Get or create user's cart
 */
const getOrCreateCart = async (userId: string) => {
  let cart = await db.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await db.cart.create({
      data: {
        id: `cart_${userId}`,
        userId,
        updatedAt: new Date(),
      },
    });
    logger.info(`Created new cart for user: ${userId}`);
  }

  return cart;
};

/**
 * Get user's cart with all items
 */
export const getUserCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);

  const cartItems = await db.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      menuItem: {
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              logo: true,
              deliveryFee: true,
              minOrderAmount: true,
              isOpen: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  // Get delivery fee (assuming all items from same restaurant for now)
  const deliveryFee =
    cartItems.length > 0 ? cartItems[0].menuItem.restaurant.deliveryFee : 0;

  const total = subtotal + deliveryFee;

  logger.info(`Retrieved cart for user ${userId}: ${cartItems.length} items`);

  return {
    items: cartItems,
    summary: {
      itemCount: cartItems.length,
      totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      deliveryFee,
      total,
    },
  };
};

/**
 * Add item to cart or update quantity if already exists
 */
export const addToCart = async (
  userId: string,
  menuItemId: string,
  quantity: number = 1,
  specialInstructions?: string
) => {
  // Verify menu item exists and is available
  const menuItem = await db.menuItem.findUnique({
    where: { id: menuItemId },
    include: {
      restaurant: {
        select: { isOpen: true, name: true },
      },
    },
  });

  if (!menuItem) {
    throw createError('Menu item not found', 404);
  }

  if (menuItem.status !== 'AVAILABLE') {
    throw createError('This menu item is currently unavailable', 400);
  }

  if (!menuItem.restaurant.isOpen) {
    throw createError(`${menuItem.restaurant.name} is currently closed`, 400);
  }

  const cart = await getOrCreateCart(userId);

  // Check if item already in cart
  const existingCartItem = await db.cartItem.findFirst({
    where: {
      cartId: cart.id,
      menuItemId,
    },
  });

  let cartItem;

  if (existingCartItem) {
    // Update quantity
    cartItem = await db.cartItem.update({
      where: { id: existingCartItem.id },
      data: {
        quantity: existingCartItem.quantity + quantity,
        specialInstructions:
          specialInstructions || existingCartItem.specialInstructions,
        updatedAt: new Date(),
      },
      include: {
        menuItem: {
          include: {
            restaurant: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    logger.info(
      `Updated cart item quantity for user ${userId}: ${menuItemId} (${cartItem.quantity})`
    );
  } else {
    // Add new item
    cartItem = await db.cartItem.create({
      data: {
        cartId: cart.id,
        menuItemId,
        quantity,
        specialInstructions,
        updatedAt: new Date(),
      },
      include: {
        menuItem: {
          include: {
            restaurant: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    logger.info(
      `Added item to cart for user ${userId}: ${menuItemId} (qty: ${quantity})`
    );
  }

  return cartItem;
};

/**
 * Update cart item quantity
 */
export const updateCartItemQuantity = async (
  userId: string,
  cartItemId: string,
  quantity: number
) => {
  if (quantity < 1) {
    throw createError('Quantity must be at least 1', 400);
  }

  const cart = await getOrCreateCart(userId);

  // Verify cart item belongs to user's cart
  const existingItem = await db.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!existingItem) {
    throw createError('Cart item not found', 404);
  }

  if (existingItem.cartId !== cart.id) {
    throw createError('Unauthorized to update this cart item', 403);
  }

  // Update quantity
  const cartItem = await db.cartItem.update({
    where: { id: cartItemId },
    data: {
      quantity,
      updatedAt: new Date(),
    },
    include: {
      menuItem: {
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      },
    },
  });

  logger.info(
    `Updated cart item ${cartItemId} quantity to ${quantity} for user ${userId}`
  );

  return cartItem;
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (userId: string, cartItemId: string) => {
  const cart = await getOrCreateCart(userId);

  // Verify cart item belongs to user's cart
  const existingItem = await db.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!existingItem) {
    throw createError('Cart item not found', 404);
  }

  if (existingItem.cartId !== cart.id) {
    throw createError('Unauthorized to remove this cart item', 403);
  }

  // Delete item
  await db.cartItem.delete({
    where: { id: cartItemId },
  });

  logger.info(`Removed cart item ${cartItemId} for user ${userId}`);

  return { message: 'Item removed from cart' };
};

/**
 * Clear entire cart for user
 */
export const clearCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);

  const result = await db.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  logger.info(`Cleared cart for user ${userId}: ${result.count} items removed`);

  return {
    message: 'Cart cleared successfully',
    itemsRemoved: result.count,
  };
};

/**
 * Get cart item count for user
 */
export const getCartItemCount = async (userId: string): Promise<number> => {
  const cart = await getOrCreateCart(userId);

  const count = await db.cartItem.count({
    where: { cartId: cart.id },
  });

  return count;
};
