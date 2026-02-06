import mongoose from "mongoose";

export interface IGeoLockCoordinates {
  latitude: number;
  longitude: number;
}

const GeoLockCoordinatesSchema = new mongoose.Schema<IGeoLockCoordinates>(
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
  },
  { _id: false }
);

export interface ISocietyProfileDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  geoLockCoordinates: IGeoLockCoordinates;
  walletBalance: number;
  totalRebatesEarned: number;
  lastComplianceDate?: Date;
  complianceStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

const SocietyProfileSchema = new mongoose.Schema<ISocietyProfileDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BwgSociety",
      required: true,
    },
    geoLockCoordinates: {
      type: GeoLockCoordinatesSchema,
      required: true,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRebatesEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastComplianceDate: {
      type: Date,
    },
    complianceStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

SocietyProfileSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model<ISocietyProfileDocument>(
  "SocietyProfile",
  SocietyProfileSchema
);
