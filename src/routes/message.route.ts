import { Router } from "express";
import { messageController } from "../controllers/message.controller";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all conversations
router.get(
  "/conversations",
  messageController.getConversations.bind(messageController)
);

// Get or create conversation with a user
router.post(
  "/conversations",
  messageController.getOrCreateConversation.bind(messageController)
);

// Get messages in a conversation
router.get(
  "/conversations/:conversationId/messages",
  messageController.getMessages.bind(messageController)
);

// Send a message (text or image)
router.post(
  "/messages",
  upload.single("image"),
  messageController.sendMessage.bind(messageController)
);

// Mark message as read
router.put(
  "/messages/:messageId/read",
  messageController.markAsRead.bind(messageController)
);

// Get unread messages count
router.get(
  "/unread-count",
  messageController.getUnreadCount.bind(messageController)
);

export default router;
