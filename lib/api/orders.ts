import { apiClient, ApiResponse } from "./client";

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  restaurantId: string;
  addressId: string;
  driverId?: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: string;
  confirmedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  specialInstructions?: string;
  cancelReason?: string;
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  restaurantId: string;
  addressId: string;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  paymentMethod: "CASH" | "CREDIT_CARD" | "E_WALLET";
  specialInstructions?: string;
}

export interface UpdateOrderStatusData {
  status: string;
  cancelReason?: string;
}

class OrderService {
  /**
   * Create new order
   */
  async createOrder(data: CreateOrderData): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>("/orders", data);
  }

  /**
   * Get user's orders
   */
  async getMyOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>("/orders/my-orders", params as any);
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return apiClient.get<Order>(`/orders/${id}`);
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: string,
    data: UpdateOrderStatusData
  ): Promise<ApiResponse<Order>> {
    return apiClient.patch<Order>(`/orders/${id}/status`, data);
  }

  /**
   * Cancel order
   */
  async cancelOrder(id: string, reason: string): Promise<ApiResponse<Order>> {
    return apiClient.patch<Order>(`/orders/${id}/cancel`, { reason });
  }

  /**
   * Track order
   */
  async trackOrder(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/orders/${id}/track`);
  }

  /**
   * Get order history
   */
  async getOrderHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>("/orders", params as any);
  }
}

export const orderService = new OrderService();
