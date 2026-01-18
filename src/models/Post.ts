import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  caption?: string;
  image?: string;
  video?: string;
  mediaType: "image" | "video"; // "image" or "video"
  likes: number;
  comments: number;
  likedBy: mongoose.Types.ObjectId[]; // Array of user IDs who liked this post
  savedBy: mongoose.Types.ObjectId[]; // Array of user IDs who saved this post
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: null,
    },
    video: {
      type: String,
      default: null,
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
      default: "image",
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    savedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Index for faster queries
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ mediaType: 1 });

export default mongoose.model<IPost>("Post", postSchema);
