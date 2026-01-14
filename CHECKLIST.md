# Instagram API - Setup Checklist

## ✅ Hoàn thành

- [x] Project structure with TypeScript
- [x] Express.js setup
- [x] MongoDB integration
- [x] Redis integration
- [x] JWT Authentication (Access Token + Refresh Token)
- [x] User model with bcrypt password hashing
- [x] Authentication middleware
- [x] Error handling middleware
- [x] API response standardization
- [x] Input validation utilities
- [x] Authentication service & controller
- [x] User management service & controller
- [x] Auth routes (register, login, logout, refresh)
- [x] User routes (profile, search, update)
- [x] Environment configuration
- [x] Security headers (helmet)
- [x] CORS setup
- [x] Health check endpoint

## 📋 TODO - Next Steps

### 1. Database & Server Setup

- [ ] Cài đặt MongoDB (Local hoặc Atlas)
- [ ] Cài đặt Redis (Local hoặc Cloud)
- [ ] Cấu hình DATABASE_URL trong .env
- [ ] Chạy `npm install`
- [ ] Chạy `npm run dev`

### 2. Testing Authentication

- [ ] Test POST /api/auth/register
- [ ] Test POST /api/auth/login
- [ ] Test POST /api/auth/refresh-token
- [ ] Test GET /api/users/profile (với Bearer token)
- [ ] Test POST /api/auth/logout

### 3. Google OAuth Setup (Optional)

- [ ] Tạo Google Cloud project
- [ ] Lấy Google Client ID & Secret
- [ ] Cấu hình callback URL
- [ ] Cập nhật .env với Google credentials
- [ ] Implement Passport.js Google strategy

### 4. Post Management (Phase 2)

- [ ] Tạo Post model (title, content, image, likes, comments)
- [ ] Tạo PostController
- [ ] Tạo post routes (create, read, update, delete, list)
- [ ] Tạo PostService

### 5. Comments & Replies (Phase 2)

- [ ] Tạo Comment model
- [ ] Tạo comment endpoints
- [ ] Implement nested replies

### 6. Follow/Followers (Phase 2)

- [ ] Tạo Follow relationship model
- [ ] Implement follow/unfollow endpoints
- [ ] Get followers/following list

### 7. Likes & Bookmarks (Phase 2)

- [ ] Implement post likes
- [ ] Implement bookmarks
- [ ] Get likes count

### 8. Messages/Chat (Phase 2)

- [ ] Tạo Message model
- [ ] Implement direct messaging
- [ ] Real-time chat với WebSocket (Socket.io)

### 9. Notifications (Phase 3)

- [ ] Implement notification system
- [ ] Notifications cho likes, comments, follows
- [ ] Real-time notifications

### 10. File Upload (Phase 3)

- [ ] Multer setup
- [ ] Upload images to cloud (AWS S3 / Cloudinary)
- [ ] Optimize images
- [ ] Video support (optional)

### 11. Advanced Features (Phase 3)

- [ ] Search/hashtags
- [ ] Explore/discovery
- [ ] User recommendations
- [ ] Analytics dashboard

### 12. DevOps & Deployment (Phase 4)

- [ ] Docker setup
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Deploy to Heroku/Railway/Render
- [ ] Production environment setup
- [ ] Database backups
- [ ] Monitoring & logging

### 13. API Documentation

- [ ] Swagger/OpenAPI documentation
- [ ] Postman collection
- [ ] API changelog

## 📁 Files Created

```
instagram_api/
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
├── README.md                # Project overview
├── SETUP.md                 # Detailed setup guide
├── CHECKLIST.md             # This file
└── src/
    ├── index.ts             # Application entry point
    ├── config/
    │   ├── database.ts      # MongoDB connection
    │   └── redis.ts         # Redis connection
    ├── controllers/
    │   ├── auth.controller.ts
    │   └── user.controller.ts
    ├── middleware/
    │   ├── auth.ts          # JWT authentication middleware
    │   └── errorHandler.ts  # Global error handler
    ├── models/
    │   └── User.ts          # User MongoDB schema
    ├── routes/
    │   ├── auth.route.ts    # Auth endpoints
    │   └── user.route.ts    # User endpoints
    ├── services/
    │   └── auth.service.ts  # Auth business logic
    ├── types/
    │   └── index.ts         # TypeScript interfaces
    └── utils/
        ├── jwt.ts           # JWT utilities
        ├── validation.ts    # Input validation
        └── response.ts      # Response formatting
```

## 🚀 Quick Start Commands

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env file (set DATABASE_URL)
# nano .env  or  code .env

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev

# 5. Test API
curl http://localhost:5000/health
```

## 📝 Current API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Users

- `GET /api/users/profile` - Get current user profile
- `PATCH /api/users/profile` - Update profile
- `GET /api/users/:userId` - Get user by ID
- `GET /api/users/search?q=query` - Search users

### System

- `GET /health` - Health check

## 🔐 Security Checklist

- [x] Password hashing with bcryptjs
- [x] JWT token management
- [x] CORS enabled
- [x] Helmet security headers
- [x] Input validation
- [x] Error handling
- [ ] Rate limiting (TODO)
- [ ] Request logging (TODO)
- [ ] SQL injection prevention (N/A - using Mongoose)
- [ ] XSS protection (TODO)
- [ ] CSRF protection (TODO)
- [ ] Environment variables for secrets (Done)

## 📞 Support & Troubleshooting

See [SETUP.md](./SETUP.md) for detailed troubleshooting guide.

## 🎯 Development Tips

1. Use `npm run dev` for development
2. Use `npm run lint` to check code quality
3. Use `npm run format` to format code
4. Keep API responses consistent
5. Use TypeScript strict mode
6. Document API changes in CHANGELOG
7. Test endpoints with Postman or REST Client

## 📚 Resources

- Express.js: https://expressjs.com/
- TypeScript: https://www.typescriptlang.org/
- MongoDB: https://www.mongodb.com/
- Redis: https://redis.io/
- JWT: https://jwt.io/
- Passport.js: https://www.passportjs.org/

---

Last Updated: January 14, 2026
