import mongoose from "mongoose";
import type { Request, Response } from "express";
import Report from "../models/Report.js";
import SocietyAccount from "../models/SocietyAccount.js";
import ROLES_LIST from "../config/roles_list.js";

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
    const { action, comments, rebateAmount, verificationImages } = req.body;
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

    if (action === "APPROVE" && rebateAmount) {
      report.rebateAmount = rebateAmount;

      const societyAccount = await SocietyAccount.findById(report.societyAccountId);

      if (societyAccount) {
        societyAccount.walletBalance += rebateAmount;
        societyAccount.totalRebatesEarned += rebateAmount;
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
    const now = new Date();

    const expiredReports = await Report.updateMany(
      {
        verificationStatus: "PENDING",
        expiresAt: { $lt: now },
      },
      {
        $set: {
          verificationStatus: "EXPIRED",
          approvalType: "NONE",
        },
      }
    );

    res.status(200).json({
      success: true,
      message: `${expiredReports.modifiedCount} reports expired`,
      data: {
        expiredCount: expiredReports.modifiedCount,
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
