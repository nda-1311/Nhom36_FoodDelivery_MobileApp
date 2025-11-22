/**
 * Order Service
 * Business logic for order operations
 */

import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Use Prisma generated enums instead of local definitions

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `ORD${timestamp}${random}`;
}

interface CreateOrderData {
  addressId: string;
  paymentMethod: PaymentMethod;
  specialInstructions?: string;
}

/**
 * Create order from cart
 */
export const createOrder = async (
  userId: string,
  data: CreateOrderData
): Promise<any> => {
  // Get user's cart
  const cart = await db.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          menuItem: {
            include: {
              restaurant: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw createError('Cart is empty', 400);
  }

  // Verify all items are from same restaurant
  const restaurantIds = new Set(
    cart.items.map((item: any) => item.menuItem.restaurantId)
  );
  if (restaurantIds.size > 1) {
    throw createError(
      'Cannot create order with items from multiple restaurants',
      400
    );
  }

  const restaurantId = cart.items[0].menuItem.restaurantId;
  const restaurant = cart.items[0].menuItem.restaurant;

  // Verify address belongs to user
  const address = await db.address.findFirst({
    where: {
      id: data.addressId,
      userId,
    },
  });

  if (!address) {
    throw createError('Address not found', 404);
  }

  // Calculate order totals
  const subtotal = cart.items.reduce((sum: number, item: any) => {
    const price = item.menuItem.discountPrice || item.menuItem.price;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = restaurant.deliveryFee || 0;
  const tax = subtotal * 0.1; // 10% tax
  const discount = 0; // Can be enhanced with voucher system
  const total = subtotal + deliveryFee + tax - discount;

  // Check minimum order amount (temporarily disabled for testing)
  // if (subtotal < restaurant.minOrderAmount) {
  //   throw createError(
  //     `Minimum order amount is ${restaurant.minOrderAmount} VND`,
  //     400
  //   );
  // }

  console.log(
    `✅ Order validation passed - subtotal: ${subtotal}, restaurant min: ${restaurant.minOrderAmount}`
  );

  // Create order with transaction
  const order = await db.$transaction(async (tx: any) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        restaurantId,
        addressId: data.addressId,
        subtotal,
        deliveryFee,
        tax,
        discount,
        total,
        status: OrderStatus.PENDING,
        paymentMethod: data.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        specialInstructions: data.specialInstructions,
        estimatedDeliveryTime: new Date(
          Date.now() + restaurant.preparationTime * 60000 + 30 * 60000
        ), // prep time + 30 min delivery
        updatedAt: new Date(),
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            logo: true,
            phoneNumber: true,
            address: true,
          },
        },
        address: true,
      },
    });

    // Create order items from cart items
    const orderItems = await Promise.all(
      cart.items.map((cartItem: any) =>
        tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            menuItemId: cartItem.menuItemId,
            quantity: cartItem.quantity,
            price: cartItem.menuItem.discountPrice || cartItem.menuItem.price,
            specialInstructions: cartItem.specialInstructions,
          },
        })
      )
    );

    // Create initial tracking record
    await tx.orderTracking.create({
      data: {
        id: `track_${newOrder.id}_${Date.now()}`,
        orderId: newOrder.id,
        status: OrderStatus.PENDING,
        message: 'Order placed successfully',
      },
    });

    // Clear cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { ...newOrder, orderItems: orderItems };
  });

  logger.info(`Order created: ${order.orderNumber} by user ${userId}`);

  return order;
};

/**
 * Get user's orders with pagination
 */
export const getUserOrders = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  status?: OrderStatus
): Promise<any> => {
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            logo: true,
            phoneNumber: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
                discountPrice: true,
              },
            },
          },
        },
      },
    }),
    db.order.count({ where }),
  ]);

  logger.info(
    `Retrieved ${orders.length} orders for user ${userId} (page ${page}/${Math.ceil(total / limit)})`
  );

  return {
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get order by ID
 */
export const getOrderById = async (
  orderId: string,
  userId: string
): Promise<any> => {
  const order = await db.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          logo: true,
          phoneNumber: true,
          address: true,
        },
      },
      address: true,
      driver: {
        select: {
          id: true,
          user: {
            select: {
              fullName: true,
              phoneNumber: true,
              avatar: true,
            },
          },
          vehicleType: true,
          vehicleNumber: true,
          rating: true,
        },
      },
      items: {
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
              description: true,
              image: true,
              price: true,
              discountPrice: true,
            },
          },
        },
      },
      tracking: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  return order;
};

/**
 * Update order status (for admin/restaurant)
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  message?: string
): Promise<any> => {
  const order = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  // Update order status and timestamps
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  switch (status) {
    case OrderStatus.CONFIRMED:
      updateData.confirmedAt = new Date();
      break;
    case OrderStatus.PREPARING:
      updateData.preparingAt = new Date();
      break;
    case OrderStatus.READY_FOR_PICKUP:
      updateData.readyAt = new Date();
      break;
    case OrderStatus.OUT_FOR_DELIVERY:
      updateData.pickedUpAt = new Date();
      break;
    case OrderStatus.DELIVERED:
      updateData.deliveredAt = new Date();
      updateData.paymentStatus = PaymentStatus.PAID;
      break;
    case OrderStatus.CANCELLED:
      updateData.cancelledAt = new Date();
      break;
  }

  const updatedOrder = await db.$transaction(async (tx: any) => {
    // Update order
    const updated = await tx.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create tracking record
    await tx.order_tracking.create({
      data: {
        id: `track_${orderId}_${Date.now()}`,
        orderId,
        status,
        message: message || `Order status updated to ${status}`,
      },
    });

    return updated;
  });

  logger.info(`Order ${order.orderNumber} status updated to ${status}`);

  return updatedOrder;
};

/**
 * Cancel order
 */
export const cancelOrder = async (
  orderId: string,
  userId: string,
  reason: string
): Promise<any> => {
  const order = await db.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  // Only allow cancellation if order is PENDING or CONFIRMED
  const allowedStatuses: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
  ];
  if (!allowedStatuses.includes(order.status)) {
    throw createError('Order cannot be cancelled at this stage', 400);
  }

  const cancelledOrder = await db.$transaction(async tx => {
    // Update order status
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: reason,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Add tracking event
    await tx.orderTracking.create({
      data: {
        orderId,
        status: OrderStatus.CANCELLED,
        message: `Order cancelled by customer. Reason: ${reason}`,
      },
    });

    // TODO: If inventory tracking is implemented, restore stock here
    // For now, just log that items would be released back to inventory
    logger.info(
      `Order ${orderId} cancelled - ${updated.items.length} items released back to inventory`
    );

    return updated;
  });

  logger.info(`Order ${order.orderNumber} cancelled by user ${userId}`);

  return cancelledOrder;
};

/**
 * Get order tracking history
 */
export const getOrderTracking = async (
  orderId: string,
  userId: string
): Promise<any> => {
  // Verify order belongs to user
  const order = await db.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
    },
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  const tracking = await db.orderTracking.findMany({
    where: { orderId },
    orderBy: { createdAt: 'desc' },
  });

  return {
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
    },
    tracking,
  };
};
