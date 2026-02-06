import multer from "multer";
import path from "path";
import fs from "fs";
import type { Request, Response, NextFunction } from "express";

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || "./uploads";
const officersDir = path.join(uploadDir, "officers");

if (!fs.existsSync(officersDir)) {
  fs.mkdirSync(officersDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, officersDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `officer-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter - only allow PDF, JPG, PNG
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only PDF, JPG, and PNG files are allowed."),
    );
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB default
  },
});

// Error handling middleware for multer
export const handleUploadError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  next();
};

export const sendFile = async (
  filePath: string,
  res: Response,
): Promise<void> => {
  try {
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: "File not found",
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
    };

    const contentType = contentTypes[ext] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="officer-document${ext}"`,
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending file",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Helper function to delete file
export const deleteFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};
