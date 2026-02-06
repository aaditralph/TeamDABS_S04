import mongoose from "mongoose";

export interface IIoTDeviceDocument extends mongoose.Document {
  deviceHardwareId: string;
  linkedSocietyId: mongoose.Types.ObjectId;
  deviceType: string;
  firmwareVersion: string;
  lastHeartbeat: Date;
  isOnline: boolean;
  lastKnownLatitude?: number;
  lastKnownLongitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

const IoTDeviceSchema = new mongoose.Schema<IIoTDeviceDocument>(
  {
    deviceHardwareId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    linkedSocietyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deviceType: {
      type: String,
      required: true,
      enum: ["VIBRATION_SENSOR", "CAMERA", "METER", "GATEWAY"],
      default: "VIBRATION_SENSOR",
    },
    firmwareVersion: {
      type: String,
      default: "1.0.0",
    },
    lastHeartbeat: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastKnownLatitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    lastKnownLongitude: {
      type: Number,
      min: -180,
      max: 180,
    },
  },
  {
    timestamps: true,
  }
);

IoTDeviceSchema.index({ deviceHardwareId: 1 }, { unique: true });
IoTDeviceSchema.index({ linkedSocietyId: 1 });

export default mongoose.model<IIoTDeviceDocument>(
  "IoTDevice",
  IoTDeviceSchema
);
