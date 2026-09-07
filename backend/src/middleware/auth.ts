
import {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt, {
  JwtPayload,
} from "jsonwebtoken";

// =========================================================
// AUTHENTICATED REQUEST
// =========================================================

export interface AuthenticatedRequest
  extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

// =========================================================
// JWT SECRET
// =========================================================

const JWT_SECRET: string =
  process.env.JWT_SECRET || "";

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is missing from backend/.env"
  );
}

// =========================================================
// AUTH MIDDLEWARE
// =========================================================

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // -------------------------------------------------------
    // GET AUTHORIZATION HEADER
    // -------------------------------------------------------

    const authorization =
      req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    // -------------------------------------------------------
    // CHECK BEARER TOKEN
    // -------------------------------------------------------

    const parts =
      authorization.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer" ||
      !parts[1]
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization format.",
      });
    }

    const token = parts[1];

    // -------------------------------------------------------
    // VERIFY JWT
    // -------------------------------------------------------

    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      );

    // -------------------------------------------------------
    // CHECK JWT PAYLOAD
    // -------------------------------------------------------

    if (
      typeof decoded !== "object" ||
      decoded === null
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }

    const payload =
      decoded as JwtPayload;

    // -------------------------------------------------------
    // GET USER INFORMATION
    // -------------------------------------------------------

    const userId =
      Number(payload.userId);

    const email =
      payload.email;

    const role =
      payload.role;

    // -------------------------------------------------------
    // VALIDATE USER INFORMATION
    // -------------------------------------------------------

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid user information in token.",
      });
    }

    if (
      typeof email !== "string" ||
      !email
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email information in token.",
      });
    }

    if (
      typeof role !== "string" ||
      !role
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid role information in token.",
      });
    }

    // -------------------------------------------------------
    // ATTACH USER TO REQUEST
    // -------------------------------------------------------

    req.user = {
      userId,
      email,
      role,
    };

    // -------------------------------------------------------
    // CONTINUE
    // -------------------------------------------------------

    return next();

  } catch (error) {
    console.error(
      "Authentication error:",
      error
    );

    // -------------------------------------------------------
    // EXPIRED TOKEN
    // -------------------------------------------------------

    if (
      error instanceof jwt.TokenExpiredError
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Your authentication session has expired. Please log in again.",
      });
    }

    // -------------------------------------------------------
    // INVALID TOKEN
    // -------------------------------------------------------

    if (
      error instanceof jwt.JsonWebTokenError
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }

    // -------------------------------------------------------
    // OTHER ERROR
    // -------------------------------------------------------

    return res.status(500).json({
      success: false,
      message:
        "Authentication error.",
    });
  }
}

// =========================================================
// DEFAULT EXPORT
// =========================================================

export default authMiddleware;