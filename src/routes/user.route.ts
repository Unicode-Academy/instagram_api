import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";

const userRouter = Router();

// Get current user profile
userRouter.get("/profile", authenticate, (req, res) =>
  userController.getProfile(req, res)
);

// Update current user profile (with optional image upload)
userRouter.patch(
  "/profile",
  authenticate,
  upload.single("profilePicture"),
  (req, res) => userController.updateProfile(req, res)
);

// Delete profile picture
userRouter.delete("/profile/picture", authenticate, (req, res) =>
  userController.deleteProfilePicture(req, res)
);

// Get suggested users
userRouter.get("/suggested", authenticate, (req, res) =>
  userController.getSuggestedUsers(req, res)
);

// Search users
userRouter.get("/search", (req, res) => userController.searchUsers(req, res));

// Get user by ID
userRouter.get("/:userId", (req, res) => userController.getUserById(req, res));

export default userRouter;
