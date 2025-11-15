import { apiClient, ApiResponse } from "./client";

export interface CartItem {
  id: string;
  cartId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  restaurantId?: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartData {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
}

export interface UpdateCartItemData {
  quantity: number;
  specialInstructions?: string;
}

class CartService {
  /**
   * Get current user's cart
   */
  async getCart(): Promise<ApiResponse<Cart>> {
    return apiClient.get<Cart>("/cart");
  }

  /**
   * Add item to cart
   */
  async addToCart(data: AddToCartData): Promise<ApiResponse<Cart>> {
    return apiClient.post<Cart>("/cart/items", data);
  }

  /**
   * Update cart item
   */
  async updateCartItem(
    itemId: string,
    data: UpdateCartItemData
  ): Promise<ApiResponse<Cart>> {
    return apiClient.put<Cart>(`/cart/items/${itemId}`, data);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId: string): Promise<ApiResponse<Cart>> {
    return apiClient.delete<Cart>(`/cart/items/${itemId}`);
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>("/cart");
  }

  /**
   * Get cart item count
   */
  async getCartCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get<{ count: number }>("/cart/count");
  }
}

export const cartService = new CartService();
