# Explore Feature

## Overview

Tính năng Explore giúp user khám phá các posts trending dựa trên engagement (likes và comments). Posts với engagement cao trong 30 ngày gần nhất sẽ được hiển thị ưu tiên.

## Algorithm

### Engagement Score

```
engagementScore = likes + (comments × 2)
```

**Lý do comments có weight cao hơn:**

- Comments thể hiện sự tương tác sâu hơn likes
- User dành thời gian và effort để comment
- Comments tạo conversation, tăng value của post

### Filtering

- Chỉ lấy posts trong **30 ngày gần nhất**
- Đảm bảo content luôn fresh và relevant

## API Endpoint

**Endpoint:** `GET /api/posts/explore`

**Query Parameters:**

- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số posts mỗi trang (default: 20)

**Headers:**

- `Authorization: Bearer <token>` (optional - có thể xem không cần login)

**Response:**

```json
{
  "success": true,
  "message": "Explore posts retrieved successfully",
  "data": {
    "posts": [
      {
        "_id": "...",
        "caption": "Amazing sunset at the beach!",
        "image": "https://...",
        "video": null,
        "mediaType": "image",
        "likes": 150,
        "comments": 45,
        "engagementScore": 240,
        "createdAt": "2026-01-10T15:30:00Z",
        "user": {
          "_id": "...",
          "username": "travel_lover",
          "fullName": "Travel Lover",
          "profilePicture": "https://..."
        }
      },
      {
        "_id": "...",
        "caption": "Best coffee in town ☕",
        "image": "https://...",
        "video": null,
        "mediaType": "image",
        "likes": 80,
        "comments": 60,
        "engagementScore": 200,
        "createdAt": "2026-01-12T09:15:00Z",
        "user": {
          "_id": "...",
          "username": "foodie_jane",
          "fullName": "Jane Smith",
          "profilePicture": "https://..."
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalPosts": 98,
      "hasMore": true
    }
  }
}
```

## Implementation Details

### MongoDB Aggregation Pipeline

```typescript
Post.aggregate([
  // Filter: Last 30 days only
  {
    $match: {
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  },

  // Add engagement score field
  {
    $addFields: {
      engagementScore: {
        $add: ["$likes", { $multiply: ["$comments", 2] }],
      },
    },
  },

  // Sort by engagement score (highest first)
  { $sort: { engagementScore: -1 } },

  // Pagination
  { $skip: (page - 1) * limit },
  { $limit: limit },

  // Join with users collection
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user",
    },
  },

  // Unwind user array
  { $unwind: "$user" },

  // Select fields
  {
    $project: {
      _id: 1,
      caption: 1,
      image: 1,
      video: 1,
      mediaType: 1,
      likes: 1,
      comments: 1,
      engagementScore: 1,
      createdAt: 1,
      "user._id": 1,
      "user.username": 1,
      "user.fullName": 1,
      "user.profilePicture": 1,
    },
  },
]);
```

## Use Cases

### 1. Discover New Content

Users có thể khám phá content hot từ những người họ chưa follow

### 2. Content Creators

Creators có cơ hội được exposed với audience rộng hơn nếu content có engagement tốt

### 3. Trending Topics

Dễ dàng nhận biết topics/hashtags đang trending thông qua explore feed

## Performance Considerations

### Index Requirements

```typescript
// Index cho createdAt để filter nhanh
{ createdAt: -1 }

// Compound index cho engagement metrics
{ likes: -1, comments: -1, createdAt: -1 }
```

### Caching Strategy

- Cache explore results 5-10 phút
- Vì score thay đổi không quá thường xuyên
- Giảm load trên database

## Future Enhancements

### 1. Personalized Explore

- Dựa trên interests/categories user thường xem
- Machine learning để recommend content relevant

### 2. Multiple Tabs

- Top (engagement score)
- Recent (newest posts)
- Categories (travel, food, fashion, etc.)

### 3. Video Priority

- Có thể boost videos vì có engagement rate cao hơn

### 4. Decay Factor

- Giảm score theo thời gian để ưu tiên content mới hơn
- Posts càng cũ càng có score penalty

## Implementation Files

- Service: `src/services/post.service.ts` (getExplorePosts method)
- Controller: `src/controllers/post.controller.ts` (getExplorePosts method)
- Route: `src/routes/post.route.ts` (GET /explore)
