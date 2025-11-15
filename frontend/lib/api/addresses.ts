import { apiClient, ApiResponse } from "./client";

export interface Address {
  id: string;
  userId: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  label?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  label?: string;
}

export interface UpdateAddressData {
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  label?: string;
}

class AddressService {
  /**
   * Get all user addresses
   */
  async getAddresses(): Promise<ApiResponse<Address[]>> {
    return apiClient.get<Address[]>("/addresses");
  }

  /**
   * Get address by ID
   */
  async getAddressById(id: string): Promise<ApiResponse<Address>> {
    return apiClient.get<Address>(`/addresses/${id}`);
  }

  /**
   * Create new address
   */
  async createAddress(data: CreateAddressData): Promise<ApiResponse<Address>> {
    return apiClient.post<Address>("/addresses", data);
  }

  /**
   * Update address
   */
  async updateAddress(
    id: string,
    data: UpdateAddressData
  ): Promise<ApiResponse<Address>> {
    return apiClient.put<Address>(`/addresses/${id}`, data);
  }

  /**
   * Delete address
   */
  async deleteAddress(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/addresses/${id}`);
  }

  /**
   * Set address as default
   */
  async setDefaultAddress(id: string): Promise<ApiResponse<Address>> {
    return apiClient.patch<Address>(`/addresses/${id}/set-default`, {});
  }
}

export const addressService = new AddressService();
