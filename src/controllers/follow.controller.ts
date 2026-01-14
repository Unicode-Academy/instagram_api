import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { followService } from "../services/follow.service";

export class FollowController {
  // Follow a user
  async followUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const { userId } = req.params;

      // Can't follow yourself
      if (userId === req.user.userId) {
        sendError(res, 400, "Cannot follow yourself");
        return;
      }

      await followService.followUser(req.user.userId, userId);

      sendSuccess(res, 200, "User followed successfully", null);
    } catch (error: any) {
      if (error.message === "Already following this user") {
        sendError(res, 400, error.message);
      } else {
        sendError(res, 500, error.message);
      }
    }
  }

  // Unfollow a user
  async unfollowUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const { userId } = req.params;

      await followService.unfollowUser(req.user.userId, userId);

      sendSuccess(res, 200, "User unfollowed successfully", null);
    } catch (error: any) {
      if (error.message === "Not following this user") {
        sendError(res, 400, error.message);
      } else {
        sendError(res, 500, error.message);
      }
    }
  }

  // Get followers of a user
  async getFollowers(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;

      const pageNumber = page ? parseInt(page as string) : 1;
      const limitNumber = limit ? parseInt(limit as string) : 20;

      const result = await followService.getFollowers(
        userId,
        pageNumber,
        limitNumber
      );

      sendSuccess(res, 200, "Followers retrieved successfully", result);
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }

  // Get following list of a user
  async getFollowing(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;

      const pageNumber = page ? parseInt(page as string) : 1;
      const limitNumber = limit ? parseInt(limit as string) : 20;

      const result = await followService.getFollowing(
        userId,
        pageNumber,
        limitNumber
      );

      sendSuccess(res, 200, "Following retrieved successfully", result);
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }
}

export const followController = new FollowController();
