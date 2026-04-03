import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import config from "../config/config.js";

// 1. Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

// 2. Middleware
export const authUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({
      message: "Unauthorized",
      success: false,
      err: "No token provided",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET as string);

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      message: "Unauthorized",
      success: false,
      err: "Invalid token",
    });
  }
};
