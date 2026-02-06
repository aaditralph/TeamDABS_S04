import { Router } from "express";
import type { Request, Response } from "express";
import SocietyAccount from "../models/SocietyAccount.js";
import Report from "../models/Report.js";

const router = Router();

router.get("/societies", async (req: Request, res: Response): Promise<void> => {
  try {
    const { compostAvailable } = req.query;

    const filter: any = {
      isVerified: true,
      isActive: true,
    };

    if (compostAvailable === "true") {
      filter.dailyCompostWeight = { $gt: 0 };
    }

    const societies = await SocietyAccount.find(filter)
      .select("societyName email phone address dailyCompostWeight walletBalance totalRebatesEarned lastComplianceDate")
      .lean();

    res.status(200).json({
      success: true,
      message: "Societies retrieved successfully",
      data: {
        count: societies.length,
        societies,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching societies",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/societies/:societyName", async (req: Request, res: Response): Promise<void> => {
  try {
    const { societyName } = req.params;

    const society = await SocietyAccount.findOne({
      societyName: { $regex: new RegExp(`^${societyName}$`, "i") },
      isVerified: true,
      isActive: true,
    }).select("societyName email phone address propertyTaxEstimate electricMeterSerialNumber dailyCompostWeight walletBalance totalRebatesEarned complianceStreak lastComplianceDate createdAt")
      .lean();

    if (!society) {
      res.status(404).json({
        success: false,
        message: "Society not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        society,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching society",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/societies/:societyName/reports", async (req: Request, res: Response): Promise<void> => {
  try {
    const { societyName } = req.params;
    const { status, fromDate, toDate, limit } = req.query;

    const society = await SocietyAccount.findOne({
      societyName: { $regex: new RegExp(`^${societyName}$`, "i") },
      isVerified: true,
    });

    if (!society) {
      res.status(404).json({
        success: false,
        message: "Society not found",
      });
      return;
    }

    const reportFilter: any = {
      societyAccountId: society._id,
    };

    if (status) {
      reportFilter.verificationStatus = status;
    }

    if (fromDate || toDate) {
      reportFilter.submissionDate = {};
      if (fromDate) {
        reportFilter.submissionDate.$gte = new Date(fromDate as string);
      }
      if (toDate) {
        reportFilter.submissionDate.$lte = new Date(toDate as string);
      }
    }

    const reports = await Report.find(reportFilter)
      .select("submissionDate submissionImages gpsMetadata verificationStatus rebateAmount approvedDays aiTrustScore verificationProbability")
      .populate("submittedBy", "name")
      .sort({ submissionDate: -1 })
      .limit(limit ? parseInt(limit as string) : 100)
      .lean();

    const totalRebates = reports
      .filter((r) => r.rebateAmount && r.rebateAmount > 0)
      .reduce((sum, r) => sum + (r.rebateAmount || 0), 0);

    res.status(200).json({
      success: true,
      message: "Society reports retrieved successfully",
      data: {
        society: {
          societyName: society.societyName,
          totalRebatesEarned: totalRebates,
        },
        count: reports.length,
        reports,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching society reports",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/societies/:societyName/reports/:reportId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { societyName, reportId } = req.params;

    const society = await SocietyAccount.findOne({
      societyName: { $regex: new RegExp(`^${societyName}$`, "i") },
      isVerified: true,
    });

    if (!society) {
      res.status(404).json({
        success: false,
        message: "Society not found",
      });
      return;
    }

    const report = await Report.findOne({
      _id: reportId,
      societyAccountId: society._id,
    })
      .populate("submittedBy", "name email phone")
      .populate("officerId", "name")
      .lean();

    if (!report) {
      res.status(404).json({
        success: false,
        message: "Report not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        society: {
          societyName: society.societyName,
          address: society.address,
          propertyTaxEstimate: society.propertyTaxEstimate,
        },
        report,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching report",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
