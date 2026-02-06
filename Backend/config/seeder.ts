import User from "../models/User.js";
import ROLES_LIST from "./roles_list.js";
import bcrypt from "bcrypt";

export const seedAdmin = async (): Promise<void> => {
  try {
    // Check if DABS admin already exists (case-insensitive)
    const existingAdmin = await User.findOne({
      email: { $regex: "^DABS$", $options: "i" },
      role: ROLES_LIST.admin,
    });

    if (existingAdmin) {
      console.log("Admin user (DABS) already exists");
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123", salt);

    // Create admin user with skip validation
    const adminData = {
      name: "DABS",
      email: "DABS",
      password: hashedPassword,
      phone: "0000000000",
      role: ROLES_LIST.admin,
      isVerified: true,
      isActive: true,
      isSuperAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Use native MongoDB driver through mongoose to skip validation
    await User.collection.insertOne(adminData);

    console.log("Admin user (DABS) created successfully");
    console.log("Default credentials: DABS / 123");
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};
