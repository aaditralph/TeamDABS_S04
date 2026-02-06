import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

export interface TokenPayload {
  userId: string;
  email: string;
  role: number;
}

export const generateToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRE as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
