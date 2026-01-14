import { Response } from "express";
import { ApiResponse, ApiErrorResponse } from "../types";

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    message,
    data,
    success: true,
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: Record<string, string[]>
): Response<ApiErrorResponse> => {
  return res.status(statusCode).json({
    message,
    errors,
    success: false,
  });
};
