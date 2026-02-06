import type { Request, Response } from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import ROLES_LIST from "../config/roles_list.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, societyName, flatNumber, buildingName } =
      req.body;

    // Check if resident already exists with this email
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      role: ROLES_LIST.resident,
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Resident already exists with this email",
      });
      return;
    }

    // Create resident
    const resident = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: ROLES_LIST.resident,
      societyName,
      flatNumber,
      buildingName,
      isVerified: true, // Residents don't need approval
      isActive: true,
    });

    const token = generateToken({
      userId: resident._id.toString(),
      email: resident.email,
      role: resident.role,
    });

    res.status(201).json({
      success: true,
      message: "Resident registered successfully",
      data: {
        token,
        user: {
          id: resident._id,
          name: resident.name,
          email: resident.email,
          phone: resident.phone,
          role: resident.role,
          societyName: resident.societyName,
          flatNumber: resident.flatNumber,
          buildingName: resident.buildingName,
          isVerified: resident.isVerified,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering resident",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const resident = await User.findOne({
      email: email.toLowerCase(),
      role: ROLES_LIST.resident,
    }).select("+password");

    if (!resident) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const isMatch = await resident.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const token = generateToken({
      userId: resident._id.toString(),
      email: resident.email,
      role: resident.role,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: resident._id,
          name: resident.name,
          email: resident.email,
          phone: resident.phone,
          role: resident.role,
          societyName: resident.societyName,
          flatNumber: resident.flatNumber,
          buildingName: resident.buildingName,
          isVerified: resident.isVerified,
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

    const resident = await User.findOne({
      _id: userId,
      role: ROLES_LIST.resident,
    });

    if (!resident) {
      res.status(404).json({
        success: false,
        message: "Resident not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: resident._id,
          name: resident.name,
          email: resident.email,
          phone: resident.phone,
          role: resident.role,
          societyName: resident.societyName,
          flatNumber: resident.flatNumber,
          buildingName: resident.buildingName,
          isVerified: resident.isVerified,
          createdAt: resident.createdAt,
          updatedAt: resident.updatedAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching resident",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateSociety = async (
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

    const { societyName, flatNumber, buildingName } = req.body;

    // Validate required fields
    if (!societyName || !flatNumber) {
      res.status(400).json({
        success: false,
        message: "Society name and flat number are required",
      });
      return;
    }

    const resident = await User.findOneAndUpdate(
      { _id: userId, role: ROLES_LIST.resident },
      {
        societyName: societyName.trim(),
        flatNumber: flatNumber.trim(),
        buildingName: buildingName?.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!resident) {
      res.status(404).json({
        success: false,
        message: "Resident not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Society updated successfully",
      data: {
        user: {
          id: resident._id,
          name: resident.name,
          email: resident.email,
          societyName: resident.societyName,
          flatNumber: resident.flatNumber,
          buildingName: resident.buildingName,
          updatedAt: resident.updatedAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating society",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
