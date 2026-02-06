import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import type { Request, Response } from "express";

const execPromise = promisify(exec);

export interface DetectionResult {
  status: "success" | "error";
  imagePath: string;
  detections?: DetectionItem[];
  error?: string;
}

export interface DetectionItem {
  class: number;
  class_name: string;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface MeterResult {
  status: "Verified" | "Flagged" | "Error";
  meter_details?: {
    serial_number: string;
    reading_kwh: number;
  };
  flagged_details?: {
    is_flagged: boolean;
    reasons: string[];
  };
  message?: string;
}

export const runComposterDetection = async (imagePath: string): Promise<DetectionResult> => {
  try {
    if (!fs.existsSync(imagePath)) {
      return {
        status: "error",
        imagePath,
        error: "Image file not found",
      };
    }

    const pythonScriptPath = path.resolve(__dirname, "../../python_script/predict.py");
    const { stdout, stderr } = await execPromise(`python3 "${pythonScriptPath}" "${imagePath}"`);

    if (stderr && !stdout) {
      return {
        status: "error",
        imagePath,
        error: stderr,
      };
    }

    const result = JSON.parse(stdout);

    return {
      status: result.status === "success" ? "success" : "error",
      imagePath,
      detections: result.detections || [],
      error: result.message,
    };
  } catch (error) {
    return {
      status: "error",
      imagePath,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const runMeterDetection = async (imagePath: string): Promise<MeterResult> => {
  try {
    if (!fs.existsSync(imagePath)) {
      return {
        status: "Error",
        message: "Image file not found",
      };
    }

    const pythonScriptPath = path.resolve(__dirname, "../../python_script/Meter_Verification.py");
    const { stdout, stderr } = await execPromise(`python3 "${pythonScriptPath}" "${imagePath}"`);

    if (stderr && !stdout) {
      return {
        status: "Error",
        message: stderr,
      };
    }

    const result = JSON.parse(stdout);
    return result;
  } catch (error) {
    return {
      status: "Error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const processReportImages = async (
  meterImages: string[],
  composterImages: string[]
): Promise<{
  meterResults: MeterResult[];
  composterResults: DetectionResult[];
}> => {
  const meterResults: MeterResult[] = [];
  const composterResults: DetectionResult[] = [];

  for (const imagePath of meterImages) {
    const result = await runMeterDetection(imagePath);
    meterResults.push(result);
  }

  for (const imagePath of composterImages) {
    const result = await runComposterDetection(imagePath);
    composterResults.push(result);
  }

  return {
    meterResults,
    composterResults,
  };
};

export default {
  runMeterDetection,
  runComposterDetection,
  processReportImages,
};
