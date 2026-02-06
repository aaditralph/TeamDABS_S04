import type { Request, Response } from "express";
import User from "../models/User.js";
import SocietyAccount from "../models/SocietyAccount.js";
import { generateToken } from "../utils/jwt.js";
import ROLES_LIST from "../config/roles_list.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, societyName, address, geoLockCoordinates } =
      req.body;

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

    let societyAccount = await SocietyAccount.findOne({
      societyName: societyName,
    });

    if (!societyAccount) {
      societyAccount = await SocietyAccount.create({
        societyName,
        email: email.toLowerCase(),
        phone,
        address,
        geoLockCoordinates,
        walletBalance: 0,
        totalRebatesEarned: 0,
        complianceStreak: 0,
        isActive: true,
        isVerified: false,
      });
    }

    const societyWorker = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: ROLES_LIST.society,
      societyId: societyAccount._id,
      societyName,
      isVerified: false,
      isActive: true,
    });

    const token = generateToken({
      userId: societyWorker._id.toString(),
      email: societyWorker.email,
      role: societyWorker.role,
    });

    res.status(201).json({
      success: true,
      message: "Society worker registered successfully. Pending admin approval.",
      data: {
        token,
        user: {
          id: societyWorker._id,
          name: societyWorker.name,
          email: societyWorker.email,
          phone: societyWorker.phone,
          role: societyWorker.role,
          societyId: societyAccount._id,
          societyName: societyAccount.societyName,
          isVerified: societyWorker.isVerified,
        },
        society: {
          id: societyAccount._id,
          societyName: societyAccount.societyName,
          isVerified: societyAccount.isVerified,
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

    const societyWorker = await User.findOne({
      email: email.toLowerCase(),
      role: ROLES_LIST.society,
    }).select("+password");

    if (!societyWorker) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    if (!societyWorker.isVerified) {
      res.status(403).json({
        success: false,
        message: "Account pending admin approval",
      });
      return;
    }

    const societyAccount = await SocietyAccount.findById(societyWorker.societyId);

    if (!societyAccount || !societyAccount.isVerified) {
      res.status(403).json({
        success: false,
        message: "Society account not verified",
      });
      return;
    }

    const isMatch = await societyWorker.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const token = generateToken({
      userId: societyWorker._id.toString(),
      email: societyWorker.email,
      role: societyWorker.role,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: societyWorker._id,
          name: societyWorker.name,
          email: societyWorker.email,
          phone: societyWorker.phone,
          role: societyWorker.role,
          societyId: societyAccount._id,
          societyName: societyAccount.societyName,
          isVerified: societyWorker.isVerified,
        },
        society: {
          id: societyAccount._id,
          societyName: societyAccount.societyName,
          walletBalance: societyAccount.walletBalance,
          totalRebatesEarned: societyAccount.totalRebatesEarned,
          complianceStreak: societyAccount.complianceStreak,
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

    const societyWorker = await User.findOne({
      _id: userId,
      role: ROLES_LIST.society,
    });

    if (!societyWorker) {
      res.status(404).json({
        success: false,
        message: "Society worker not found",
      });
      return;
    }

    const societyAccount = await SocietyAccount.findById(societyWorker.societyId);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: societyWorker._id,
          name: societyWorker.name,
          email: societyWorker.email,
          phone: societyWorker.phone,
          role: societyWorker.role,
          societyId: societyAccount?._id,
          societyName: societyAccount?.societyName,
          isVerified: societyWorker.isVerified,
          createdAt: societyWorker.createdAt,
          updatedAt: societyWorker.updatedAt,
        },
        society: societyAccount
          ? {
              id: societyAccount._id,
              societyName: societyAccount.societyName,
              email: societyAccount.email,
              phone: societyAccount.phone,
              address: societyAccount.address,
              walletBalance: societyAccount.walletBalance,
              totalRebatesEarned: societyAccount.totalRebatesEarned,
              complianceStreak: societyAccount.complianceStreak,
              lastComplianceDate: societyAccount.lastComplianceDate,
              isVerified: societyAccount.isVerified,
            }
          : null,
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

export const getSocietyInfo = async (
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

    const societyWorker = await User.findOne({
      _id: userId,
      role: ROLES_LIST.society,
    });

    if (!societyWorker || !societyWorker.societyId) {
      res.status(404).json({
        success: false,
        message: "Society not found",
      });
      return;
    }

    const societyAccount = await SocietyAccount.findById(societyWorker.societyId);

    if (!societyAccount) {
      res.status(404).json({
        success: false,
        message: "Society account not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        society: {
          id: societyAccount._id,
          societyName: societyAccount.societyName,
          email: societyAccount.email,
          phone: societyAccount.phone,
          address: societyAccount.address,
          geoLockCoordinates: societyAccount.geoLockCoordinates,
          walletBalance: societyAccount.walletBalance,
          totalRebatesEarned: societyAccount.totalRebatesEarned,
          complianceStreak: societyAccount.complianceStreak,
          lastComplianceDate: societyAccount.lastComplianceDate,
          isActive: societyAccount.isActive,
          isVerified: societyAccount.isVerified,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching society info",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
