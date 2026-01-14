# Instagram API Setup Guide

## Cài đặt Dependencies

```bash
npm install
```

## Cấu hình Environment Variables

1. Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

2. Điền các biến môi trường (bạn cần tự điền DATABASE_URL):

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/instagram_api  # ← Bạn tự điền URL MongoDB

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_here_change_in_production
JWT_REFRESH_EXPIRE=30d

# Redis (cho refresh tokens)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OAuth Google (optional, để trống nếu không dùng)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Chuẩn bị Database

### MongoDB

```bash
# Nếu dùng MongoDB Local
mongod

# Hoặc dùng MongoDB Atlas:
# 1. Tạo tài khoản tại https://www.mongodb.com/cloud/atlas
# 2. Tạo cluster và lấy connection string
# 3. Điền vào DATABASE_URL trong .env
```

### Redis

```bash
# Nếu dùng Redis Local
redis-server

# Hoặc dùng Redis Cloud:
# 1. Tạo tài khoản tại https://redis.io/
# 2. Tạo instance và lấy connection details
# 3. Cập nhật REDIS_HOST, REDIS_PORT, REDIS_PASSWORD trong .env
```

## Chạy Server

### Development Mode

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:5000`

### Build Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication Endpoints

#### 1. Register (Đăng ký)

**POST** `/api/auth/register`

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "data": {
    "_id": "...",
    "email": "user@example.com",
    "username": "username"
  },
  "success": true
}
```

#### 2. Login (Đăng nhập)

**POST** `/api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "username": "username",
      "firstName": "",
      "lastName": "",
      "profilePicture": null
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  },
  "success": true
}
```

#### 3. Refresh Token

**POST** `/api/auth/refresh-token`

```json
{
  "refreshToken": "..."
}
```

#### 4. Logout (Đăng xuất)

**POST** `/api/auth/logout`

**Headers:**

```
Authorization: Bearer {accessToken}
```

#### 5. Google OAuth

**GET** `/api/auth/google`

Sẽ redirect sang Google login page

**GET** `/api/auth/google/callback`

Google callback endpoint (tự động)

## Authentication Flow

1. **Đăng ký**: POST `/api/auth/register` → Tạo tài khoản mới
2. **Đăng nhập**: POST `/api/auth/login` → Nhận accessToken + refreshToken
3. **Sử dụng API**: Gửi `Authorization: Bearer {accessToken}` trong header
4. **Token hết hạn**: POST `/api/auth/refresh-token` → Lấy access token mới
5. **Đăng xuất**: POST `/api/auth/logout` → Xóa refresh token khỏi Redis

## Response Format

### Success Response

```json
{
  "message": "...",
  "data": {...},
  "success": true
}
```

### Error Response

```json
{
  "message": "...",
  "errors": {
    "fieldName": ["error message"]
  },
  "success": false
}
```

## Cấu trúc Project

```
src/
├── config/           # Database, Redis config
├── controllers/      # Request handlers
├── middleware/       # Auth, Error handling
├── models/          # MongoDB schemas
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Helper functions
└── index.ts         # Entry point
```

## Tiếp theo

- [ ] Tạo endpoints cho User Profile
- [ ] Tạo endpoints cho Posts
- [ ] Tạo endpoints cho Comments
- [ ] Tạo endpoints cho Likes
- [ ] Tạo endpoints cho Follow
- [ ] Tạo endpoints cho Messages
- [ ] Thêm file upload (ảnh/video)
- [ ] Thêm notification system
- [ ] Thêm search functionality
- [ ] Deploy lên production

## Troubleshooting

### MongoDB Connection Error

- Kiểm tra MongoDB service đang chạy
- Kiểm tra DATABASE_URL đúng format
- Kiểm tra network connectivity nếu dùng cloud

### Redis Connection Error

- Kiểm tra Redis service đang chạy
- Kiểm tra REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
- Nếu không có Redis, có thể comment trong config tạm thời

### JWT Token Error

- Kiểm tra JWT_SECRET trong .env
- Token có thể đã hết hạn
- Dùng refresh token để lấy token mới
