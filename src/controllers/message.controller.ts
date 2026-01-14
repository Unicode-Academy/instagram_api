import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { messageService } from "../services/message.service";
import { getFileUrl } from "../middleware/upload";

export class MessageController {
  // Get all conversations for current user
  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const { page, limit } = req.query;
      const pageNumber = page ? parseInt(page as string) : 1;
      const limitNumber = limit ? parseInt(limit as string) : 20;

      const result = await messageService.getUserConversations(
        req.user.userId,
        pageNumber,
        limitNumber
      );

      sendSuccess(res, 200, "Conversations retrieved successfully", result);
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }

  // Get or create conversation with a user
  async getOrCreateConversation(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const { userId } = req.body;

      if (!userId) {
        sendError(res, 400, "userId is required");
        return;
      }

      if (userId === req.user.userId) {
        sendError(res, 400, "Cannot create conversation with yourself");
        return;
      }

      const conversation = await messageService.getOrCreateConversation(
        req.user.userId,
        userId
      );

      sendSuccess(
        res,
        200,
        "Conversation retrieved successfully",
        conversation
      );
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }

  // Get messages in a conversation
  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const { conversationId } = req.params;
      const { page, limit } = req.query;
      const pageNumber = page ? parseInt(page as string) : 1;
      const limitNumber = limit ? parseInt(limit as string) : 50;

      const result = await messageService.getConversationMessages(
        conversationId,
        req.user.userId,
        pageNumber,
        limitNumber
      );

      sendSuccess(res, 200, "Messages retrieved successfully", result);
    } catch (error: any) {
      if (error.message === "Conversation not found or access denied") {
        sendError(res, 404, error.message);
      } else {
        sendError(res, 500, error.message);
      }
    }
  }

  // Send a message
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const { conversationId, recipientId, messageType, content } = req.body;

      if (!conversationId || !recipientId || !messageType) {
        sendError(
          res,
          400,
          "conversationId, recipientId, and messageType are required"
        );
        return;
      }

      if (messageType !== "text" && messageType !== "image") {
        sendError(res, 400, "messageType must be 'text' or 'image'");
        return;
      }

      let imageUrl: string | undefined;

      if (messageType === "text") {
        if (!content) {
          sendError(res, 400, "content is required for text messages");
          return;
        }
      } else if (messageType === "image") {
        if (!req.file) {
          sendError(res, 400, "image file is required for image messages");
          return;
        }
        imageUrl = getFileUrl(req.file.filename);
      }

      const message = await messageService.sendMessage(
        conversationId,
        req.user.userId,
        recipientId,
        messageType,
        content,
        imageUrl
      );

      // Emit socket event (will be handled by socket.io)
      const io = (req as any).app.get("io");
      if (io) {
        io.to(recipientId).emit("new_message", message);
      }

      sendSuccess(res, 201, "Message sent successfully", message);
    } catch (error: any) {
      if (error.message === "Conversation not found or access denied") {
        sendError(res, 404, error.message);
      } else {
        sendError(res, 500, error.message);
      }
    }
  }

  // Mark message as read
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const { messageId } = req.params;

      const message = await messageService.markAsRead(
        messageId,
        req.user.userId
      );

      sendSuccess(res, 200, "Message marked as read", message);
    } catch (error: any) {
      if (error.message === "Message not found or access denied") {
        sendError(res, 404, error.message);
      } else {
        sendError(res, 500, error.message);
      }
    }
  }

  // Get unread messages count
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const unreadCount = await messageService.getUnreadCount(req.user.userId);

      sendSuccess(res, 200, "Unread count retrieved", { unreadCount });
    } catch (error: any) {
      sendError(res, 500, error.message);
    }
  }
}

export const messageController = new MessageController();
