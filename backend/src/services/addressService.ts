/**
 * Address Service
 * Business logic for managing user addresses
 */

import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

enum AddressType {
  HOME = 'HOME',
  WORK = 'WORK',
  OTHER = 'OTHER',
}

interface CreateAddressData {
  type: AddressType;
  label?: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

interface UpdateAddressData {
  type?: AddressType;
  label?: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Create a new address
 */
export const createAddress = async (
  userId: string,
  data: CreateAddressData
): Promise<any> => {
  const { type, label, fullAddress, latitude, longitude, isDefault } = data;

  // If setting as default, unset other defaults
  if (isDefault) {
    await db.address.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
        updatedAt: new Date(),
      },
    });
  }

  // Create address
  const address = await db.address.create({
    data: {
      userId,
      type,
      label,
      fullAddress,
      latitude,
      longitude,
      isDefault: isDefault || false,
      updatedAt: new Date(),
    },
  });

  logger.info(`Address created for user ${userId}, id: ${address.id}`);

  return address;
};

/**
 * Get user's addresses
 */
export const getUserAddresses = async (userId: string): Promise<any[]> => {
  const addresses = await db.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  logger.info(`Retrieved ${addresses.length} addresses for user ${userId}`);

  return addresses;
};

/**
 * Get address by ID
 */
export const getAddressById = async (
  addressId: string,
  userId: string
): Promise<any> => {
  const address = await db.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw createError('Address not found', 404);
  }

  return address;
};

/**
 * Update address
 */
export const updateAddress = async (
  addressId: string,
  userId: string,
  data: UpdateAddressData
): Promise<any> => {
  // Verify address exists and belongs to user
  const existingAddress = await db.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!existingAddress) {
    throw createError('Address not found', 404);
  }

  // Update address
  const updatedAddress = await db.address.update({
    where: { id: addressId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });

  logger.info(`Address ${addressId} updated by user ${userId}`);

  return updatedAddress;
};

/**
 * Delete address
 */
export const deleteAddress = async (
  addressId: string,
  userId: string
): Promise<void> => {
  // Verify address exists and belongs to user
  const address = await db.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw createError('Address not found', 404);
  }

  // Delete address
  await db.address.delete({
    where: { id: addressId },
  });

  // If deleted address was default, set another address as default
  if (address.isDefault) {
    const firstAddress = await db.address.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (firstAddress) {
      await db.address.update({
        where: { id: firstAddress.id },
        data: {
          isDefault: true,
          updatedAt: new Date(),
        },
      });
    }
  }

  logger.info(`Address ${addressId} deleted by user ${userId}`);
};

/**
 * Set address as default
 */
export const setDefaultAddress = async (
  addressId: string,
  userId: string
): Promise<any> => {
  // Verify address exists and belongs to user
  const address = await db.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw createError('Address not found', 404);
  }

  // Use transaction to update all addresses
  const result = await db.$transaction(async (tx: any) => {
    // Unset all defaults
    await tx.address.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
        updatedAt: new Date(),
      },
    });

    // Set new default
    const updatedAddress = await tx.address.update({
      where: { id: addressId },
      data: {
        isDefault: true,
        updatedAt: new Date(),
      },
    });

    return updatedAddress;
  });

  logger.info(`Address ${addressId} set as default for user ${userId}`);

  return result;
};
