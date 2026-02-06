import type { Request, Response } from "express";
import { z } from "zod";
import Report from "../models/Report.js";
import User from "../models/User.js";
import SocietyAccount from "../models/SocietyAccount.js";
import ROLES_LIST from "../config/roles_list.js";
import { VERIFICATION_CONFIG } from "../config/verification.js";
import { triggerN8NWorkflow, type N8NPayload } from "../services/n8nService.js";
import { processReportImages } from "../services/detectionService.js";
import path from "path";

interface GeoLocationData {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  timestamp?: string;
}

interface ReportFormData {
  societyName?: string;
  societyId?: string;
  geoLocationData?: GeoLocationData;
  deviceId?: string;
  deviceType?: string;
  vibrationStatus?: string;
  sensorValue?: number;
  batteryLevel?: number;
  isOnline?: boolean;
}

const geoLocationSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  accuracy: z.number().min(0).optional(),
  timestamp: z.string().optional(),
}).optional();

const reportFormDataSchema = z.object({
  societyName: z.string().optional(),
  societyId: z.string().optional(),
  geoLocationData: geoLocationSchema,
  deviceId: z.string().optional(),
  deviceType: z.string().optional(),
  vibrationStatus: z.string().optional(),
  sensorValue: z.number().optional(),
  batteryLevel: z.number().optional(),
  isOnline: z.boolean().optional(),
});

export const reportSubmissionSchema = z.object({
  societyId: z.string().length(24, "Invalid society ID format"),
  submissionImages: z
    array(
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

const fileUploadSchema = z.object({
  meter_image: z.any().optional(),
  composter_image: z.any().optional(),
  societyName: z.string().optional(),
  societyId: z.string().optional(),
  geoLocationData: geoLocationSchema,
  deviceId: z.string().optional(),
  deviceType: z.string().optional(),
  vibrationStatus: z.string().optional(),
  sensorValue: z.number().optional(),
  batteryLevel: z.number().optional(),
  isOnline: z.boolean().optional(),
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

    if (VERIFICATION_CONFIG.N8N_WEBHOOK_URL) {
      const n8nPayload: N8NPayload = {
        reportId: report._id.toString(),
        societyId: data.societyId,
        imageUrls: data.submissionImages.map((img) => img.url),
        gpsMetadata: {
          latitude: data.gpsMetadata.latitude,
          longitude: data.gpsMetadata.longitude,
          accuracy: data.gpsMetadata.accuracy,
          timestamp: data.gpsMetadata.timestamp,
        },
        iotSensorData: data.iotSensorData
          ? {
              deviceId: data.iotSensorData.deviceId,
              deviceType: data.iotSensorData.deviceType,
              vibrationStatus: data.iotSensorData.vibrationStatus,
              sensorValue: data.iotSensorData.sensorValue,
              batteryLevel: data.iotSensorData.batteryLevel,
              timestamp: data.iotSensorData.timestamp,
              isOnline: data.iotSensorData.isOnline,
            }
          : undefined,
        submittedBy: userId.toString(),
        submissionDate: report.submissionDate.toISOString(),
      };

      const n8nResponse = await triggerN8NWorkflow(VERIFICATION_CONFIG.N8N_WEBHOOK_URL, n8nPayload);

      await Report.findByIdAndUpdate(report._id, {
        n8nWebhookResponse: n8nResponse,
        aiTrustScore: n8nResponse.aiTrustScore || data.aiTrustScore,
        verificationProbability: n8nResponse.verificationProbability || data.verificationProbability,
      });
    }

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
        n8nTriggered: !!VERIFICATION_CONFIG.N8N_WEBHOOK_URL,
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

const detectionSchema = z.object({
  meterImages: z.array(z.string()).optional(),
  composterImages: z.array(z.string()).optional(),
});

export const processVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parseResult = detectionSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request format",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const data = parseResult.data;
    const meterImages = data.meterImages || [];
    const composterImages = data.composterImages || [];

    if (meterImages.length === 0 && composterImages.length === 0) {
      res.status(400).json({
        success: false,
        message: "At least one image (meter or composter) is required",
      });
      return;
    }

    const results = await processReportImages(meterImages, composterImages);

    res.status(200).json({
      success: true,
      message: "Detection completed successfully",
      data: {
        meterResults: results.meterResults,
        composterResults: results.composterResults,
        processedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing verification",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const submitReportFormData = async (
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

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const body = req.body as ReportFormData;

    const meterImage = files["meter_image"]?.[0];
    const composterImage = files["composter_image"]?.[0];

    if (!meterImage && !composterImage) {
      res.status(400).json({
        success: false,
        message: "At least one image (meter_image or composter_image) is required",
      });
      return;
    }

    let societyAccountId = body.societyId;

    if (!societyAccountId && body.societyName) {
      const society = await SocietyAccount.findOne({
        societyName: { $regex: new RegExp(`^${body.societyName}$`, "i") },
      });
      if (society) {
        societyAccountId = society._id.toString();
      }
    }

    if (!societyAccountId) {
      const user = await User.findById(userId);
      if (user?.societyId) {
        societyAccountId = user.societyId.toString();
      }
    }

    if (!societyAccountId) {
      res.status(400).json({
        success: false,
        message: "Society ID or Society Name is required",
      });
      return;
    }

    const societyAccount = await SocietyAccount.findById(societyAccountId);

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

    const submissionImages: Array<{
      url: string;
      uploadedAt: Date;
      gpsMetadata?: {
        latitude: number;
        longitude: number;
        accuracy: number;
        timestamp: Date;
      };
      label?: string;
    }> = [];

    if (meterImage) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      submissionImages.push({
        url: `${baseUrl}/uploads/verification/${path.basename(meterImage.path)}`,
        uploadedAt: new Date(),
        gpsMetadata: body.geoLocationData?.latitude && body.geoLocationData?.longitude ? {
          latitude: body.geoLocationData.latitude,
          longitude: body.geoLocationData.longitude,
          accuracy: body.geoLocationData.accuracy || 0,
          timestamp: body.geoLocationData.timestamp ? new Date(body.geoLocationData.timestamp) : new Date(),
        } : undefined,
        label: "meter_image",
      });
    }

    if (composterImage) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      submissionImages.push({
        url: `${baseUrl}/uploads/verification/${path.basename(composterImage.path)}`,
        uploadedAt: new Date(),
        gpsMetadata: body.geoLocationData?.latitude && body.geoLocationData?.longitude ? {
          latitude: body.geoLocationData.latitude,
          longitude: body.geoLocationData.longitude,
          accuracy: body.geoLocationData.accuracy || 0,
          timestamp: body.geoLocationData.timestamp ? new Date(body.geoLocationData.timestamp) : new Date(),
        } : undefined,
        label: "composter_image",
      });
    }

    const gpsMetadata = body.geoLocationData?.latitude && body.geoLocationData?.longitude ? {
      latitude: body.geoLocationData.latitude,
      longitude: body.geoLocationData.longitude,
      accuracy: body.geoLocationData.accuracy || 0,
      timestamp: body.geoLocationData.timestamp ? new Date(body.geoLocationData.timestamp) : new Date(),
    } : undefined;

    const iotSensorData = body.deviceId ? {
      deviceId: body.deviceId,
      deviceType: body.deviceType || "VIBRATION_SENSOR",
      vibrationStatus: (body.vibrationStatus as "DETECTED" | "NOT_DETECTED" | "NO_DATA") || "NO_DATA",
      sensorValue: body.sensorValue,
      batteryLevel: body.batteryLevel,
      timestamp: new Date(),
      isOnline: body.isOnline || false,
    } : undefined;

    const report = await Report.create({
      societyAccountId,
      submittedBy: userId,
      submissionImages,
      gpsMetadata: gpsMetadata || {
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        timestamp: new Date(),
      },
      iotSensorData,
      aiTrustScore: 0,
      verificationProbability: 0,
      verificationStatus: "PENDING",
      approvalType: "NONE",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await report.populate("societyAccountId", "societyName");

    if (VERIFICATION_CONFIG.N8N_WEBHOOK_URL) {
      const n8nPayload: N8NPayload = {
        reportId: report._id.toString(),
        societyId: societyAccountId,
        imageUrls: submissionImages.map((img) => img.url),
        gpsMetadata: gpsMetadata || { latitude: 0, longitude: 0, accuracy: 0, timestamp: new Date().toISOString() },
        iotSensorData,
        submittedBy: userId.toString(),
        submissionDate: report.submissionDate.toISOString(),
      };

      const n8nResponse = await triggerN8NWorkflow(VERIFICATION_CONFIG.N8N_WEBHOOK_URL, n8nPayload);

      await Report.findByIdAndUpdate(report._id, {
        n8nWebhookResponse: n8nResponse,
      });
    }

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
        n8nTriggered: !!VERIFICATION_CONFIG.N8N_WEBHOOK_URL,
        imagesUploaded: submissionImages.length,
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
