import { Router } from "express";
import { followController } from "../controllers/follow.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Follow a user
router.post(
  "/:userId/follow",
  authenticate,
  followController.followUser.bind(followController)
);

// Unfollow a user
router.delete(
  "/:userId/follow",
  authenticate,
  followController.unfollowUser.bind(followController)
);

// Get followers of a user
router.get(
  "/:userId/followers",
  followController.getFollowers.bind(followController)
);

// Get following list of a user
router.get(
  "/:userId/following",
  followController.getFollowing.bind(followController)
);

export default router;
