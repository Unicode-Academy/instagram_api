import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only 2 participants (one-on-one chat)
ConversationSchema.path("participants").validate(function (value: any[]) {
  return value.length === 2;
}, "Conversation must have exactly 2 participants");

// Index for finding conversations by participant
ConversationSchema.index({ participants: 1 });

// Index for sorting by last message time
ConversationSchema.index({ lastMessageAt: -1 });

// Compound index to find conversation between two users
ConversationSchema.index({ participants: 1 }, { unique: true });

export default mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);
