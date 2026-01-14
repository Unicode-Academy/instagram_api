import mongoose, { Schema, Document } from "mongoose";

export interface ISearchHistory extends Document {
  userId: mongoose.Types.ObjectId;
  searchedUserId: mongoose.Types.ObjectId;
  searchQuery: string;
  createdAt: Date;
}

const SearchHistorySchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    searchedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    searchQuery: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
SearchHistorySchema.index({ userId: 1, createdAt: -1 });
SearchHistorySchema.index({ userId: 1, searchedUserId: 1 });

export default mongoose.model<ISearchHistory>(
  "SearchHistory",
  SearchHistorySchema
);
