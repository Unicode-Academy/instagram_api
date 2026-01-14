import mongoose, { Schema, Document } from "mongoose";

export interface IFollow extends Document {
  followerId: mongoose.Types.ObjectId;
  followingId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FollowSchema: Schema = new Schema(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    followingId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries and prevent duplicates
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Index for getting followers of a user
FollowSchema.index({ followingId: 1, createdAt: -1 });

// Index for getting following list of a user
FollowSchema.index({ followerId: 1, createdAt: -1 });

export default mongoose.model<IFollow>("Follow", FollowSchema);
