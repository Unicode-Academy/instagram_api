# CORS Configuration

## Overview

CORS (Cross-Origin Resource Sharing) đã được cấu hình đầy đủ cho project Instagram API này. Configuration này cho phép frontend apps từ các domains khác nhau có thể gọi API một cách an toàn.

---

## Configuration Details

### Express App CORS

**File:** `src/index.ts`

```typescript
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:3001",
    ];

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      process.env.NODE_ENV === "development"
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
```

**Features:**

- ✅ Dynamic origin validation
- ✅ Allow credentials (cookies, authorization headers)
- ✅ Support all HTTP methods
- ✅ Custom headers support
- ✅ Preflight cache (24 hours)
- ✅ Development mode allows all origins

---

### Socket.IO CORS

**File:** `src/config/socket.ts`

```typescript
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:3001",
];

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === "development" ? "*" : allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
```

**Features:**

- ✅ Separate CORS for Socket.IO
- ✅ Development mode allows all origins
- ✅ Production mode restricts to allowed origins
- ✅ Credentials support for authentication

---

## Environment Variables

Thêm vào file `.env`:

```env
# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

**Production Example:**

```env
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

---

## Allowed Origins (Default)

### Development Mode

```
NODE_ENV=development
```

- ✅ All origins allowed (`*`)
- ✅ No restrictions for testing

### Production Mode

```
NODE_ENV=production
```

- ✅ `http://localhost:3000` (local testing)
- ✅ `http://localhost:3001` (alternative port)
- ✅ `process.env.FRONTEND_URL` (your production domain)

---

## How to Add More Origins

### Method 1: Environment Variable (Recommended)

Update `.env`:

```env
FRONTEND_URL=https://yourdomain.com
```

### Method 2: Edit Allowed Origins Array

Edit `src/index.ts`:

```typescript
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://yourdomain.com", // Add your domain
  "https://app.yourdomain.com", // Add subdomain
  "https://staging.yourdomain.com", // Add staging
];
```

Edit `src/config/socket.ts`:

```typescript
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://yourdomain.com",
  "https://app.yourdomain.com",
];
```

---

## CORS Headers Explained

### `credentials: true`

- Cho phép gửi cookies và authorization headers
- Cần thiết cho JWT authentication
- Frontend phải set `withCredentials: true`

### `methods`

- Các HTTP methods được phép
- `["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]`

### `allowedHeaders`

- Headers được phép trong request
- `["Content-Type", "Authorization"]`

### `exposedHeaders`

- Headers mà frontend được phép đọc
- `["Content-Range", "X-Content-Range"]`

### `maxAge`

- Thời gian cache preflight request
- `86400` = 24 giờ
- Giảm số lượng OPTIONS requests

---

## Frontend Integration

### Axios Example

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // Enable credentials
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Fetch Example

```javascript
const response = await fetch("http://localhost:5000/api/posts/feed", {
  method: "GET",
  credentials: "include", // Enable credentials
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
});
```

### Socket.IO Client Example

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true, // Enable credentials
  auth: {
    token: accessToken,
  },
});
```

---

## Testing CORS

### Test with cURL

```bash
# Test preflight request
curl -X OPTIONS http://localhost:5000/api/posts/feed \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -v

# Test actual request
curl -X GET http://localhost:5000/api/posts/feed \
  -H "Origin: http://localhost:3000" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v
```

### Expected Response Headers

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

---

## Common CORS Errors & Solutions

### Error: "No 'Access-Control-Allow-Origin' header"

**Cause:** Origin not in allowed list

**Solution:**

1. Check `NODE_ENV` is set to `development` for testing
2. Add your origin to `allowedOrigins` array
3. Set `FRONTEND_URL` in `.env`

### Error: "CORS policy: credentials mode is 'include'"

**Cause:** `credentials: true` không được set

**Solution:**

```javascript
// Frontend
fetch(url, { credentials: "include" });
// or
axios.create({ withCredentials: true });
```

### Error: "Response for preflight does not have HTTP ok status"

**Cause:** Server không handle OPTIONS request

**Solution:** CORS middleware đã tự động handle OPTIONS. Kiểm tra server đang chạy và accessible.

### Socket.IO Connection Failed

**Cause:** Socket.IO CORS configuration

**Solution:**

```javascript
// Client
const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket", "polling"],
});
```

---

## Production Deployment

### 1. Update Environment Variables

```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

### 2. Verify Allowed Origins

Check `src/index.ts` và `src/config/socket.ts`:

```typescript
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "https://yourdomain.com",
  "https://www.yourdomain.com",
];
```

### 3. Remove Wildcard in Production

Đảm bảo `NODE_ENV=production` để tránh accept tất cả origins:

```typescript
// Good (Production)
origin: allowedOrigins;

// Bad (Security risk)
origin: "*";
```

### 4. Use HTTPS

```env
FRONTEND_URL=https://yourdomain.com
```

### 5. Update Frontend URLs

```javascript
const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.yourdomain.com"
    : "http://localhost:5000";
```

---

## Security Best Practices

### 1. Never Use `origin: "*"` in Production

```typescript
// BAD - Security risk
cors({ origin: "*" });

// GOOD - Specific origins
cors({ origin: allowedOrigins });
```

### 2. Always Validate Origins

```typescript
if (allowedOrigins.indexOf(origin) !== -1) {
  callback(null, true);
} else {
  callback(new Error("Not allowed by CORS"));
}
```

### 3. Use Environment Variables

```typescript
const allowedOrigins = [process.env.FRONTEND_URL, process.env.MOBILE_APP_URL];
```

### 4. Enable Credentials Only When Needed

```typescript
credentials: true; // Only if using cookies/auth headers
```

### 5. Limit Methods

```typescript
methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]; // Only what you need
```

### 6. Set Appropriate maxAge

```typescript
maxAge: 86400; // 24 hours - balance between performance and flexibility
```

---

## Multiple Frontend Apps

Nếu có nhiều frontend apps (Web, Mobile, Admin):

```typescript
const allowedOrigins = [
  process.env.FRONTEND_WEB_URL || "http://localhost:3000",
  process.env.FRONTEND_MOBILE_URL || "http://localhost:3001",
  process.env.FRONTEND_ADMIN_URL || "http://localhost:3002",
  "https://app.yourdomain.com",
  "https://admin.yourdomain.com",
  "https://mobile.yourdomain.com",
];
```

Environment variables:

```env
FRONTEND_WEB_URL=https://app.yourdomain.com
FRONTEND_MOBILE_URL=https://mobile.yourdomain.com
FRONTEND_ADMIN_URL=https://admin.yourdomain.com
```

---

## Subdomain Wildcards (Advanced)

Nếu muốn allow tất cả subdomains:

```typescript
origin: function (origin, callback) {
  if (!origin) return callback(null, true);

  // Allow all subdomains of yourdomain.com
  if (/^https?:\/\/([a-z0-9-]+\.)*yourdomain\.com$/.test(origin)) {
    callback(null, true);
  } else if (process.env.NODE_ENV === "development") {
    callback(null, true);
  } else {
    callback(new Error("Not allowed by CORS"));
  }
}
```

---

## Monitoring CORS

### Log CORS Requests

```typescript
app.use((req, res, next) => {
  if (req.headers.origin) {
    console.log(`CORS request from: ${req.headers.origin}`);
  }
  next();
});
```

### Track Blocked Origins

```typescript
origin: function (origin, callback) {
  if (allowedOrigins.indexOf(origin) === -1) {
    console.warn(`Blocked CORS request from: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  } else {
    callback(null, true);
  }
}
```

---

## Summary

✅ **CORS đã được cấu hình đầy đủ:**

- Express App CORS với origin validation
- Socket.IO CORS riêng biệt
- Credentials support
- Development/Production modes
- Preflight caching
- Custom headers

✅ **Security:**

- Origin whitelist
- No wildcard in production
- Environment-based configuration

✅ **Flexibility:**

- Easy to add new origins
- Support multiple frontend apps
- Development-friendly

✅ **Ready for:**

- React/Vue/Angular apps
- Mobile apps
- Multiple environments
- Production deployment

---

## Related Files

- `src/index.ts` - Express CORS configuration
- `src/config/socket.ts` - Socket.IO CORS configuration
- `.env.example` - Environment variables template
- `API_DOCUMENTATION.md` - Complete API documentation
