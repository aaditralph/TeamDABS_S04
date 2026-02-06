import express, { type Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import officerRoutes from "../routes/officer.js";
import residentRoutes from "../routes/resident.js";
import societyRoutes from "../routes/society.js";
import customerRoutes from "../routes/customer.js";
import adminRoutes from "../routes/admin.js";
import bmcRoutes from "../routes/bmc.js";
import reportsRoutes from "../routes/reports.js";
import verificationRoutes from "../routes/verification.js";
import { errorHandler, notFound } from "../middleware/errorHandler.js";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Role-specific routes
app.use("/api/officer", officerRoutes);
app.use("/api/resident", residentRoutes);
app.use("/api/society", societyRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/bmc", bmcRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/verification", verificationRoutes);

// Admin routes
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Team DABS API", version: "1.0.0" });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
