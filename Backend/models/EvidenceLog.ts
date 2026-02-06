import mongoose from "mongoose";

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IGPSMetadata {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface IEvidenceLogDocument extends mongoose.Document {
  societyId: mongoose.Types.ObjectId;
  submissionDate: Date;
  photoUrl: string;
  gpsMetadata: IGPSMetadata;
  aiTrustScore: number;
  iotVibrationStatus: string;
  verificationStatus: VerificationStatus;
  officerId?: mongoose.Types.ObjectId;
  reviewTimestamp?: Date;
  officerComments?: string;
  rebateAmount?: number;
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

const EvidenceLogSchema = new mongoose.Schema<IEvidenceLogDocument>(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BwgSociety",
      required: true,
    },
    submissionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    photoUrl: {
      type: String,
      required: true,
    },
    gpsMetadata: {
      type: GPSMetadataSchema,
      required: true,
    },
    aiTrustScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    iotVibrationStatus: {
      type: String,
      required: true,
      enum: ["DETECTED", "NOT_DETECTED", "NO_DATA"],
    },
    verificationStatus: {
      type: String,
      required: true,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
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
    rebateAmount: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

EvidenceLogSchema.index({ societyId: 1, submissionDate: -1 });
EvidenceLogSchema.index({ verificationStatus: 1 });

export default mongoose.model<IEvidenceLogDocument>(
  "EvidenceLog",
  EvidenceLogSchema
);
