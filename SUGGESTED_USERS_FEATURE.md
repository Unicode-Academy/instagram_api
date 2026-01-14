# Suggested Users Feature

## Overview

Tính năng "Suggested for you" giúp users khám phá những accounts mới để follow. Hệ thống đề xuất users dựa trên popularity (số followers) và loại trừ những người đã follow.

## Algorithm

### Selection Criteria

1. **Exclude Current User**: Không suggest chính mình
2. **Exclude Following**: Loại bỏ users đã follow
3. **Sort by Popularity**: Ưu tiên users có nhiều followers
4. **Include Preview**: Hiển thị 3 ảnh mới nhất của mỗi user

### Sorting Logic

```
Sort by: followersCount DESC
```

**Lý do prioritize by followers:**

- Users với nhiều followers thường có content quality cao
- Popular accounts có credibility cao hơn
- Tạo value cho users mới, giúp họ quickly discover quality content

## API Endpoint

**Endpoint:** `GET /api/users/suggested`

**Description:** Lấy danh sách users được đề xuất để follow

**Headers:**

- `Authorization: Bearer <token>` (required)

**Query Parameters:**

- `limit` (optional): Số users trả về (default: 10, max recommended: 50)

**Example Request:**

```
GET /api/users/suggested?limit=20
```

**Response:**

```json
{
  "success": true,
  "message": "Suggested users retrieved",
  "data": [
    {
      "_id": "user_id_1",
      "username": "travel_lover",
      "fullName": "Travel Lover",
      "profilePicture": "https://.../profile.jpg",
      "postsCount": 156,
      "followersCount": 2450,
      "followingCount": 890,
      "recentImages": [
        "https://.../post1.jpg",
        "https://.../post2.jpg",
        "https://.../post3.jpg"
      ],
      "isFollowing": false
    },
    {
      "_id": "user_id_2",
      "username": "foodie_jane",
      "fullName": "Jane Smith",
      "profilePicture": "https://.../profile2.jpg",
      "postsCount": 89,
      "followersCount": 1820,
      "followingCount": 450,
      "recentImages": ["https://.../food1.jpg", "https://.../food2.jpg"],
      "isFollowing": false
    }
  ]
}
```

**Field Descriptions:**

- `_id`: User ID
- `username`: Tên username
- `fullName`: Tên đầy đủ
- `profilePicture`: URL ảnh đại diện
- `postsCount`: Tổng số posts của user
- `followersCount`: Số người follow user này
- `followingCount`: Số người user này đang follow
- `recentImages`: Array chứa URL của 3 ảnh mới nhất (có thể ít hơn 3 nếu user có ít posts)
- `isFollowing`: `false` (luôn false vì đã filter ra users chưa follow)

## Implementation Details

### Data Collection Process

#### Step 1: Get Following List

```typescript
// Get users that current user is already following
const following = await Follow.find({
  followerId: currentUserId,
}).select("followingId");

const followingIds = following.map((f) => f.followingId.toString());
```

#### Step 2: Query Suggested Users

```typescript
// Get users not following yet (exclude self)
const suggestedUsers = await User.find({
  _id: {
    $nin: [currentUserId, ...followingIds],
  },
})
  .select("username fullName profilePicture")
  .limit(limit)
  .lean();
```

#### Step 3: Aggregate Additional Data

For each suggested user, collect:

**Posts Count:**

```typescript
const postsCount = await Post.countDocuments({
  userId: userId,
});
```

**Followers Count:**

```typescript
const followersCount = await Follow.countDocuments({
  followingId: userId,
});
```

**Following Count:**

```typescript
const followingCount = await Follow.countDocuments({
  followerId: userId,
});
```

**Recent Images:**

```typescript
const latestPosts = await Post.find({ userId })
  .select("image video mediaType")
  .sort({ createdAt: -1 })
  .limit(3)
  .lean();

// Extract URLs (prefer image over video)
const recentImages = latestPosts
  .map((post) => post.image || post.video)
  .filter((url) => url !== null)
  .slice(0, 3);
```

#### Step 4: Sort by Popularity

```typescript
usersWithInfo.sort((a, b) => b.followersCount - a.followersCount);
```

## Use Cases

### 1. Home Feed Sidebar

Display suggested users in sidebar while browsing feed

```typescript
// In home feed component
const { data: suggestions } = useSuggestedUsers(5);

<aside>
  <h3>Suggestions For You</h3>
  {suggestions.map(user => (
    <SuggestedUserCard key={user._id} user={user} />
  ))}
</aside>
```

### 2. Explore Page

Dedicated section for discovering new accounts

```typescript
// In explore page
const { data: suggestions } = useSuggestedUsers(20);

<section className="suggested-users-grid">
  {suggestions.map(user => (
    <UserCard user={user} showRecentPosts />
  ))}
</section>
```

### 3. After Following Someone

Show more suggestions after user follows someone

```typescript
const handleFollow = async (userId) => {
  await followUser(userId);
  // Refresh suggestions
  refetchSuggestions();
};
```

### 4. Empty Following State

Show suggestions when user hasn't followed anyone yet

```typescript
{followingCount === 0 && (
  <EmptyState
    title="Start following people"
    description="Here are some suggestions"
    suggestions={suggestedUsers}
  />
)}
```

## Frontend Integration

### Suggested User Card Component

```typescript
const SuggestedUserCard = ({ user }) => {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);

  const handleFollow = async () => {
    try {
      await api.post(`/api/follow/${user._id}/follow`);
      setIsFollowing(true);
      toast.success(`Now following ${user.username}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="suggested-user-card">
      <img
        src={user.profilePicture}
        alt={user.username}
        className="profile-picture"
      />
      <div className="user-info">
        <h4>{user.username}</h4>
        <p>{user.fullName}</p>
        <div className="stats">
          <span>{user.postsCount} posts</span>
          <span>{user.followersCount} followers</span>
        </div>
      </div>

      {/* Preview images */}
      {user.recentImages.length > 0 && (
        <div className="recent-images">
          {user.recentImages.map((img, idx) => (
            <img key={idx} src={img} alt="Recent post" />
          ))}
        </div>
      )}

      <button
        onClick={handleFollow}
        disabled={isFollowing}
        className={isFollowing ? "btn-following" : "btn-follow"}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
};
```

### React Hook

```typescript
const useSuggestedUsers = (limit = 10) => {
  return useQuery(
    ["suggestedUsers", limit],
    () =>
      api.get(`/api/users/suggested?limit=${limit}`).then((res) => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};
```

### Sidebar Component

```typescript
const SuggestionsSidebar = () => {
  const { data: suggestions, isLoading } = useSuggestedUsers(5);

  if (isLoading) return <Skeleton count={5} />;

  return (
    <div className="suggestions-sidebar">
      <div className="header">
        <h3>Suggestions For You</h3>
        <Link to="/explore/people">See All</Link>
      </div>

      {suggestions?.map(user => (
        <div key={user._id} className="suggestion-item">
          <Link to={`/${user.username}`}>
            <img src={user.profilePicture} alt={user.username} />
            <div>
              <p className="username">{user.username}</p>
              <p className="followers">{user.followersCount} followers</p>
            </div>
          </Link>
          <FollowButton userId={user._id} />
        </div>
      ))}
    </div>
  );
};
```

### Grid Layout (Explore Page)

```typescript
const SuggestedUsersGrid = () => {
  const [limit, setLimit] = useState(20);
  const { data: suggestions } = useSuggestedUsers(limit);

  return (
    <div className="suggested-grid">
      {suggestions?.map(user => (
        <div key={user._id} className="user-card">
          <Link to={`/${user.username}`}>
            <img
              src={user.profilePicture}
              className="profile-pic"
            />
            <h3>{user.username}</h3>
            <p>{user.fullName}</p>
          </Link>

          <div className="stats">
            <div>
              <strong>{user.postsCount}</strong>
              <span>posts</span>
            </div>
            <div>
              <strong>{user.followersCount}</strong>
              <span>followers</span>
            </div>
            <div>
              <strong>{user.followingCount}</strong>
              <span>following</span>
            </div>
          </div>

          {/* 3 recent images preview */}
          <div className="recent-posts">
            {user.recentImages.map((img, idx) => (
              <img key={idx} src={img} />
            ))}
          </div>

          <FollowButton userId={user._id} />
        </div>
      ))}

      {suggestions?.length >= limit && (
        <button onClick={() => setLimit(limit + 20)}>
          Load More
        </button>
      )}
    </div>
  );
};
```

## Performance Considerations

### Current Performance

- **Query Time**: ~100-300ms (depends on limit)
  - Get following IDs: ~10-20ms
  - Query users: ~20-50ms
  - Aggregate data (per user): ~50-100ms
  - Sort: ~5ms

### Bottlenecks

- Multiple database queries per user (posts count, followers, following, recent posts)
- Can be slow with large limit values

### Optimization Strategies

#### 1. Aggregation Pipeline (Recommended)

```typescript
// Use single aggregation query instead of multiple queries
User.aggregate([
  // Match criteria
  { $match: { _id: { $nin: [...] } } },

  // Lookup posts count
  {
    $lookup: {
      from: "posts",
      localField: "_id",
      foreignField: "userId",
      as: "posts"
    }
  },
  { $addFields: { postsCount: { $size: "$posts" } } },

  // Lookup followers
  {
    $lookup: {
      from: "follows",
      localField: "_id",
      foreignField: "followingId",
      as: "followers"
    }
  },
  { $addFields: { followersCount: { $size: "$followers" } } },

  // Sort and limit
  { $sort: { followersCount: -1 } },
  { $limit: limit }
]);
```

#### 2. Caching

```typescript
// Cache suggestions for 10 minutes per user
const cacheKey = `suggested:${userId}:${limit}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const suggestions = await getSuggestedUsers(userId, limit);
await redis.setex(cacheKey, 600, JSON.stringify(suggestions));
```

#### 3. Pre-computed Counts

```typescript
// Store counts directly in User model
User Schema:
{
  postsCount: Number,
  followersCount: Number,
  followingCount: Number
}

// Update counts with hooks or scheduled jobs
```

#### 4. Pagination

```typescript
// For large result sets, implement cursor-based pagination
GET /api/users/suggested?limit=10&cursor=user_id_10
```

## Business Logic

### Exclusion Rules

1. **Self Exclusion**: Current user never appears in suggestions
2. **Already Following**: Users already followed are excluded
3. **Blocked Users**: Should exclude blocked users (future enhancement)
4. **Private Accounts**: Could filter based on privacy settings

### Ranking Factors (Current)

- **Primary**: Followers count (DESC)

### Future Ranking Enhancements

```typescript
// Weighted score
score = (followersCount × 0.5) +
        (postsCount × 0.2) +
        (engagementRate × 0.3)

// Personalization factors
- Mutual followers
- Similar interests (hashtags, categories)
- Geographic location
- Recent activity
- Content type preferences
```

## Privacy & Security

### Data Protection

- Only public profile information shown
- Password excluded from responses
- Private account posts not included in recent images

### Rate Limiting (Recommended)

```typescript
// Limit: 30 requests per minute
// Prevent API abuse
```

## Analytics & Tracking

### Metrics to Track

1. **Impression**: How many times suggestion shown
2. **Click-through Rate**: Profile visits from suggestions
3. **Follow Rate**: Percentage of follows from suggestions
4. **Engagement**: Likes/comments on suggested users' posts

### Implementation

```typescript
// Track suggestion view
trackEvent("suggestion_viewed", {
  suggestedUserId: user._id,
  position: index,
  source: "sidebar",
});

// Track follow from suggestion
trackEvent("suggestion_followed", {
  suggestedUserId: user._id,
  followersCount: user.followersCount,
});
```

## Future Enhancements

### 1. Personalized Suggestions

```typescript
// Based on mutual follows
- "Followed by user_x and 5 others you follow"
- Weight users with more mutual connections higher

// Based on interests
- Analyze hashtags current user interacts with
- Suggest users posting similar content
```

### 2. Category-Based Suggestions

```typescript
GET /api/users/suggested?category=travel&limit=10
// Suggest users in specific categories
```

### 3. Trending Users

```typescript
// Recently gained many followers
- Track follower growth rate
- Boost users with high growth

// Viral posts
- Users with recent viral content
```

### 4. Follow-Back Suggestions

```typescript
// Suggest users who follow you but you don't follow back
GET / api / users / suggested / follow - back;
```

### 5. Similar Users

```typescript
// Based on user you just followed
GET /api/users/suggested/similar/:userId
// "People similar to @travel_lover"
```

### 6. Local Suggestions

```typescript
// Based on location
- Suggest nearby users
- Regional popular accounts
```

### 7. Refresh Mechanism

```typescript
// Allow users to refresh suggestions
POST / api / users / suggested / refresh;
// Dismiss current suggestions, get new ones
```

### 8. Dismiss Suggestions

```typescript
// Hide specific users from suggestions
POST /api/users/suggested/dismiss/:userId
// "Not interested"
```

### 9. ML-Based Recommendations

```typescript
// Machine learning model
- Collaborative filtering
- Content-based filtering
- Hybrid approach
```

### 10. A/B Testing

```typescript
// Test different algorithms
- Pure popularity
- Mutual follows weighted
- Engagement-based
- ML recommendations
```

## Testing Scenarios

### 1. Basic Functionality

- User with 0 following → Returns popular users
- User following 50 users → Returns others
- User following all users → Returns empty array

### 2. Data Accuracy

- Verify postsCount matches actual posts
- Verify followersCount matches actual followers
- Verify followingCount matches actual following
- Verify recentImages are actually most recent

### 3. Exclusions

- Current user never in suggestions
- Following users never in suggestions
- After following, user removed from suggestions

### 4. Sorting

- Results sorted by followersCount DESC
- User with 1000 followers before user with 500

### 5. Limit Parameter

- limit=5 → returns max 5 users
- limit=100 → returns max 100 users
- No limit → defaults to 10

### 6. Edge Cases

- New user with 0 followers → Still appears
- User with 0 posts → recentImages empty array
- User with 1 post → recentImages has 1 item
- All suggested users have < 3 posts

### 7. Performance

- Response time < 500ms for limit=10
- Response time < 2s for limit=50

## Implementation Files

- Service: `src/services/user.service.ts` (getSuggestedUsers method)
- Controller: `src/controllers/user.controller.ts` (getSuggestedUsers method)
- Route: `src/routes/user.route.ts` (GET /suggested)

## Related Features

- [Follow Feature](FOLLOW_FEATURE.md) - Required for exclusions
- [Search Users](SEARCH_USERS_FEATURE.md) - Alternative discovery method
- [Explore Feature](EXPLORE_FEATURE.md) - Content discovery
