import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import config from "../config/config.js";
import { redisClient } from "../config/redis.js";

// ✅ Define your JWT payload shape
interface IUserPayload extends JwtPayload {
  id: string;
  username: string;
}

// ✅ Extend Request
export interface AuthRequest extends Request {
  user?: IUserPayload;
}

export const authUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    res.status(401).json({
      message: "Unauthorized",
      success: false,
      err: "No token provided",
    });
    return;
  }

  try {
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);

    if (isBlacklisted) {
      res.status(401).json({
        message: "Token expired or logged out",
        success: false,
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      config.JWT_SECRET as string,
    ) as IUserPayload;

    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({
      message: "Unauthorized",
      success: false,
      err: "Invalid token",
    });
    return;
  }
};
