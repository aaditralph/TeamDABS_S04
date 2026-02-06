import mongoose from "mongoose";
import type { Request, Response } from "express";
import EvidenceLog from "../models/EvidenceLog.js";
import SocietyProfile from "../models/SocietyProfile.js";
import BwgSociety from "../models/BwgSociety.js";
import ROLES_LIST from "../config/roles_list.js";

export const getPendingReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const pendingSubmissions = await EvidenceLog.find({
      verificationStatus: "PENDING",
    })
      .populate("societyId", "societyName email phone")
      .sort({ submissionDate: 1 })
      .lean();

    const formattedSubmissions = pendingSubmissions.map((submission) => {
      const societyData = submission.societyId as unknown as { _id: mongoose.Types.ObjectId; societyName: string; email: string; phone: string } | null;
      return {
        evidenceId: submission._id,
        submissionDate: submission.submissionDate,
        society: {
          id: societyData?._id,
          societyName: societyData?.societyName || "Unknown",
          email: societyData?.email || "Unknown",
          phone: societyData?.phone || "Unknown",
        },
        photoUrl: submission.photoUrl,
        gpsMetadata: {
          latitude: submission.gpsMetadata.latitude,
          longitude: submission.gpsMetadata.longitude,
          accuracy: submission.gpsMetadata.accuracy,
          timestamp: submission.gpsMetadata.timestamp,
        },
        aiTrustScore: submission.aiTrustScore,
        iotVibrationStatus: submission.iotVibrationStatus,
        verificationStatus: submission.verificationStatus,
      };
    });

    res.status(200).json({
      success: true,
      message: "Pending reviews retrieved successfully",
      data: {
        count: formattedSubmissions.length,
        submissions: formattedSubmissions,
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
    const { action, comments, rebateAmount } = req.body;
    const officerId = (req as any).user?.userId;

    if (!["APPROVE", "REJECT"].includes(action)) {
      res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'APPROVE' or 'REJECT'",
      });
      return;
    }

    const evidence = await EvidenceLog.findById(id);

    if (!evidence) {
      res.status(404).json({
        success: false,
        message: "Evidence submission not found",
      });
      return;
    }

    if (evidence.verificationStatus !== "PENDING") {
      res.status(400).json({
        success: false,
        message: "This submission has already been reviewed",
      });
      return;
    }

    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

    evidence.verificationStatus = newStatus;
    evidence.officerId = new mongoose.Types.ObjectId(officerId);
    evidence.reviewTimestamp = new Date();
    evidence.officerComments = comments || undefined;

    if (action === "APPROVE" && rebateAmount) {
      evidence.rebateAmount = rebateAmount;

      const societyProfile = await SocietyProfile.findOne({
        userId: evidence.societyId,
      });

      if (societyProfile) {
        societyProfile.walletBalance += rebateAmount;
        societyProfile.totalRebatesEarned += rebateAmount;
        await societyProfile.save();
      }
    }

    await evidence.save();

    res.status(200).json({
      success: true,
      message: `Submission ${action === "APPROVE" ? "approved" : "rejected"} successfully`,
      data: {
        evidenceId: evidence._id,
        verificationStatus: evidence.verificationStatus,
        reviewTimestamp: evidence.reviewTimestamp,
        rebateAmount: evidence.rebateAmount,
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

    const societyExists = await BwgSociety.findById(societyId);

    if (!societyExists) {
      res.status(404).json({
        success: false,
        message: "Society not found",
      });
      return;
    }

    const history = await EvidenceLog.find({ societyId })
      .sort({ submissionDate: -1 })
      .lean();

    const dailyLogs: Record<string, Array<{
      evidenceId: unknown;
      submissionDate: Date;
      photoUrl: string;
      gpsMetadata: {
        latitude: number;
        longitude: number;
        accuracy: number;
        timestamp: Date;
      };
      aiTrustScore: number;
      iotVibrationStatus: string;
      verificationStatus: string;
      officerComments?: string;
      rebateAmount?: number;
      reviewTimestamp?: Date;
    }>> = {};

    history.forEach((logItem) => {
      const dateKey = new Date(logItem.submissionDate).toISOString().split("T")[0] as string;
      if (!dailyLogs[dateKey]) {
        dailyLogs[dateKey] = [];
      }
      dailyLogs[dateKey]!.push({
        evidenceId: logItem._id,
        submissionDate: logItem.submissionDate,
        photoUrl: logItem.photoUrl,
        gpsMetadata: logItem.gpsMetadata,
        aiTrustScore: logItem.aiTrustScore,
        iotVibrationStatus: logItem.iotVibrationStatus,
        verificationStatus: logItem.verificationStatus,
        officerComments: logItem.officerComments,
        rebateAmount: logItem.rebateAmount,
        reviewTimestamp: logItem.reviewTimestamp,
      });
    });

    res.status(200).json({
      success: true,
      message: "Reports history retrieved successfully",
      data: {
        societyId,
        societyName: societyExists.societyName,
        totalSubmissions: history.length,
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
