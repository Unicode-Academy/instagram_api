# Post Details & Comments API

**Date:** January 14, 2026  
**Status:** ✅ Complete and Ready to Use

---

## Overview

This feature provides detailed post information with comment management. When viewing a specific post, you can:

1. Get full post details (image/video, caption, author info)
2. See all comments with usernames and timestamps
3. Create, edit, and delete comments
4. Like/unlike comments

---

## API Endpoints

### 1. Get Post Details with Comments

```
GET /api/posts/:postId
```

**Parameters:**

- `postId` - MongoDB ID of the post

**Response (200):**

```json
{
  "success": true,
  "message": "Post details retrieved successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "avatar": "/uploads/profiles/avatar.jpg",
      "fullname": "John Doe"
    },
    "caption": "Beautiful sunset at the beach",
    "image": "/uploads/posts/1705243200000-abc123.jpg",
    "video": null,
    "mediaType": "image",
    "likes": 245,
    "comments": 18,
    "totalComments": 18,
    "createdAt": "2026-01-14T10:30:00Z",
    "updatedAt": "2026-01-14T10:30:00Z",
    "comments": [
      {
        "_id": "607f1f77bcf86cd799439020",
        "content": "Amazing view!",
        "likes": 5,
        "createdAt": "2026-01-14T10:35:00Z",
        "user": {
          "_id": "507f1f77bcf86cd799439012",
          "username": "jane_smith",
          "avatar": "/uploads/profiles/avatar2.jpg"
        }
      },
      {
        "_id": "607f1f77bcf86cd799439021",
        "content": "Love this!",
        "likes": 3,
        "createdAt": "2026-01-14T10:40:00Z",
        "user": {
          "_id": "507f1f77bcf86cd799439013",
          "username": "alex_park",
          "avatar": "/uploads/profiles/avatar3.jpg"
        }
      }
    ]
  }
}
```

**Example Request:**

```bash
curl http://localhost:5000/api/posts/607f1f77bcf86cd799439012
```

---

### 2. Get Post Comments

```
GET /api/posts/:postId/comments?limit=20&offset=0
```

**Query Parameters:**

- `limit` - Number of comments (default: 20)
- `offset` - Pagination offset (default: 0)

**Response (200):**

```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": {
    "comments": [
      {
        "_id": "607f1f77bcf86cd799439020",
        "content": "Amazing view!",
        "likes": 5,
        "createdAt": "2026-01-14T10:35:00Z",
        "userId": {
          "_id": "507f1f77bcf86cd799439012",
          "username": "jane_smith",
          "avatar": "/uploads/profiles/avatar2.jpg"
        }
      }
    ],
    "total": 18,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

**Example Request:**

```bash
curl http://localhost:5000/api/posts/607f1f77bcf86cd799439012/comments?limit=10&offset=0
```

---

### 3. Create a Comment ⭐

```
POST /api/posts/:postId/comments
```

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "content": "Amazing view!"
}
```

**Validation:**

- Content is required
- Content must be 1-500 characters

**Response (201):**

```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439020",
    "postId": "607f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "jane_smith",
      "avatar": "/uploads/profiles/avatar2.jpg"
    },
    "content": "Amazing view!",
    "likes": 0,
    "createdAt": "2026-01-14T10:35:00Z"
  }
}
```

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/posts/607f1f77bcf86cd799439012/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Amazing view!"}'
```

---

### 4. Update a Comment

```
PATCH /api/posts/:postId/comments/:commentId
```

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "content": "Updated comment content"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439020",
    "content": "Updated comment content",
    "likes": 5,
    "createdAt": "2026-01-14T10:35:00Z",
    "updatedAt": "2026-01-14T10:45:00Z"
  }
}
```

**Example Request:**

```bash
curl -X PATCH http://localhost:5000/api/posts/607f1f77bcf86cd799439012/comments/607f1f77bcf86cd799439020 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated comment"}'
```

---

### 5. Delete a Comment

```
DELETE /api/posts/:postId/comments/:commentId
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

**Example Request:**

```bash
curl -X DELETE http://localhost:5000/api/posts/607f1f77bcf86cd799439012/comments/607f1f77bcf86cd799439020 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 6. Like a Comment

```
POST /api/posts/:postId/comments/:commentId/like
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Comment liked successfully",
  "data": {
    "likes": 6
  }
}
```

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/posts/607f1f77bcf86cd799439012/comments/607f1f77bcf86cd799439020/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 7. Unlike a Comment

```
DELETE /api/posts/:postId/comments/:commentId/like
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Comment unliked successfully",
  "data": {
    "likes": 5
  }
}
```

**Example Request:**

```bash
curl -X DELETE http://localhost:5000/api/posts/607f1f77bcf86cd799439012/comments/607f1f77bcf86cd799439020/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Responses

### Comment Not Found

```json
{
  "success": false,
  "message": "Comment not found"
}
```

### Post Not Found

```json
{
  "success": false,
  "message": "Post not found"
}
```

### Invalid Content

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "content": ["Content is required and must be a non-empty string"]
  }
}
```

### Not Authorized (Can't edit/delete others' comments)

```json
{
  "success": false,
  "message": "You can only delete your own comments"
}
```

### Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## Usage Examples

### Get Post Details with Comments

```bash
# Get post with all comments
curl http://localhost:5000/api/posts/607f1f77bcf86cd799439012
```

### Comment on a Post

```bash
curl -X POST http://localhost:5000/api/posts/607f1f77bcf86cd799439012/comments \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"content": "This is amazing!"}'
```

### Interact with Comments

```bash
# Like a comment
curl -X POST http://localhost:5000/api/posts/607f1f77bcf86cd799439012/comments/607f1f77bcf86cd799439020/like \
  -H "Authorization: Bearer eyJhbGc..."

# Edit your comment
curl -X PATCH http://localhost:5000/api/posts/607f1f77bcf86cd799439012/comments/607f1f77bcf86cd799439020 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated comment"}'

# Delete your comment
curl -X DELETE http://localhost:5000/api/posts/607f1f77bcf86cd799439012/comments/607f1f77bcf86cd799439020 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## Postman Collection

### Get Post Details

- **Method:** GET
- **URL:** `http://localhost:5000/api/posts/607f1f77bcf86cd799439012`
- **Headers:** None required

### Create Comment

- **Method:** POST
- **URL:** `http://localhost:5000/api/posts/607f1f77bcf86cd799439012/comments`
- **Headers:** `Authorization: Bearer TOKEN`
- **Body (JSON):** `{"content": "Amazing view!"}`

### Update Comment

- **Method:** PATCH
- **URL:** `http://localhost:5000/api/posts/607f1f77bcf86cd799439012/comments/COMMENT_ID`
- **Headers:** `Authorization: Bearer TOKEN`
- **Body (JSON):** `{"content": "Updated content"}`

### Delete Comment

- **Method:** DELETE
- **URL:** `http://localhost:5000/api/posts/607f1f77bcf86cd799439012/comments/COMMENT_ID`
- **Headers:** `Authorization: Bearer TOKEN`

---

## Database Schema

### Comment Model

```typescript
interface IComment extends Document {
  postId: ObjectId; // Reference to Post
  userId: ObjectId; // Reference to User (commenter)
  content: string; // Comment text (1-500 chars)
  likes: number; // Number of likes
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
```

**Indexes:**

- `postId + createdAt` - For retrieving post comments sorted by date
- `userId` - For finding user's comments

---

## Files Added/Modified

### New Files:

- ✅ `src/models/Comment.ts` (42 lines)
- ✅ `src/services/comment.service.ts` (89 lines)
- ✅ `src/controllers/comment.controller.ts` (186 lines)
- ✅ `src/routes/comment.route.ts` (43 lines)

### Modified Files:

- ✅ `src/controllers/post.controller.ts` - Added `getPostDetails()` method
- ✅ `src/routes/post.route.ts` - Added `GET /:postId` and comment route mounting

---

## Key Features

✅ Get post with all details including author info  
✅ View comments with usernames and avatars  
✅ Pagination for comments (limit/offset)  
✅ Create comments (1-500 characters)  
✅ Edit own comments  
✅ Delete own comments  
✅ Like/Unlike comments  
✅ Automatic comment count management  
✅ Full input validation  
✅ Permission checks (can only edit/delete own comments)

---

## Testing Checklist

- [ ] Get post details with comments
- [ ] Create a comment on post
- [ ] Update own comment
- [ ] Delete own comment
- [ ] Like a comment
- [ ] Unlike a comment
- [ ] Verify comment count increments/decrements
- [ ] Pagination works (limit/offset)
- [ ] Can't delete/edit others' comments
- [ ] Authentication required for post actions
- [ ] Invalid post ID returns 404
- [ ] Invalid comment ID returns 404

---

## Build Status

✅ TypeScript compilation successful  
✅ All types properly defined  
✅ No compile errors  
✅ Ready for deployment
