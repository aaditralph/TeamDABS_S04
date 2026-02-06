import mongoose from "mongoose";
import bcrypt from "bcrypt";

export interface IUserDocument extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: number;
  isVerified: boolean;
  isActive: boolean;
  societyId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  documentType?: string;
  documentUrl?: string;
  verificationDate?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  societyName?: string;
  flatNumber?: string;
  buildingName?: string;
  addresses?: Array<{
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    isDefault?: boolean;
  }>;
  isSuperAdmin?: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
      trim: true,
    },
    role: {
      type: Number,
      required: [true, "Please provide a role"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SocietyAccount",
    },
    documentType: {
      type: String,
    },
    documentUrl: {
      type: String,
    },
    verificationDate: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    societyName: {
      type: String,
    },
    flatNumber: {
      type: String,
    },
    buildingName: {
      type: String,
    },
    addresses: [
      {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        landmark: { type: String },
        isDefault: { type: Boolean },
      },
    ],
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1, role: 1 }, { unique: true });

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUserDocument>("User", UserSchema);
