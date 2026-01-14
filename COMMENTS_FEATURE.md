# Comments & Nested Replies Feature

## Overview

Hệ thống bình luận hỗ trợ nested replies (trả lời bình luận), tương tự Instagram. User có thể comment trên post và reply vào các comments khác.

## Database Schema

### Comment Model

```typescript
{
  postId: ObjectId,              // Post được comment
  userId: ObjectId,              // User comment
  parentCommentId?: ObjectId,    // null = root comment, ObjectId = reply
  content: string,               // Nội dung comment
  likes: number,                 // Số lượt like
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

- `{ postId, parentCommentId, createdAt }` - Query comments theo post
- `{ userId }` - Query comments của user
- `{ postId, createdAt }` - Sắp xếp comments

## API Endpoints

### 1. Get Comments của Post

**Endpoint:** `GET /api/posts/:postId/comments`

**Query Parameters:**

- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số comments mỗi trang (default: 20)

**Response:**

```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": {
    "comments": [
      {
        "_id": "...",
        "content": "Nice post!",
        "userId": {
          "_id": "...",
          "username": "john_doe",
          "fullName": "John Doe",
          "profilePicture": "..."
        },
        "postId": "...",
        "parentCommentId": null,
        "likes": 5,
        "createdAt": "2026-01-14T10:00:00Z",
        "replies": [
          {
            "_id": "...",
            "content": "Thanks!",
            "userId": {
              "_id": "...",
              "username": "jane_doe",
              "fullName": "Jane Doe",
              "profilePicture": "..."
            },
            "parentCommentId": "...",
            "likes": 2,
            "createdAt": "2026-01-14T10:05:00Z"
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalComments": 45,
      "hasMore": true
    }
  }
}
```

### 2. Create Comment

**Endpoint:** `POST /api/posts/:postId/comments`

**Headers:**

- `Authorization: Bearer <token>`

**Body:**

```json
{
  "content": "Great photo!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "_id": "...",
    "content": "Great photo!",
    "userId": "...",
    "postId": "...",
    "parentCommentId": null,
    "likes": 0,
    "createdAt": "2026-01-14T10:00:00Z"
  }
}
```

### 3. Create Reply

**Endpoint:** `POST /api/posts/:postId/comments/:commentId/replies`

**Headers:**

- `Authorization: Bearer <token>`

**Body:**

```json
{
  "content": "Thanks for your comment!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Reply created successfully",
  "data": {
    "_id": "...",
    "content": "Thanks for your comment!",
    "userId": "...",
    "postId": "...",
    "parentCommentId": "...",
    "likes": 0,
    "createdAt": "2026-01-14T10:05:00Z"
  }
}
```

### 4. Get Replies của Comment

**Endpoint:** `GET /api/posts/:postId/comments/:commentId/replies`

**Query Parameters:**

- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số replies mỗi trang (default: 20)

**Response:**

```json
{
  "success": true,
  "message": "Replies retrieved successfully",
  "data": {
    "replies": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalReplies": 15,
      "hasMore": true
    }
  }
}
```

### 5. Update Comment

**Endpoint:** `PUT /api/posts/:postId/comments/:commentId`

**Headers:**

- `Authorization: Bearer <token>`

**Body:**

```json
{
  "content": "Updated comment content"
}
```

### 6. Delete Comment

**Endpoint:** `DELETE /api/posts/:postId/comments/:commentId`

**Headers:**

- `Authorization: Bearer <token>`

**Note:** Xóa comment sẽ xóa tất cả replies của nó

### 7. Like Comment

**Endpoint:** `POST /api/posts/:postId/comments/:commentId/like`

**Headers:**

- `Authorization: Bearer <token>`

### 8. Unlike Comment

**Endpoint:** `DELETE /api/posts/:postId/comments/:commentId/like`

**Headers:**

- `Authorization: Bearer <token>`

## Business Logic

### Nested Replies Structure

- Root comments có `parentCommentId = null`
- Replies có `parentCommentId = <commentId>`
- Khi get comments của post, replies được nest trong root comment
- Có thể get replies riêng của từng comment với pagination

### Comment Deletion

- Khi xóa comment, tất cả replies cũng bị xóa
- Post's comments count được cập nhật tự động

### Permissions

- Chỉ owner của comment mới có thể update/delete
- Bất kỳ user nào đã login đều có thể like/unlike

## Implementation Files

- Model: `src/models/Comment.ts`
- Service: `src/services/comment.service.ts`
- Controller: `src/controllers/comment.controller.ts`
- Routes: `src/routes/comment.route.ts`
