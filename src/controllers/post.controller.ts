import { Request, Response } from "express";
import postService from "../services/post.service";
import { sendSuccess, sendError } from "../utils/response";
import { validateObjectId } from "../utils/validation";
import {
  getPostFileUrl,
  deletePostFile,
  extractFilenameFromUrl,
} from "../middleware/postUpload";
import { verifyAccessToken } from "../utils/jwt";

export class PostController {
  /**
   * Get newsfeed posts
   * GET /api/posts/feed
   * Query: limit, offset
   */
  async getNewsfeed(req: Request, res: Response) {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const token = req.headers.authorization?.split(" ")[1];
      let userId;
      if (token) {
        const payload = verifyAccessToken(token);
        userId = payload?.userId;
      }

      const result = await postService.getNewsfeed(
        parseInt(limit as string) || 20,
        parseInt(offset as string) || 0,
        userId,
      );

      return sendSuccess(res, 200, "Newsfeed retrieved successfully", result);
    } catch (error: any) {
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Get explore posts (trending with high engagement)
   * GET /api/posts/explore
   * Query: limit, offset
   */
  async getExplorePosts(req: Request, res: Response) {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const token = req.headers.authorization?.split(" ")[1];
      let userId;
      if (token) {
        const payload = verifyAccessToken(token);
        userId = payload?.userId;
      }

      const result = await postService.getExplorePosts(
        parseInt(limit as string) || 20,
        parseInt(offset as string) || 0,
        userId,
      );

      return sendSuccess(
        res,
        200,
        "Explore posts retrieved successfully",
        result,
      );
    } catch (error: any) {
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Get user's posts with filters
   * GET /api/posts/user/:userId
   * Query: filter (all|video|saved), limit, offset
   */
  async getUserPosts(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { filter = "all", limit = 20, offset = 0 } = req.query;
      const token = req.headers.authorization?.split(" ")[1];
      let currentUserId;
      if (token) {
        const payload = verifyAccessToken(token);
        currentUserId = payload?.userId;
      }

      // Validate userId
      if (!validateObjectId(userId)) {
        return sendError(res, 400, "Invalid user ID format", {
          userId: ["Valid MongoDB ID required"],
        });
      }

      // Validate filter
      if (!["all", "video", "saved"].includes(filter as string)) {
        return sendError(res, 400, "Invalid filter", {
          filter: ["Filter must be 'all', 'video', or 'saved'"],
        });
      }

      const result = await postService.getUserPosts(
        userId,
        filter as "all" | "video" | "saved",
        currentUserId,
        parseInt(limit as string) || 20,
        parseInt(offset as string) || 0,
      );

      return sendSuccess(res, 200, "Posts retrieved successfully", result);
    } catch (error: any) {
      if (error.message === "User not found") {
        return sendError(res, 404, "User not found");
      }
      if (error.message === "Authentication required for saved posts") {
        return sendError(res, 401, "Unauthorized");
      }
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Get user's post statistics
   * GET /api/posts/user/:userId/stats
   */
  async getUserPostStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Validate userId
      if (!validateObjectId(userId)) {
        return sendError(res, 400, "Invalid user ID format", {
          userId: ["Valid MongoDB ID required"],
        });
      }

      const stats = await postService.getUserPostStats(userId);

      return sendSuccess(
        res,
        200,
        "Post statistics retrieved successfully",
        stats,
      );
    } catch (error: any) {
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Get post details with comments
   * GET /api/posts/:postId
   */
  async getPostDetails(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const token = req.headers.authorization?.split(" ")[1];
      let userId;
      if (token) {
        const payload = verifyAccessToken(token);
        userId = payload?.userId;
      }

      // Validate postId
      if (!validateObjectId(postId)) {
        return sendError(res, 400, "Invalid post ID format", {
          postId: ["Valid MongoDB ID required"],
        });
      }

      // Get post with user info
      const post = await postService.getPostById(postId);

      if (!post) {
        return sendError(res, 404, "Post not found");
      }

      // Populate user info
      await post.populate("userId", "username avatar fullname email");

      // Get comments with pagination
      const commentsModule = await import("../services/comment.service");
      const commentService = commentsModule.default;
      const comments = await commentService.getPostComments(postId, 100, 0);

      // Format response with detailed comments
      const formattedComments = comments.comments.map((comment: any) => ({
        _id: comment._id,
        content: comment.content,
        likes: comment.likes,
        createdAt: comment.createdAt,
        user: {
          _id: comment.userId._id,
          username: comment.userId.username,
          avatar: comment.userId.avatar,
        },
      }));

      // Add isLiked and isSaved status
      const userIdStr = userId?.toString() || userId;
      const likedByStrs =
        post.likedBy?.map((id: any) => (id.toString ? id.toString() : id)) ||
        [];
      const savedByStrs =
        post.savedBy?.map((id: any) => (id.toString ? id.toString() : id)) ||
        [];

      const postData = {
        ...post.toObject(),
        comments: formattedComments,
        totalComments: post.comments,
        isLiked: userIdStr ? likedByStrs.includes(userIdStr) : false,
        isSaved: userIdStr ? savedByStrs.includes(userIdStr) : false,
      };

      return sendSuccess(
        res,
        200,
        "Post details retrieved successfully",
        postData,
      );
    } catch (error: any) {
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Create a new post with file upload
   * POST /api/posts
   * Supports both image and video uploads
   */
  async createPost(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { caption } = req.body;
      const file = (req as any).file;

      // Validate file upload
      if (!file) {
        return sendError(res, 400, "Validation error", {
          media: ["Image or video file is required"],
        });
      }

      // Determine media type from MIME type
      let mediaType: "image" | "video";
      if (file.mimetype.startsWith("image/")) {
        mediaType = "image";
      } else if (file.mimetype.startsWith("video/")) {
        mediaType = "video";
      } else {
        // Clean up uploaded file if it somehow got through
        deletePostFile(file.filename);
        return sendError(res, 400, "Invalid file type", {
          media: ["Only image and video files are allowed"],
        });
      }

      // Generate file URL
      const fileUrl = getPostFileUrl(file.filename);

      const postData = {
        caption: caption || "",
        image: mediaType === "image" ? fileUrl : undefined,
        video: mediaType === "video" ? fileUrl : undefined,
        mediaType,
      };

      const post = await postService.createPost(userId, postData);

      return sendSuccess(res, 201, "Post created successfully", post);
    } catch (error: any) {
      // Clean up uploaded file on error
      if ((req as any).file) {
        deletePostFile((req as any).file.filename);
      }
      if (error.message === "User not found") {
        return sendError(res, 404, "User not found");
      }
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Update a post
   * PATCH /api/posts/:postId
   */
  async updatePost(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { postId } = req.params;
      const { caption, image, video, mediaType } = req.body;

      // Validate postId
      if (!validateObjectId(postId)) {
        return sendError(res, 400, "Invalid post ID format", {
          postId: ["Valid MongoDB ID required"],
        });
      }

      const post = await postService.updatePost(postId, userId, {
        caption,
        image,
        video,
        mediaType,
      });

      return sendSuccess(res, 200, "Post updated successfully", post);
    } catch (error: any) {
      if (error.message === "Post not found") {
        return sendError(res, 404, "Post not found");
      }
      if (error.message === "Unauthorized") {
        return sendError(res, 403, "Unauthorized");
      }
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Delete a post and associated file
   * DELETE /api/posts/:postId
   */
  async deletePost(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { postId } = req.params;

      // Validate postId
      if (!validateObjectId(postId)) {
        return sendError(res, 400, "Invalid post ID format", {
          postId: ["Valid MongoDB ID required"],
        });
      }

      // Get post first to extract file for deletion
      const post = await (postService as any).getPostById(postId);
      if (post && (post.image || post.video)) {
        const fileUrl = post.image || post.video;
        const filename = extractFilenameFromUrl(fileUrl);
        if (filename) {
          deletePostFile(filename);
        }
      }

      const result = await postService.deletePost(postId, userId);

      return sendSuccess(res, 200, "Post deleted successfully", result);
    } catch (error: any) {
      if (error.message === "Post not found") {
        return sendError(res, 404, "Post not found");
      }
      if (error.message === "Unauthorized") {
        return sendError(res, 403, "Unauthorized");
      }
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Like a post (toggle)
   * POST /api/posts/:postId/like
   */
  async likePost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const userId = (req as any).user?.userId || (req as any).userId;

      // Validate postId
      if (!validateObjectId(postId)) {
        return sendError(res, 400, "Invalid post ID format", {
          postId: ["Valid MongoDB ID required"],
        });
      }

      const post = await postService.likePost(postId, userId);

      return sendSuccess(res, 200, "Post liked/unliked successfully", post);
    } catch (error: any) {
      if (error.message === "Post not found") {
        return sendError(res, 404, "Post not found");
      }
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Unlike a post (deprecated - use POST /api/posts/:postId/like for toggle)
   * DELETE /api/posts/:postId/like
   */
  async unlikePost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const userId = (req as any).user?.userId || (req as any).userId;

      // Validate postId
      if (!validateObjectId(postId)) {
        return sendError(res, 400, "Invalid post ID format", {
          postId: ["Valid MongoDB ID required"],
        });
      }

      const post = await postService.unlikePost(postId, userId);

      return sendSuccess(res, 200, "Post unliked successfully", post);
    } catch (error: any) {
      if (error.message === "Post not found") {
        return sendError(res, 404, "Post not found");
      }
      if (error.message === "You have not liked this post") {
        return sendError(res, 400, "You have not liked this post");
      }
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Save a post
   * POST /api/posts/:postId/save
   */
  async savePost(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const { postId } = req.params;

      // Validate postId
      if (!validateObjectId(postId)) {
        return sendError(res, 400, "Invalid post ID format", {
          postId: ["Valid MongoDB ID required"],
        });
      }

      const post = await postService.savePost(postId, userId);

      return sendSuccess(res, 200, "Post saved successfully", post);
    } catch (error: any) {
      if (error.message === "Post not found") {
        return sendError(res, 404, "Post not found");
      }
      if (error.message === "Post already saved") {
        return sendError(res, 400, "Post already saved");
      }
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Unsave a post
   * DELETE /api/posts/:postId/save
   */
  async unsavePost(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { postId } = req.params;

      // Validate postId
      if (!validateObjectId(postId)) {
        return sendError(res, 400, "Invalid post ID format", {
          postId: ["Valid MongoDB ID required"],
        });
      }

      const post = await postService.unsavePost(postId, userId);

      return sendSuccess(res, 200, "Post unsaved successfully", post);
    } catch (error: any) {
      if (error.message === "Post not found") {
        return sendError(res, 404, "Post not found");
      }
      return sendError(res, 500, error.message);
    }
  }
}

export default new PostController();
