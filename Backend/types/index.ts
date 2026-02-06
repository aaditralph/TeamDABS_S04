import type { Request } from "express";
import type { TokenPayload } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
