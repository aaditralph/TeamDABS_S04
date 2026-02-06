import mongoose from "mongoose";

export interface ISocietyAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IGeoLockCoordinates {
  latitude: number;
  longitude: number;
}

export interface IBwgSocietyDocument extends mongoose.Document {
  name: string;
  email: string;
  phone: string;
  societyName: string;
  address: ISocietyAddress;
  geoLockCoordinates: IGeoLockCoordinates;
  walletBalance: number;
  totalRebatesEarned: number;
  lastComplianceDate?: Date;
  complianceStreak: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SocietyAddressSchema = new mongoose.Schema<ISocietyAddress>(
  {
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

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

const BwgSocietySchema = new mongoose.Schema<IBwgSocietyDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    societyName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: SocietyAddressSchema,
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

BwgSocietySchema.index({ email: 1 }, { unique: true });
BwgSocietySchema.index({ societyName: 1 });

export default mongoose.model<IBwgSocietyDocument>(
  "BwgSociety",
  BwgSocietySchema
);
