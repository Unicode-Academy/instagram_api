# Search History Feature

## Overview

Hệ thống lưu lịch sử tìm kiếm khi user click vào kết quả search. Giúp user nhanh chóng truy cập lại các profiles đã xem trước đó.

## Database Schema

### SearchHistory Model

```typescript
{
  userId: ObjectId,           // User thực hiện search
  searchedUserId: ObjectId,   // User được click vào
  searchQuery: string,        // Từ khóa search ban đầu
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

- `{ userId, createdAt }` - Query history theo user, sorted by time
- `{ userId, searchedUserId }` - Check duplicate searches

## API Endpoints

### 1. Add Search History

**Endpoint:** `POST /api/search-history`

**Description:** Lưu lại khi user click vào kết quả search

**Headers:**

- `Authorization: Bearer <token>`

**Body:**

```json
{
  "searchedUserId": "user_id_that_was_clicked",
  "searchQuery": "travel"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Search history saved",
  "data": {
    "_id": "...",
    "userId": "...",
    "searchedUserId": "...",
    "searchQuery": "travel",
    "createdAt": "2026-01-14T10:30:00Z"
  }
}
```

**Logic:**

- Nếu đã search user này trong 24h → xóa record cũ, tạo mới (update timestamp)
- Nếu chưa search → tạo record mới

### 2. Get Search History

**Endpoint:** `GET /api/search-history`

**Description:** Lấy danh sách lịch sử search của user

**Headers:**

- `Authorization: Bearer <token>`

**Query Parameters:**

- `limit` (optional): Số records trả về (default: 20)

**Response:**

```json
{
  "success": true,
  "message": "Search history retrieved",
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "searchedUserId": {
        "_id": "...",
        "username": "travel_lover",
        "fullName": "Travel Lover",
        "profilePicture": "https://..."
      },
      "searchQuery": "travel",
      "createdAt": "2026-01-14T10:30:00Z"
    },
    {
      "_id": "...",
      "userId": "...",
      "searchedUserId": {
        "_id": "...",
        "username": "foodie_jane",
        "fullName": "Jane Smith",
        "profilePicture": "https://..."
      },
      "searchQuery": "food",
      "createdAt": "2026-01-14T09:15:00Z"
    }
  ]
}
```

### 3. Delete Specific Search History

**Endpoint:** `DELETE /api/search-history/:historyId`

**Description:** Xóa 1 item trong lịch sử search

**Headers:**

- `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Search history deleted",
  "data": null
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Search history not found"
}
```

### 4. Clear All Search History

**Endpoint:** `DELETE /api/search-history`

**Description:** Xóa tất cả lịch sử search của user

**Headers:**

- `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "15 search history items deleted",
  "data": null
}
```

## Business Logic

### Auto-Update on Duplicate

```typescript
// Nếu click lại user đã search trong 24h
const existingHistory = await SearchHistory.findOne({
  userId: currentUserId,
  searchedUserId: clickedUserId,
  createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
});

if (existingHistory) {
  // Xóa record cũ
  await SearchHistory.findByIdAndDelete(existingHistory._id);
}

// Tạo record mới với timestamp hiện tại
await SearchHistory.create({ ... });
```

**Lý do:**

- Keep history list clean
- Move recent searches to top
- Prevent duplicate entries

### Sort Order

- Luôn sort by `createdAt` descending
- Recent searches appear first
- Giống Instagram behavior

### Limit Records

- Default: 20 records
- Có thể customize qua query parameter
- Prevent returning too much data

## User Flow

### 1. Search Flow

```
User types "travel" → Search API returns users
  ↓
User clicks on "travel_lover" profile
  ↓
Frontend calls: POST /api/search-history
  Body: {
    searchedUserId: "travel_lover_id",
    searchQuery: "travel"
  }
  ↓
History saved → User navigates to profile
```

### 2. View History Flow

```
User opens search screen
  ↓
Before typing, show recent searches
  ↓
GET /api/search-history
  ↓
Display list of recently viewed profiles
  ↓
User can click to visit again (no new history created if within 24h)
```

### 3. Delete History Flow

```
User swipes/clicks delete on a history item
  ↓
DELETE /api/search-history/:historyId
  ↓
Item removed from list
```

### 4. Clear All Flow

```
User clicks "Clear all" in settings
  ↓
DELETE /api/search-history
  ↓
All history deleted
```

## Frontend Integration

### Display Search History

```typescript
// Show before user types
useEffect(() => {
  if (searchQuery === "") {
    fetchSearchHistory();
  }
}, [searchQuery]);

// Display format
<div className="search-history">
  <h3>Recent</h3>
  {history.map(item => (
    <div key={item._id} className="history-item">
      <img src={item.searchedUserId.profilePicture} />
      <div>
        <p>{item.searchedUserId.username}</p>
        <small>{item.searchedUserId.fullName}</small>
      </div>
      <button onClick={() => deleteHistory(item._id)}>✕</button>
    </div>
  ))}
  <button onClick={clearAllHistory}>Clear all</button>
</div>
```

### Save History on Click

```typescript
const handleUserClick = async (user, searchQuery) => {
  // Save to history
  await saveSearchHistory(user._id, searchQuery);

  // Navigate to profile
  navigate(`/profile/${user.username}`);
};
```

## Privacy Considerations

### User Control

- Users can delete individual searches
- Users can clear all history
- History is private (only visible to owner)

### Data Retention

- No automatic expiration (user controls deletion)
- Could implement 90-day auto-cleanup (future enhancement)

### Security

- Only owner can view their history
- Authentication required for all endpoints
- Owner validation in delete operations

## Performance Considerations

### Query Optimization

```typescript
// Use compound index
{ userId: 1, createdAt: -1 }

// Efficient query with populate
SearchHistory.find({ userId })
  .sort({ createdAt: -1 })
  .limit(20)
  .populate('searchedUserId', 'username fullName profilePicture')
  .lean()
```

### Expected Performance

- Add history: ~10-30ms
- Get history: ~20-50ms (with populate)
- Delete single: ~10-20ms
- Clear all: ~20-50ms (depends on count)

## Future Enhancements

### 1. Trending Searches

- Aggregate most searched users globally
- Show trending profiles

### 2. Search Suggestions

- Suggest from history as user types
- Autocomplete based on previous searches

### 3. Search Categories

- Group history by: Recent, Frequent, Categories
- Smart categorization

### 4. Search Analytics

- Track what users search most
- Improve search ranking algorithm

### 5. Cross-Device Sync

- Sync history across devices
- Cloud storage integration

### 6. Privacy Modes

- Incognito search (no history saved)
- Auto-clear after session

## Implementation Files

- Model: `src/models/SearchHistory.ts`
- Service: `src/services/searchHistory.service.ts`
- Controller: `src/controllers/searchHistory.controller.ts`
- Routes: `src/routes/searchHistory.route.ts`
- Index: `src/index.ts` (mounted at `/api/search-history`)

## Testing Scenarios

### 1. Basic Flow

- User searches "travel"
- Clicks on user A
- History saved with searchQuery="travel"
- History appears in GET /api/search-history

### 2. Duplicate Handling

- User searches "food", clicks user B (saved)
- Wait 1 hour
- User searches "restaurant", clicks user B again
- Only 1 record exists for user B (newer one)

### 3. Delete Operations

- User has 10 history items
- Delete item ID=5 → 9 items remain
- Clear all → 0 items remain

### 4. Pagination

- User has 50 history items
- GET with limit=10 → returns 10 most recent
- GET with limit=50 → returns all 50
