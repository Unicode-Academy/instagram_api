import express from "express";
import postController from "../controllers/post.controller";
import { authenticate } from "../middleware/auth";
import { postUpload } from "../middleware/postUpload";
import commentRoutes from "./comment.route";

const router = express.Router();

/**
 * Public routes - No authentication required
 */

// Get newsfeed posts
// GET /api/posts/feed?limit=20&offset=0
router.get("/feed", postController.getNewsfeed);

// Get explore posts (trending with high engagement)
// GET /api/posts/explore?limit=20&offset=0
router.get("/explore", postController.getExplorePosts);

// Get user's posts with filters (all, video, saved)
// GET /api/posts/user/:userId?filter=all&limit=20&offset=0
router.get("/user/:userId", postController.getUserPosts);

// Get user's post statistics
// GET /api/posts/user/:userId/stats
router.get("/user/:userId/stats", postController.getUserPostStats);

// Get post details (with comments)
// GET /api/posts/:postId
router.get("/:postId", postController.getPostDetails);

/**
 * Protected routes - Authentication required
 */

// Create a new post
// POST /api/posts
// Content-Type: multipart/form-data
// Body: file (image or video), caption (optional)
router.post(
  "/",
  authenticate,
  postUpload.single("file"),
  postController.createPost
);

// Update a post
// PATCH /api/posts/:postId
router.patch("/:postId", authenticate, postController.updatePost);

// Delete a post
// DELETE /api/posts/:postId
router.delete("/:postId", authenticate, postController.deletePost);

// Like a post
// POST /api/posts/:postId/like
router.post("/:postId/like", authenticate, postController.likePost);

// Unlike a post
// DELETE /api/posts/:postId/like
router.delete("/:postId/like", authenticate, postController.unlikePost);

// Save a post
// POST /api/posts/:postId/save
router.post("/:postId/save", authenticate, postController.savePost);

// Unsave a post
// DELETE /api/posts/:postId/save
router.delete("/:postId/save", authenticate, postController.unsavePost);

// Mount comment routes
router.use("/:postId/comments", commentRoutes);

export default router;
