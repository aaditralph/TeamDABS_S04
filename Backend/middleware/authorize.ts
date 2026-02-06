import type { Request, Response, NextFunction } from "express";

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: number;
  };
}

export const authorize = (allowedRoles: number[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const userRole = (req as any).user?.role;

      if (!userRole) {
        res.status(401).json({
          success: false,
          message: "Not authorized, role not found",
        });
        return;
      }

      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Authorization error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
};
