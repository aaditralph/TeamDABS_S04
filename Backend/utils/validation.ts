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
