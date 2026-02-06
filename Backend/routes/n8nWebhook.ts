import { Router } from "express";
import type { Request, Response } from "express";
import Report from "../models/Report.js";
import mongoose from "mongoose";

const router = Router();

router.post("/n8n-callback", async (req: Request, res: Response): Promise<void> => {
  try {
    const reportId = req.body.reportId || req.body.report_id;
    const detectionResults = req.body.detectionResults || req.body.detection_results;
    const aiTrustScore = req.body.aiTrustScore || req.body.ai_trust_score || req.body.trustScore;
    const verificationProbability = req.body.verificationProbability || req.body.verification_probability || req.body.probability;
    const status = req.body.status;
    const error = req.body.error;

    if (!reportId) {
      res.status(400).json({
        success: false,
        message: "reportId is required",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      res.status(400).json({
        success: false,
        message: "Invalid reportId format",
      });
      return;
    }

    const report = await Report.findById(reportId);

    if (!report) {
      res.status(404).json({
        success: false,
        message: "Report not found",
      });
      return;
    }

    const updateData: any = {
      n8nWebhookResponse: {
        webhookId: req.headers["x-webhook-id"]?.toString() || req.headers["x-webhook-id"]?.toString(),
        workflowId: req.headers["x-workflow-id"]?.toString() || req.headers["x-workflow-id"]?.toString(),
        status: status || "COMPLETED",
        detectionResults,
        aiTrustScore,
        verificationProbability,
        rawResponse: req.body,
        processedAt: new Date(),
        error,
      },
    };

    if (aiTrustScore !== undefined) {
      updateData.aiTrustScore = Number(aiTrustScore);
    }

    if (verificationProbability !== undefined) {
      updateData.verificationProbability = Number(verificationProbability);
    }

    if ((status === "COMPLETED" || !status) && !error) {
      updateData.autoProcessedAt = new Date();
      updateData.autoProcessedBy = "N8N_WORKFLOW";

      const trustScore = Number(aiTrustScore) || 0;
      const probScore = Number(verificationProbability) || 0;

      if (trustScore >= 50 && probScore >= 50) {
        updateData.verificationStatus = "AUTO_APPROVED";
        updateData.approvalType = "AUTOMATIC";
      } else {
        updateData.verificationStatus = "PENDING";
        updateData.approvalType = "NONE";
      }
    }

    if (status === "ERROR" || error) {
      updateData.verificationStatus = "PENDING";
      updateData.approvalType = "NONE";
    }

    await Report.findByIdAndUpdate(reportId, updateData);

    const updatedReport = await Report.findById(reportId);

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: {
        reportId,
        verificationStatus: updatedReport?.verificationStatus || report.verificationStatus,
        approvalType: updatedReport?.approvalType || report.approvalType,
        aiTrustScore: updateData.aiTrustScore,
        verificationProbability: updateData.verificationProbability,
        detectionResults,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing n8n webhook",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/n8n-callback/:reportId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      res.status(400).json({
        success: false,
        message: "Invalid reportId format",
      });
      return;
    }

    const report = await Report.findById(reportId)
      .select("n8nWebhookResponse verificationImages aiTrustScore verificationProbability verificationStatus approvalType")
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
        reportId: report._id,
        verificationStatus: report.verificationStatus,
        approvalType: report.approvalType,
        aiTrustScore: report.aiTrustScore,
        verificationProbability: report.verificationProbability,
        n8nWebhookResponse: report.n8nWebhookResponse,
        verificationImages: report.verificationImages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching n8n response",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
