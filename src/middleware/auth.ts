import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import { verifyAccessToken } from "../utils/jwt";
import { JwtPayload } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      sendError(res, 401, "Access token is required");
      return;
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      sendError(res, 401, "Invalid or expired access token");
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    sendError(res, 401, "Unauthorized");
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    next();
  };
};
