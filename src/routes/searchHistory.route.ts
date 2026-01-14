import { Router } from "express";
import { searchHistoryController } from "../controllers/searchHistory.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Add search history (when user clicks on search result)
router.post(
  "/",
  searchHistoryController.addSearchHistory.bind(searchHistoryController)
);

// Get user's search history
router.get(
  "/",
  searchHistoryController.getSearchHistory.bind(searchHistoryController)
);

// Delete a specific search history item
router.delete(
  "/:historyId",
  searchHistoryController.deleteSearchHistory.bind(searchHistoryController)
);

// Clear all search history
router.delete(
  "/",
  searchHistoryController.clearAllSearchHistory.bind(searchHistoryController)
);

export default router;
