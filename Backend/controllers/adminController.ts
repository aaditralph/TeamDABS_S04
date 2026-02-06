import type { Request, Response } from "express";
import User from "../models/User.js";
import SocietyAccount from "../models/SocietyAccount.js";
import { generateToken } from "../utils/jwt.js";
import ROLES_LIST from "../config/roles_list.js";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

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

export const getPendingOfficers = async (
  req: Request,
  res: Response
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

export const approveOfficer = async (
  req: Request,
  res: Response
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

    officer.isVerified = true;
    officer.verificationDate = new Date();
    officer.verifiedBy = adminId as any;
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

export const rejectOfficer = async (
  req: Request,
  res: Response
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

export const getPendingSocieties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const pendingWorkers = await User.find({
      role: ROLES_LIST.society,
      isVerified: false,
      isActive: true,
    }).select("-password");

    const societiesWithWorkers = await Promise.all(
      pendingWorkers.map(async (worker) => {
        const societyAccount = await SocietyAccount.findById(worker.societyId);
        return {
          worker: {
            id: worker._id,
            name: worker.name,
            email: worker.email,
            phone: worker.phone,
            createdAt: worker.createdAt,
          },
          society: societyAccount
            ? {
                id: societyAccount._id,
                societyName: societyAccount.societyName,
                email: societyAccount.email,
                phone: societyAccount.phone,
                address: societyAccount.address,
              }
            : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        societies: societiesWithWorkers,
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

export const approveSociety = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.userId;

    const societyWorker = await User.findOne({
      _id: id,
      role: ROLES_LIST.society,
      isVerified: false,
    });

    if (!societyWorker) {
      res.status(404).json({
        success: false,
        message: "Society worker not found or already approved",
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

    societyWorker.isVerified = true;
    societyWorker.verificationDate = new Date();
    societyWorker.verifiedBy = adminId as any;
    await societyWorker.save();

    societyAccount.isVerified = true;
    societyAccount.verificationDate = new Date();
    societyAccount.verifiedBy = adminId as any;
    await societyAccount.save();

    res.status(200).json({
      success: true,
      message: "Society approved successfully",
      data: {
        worker: {
          id: societyWorker._id,
          name: societyWorker.name,
          email: societyWorker.email,
          isVerified: societyWorker.isVerified,
          verificationDate: societyWorker.verificationDate,
        },
        society: {
          id: societyAccount._id,
          societyName: societyAccount.societyName,
          isVerified: societyAccount.isVerified,
          verificationDate: societyAccount.verificationDate,
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

export const rejectSociety = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const societyWorker = await User.findOne({
      _id: id,
      role: ROLES_LIST.society,
      isVerified: false,
    });

    if (!societyWorker) {
      res.status(404).json({
        success: false,
        message: "Society worker not found",
      });
      return;
    }

    const societyAccount = await SocietyAccount.findById(societyWorker.societyId);

    await User.deleteOne({ _id: id });

    if (societyAccount) {
      const otherWorkers = await User.countDocuments({
        societyId: societyAccount._id,
        role: ROLES_LIST.society,
        isVerified: true,
      });

      if (otherWorkers === 0) {
        await SocietyAccount.deleteOne({ _id: societyAccount._id });
      }
    }

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

export const getAllSocieties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const societyAccounts = await SocietyAccount.find({
      isVerified: true,
      isActive: true,
    })
      .select("-__v")
      .sort({ createdAt: -1 });

    const societiesWithWorkers = await Promise.all(
      societyAccounts.map(async (account) => {
        const primaryWorker = await User.findOne({
          societyId: account._id,
          role: ROLES_LIST.society,
          isVerified: true,
        });
        return {
          id: account._id,
          societyName: account.societyName,
          email: account.email,
          phone: account.phone,
          address: account.address,
          walletBalance: account.walletBalance,
          totalRebatesEarned: account.totalRebatesEarned,
          complianceStreak: account.complianceStreak,
          lastComplianceDate: account.lastComplianceDate,
          isVerified: account.isVerified,
          primaryWorker: primaryWorker
            ? {
                id: primaryWorker._id,
                name: primaryWorker.name,
                email: primaryWorker.email,
                phone: primaryWorker.phone,
              }
            : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        societies: societiesWithWorkers,
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
