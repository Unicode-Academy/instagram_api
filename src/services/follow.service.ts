import Follow from "../models/Follow";
import { User } from "../models/User";
import mongoose from "mongoose";

export class FollowService {
  // Follow a user
  async followUser(followerId: string, followingId: string) {
    // Check if already following
    const existingFollow = await Follow.findOne({
      followerId: new mongoose.Types.ObjectId(followerId),
      followingId: new mongoose.Types.ObjectId(followingId),
    });

    if (existingFollow) {
      throw new Error("Already following this user");
    }

    // Create follow relationship
    const follow = await Follow.create({
      followerId: new mongoose.Types.ObjectId(followerId),
      followingId: new mongoose.Types.ObjectId(followingId),
    });

    return follow;
  }

  // Unfollow a user
  async unfollowUser(followerId: string, followingId: string) {
    const result = await Follow.findOneAndDelete({
      followerId: new mongoose.Types.ObjectId(followerId),
      followingId: new mongoose.Types.ObjectId(followingId),
    });

    if (!result) {
      throw new Error("Not following this user");
    }

    return result;
  }

  // Get followers of a user
  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const followers = await Follow.find({
      followingId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "followerId",
        select: "username fullName profilePicture bio",
      })
      .lean();

    const totalFollowers = await Follow.countDocuments({
      followingId: new mongoose.Types.ObjectId(userId),
    });

    return {
      followers: followers.map((f) => f.followerId),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFollowers / limit),
        totalFollowers,
        hasMore: skip + followers.length < totalFollowers,
      },
    };
  }

  // Get following list of a user
  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const following = await Follow.find({
      followerId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "followingId",
        select: "username fullName profilePicture bio",
      })
      .lean();

    const totalFollowing = await Follow.countDocuments({
      followerId: new mongoose.Types.ObjectId(userId),
    });

    return {
      following: following.map((f) => f.followingId),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFollowing / limit),
        totalFollowing,
        hasMore: skip + following.length < totalFollowing,
      },
    };
  }

  // Get followers and following count
  async getFollowCounts(userId: string) {
    const followersCount = await Follow.countDocuments({
      followingId: new mongoose.Types.ObjectId(userId),
    });

    const followingCount = await Follow.countDocuments({
      followerId: new mongoose.Types.ObjectId(userId),
    });

    return {
      followersCount,
      followingCount,
    };
  }

  // Check if user A is following user B
  async isFollowing(followerId: string, followingId: string) {
    const follow = await Follow.findOne({
      followerId: new mongoose.Types.ObjectId(followerId),
      followingId: new mongoose.Types.ObjectId(followingId),
    });

    return !!follow;
  }
}

export const followService = new FollowService();
