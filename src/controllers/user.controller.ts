import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { User } from "../models/User";
import { deleteFile, getFileUrl } from "../middleware/upload";
import Post from "../models/Post";
import { followService } from "../services/follow.service";
import { userService } from "../services/user.service";

export class UserController {
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const user = await User.findById(req.user.userId).select("-password");

      if (!user) {
        sendError(res, 404, "User not found");
        return;
      }

      sendSuccess(res, 200, "Profile retrieved successfully", user);
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const { fullName, bio, gender, website, deleteProfilePicture } = req.body;
      const updateData: any = {
        fullName,
        bio,
        gender,
        website,
      };

      // Get current user to check for old profile picture
      const currentUser = await User.findById(req.user.userId);

      // Delete old profile picture if uploading new one
      if (req.file && currentUser?.profilePicture) {
        const oldFilename = currentUser.profilePicture.split("/").pop();
        if (oldFilename) {
          deleteFile(oldFilename);
        }
      }

      // Handle file upload
      if (req.file) {
        updateData.profilePicture = getFileUrl(req.file.filename);
      }

      // Handle delete profile picture request
      if (deleteProfilePicture === true || deleteProfilePicture === "true") {
        if (currentUser?.profilePicture) {
          const filename = currentUser.profilePicture.split("/").pop();
          if (filename) {
            deleteFile(filename);
          }
        }
        updateData.profilePicture = null;
      }

      const user = await User.findByIdAndUpdate(req.user.userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!user) {
        sendError(res, 404, "User not found");
        return;
      }

      sendSuccess(res, 200, "Profile updated successfully", user);
    } catch (error: any) {
      // Delete uploaded file if error occurs
      if (req.file) {
        deleteFile(req.file.filename);
      }
      sendError(res, 500, error.message);
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId).select("-password");

      if (!user) {
        sendError(res, 404, "User not found");
        return;
      }

      // Get followers and following counts
      const { followersCount, followingCount } =
        await followService.getFollowCounts(userId);

      // Check if current user is following this user
      let isFollowing = false;
      if (req.user && req.user.userId !== userId) {
        isFollowing = await followService.isFollowing(req.user.userId, userId);
      }

      const userWithFollowInfo = {
        ...user.toObject(),
        followersCount,
        followingCount,
        isFollowing,
      };

      sendSuccess(res, 200, "User retrieved successfully", userWithFollowInfo);
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }

  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== "string") {
        sendError(res, 400, "Search query is required");
        return;
      }

      // Search by username, email, fullName
      const directUsers = await User.find({
        $or: [
          { username: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { fullName: { $regex: q, $options: "i" } },
        ],
      })
        .select("-password")
        .lean();

      // Search users by posts caption
      const posts = await Post.find({
        caption: { $regex: q, $options: "i" },
      })
        .select("userId")
        .limit(100);

      // Get unique user IDs from posts
      const userIds = [...new Set(posts.map((post) => post.userId.toString()))];

      const captionUsers = await User.find({
        _id: { $in: userIds },
      })
        .select("-password")
        .lean();

      // Merge and remove duplicates
      const allUsers = [...directUsers, ...captionUsers];
      const uniqueUsers = Array.from(
        new Map(allUsers.map((user) => [user._id.toString(), user])).values()
      ).slice(0, 20);

      sendSuccess(res, 200, "Users found", uniqueUsers);
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }

  async deleteProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const user = await User.findById(req.user.userId);

      if (!user) {
        sendError(res, 404, "User not found");
        return;
      }

      // Delete file from filesystem
      if (user.profilePicture) {
        const filename = user.profilePicture.split("/").pop();
        if (filename) {
          deleteFile(filename);
        }
      }

      // Update user to remove profile picture
      const updatedUser = await User.findByIdAndUpdate(
        req.user.userId,
        { profilePicture: null },
        { new: true }
      ).select("-password");

      sendSuccess(
        res,
        200,
        "Profile picture deleted successfully",
        updatedUser
      );
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }

  async getSuggestedUsers(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const { limit } = req.query;
      const limitNumber = limit ? parseInt(limit as string) : 10;

      const suggestedUsers = await userService.getSuggestedUsers(
        req.user.userId,
        limitNumber
      );

      sendSuccess(res, 200, "Suggested users retrieved", suggestedUsers);
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }
}

export const userController = new UserController();
