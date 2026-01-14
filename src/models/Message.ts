import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  messageType: "text" | "image";
  content?: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image"],
      required: true,
    },
    content: {
      type: String,
      required: function (this: IMessage) {
        return this.messageType === "text";
      },
    },
    imageUrl: {
      type: String,
      required: function (this: IMessage) {
        return this.messageType === "image";
      },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for getting messages in a conversation sorted by time
MessageSchema.index({ conversationId: 1, createdAt: -1 });

// Index for unread messages count
MessageSchema.index({ recipientId: 1, isRead: 1 });

export default mongoose.model<IMessage>("Message", MessageSchema);
