import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const authRouter = Router();

// Public routes
authRouter.post("/register", (req, res) => authController.register(req, res));
authRouter.post("/login", (req, res) => authController.login(req, res));
authRouter.post("/refresh-token", (req, res) =>
  authController.refreshToken(req, res)
);

authRouter.post("/verify-email/:token", (req, res) =>
  authController.verifyEmail(req, res)
);

authRouter.post("/resend-verification-email", (req, res) =>
  authController.resendVerificationEmail(req, res)
);

authRouter.post("/forgot-password", (req, res) =>
  authController.forgotPassword(req, res)
);

authRouter.post("/reset-password/:token", (req, res) =>
  authController.resetPassword(req, res)
);

// Development utility endpoint - Delete user by email (no authentication)
authRouter.post("/delete-user-by-email", (req, res) =>
  authController.deleteUserByEmail(req, res)
);

// Protected routes
authRouter.post("/logout", authenticate, (req, res) =>
  authController.logout(req, res)
);

authRouter.post("/change-password", authenticate, (req, res) =>
  authController.changePassword(req, res)
);

// Google OAuth routes
authRouter.get("/google", (req, res) => {
  // Passport handles this
});

authRouter.get("/google/callback", (req, res) =>
  authController.googleCallback(req, res)
);

export default authRouter;
