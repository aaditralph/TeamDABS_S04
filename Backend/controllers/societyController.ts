import type { Request, Response } from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import ROLES_LIST from "../config/roles_list.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, societyName } = req.body;

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      role: ROLES_LIST.society,
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Society worker already exists with this email",
      });
      return;
    }

    const society = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: ROLES_LIST.society,
      societyName,
      isVerified: false,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Society worker registered successfully",
      data: {
        token,
        user: {
          id: society._id,
          name: society.name,
          email: society.email,
          phone: society.phone,
          role: society.role,
          societyName: society.societyName,
          isVerified: society.isVerified,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering society worker",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const society = await User.findOne({
      email: email.toLowerCase(),
      role: ROLES_LIST.society,
    }).select("+password");

    if (!society) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    if (!society.isVerified) {
      res.status(403).json({
        success: false,
        message: "Account pending admin approval",
      });
      return;
    }

    const isMatch = await society.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const token = generateToken({
      userId: society._id.toString(),
      email: society.email,
      role: society.role,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: society._id,
          name: society.name,
          email: society.email,
          phone: society.phone,
          role: society.role,
          societyName: society.societyName,
          isVerified: society.isVerified,
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

    const society = await User.findOne({
      _id: userId,
      role: ROLES_LIST.society,
    });

    if (!society) {
      res.status(404).json({
        success: false,
        message: "Society worker not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: society._id,
          name: society.name,
          email: society.email,
          phone: society.phone,
          role: society.role,
          societyName: society.societyName,
          isVerified: society.isVerified,
          createdAt: society.createdAt,
          updatedAt: society.updatedAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching society worker",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
