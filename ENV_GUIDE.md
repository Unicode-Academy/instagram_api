# ENV Configuration Guide

## How to Setup .env File

1. Copy the template:

```bash
cp .env.example .env
```

2. Edit the `.env` file and fill in the required values (marked with \*\*)

---

## Environment Variables Reference

### Server Configuration

```env
# Server port (default: 5000)
PORT=5000

# Node environment (development, production, test)
NODE_ENV=development
```

### Database Configuration (REQUIRED)

```env
# MongoDB connection string
# Examples:
# - Local: mongodb://localhost:27017/instagram_api
# - Atlas: mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
#
# IMPORTANT: Bạn tự điền DATABASE_URL!
DATABASE_URL=mongodb://localhost:27017/instagram_api
```

### JWT Configuration

```env
# Secret key for signing access tokens (change in production!)
# Recommend: Use a strong random string (min 32 characters)
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# Access token expiration time
# Format: number + unit (d, h, m, s)
# Examples: 7d, 24h, 60m, 3600s
JWT_EXPIRE=7d

# Secret key for signing refresh tokens (change in production!)
JWT_REFRESH_SECRET=your_refresh_token_secret_here_change_in_production

# Refresh token expiration time
JWT_REFRESH_EXPIRE=30d
```

### Redis Configuration

```env
# Redis host (localhost for local, or provider hostname)
REDIS_HOST=localhost

# Redis port (default: 6379)
REDIS_PORT=6379

# Redis password (leave empty if no password)
REDIS_PASSWORD=
```

### Google OAuth Configuration (Optional)

```env
# Google Cloud Client ID
# Get from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your_google_client_id

# Google Cloud Client Secret
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth callback URL
# Must match the authorized redirect URI in Google Cloud Console
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Frontend Configuration

```env
# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:3000
```

---

## Getting Required Values

### MongoDB Connection String

#### Option 1: Local MongoDB

```env
DATABASE_URL=mongodb://localhost:27017/instagram_api
```

**Setup:**

```bash
# macOS (using Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install -y mongodb
sudo systemctl start mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

#### Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create account & login
3. Create a project
4. Create a cluster (M0 free tier)
5. Create database user (username & password)
6. Get connection string from "Connect" button
7. Copy the connection string

**Example Atlas URL:**

```env
DATABASE_URL=mongodb+srv://username:password@cluster0.abc123.mongodb.net/instagram_api?retryWrites=true&w=majority
```

### Redis Connection

#### Option 1: Local Redis

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

**Setup:**

```bash
# macOS (using Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# Windows (using WSL)
# Run Windows Subsystem for Linux then follow Ubuntu steps
```

#### Option 2: Redis Cloud

1. Go to https://redis.io/try-free/
2. Create account & login
3. Create a database
4. Copy connection details

**Example Redis Cloud URL:**

```env
REDIS_HOST=redis-xxxxx.c12345.us-east-1-2.ec2.cloud.redis.io
REDIS_PORT=12345
REDIS_PASSWORD=your_redis_password
```

### Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create new project
3. Go to "Credentials" → "Create Credentials" → "OAuth Client ID"
4. Choose "Web application"
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID & Client Secret

**Example:**

```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrst
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

## JWT Secret Generation

Generate strong random secrets:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using Python
python -c "import secrets; print(secrets.token_hex(32))"

# Using bash
head -c 32 /dev/urandom | base64
```

---

## Environment Examples

### Development Environment (.env)

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=mongodb://localhost:27017/instagram_api

JWT_SECRET=7a9f8c2b4d1e6a3f8c5d2e9a7f4b1c6e3d8a2f5b9c1e4d7a0f3c6b9e2a5d8
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=9f3e1c5b2d8a7f4e1d6c9a2b5f8e3a7d1c4b9e2f6a3d7c0e5b8f2a9d4c1e
JWT_REFRESH_EXPIRE=30d

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

FRONTEND_URL=http://localhost:3000
```

### Production Environment

```env
PORT=5000
NODE_ENV=production

DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/instagram_api?retryWrites=true&w=majority

JWT_SECRET=use_strong_random_secret_from_above
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=use_strong_random_secret_from_above
JWT_REFRESH_EXPIRE=30d

REDIS_HOST=redis-xxxxx.c12345.us-east-1-2.ec2.cloud.redis.io
REDIS_PORT=12345
REDIS_PASSWORD=actual_redis_password

GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback

FRONTEND_URL=https://yourdomain.com
```

---

## Validation

After setting up `.env`, verify with:

```bash
# Check if env file exists
ls -la .env

# Verify MongoDB connection
mongosh "mongodb://localhost:27017"

# Verify Redis connection
redis-cli ping
# Should respond: PONG

# Test API startup
npm run dev
# Should show: Server is running on port 5000
```

---

## Troubleshooting

### "Cannot find module 'dotenv'"

```bash
npm install dotenv
```

### "DATABASE_URL is not defined"

- Make sure `.env` file exists in project root
- Make sure `DATABASE_URL` is set in `.env`
- Make sure MongoDB is running
- Check for typos in variable name

### "Redis connection error"

- Make sure Redis is running (`redis-cli ping`)
- Check REDIS_HOST and REDIS_PORT are correct
- If using Redis Cloud, verify password is correct

### "JWT verification failed"

- Make sure JWT_SECRET and JWT_REFRESH_SECRET are set
- Do not change JWT_SECRET after tokens are generated
- Check token has not expired

---

## Security Best Practices

1. **Never commit .env file** - Add to .gitignore
2. **Use strong secrets** - Generate with random bytes
3. **Rotate secrets regularly** - In production, refresh monthly
4. **Use different secrets for each environment** - Dev, staging, prod
5. **Store secrets securely** - Use services like AWS Secrets Manager, HashiCorp Vault
6. **Never share secrets** - Don't commit to git or share in chat
7. **Use HTTPS in production** - Required for secure token transmission
8. **Enable CORS only for trusted domains** - Don't use wildcard "\*"

---

## Common Issues & Solutions

| Issue                      | Solution                                               |
| -------------------------- | ------------------------------------------------------ |
| PORT already in use        | Change PORT or kill process: `lsof -i :5000`           |
| MongoDB refuses connection | Start MongoDB: `brew services start mongodb-community` |
| Redis connection timeout   | Start Redis: `brew services start redis`               |
| Token invalid error        | Ensure JWT_SECRET matches between requests             |
| CORS errors                | Check FRONTEND_URL and CORS configuration              |
| .env not loading           | Restart server after .env changes                      |

---

## Additional Resources

- Environment files: https://12factor.net/config
- JWT: https://jwt.io/
- MongoDB: https://docs.mongodb.com/
- Redis: https://redis.io/docs/
- Google OAuth: https://developers.google.com/identity/protocols/oauth2

---

**Last Updated: January 14, 2026**
