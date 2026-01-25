import Post from "../models/Post";
import { User } from "../models/User";
import { Types } from "mongoose";

export class PostService {
  /**
   * Get user's posts with filters
   * @param userId - User ID to get posts from
   * @param filter - "all", "video", or "saved"
   * @param currentUserId - Current logged-in user ID (for saved posts)
   * @param limit - Number of posts to return
   * @param offset - Pagination offset
   */
  async getUserPosts(
    userId: string,
    filter: "all" | "video" | "saved" = "all",
    currentUserId?: string,
    limit: number = 20,
    offset: number = 0,
  ) {
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    let query: any = { userId: new Types.ObjectId(userId) };

    // Apply filters
    if (filter === "video") {
      query.mediaType = "video";
    } else if (filter === "saved") {
      // For saved posts, we need to check if current user has saved these posts
      if (!currentUserId) {
        throw new Error("Authentication required for saved posts");
      }
      query.savedBy = new Types.ObjectId(currentUserId);
    }

    // Get total count
    const total = await Post.countDocuments(query);

    // Get paginated posts
    const posts = await Post.find(query)
      .select(
        "image video mediaType likes comments caption createdAt likedBy savedBy",
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    // Add like and save status for current user
    const currentUserIdStr = currentUserId?.toString() || currentUserId;

    const enrichedPosts = posts.map((post: any) => {
      // Convert all IDs in likedBy and savedBy to strings for comparison
      const likedByStrs =
        post.likedBy?.map((id: any) => (id.toString ? id.toString() : id)) ||
        [];
      const savedByStrs =
        post.savedBy?.map((id: any) => (id.toString ? id.toString() : id)) ||
        [];

      return {
        ...post,
        isLiked: currentUserIdStr
          ? likedByStrs.includes(currentUserIdStr)
          : false,
        isSaved: currentUserIdStr
          ? savedByStrs.includes(currentUserIdStr)
          : false,
      };
    });

    return {
      posts: enrichedPosts,
      total,
      limit,
      offset,
      hasMore: offset + posts.length < total,
    };
  }

  /**
   * Get post statistics for a user
   */
  async getUserPostStats(userId: string) {
    const userIdObj = new Types.ObjectId(userId);

    const stats = await Post.aggregate([
      {
        $match: { userId: userIdObj },
      },
      {
        $facet: {
          totalPosts: [{ $count: "count" }],
          videoPosts: [{ $match: { mediaType: "video" } }, { $count: "count" }],
          totalLikes: [{ $group: { _id: null, total: { $sum: "$likes" } } }],
          totalComments: [
            { $group: { _id: null, total: { $sum: "$comments" } } },
          ],
        },
      },
    ]);

    return {
      totalPosts: stats[0]?.totalPosts[0]?.count || 0,
      videoPosts: stats[0]?.videoPosts[0]?.count || 0,
      totalLikes: stats[0]?.totalLikes[0]?.total || 0,
      totalComments: stats[0]?.totalComments[0]?.total || 0,
    };
  }

  /**
   * Get post by ID
   */
  async getPostById(postId: string) {
    return await Post.findById(postId);
  }

  /**
   * Get newsfeed posts (all posts or from followed users)
   */
  async getNewsfeed(limit: number = 20, offset: number = 0, userId?: string) {
    // For now, get all posts (can be enhanced later to filter by followed users)
    const posts = await Post.find({})
      .populate("userId", "username avatar fullname")
      .select(
        "userId image video mediaType likes comments caption createdAt likedBy savedBy",
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const total = await Post.countDocuments({});

    // Add like and save status for current user
    const userIdStr = userId?.toString() || userId;

    const enrichedPosts = posts.map((post: any) => {
      // Convert all IDs in likedBy and savedBy to strings for comparison
      const likedByStrs =
        post.likedBy?.map((id: any) => (id.toString ? id.toString() : id)) ||
        [];
      const savedByStrs =
        post.savedBy?.map((id: any) => (id.toString ? id.toString() : id)) ||
        [];

      return {
        ...post,
        isLiked: userIdStr ? likedByStrs.includes(userIdStr) : false,
        isSaved: userIdStr ? savedByStrs.includes(userIdStr) : false,
      };
    });

    return {
      posts: enrichedPosts,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Get explore posts (trending posts with high engagement)
   */
  async getExplorePosts(
    limit: number = 20,
    offset: number = 0,
    userId?: string,
  ) {
    // Get posts from last 30 days sorted by engagement score
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const posts = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $addFields: {
          engagementScore: {
            $add: ["$likes", { $multiply: ["$comments", 2] }],
          },
        },
      },
      {
        $sort: { engagementScore: -1, createdAt: -1 },
      },
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          _id: 1,
          image: 1,
          video: 1,
          mediaType: 1,
          likes: 1,
          comments: 1,
          caption: 1,
          createdAt: 1,
          engagementScore: 1,
          likedBy: 1,
          savedBy: 1,
          "userInfo._id": 1,
          "userInfo.username": 1,
          "userInfo.avatar": 1,
          "userInfo.fullname": 1,
        },
      },
    ]);

    const total = await Post.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Add like and save status for current user
    const userIdStr = userId?.toString() || userId;

    const enrichedPosts = posts.map((post) => {
      // Convert all IDs in likedBy and savedBy to strings for comparison
      const likedByStrs =
        post.likedBy?.map((id: any) => (id.toString ? id.toString() : id)) ||
        [];
      const savedByStrs =
        post.savedBy?.map((id: any) => (id.toString ? id.toString() : id)) ||
        [];

      return {
        _id: post._id,
        image: post.image,
        video: post.video,
        mediaType: post.mediaType,
        likes: post.likes,
        comments: post.comments,
        caption: post.caption,
        createdAt: post.createdAt,
        userId: post.userInfo,
        isLiked: userIdStr ? likedByStrs.includes(userIdStr) : false,
        isSaved: userIdStr ? savedByStrs.includes(userIdStr) : false,
      };
    });

    return {
      posts: enrichedPosts,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Create a new post
   */
  async createPost(
    userId: string,
    data: {
      caption?: string;
      image?: string;
      video?: string;
      mediaType: "image" | "video";
    },
  ) {
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const post = new Post({
      userId: new Types.ObjectId(userId),
      ...data,
    });

    return await post.save();
  }

  /**
   * Update post
   */
  async updatePost(postId: string, userId: string, data: any) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.userId.toString() !== userId) {
      throw new Error("Unauthorized");
    }
    const dataUpdate: any = {};
    if (data.caption) {
      dataUpdate.caption = data.caption;
    }
    if (data.image) {
      dataUpdate.image = data.image;
    }
    if (data.video) {
      dataUpdate.video = data.video;
    }
    if (data.mediaType) {
      dataUpdate.mediaType = data.mediaType;
    }
    Object.assign(post, dataUpdate);
    return await post.save();
  }

  /**
   * Delete post
   */
  async deletePost(postId: string, userId: string) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.userId.toString() !== userId) {
      throw new Error("Unauthorized");
    }

    await Post.deleteOne({ _id: postId });
    return { message: "Post deleted successfully" };
  }

  /**
   * Toggle like a post (like if not liked, unlike if already liked)
   */
  async likePost(postId: string, userId: string) {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    const userIdObj = new Types.ObjectId(userId);
    const hasLiked = post.likedBy.some((id) => id.equals(userIdObj));

    if (hasLiked) {
      // Unlike
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { likedBy: userIdObj },
          $inc: { likes: -1 },
        },
        { new: true },
      );
      return { ...updatedPost?.toObject(), isLiked: false };
    } else {
      // Like
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
          $addToSet: { likedBy: userIdObj },
          $inc: { likes: 1 },
        },
        { new: true },
      );
      return { ...updatedPost?.toObject(), isLiked: true };
    }
  }

  /**
   * Unlike a post (check if user has liked before unliking)
   */
  async unlikePost(postId: string, userId: string) {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    const userIdObj = new Types.ObjectId(userId);
    const hasLiked = post.likedBy.some((id) => id.equals(userIdObj));

    if (!hasLiked) {
      throw new Error("You have not liked this post");
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likedBy: userIdObj },
        $inc: { likes: -1 },
      },
      { new: true },
    );

    return updatedPost;
  }

  /**
   * Add comment to post
   */
  async addComment(postId: string) {
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { comments: 1 } },
      { new: true },
    );

    if (!post) {
      throw new Error("Post not found");
    }

    return post;
  }

  /**
   * Remove comment from post
   */
  async removeComment(postId: string) {
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { comments: -1 } },
      { new: true },
    );

    if (!post) {
      throw new Error("Post not found");
    }

    return post;
  }

  /**
   * Save post (add current user to savedBy) - toggle version
   */
  async savePost(postId: string, userId: string) {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    const userIdObj = new Types.ObjectId(userId);
    const hasSaved = post.savedBy.some((id) => id.equals(userIdObj));

    if (hasSaved) {
      throw new Error("Post already saved");
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { savedBy: userIdObj } },
      { new: true },
    );

    return updatedPost;
  }

  /**
   * Unsave post (remove current user from savedBy)
   */
  async unsavePost(postId: string, userId: string) {
    const post = await Post.findByIdAndUpdate(
      postId,
      { $pull: { savedBy: new Types.ObjectId(userId) } },
      { new: true },
    );

    if (!post) {
      throw new Error("Post not found");
    }

    return post;
  }
}

export default new PostService();
