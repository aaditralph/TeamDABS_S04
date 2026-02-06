import axios from "axios";
import type { IN8NWebhookResponse } from "../models/Report.js";

export interface N8NPayload {
  reportId: string;
  societyId: string;
  imageUrls: string[];
  gpsMetadata: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  };
  iotSensorData?: {
    deviceId: string;
    deviceType: string;
    vibrationStatus: string;
    sensorValue?: number;
    batteryLevel?: number;
    timestamp: string;
    isOnline: boolean;
  };
  submittedBy: string;
  submissionDate: string;
}

export const triggerN8NWorkflow = async (
  webhookUrl: string,
  payload: N8NPayload
): Promise<IN8NWebhookResponse> => {
  try {
    const response = await axios.post(webhookUrl, payload, {
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return {
      webhookId: response.headers["x-webhook-id"] || undefined,
      workflowId: response.headers["x-workflow-id"] || undefined,
      status: response.status === 200 ? "COMPLETED" : "PENDING",
      rawResponse: response.data,
      processedAt: new Date(),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        status: "ERROR",
        error: error.message,
        processedAt: new Date(),
      };
    }
    return {
      status: "ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
      processedAt: new Date(),
    };
  }
};

export const processN8NResponse = async (
  webhookUrl: string,
  payload: N8NPayload
): Promise<{
  success: boolean;
  n8nResponse?: IN8NWebhookResponse;
  error?: string;
}> => {
  try {
    const n8nResponse = await triggerN8NWorkflow(webhookUrl, payload);

    if (n8nResponse.status === "ERROR") {
      return {
        success: false,
        n8nResponse,
        error: n8nResponse.error,
      };
    }

    return {
      success: true,
      n8nResponse,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export default {
  triggerN8NWorkflow,
  processN8NResponse,
};
