import type { Request, Response } from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import ROLES_LIST from "../config/roles_list.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, documentType } = req.body;
    const file = req.file;

    // Check if file was uploaded
    if (!file) {
      res.status(400).json({
        success: false,
        message: "Document is required for officer registration",
      });
      return;
    }

    // Check if officer already exists with this email
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      role: ROLES_LIST.officer,
    });

    if (existingUser) {
      // Delete uploaded file if user exists
      // We'll handle file cleanup in the route
      res.status(400).json({
        success: false,
        message: "Officer already exists with this email",
      });
      return;
    }

    // Create officer with document
    const officer = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: ROLES_LIST.officer,
      documentType,
      documentUrl: file.path,
      isVerified: false,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Officer registered successfully. Awaiting admin approval.",
      data: {
        user: {
          id: officer._id,
          name: officer.name,
          email: officer.email,
          phone: officer.phone,
          role: officer.role,
          isVerified: officer.isVerified,
          documentType: officer.documentType,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering officer",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const officer = await User.findOne({
      email: email.toLowerCase(),
      role: ROLES_LIST.officer,
    }).select("+password");

    if (!officer) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Check if officer is verified
    if (!officer.isVerified) {
      res.status(403).json({
        success: false,
        message: "Account pending admin approval",
      });
      return;
    }

    const isMatch = await officer.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const token = generateToken({
      userId: officer._id.toString(),
      email: officer.email,
      role: officer.role,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: officer._id,
          name: officer.name,
          email: officer.email,
          phone: officer.phone,
          role: officer.role,
          isVerified: officer.isVerified,
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

    const officer = await User.findOne({
      _id: userId,
      role: ROLES_LIST.officer,
    });

    if (!officer) {
      res.status(404).json({
        success: false,
        message: "Officer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: officer._id,
          name: officer.name,
          email: officer.email,
          phone: officer.phone,
          role: officer.role,
          isVerified: officer.isVerified,
          documentType: officer.documentType,
          verificationDate: officer.verificationDate,
          createdAt: officer.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching officer",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
