import type { Request, Response, NextFunction } from "express";
import { verifyToken, type TokenPayload } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
      return;
    }

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
      return;
    }
  } catch (error) {
    next(error);
  }
};
