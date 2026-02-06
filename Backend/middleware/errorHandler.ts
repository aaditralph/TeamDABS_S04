import type { Request, Response, NextFunction } from "express";

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  stack?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);

  const response: ErrorResponse = {
    success: false,
    message: err.message || "Internal Server Error",
    error: err.name || "Error",
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(500).json(response);
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: `Route not found - ${req.originalUrl}`,
  });
};
