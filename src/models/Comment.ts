import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  parentCommentId?: mongoose.Types.ObjectId; // For nested replies
  content: string;
  likes: number;
  likedBy: mongoose.Types.ObjectId[]; // Array of user IDs who liked this comment
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // null for root comments, set for replies
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
commentSchema.index({ postId: 1, parentCommentId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ postId: 1, createdAt: -1 });

export default mongoose.model<IComment>("Comment", commentSchema);
