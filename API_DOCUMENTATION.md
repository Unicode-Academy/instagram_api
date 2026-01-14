# Instagram API - Complete Documentation

## 1. Base URL

```
https://instagram.f8team.dev/api
```

---

## 2. Response Success Example

Tất cả response thành công đều có format:

```json
{
  "success": true,
  "message": "Success message here",
  "data": {
    // Response data object
  }
}
```

**Status Codes:**

- `200` - OK (GET requests)
- `201` - Created (POST requests)
- `204` - No Content (DELETE requests)

---

## 3. Response Error Example

Tất cả response lỗi đều có format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**Common Error Status Codes:**

- `400` - Bad Request (Invalid input)
- `401` - Unauthorized (Missing or invalid token)
- `403` - Forbidden (No permission)
- `404` - Not Found (Resource not found)
- `409` - Conflict (Duplicate resource)
- `500` - Internal Server Error

**Authentication Error Example:**

```json
{
  "success": false,
  "message": "Unauthorized - Token is required"
}
```

**Validation Error Example:**

```json
{
  "success": false,
  "message": "Email is required"
}
```

---

## 4. API Endpoints

### Authentication

#### 4.1. Register

**Mô tả:** Đăng ký tài khoản mới

**Endpoint:** `POST /api/auth/register`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "fullName": "John Doe"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "isVerified": false,
      "createdAt": "2026-01-14T10:00:00Z"
    }
  }
}
```

**Ví dụ:**

```bash
curl -X POST https://instagram.f8team.dev/api/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "fullName": "John Doe"
  }'
```

---

#### 4.2. Login

**Mô tả:** Đăng nhập vào hệ thống

**Endpoint:** `POST /api/auth/login`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "profilePicture": "https://...",
      "bio": "Photography enthusiast"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Ví dụ:**

```bash
curl -X POST https://instagram.f8team.dev/api/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

---

#### 4.3. Refresh Token

**Mô tả:** Làm mới access token khi hết hạn

**Endpoint:** `POST /api/auth/refresh-token`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### 4.4. Logout

**Mô tả:** Đăng xuất khỏi hệ thống

**Endpoint:** `POST /api/auth/logout`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

#### 4.5. Verify Email

**Mô tả:** Xác thực email sau khi đăng ký

**Endpoint:** `POST /api/auth/verify-email/:token`

**URL Parameters:**

- `token` - Verification token từ email

**Response (200):**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "johndoe",
      "isVerified": true
    }
  }
}
```

---

#### 4.6. Resend Verification Email

**Mô tả:** Gửi lại email xác thực

**Endpoint:** `POST /api/auth/resend-verification-email`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Verification email sent successfully",
  "data": null
}
```

---

#### 4.7. Forgot Password

**Mô tả:** Yêu cầu reset mật khẩu

**Endpoint:** `POST /api/auth/forgot-password`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password reset email sent successfully",
  "data": null
}
```

---

#### 4.8. Reset Password

**Mô tả:** Đặt lại mật khẩu mới

**Endpoint:** `POST /api/auth/reset-password/:token`

**URL Parameters:**

- `token` - Reset token từ email

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": null
}
```

---

#### 4.9. Change Password

**Mô tả:** Đổi mật khẩu khi đã đăng nhập

**Endpoint:** `POST /api/auth/change-password`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

---

### User Management

#### 4.10. Get Current User Profile

**Mô tả:** Lấy thông tin profile của user hiện tại

**Endpoint:** `GET /api/users/profile`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "profilePicture": "https://...",
    "bio": "Photography enthusiast",
    "website": "https://johndoe.com",
    "gender": "male",
    "isVerified": true,
    "createdAt": "2026-01-01T10:00:00Z"
  }
}
```

---

#### 4.11. Update Profile

**Mô tả:** Cập nhật thông tin profile

**Endpoint:** `PATCH /api/users/profile`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**

- `fullName` (string, optional)
- `bio` (string, optional)
- `website` (string, optional)
- `gender` (string, optional): "male" | "female" | "other"
- `profilePicture` (file, optional): Image file

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "fullName": "John Doe Updated",
    "profilePicture": "https://.../new-avatar.jpg",
    "bio": "Updated bio",
    "website": "https://newwebsite.com"
  }
}
```

**Ví dụ:**

```bash
curl -X PATCH https://instagram.f8team.dev/api/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "fullName=John Doe" \
  -F "bio=Photography enthusiast" \
  -F "profilePicture=@/path/to/image.jpg"
```

---

#### 4.12. Delete Profile Picture

**Mô tả:** Xóa ảnh đại diện

**Endpoint:** `DELETE /api/users/profile/picture`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile picture deleted successfully",
  "data": null
}
```

---

#### 4.13. Get User By ID

**Mô tả:** Lấy thông tin user theo ID

**Endpoint:** `GET /api/users/:userId`

**URL Parameters:**

- `userId` - ID của user

**Headers:**

```
Authorization: Bearer <access_token> (optional)
```

**Response (200):**

```json
{
  "success": true,
  "message": "User found",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "fullName": "John Doe",
    "profilePicture": "https://...",
    "bio": "Photography enthusiast",
    "website": "https://johndoe.com",
    "followersCount": 1250,
    "followingCount": 380,
    "isFollowing": false,
    "postsCount": 145,
    "createdAt": "2026-01-01T10:00:00Z"
  }
}
```

**Ví dụ:**

```bash
curl https://instagram.f8team.dev/api/api/users/507f1f77bcf86cd799439011
```

---

#### 4.14. Search Users

**Mô tả:** Tìm kiếm users theo username, email, fullName hoặc caption trong posts

**Endpoint:** `GET /api/users/search`

**Query Parameters:**

- `q` (required): Từ khóa tìm kiếm

**Response (200):**

```json
{
  "success": true,
  "message": "Users found",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "profilePicture": "https://...",
      "bio": "Travel photographer",
      "website": "https://johndoe.com"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "username": "travel_lover",
      "email": "travel@example.com",
      "fullName": "Travel Lover",
      "profilePicture": "https://...",
      "bio": "Exploring the world 🌍"
    }
  ]
}
```

**Ví dụ:**

```bash
curl "https://instagram.f8team.dev/api/api/users/search?q=travel"
```

---

#### 4.15. Get Suggested Users

**Mô tả:** Lấy danh sách users được gợi ý (chưa follow)

**Endpoint:** `GET /api/users/suggested`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `limit` (optional): Số users mỗi trang (default: 10)

**Response (200):**

```json
{
  "success": true,
  "message": "Suggested users retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "fullName": "John Doe",
      "profilePicture": "https://...",
      "bio": "Photography enthusiast",
      "postsCount": 145,
      "followersCount": 1250,
      "followingCount": 380,
      "isFollowing": false,
      "recentImages": [
        "https://.../post1.jpg",
        "https://.../post2.jpg",
        "https://.../post3.jpg"
      ]
    }
  ]
}
```

---

### Posts

#### 4.16. Get Newsfeed

**Mô tả:** Lấy danh sách tất cả posts (newsfeed), sorted by newest

**Endpoint:** `GET /api/posts/feed`

**Query Parameters:**

- `limit` (optional): Số posts mỗi trang (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**

```json
{
  "success": true,
  "message": "Newsfeed retrieved successfully",
  "data": {
    "posts": [
      {
        "_id": "607f1f77bcf86cd799439012",
        "caption": "Beautiful sunset!",
        "image": "https://.../post.jpg",
        "video": null,
        "mediaType": "image",
        "likes": 245,
        "comments": 18,
        "createdAt": "2026-01-14T10:00:00Z",
        "user": {
          "_id": "507f1f77bcf86cd799439011",
          "username": "johndoe",
          "fullName": "John Doe",
          "profilePicture": "https://..."
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalPosts": 200,
      "hasMore": true
    }
  }
}
```

**Ví dụ:**

```bash
curl "https://instagram.f8team.dev/api/api/posts/feed?limit=20&offset=0"
```

---

#### 4.17. Get Explore Posts

**Mô tả:** Lấy danh sách posts trending (engagement score cao)

**Endpoint:** `GET /api/posts/explore`

**Query Parameters:**

- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số posts mỗi trang (default: 20)

**Response (200):**

```json
{
  "success": true,
  "message": "Explore posts retrieved successfully",
  "data": {
    "posts": [
      {
        "_id": "607f1f77bcf86cd799439012",
        "caption": "Amazing sunset at the beach!",
        "image": "https://.../post.jpg",
        "video": null,
        "mediaType": "image",
        "likes": 150,
        "comments": 45,
        "engagementScore": 240,
        "createdAt": "2026-01-10T15:30:00Z",
        "user": {
          "_id": "507f1f77bcf86cd799439011",
          "username": "travel_lover",
          "fullName": "Travel Lover",
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

**Ví dụ:**

```bash
curl "https://instagram.f8team.dev/api/api/posts/explore?page=1&limit=20"
```

---

#### 4.18. Get User Posts

**Mô tả:** Lấy danh sách posts của một user

**Endpoint:** `GET /api/posts/user/:userId`

**URL Parameters:**

- `userId` - ID của user

**Query Parameters:**

- `filter` (optional): "all" | "video" | "saved" (default: "all")
- `limit` (optional): Số posts mỗi trang (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Headers:**

```
Authorization: Bearer <access_token> (required for filter=saved)
```

**Response (200):**

```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "data": {
    "posts": [
      {
        "_id": "607f1f77bcf86cd799439012",
        "caption": "My latest photo",
        "image": "https://.../post.jpg",
        "video": null,
        "mediaType": "image",
        "likes": 89,
        "comments": 12,
        "createdAt": "2026-01-14T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalPosts": 95,
      "hasMore": true
    }
  }
}
```

**Ví dụ:**

```bash
# Get all posts
curl "https://instagram.f8team.dev/api/api/posts/user/507f1f77bcf86cd799439011?filter=all"

# Get only videos
curl "https://instagram.f8team.dev/api/api/posts/user/507f1f77bcf86cd799439011?filter=video"

# Get saved posts (requires auth)
curl "https://instagram.f8team.dev/api/api/posts/user/507f1f77bcf86cd799439011?filter=saved" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 4.19. Get User Post Stats

**Mô tả:** Lấy thống kê posts của user

**Endpoint:** `GET /api/posts/user/:userId/stats`

**URL Parameters:**

- `userId` - ID của user

**Response (200):**

```json
{
  "success": true,
  "message": "Post statistics retrieved successfully",
  "data": {
    "totalPosts": 95,
    "totalLikes": 4523,
    "totalComments": 876,
    "totalVideos": 12,
    "totalImages": 83
  }
}
```

---

#### 4.20. Get Post Details

**Mô tả:** Lấy chi tiết một post (bao gồm comments)

**Endpoint:** `GET /api/posts/:postId`

**URL Parameters:**

- `postId` - ID của post

**Response (200):**

```json
{
  "success": true,
  "message": "Post details retrieved successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439012",
    "caption": "Beautiful sunset!",
    "image": "https://.../post.jpg",
    "video": null,
    "mediaType": "image",
    "likes": 245,
    "comments": 18,
    "createdAt": "2026-01-14T10:00:00Z",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "fullName": "John Doe",
      "profilePicture": "https://..."
    }
  }
}
```

**Ví dụ:**

```bash
curl https://instagram.f8team.dev/api/api/posts/607f1f77bcf86cd799439012
```

---

#### 4.21. Create Post

**Mô tả:** Tạo post mới với ảnh hoặc video

**Endpoint:** `POST /api/posts`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**

- `file` (file, required): Image or video file
- `caption` (string, optional): Post caption

**Response (201):**

```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "caption": "Beautiful day!",
    "image": "https://.../post.jpg",
    "video": null,
    "mediaType": "image",
    "likes": 0,
    "comments": 0,
    "createdAt": "2026-01-14T10:00:00Z"
  }
}
```

**Ví dụ:**

```bash
curl -X POST https://instagram.f8team.dev/api/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "caption=Beautiful day!"
```

---

#### 4.22. Update Post

**Mô tả:** Cập nhật caption của post

**Endpoint:** `PATCH /api/posts/:postId`

**URL Parameters:**

- `postId` - ID của post

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

**Response (200):**

```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439012",
    "caption": "Updated caption",
    "image": "https://.../post.jpg",
    "updatedAt": "2026-01-14T11:00:00Z"
  }
}
```

---

#### 4.23. Delete Post

**Mô tả:** Xóa post

**Endpoint:** `DELETE /api/posts/:postId`

**URL Parameters:**

- `postId` - ID của post

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Post deleted successfully",
  "data": null
}
```

---

#### 4.24. Like Post

**Mô tả:** Like một post

**Endpoint:** `POST /api/posts/:postId/like`

**URL Parameters:**

- `postId` - ID của post

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
    "_id": "607f1f77bcf86cd799439012",
    "likes": 246
  }
}
```

---

#### 4.25. Unlike Post

**Mô tả:** Unlike một post

**Endpoint:** `DELETE /api/posts/:postId/like`

**URL Parameters:**

- `postId` - ID của post

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
    "_id": "607f1f77bcf86cd799439012",
    "likes": 245
  }
}
```

---

#### 4.26. Save Post

**Mô tả:** Lưu post vào collection

**Endpoint:** `POST /api/posts/:postId/save`

**URL Parameters:**

- `postId` - ID của post

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Post saved successfully",
  "data": null
}
```

---

#### 4.27. Unsave Post

**Mô tả:** Bỏ lưu post

**Endpoint:** `DELETE /api/posts/:postId/save`

**URL Parameters:**

- `postId` - ID của post

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Post unsaved successfully",
  "data": null
}
```

---

### Comments

#### 4.28. Get Post Comments

**Mô tả:** Lấy danh sách comments của một post

**Endpoint:** `GET /api/posts/:postId/comments`

**URL Parameters:**

- `postId` - ID của post

**Query Parameters:**

- `limit` (optional): Số comments mỗi trang (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**

```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": {
    "comments": [
      {
        "_id": "607f1f77bcf86cd799439020",
        "postId": "607f1f77bcf86cd799439012",
        "userId": {
          "_id": "507f1f77bcf86cd799439012",
          "username": "jane_smith",
          "profilePicture": "https://..."
        },
        "content": "Amazing photo!",
        "parentCommentId": null,
        "likes": 12,
        "repliesCount": 3,
        "createdAt": "2026-01-14T10:05:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalComments": 35,
      "hasMore": true
    }
  }
}
```

**Ví dụ:**

```bash
curl "https://instagram.f8team.dev/api/api/posts/607f1f77bcf86cd799439012/comments?limit=20"
```

---

#### 4.29. Create Comment

**Mô tả:** Tạo comment mới trên post

**Endpoint:** `POST /api/posts/:postId/comments`

**URL Parameters:**

- `postId` - ID của post

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "content": "Amazing photo!",
  "parentCommentId": null
}
```

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
      "profilePicture": "https://..."
    },
    "content": "Amazing photo!",
    "parentCommentId": null,
    "likes": 0,
    "createdAt": "2026-01-14T10:05:00Z"
  }
}
```

**Ví dụ:**

```bash
curl -X POST https://instagram.f8team.dev/api/api/posts/607f1f77bcf86cd799439012/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Amazing photo!"}'
```

---

#### 4.30. Get Comment Replies

**Mô tả:** Lấy danh sách replies của một comment

**Endpoint:** `GET /api/posts/:postId/comments/:commentId/replies`

**URL Parameters:**

- `postId` - ID của post
- `commentId` - ID của comment

**Query Parameters:**

- `limit` (optional): Số replies mỗi trang (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**

```json
{
  "success": true,
  "message": "Replies retrieved successfully",
  "data": {
    "replies": [
      {
        "_id": "607f1f77bcf86cd799439021",
        "postId": "607f1f77bcf86cd799439012",
        "userId": {
          "_id": "507f1f77bcf86cd799439013",
          "username": "alex_park",
          "profilePicture": "https://..."
        },
        "content": "I agree!",
        "parentCommentId": "607f1f77bcf86cd799439020",
        "likes": 5,
        "createdAt": "2026-01-14T10:10:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalReplies": 3,
      "hasMore": false
    }
  }
}
```

---

#### 4.31. Create Reply

**Mô tả:** Tạo reply cho một comment

**Endpoint:** `POST /api/posts/:postId/comments/:commentId/replies`

**URL Parameters:**

- `postId` - ID của post
- `commentId` - ID của comment cha

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "content": "I agree!"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Reply created successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439021",
    "postId": "607f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439013",
      "username": "alex_park",
      "profilePicture": "https://..."
    },
    "content": "I agree!",
    "parentCommentId": "607f1f77bcf86cd799439020",
    "likes": 0,
    "createdAt": "2026-01-14T10:10:00Z"
  }
}
```

---

#### 4.32. Update Comment

**Mô tả:** Cập nhật nội dung comment

**Endpoint:** `PATCH /api/posts/:postId/comments/:commentId`

**URL Parameters:**

- `postId` - ID của post
- `commentId` - ID của comment

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
    "updatedAt": "2026-01-14T11:00:00Z"
  }
}
```

---

#### 4.33. Delete Comment

**Mô tả:** Xóa comment

**Endpoint:** `DELETE /api/posts/:postId/comments/:commentId`

**URL Parameters:**

- `postId` - ID của post
- `commentId` - ID của comment

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Comment deleted successfully",
  "data": null
}
```

---

#### 4.34. Like Comment

**Mô tả:** Like một comment

**Endpoint:** `POST /api/posts/:postId/comments/:commentId/like`

**URL Parameters:**

- `postId` - ID của post
- `commentId` - ID của comment

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
    "_id": "607f1f77bcf86cd799439020",
    "likes": 13
  }
}
```

---

#### 4.35. Unlike Comment

**Mô tả:** Unlike một comment

**Endpoint:** `DELETE /api/posts/:postId/comments/:commentId/like`

**URL Parameters:**

- `postId` - ID của post
- `commentId` - ID của comment

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
    "_id": "607f1f77bcf86cd799439020",
    "likes": 12
  }
}
```

---

### Follow System

#### 4.36. Follow User

**Mô tả:** Follow một user

**Endpoint:** `POST /api/follow/:userId/follow`

**URL Parameters:**

- `userId` - ID của user muốn follow

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "User followed successfully",
  "data": null
}
```

**Ví dụ:**

```bash
curl -X POST https://instagram.f8team.dev/api/api/follow/507f1f77bcf86cd799439011/follow \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 4.37. Unfollow User

**Mô tả:** Unfollow một user

**Endpoint:** `DELETE /api/follow/:userId/follow`

**URL Parameters:**

- `userId` - ID của user muốn unfollow

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "User unfollowed successfully",
  "data": null
}
```

---

#### 4.38. Get Followers

**Mô tả:** Lấy danh sách followers của một user

**Endpoint:** `GET /api/follow/:userId/followers`

**URL Parameters:**

- `userId` - ID của user

**Query Parameters:**

- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số users mỗi trang (default: 20)

**Response (200):**

```json
{
  "success": true,
  "message": "Followers retrieved successfully",
  "data": {
    "followers": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "username": "jane_smith",
        "fullName": "Jane Smith",
        "profilePicture": "https://...",
        "bio": "Travel lover 🌍"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalFollowers": 195,
      "hasMore": true
    }
  }
}
```

**Ví dụ:**

```bash
curl "https://instagram.f8team.dev/api/api/follow/507f1f77bcf86cd799439011/followers?page=1&limit=20"
```

---

#### 4.39. Get Following

**Mô tả:** Lấy danh sách users mà user này đang follow

**Endpoint:** `GET /api/follow/:userId/following`

**URL Parameters:**

- `userId` - ID của user

**Query Parameters:**

- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số users mỗi trang (default: 20)

**Response (200):**

```json
{
  "success": true,
  "message": "Following retrieved successfully",
  "data": {
    "following": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "username": "alex_park",
        "fullName": "Alex Park",
        "profilePicture": "https://...",
        "bio": "Photography enthusiast"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalFollowing": 87,
      "hasMore": true
    }
  }
}
```

---

### Search History

#### 4.40. Add Search History

**Mô tả:** Lưu lại lịch sử tìm kiếm khi user click vào kết quả

**Endpoint:** `POST /api/search-history`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "searchedUserId": "507f1f77bcf86cd799439011",
  "searchQuery": "travel"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Search history saved successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439030",
    "userId": "507f1f77bcf86cd799439012",
    "searchedUserId": "507f1f77bcf86cd799439011",
    "searchQuery": "travel",
    "createdAt": "2026-01-14T10:00:00Z"
  }
}
```

---

#### 4.41. Get Search History

**Mô tả:** Lấy lịch sử tìm kiếm của user

**Endpoint:** `GET /api/search-history`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `limit` (optional): Số items mỗi trang (default: 20)

**Response (200):**

```json
{
  "success": true,
  "message": "Search history retrieved successfully",
  "data": [
    {
      "_id": "607f1f77bcf86cd799439030",
      "searchQuery": "travel",
      "searchedUser": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "travel_lover",
        "fullName": "Travel Lover",
        "profilePicture": "https://..."
      },
      "createdAt": "2026-01-14T10:00:00Z"
    }
  ]
}
```

---

#### 4.42. Delete Search History Item

**Mô tả:** Xóa một item trong lịch sử tìm kiếm

**Endpoint:** `DELETE /api/search-history/:historyId`

**URL Parameters:**

- `historyId` - ID của search history item

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Search history deleted successfully",
  "data": null
}
```

---

#### 4.43. Clear All Search History

**Mô tả:** Xóa toàn bộ lịch sử tìm kiếm

**Endpoint:** `DELETE /api/search-history`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "All search history cleared successfully",
  "data": null
}
```

---

### Direct Messages (Chat)

#### 4.44. Get Conversations

**Mô tả:** Lấy danh sách các cuộc hội thoại của user

**Endpoint:** `GET /api/messages/conversations`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số conversations mỗi trang (default: 20)

**Response (200):**

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

---

#### 4.45. Create or Get Conversation

**Mô tả:** Tạo conversation mới hoặc lấy conversation hiện có với một user

**Endpoint:** `POST /api/messages/conversations`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "userId": "507f1f77bcf86cd799439011"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Conversation retrieved successfully",
  "data": {
    "_id": "conv_id",
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
    "lastMessage": null,
    "lastMessageAt": "2026-01-14T10:00:00Z",
    "createdAt": "2026-01-14T10:00:00Z"
  }
}
```

**Ví dụ:**

```bash
curl -X POST https://instagram.f8team.dev/api/api/messages/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "507f1f77bcf86cd799439011"}'
```

---

#### 4.46. Get Messages in Conversation

**Mô tả:** Lấy tất cả messages trong một conversation (tự động mark as read)

**Endpoint:** `GET /api/messages/conversations/:conversationId/messages`

**URL Parameters:**

- `conversationId` - ID của conversation

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số messages mỗi trang (default: 50)

**Response (200):**

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

---

#### 4.47. Send Text Message

**Mô tả:** Gửi tin nhắn văn bản

**Endpoint:** `POST /api/messages/messages`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "conversationId": "conv_id",
  "recipientId": "507f1f77bcf86cd799439011",
  "messageType": "text",
  "content": "Hello! How are you?"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "msg_id",
    "conversationId": "conv_id",
    "senderId": {
      "_id": "user2_id",
      "username": "jane_smith",
      "fullName": "Jane Smith",
      "profilePicture": "https://..."
    },
    "recipientId": "507f1f77bcf86cd799439011",
    "messageType": "text",
    "content": "Hello! How are you?",
    "isRead": false,
    "createdAt": "2026-01-14T10:30:00Z"
  }
}
```

**Ví dụ:**

```bash
curl -X POST https://instagram.f8team.dev/api/api/messages/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv_id",
    "recipientId": "507f1f77bcf86cd799439011",
    "messageType": "text",
    "content": "Hello!"
  }'
```

---

#### 4.48. Send Image Message

**Mô tả:** Gửi tin nhắn ảnh

**Endpoint:** `POST /api/messages/messages`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**

- `conversationId` (string): ID của conversation
- `recipientId` (string): ID của người nhận
- `messageType` (string): "image"
- `image` (file): Image file

**Response (201):**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "msg_id",
    "conversationId": "conv_id",
    "senderId": {
      "_id": "user2_id",
      "username": "jane_smith",
      "fullName": "Jane Smith",
      "profilePicture": "https://..."
    },
    "recipientId": "507f1f77bcf86cd799439011",
    "messageType": "image",
    "imageUrl": "https://.../uploads/image.jpg",
    "isRead": false,
    "createdAt": "2026-01-14T10:35:00Z"
  }
}
```

**Ví dụ:**

```bash
curl -X POST https://instagram.f8team.dev/api/api/messages/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "conversationId=conv_id" \
  -F "recipientId=507f1f77bcf86cd799439011" \
  -F "messageType=image" \
  -F "image=@/path/to/image.jpg"
```

---

#### 4.49. Mark Message as Read

**Mô tả:** Đánh dấu tin nhắn là đã đọc

**Endpoint:** `PUT /api/messages/messages/:messageId/read`

**URL Parameters:**

- `messageId` - ID của message

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Message marked as read",
  "data": {
    "_id": "msg_id",
    "isRead": true
  }
}
```

---

#### 4.50. Get Unread Count

**Mô tả:** Lấy tổng số tin nhắn chưa đọc

**Endpoint:** `GET /api/messages/unread-count`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Unread count retrieved",
  "data": {
    "unreadCount": 15
  }
}
```

---

## Socket.IO Realtime Events

### Connection Setup

```javascript
import io from "socket.io-client";

const socket = io("https://instagram.f8team.dev/api", {
  auth: {
    token: yourJWTToken,
  },
});

socket.on("connect", () => {
  console.log("Connected to chat server");
});
```

### Events

#### Receive New Message

```javascript
socket.on("new_message", (message) => {
  // message object with all fields
  console.log("New message:", message);
});
```

#### Typing Indicator

```javascript
// Send typing
socket.emit("typing", {
  conversationId: "conv_id",
  recipientId: "user_id",
});

// Send stop typing
socket.emit("stop_typing", {
  conversationId: "conv_id",
  recipientId: "user_id",
});

// Receive typing
socket.on("user_typing", ({ conversationId, userId }) => {
  console.log("User is typing...");
});

// Receive stop typing
socket.on("user_stop_typing", ({ conversationId, userId }) => {
  console.log("User stopped typing");
});
```

---

## Authentication Flow

### 1. Register → Verify Email → Login

```bash
# Step 1: Register
POST /api/auth/register
# User receives email with verification link

# Step 2: Verify Email
POST /api/auth/verify-email/:token
# Account activated

# Step 3: Login
POST /api/auth/login
# Receive access token and refresh token
```

### 2. Using Access Token

```bash
# Include in Authorization header for all protected endpoints
Authorization: Bearer <access_token>
```

### 3. Refresh Token When Expired

```bash
# When access token expires (401 error)
POST /api/auth/refresh-token
Body: { "refreshToken": "..." }
# Receive new access token and refresh token
```

---

## File Upload Endpoints

### Endpoints supporting file upload:

1. **Update Profile** - `PATCH /api/users/profile`
   - Field name: `profilePicture`
   - Accepts: Image files (jpg, jpeg, png, gif)
   - Max size: 5MB

2. **Create Post** - `POST /api/posts`
   - Field name: `file`
   - Accepts: Image or video files
   - Max size: 50MB

3. **Send Image Message** - `POST /api/messages/messages`
   - Field name: `image`
   - Accepts: Image files
   - Max size: 10MB

**File Upload Format:**

```
Content-Type: multipart/form-data
```

---

## Pagination

Hầu hết các endpoint trả về list đều support pagination:

**Query Parameters:**

- `page` - Trang hiện tại (default: 1)
- `limit` - Số items mỗi trang (default: 20)
- `offset` - Alternative to page (default: 0)

**Response Format:**

```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 195,
    "hasMore": true
  }
}
```

---

## Common Use Cases

### 1. User Registration Flow

```
POST /api/auth/register
  → POST /api/auth/verify-email/:token
  → POST /api/auth/login
  → GET /api/users/profile
```

### 2. Create Post Flow

```
POST /api/auth/login
  → POST /api/posts (with file upload)
  → GET /api/posts/feed (verify post appears)
```

### 3. Social Interaction Flow

```
GET /api/posts/feed
  → POST /api/posts/:postId/like
  → POST /api/posts/:postId/comments
  → POST /api/follow/:userId/follow
```

### 4. Direct Message Flow

```
GET /api/users/search?q=username
  → POST /api/messages/conversations (with userId)
  → POST /api/messages/messages (send message)
  → Socket.IO: receive 'new_message' event
```

### 5. Explore & Discover Flow

```
GET /api/posts/explore
  → GET /api/posts/:postId
  → GET /api/users/:userId
  → POST /api/follow/:userId/follow
```

---
