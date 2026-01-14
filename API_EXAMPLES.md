# API Examples

## Base URL

```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "john_doe",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "username": "john_doe"
  },
  "success": true
}
```

---

### 2. Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Response (200):**

```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe",
      "profilePicture": null
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "success": true
}
```

---

### 3. Refresh Access Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response (200):**

```json
{
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "success": true
}
```

---

### 4. Logout User

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200):**

```json
{
  "message": "Logout successful",
  "success": true
}
```

---

## User Endpoints

### 1. Get Current User Profile

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200):**

```json
{
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": "https://...",
    "bio": "Software Engineer from Vietnam",
    "isVerified": false,
    "createdAt": "2024-01-14T10:00:00Z",
    "updatedAt": "2024-01-14T10:00:00Z"
  },
  "success": true
}
```

---

### 2. Update User Profile

```bash
curl -X PATCH http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Full Stack Developer | JavaScript | Vietnam",
    "profilePicture": "https://..."
  }'
```

**Response (200):**

```json
{
  "message": "Profile updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": "https://...",
    "bio": "Full Stack Developer | JavaScript | Vietnam",
    "isVerified": false,
    "createdAt": "2024-01-14T10:00:00Z",
    "updatedAt": "2024-01-14T10:05:00Z"
  },
  "success": true
}
```

---

### 3. Get User by ID

```bash
curl -X GET http://localhost:5000/api/users/507f1f77bcf86cd799439011
```

**Response (200):**

```json
{
  "message": "User retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": "https://...",
    "bio": "Full Stack Developer",
    "isVerified": false,
    "createdAt": "2024-01-14T10:00:00Z",
    "updatedAt": "2024-01-14T10:05:00Z"
  },
  "success": true
}
```

---

### 4. Search Users

```bash
curl -X GET "http://localhost:5000/api/users/search?q=john"
```

**Response (200):**

```json
{
  "message": "Users found",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe",
      "profilePicture": "https://...",
      "bio": "Full Stack Developer"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "email": "johnny@example.com",
      "username": "johnny_2024",
      "firstName": "Johnny",
      "lastName": "Smith",
      "profilePicture": "https://...",
      "bio": "Designer & Developer"
    }
  ],
  "success": true
}
```

---

## Health Check

### Check API Status

```bash
curl -X GET http://localhost:5000/health
```

**Response (200):**

```json
{
  "status": "OK",
  "timestamp": "2024-01-14T10:00:00.000Z"
}
```

---

## Error Responses

### Validation Error

```json
{
  "message": "Validation error",
  "errors": {
    "email": ["Valid email is required"],
    "password": [
      "Password must be at least 8 characters long",
      "Password must contain at least one uppercase letter"
    ]
  },
  "success": false
}
```

### Unauthorized Error

```json
{
  "message": "Invalid or expired access token",
  "success": false
}
```

### Not Found Error

```json
{
  "message": "User not found",
  "success": false
}
```

### Server Error

```json
{
  "message": "Internal server error",
  "success": false
}
```

---

## Testing with Postman

### 1. Import Collection

Create a new Postman collection with the endpoints above.

### 2. Environment Variables

Set up a Postman environment with:

```json
{
  "baseUrl": "http://localhost:5000/api",
  "accessToken": "",
  "refreshToken": ""
}
```

### 3. Setup Scripts

In Register/Login request, add post-request script:

```javascript
if (pm.response.code === 201 || pm.response.code === 200) {
  const data = pm.response.json();
  if (data.data?.tokens) {
    pm.environment.set("accessToken", data.data.tokens.accessToken);
    pm.environment.set("refreshToken", data.data.tokens.refreshToken);
  }
}
```

### 4. Use Variables

In protected requests, set Authorization header:

```
Authorization: Bearer {{accessToken}}
```

---

## Testing with REST Client (VS Code)

Create `api.rest` file:

```rest
### Health Check
GET http://localhost:5000/health

### Register User
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "username": "testuser",
  "password": "TestPass123",
  "confirmPassword": "TestPass123"
}

### Login User
@token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPass123"
}

### Get Profile
GET http://localhost:5000/api/users/profile
Authorization: Bearer @token
```

---

## Testing with cURL Script

Create `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"

# Register
echo "=== Testing Register ==="
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }')
echo $REGISTER_RESPONSE | jq .

# Login
echo -e "\n=== Testing Login ==="
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }')
echo $LOGIN_RESPONSE | jq .

# Extract tokens
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.tokens.accessToken')

# Get Profile
echo -e "\n=== Testing Get Profile ==="
curl -s -X GET $BASE_URL/users/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
```

Run with:

```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Valid example:** `SecurePass123`
**Invalid examples:**

- `pass123` (no uppercase)
- `Password` (no number)
- `Pass1` (too short)

---

## JWT Token Structure

Access Token expires in 7 days.
Refresh Token expires in 30 days and is stored in Redis.

Decode JWT at https://jwt.io to see payload:

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "john@example.com",
  "iat": 1705234800,
  "exp": 1706000000
}
```
