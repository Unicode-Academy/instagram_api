import { User } from "../models/User";
import Post from "../models/Post";
import Follow from "../models/Follow";
import mongoose from "mongoose";

export class UserService {
  // Get suggested users for current user
  async getSuggestedUsers(currentUserId: string, limit: number = 10) {
    // Get users that current user is already following
    const following = await Follow.find({
      followerId: new mongoose.Types.ObjectId(currentUserId),
    }).select("followingId");

    const followingIds = following.map((f) => f.followingId.toString());

    // Get suggested users (not following yet, exclude self)
    const suggestedUsers = await User.find({
      _id: {
        $nin: [
          new mongoose.Types.ObjectId(currentUserId),
          ...followingIds.map((id) => new mongoose.Types.ObjectId(id)),
        ],
      },
    })
      .select("username fullName profilePicture")
      .limit(limit)
      .lean();

    // Get additional info for each suggested user
    const usersWithInfo = await Promise.all(
      suggestedUsers.map(async (user) => {
        const userId = user._id.toString();

        // Get posts count
        const postsCount = await Post.countDocuments({
          userId: new mongoose.Types.ObjectId(userId),
        });

        // Get followers count
        const followersCount = await Follow.countDocuments({
          followingId: new mongoose.Types.ObjectId(userId),
        });

        // Get following count
        const followingCount = await Follow.countDocuments({
          followerId: new mongoose.Types.ObjectId(userId),
        });

        // Get 3 latest posts (images only)
        const latestPosts = await Post.find({
          userId: new mongoose.Types.ObjectId(userId),
        })
          .select("image video mediaType")
          .sort({ createdAt: -1 })
          .limit(3)
          .lean();

        // Extract image URLs (prefer image over video for thumbnails)
        const recentImages = latestPosts
          .map((post) => post.image || post.video)
          .filter((url) => url !== null && url !== undefined)
          .slice(0, 3);

        // Check if current user is following this suggested user
        // Since we already excluded following users in query, this will always be false
        // But we include it for consistency with other APIs
        const isFollowing = followingIds.includes(userId);

        return {
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          postsCount,
          followersCount,
          followingCount,
          recentImages,
          isFollowing,
        };
      })
    );

    // Sort by followers count (most popular first)
    usersWithInfo.sort((a, b) => b.followersCount - a.followersCount);

    return usersWithInfo;
  }
}

export const userService = new UserService();
