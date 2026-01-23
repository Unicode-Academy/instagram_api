import { User, IUser } from "../models/User";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  storeRefreshToken,
  getRefreshToken,
  removeRefreshToken,
} from "../utils/jwt";
import { AuthTokens } from "../types";
import { emailService } from "./email.service";
import crypto from "crypto";
import redisClient from "../config/redis";

export class AuthService {
  async register(
    email: string,
    username: string,
    password: string,
    fullName?: string,
    gender?: string,
    website?: string,
    baseUrl?: string,
  ): Promise<IUser> {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new Error("User already exists with this email or username");
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const user = new User({
      email,
      username,
      password,
      fullName,
      gender: gender || "prefer_not_to_say",
      website,
      isVerified: false,
      verificationToken: verificationTokenHash,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await user.save();

    // Send verification email
    const frontendUrl = baseUrl || process.env.FRONTEND_URL;
    const verificationLink = `${frontendUrl}/verify-email/${verificationToken}`;
    await emailService.sendVerificationEmail(
      email,
      verificationToken,
      verificationLink,
    );

    return user;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: IUser; tokens: AuthTokens }> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new Error(
        "Please verify your email before logging in. Check your inbox for the verification link.",
      );
    }

    const tokens = this.generateTokens(user);
    await storeRefreshToken(user._id as string, tokens.refreshToken);

    return { user, tokens };
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new Error("Invalid refresh token");
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const tokens = this.generateTokens(user);
    await storeRefreshToken(user._id as string, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await removeRefreshToken(userId);
  }

  private generateTokens(user: IUser): AuthTokens {
    const payload = {
      userId: user._id as string,
      email: user.email,
    };

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }

  private async verifyRefreshToken(token: string) {
    const payload = verifyRefreshToken(token);

    if (!payload) {
      throw new Error("Invalid refresh token");
    }

    // Verify token exists in Redis
    const storedToken = await redisClient.get(
      `refresh_token:${payload.userId}`,
    );

    if (!storedToken || storedToken !== token) {
      throw new Error("Refresh token not found or invalid");
    }

    return payload;
  }

  async loginWithGoogle(
    googleId: string,
    email: string,
    fullName: string,
    profilePicture: string,
  ): Promise<{ user: IUser; tokens: AuthTokens }> {
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email,
          username: email.split("@")[0],
          password: Math.random().toString(36),
          googleId,
          fullName,
          profilePicture,
          isVerified: true,
        });
        await user.save();
      } else {
        user.googleId = googleId;
        await user.save();
      }
    }

    const tokens = this.generateTokens(user);
    await storeRefreshToken(user._id as string, tokens.refreshToken);

    return { user, tokens };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Verify old password
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      throw new Error("Old password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save();
  }

  async forgotPassword(email: string, baseUrl?: string): Promise<string> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found with this email");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Store token in database with 1-hour expiry
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send email with reset link
    const frontendUrl = baseUrl || process.env.FRONTEND_URL;
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;
    await emailService.sendPasswordResetEmail(email, resetToken, resetLink);

    return "Password reset link sent to your email";
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    // Hash the token to match stored hash
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    // Send confirmation email
    await emailService.sendPasswordChangeConfirmation(user.email);
  }

  async verifyEmail(verificationToken: string): Promise<void> {
    // Hash the token to match stored hash
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Find user with valid verification token
    const user = await User.findOne({
      verificationToken: verificationTokenHash,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new Error("Invalid or expired verification token");
    }

    // Mark user as verified and clear token
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    // Send verification success email
    await emailService.sendVerificationSuccess(user.email);
  }

  async resendVerificationEmail(
    email: string,
    baseUrl?: string,
  ): Promise<string> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found with this email");
    }

    if (user.isVerified) {
      throw new Error("User is already verified");
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    user.verificationToken = verificationTokenHash;
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    const frontendUrl = baseUrl || process.env.FRONTEND_URL;
    const verificationLink = `${frontendUrl}/verify-email/${verificationToken}`;
    await emailService.sendVerificationEmail(
      email,
      verificationToken,
      verificationLink,
    );

    return "Verification email sent";
  }

  async deleteUserByEmail(email: string): Promise<void> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found with this email");
    }

    // Delete user profile picture if exists
    if (user.profilePicture) {
      try {
        const fs = require("fs");
        const path = require("path");
        const filePath = path.join(__dirname, `../../${user.profilePicture}`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error("Error deleting profile picture:", error);
        // Continue with user deletion even if picture deletion fails
      }
    }

    // Remove refresh tokens from Redis
    await removeRefreshToken(user._id as string);

    // Delete user from database
    await User.findByIdAndDelete(user._id);
  }
}

export const authService = new AuthService();
