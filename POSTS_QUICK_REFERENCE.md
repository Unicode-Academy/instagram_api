# Posts Feature - Quick Reference

## Endpoints at a Glance

### Public Endpoints (No Auth Required)

**Get User Posts:**

```bash
GET /api/posts/user/:userId?filter=all&limit=20&offset=0
```

Filters: `all` (default) | `video` | `saved` (requires auth)

**Get Stats:**

```bash
GET /api/posts/user/:userId/stats
```

### Protected Endpoints (Authentication Required)

**Create Post:**

```bash
POST /api/posts
Content-Type: multipart/form-data
Fields: file (image/video), caption (optional)
```

**Update Post:**

```bash
PATCH /api/posts/:postId
```

**Delete Post:**

```bash
DELETE /api/posts/:postId
```

**Like/Unlike:**

```bash
POST /api/posts/:postId/like
DELETE /api/posts/:postId/like
```

**Save/Unsave:**

```bash
POST /api/posts/:postId/save
DELETE /api/posts/:postId/save
```

---

## Examples

### Get All Posts from User

```bash
curl http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011
```

### Get Only Videos

```bash
curl "http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011?filter=video"
```

### Get Saved Posts (Need Token)

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/posts/user/507f1f77bcf86cd799439011?filter=saved"
```

### Create Image Post (File Upload)

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@./photo.jpg" \
  -F "caption=Beautiful sunset"
```

### Create Video Post (File Upload)

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@./video.mp4" \
  -F "caption=Check this out"
```

### Create Post - Legacy (URL-based)

### Like a Post

```bash
curl -X POST http://localhost:5000/api/posts/POST_ID/like \
  -H "Authorization: Bearer TOKEN"
```

### Save a Post

```bash
curl -X POST http://localhost:5000/api/posts/POST_ID/save \
  -H "Authorization: Bearer TOKEN"
```

---

## Response Format

### Success

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "message": "...",
  "errors": { ... }
}
```

---

## Filter Types Explained

| Filter  | Purpose             | Auth Required | Returns                |
| ------- | ------------------- | ------------- | ---------------------- |
| `all`   | All posts from user | ❌            | Images + Videos        |
| `video` | Only videos         | ❌            | Video posts only       |
| `saved` | Posts user saved    | ✅            | Posts in savedBy array |

---

## Post Object Structure

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "caption": "string",
  "image": "URL",
  "video": "URL",
  "mediaType": "image" | "video",
  "likes": 245,
  "comments": 18,
  "savedBy": ["ObjectId"],
  "createdAt": "ISO Date",
  "updatedAt": "ISO Date"
}
```

---

## Status Codes

| Code | Meaning      |
| ---- | ------------ |
| 200  | Success      |
| 201  | Created      |
| 400  | Bad Request  |
| 401  | Unauthorized |
| 403  | Forbidden    |
| 404  | Not Found    |
| 500  | Server Error |

---

## File Structure

```
src/
├── models/
│   └── Post.ts                 (60 lines)
├── services/
│   └── post.service.ts         (227 lines)
├── controllers/
│   └── post.controller.ts      (287 lines)
├── routes/
│   └── post.route.ts           (49 lines)
└── utils/
    └── validation.ts           (added validateObjectId)
```

---

## Quick Stats

- **Total Endpoints:** 9
- **Public Endpoints:** 2
- **Protected Endpoints:** 7
- **Database Indexes:** 2
- **TypeScript:** ✅ Full type safety
- **Build Status:** ✅ Success

---

## Testing

**Automated test script:**

```bash
./test-posts-feature.sh
```

**Manual test:**

```bash
# 1. Get all posts
curl http://localhost:5000/api/posts/user/USER_ID

# 2. Get videos only
curl "http://localhost:5000/api/posts/user/USER_ID?filter=video"

# 3. Get stats
curl http://localhost:5000/api/posts/user/USER_ID/stats
```

---

## Important Notes

✅ **Public endpoints** (get posts, stats) - No authentication needed
✅ **"saved" filter** - Requires authentication to see your saved posts
✅ **Pagination** - Supports limit & offset for loading posts
✅ **Likes & Comments** - Tracked as counters, not individual records
✅ **Media Types** - Support for both images and videos

---

See **POSTS_FEATURE_GUIDE.md** for complete documentation.
