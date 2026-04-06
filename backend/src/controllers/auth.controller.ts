import type { Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";

import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";
import { OAuth2Client } from "google-auth-library";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import config from "../config/config.js";
import { redisClient } from "../config/redis.js";
import axios from "axios";
// Google client
const client = new OAuth2Client(
  config.GOOGLE_CLIENT_ID as string,
  config.GOOGLE_CLIENT_SECRET as string,
  "postmessage",
);

/**
 * Register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExists) {
      res.status(400).json({
        message: "User with this email or username already exists",
        success: false,
        err: "User already exists",
      });
      return;
    }

    const user = await userModel.create({ username, email, password });

    const emailVerificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET as string,
    );

    const backendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    await sendEmail({
      to: email,
      subject: "Welcome to Perplexity!",
      html: `
        <p>Hi ${username},</p>
        <p>Please verify your email:</p>
        <a href="${backendUrl}/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
      `,
    });

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Registration failed",
      success: false,
      err: error.message,
    });
  }
};

/**
 * Login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    res.status(400).json({
      message: "Invalid email or password",
      success: false,
    });
    return;
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    res.status(400).json({
      message: "Invalid email or password",
      success: false,
    });
    return;
  }

  if (!user.verified) {
    res.status(400).json({
      message: "Please verify your email",
      success: false,
    });
    return;
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET as string,
    { expiresIn: "3d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "Login successful",
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
};

/**
 * Get Me
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = (req.user as JwtPayload).id;

  const user = await userModel.findById(userId).select("-password");

  if (!user) {
    res.status(404).json({
      message: "User not found",
      success: false,
    });
    return;
  }

  res.status(200).json({
    message: "User fetched",
    success: true,
    user,
  });
};

/**
 * Verify Email
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token } = req.query;
  const frontendUrl = config.FRONTEND_URL || "http://localhost:5173";

  try {
    const decoded = jwt.verify(
      token as string,
      config.JWT_SECRET as string,
    ) as JwtPayload;

    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      res.redirect(
        `${frontendUrl}/verify-email?status=error&message=UserNotFound`,
      );
      return;
    }

    user.verified = true;
    await user.save();

    res.redirect(`${frontendUrl}/verify-email?status=success`);
  } catch {
    res.redirect(
      `${frontendUrl}/verify-email?status=error&message=InvalidToken`,
    );
  }
};

/**
 * Logout
 */


export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies.token;

    if (token) {
      const expiry = 3 * 24 * 60 * 60;

      await redisClient.set(`blacklist:${token}`, "true", {
        EX: expiry,
      });
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      message: "Logout successful",
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Logout failed",
      success: false,
      err: error.message,
    });
  }
};

/**
 * Resend Verification
 */
export const resendVerificationEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      message: "Email is required",
      success: false,
    });
    return;
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      res.status(404).json({
        message: "User not found",
        success: false,
      });
      return;
    }

    if (user.verified) {
      res.status(400).json({
        message: "Email already verified",
        success: false,
      });
      return;
    }

    const token = jwt.sign(
      { email: user.email },
      config.JWT_SECRET as string,
    );

    const backendUrl = config.FRONTEND_URL || "http://localhost:3000";

    await sendEmail({
      to: email,
      subject: "Verify your account",
      html: `<a href="${backendUrl}/api/auth/verify-email?token=${token}">Verify</a>`,
    });

    res.status(200).json({
      message: "Verification email resent",
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to resend email",
      success: false,
      err: error.message,
    });
  }
};

/**
 * Google Auth
 */
export const googleAuth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ message: "Google token required" });
      return;
    }

    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      res.status(400).json({ message: "No id_token" });
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.GOOGLE_CLIENT_ID as string,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(400).json({ message: "Email not found" });
      return;
    }

    const email: string = payload.email;

    // store first
    const name = payload.name;
    const sub = payload.sub;
    const picture = payload.picture;

    const username: string =
      typeof name === "string" ? name : email.split("@")[0];

    const googleId: string | null = typeof sub === "string" ? sub : null;

    const userPicture: string | null =
      typeof picture === "string" ? picture : null;

    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        username,
        email,
        provider: "google",
        googleId,
        picture: userPicture,
        verified: true,
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      config.JWT_SECRET as string,
      { expiresIn: "3d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Google login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    try {
      require("fs").writeFileSync("google_error_log.txt", String(error.message || error) + "\n" + (error.response?.data ? JSON.stringify(error.response.data) : ""));
    } catch (e) {}
    res.status(401).json({
      message: "Google authentication failed",
      error: error?.message || String(error)
    });
  }
};


export const githubAuth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ message: "GitHub code required" });
      return;
    }

    // Step 1: Get access token
    const frontendUrl = config.FRONTEND_URL || "http://localhost:5173";
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: config.GITHUB_CLIENT_ID,
        client_secret: config.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${frontendUrl}/login`,
      },
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    const accessToken = tokenRes.data.access_token;

    if (!accessToken) {
      res.status(400).json({ message: "Failed to get access token" });
      return;
    }

    // Step 2: Get user info
    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = userRes.data;

    // Step 3: Get email (IMPORTANT)
    const emailRes = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const primaryEmailObj = emailRes.data.find(
      (e: any) => e.primary && e.verified,
    );

    const email: string | undefined = primaryEmailObj?.email;

    if (!email) {
      res.status(400).json({ message: "Email not found from GitHub" });
      return;
    }

    // Safe values
    const username: string =
      typeof githubUser.login === "string"
        ? githubUser.login
        : email.split("@")[0];

    const githubId: string =
      typeof githubUser.id === "number"
        ? String(githubUser.id)
        : "";

    const picture: string | null =
      typeof githubUser.avatar_url === "string"
        ? githubUser.avatar_url
        : null;

    // Step 4: Find or create user
    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        username,
        email,
        provider: "github",
        githubId: githubId,
        picture,
        verified: true,
      });
    }

    user.provider = "github";
    await user.save();


    // Step 5: Generate JWT
    const token = jwt.sign(
      { id: user._id.toString(), username: user.username },
      config.JWT_SECRET as string,
      { expiresIn: "3d" },
    );

    // Step 6: Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "GitHub login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("GitHub Auth Error:", error.response?.data || error.message);
    try {
      require("fs").writeFileSync("github_error_log.txt", String(error.message || error) + "\n" + (error.response?.data ? JSON.stringify(error.response.data) : ""));
    } catch (e) {}

    res.status(500).json({
      message: "GitHub authentication failed",
      error: error?.message || String(error),
      details: error.response?.data
    });
  }
};
