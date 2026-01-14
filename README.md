# Instagram API

Social media API built with Express.js, TypeScript, MongoDB, JWT, and Redis.

## Features

- ✅ JWT Authentication (Access Token + Refresh Token)
- ✅ Google OAuth Login
- ✅ Redis for session management
- ✅ MongoDB for data storage
- ✅ Input validation
- ✅ Error handling
- ✅ TypeScript support
- ✅ Scalable architecture

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Cache/Session**: Redis
- **Authentication**: JWT + Passport.js
- **Security**: bcryptjs, helmet, cors

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Setup environment variables**

   ```bash
   cp .env.example .env
   # Edit .env and set DATABASE_URL, Redis config, etc.
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

Server will start at `http://localhost:5000`

## API Documentation

See [SETUP.md](./SETUP.md) for detailed API endpoints and documentation.

## Project Structure

```
src/
├── config/          # Database, Redis configuration
├── controllers/     # Request handlers
├── middleware/      # Authentication, error handling
├── models/          # MongoDB schemas
├── routes/          # API route definitions
├── services/        # Business logic layer
├── types/           # TypeScript interfaces
├── utils/           # Helper utilities
└── index.ts         # Application entry point
```

## Available Commands

```bash
# Development
npm run dev          # Start development server with ts-node

# Production
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## Authentication

The API uses JWT-based authentication:

1. **Register** → Create new user account
2. **Login** → Get access token + refresh token (stored in Redis)
3. **Protected Routes** → Use access token in Authorization header
4. **Refresh** → Get new access token using refresh token
5. **Logout** → Invalidate refresh token

Access token expires in 7 days (configurable)
Refresh token expires in 30 days (configurable)

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database (Required)
DATABASE_URL=mongodb://localhost:27017/instagram_api

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=30d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:3000
```

## License

ISC
# instagram_api
