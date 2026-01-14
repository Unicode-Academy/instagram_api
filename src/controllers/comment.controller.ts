import { Request, Response } from "express";
import commentService from "../services/comment.service";
import postService from "../services/post.service";
import { sendSuccess, sendError } from "../utils/response";

class CommentController {
  /**
   * Get comments for a post
   */
  async getPostComments(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      // Validate post exists
      const post = await postService.getPostById(postId);
      if (!post) {
        return sendError(res, 404, "Post not found");
      }

      const result = await commentService.getPostComments(
        postId,
        Number(limit),
        Number(offset)
      );

      return sendSuccess(res, 200, "Comments retrieved successfully", result);
    } catch (error: any) {
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Create a comment (or reply if parentCommentId in body)
   */
  async createComment(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { content, parentCommentId } = req.body;
      const userId = (req as any).user?.userId || (req as any).userId;

      // Validation
      if (
        !content ||
        typeof content !== "string" ||
        content.trim().length === 0
      ) {
        return sendError(res, 400, "Validation failed", {
          content: ["Content is required and must be a non-empty string"],
        });
      }

      if (content.length > 500) {
        return sendError(res, 400, "Validation failed", {
          content: ["Content must not exceed 500 characters"],
        });
      }

      // Validate post exists
      const post = await postService.getPostById(postId);
      if (!post) {
        return sendError(res, 404, "Post not found");
      }

      // If parentCommentId provided, validate parent comment exists
      if (parentCommentId) {
        const Comment = await import("../models/Comment");
        const parentComment = await Comment.default.findById(parentCommentId);
        if (!parentComment) {
          return sendError(res, 404, "Parent comment not found");
        }
      }

      // Create comment/reply
      const comment = await commentService.createComment(
        postId,
        userId,
        content,
        parentCommentId
      );

      // Increment post comment count (for both root comments and replies)
      post.comments = (post.comments || 0) + 1;
      await post.save();

      return sendSuccess(res, 201, "Comment created successfully", comment);
    } catch (error: any) {
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Get replies for a specific comment
   */
  async getCommentReplies(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const { limit = 10, offset = 0 } = req.query;

      const result = await commentService.getCommentReplies(
        commentId,
        Number(limit),
        Number(offset)
      );

      return sendSuccess(res, 200, "Replies retrieved successfully", result);
    } catch (error: any) {
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Create a reply to a comment
   */
  async createReply(req: Request, res: Response) {
    try {
      const { postId, commentId } = req.params;
      const { content } = req.body;
      const userId = (req as any).user?.userId || (req as any).userId;

      // Validation
      if (
        !content ||
        typeof content !== "string" ||
        content.trim().length === 0
      ) {
        return sendError(res, 400, "Validation failed", {
          content: ["Content is required and must be a non-empty string"],
        });
      }

      if (content.length > 500) {
        return sendError(res, 400, "Validation failed", {
          content: ["Content must not exceed 500 characters"],
        });
      }

      // Validate post exists
      const post = await postService.getPostById(postId);
      if (!post) {
        return sendError(res, 404, "Post not found");
      }

      // Validate parent comment exists
      const Comment = await import("../models/Comment");
      const parentComment = await Comment.default.findById(commentId);
      if (!parentComment) {
        return sendError(res, 404, "Comment not found");
      }

      // Create reply
      const reply = await commentService.createComment(
        postId,
        userId,
        content,
        commentId
      );

      // Increment post comment count
      post.comments = (post.comments || 0) + 1;
      await post.save();

      return sendSuccess(res, 201, "Reply created successfully", reply);
    } catch (error: any) {
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(req: Request, res: Response) {
    try {
      const { commentId, postId } = req.params;
      const userId = (req as any).user?.userId || (req as any).userId;

      // Get comment
      const comments = await commentService.getPostComments(postId, 1000, 0);
      const targetComment = comments.comments.find(
        (c) => c._id.toString() === commentId
      );

      if (!targetComment) {
        return sendError(res, 404, "Comment not found");
      }

      // Check if user is comment owner
      if (targetComment.userId._id.toString() !== userId) {
        return sendError(res, 403, "You can only delete your own comments");
      }

      // Delete comment
      await commentService.deleteComment(commentId);

      // Decrement post comment count
      const post = await postService.getPostById(postId);
      if (post) {
        post.comments = Math.max(0, (post.comments || 0) - 1);
        await post.save();
      }

      return sendSuccess(res, 200, "Comment deleted successfully");
    } catch (error: any) {
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Like a comment
   */
  async likeComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;

      const comment = await commentService.likeComment(commentId);

      if (!comment) {
        return sendError(res, 404, "Comment not found");
      }

      return sendSuccess(res, 200, "Comment liked successfully", {
        likes: comment.likes,
      });
    } catch (error: any) {
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Unlike a comment
   */
  async unlikeComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;

      const comment = await commentService.unlikeComment(commentId);

      if (!comment) {
        return sendError(res, 404, "Comment not found");
      }

      return sendSuccess(res, 200, "Comment unliked successfully", {
        likes: comment.likes,
      });
    } catch (error: any) {
      return sendError(res, 500, error.message);
    }
  }

  /**
   * Update comment
   */
  async updateComment(req: Request, res: Response) {
    try {
      const { commentId, postId } = req.params;
      const { content } = req.body;
      const userId = (req as any).user?.userId || (req as any).userId;

      // Validation
      if (
        !content ||
        typeof content !== "string" ||
        content.trim().length === 0
      ) {
        return sendError(res, 400, "Validation failed", {
          content: ["Content is required and must be a non-empty string"],
        });
      }

      if (content.length > 500) {
        return sendError(res, 400, "Validation failed", {
          content: ["Content must not exceed 500 characters"],
        });
      }

      // Get comment
      const comments = await commentService.getPostComments(postId, 1000, 0);
      const targetComment = comments.comments.find(
        (c) => c._id.toString() === commentId
      );

      if (!targetComment) {
        return sendError(res, 404, "Comment not found");
      }

      // Check if user is comment owner
      if (targetComment.userId._id.toString() !== userId) {
        return sendError(res, 403, "You can only edit your own comments");
      }

      // Update comment
      const updatedComment = await commentService.updateComment(
        commentId,
        content
      );

      return sendSuccess(
        res,
        200,
        "Comment updated successfully",
        updatedComment
      );
    } catch (error: any) {
      return sendError(res, 500, error.message);
    }
  }
}

export default new CommentController();
