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
      .select("societyName email phone address dailyCompostWeight walletBalance totalRebatesEarned complianceStreak lastComplianceDate")
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

    const avgVerificationScore = reports.length > 0
      ? reports.reduce((sum, r) => sum + (r.verificationProbability || 0), 0) / reports.length
      : 0;

    res.status(200).json({
      success: true,
      message: "Society reports retrieved successfully",
      data: {
        society: {
          societyName: society.societyName,
          totalRebatesEarned: totalRebates,
          averageVerificationScore: Math.round(avgVerificationScore * 100) / 100,
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

router.get("/societies/:societyName/tax-rebates", async (req: Request, res: Response): Promise<void> => {
  try {
    const { societyName } = req.params;
    const { fromDate, toDate } = req.query;

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

    const filter: any = {
      societyAccountId: society._id,
      rebateAmount: { $gt: 0 },
    };

    if (fromDate || toDate) {
      filter.submissionDate = {};
      if (fromDate) {
        filter.submissionDate.$gte = new Date(fromDate as string);
      }
      if (toDate) {
        filter.submissionDate.$lte = new Date(toDate as string);
      }
    }

    const approvedReports = await Report.find(filter)
      .select("submissionDate rebateAmount approvedDays verificationStatus approvalType")
      .sort({ submissionDate: -1 })
      .lean();

    const totalRebates = approvedReports.reduce((sum, r) => sum + (r.rebateAmount || 0), 0);
    const totalApprovedDays = approvedReports.reduce((sum, r) => sum + (r.approvedDays || 0), 0);

    res.status(200).json({
      success: true,
      message: "Tax rebates retrieved successfully",
      data: {
        society: {
          societyName: society.societyName,
          propertyTaxEstimate: society.propertyTaxEstimate,
        },
        summary: {
          totalRebatesEarned: totalRebates,
          totalApprovedReports: approvedReports.length,
          totalApprovedDays,
          averageRebatePerReport: approvedReports.length > 0 ? Math.round((totalRebates / approvedReports.length) * 100) / 100 : 0,
        },
        rebates: approvedReports,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tax rebates",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/leaderboard", async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit, offset } = req.query;
    const pageLimit = limit ? parseInt(limit as string) : 50;
    const pageOffset = offset ? parseInt(offset as string) : 0;

    const societies = await SocietyAccount.find({
      isVerified: true,
      isActive: true,
    })
      .select("societyName walletBalance totalRebatesEarned complianceStreak lastComplianceDate dailyCompostWeight")
      .lean();

    const leaderboardData = await Promise.all(
      societies.map(async (society) => {
        const totalReports = await Report.countDocuments({
          societyAccountId: society._id,
        });

        const approvedReports = await Report.find({
          societyAccountId: society._id,
          verificationStatus: { $in: ["AUTO_APPROVED", "OFFICER_APPROVED"] },
        }).select("verificationProbability approvedDays").lean();

        const totalVerificationScore = approvedReports.reduce((sum, r) => sum + (r.verificationProbability || 0), 0);
        const avgVerificationScore = approvedReports.length > 0 ? totalVerificationScore / approvedReports.length : 0;

        const consistencyScore = totalReports > 0
          ? (approvedReports.length / totalReports) * 100
          : 0;

        const complianceBonus = society.complianceStreak * 2;

        const overallScore = Math.round(
          (avgVerificationScore * 0.5) + (consistencyScore * 0.3) + (complianceBonus * 0.2)
        );

        return {
          societyId: society._id,
          societyName: society.societyName,
          totalReports,
          approvedReports: approvedReports.length,
          consistencyScore: Math.round(consistencyScore * 100) / 100,
          averageVerificationScore: Math.round(avgVerificationScore * 100) / 100,
          complianceStreak: society.complianceStreak,
          totalRebatesEarned: society.totalRebatesEarned || 0,
          overallScore,
          lastComplianceDate: society.lastComplianceDate,
        };
      })
    );

    leaderboardData.sort((a, b) => b.overallScore - a.overallScore);

    const rankedSocieties = leaderboardData.map((society, index) => ({
      ...society,
      rank: index + 1,
    }));

    const totalCount = rankedSocieties.length;
    const paginatedSocieties = rankedSocieties.slice(pageOffset, pageOffset + pageLimit);

    res.status(200).json({
      success: true,
      message: "Leaderboard retrieved successfully",
      data: {
        count: paginatedSocieties.length,
        total: totalCount,
        leaderboard: paginatedSocieties,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/leaderboard/top/:position", async (req: Request, res: Response): Promise<void> => {
  try {
    const { position } = req.params;
    const topCount = parseInt(position) || 10;

    const { leaderboard: fullLeaderboard } = await getLeaderboardData();

    const topSocieties = fullLeaderboard.slice(0, topCount);

    res.status(200).json({
      success: true,
      message: `Top ${topCount} societies retrieved successfully`,
      data: {
        count: topSocieties.length,
        leaderboard: topSocieties,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching top societies",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/leaderboard/society/:societyName", async (req: Request, res: Response): Promise<void> => {
  try {
    const { societyName } = req.params;

    const { leaderboard: fullLeaderboard } = await getLeaderboardData();

    const societyRank = fullLeaderboard.findIndex(
      (s) => s.societyName.toLowerCase() === societyName.toLowerCase()
    );

    if (societyRank === -1) {
      res.status(404).json({
        success: false,
        message: "Society not found in leaderboard",
      });
      return;
    }

    const aboveAverage = societyRank > 0 ? fullLeaderboard[societyRank - 1] : null;
    const belowAverage = societyRank < fullLeaderboard.length - 1 ? fullLeaderboard[societyRank + 1] : null;

    res.status(200).json({
      success: true,
      message: "Society rank retrieved successfully",
      data: {
        rank: societyRank + 1,
        totalSocieties: fullLeaderboard.length,
        society: fullLeaderboard[societyRank],
        comparison: {
          aboveAverage: aboveAverage ? {
            societyName: aboveAverage.societyName,
            rank: societyRank,
            overallScore: aboveAverage.overallScore,
          } : null,
          belowAverage: belowAverage ? {
            societyName: belowAverage.societyName,
            rank: societyRank + 2,
            overallScore: belowAverage.overallScore,
          } : null,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching society rank",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

async function getLeaderboardData(): Promise<{ leaderboard: any[] }> {
  const societies = await SocietyAccount.find({
    isVerified: true,
    isActive: true,
  })
    .select("societyName walletBalance totalRebatesEarned complianceStreak lastComplianceDate")
    .lean();

  const leaderboardData = await Promise.all(
    societies.map(async (society) => {
      const totalReports = await Report.countDocuments({
        societyAccountId: society._id,
      });

      const approvedReports = await Report.find({
        societyAccountId: society._id,
        verificationStatus: { $in: ["AUTO_APPROVED", "OFFICER_APPROVED"] },
      }).select("verificationProbability approvedDays").lean();

      const totalVerificationScore = approvedReports.reduce((sum, r) => sum + (r.verificationProbability || 0), 0);
      const avgVerificationScore = approvedReports.length > 0 ? totalVerificationScore / approvedReports.length : 0;

      const consistencyScore = totalReports > 0
        ? (approvedReports.length / totalReports) * 100
        : 0;

      const complianceBonus = society.complianceStreak * 2;

      const overallScore = Math.round(
        (avgVerificationScore * 0.5) + (consistencyScore * 0.3) + (complianceBonus * 0.2)
      );

      return {
        societyId: society._id,
        societyName: society.societyName,
        totalReports,
        approvedReports: approvedReports.length,
        consistencyScore: Math.round(consistencyScore * 100) / 100,
        averageVerificationScore: Math.round(avgVerificationScore * 100) / 100,
        complianceStreak: society.complianceStreak,
        totalRebatesEarned: society.totalRebatesEarned || 0,
        overallScore,
        lastComplianceDate: society.lastComplianceDate,
      };
    })
  );

  leaderboardData.sort((a, b) => b.overallScore - a.overallScore);

  return { leaderboard: leaderboardData };
}

export default router;
