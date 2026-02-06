import type { Request, Response } from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import ROLES_LIST from "../config/roles_list.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, addresses } = req.body;

    // Check if customer already exists with this email
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      role: ROLES_LIST.customer,
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Customer already exists with this email",
      });
      return;
    }

    // Create customer
    const customer = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: ROLES_LIST.customer,
      addresses: addresses || [],
      isVerified: true, // Customers don't need approval
      isActive: true,
    });

    const token = generateToken({
      userId: customer._id.toString(),
      email: customer.email,
      role: customer.role,
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      data: {
        token,
        user: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          role: customer.role,
          addresses: customer.addresses,
          isVerified: customer.isVerified,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering customer",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const customer = await User.findOne({
      email: email.toLowerCase(),
      role: ROLES_LIST.customer,
    }).select("+password");

    if (!customer) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const token = generateToken({
      userId: customer._id.toString(),
      email: customer.email,
      role: customer.role,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          role: customer.role,
          addresses: customer.addresses,
          isVerified: customer.isVerified,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const customer = await User.findOne({
      _id: userId,
      role: ROLES_LIST.customer,
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          role: customer.role,
          addresses: customer.addresses,
          isVerified: customer.isVerified,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching customer",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const { street, city, state, pincode, landmark, isDefault } = req.body;

    // Validate required fields
    if (!street || !city || !state || !pincode) {
      res.status(400).json({
        success: false,
        message: "Street, city, state, and pincode are required",
      });
      return;
    }

    const customer = await User.findOne({
      _id: userId,
      role: ROLES_LIST.customer,
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    // Add new address
    const newAddress = {
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      landmark: landmark?.trim(),
      isDefault: isDefault || false,
    };

    // If this is default, unset other defaults
    if (isDefault && customer.addresses) {
      customer.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    customer.addresses = customer.addresses || [];
    customer.addresses.push(newAddress);
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Address added successfully",
      data: {
        user: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          addresses: customer.addresses,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating address",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
