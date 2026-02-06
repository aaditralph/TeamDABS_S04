import type { Request, Response } from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import ROLES_LIST from "../config/roles_list.js";
import { deleteFile, sendFile } from "../middleware/upload.js";
import fs from "fs";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Use case-insensitive search since email is stored as lowercase
    const admin = await User.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
      role: ROLES_LIST.admin,
    }).select("+password");

    if (!admin) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const token = generateToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isSuperAdmin: admin.isSuperAdmin,
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

// Get pending officers
export const getPendingOfficers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const officers = await User.find({
      role: ROLES_LIST.officer,
      isVerified: false,
      isActive: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      data: {
        officers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pending officers",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Approve officer
export const approveOfficer = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.userId;

    const officer = await User.findOne({
      _id: id,
      role: ROLES_LIST.officer,
      isVerified: false,
    });

    if (!officer) {
      res.status(404).json({
        success: false,
        message: "Officer not found or already approved",
      });
      return;
    }

    // Delete the document file
    if (officer.documentUrl && fs.existsSync(officer.documentUrl)) {
      deleteFile(officer.documentUrl);
    }

    // Update officer
    officer.isVerified = true;
    officer.verificationDate = new Date();
    officer.verifiedBy = adminId;
    officer.documentUrl = undefined; // Clear the document URL
    await officer.save();

    res.status(200).json({
      success: true,
      message: "Officer approved successfully",
      data: {
        officer: {
          id: officer._id,
          name: officer.name,
          email: officer.email,
          isVerified: officer.isVerified,
          verificationDate: officer.verificationDate,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error approving officer",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Reject officer
export const rejectOfficer = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const officer = await User.findOne({
      _id: id,
      role: ROLES_LIST.officer,
      isVerified: false,
    });

    if (!officer) {
      res.status(404).json({
        success: false,
        message: "Officer not found",
      });
      return;
    }

    // Delete the document file
    if (officer.documentUrl && fs.existsSync(officer.documentUrl)) {
      deleteFile(officer.documentUrl);
    }

    // Delete the officer account
    await User.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Officer rejected and removed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error rejecting officer",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get pending societies
export const getPendingSocieties = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const societies = await User.find({
      role: ROLES_LIST.society,
      isVerified: false,
      isActive: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      data: {
        societies,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pending societies",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Approve society
export const approveSociety = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.userId;

    const society = await User.findOne({
      _id: id,
      role: ROLES_LIST.society,
      isVerified: false,
    });

    if (!society) {
      res.status(404).json({
        success: false,
        message: "Society worker not found or already approved",
      });
      return;
    }

    // Update society
    society.isVerified = true;
    society.verificationDate = new Date();
    society.verifiedBy = adminId;
    await society.save();

    res.status(200).json({
      success: true,
      message: "Society worker approved successfully",
      data: {
        society: {
          id: society._id,
          name: society.name,
          email: society.email,
          isVerified: society.isVerified,
          verificationDate: society.verificationDate,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error approving society",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Reject society
export const rejectSociety = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const society = await User.findOne({
      _id: id,
      role: ROLES_LIST.society,
      isVerified: false,
    });

    if (!society) {
      res.status(404).json({
        success: false,
        message: "Society worker not found",
      });
      return;
    }

    // Delete the society account
    await User.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Society worker rejected and removed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error rejecting society",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all societies
export const getAllSocieties = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const societies = await User.find({
      role: ROLES_LIST.society,
      isVerified: true,
      isActive: true,
    })
      .select("-password -__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        societies,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching societies",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const officer = await User.findOne({
      _id: id,
      role: ROLES_LIST.officer,
    });

    if (!officer) {
      res.status(404).json({
        success: false,
        message: "Officer not found",
      });
      return;
    }

    if (!officer.documentUrl) {
      res.status(404).json({
        success: false,
        message: "No document available for this officer",
      });
      return;
    }

    await sendFile(officer.documentUrl, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching document",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
