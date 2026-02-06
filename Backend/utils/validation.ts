import { z } from "zod";

// Legacy schemas (backward compatibility)
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Officer schemas
export const officerRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(1, "Phone number is required"),
  documentType: z.string().min(1, "Document type is required"),
});

export const officerLoginSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Resident schemas
export const residentRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(1, "Phone number is required"),
  societyName: z.string().min(1, "Society name is required"),
  flatNumber: z.string().min(1, "Flat number is required"),
  buildingName: z.string().optional(),
});

export const residentLoginSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const updateSocietySchema = z.object({
  societyName: z.string().min(1, "Society name is required"),
  flatNumber: z.string().min(1, "Flat number is required"),
  buildingName: z.string().optional(),
});

// Society schemas
export const societyAddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
});

export const societyRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(1, "Phone number is required"),
  societyName: z.string().min(1, "Society name is required"),
  address: societyAddressSchema,
  propertyTaxEstimate: z.number().min(0, "Property tax estimate must be positive"),
  electricMeterSerialNumber: z.string().min(1, "Electric meter serial number is required"),
  dailyCompostWeight: z.number().min(0, "Daily compost weight must be positive").optional(),
});

export const societyLoginSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Customer schemas
export const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  landmark: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const customerRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(1, "Phone number is required"),
  addresses: z.array(addressSchema).optional(),
});

export const customerLoginSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Admin schemas
export const adminLoginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

// Update profile and password schemas (legacy)
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// Report submission schemas
export const gpsMetadataSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0),
  timestamp: z.string().datetime(),
});

export const imageGpsMetadataSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0),
  timestamp: z.string().datetime(),
}).optional();

export const submissionImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  gpsMetadata: imageGpsMetadataSchema,
});

export const iotSensorDataSchema = z.object({
  deviceId: z.string(),
  deviceType: z.string(),
  vibrationStatus: z.enum(["DETECTED", "NOT_DETECTED", "NO_DATA"]),
  sensorValue: z.number().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  timestamp: z.string().datetime(),
  isOnline: z.boolean(),
});

export const reportSubmissionSchema = z.object({
  societyId: z.string().length(24, "Invalid society ID format"),
  submissionImages: z
    .array(submissionImageSchema)
    .min(1, "At least one submission image is required")
    .max(5, "Maximum 5 submission images allowed"),
  gpsMetadata: gpsMetadataSchema,
  iotSensorData: iotSensorDataSchema.optional(),
  aiTrustScore: z.number().min(0).max(100),
  verificationProbability: z.number().min(0).max(100),
});

export const officerReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  comments: z.string().max(1000).optional(),
  rebateAmount: z.number().min(0).optional(),
  verificationImages: z
    .array(
      z.object({
        url: z.string().url("Invalid image URL"),
        gpsMetadata: imageGpsMetadataSchema,
      })
    )
    .optional(),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OfficerRegisterInput = z.infer<typeof officerRegisterSchema>;
export type OfficerLoginInput = z.infer<typeof officerLoginSchema>;
export type ResidentRegisterInput = z.infer<typeof residentRegisterSchema>;
export type ResidentLoginInput = z.infer<typeof residentLoginSchema>;
export type SocietyRegisterInput = z.infer<typeof societyRegisterSchema>;
export type SocietyLoginInput = z.infer<typeof societyLoginSchema>;
export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateSocietyInput = z.infer<typeof updateSocietySchema>;
export type ReportSubmissionInput = z.infer<typeof reportSubmissionSchema>;
export type OfficerReviewInput = z.infer<typeof officerReviewSchema>;
