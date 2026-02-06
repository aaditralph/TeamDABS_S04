import mongoose from "mongoose";
import { VERIFICATION_CONFIG } from "../config/verification.js";

export type VerificationStatus = "PENDING" | "AUTO_APPROVED" | "OFFICER_APPROVED" | "REJECTED" | "EXPIRED";
export type ApprovalType = "OFFICER" | "AUTOMATIC" | "NONE";

export interface IGPSMetadata {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface IIoTSensorData {
  deviceId: string;
  deviceType: string;
  vibrationStatus: "DETECTED" | "NOT_DETECTED" | "NO_DATA";
  sensorValue?: number;
  batteryLevel?: number;
  timestamp: Date;
  isOnline: boolean;
}

export interface IImageSet {
  url: string;
  uploadedAt: Date;
  gpsMetadata?: IGPSMetadata;
  label?: string;
}

export interface IN8NWebhookResponse {
  webhookId?: string;
  workflowId?: string;
  status?: string;
  detectionResults?: {
    meterResults?: any[];
    composterResults?: any[];
  };
  aiTrustScore?: number;
  verificationProbability?: number;
  rawResponse?: Record<string, any>;
  processedAt?: Date;
  error?: string;
}

export interface IReportDocument extends mongoose.Document {
  societyAccountId: mongoose.Types.ObjectId;
  submittedBy: mongoose.Types.ObjectId;
  submissionDate: Date;
  submissionImages: IImageSet[];
  verificationImages: IImageSet[];
  gpsMetadata: IGPSMetadata;
  iotSensorData?: IIoTSensorData;
  verificationProbability: number;
  aiTrustScore: number;
  verificationStatus: VerificationStatus;
  approvalType: ApprovalType;
  n8nWebhookResponse?: IN8NWebhookResponse;
  officerId?: mongoose.Types.ObjectId;
  reviewTimestamp?: Date;
  officerComments?: string;
  rejectionReason?: string;
  rebateAmount?: number;
  expiresAt: Date;
  notifiedOfficers: mongoose.Types.ObjectId[];
  notificationSentAt?: Date;
  lastReminderAt?: Date;
  autoProcessedAt?: Date;
  autoProcessedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GPSMetadataSchema = new mongoose.Schema<IGPSMetadata>(
  {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
    },
    timestamp: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const ImageSetSchema = new mongoose.Schema<IImageSet>(
  {
    url: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    gpsMetadata: {
      type: GPSMetadataSchema,
    },
    label: {
      type: String,
    },
  },
  { _id: false }
);

const IoTSensorDataSchema = new mongoose.Schema<IIoTSensorData>(
  {
    deviceId: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      required: true,
      enum: ["VIBRATION_SENSOR", "CAMERA", "METER", "GATEWAY", "OTHER"],
      default: "VIBRATION_SENSOR",
    },
    vibrationStatus: {
      type: String,
      required: true,
      enum: ["DETECTED", "NOT_DETECTED", "NO_DATA"],
      default: "NO_DATA",
    },
    sensorValue: {
      type: Number,
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const ReportSchema = new mongoose.Schema<IReportDocument>(
  {
    societyAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SocietyAccount",
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submissionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    submissionImages: {
      type: [ImageSetSchema],
      required: true,
      validate: {
        validator: function (v: IImageSet[]) {
          return v.length >= 1 && v.length <= 5;
        },
        message: "Report must have between 1 and 5 submission images",
      },
    },
    verificationImages: {
      type: [ImageSetSchema],
      default: [],
    },
    gpsMetadata: {
      type: GPSMetadataSchema,
      required: true,
    },
    iotSensorData: {
      type: IoTSensorDataSchema,
    },
    verificationProbability: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    aiTrustScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    verificationStatus: {
      type: String,
      required: true,
      enum: ["PENDING", "AUTO_APPROVED", "OFFICER_APPROVED", "REJECTED", "EXPIRED"],
      default: "PENDING",
    },
    approvalType: {
      type: String,
      required: true,
      enum: ["OFFICER", "AUTOMATIC", "NONE"],
      default: "NONE",
    },
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewTimestamp: {
      type: Date,
    },
    officerComments: {
      type: String,
      maxlength: 1000,
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
    },
    rebateAmount: {
      type: Number,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: function () {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + VERIFICATION_CONFIG.REPORT_EXPIRY_DAYS);
        return expiryDate;
      },
    },
    notifiedOfficers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    notificationSentAt: {
      type: Date,
    },
    lastReminderAt: {
      type: Date,
    },
    autoProcessedAt: {
      type: Date,
    },
    autoProcessedBy: {
      type: String,
      default: "SYSTEM_AUTO_PROCESSOR",
    },
  },
  {
    timestamps: true,
  }
);

ReportSchema.index({ societyAccountId: 1, submissionDate: -1 });
ReportSchema.index({ verificationStatus: 1 });
ReportSchema.index({ expiresAt: 1 });
ReportSchema.index({ submittedBy: 1 });
ReportSchema.index({ notifiedOfficers: 1 });
ReportSchema.index({ verificationStatus: 1, expiresAt: 1 });

const N8NWebhookResponseSchema = new mongoose.Schema<IN8NWebhookResponse>(
  {
    webhookId: {
      type: String,
    },
    workflowId: {
      type: String,
    },
    status: {
      type: String,
    },
    detectionResults: {
      type: mongoose.Schema.Types.Mixed,
    },
    aiTrustScore: {
      type: Number,
    },
    verificationProbability: {
      type: Number,
    },
    rawResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    processedAt: {
      type: Date,
    },
    error: {
      type: String,
    },
  },
  { _id: false }
);

ReportSchema.pre("save", function (this: IReportDocument) {
  if (this.verificationStatus === "PENDING" && new Date() > this.expiresAt) {
    this.verificationStatus = "EXPIRED";
    this.approvalType = "NONE";
  }
});

ReportSchema.add({
  n8nWebhookResponse: {
    type: N8NWebhookResponseSchema,
    default: undefined,
  },
});

export default mongoose.model<IReportDocument>("Report", ReportSchema);
