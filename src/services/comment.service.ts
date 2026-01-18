import Comment, { IComment } from "../models/Comment";
import { Types } from "mongoose";

class CommentService {
  /**
   * Get root comments for a post (with replies nested inside)
   */
  async getPostComments(
    postId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    const postIdObj = new Types.ObjectId(postId);

    // Get root comments (parentCommentId is null)
    const rootComments = await Comment.find({
      postId: postIdObj,
      parentCommentId: null,
    })
      .populate("userId", "username avatar email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    // Get replies for each root comment
    const commentsWithReplies = await Promise.all(
      rootComments.map(async (comment) => {
        const replies = await Comment.find({
          postId: postIdObj,
          parentCommentId: comment._id,
        })
          .populate("userId", "username avatar email")
          .sort({ createdAt: 1 }); // Oldest first for replies

        return {
          ...comment.toObject(),
          replies,
        };
      })
    );

    const total = await Comment.countDocuments({
      postId: postIdObj,
      parentCommentId: null,
    });

    return {
      comments: commentsWithReplies,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Get replies for a specific comment
   */
  async getCommentReplies(
    commentId: string,
    limit: number = 10,
    offset: number = 0
  ) {
    const commentIdObj = new Types.ObjectId(commentId);

    const replies = await Comment.find({ parentCommentId: commentIdObj })
      .populate("userId", "username avatar email")
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(offset);

    const total = await Comment.countDocuments({
      parentCommentId: commentIdObj,
    });

    return {
      replies,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Create a comment or reply
   */
  async createComment(
    postId: string,
    userId: string,
    content: string,
    parentCommentId?: string
  ) {
    const comment = new Comment({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
      content,
      parentCommentId: parentCommentId
        ? new Types.ObjectId(parentCommentId)
        : null,
    });

    await comment.save();

    // Populate user info
    await comment.populate("userId", "username avatar email");

    return comment;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string) {
    const comment = await Comment.findByIdAndDelete(commentId);
    return comment;
  }

  /**
   * Like a comment (toggle)
   */
  async likeComment(commentId: string, userId: string) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new Error("Comment not found");
    }

    const { Types } = require("mongoose");
    const userIdObj = new Types.ObjectId(userId);
    const hasLiked = comment.likedBy.some((id) => id.equals(userIdObj));

    if (hasLiked) {
      // Unlike
      const updated = await Comment.findByIdAndUpdate(
        commentId,
        {
          $pull: { likedBy: userIdObj },
          $inc: { likes: -1 },
        },
        { new: true }
      ).populate("userId", "username avatar email");
      return { ...updated?.toObject(), isLiked: false };
    } else {
      // Like
      const updated = await Comment.findByIdAndUpdate(
        commentId,
        {
          $addToSet: { likedBy: userIdObj },
          $inc: { likes: 1 },
        },
        { new: true }
      ).populate("userId", "username avatar email");
      return { ...updated?.toObject(), isLiked: true };
    }
  }

  /**
   * Unlike a comment (with validation)
   */
  async unlikeComment(commentId: string, userId: string) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new Error("Comment not found");
    }

    const { Types } = require("mongoose");
    const userIdObj = new Types.ObjectId(userId);
    const hasLiked = comment.likedBy.some((id) => id.equals(userIdObj));

    if (!hasLiked) {
      throw new Error("You have not liked this comment");
    }

    const updated = await Comment.findByIdAndUpdate(
      commentId,
      {
        $pull: { likedBy: userIdObj },
        $inc: { likes: -1 },
      },
      { new: true }
    ).populate("userId", "username avatar email");

    return updated;
  }

  /**
   * Update comment content
   */
  async updateComment(commentId: string, content: string) {
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    ).populate("userId", "username avatar email");

    return comment;
  }
}

export default new CommentService();
