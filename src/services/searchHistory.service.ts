import SearchHistory from "../models/SearchHistory";
import { User } from "../models/User";
import mongoose from "mongoose";

export class SearchHistoryService {
  // Add search history when user clicks on search result
  async addSearchHistory(
    userId: string,
    searchedUserId: string,
    searchQuery: string
  ) {
    // Check if this search already exists recently (within last 24 hours)
    const existingHistory = await SearchHistory.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      searchedUserId: new mongoose.Types.ObjectId(searchedUserId),
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    // If exists, update the timestamp by recreating it
    if (existingHistory) {
      await SearchHistory.findByIdAndDelete(existingHistory._id);
    }

    // Create new search history
    const searchHistory = await SearchHistory.create({
      userId: new mongoose.Types.ObjectId(userId),
      searchedUserId: new mongoose.Types.ObjectId(searchedUserId),
      searchQuery,
    });

    return searchHistory;
  }

  // Get user's search history
  async getSearchHistory(userId: string, limit: number = 20) {
    const searchHistory = await SearchHistory.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: "searchedUserId",
        select: "username fullName profilePicture",
      })
      .lean();

    return searchHistory;
  }

  // Delete a specific search history item
  async deleteSearchHistory(userId: string, historyId: string) {
    const result = await SearchHistory.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(historyId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    return result;
  }

  // Clear all search history for a user
  async clearAllSearchHistory(userId: string) {
    const result = await SearchHistory.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
    });

    return result;
  }
}

export const searchHistoryService = new SearchHistoryService();
