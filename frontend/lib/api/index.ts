// Export API client
export { apiClient } from "./client";
export type { ApiError, ApiResponse } from "./client";

// Export services
export { authService } from "./auth";
export type {
  AuthResponse,
  ChangePasswordData,
  ForgotPasswordData,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  User,
} from "./auth";

export { restaurantService } from "./restaurants";
export type { Restaurant, SearchFilters } from "./restaurants";

export { foodService } from "./food";
export type { MenuFilters, MenuItem } from "./food";

export { orderService } from "./orders";
export type { CreateOrderData, Order, UpdateOrderStatusData } from "./orders";

export { cartService } from "./cart";
export type { AddToCartData, Cart, CartItem, UpdateCartItemData } from "./cart";

export { favoriteService } from "./favorites";
export type {
  FavoriteMenuItem,
  FavoriteRestaurant,
  FavoritesListResponse,
} from "./favorites";
