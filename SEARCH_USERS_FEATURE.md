# Search Users Feature

## Overview

Tính năng tìm kiếm users với khả năng search vừa theo thông tin user (username, email, fullName) vừa theo nội dung caption trong posts của họ. Kết quả được merge và deduplicate tự động.

## Search Strategy

### Dual Search Approach

1. **Direct User Search**: Tìm users theo username, email, fullName
2. **Caption Search**: Tìm posts theo caption, lấy user IDs
3. **Merge & Deduplicate**: Gộp 2 kết quả, loại bỏ duplicate
4. **Limit Results**: Trả về tối đa 20 users

### Why Caption Search?

- User có thể tìm content creators theo topics họ post
- Ví dụ: Search "travel" → tìm users post về du lịch
- Giống Instagram search behavior

## API Endpoint

**Endpoint:** `GET /api/users/search`

**Query Parameters:**

- `q` (required): Từ khóa tìm kiếm

**Headers:**

- `Authorization: Bearer <token>` (optional)

**Example Request:**

```
GET /api/users/search?q=travel
```

**Response:**

```json
{
  "success": true,
  "message": "Users found",
  "data": [
    {
      "_id": "...",
      "username": "travel_lover",
      "email": "travel@example.com",
      "fullName": "Travel Lover",
      "profilePicture": "https://...",
      "bio": "Exploring the world 🌍",
      "website": "https://travelblog.com",
      "gender": "other"
    },
    {
      "_id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "profilePicture": "https://...",
      "bio": "Photography enthusiast",
      "website": null,
      "gender": "male"
    }
  ]
}
```

## Implementation Details

### Search Logic

```typescript
// 1. Search users directly
const directUsers = await User.find({
  $or: [
    { username: { $regex: q, $options: "i" } },
    { email: { $regex: q, $options: "i" } },
    { fullName: { $regex: q, $options: "i" } },
  ],
})
  .select("-password")
  .lean();

// 2. Search posts by caption
const posts = await Post.find({
  caption: { $regex: q, $options: "i" },
})
  .select("userId")
  .limit(100);

// 3. Get unique user IDs from posts
const userIds = [...new Set(posts.map((post) => post.userId.toString()))];

// 4. Get users from those IDs
const captionUsers = await User.find({
  _id: { $in: userIds },
})
  .select("-password")
  .lean();

// 5. Merge and deduplicate using Map
const allUsers = [...directUsers, ...captionUsers];
const uniqueUsers = Array.from(
  new Map(allUsers.map((user) => [user._id.toString(), user])).values()
).slice(0, 20);
```

### Deduplication Strategy

- Sử dụng `Map` với `_id.toString()` làm key
- Đảm bảo mỗi user chỉ xuất hiện 1 lần
- Giữ instance đầu tiên nếu có duplicate

## Search Examples

### Example 1: Username Match

```
Query: "john"
Result: Users có username chứa "john" (john_doe, johnny_travel, etc.)
```

### Example 2: Caption Match

```
Query: "coffee"
Result: Users có posts về coffee
```

### Example 3: Both Matches

```
Query: "travel"
Result:
- Users có username/email/fullName chứa "travel"
- Users có posts về travel
- Merged và deduplicated
```

### Example 4: Email Match

```
Query: "gmail.com"
Result: Users có email @gmail.com
```

## Performance Considerations

### Index Requirements

```typescript
// User model indexes
{
  username: 1;
}
{
  email: 1;
}
{
  fullName: 1;
}

// Post model indexes
{
  caption: "text";
} // Text index cho full-text search (optional)
{
  caption: 1;
} // Regular index
```

### Query Optimization

- Limit caption search to 100 posts để tránh quá tải
- Sử dụng `.lean()` để tăng performance (return plain JS objects)
- Case-insensitive search với `$options: "i"`

### Response Time

- Direct user search: ~10-50ms
- Caption search: ~50-200ms (depends on posts count)
- Total: Thường < 300ms

## Security & Privacy

### Data Protection

- Password field bị exclude trong response (`select("-password")`)
- Chỉ public profile information được trả về

### Rate Limiting (Recommended)

```typescript
// Recommend: 20 requests per minute per user
// Prevent spam and abuse
```

## Use Cases

### 1. Find Friends

User tìm friends qua username hoặc email

### 2. Discover Content Creators

Tìm creators post về topics cụ thể

### 3. Find Business Accounts

Search keywords related to business/services

### 4. Explore Topics

Tìm users active trong topics cụ thể qua captions

## Future Enhancements

### 1. Hashtag Search

- Extract hashtags from captions
- Separate hashtag index for faster search

### 2. Search Ranking

- Prioritize verified accounts
- Rank by follower count
- Boost recent active users

### 3. Search Filters

- Filter by: verified, location, category
- Sort by: relevance, followers, recent

### 4. Search Suggestions

- Auto-complete suggestions
- Recent searches
- Popular searches

### 5. Full-Text Search

- MongoDB text index cho advanced search
- Fuzzy matching for typos
- Weighted scoring (username > bio > caption)

## Implementation Files

- Controller: `src/controllers/user.controller.ts` (searchUsers method)
- Route: `src/routes/user.route.ts` (GET /search)
- Models: `src/models/User.ts`, `src/models/Post.ts`
