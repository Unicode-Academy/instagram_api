import express from "express";
import commentController from "../controllers/comment.controller";
import { authenticate } from "../middleware/auth";

const router = express.Router({ mergeParams: true });

/**
 * Public routes - No authentication required
 */

// Get comments for a post (root comments with nested replies)
// GET /api/posts/:postId/comments?limit=20&offset=0
router.get("/", commentController.getPostComments);

/**
 * Protected routes - Authentication required
 */

// Create a comment (or reply if parentCommentId provided in body)
// POST /api/posts/:postId/comments
// Body: { content, parentCommentId (optional) }
router.post("/", authenticate, commentController.createComment);

// Get replies for a specific comment
// GET /api/posts/:postId/comments/:commentId/replies?limit=10&offset=0
router.get("/:commentId/replies", commentController.getCommentReplies);

// Create a reply to a comment
// POST /api/posts/:postId/comments/:commentId/replies
// Body: { content }
router.post("/:commentId/replies", authenticate, commentController.createReply);

// Update a comment
// PATCH /api/posts/:postId/comments/:commentId
router.patch("/:commentId", authenticate, commentController.updateComment);

// Delete a comment
// DELETE /api/posts/:postId/comments/:commentId
router.delete("/:commentId", authenticate, commentController.deleteComment);

// Like a comment
// POST /api/posts/:postId/comments/:commentId/like
router.post("/:commentId/like", authenticate, commentController.likeComment);

// Unlike a comment
// DELETE /api/posts/:postId/comments/:commentId/like
router.delete(
  "/:commentId/like",
  authenticate,
  commentController.unlikeComment
);

export default router;
