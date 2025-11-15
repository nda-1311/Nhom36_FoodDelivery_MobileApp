/**
 * Address Controller
 * HTTP request handlers for address management endpoints
 */

import { NextFunction, Request, Response } from "express";
import "../types/express"; // Import type extensions
import Joi from "joi";
import * as addressService from "../services/addressService";

/**
 * POST /api/v1/addresses
 * Create a new address
 */
export const createAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      type: Joi.string().valid("HOME", "WORK", "OTHER").required(),
      label: Joi.string().max(50).optional(),
      fullAddress: Joi.string().required().min(10).max(500),
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional(),
      isDefault: Joi.boolean().optional(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const userId = req.user!.userId;
    const address = await addressService.createAddress(userId, value);

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/addresses
 * Get user's addresses
 */
export const getUserAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const addresses = await addressService.getUserAddresses(userId);

    res.json({
      success: true,
      message: "Addresses retrieved successfully",
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/addresses/:id
 * Get address by ID
 */
export const getAddressById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.params);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const userId = req.user!.userId;
    const address = await addressService.getAddressById(value.id, userId);

    res.json({
      success: true,
      message: "Address retrieved successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/addresses/:id
 * Update address
 */
export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const paramsSchema = Joi.object({
      id: Joi.string().required(),
    });

    const bodySchema = Joi.object({
      type: Joi.string().valid("HOME", "WORK", "OTHER").optional(),
      label: Joi.string().max(50).optional().allow(""),
      fullAddress: Joi.string().min(10).max(500).optional(),
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional(),
    }).min(1);

    const paramsValidation = paramsSchema.validate(req.params);
    const bodyValidation = bodySchema.validate(req.body);

    if (paramsValidation.error) {
      res.status(400).json({
        success: false,
        message: paramsValidation.error.details[0].message,
      });
      return;
    }

    if (bodyValidation.error) {
      res.status(400).json({
        success: false,
        message: bodyValidation.error.details[0].message,
      });
      return;
    }

    const userId = req.user!.userId;
    const address = await addressService.updateAddress(
      paramsValidation.value.id,
      userId,
      bodyValidation.value
    );

    res.json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/addresses/:id
 * Delete address
 */
export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.params);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const userId = req.user!.userId;
    await addressService.deleteAddress(value.id, userId);

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/addresses/:id/default
 * Set address as default
 */
export const setDefaultAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.params);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const userId = req.user!.userId;
    const address = await addressService.setDefaultAddress(value.id, userId);

    res.json({
      success: true,
      message: "Address set as default successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};
