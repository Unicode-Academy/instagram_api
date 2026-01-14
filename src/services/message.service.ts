import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { User } from "../models/User";
import mongoose from "mongoose";

export class MessageService {
  // Get or create conversation between two users
  async getOrCreateConversation(userId1: string, userId2: string) {
    // Sort user IDs to ensure consistent query
    const participants = [userId1, userId2].sort();

    let conversation = await Conversation.findOne({
      participants: {
        $all: participants.map((id) => new mongoose.Types.ObjectId(id)),
      },
    })
      .populate({
        path: "participants",
        select: "username fullName profilePicture",
      })
      .populate({
        path: "lastMessage",
        select: "messageType content imageUrl createdAt senderId",
      })
      .lean();

    if (!conversation) {
      const newConversation = await Conversation.create({
        participants: participants.map((id) => new mongoose.Types.ObjectId(id)),
        lastMessageAt: new Date(),
      });

      conversation = await Conversation.findById(newConversation._id)
        .populate({
          path: "participants",
          select: "username fullName profilePicture",
        })
        .lean();
    }

    return conversation;
  }

  // Get all conversations for a user
  async getUserConversations(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      participants: new mongoose.Types.ObjectId(userId),
    })
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "participants",
        select: "username fullName profilePicture",
      })
      .populate({
        path: "lastMessage",
        select: "messageType content imageUrl createdAt senderId isRead",
      })
      .lean();

    const totalConversations = await Conversation.countDocuments({
      participants: new mongoose.Types.ObjectId(userId),
    });

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          recipientId: new mongoose.Types.ObjectId(userId),
          isRead: false,
        });

        return {
          ...conv,
          unreadCount,
        };
      })
    );

    return {
      conversations: conversationsWithUnread,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalConversations / limit),
        totalConversations,
        hasMore: skip + conversations.length < totalConversations,
      },
    };
  }

  // Get messages in a conversation
  async getConversationMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: new mongoose.Types.ObjectId(conversationId),
      participants: new mongoose.Types.ObjectId(userId),
    });

    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    const messages = await Message.find({
      conversationId: new mongoose.Types.ObjectId(conversationId),
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "senderId",
        select: "username fullName profilePicture",
      })
      .lean();

    const totalMessages = await Message.countDocuments({
      conversationId: new mongoose.Types.ObjectId(conversationId),
    });

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: new mongoose.Types.ObjectId(conversationId),
        recipientId: new mongoose.Types.ObjectId(userId),
        isRead: false,
      },
      { isRead: true }
    );

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasMore: skip + messages.length < totalMessages,
      },
    };
  }

  // Send a message
  async sendMessage(
    conversationId: string,
    senderId: string,
    recipientId: string,
    messageType: "text" | "image",
    content?: string,
    imageUrl?: string
  ) {
    // Verify conversation exists and sender is participant
    const conversation = await Conversation.findOne({
      _id: new mongoose.Types.ObjectId(conversationId),
      participants: new mongoose.Types.ObjectId(senderId),
    });

    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    // Create message
    const message = await Message.create({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      senderId: new mongoose.Types.ObjectId(senderId),
      recipientId: new mongoose.Types.ObjectId(recipientId),
      messageType,
      content: messageType === "text" ? content : undefined,
      imageUrl: messageType === "image" ? imageUrl : undefined,
      isRead: false,
    });

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate({
        path: "senderId",
        select: "username fullName profilePicture",
      })
      .lean();

    return populatedMessage;
  }

  // Mark message as read
  async markAsRead(messageId: string, userId: string) {
    const message = await Message.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(messageId),
        recipientId: new mongoose.Types.ObjectId(userId),
      },
      { isRead: true },
      { new: true }
    );

    if (!message) {
      throw new Error("Message not found or access denied");
    }

    return message;
  }

  // Get unread messages count
  async getUnreadCount(userId: string) {
    const unreadCount = await Message.countDocuments({
      recipientId: new mongoose.Types.ObjectId(userId),
      isRead: false,
    });

    return unreadCount;
  }
}

export const messageService = new MessageService();
