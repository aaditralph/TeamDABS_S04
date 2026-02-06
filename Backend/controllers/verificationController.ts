import type { Request, Response } from "express";
import { z } from "zod";
import Report from "../models/Report.js";
import User from "../models/User.js";
import SocietyAccount from "../models/SocietyAccount.js";
import ROLES_LIST from "../config/roles_list.js";

export const reportSubmissionSchema = z.object({
  societyId: z.string().length(24, "Invalid society ID format"),
  submissionImages: z
    .array(
      z.object({
        url: z.string().url("Invalid image URL"),
        gpsMetadata: z
          .object({
            latitude: z.number().min(-90).max(90),
            longitude: z.number().min(-180).max(180),
            accuracy: z.number().min(0),
            timestamp: z.string().datetime(),
          })
          .optional(),
      })
    )
    .min(1, "At least one submission image is required")
    .max(5, "Maximum 5 submission images allowed"),
  gpsMetadata: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().min(0),
    timestamp: z.string().datetime(),
  }),
  iotSensorData: z
    .object({
      deviceId: z.string(),
      deviceType: z.string(),
      vibrationStatus: z.enum(["DETECTED", "NOT_DETECTED", "NO_DATA"]),
      sensorValue: z.number().optional(),
      batteryLevel: z.number().min(0).max(100).optional(),
      timestamp: z.string().datetime(),
      isOnline: z.boolean(),
    })
    .optional(),
  aiTrustScore: z.number().min(0).max(100),
  verificationProbability: z.number().min(0).max(100),
});

export type ReportSubmissionInput = z.infer<typeof reportSubmissionSchema>;

export const submitReport = async (
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

    const parseResult = reportSubmissionSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request format",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const data = parseResult.data;

    const societyAccount = await SocietyAccount.findById(data.societyId);

    if (!societyAccount) {
      res.status(404).json({
        success: false,
        message: "Society not found",
      });
      return;
    }

    if (!societyAccount.isVerified) {
      res.status(403).json({
        success: false,
        message: "Society account not verified",
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (
      user.role === ROLES_LIST.society &&
      user.societyId?.toString() !== data.societyId
    ) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to submit reports for this society",
      });
      return;
    }

    const gpsTimestamp = new Date(data.gpsMetadata.timestamp);

    const report = await Report.create({
      societyAccountId: data.societyId,
      submittedBy: userId,
      submissionImages: data.submissionImages.map((img) => ({
        url: img.url,
        uploadedAt: new Date(),
        gpsMetadata: img.gpsMetadata
          ? {
              latitude: img.gpsMetadata.latitude,
              longitude: img.gpsMetadata.longitude,
              accuracy: img.gpsMetadata.accuracy,
              timestamp: new Date(img.gpsMetadata.timestamp),
            }
          : undefined,
      })),
      gpsMetadata: {
        latitude: data.gpsMetadata.latitude,
        longitude: data.gpsMetadata.longitude,
        accuracy: data.gpsMetadata.accuracy,
        timestamp: gpsTimestamp,
      },
      iotSensorData: data.iotSensorData
        ? {
            deviceId: data.iotSensorData.deviceId,
            deviceType: data.iotSensorData.deviceType,
            vibrationStatus: data.iotSensorData.vibrationStatus,
            sensorValue: data.iotSensorData.sensorValue,
            batteryLevel: data.iotSensorData.batteryLevel,
            timestamp: new Date(data.iotSensorData.timestamp),
            isOnline: data.iotSensorData.isOnline,
          }
        : undefined,
      aiTrustScore: data.aiTrustScore,
      verificationProbability: data.verificationProbability,
      verificationStatus: "PENDING",
      approvalType: "NONE",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await report.populate("societyAccountId", "societyName");

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: {
        reportId: report._id,
        submissionDate: report.submissionDate,
        society: {
          id: societyAccount._id,
          societyName: societyAccount.societyName,
        },
        verificationStatus: report.verificationStatus,
        expiresAt: report.expiresAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting report",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getMyReports = async (
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

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    let societyAccountId = user.societyId;

    if (!societyAccountId) {
      res.status(400).json({
        success: false,
        message: "User is not associated with any society",
      });
      return;
    }

    const reports = await Report.find({ societyAccountId })
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

export const getReportById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const report = await Report.findById(id)
      .populate("societyAccountId", "societyName email phone address")
      .populate("submittedBy", "name email phone")
      .populate("officerId", "name email");

    if (!report) {
      res.status(404).json({
        success: false,
        message: "Report not found",
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (
      user.role === ROLES_LIST.society &&
      report.societyAccountId._id.toString() !== user.societyId?.toString()
    ) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to view this report",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        report,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching report",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const processProofOfLife = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parseResult = reportSubmissionSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request format",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    res.status(200).json({
      success: true,
      status: "PENDING_VERIFICATION",
      message: "Logic placeholder - verification engine not yet implemented",
      data: {
        submittedAt: new Date().toISOString(),
        requestId: `REQ-${Date.now()}`,
        nextSteps: [
          "Validate geofence boundaries",
          "Calculate AI trust score",
          "Match IoT vibration data",
          "Compute final verification status",
          "Auto-expire after 7 days if not reviewed",
        ],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing proof of life",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
