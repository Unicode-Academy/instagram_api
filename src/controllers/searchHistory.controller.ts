import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { searchHistoryService } from "../services/searchHistory.service";

export class SearchHistoryController {
  // Add search history when user clicks on search result
  async addSearchHistory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const { searchedUserId, searchQuery } = req.body;

      if (!searchedUserId || !searchQuery) {
        sendError(res, 400, "searchedUserId and searchQuery are required");
        return;
      }

      const searchHistory = await searchHistoryService.addSearchHistory(
        req.user.userId,
        searchedUserId,
        searchQuery
      );

      sendSuccess(res, 201, "Search history saved", searchHistory);
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }

  // Get user's search history
  async getSearchHistory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const { limit } = req.query;
      const limitNumber = limit ? parseInt(limit as string) : 20;

      const searchHistory = await searchHistoryService.getSearchHistory(
        req.user.userId,
        limitNumber
      );

      sendSuccess(res, 200, "Search history retrieved", searchHistory);
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }

  // Delete a specific search history item
  async deleteSearchHistory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const { historyId } = req.params;

      const result = await searchHistoryService.deleteSearchHistory(
        req.user.userId,
        historyId
      );

      if (!result) {
        sendError(res, 404, "Search history not found");
        return;
      }

      sendSuccess(res, 200, "Search history deleted", null);
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }

  // Clear all search history for the user
  async clearAllSearchHistory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const result = await searchHistoryService.clearAllSearchHistory(
        req.user.userId
      );

      sendSuccess(
        res,
        200,
        `${result.deletedCount} search history items deleted`,
        null
      );
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }
}

export const searchHistoryController = new SearchHistoryController();
