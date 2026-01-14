import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { authService } from "../services/auth.service";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "../utils/validation";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const {
        email,
        username,
        password,
        confirmPassword,
        fullName,
        gender,
        website,
      } = req.body;

      // Validation
      const errors: Record<string, string[]> = {};

      if (!email || !validateEmail(email)) {
        errors.email = ["Valid email is required"];
      }

      if (!username) {
        errors.username = ["Username is required"];
      } else {
        const usernameErrors = validateUsername(username);
        if (usernameErrors.length > 0) {
          errors.username = usernameErrors;
        }
      }

      if (!password) {
        errors.password = ["Password is required"];
      } else {
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
          errors.password = passwordErrors;
        }
      }

      if (password !== confirmPassword) {
        errors.confirmPassword = ["Passwords do not match"];
      }

      if (Object.keys(errors).length > 0) {
        sendError(res, 400, "Validation error", errors);
        return;
      }

      const user = await authService.register(
        email,
        username,
        password,
        fullName,
        gender,
        website
      );

      sendSuccess(res, 201, "User registered successfully", {
        _id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        gender: user.gender,
        website: user.website,
      });
    } catch (error: any) {
      sendError(res, 400, error.message);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const errors: Record<string, string[]> = {};

      if (!email) {
        errors.email = ["Email is required"];
      }

      if (!password) {
        errors.password = ["Password is required"];
      }

      if (Object.keys(errors).length > 0) {
        sendError(res, 400, "Validation error", errors);
        return;
      }

      const { user, tokens } = await authService.login(email, password);

      sendSuccess(res, 200, "Login successful", {
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          gender: user.gender,
          website: user.website,
          profilePicture: user.profilePicture,
        },
        tokens,
      });
    } catch (error: any) {
      sendError(res, 401, error.message);
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        sendError(res, 400, "Refresh token is required");
        return;
      }

      const tokens = await authService.refreshAccessToken(refreshToken);

      sendSuccess(res, 200, "Token refreshed successfully", tokens);
    } catch (error: any) {
      sendError(res, 401, error.message);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      await authService.logout(req.user.userId);

      sendSuccess(res, 200, "Logout successful");
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validation
      const errors: Record<string, string[]> = {};

      if (!currentPassword) {
        errors.oldPassword = ["Old password is required"];
      }

      if (!newPassword) {
        errors.newPassword = ["New password is required"];
      } else {
        const passwordErrors = validatePassword(newPassword);
        if (passwordErrors.length > 0) {
          errors.newPassword = passwordErrors;
        }
      }

      if (newPassword !== confirmPassword) {
        errors.confirmPassword = ["New passwords do not match"];
      }

      if (currentPassword === newPassword) {
        errors.newPassword = [
          "New password must be different from old password",
        ];
      }

      if (Object.keys(errors).length > 0) {
        sendError(res, 400, "Validation error", errors);
        return;
      }

      await authService.changePassword(
        req.user.userId,
        currentPassword,
        newPassword
      );

      sendSuccess(res, 200, "Password changed successfully");
    } catch (error: any) {
      sendError(res, 400, error.message);
    }
  }

  async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { id, email, name, picture } = req.user as any;

      const { user, tokens } = await authService.loginWithGoogle(
        id,
        email,
        name,
        picture
      );

      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(
        `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
      );
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email || !validateEmail(email)) {
        sendError(res, 400, "Valid email is required");
        return;
      }

      const message = await authService.forgotPassword(email);

      sendSuccess(res, 200, message);
    } catch (error: any) {
      sendError(res, 400, error.message);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;

      // Validation
      const errors: Record<string, string[]> = {};

      if (!token) {
        errors.token = ["Reset token is required"];
      }

      if (!password) {
        errors.newPassword = ["New password is required"];
      } else {
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
          errors.newPassword = passwordErrors;
        }
      }

      if (password !== confirmPassword) {
        errors.confirmPassword = ["Passwords do not match"];
      }

      if (Object.keys(errors).length > 0) {
        sendError(res, 400, "Validation error", errors);
        return;
      }

      await authService.resetPassword(token, password);

      sendSuccess(res, 200, "Password reset successfully");
    } catch (error: any) {
      sendError(res, 400, error.message);
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        sendError(res, 400, "Verification token is required");
        return;
      }

      await authService.verifyEmail(token);

      sendSuccess(res, 200, "Email verified successfully");
    } catch (error: any) {
      sendError(res, 400, error.message);
    }
  }

  async resendVerificationEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email || !validateEmail(email)) {
        sendError(res, 400, "Valid email is required");
        return;
      }

      const message = await authService.resendVerificationEmail(email);

      sendSuccess(res, 200, message);
    } catch (error: any) {
      sendError(res, 400, error.message);
    }
  }

  async deleteUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email || !validateEmail(email)) {
        sendError(res, 400, "Valid email is required");
        return;
      }

      await authService.deleteUserByEmail(email);

      sendSuccess(res, 200, "User deleted successfully");
    } catch (error: any) {
      sendError(res, 400, error.message);
    }
  }
}

export const authController = new AuthController();
