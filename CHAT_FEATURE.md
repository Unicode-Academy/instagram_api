# Chat Feature (Direct Messages)

## Overview

Hệ thống chat realtime giống Instagram Direct Messages, cho phép users nhắn tin trực tiếp với nhau. Hỗ trợ chat 1-1, gửi văn bản và ảnh, với realtime updates qua Socket.IO.

## Database Schema

### Conversation Model

```typescript
{
  participants: [ObjectId, ObjectId],  // Đúng 2 users (one-on-one)
  lastMessage: ObjectId,               // Message cuối cùng
  lastMessageAt: Date,                 // Thời gian message cuối
  createdAt: Date,
  updatedAt: Date
}
```

**Constraints:**

- Participants array phải có đúng 2 users
- Unique constraint trên participants để tránh duplicate conversations

**Indexes:**

- `{ participants: 1 }` - Tìm conversations của user
- `{ lastMessageAt: -1 }` - Sort theo tin nhắn mới nhất
- `{ participants: 1 }` (unique) - Prevent duplicate conversations

### Message Model

```typescript
{
  conversationId: ObjectId,
  senderId: ObjectId,
  recipientId: ObjectId,
  messageType: "text" | "image",
  content?: string,                    // Required nếu type = text
  imageUrl?: string,                   // Required nếu type = image
  isRead: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `{ conversationId: 1, createdAt: -1 }` - Get messages sorted
- `{ recipientId: 1, isRead: 1 }` - Count unread messages
- `{ conversationId: 1 }`, `{ senderId: 1 }`, `{ recipientId: 1 }` - Individual indexes

## API Endpoints

### 1. Get User's Conversations

**Endpoint:** `GET /api/messages/conversations`

**Description:** Lấy danh sách các cuộc hội thoại của user, sorted by last message time

**Headers:**

- `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số conversations mỗi trang (default: 20)

**Response:**

```json
{
  "success": true,
  "message": "Conversations retrieved successfully",
  "data": {
    "conversations": [
      {
        "_id": "conv_id_1",
        "participants": [
          {
            "_id": "user1_id",
            "username": "john_doe",
            "fullName": "John Doe",
            "profilePicture": "https://..."
          },
          {
            "_id": "user2_id",
            "username": "jane_smith",
            "fullName": "Jane Smith",
            "profilePicture": "https://..."
          }
        ],
        "lastMessage": {
          "_id": "msg_id",
          "messageType": "text",
          "content": "Hey, how are you?",
          "createdAt": "2026-01-14T10:30:00Z",
          "senderId": "user1_id",
          "isRead": false
        },
        "lastMessageAt": "2026-01-14T10:30:00Z",
        "unreadCount": 3,
        "createdAt": "2026-01-10T08:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalConversations": 45,
      "hasMore": true
    }
  }
}
```

### 2. Create or Get Conversation

**Endpoint:** `POST /api/messages/conversations`

**Description:** Tạo conversation mới hoặc lấy conversation hiện có với một user

**Headers:**

- `Authorization: Bearer <token>`

**Body:**

```json
{
  "userId": "target_user_id"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Conversation retrieved successfully",
  "data": {
    "_id": "conv_id",
    "participants": [
      {
        "_id": "...",
        "username": "john_doe",
        "fullName": "John Doe",
        "profilePicture": "https://..."
      },
      {
        "_id": "...",
        "username": "jane_smith",
        "fullName": "Jane Smith",
        "profilePicture": "https://..."
      }
    ],
    "lastMessage": null,
    "lastMessageAt": "2026-01-14T10:00:00Z",
    "createdAt": "2026-01-14T10:00:00Z"
  }
}
```

**Error Responses:**

```json
// Cannot message yourself
{
  "success": false,
  "message": "Cannot create conversation with yourself"
}
```

### 3. Get Messages in Conversation

**Endpoint:** `GET /api/messages/conversations/:conversationId/messages`

**Description:** Lấy tất cả messages trong một conversation

**Headers:**

- `Authorization: Bearer <token>`

**URL Parameters:**

- `conversationId`: ID của conversation

**Query Parameters:**

- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số messages mỗi trang (default: 50)

**Response:**

```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "msg_id_1",
        "conversationId": "conv_id",
        "senderId": {
          "_id": "user1_id",
          "username": "john_doe",
          "fullName": "John Doe",
          "profilePicture": "https://..."
        },
        "recipientId": "user2_id",
        "messageType": "text",
        "content": "Hello!",
        "isRead": true,
        "createdAt": "2026-01-14T09:00:00Z"
      },
      {
        "_id": "msg_id_2",
        "conversationId": "conv_id",
        "senderId": {
          "_id": "user2_id",
          "username": "jane_smith",
          "fullName": "Jane Smith",
          "profilePicture": "https://..."
        },
        "recipientId": "user1_id",
        "messageType": "image",
        "imageUrl": "https://.../image.jpg",
        "isRead": true,
        "createdAt": "2026-01-14T09:05:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalMessages": 234,
      "hasMore": true
    }
  }
}
```

**Note:** Khi get messages, tất cả unread messages sẽ tự động được mark as read

**Error Response:**

```json
{
  "success": false,
  "message": "Conversation not found or access denied"
}
```

### 4. Send Text Message

**Endpoint:** `POST /api/messages/messages`

**Description:** Gửi tin nhắn văn bản

**Headers:**

- `Authorization: Bearer <token>`

**Body:**

```json
{
  "conversationId": "conv_id",
  "recipientId": "user_id",
  "messageType": "text",
  "content": "Hello! How are you?"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "msg_id",
    "conversationId": "conv_id",
    "senderId": {
      "_id": "...",
      "username": "john_doe",
      "fullName": "John Doe",
      "profilePicture": "https://..."
    },
    "recipientId": "user_id",
    "messageType": "text",
    "content": "Hello! How are you?",
    "isRead": false,
    "createdAt": "2026-01-14T10:30:00Z"
  }
}
```

### 5. Send Image Message

**Endpoint:** `POST /api/messages/messages`

**Description:** Gửi tin nhắn ảnh

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (FormData):**

- `conversationId`: conv_id
- `recipientId`: user_id
- `messageType`: "image"
- `image`: <file>

**Response:**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "msg_id",
    "conversationId": "conv_id",
    "senderId": {...},
    "recipientId": "user_id",
    "messageType": "image",
    "imageUrl": "https://.../uploads/image.jpg",
    "isRead": false,
    "createdAt": "2026-01-14T10:35:00Z"
  }
}
```

### 6. Mark Message as Read

**Endpoint:** `PUT /api/messages/messages/:messageId/read`

**Description:** Đánh dấu tin nhắn là đã đọc

**Headers:**

- `Authorization: Bearer <token>`

**URL Parameters:**

- `messageId`: ID của message

**Response:**

```json
{
  "success": true,
  "message": "Message marked as read",
  "data": {
    "_id": "msg_id",
    "isRead": true,
    ...
  }
}
```

### 7. Get Unread Count

**Endpoint:** `GET /api/messages/unread-count`

**Description:** Lấy tổng số tin nhắn chưa đọc

**Headers:**

- `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Unread count retrieved",
  "data": {
    "unreadCount": 15
  }
}
```

## Socket.IO Realtime

### Connection Setup

**Backend (Already configured):**

- Socket.IO server initialized in `src/config/socket.ts`
- Requires JWT token for authentication
- Each user joins their personal room (userId)

**Frontend Connection:**

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: yourJWTToken,
  },
});

// Connection events
socket.on("connect", () => {
  console.log("Connected to chat server");
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error.message);
});
```

### Realtime Events

#### 1. Receive New Message

```javascript
socket.on("new_message", (message) => {
  // message = {
  //   _id, conversationId, senderId, recipientId,
  //   messageType, content/imageUrl, createdAt
  // }

  if (currentConversationId === message.conversationId) {
    // Add to current chat
    setMessages((prev) => [...prev, message]);
    scrollToBottom();
  } else {
    // Show notification
    showNotification(`New message from ${message.senderId.username}`);
    updateUnreadCount((prev) => prev + 1);
  }
});
```

#### 2. Typing Indicator

```javascript
// Send typing event
const handleTyping = () => {
  socket.emit("typing", {
    conversationId: currentConversationId,
    recipientId: otherUserId,
  });
};

// Send stop typing event
const handleStopTyping = () => {
  socket.emit("stop_typing", {
    conversationId: currentConversationId,
    recipientId: otherUserId,
  });
};

// Receive typing indicator
socket.on("user_typing", ({ conversationId, userId }) => {
  if (conversationId === currentConversationId) {
    setIsTyping(true);
  }
});

socket.on("user_stop_typing", ({ conversationId, userId }) => {
  if (conversationId === currentConversationId) {
    setIsTyping(false);
  }
});
```

## Frontend Integration

### Chat List Component

```javascript
const ChatList = () => {
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load conversations
    loadConversations();

    // Load unread count
    loadUnreadCount();

    // Listen for new messages
    socket.on("new_message", (message) => {
      // Update conversation list
      updateConversationList(message);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.off("new_message");
  }, []);

  const loadConversations = async () => {
    const { data } = await api.get("/api/messages/conversations");
    setConversations(data.conversations);
  };

  return (
    <div className="chat-list">
      <div className="header">
        <h2>Messages</h2>
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </div>

      {conversations.map((conv) => {
        const otherUser = conv.participants.find(
          (p) => p._id !== currentUserId
        );
        return (
          <div
            key={conv._id}
            className="conversation-item"
            onClick={() => navigate(`/messages/${conv._id}`)}
          >
            <img src={otherUser.profilePicture} alt={otherUser.username} />
            <div className="info">
              <h4>{otherUser.username}</h4>
              <p className={conv.unreadCount > 0 ? "unread" : ""}>
                {conv.lastMessage?.content || "Photo"}
              </p>
            </div>
            <div className="meta">
              <span className="time">{formatTime(conv.lastMessageAt)}</span>
              {conv.unreadCount > 0 && (
                <span className="unread-badge">{conv.unreadCount}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

### Chat Window Component

```javascript
const ChatWindow = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    // Load messages
    loadMessages();

    // Listen for new messages
    socket.on("new_message", (message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    });

    // Listen for typing
    socket.on("user_typing", ({ conversationId: convId }) => {
      if (convId === conversationId) setIsTyping(true);
    });

    socket.on("user_stop_typing", ({ conversationId: convId }) => {
      if (convId === conversationId) setIsTyping(false);
    });

    return () => {
      socket.off("new_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [conversationId]);

  const loadMessages = async () => {
    const { data } = await api.get(
      `/api/messages/conversations/${conversationId}/messages`
    );
    setMessages(data.messages);
    scrollToBottom();
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      await api.post("/api/messages/messages", {
        conversationId,
        recipientId: otherUser._id,
        messageType: "text",
        content: inputText,
      });

      setInputText("");
      socket.emit("stop_typing", {
        conversationId,
        recipientId: otherUser._id,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = () => {
    socket.emit("typing", {
      conversationId,
      recipientId: otherUser._id,
    });
  };

  const handleStopTyping = () => {
    socket.emit("stop_typing", {
      conversationId,
      recipientId: otherUser._id,
    });
  };

  const handleImageSend = async (file) => {
    const formData = new FormData();
    formData.append("conversationId", conversationId);
    formData.append("recipientId", otherUser._id);
    formData.append("messageType", "image");
    formData.append("image", file);

    await api.post("/api/messages/messages", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img src={otherUser?.profilePicture} />
        <h3>{otherUser?.username}</h3>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={msg.senderId._id === currentUserId ? "sent" : "received"}
          >
            {msg.messageType === "text" ? (
              <p>{msg.content}</p>
            ) : (
              <img src={msg.imageUrl} alt="Sent image" />
            )}
            <span className="time">{formatTime(msg.createdAt)}</span>
          </div>
        ))}
        {isTyping && <div className="typing-indicator">Typing...</div>}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => {
            handleTyping();
            if (e.key === "Enter") handleSendMessage();
          }}
          onBlur={handleStopTyping}
          placeholder="Message..."
        />
        <button onClick={handleSendMessage}>Send</button>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageSend(e.target.files[0])}
        />
      </div>
    </div>
  );
};
```

### New Conversation (Search Users)

```javascript
const NewMessage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);

  const searchUsers = async (query) => {
    const { data } = await api.get(`/api/users/search?q=${query}`);
    setUsers(data);
  };

  const startConversation = async (userId) => {
    const { data } = await api.post("/api/messages/conversations", {
      userId,
    });
    navigate(`/messages/${data._id}`);
  };

  return (
    <div className="new-message">
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          if (e.target.value) searchUsers(e.target.value);
        }}
      />

      <div className="user-list">
        {users.map((user) => (
          <div key={user._id} onClick={() => startConversation(user._id)}>
            <img src={user.profilePicture} />
            <div>
              <h4>{user.username}</h4>
              <p>{user.fullName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Business Logic

### Conversation Creation

- Tự động sort user IDs để đảm bảo consistent query
- Check duplicate: nếu conversation đã tồn tại → return existing
- Unique constraint prevents race condition khi tạo đồng thời

### Message Read Status

- Messages tự động được mark as read khi user GET messages trong conversation
- Bulk update tất cả unread messages cùng lúc
- isRead = false khi mới gửi, = true sau khi recipient xem

### Last Message Update

- Mỗi khi gửi message mới, conversation's `lastMessage` và `lastMessageAt` được update
- Dùng để sort conversations theo thứ tự activity

### Realtime Delivery

- Message được emit qua Socket.IO ngay sau khi lưu vào DB
- Recipient nhận instant notification nếu đang online
- Nếu offline, message vẫn được lưu và hiển thị khi login lại

## Performance Considerations

### Database Indexes

```typescript
// Conversation indexes
{ participants: 1 }           // Find conversations of user
{ lastMessageAt: -1 }         // Sort by recent activity
{ participants: 1 } (unique)  // Prevent duplicates

// Message indexes
{ conversationId: 1, createdAt: -1 }  // Get messages sorted
{ recipientId: 1, isRead: 1 }         // Count unread messages
```

### Query Optimization

- Pagination cho conversations (default: 20)
- Pagination cho messages (default: 50)
- Populate chỉ fields cần thiết: username, fullName, profilePicture
- Sử dụng `.lean()` để faster queries

### Expected Performance

- Get conversations: ~30-80ms
- Get messages: ~50-150ms (depends on count)
- Send message: ~20-50ms (write + emit)
- Realtime delivery: <10ms (socket emit)

### Scalability Considerations

#### Socket.IO Clustering (Future)

```typescript
// Use Redis adapter for multiple server instances
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

#### Message Pagination

- Load initial 50 messages
- Implement infinite scroll for older messages
- Cache recent conversations in client

#### Unread Count Caching

```typescript
// Cache in Redis for 5 minutes
const cacheKey = `unread:${userId}`;
const cached = await redis.get(cacheKey);
if (cached) return parseInt(cached);

const count = await getUnreadCount(userId);
await redis.setex(cacheKey, 300, count.toString());
```

## Security & Privacy

### Authentication

- All endpoints require JWT authentication
- Socket.IO connections require valid JWT token
- Users can only access their own conversations

### Authorization Checks

- Verify user is participant before accessing conversation
- Verify user is recipient before marking message as read
- Cannot create conversation with yourself

### Data Validation

- messageType must be 'text' or 'image'
- Text messages require content
- Image messages require image file
- Participants array must have exactly 2 users

### Rate Limiting (Recommended)

```typescript
// Prevent spam
- Send message: 30 per minute
- Create conversation: 10 per minute
- Get messages: 60 per minute
```

## Use Cases

### 1. Direct Messaging

Users send private messages to friends, reply to posts via DM

### 2. Customer Support

Businesses communicate with customers through DMs

### 3. Collaboration

Team members discuss privately about projects

### 4. Post Sharing (Future)

Share posts/profiles via DM with preview

## Future Enhancements

### 1. Message Reactions

```typescript
// React to messages with emojis
POST /api/messages/:messageId/reactions
Body: { emoji: "❤️" }
```

### 2. Message Deletion

```typescript
// Unsend messages
DELETE /api/messages/:messageId
// Only sender can delete within 15 minutes
```

### 3. Message Forwarding

```typescript
// Forward message to another conversation
POST /api/messages/:messageId/forward
Body: { conversationId: "..." }
```

### 4. Voice Messages

```typescript
// Send audio recordings
messageType: "voice";
voiceUrl: "https://.../audio.mp3";
duration: 30; // seconds
```

### 5. Video Messages

```typescript
// Send short video clips
messageType: "video";
videoUrl: "https://.../video.mp4";
thumbnail: "https://.../thumb.jpg";
```

### 6. Message Search

```typescript
// Search messages in all conversations
GET /api/messages/search?q=keyword
```

### 7. Share Posts

```typescript
// Share a post in conversation
messageType: "post";
postId: "post_id";
// Display post preview
```

### 8. Group Chats

```typescript
// Multiple participants (3+)
participants: [userId1, userId2, userId3, ...]
groupName: "Team Discussion"
groupImage: "https://..."
```

### 9. Message Threads

```typescript
// Reply to specific message
replyTo: messageId;
// Show thread view
```

### 10. Read Receipts Detail

```typescript
// Show when message was read
readAt: Date;
// "Seen at 10:30 AM"
```

### 11. Online Status

```typescript
// Show if user is online
socket.on("user_online", (userId) => {
  updateUserStatus(userId, "online");
});

socket.on("user_offline", (userId) => {
  updateUserStatus(userId, "offline");
});
```

### 12. Last Seen

```typescript
// Track last activity
lastSeen: Date;
// "Last seen 5 minutes ago"
```

### 13. Disappearing Messages

```typescript
// Auto-delete after time
disappearAfter: 3600; // seconds
expiresAt: Date;
```

### 14. Message Pinning

```typescript
// Pin important messages
isPinned: boolean;
pinnedAt: Date;
```

### 15. Conversation Muting

```typescript
// Mute notifications
POST /api/messages/conversations/:id/mute
isMuted: boolean
mutedUntil: Date
```

## Implementation Files

- Models: `src/models/Conversation.ts`, `src/models/Message.ts`
- Service: `src/services/message.service.ts`
- Controller: `src/controllers/message.controller.ts`
- Routes: `src/routes/message.route.ts`
- Socket.IO: `src/config/socket.ts`
- Index: `src/index.ts` (Socket.IO initialization, mounted at `/api/messages`)

## Testing Scenarios

### 1. Create Conversation

- User A creates conversation with User B
- Conversation created with 2 participants
- Can retrieve conversation by ID
- Attempting to create again returns existing conversation

### 2. Send Messages

- Send text message → Message saved, realtime delivered
- Send image message → Image uploaded, URL saved
- Send to invalid conversation → Error 404

### 3. Receive Messages

- User B receives realtime notification
- Messages appear in conversation
- Unread count increases
- Opening conversation marks as read

### 4. Conversation List

- Shows all conversations sorted by lastMessageAt
- Displays last message preview
- Shows unread count per conversation
- Pagination works correctly

### 5. Typing Indicator

- User starts typing → Recipient sees "Typing..."
- User stops typing → Indicator disappears
- Works in realtime via Socket.IO

### 6. Offline/Online

- Messages sent while offline are saved
- User sees messages when coming back online
- Socket reconnects automatically

### 7. Concurrent Access

- Multiple users send to same conversation
- Messages ordered correctly by timestamp
- No race conditions in conversation creation

### 8. Access Control

- User cannot access other users' conversations
- User cannot read messages from conversations they're not in
- Authentication required for all endpoints

## Related Features

- [Search Users](SEARCH_USERS_FEATURE.md) - Search users to start conversation
- [Follow Feature](FOLLOW_FEATURE.md) - Often message users you follow
- [Search History](SEARCH_HISTORY_FEATURE.md) - Track recent searches for DM
