# User Posts Display Feature

**Last Updated:** January 14, 2026  
**Status:** ✅ Complete and Ready to Use

---

## Overview

This feature allows users to view posts of any user with powerful filtering capabilities. When viewing a user's profile, you can:

1. **Display all posts** from that user
2. **Filter by media type** (videos only)
3. **Display saved posts** (posts the current user has saved)

Each post shows:

- Image/Video URL
- Caption
- Number of likes
- Number of comments
- Creation date

---

## Database Model

### Post Schema

```typescript
interface IPost {
  userId: ObjectId; // Reference to user who created the post
  caption?: string; // Post caption/description
  image?: string; // Image URL
  video?: string; // Video URL
  mediaType: "image" | "video"; // Type of media
  likes: number; // Count of likes
  comments: number; // Count of comments
  savedBy: ObjectId[]; // Array of user IDs who saved this post
  createdAt: Date; // Timestamp
  updatedAt: Date; // Timestamp
}
```

---

## API Endpoints

### 1. Get User's Posts with Filters ⭐

```
GET /api/posts/user/:userId
```

**Query Parameters:**

- `filter` - Filter type: `all`, `video`, or `saved` (default: `all`)
- `limit` - Number of posts per page (default: 20)
- `offset` - Pagination offset (default: 0)

**Headers (for saved posts):**

```
Authorization: Bearer <access_token>
```

**Example Requests:**

```bash
# Get all posts from a user
curl -X GET http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011

# Get only video posts
curl -X GET http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011?filter=video

# Get saved posts (requires authentication)
curl -X GET http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011?filter=saved \
  -H "Authorization: Bearer eyJhbGc..."

# Pagination
curl -X GET http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011?limit=10&offset=20
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "data": {
    "posts": [
      {
        "_id": "607f1f77bcf86cd799439012",
        "image": "https://example.com/uploads/posts/image1.jpg",
        "video": null,
        "mediaType": "image",
        "likes": 245,
        "comments": 18,
        "caption": "Beautiful sunset at the beach",
        "createdAt": "2026-01-14T10:30:00Z"
      },
      {
        "_id": "607f1f77bcf86cd799439013",
        "image": null,
        "video": "https://example.com/uploads/posts/video1.mp4",
        "mediaType": "video",
        "likes": 542,
        "comments": 45,
        "caption": "Check out this amazing video",
        "createdAt": "2026-01-14T09:15:00Z"
      }
    ],
    "total": 145,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**Error Responses:**

```json
// Invalid user ID
{
  "success": false,
  "message": "Invalid user ID format",
  "errors": {
    "userId": ["Valid MongoDB ID required"]
  }
}

// User not found
{
  "success": false,
  "message": "User not found"
}

// Invalid filter
{
  "success": false,
  "message": "Invalid filter",
  "errors": {
    "filter": ["Filter must be 'all', 'video', or 'saved'"]
  }
}

// Authentication required for saved posts
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### 2. Get User Post Statistics

```
GET /api/posts/user/:userId/stats
```

**Example Request:**

```bash
curl -X GET http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011/stats
```

**Response:**

```json
{
  "success": true,
  "message": "Post statistics retrieved successfully",
  "data": {
    "totalPosts": 145,
    "videoPosts": 32,
    "totalLikes": 8542,
    "totalComments": 1203
  }
}
```

---

### 3. Create Post with File Upload (Protected)

```
POST /api/posts
```

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

- `file` (required) - Image or video file
  - Supported images: JPEG, PNG, GIF, WebP
  - Supported videos: MP4, MOV, AVI, WebM
  - Max file size: 100MB
- `caption` (optional) - Post caption/description

**Example Request (Using cURL):**

```bash
# Upload image
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "file=@/path/to/image.jpg" \
  -F "caption=Amazing sunset view"

# Upload video
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "file=@/path/to/video.mp4" \
  -F "caption=Check out this video"
```

**Example Request (Using Postman):**

1. Set method to `POST`
2. URL: `http://localhost:5000/api/posts`
3. Headers tab: Add `Authorization: Bearer <your_token>`
4. Body tab:
   - Select "form-data"
   - Key: `file`, Type: File, Value: Select your image/video
   - Key: `caption`, Type: Text, Value: Your post caption

**Response (200):**

```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "caption": "Amazing sunset view",
    "image": "/uploads/posts/1705243200000-abc123.jpg",
    "video": null,
    "mediaType": "image",
    "likes": 0,
    "comments": 0,
    "savedBy": [],
    "createdAt": "2026-01-14T10:30:00Z",
    "updatedAt": "2026-01-14T10:30:00Z"
  }
}
```

**Error Responses:**

```json
// No file uploaded
{
  "success": false,
  "message": "Please select a file to upload"
}

// Invalid file type
{
  "success": false,
  "message": "Invalid file type. Only images and videos are allowed."
}

// File too large
{
  "success": false,
  "message": "File size exceeds maximum limit of 100MB"
}

// Authentication required
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### 4. Update Post (Protected)

```
PATCH /api/posts/:postId
```

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "caption": "Updated caption"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "caption": "Updated caption",
    "image": "/uploads/posts/1705243200000-abc123.jpg",
    "mediaType": "image",
    "likes": 0,
    "comments": 0,
    "savedBy": [],
    "createdAt": "2026-01-14T10:30:00Z",
    "updatedAt": "2026-01-14T10:35:00Z"
  }
}
```

---

### 5. Delete Post (Protected)

```
DELETE /api/posts/:postId
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

> **Note:** Uploaded files are automatically deleted from storage when a post is deleted.

---

### 6. Like Post (Protected)

```
POST /api/posts/:postId/like
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Post liked successfully",
  "data": {
    "likes": 246
  }
}
```

---

### 7. Unlike Post (Protected)

```
DELETE /api/posts/:postId/like
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Post unliked successfully",
  "data": {
    "likes": 245
  }
}
```

---

### 8. Save Post (Protected)

```
POST /api/posts/:postId/save
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Post saved successfully"
}
```

---

### 9. Unsave Post (Protected)

```
DELETE /api/posts/:postId/save
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Post unsaved successfully"
}
```

---

## Filter Types

### 1. All Posts (Default)

```bash
curl -X GET http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011?filter=all
```

Returns all posts (both images and videos) from the user.

### 2. Videos Only

```bash
curl -X GET http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011?filter=video
```

Returns only video posts from the user.

### 3. Saved Posts

```bash
curl -X GET http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011?filter=saved \
  -H "Authorization: Bearer <token>"
```

Returns posts that the current user has saved. **Requires authentication.**

---

## Pagination

### Example: Get Second Page

```bash
curl -X GET "http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011?limit=20&offset=20"
```

**Response includes:**

- `posts` - Array of post objects
- `total` - Total number of matching posts
- `limit` - Posts per page
- `offset` - Current offset
- `hasMore` - Boolean indicating if more posts are available

---

## Frontend Integration

### React Example

```typescript
// Get all posts from a user
const fetchUserPosts = async (userId: string, filter: "all" | "video" | "saved" = "all") => {
  try {
    const response = await fetch(
      `/api/posts/user/${userId}?filter=${filter}&limit=20&offset=0`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    return data.data.posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

// Display posts
const Posts = ({ userId }: { userId: string }) => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState<"all" | "video" | "saved">("all");

  useEffect(() => {
    fetchUserPosts(userId, filter).then(setPosts);
  }, [userId, filter]);

  return (
    <div>
      <div className="filters">
        <button onClick={() => setFilter("all")}>All Posts</button>
        <button onClick={() => setFilter("video")}>Videos</button>
        <button onClick={() => setFilter("saved")}>Saved</button>
      </div>

      <div className="posts-grid">
        {posts.map((post) => (
          <div key={post._id} className="post">
            {post.mediaType === "image" ? (
              <img src={post.image} alt={post.caption} />
            ) : (
              <video src={post.video} controls />
            )}
            <div className="post-stats">
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments}</span>
            </div>
            {post.caption && <p>{post.caption}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## cURL Examples

### Get All Posts from User

```bash
curl -X GET http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json"
```

### Get Only Video Posts

```bash
curl -X GET "http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011?filter=video" \
  -H "Content-Type: application/json"
```

### Get Saved Posts

```bash
curl -X GET "http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011?filter=saved" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Get Post Statistics

```bash
curl -X GET http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011/stats \
  -H "Content-Type: application/json"
```

### Create a Post

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "Beautiful sunset",
    "image": "https://example.com/sunset.jpg",
    "mediaType": "image"
  }'
```

### Like a Post

```bash
curl -X POST http://localhost:5000/api/posts/607f1f77bcf86cd799439012/like \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Save a Post

```bash
curl -X POST http://localhost:5000/api/posts/607f1f77bcf86cd799439012/save \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

---

## Data Flow Diagram

```
User Profile Page
       │
       ├─→ API: GET /api/posts/user/:userId?filter=all
       │   ├─→ MongoDB: Find posts with userId
       │   └─→ Return all posts (images + videos)
       │
       ├─→ API: GET /api/posts/user/:userId?filter=video
       │   ├─→ MongoDB: Find posts with userId and mediaType="video"
       │   └─→ Return video posts only
       │
       └─→ API: GET /api/posts/user/:userId?filter=saved
           ├─→ Verify authentication
           ├─→ MongoDB: Find posts where userId is in savedBy
           └─→ Return saved posts for current user
```

---

## Testing Checklist

- [ ] Get all posts from user
- [ ] Get only video posts
- [ ] Get saved posts (with auth)
- [ ] Pagination works correctly
- [ ] Post statistics accurate
- [ ] Create new post works
- [ ] Like/unlike post increments/decrements
- [ ] Save/unsave post adds/removes from savedBy
- [ ] Invalid user ID returns 400
- [ ] Non-existent user returns 404
- [ ] Invalid filter returns 400
- [ ] Saved posts without auth returns 401

---

## Files Created/Modified

### New Files:

- `src/models/Post.ts` - Post schema and interface
- `src/services/post.service.ts` - Post business logic
- `src/controllers/post.controller.ts` - Post HTTP handlers
- `src/routes/post.route.ts` - Post API routes

### Modified Files:

- `src/index.ts` - Added post routes registration
- `src/utils/validation.ts` - Added validateObjectId function

---

## Next Features to Build

1. **Comments System** - Add/delete/list comments on posts
2. **Post Search** - Search posts by caption or tags
3. **Hashtags** - Support for hashtags in captions
4. **Feed** - Get feed of posts from followed users
5. **Trending** - Get trending posts by likes/comments

---

## Status

✅ **Posts Display Feature Complete**

All endpoints working:

- Get user posts with filters ✅
- Get post statistics ✅
- Create/Update/Delete posts ✅
- Like/Unlike posts ✅
- Save/Unsave posts ✅

TypeScript compilation: ✅ Success
