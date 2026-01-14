import jwt, { Secret } from "jsonwebtoken";
import { JwtPayload } from "../types";
import redisClient from "../config/redis";

export const generateAccessToken = (payload: JwtPayload): string => {
  const secret: Secret = process.env.JWT_SECRET || "secret";
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  } as any);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const secret: Secret = process.env.JWT_REFRESH_SECRET || "refresh_secret";
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  } as any);
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || "refresh_secret"
    ) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const storeRefreshToken = async (
  userId: string,
  token: string
): Promise<void> => {
  try {
    await redisClient.setEx(
      `refresh_token:${userId}`,
      30 * 24 * 60 * 60,
      token
    );
  } catch (error) {
    console.error("Error storing refresh token in Redis:", error);
  }
};

export const getRefreshToken = async (
  userId: string
): Promise<string | null> => {
  try {
    return await redisClient.get(`refresh_token:${userId}`);
  } catch (error) {
    console.error("Error retrieving refresh token from Redis:", error);
    return null;
  }
};

export const removeRefreshToken = async (userId: string): Promise<void> => {
  try {
    await redisClient.del(`refresh_token:${userId}`);
  } catch (error) {
    console.error("Error removing refresh token from Redis:", error);
  }
};
