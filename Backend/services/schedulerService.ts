import mongoose from "mongoose";
import Report, { IReportDocument } from "../models/Report.js";
import SocietyAccount from "../models/SocietyAccount.js";
import User from "../models/User.js";
import { VERIFICATION_CONFIG } from "../config/verification.js";
import notificationService from "./notificationService.js";

interface AutoProcessResult {
  processedCount: number;
  approvedCount: number;
  rejectedCount: number;
  expiredCount: number;
  errors: string[];
}

export const autoProcessExpiredReports = async (): Promise<AutoProcessResult> => {
  const result: AutoProcessResult = {
    processedCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    expiredCount: 0,
    errors: [],
  };

  try {
    const now = new Date();

    const expiredReports = await Report.find({
      verificationStatus: "PENDING",
      expiresAt: { $lt: now },
    }).populate("societyAccountId");

    for (const report of expiredReports) {
      try {
        const societyAccount = report.societyAccountId as unknown as {
          _id: mongoose.Types.ObjectId;
          societyName: string;
          walletBalance: number;
          propertyTaxEstimate: number;
        };

        const threshold = VERIFICATION_CONFIG.AUTO_APPROVAL_THRESHOLD;

        if (report.verificationProbability >= threshold) {
          report.verificationStatus = "AUTO_APPROVED";
          report.approvalType = "AUTOMATIC";
          report.autoProcessedAt = new Date();
          report.autoProcessedBy = "SYSTEM_AUTO_PROCESSOR";

          const rebateAmount = await calculateRebateAmount(report, societyAccount);

          if (rebateAmount > 0) {
            report.rebateAmount = rebateAmount;

            await SocietyAccount.findByIdAndUpdate(report.societyAccountId, {
              $inc: {
                walletBalance: rebateAmount,
                totalRebatesEarned: rebateAmount,
              },
              lastComplianceDate: new Date(),
            });
          }

          result.approvedCount++;
        } else {
          report.verificationStatus = "REJECTED";
          report.approvalType = "AUTOMATIC";
          report.rejectionReason = `Auto-rejected: Verification probability (${report.verificationProbability}%) below threshold (${threshold}%)`;
          report.autoProcessedAt = new Date();
          report.autoProcessedBy = "SYSTEM_AUTO_PROCESSOR";

          result.rejectedCount++;
        }

        await report.save();
        result.processedCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        result.errors.push(`Error processing report ${report._id}: ${errorMessage}`);
      }
    }

    const alreadyExpired = await Report.countDocuments({
      verificationStatus: "EXPIRED",
    });

    result.expiredCount = alreadyExpired;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    result.errors.push(`Critical error in auto-process: ${errorMessage}`);
  }

  return result;
};

export const sendPendingReportNotifications = async (): Promise<{
  notifiedCount: number;
  remindersCount: number;
}> => {
  const result = {
    notifiedCount: 0,
    remindersCount: 0,
  };

  try {
    const now = new Date();
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + VERIFICATION_CONFIG.REPORT_EXPIRY_DAYS);

    const pendingReports = await Report.find({
      verificationStatus: "PENDING",
    }).populate("societyAccountId");

    const officers = await User.find({
      role: 12,
      isVerified: true,
      isActive: true,
    });

    for (const report of pendingReports) {
      const societyAccount = report.societyAccountId as unknown as {
        _id: mongoose.Types.ObjectId;
        societyName: string;
      };

      const needsReminder = report.notificationSentAt &&
        now.getTime() - new Date(report.notificationSentAt).getTime() > 24 * 60 * 60 * 1000;

      if (!report.notificationSentAt || needsReminder) {
        for (const officer of officers) {
          const hasAlreadyReceived = report.notifiedOfficers.some(
            (id) => id.toString() === officer._id.toString()
          );

          if (!hasAlreadyReceived) {
            await notificationService.sendNotificationToOfficer(officer._id.toString(), {
              type: "NEW_REPORT",
              reportId: report._id.toString(),
              societyName: societyAccount.societyName,
              verificationProbability: report.verificationProbability,
              aiTrustScore: report.aiTrustScore,
              submissionDate: report.submissionDate,
              expiresAt: report.expiresAt,
            });

            report.notifiedOfficers.push(officer._id);

            if (!report.notificationSentAt) {
              report.notificationSentAt = new Date();
            }

            report.lastReminderAt = new Date();

            result.notifiedCount++;
          } else if (needsReminder) {
            await notificationService.sendNotificationToOfficer(officer._id.toString(), {
              type: "REPORT_REMINDER",
              reportId: report._id.toString(),
              societyName: societyAccount.societyName,
              daysUntilExpiry: Math.ceil(
                (new Date(report.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              ),
            });

            result.remindersCount++;
          }
        }

        await report.save();
      }
    }

  } catch (error) {
    console.error("Error sending notifications:", error);
  }

  return result;
};

async function calculateRebateAmount(
  report: IReportDocument,
  societyAccount: any
): Promise<number> {
  if (!societyAccount.propertyTaxEstimate || societyAccount.propertyTaxEstimate <= 0) {
    return 0;
  }

  const submissionDate = new Date(report.submissionDate);
  const approvedDate = report.autoProcessedAt ? new Date(report.autoProcessedAt) : new Date();

  const diffTime = approvedDate.getTime() - submissionDate.getTime();
  const approvedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  report.approvedDays = approvedDays;

  const rebate = societyAccount.propertyTaxEstimate * 0.05 * (approvedDays / 365);

  return Math.round(rebate * 100) / 100;
}

export const startScheduler = (): void => {
  console.log("Starting report auto-processor scheduler...");

  setInterval(async () => {
    console.log(`[${new Date().toISOString()}] Running auto-process for expired reports...`);

    const result = await autoProcessExpiredReports();

    if (result.processedCount > 0) {
      console.log(`Auto-processed ${result.processedCount} reports:`,
        `Approved: ${result.approvedCount}, Rejected: ${result.rejectedCount}`);

      if (result.errors.length > 0) {
        console.error("Errors:", result.errors);
      }
    }
  }, VERIFICATION_CONFIG.AUTO_EXPIRY_CHECK_INTERVAL_MINUTES * 60 * 1000);

  setInterval(async () => {
    const notifResult = await sendPendingReportNotifications();

    if (notifResult.notifiedCount > 0 || notifResult.remindersCount > 0) {
      console.log(`[${new Date().toISOString()}] Sent notifications:`,
        `New: ${notifResult.notifiedCount}, Reminders: ${notifResult.remindersCount}`);
    }
  }, 60 * 60 * 1000);

  console.log("Scheduler started successfully");
};

export default {
  autoProcessExpiredReports,
  sendPendingReportNotifications,
  startScheduler,
};
