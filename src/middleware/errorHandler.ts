import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", error);

  if (error.name === "ValidationError") {
    const errors: Record<string, string[]> = {};
    Object.keys(error.errors).forEach((key) => {
      errors[key] = [error.errors[key].message];
    });
    sendError(res, 400, "Validation error", errors);
    return;
  }

  if (error.name === "CastError") {
    sendError(res, 400, "Invalid ID format");
    return;
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    sendError(res, 409, `${field} already exists`);
    return;
  }

  sendError(
    res,
    error.statusCode || 500,
    error.message || "Internal server error"
  );
};
