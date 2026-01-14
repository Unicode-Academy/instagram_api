# Follow Feature

## Overview

Hệ thống follow/unfollow giống Instagram, cho phép users theo dõi nhau. Khi xem profile bất kỳ user nào, sẽ hiển thị số followers, following và trạng thái đã follow chưa.

## Database Schema

### Follow Model

```typescript
{
  followerId: ObjectId,      // User đang follow (người theo dõi)
  followingId: ObjectId,     // User được follow (người được theo dõi)
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

- `{ followerId, followingId }` - Unique constraint, prevent duplicate follows
- `{ followingId, createdAt }` - Query followers của user, sorted by time
- `{ followerId, createdAt }` - Query following list của user, sorted by time

## API Endpoints

### 1. Follow User

**Endpoint:** `POST /api/follow/:userId/follow`

**Description:** Follow một user

**Headers:**

- `Authorization: Bearer <token>`

**URL Parameters:**

- `userId`: ID của user muốn follow

**Response:**

```json
{
  "success": true,
  "message": "User followed successfully",
  "data": null
}
```

**Error Responses:**

```json
// Can't follow yourself
{
  "success": false,
  "message": "Cannot follow yourself"
}

// Already following
{
  "success": false,
  "message": "Already following this user"
}
```

### 2. Unfollow User

**Endpoint:** `DELETE /api/follow/:userId/follow`

**Description:** Unfollow một user

**Headers:**

- `Authorization: Bearer <token>`

**URL Parameters:**

- `userId`: ID của user muốn unfollow

**Response:**

```json
{
  "success": true,
  "message": "User unfollowed successfully",
  "data": null
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Not following this user"
}
```

### 3. Get Followers

**Endpoint:** `GET /api/follow/:userId/followers`

**Description:** Lấy danh sách followers của user

**URL Parameters:**

- `userId`: ID của user

**Query Parameters:**

- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số users mỗi trang (default: 20)

**Response:**

```json
{
  "success": true,
  "message": "Followers retrieved successfully",
  "data": {
    "followers": [
      {
        "_id": "...",
        "username": "john_doe",
        "fullName": "John Doe",
        "profilePicture": "https://...",
        "bio": "Photography enthusiast"
      },
      {
        "_id": "...",
        "username": "jane_smith",
        "fullName": "Jane Smith",
        "profilePicture": "https://...",
        "bio": "Travel lover 🌍"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalFollowers": 98,
      "hasMore": true
    }
  }
}
```

### 4. Get Following

**Endpoint:** `GET /api/follow/:userId/following`

**Description:** Lấy danh sách users mà user này đang follow

**URL Parameters:**

- `userId`: ID của user

**Query Parameters:**

- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số users mỗi trang (default: 20)

**Response:**

```json
{
  "success": true,
  "message": "Following retrieved successfully",
  "data": {
    "following": [
      {
        "_id": "...",
        "username": "travel_lover",
        "fullName": "Travel Lover",
        "profilePicture": "https://...",
        "bio": "Exploring the world"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalFollowing": 45,
      "hasMore": true
    }
  }
}
```

### 5. Get User Profile (Updated)

**Endpoint:** `GET /api/users/:userId`

**Description:** Lấy thông tin user, bao gồm follow stats và trạng thái follow

**Headers:**

- `Authorization: Bearer <token>` (optional)

**Response:**

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "profilePicture": "https://...",
    "bio": "Photography enthusiast 📸",
    "website": "https://johndoe.com",
    "gender": "male",
    "followersCount": 150,
    "followingCount": 89,
    "isFollowing": true
  }
}
```

**Field Descriptions:**

- `followersCount`: Số người đang follow user này
- `followingCount`: Số người mà user này đang follow
- `isFollowing`: `true` nếu current user đã follow user này, `false` nếu chưa
  - Chỉ có khi đã login
  - Luôn `false` khi xem profile của chính mình

## Business Logic

### Follow Rules

1. **Cannot Follow Yourself**
   - Không thể follow chính mình
   - API sẽ trả về error 400

2. **No Duplicate Follows**
   - Unique constraint trên database
   - Nếu đã follow, API trả về error "Already following this user"

3. **Must Follow Before Unfollow**
   - Chỉ unfollow được khi đang follow
   - Nếu chưa follow, API trả về error "Not following this user"

### Follow Counts Calculation

```typescript
// Count followers (người follow user này)
followersCount = Follow.count({ followingId: userId });

// Count following (người mà user này follow)
followingCount = Follow.count({ followerId: userId });
```

### isFollowing Check

```typescript
// Check if current user is following target user
if (currentUserId && currentUserId !== targetUserId) {
  isFollowing = Follow.exists({
    followerId: currentUserId,
    followingId: targetUserId,
  });
} else {
  isFollowing = false;
}
```

## User Flows

### 1. Follow Flow

```
User A views User B's profile
  ↓
See "Follow" button (isFollowing: false)
  ↓
Click "Follow"
  ↓
POST /api/follow/:userBId/follow
  ↓
Follow relationship created
  ↓
Button changes to "Following" (isFollowing: true)
  ↓
User B's followersCount increases by 1
User A's followingCount increases by 1
```

### 2. Unfollow Flow

```
User A viewing User B's profile (already following)
  ↓
See "Following" button (isFollowing: true)
  ↓
Click "Unfollow"
  ↓
DELETE /api/follow/:userBId/follow
  ↓
Follow relationship deleted
  ↓
Button changes to "Follow" (isFollowing: false)
  ↓
User B's followersCount decreases by 1
User A's followingCount decreases by 1
```

### 3. View Followers List

```
User clicks "150 followers" on profile
  ↓
GET /api/follow/:userId/followers
  ↓
Display list of users who follow this user
  ↓
Can click on any user to view their profile
  ↓
Pagination for large follower lists
```

### 4. View Following List

```
User clicks "89 following" on profile
  ↓
GET /api/follow/:userId/following
  ↓
Display list of users this user follows
  ↓
Can click on any user to view their profile
  ↓
Pagination for large following lists
```

## Frontend Integration

### Profile Display

```typescript
// Display follow stats
<div className="profile-stats">
  <div onClick={() => navigate(`/followers/${userId}`)}>
    <strong>{followersCount}</strong>
    <span>followers</span>
  </div>
  <div onClick={() => navigate(`/following/${userId}`)}>
    <strong>{followingCount}</strong>
    <span>following</span>
  </div>
</div>

// Follow/Unfollow button
{!isOwnProfile && (
  <button
    onClick={isFollowing ? handleUnfollow : handleFollow}
    className={isFollowing ? "btn-following" : "btn-follow"}
  >
    {isFollowing ? "Following" : "Follow"}
  </button>
)}
```

### Follow/Unfollow Actions

```typescript
const handleFollow = async () => {
  try {
    await api.post(`/api/follow/${userId}/follow`);
    setIsFollowing(true);
    setFollowersCount((prev) => prev + 1);
    toast.success("Followed successfully");
  } catch (error) {
    toast.error(error.message);
  }
};

const handleUnfollow = async () => {
  try {
    await api.delete(`/api/follow/${userId}/follow`);
    setIsFollowing(false);
    setFollowersCount((prev) => prev - 1);
    toast.success("Unfollowed successfully");
  } catch (error) {
    toast.error(error.message);
  }
};
```

### Followers/Following Lists

```typescript
const FollowersList = ({ userId }) => {
  const [followers, setFollowers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadFollowers = async () => {
    const { data } = await api.get(
      `/api/follow/${userId}/followers?page=${page}&limit=20`
    );
    setFollowers(prev => [...prev, ...data.followers]);
    setHasMore(data.pagination.hasMore);
  };

  // Infinite scroll implementation
  useEffect(() => {
    loadFollowers();
  }, [page]);

  return (
    <div className="followers-list">
      {followers.map(user => (
        <UserItem key={user._id} user={user} />
      ))}
      {hasMore && <button onClick={() => setPage(p => p + 1)}>Load More</button>}
    </div>
  );
};
```

## Performance Considerations

### Database Indexes

```typescript
// Optimized queries with indexes
{ followerId: 1, followingId: 1 }  // Unique, fast lookup
{ followingId: 1, createdAt: -1 }  // Get followers sorted
{ followerId: 1, createdAt: -1 }   // Get following sorted
```

### Query Performance

- Follow/Unfollow: ~5-15ms (single write)
- Get followers/following: ~20-50ms (with populate)
- Count followers/following: ~5-10ms (indexed count)
- Check isFollowing: ~5-10ms (indexed exists query)

### Caching Strategy (Future)

```typescript
// Cache follow counts for 5 minutes
const cacheKey = `user:${userId}:followCounts`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const counts = await getFollowCounts(userId);
await redis.setex(cacheKey, 300, JSON.stringify(counts));
```

## Privacy & Security

### Data Protection

- Follow relationships are public (anyone can see)
- Aligned with Instagram's public follow model
- Password excluded from all user responses

### Rate Limiting (Recommended)

```typescript
// Prevent follow spam
// Limit: 50 follow/unfollow actions per hour
```

### Validation

- User must be authenticated to follow/unfollow
- Cannot follow non-existent users (handled by MongoDB ref)
- Cannot follow yourself (explicit check)

## Use Cases

### 1. Social Network Building

Users follow friends, celebrities, brands they're interested in

### 2. Content Curation

Following determines what appears in newsfeed (future)

### 3. Social Proof

High follower count indicates popularity/influence

### 4. Discovery

Users browse followers/following to find new accounts

## Future Enhancements

### 1. Follow Suggestions

- Suggest users based on mutual follows
- "You might know" recommendations
- Similar interests/categories

### 2. Follow Requests (Private Accounts)

```typescript
// For private accounts
- Send follow request
- User approves/rejects
- Pending requests list
```

### 3. Close Friends

```typescript
// Instagram-style close friends
- Mark certain followers as close friends
- Share exclusive content with them
```

### 4. Follow Notifications

```typescript
// Notify when someone follows you
- Real-time notification
- Push notification
- Email notification (optional)
```

### 5. Mutual Follows

```typescript
// Show if you follow each other
followBackStatus: "follows_you" | "mutual" | "none";
```

### 6. Followers You Know

```typescript
// In follower list, highlight:
-"Followed by user_x and 5 others you follow";
```

### 7. Remove Follower

```typescript
// Allow user to remove someone from their followers
DELETE /api/follow/:userId/remove-follower
// Breaks the follow relationship without blocking
```

### 8. Block Feature

```typescript
// Block user (prevents follow + unfollows both ways)
POST /api/users/:userId/block
```

### 9. Follow Analytics

```typescript
// Track follow/unfollow trends
- Follower growth over time
- Most active followers
- Follow/unfollow ratio
```

### 10. Export Followers/Following

```typescript
// Download CSV of followers/following
GET /api/follow/export/followers
GET /api/follow/export/following
```

## Implementation Files

- Model: `src/models/Follow.ts`
- Service: `src/services/follow.service.ts`
- Controller: `src/controllers/follow.controller.ts`
- Routes: `src/routes/follow.route.ts`
- Updated: `src/controllers/user.controller.ts` (getUserById method)
- Index: `src/index.ts` (mounted at `/api/follow`)

## Testing Scenarios

### 1. Follow Success

- User A follows User B
- Verify follow relationship created
- User B's followersCount increases
- User A's followingCount increases
- isFollowing becomes true

### 2. Follow Validation

- Try to follow yourself → Error
- Try to follow twice → Error "Already following"
- Follow non-existent user → Error 404

### 3. Unfollow Success

- User A unfollows User B
- Verify follow relationship deleted
- Counts decrease
- isFollowing becomes false

### 4. Unfollow Validation

- Try to unfollow when not following → Error

### 5. Followers List

- User with 50 followers
- Get page 1 (20 items) → 20 followers
- Get page 2 (20 items) → 20 followers
- Get page 3 (10 items) → 10 followers, hasMore: false

### 6. Profile View

- Logged out user views profile → isFollowing: false
- User A views own profile → isFollowing: false
- User A views User B (following) → isFollowing: true
- User A views User C (not following) → isFollowing: false

### 7. Concurrent Follow

- Multiple users follow same user simultaneously
- All follow relationships created correctly
- followersCount accurate
