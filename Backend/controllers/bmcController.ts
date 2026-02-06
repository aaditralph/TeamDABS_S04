import mongoose from "mongoose";
import type { Request, Response } from "express";
import Report from "../models/Report.js";
import SocietyAccount from "../models/SocietyAccount.js";
import User from "../models/User.js";
import ROLES_LIST from "../config/roles_list.js";
import { VERIFICATION_CONFIG } from "../config/verification.js";
import { autoProcessExpiredReports } from "../services/schedulerService.js";
import notificationService from "../services/notificationService.js";

export const getPendingReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const pendingReports = await Report.find({
      verificationStatus: "PENDING",
    })
      .populate("societyAccountId", "societyName email phone")
      .populate("submittedBy", "name email phone")
      .sort({ submissionDate: 1 })
      .lean();

    const formattedReports = pendingReports.map((report) => {
      const societyData = report.societyAccountId as unknown as {
        _id: mongoose.Types.ObjectId;
        societyName: string;
        email: string;
        phone: string;
      } | null;
      const submittedByData = report.submittedBy as unknown as {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
        phone: string;
      } | null;
      return {
        reportId: report._id,
        submissionDate: report.submissionDate,
        society: {
          id: societyData?._id,
          societyName: societyData?.societyName || "Unknown",
          email: societyData?.email || "Unknown",
          phone: societyData?.phone || "Unknown",
        },
        submittedBy: {
          id: submittedByData?._id,
          name: submittedByData?.name || "Unknown",
          email: submittedByData?.email || "Unknown",
        },
        submissionImages: report.submissionImages,
        gpsMetadata: report.gpsMetadata,
        iotSensorData: report.iotSensorData,
        verificationProbability: report.verificationProbability,
        aiTrustScore: report.aiTrustScore,
        expiresAt: report.expiresAt,
      };
    });

    res.status(200).json({
      success: true,
      message: "Pending reviews retrieved successfully",
      data: {
        count: formattedReports.length,
        reports: formattedReports,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pending reviews",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const submitReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, comments, verificationImages } = req.body;
    const officerId = (req as any).user?.userId;

    if (!["APPROVE", "REJECT"].includes(action)) {
      res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'APPROVE' or 'REJECT'",
      });
      return;
    }

    const report = await Report.findById(id);

    if (!report) {
      res.status(404).json({
        success: false,
        message: "Report not found",
      });
      return;
    }

    if (report.verificationStatus !== "PENDING") {
      res.status(400).json({
        success: false,
        message: "This report has already been reviewed",
      });
      return;
    }

    const newStatus = action === "APPROVE" ? "OFFICER_APPROVED" : "REJECTED";

    report.verificationStatus = newStatus;
    report.approvalType = "OFFICER";
    report.officerId = new mongoose.Types.ObjectId(officerId);
    report.reviewTimestamp = new Date();
    report.officerComments = comments || undefined;

    if (verificationImages && Array.isArray(verificationImages)) {
      report.verificationImages = verificationImages.map((img: any) => ({
        url: img.url,
        uploadedAt: new Date(),
        gpsMetadata: img.gpsMetadata,
      }));
    }

    if (action === "APPROVE") {
      const societyAccount = await SocietyAccount.findById(report.societyAccountId);

      if (societyAccount) {
        const submissionDate = new Date(report.submissionDate);
        const approvedDate = new Date(report.reviewTimestamp);
        const diffTime = approvedDate.getTime() - submissionDate.getTime();
        const approvedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        report.approvedDays = approvedDays;

        const rebateAmount = societyAccount.propertyTaxEstimate * 0.05 * (approvedDays / 365);
        report.rebateAmount = Math.round(rebateAmount * 100) / 100;

        societyAccount.walletBalance += report.rebateAmount;
        societyAccount.totalRebatesEarned += report.rebateAmount;
        societyAccount.lastComplianceDate = new Date();
        await societyAccount.save();
      }
    } else if (action === "REJECT") {
      report.rejectionReason = comments || "Rejected by officer";
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: `Report ${action === "APPROVE" ? "approved" : "rejected"} successfully`,
      data: {
        reportId: report._id,
        verificationStatus: report.verificationStatus,
        approvalType: report.approvalType,
        reviewTimestamp: report.reviewTimestamp,
        rebateAmount: report.rebateAmount,
        approvedDays: report.approvedDays,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing review",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getReportsHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { societyId } = req.params;

    const societyExists = await SocietyAccount.findById(societyId);

    if (!societyExists) {
      res.status(404).json({
        success: false,
        message: "Society not found",
      });
      return;
    }

    const reports = await Report.find({ societyAccountId: societyId })
      .populate("submittedBy", "name email")
      .populate("officerId", "name email")
      .sort({ submissionDate: -1 })
      .lean();

    const dailyLogs: Record<
      string,
      Array<{
        reportId: unknown;
        submissionDate: Date;
        submissionImages: any[];
        verificationImages: any[];
        gpsMetadata: {
          latitude: number;
          longitude: number;
          accuracy: number;
          timestamp: Date;
        };
        iotSensorData?: any;
        aiTrustScore: number;
        verificationProbability: number;
        verificationStatus: string;
        approvalType: string;
        officerComments?: string;
        rejectionReason?: string;
        rebateAmount?: number;
        reviewTimestamp?: Date;
        submittedBy?: {
          name: string;
          email: string;
        };
        officer?: {
          name: string;
          email: string;
        };
      }>
    > = {};

    reports.forEach((reportItem) => {
      const dateKey = new Date(reportItem.submissionDate)
        .toISOString()
        .split("T")[0] as string;
      if (!dailyLogs[dateKey]) {
        dailyLogs[dateKey] = [];
      }
      dailyLogs[dateKey]!.push({
        reportId: reportItem._id,
        submissionDate: reportItem.submissionDate,
        submissionImages: reportItem.submissionImages,
        verificationImages: reportItem.verificationImages,
        gpsMetadata: reportItem.gpsMetadata,
        iotSensorData: reportItem.iotSensorData,
        aiTrustScore: reportItem.aiTrustScore,
        verificationProbability: reportItem.verificationProbability,
        verificationStatus: reportItem.verificationStatus,
        approvalType: reportItem.approvalType,
        officerComments: reportItem.officerComments,
        rejectionReason: reportItem.rejectionReason,
        rebateAmount: reportItem.rebateAmount,
        reviewTimestamp: reportItem.reviewTimestamp,
        submittedBy: reportItem.submittedBy as any,
        officer: reportItem.officerId as any,
      });
    });

    res.status(200).json({
      success: true,
      message: "Reports history retrieved successfully",
      data: {
        societyId,
        societyName: societyExists.societyName,
        totalSubmissions: reports.length,
        dailyLogs,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching reports history",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, societyId, fromDate, toDate } = req.query;

    const filter: any = {};

    if (status) {
      filter.verificationStatus = status;
    }

    if (societyId) {
      filter.societyAccountId = societyId;
    }

    if (fromDate || toDate) {
      filter.submissionDate = {};
      if (fromDate) {
        filter.submissionDate.$gte = new Date(fromDate as string);
      }
      if (toDate) {
        filter.submissionDate.$lte = new Date(toDate as string);
      }
    }

    const reports = await Report.find(filter)
      .populate("societyAccountId", "societyName email")
      .populate("submittedBy", "name email")
      .populate("officerId", "name email")
      .sort({ submissionDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Reports retrieved successfully",
      data: {
        count: reports.length,
        reports,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching reports",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const expireOldReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await autoProcessExpiredReports();

    res.status(200).json({
      success: true,
      message: `Processed ${result.processedCount} reports`,
      data: {
        processedCount: result.processedCount,
        approvedCount: result.approvedCount,
        rejectedCount: result.rejectedCount,
        errors: result.errors,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error expiring reports",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getOfficerPendingReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const officerId = (req as any).user?.userId;

    const pendingReports = await Report.find({
      verificationStatus: "PENDING",
    })
      .populate("societyAccountId", "societyName email phone address")
      .populate("submittedBy", "name email phone")
      .sort({ submissionDate: 1 })
      .lean();

    const formattedReports = pendingReports.map((report) => {
      const societyData = report.societyAccountId as unknown as {
        _id: mongoose.Types.ObjectId;
        societyName: string;
        email: string;
        phone: string;
      } | null;
      const submittedByData = report.submittedBy as unknown as {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
        phone: string;
      } | null;

      const daysUntilExpiry = Math.ceil(
        (new Date(report.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      return {
        reportId: report._id,
        submissionDate: report.submissionDate,
        daysUntilExpiry: Math.max(0, daysUntilExpiry),
        society: {
          id: societyData?._id,
          societyName: societyData?.societyName || "Unknown",
          email: societyData?.email || "Unknown",
          phone: societyData?.phone || "Unknown",
        },
        submittedBy: {
          id: submittedByData?._id,
          name: submittedByData?.name || "Unknown",
          email: submittedByData?.email || "Unknown",
        },
        submissionImages: report.submissionImages,
        gpsMetadata: report.gpsMetadata,
        iotSensorData: report.iotSensorData,
        verificationProbability: report.verificationProbability,
        aiTrustScore: report.aiTrustScore,
        autoApprovalThreshold: VERIFICATION_CONFIG.AUTO_APPROVAL_THRESHOLD,
        expiresAt: report.expiresAt,
      };
    });

    res.status(200).json({
      success: true,
      message: "Pending reports retrieved successfully",
      data: {
        count: formattedReports.length,
        reports: formattedReports,
        autoApprovalThreshold: VERIFICATION_CONFIG.AUTO_APPROVAL_THRESHOLD,
        reportExpiryDays: VERIFICATION_CONFIG.REPORT_EXPIRY_DAYS,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pending reports",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getOfficerReviewedReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const officerId = (req as any).user?.userId;

    const reviewedReports = await Report.find({
      officerId: new mongoose.Types.ObjectId(officerId),
      verificationStatus: { $in: ["OFFICER_APPROVED", "REJECTED"] },
    })
      .populate("societyAccountId", "societyName email")
      .populate("submittedBy", "name email")
      .sort({ reviewTimestamp: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Reviewed reports retrieved successfully",
      data: {
        count: reviewedReports.length,
        reports: reviewedReports,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching reviewed reports",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getOfficerNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const officerId = (req as any).user?.userId;
    const { unreadOnly, limit, offset } = req.query;

    const result = await notificationService.getOfficerNotifications(officerId, {
      unreadOnly: unreadOnly === "true",
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: {
        notifications: result.notifications,
        total: result.total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const markNotificationRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const officerId = (req as any).user?.userId;

    if (!officerId) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const success = await notificationService.markNotificationAsRead(id as string, officerId as string);

    if (success) {
      res.status(200).json({
        success: true,
        message: "Notification marked as read",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking notification as read",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const officerId = (req as any).user?.userId;

    const [
      pendingCount,
      reviewedTodayCount,
      approvedCount,
      rejectedCount,
      autoApprovedCount,
    ] = await Promise.all([
      Report.countDocuments({ verificationStatus: "PENDING" }),
      Report.countDocuments({
        officerId: new mongoose.Types.ObjectId(officerId),
        reviewTimestamp: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
      Report.countDocuments({
        officerId: new mongoose.Types.ObjectId(officerId),
        verificationStatus: "OFFICER_APPROVED",
      }),
      Report.countDocuments({
        officerId: new mongoose.Types.ObjectId(officerId),
        verificationStatus: "REJECTED",
      }),
      Report.countDocuments({
        verificationStatus: "AUTO_APPROVED",
      }),
    ]);

    const recentExpiringReports = await Report.find({
      verificationStatus: "PENDING",
      expiresAt: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    })
      .populate("societyAccountId", "societyName")
      .sort({ expiresAt: 1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: {
        pendingReports: pendingCount,
        reviewedToday: reviewedTodayCount,
        totalApproved: approvedCount,
        totalRejected: rejectedCount,
        autoApproved: autoApprovedCount,
        autoApprovalThreshold: VERIFICATION_CONFIG.AUTO_APPROVAL_THRESHOLD,
        recentExpiringReports,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
