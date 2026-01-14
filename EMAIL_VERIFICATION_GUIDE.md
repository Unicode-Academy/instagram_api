# Email Verification API Guide

Hướng dẫn sử dụng API kích hoạt tài khoản thông qua xác nhận email (Email Verification)

## Overview

Tính năng xác nhận email giúp:

- Xác minh địa chỉ email hợp lệ của user
- Ngăn chặn đăng ký bằng email giả
- Kích hoạt tài khoản sau khi xác nhận
- Cho phép người dùng gửi lại email xác nhận

## API Endpoints

### 1. User Registration (Updated)

Tạo tài khoản mới và tự động gửi email xác nhận

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "fullName": "John Doe",
  "gender": "male",
  "website": "https://example.com"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "username",
    "fullName": "John Doe",
    "gender": "male",
    "website": "https://example.com"
  }
}
```

**Note:** Email xác nhận sẽ được gửi tự động. User không thể login cho đến khi email được xác nhận.

---

### 2. Verify Email

Xác nhận email bằng token từ email link

**Endpoint:** `POST /api/auth/verify-email/:token`

**URL Parameters:**

- `token` - Verification token từ email (required)

**Request Body:** (Empty)

```json
{}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": null
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid or expired verification token",
  "errors": null
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/auth/verify-email/abc123def456...
```

**Postman:**

```
Method: POST
URL: http://localhost:5000/api/auth/verify-email/abc123def456...
Body: (Empty)
```

---

### 3. Resend Verification Email

Gửi lại email xác nhận nếu user không nhận được

**Endpoint:** `POST /api/auth/resend-verification-email`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Verification email sent",
  "data": null
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "User is already verified",
  "errors": null
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/auth/resend-verification-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Postman:**

```
Method: POST
URL: http://localhost:5000/api/auth/resend-verification-email
Body (JSON):
{
  "email": "user@example.com"
}
```

---

## How Email Verification Works

### Step 1: User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!",
    "fullName": "John Doe"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "email": "user@example.com",
    "username": "username",
    "fullName": "John Doe",
    "isVerified": false
  }
}
```

**Backend Actions:**

- ✅ Generate 32-byte random verification token
- ✅ Hash token SHA256 trước khi save
- ✅ Save user với token và expiry (24 giờ)
- ✅ Gửi email xác nhận

### Step 2: User Receives Verification Email

**Email Content:**

```
Subject: Verify Your Email Address

Welcome to Instagram API!

Thank you for signing up. Click the link below to verify your email address:

[Verify Email Button]

Or copy and paste this link in your browser:
http://localhost:3000/verify-email/abc123def456xyz...

This link will expire in 24 hours.

If you didn't create this account, please ignore this email.
```

### Step 3: User Clicks Verification Link

Frontend extracts token từ URL và call endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/verify-email/abc123def456xyz...
```

**Backend Actions:**

- ✅ Hash token nhận được
- ✅ Tìm user với matching token hash
- ✅ Kiểm tra token còn hiệu lực
- ✅ Mark user `isVerified = true`
- ✅ Clear token fields
- ✅ Gửi email xác nhận thành công

### Step 4: User Can Now Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

---

## Validation Rules

### Email Verification

- Phải là email hợp lệ (format check)
- User phải tồn tại trong database
- Token phải hợp lệ và chưa hết hạn (24 giờ)

### Resend Verification Email

- `email` - Phải là email hợp lệ
- User chưa verify (nếu đã verify, sẽ có lỗi)

---

## Token Security

✅ **Token Generation:**

- Random 32-byte token generated với `crypto.randomBytes()`
- Không phải password hash, chỉ random bytes

✅ **Token Storage:**

- Token được hash SHA256 trước khi save vào database
- Database lưu token hash, không lưu token gốc

✅ **Token Expiry:**

- Token hết hạn sau 24 giờ
- Auto-delete token sau xác nhận thành công
- User có thể request resend nếu token hết hạn

✅ **Verification Email:**

- Email được gửi tự động sau registration
- Email chứa link với token gốc (không phải hash)
- User không thể access hệ thống cho đến khi xác nhận

---

## Error Handling

### Common Errors

| Error                                 | Cause                         | Solution                    |
| ------------------------------------- | ----------------------------- | --------------------------- |
| Invalid or expired verification token | Token hết hạn hoặc sai        | Request resend email        |
| User is already verified              | User đã xác nhận email        | Không cần verify lại        |
| User not found with this email        | Email không tồn tại           | Kiểm tra email đã đúng      |
| Email configuration error             | Email service không hoạt động | Kiểm tra .env SMTP settings |

---

## Login Logic After Verification

**Login Flow:**

1. User nhập email & password
2. Backend check email & password đúng
3. Backend check `isVerified === true`
4. Nếu chưa verify → Error "Email not verified"
5. Nếu đã verify → Generate tokens & return success

**Update Login Endpoint (Optional Enhancement):**

```typescript
async login(email: string, password: string) {
  // ... existing validation ...

  const user = await User.findOne({ email });

  // Optional: Check if email verified
  if (!user.isVerified) {
    throw new Error("Please verify your email before login");
  }

  // ... generate tokens ...
}
```

---

## Email Configuration

Để gửi email verification, cần cấu hình SMTP trong `.env`:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM=noreply@instagram-api.com
FRONTEND_URL=http://localhost:3000
```

### Gmail Setup

1. Enable 2-factor authentication: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Copy 16-char password to `.env` EMAIL_PASSWORD

---

## Testing

### Test Complete Flow

**Step 1: Register User**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!",
    "fullName": "Test User"
  }'
```

**Step 2: Check Email for Verification Link**

- Email sẽ chứa link như: `http://localhost:3000/verify-email/token...`

**Step 3: Verify Email (Extract Token từ Email)**

```bash
curl -X POST http://localhost:5000/api/auth/verify-email/extracted_token_here
```

**Step 4: Login (Now Possible)**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```

---

## Files Modified

| File                                 | Changes                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------- |
| `src/models/User.ts`                 | ✏️ Added verificationToken & verificationTokenExpiry fields             |
| `src/services/auth.service.ts`       | ✏️ Updated register() + Added verifyEmail() & resendVerificationEmail() |
| `src/services/email.service.ts`      | ✏️ Added sendVerificationEmail() & sendVerificationSuccess()            |
| `src/controllers/auth.controller.ts` | ✏️ Added verifyEmail() & resendVerificationEmail() handlers             |
| `src/routes/auth.route.ts`           | ✏️ Added 2 new routes                                                   |

---

## Postman Collection

```json
{
  "info": {
    "name": "Instagram API - Email Verification",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register User",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"user@example.com\",\n  \"username\": \"username\",\n  \"password\": \"SecurePassword123!\",\n  \"confirmPassword\": \"SecurePassword123!\",\n  \"fullName\": \"John Doe\"\n}"
        },
        "url": {
          "raw": "{{BASE_URL}}/api/auth/register",
          "host": ["{{BASE_URL}}"],
          "path": ["api", "auth", "register"]
        }
      }
    },
    {
      "name": "Verify Email",
      "request": {
        "method": "POST",
        "url": {
          "raw": "{{BASE_URL}}/api/auth/verify-email/{{VERIFICATION_TOKEN}}",
          "host": ["{{BASE_URL}}"],
          "path": ["api", "auth", "verify-email", "{{VERIFICATION_TOKEN}}"]
        }
      }
    },
    {
      "name": "Resend Verification Email",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"user@example.com\"\n}"
        },
        "url": {
          "raw": "{{BASE_URL}}/api/auth/resend-verification-email",
          "host": ["{{BASE_URL}}"],
          "path": ["api", "auth", "resend-verification-email"]
        }
      }
    }
  ]
}
```

---

## Frontend Integration

### Verification Email Link (Frontend)

URL Format:

```
http://localhost:3000/verify-email/{token}
```

Frontend Should:

1. Extract `token` từ URL
2. Call backend API: `POST /api/auth/verify-email/{token}`
3. Show success/error message
4. Redirect to login nếu thành công

### Example React Component

```typescript
// pages/VerifyEmail.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email/${token}`, {
          method: 'POST',
        });

        if (response.ok) {
          alert('Email verified! You can now login.');
          navigate('/login');
        } else {
          alert('Verification failed. Token may have expired.');
        }
      } catch (error) {
        alert('Error verifying email');
      }
    };

    verify();
  }, [token, navigate]);

  return <div>Verifying email...</div>;
}
```

---

## Features

✅ **Automatic Email Sending** - Verification email tự động gửi sau registration  
✅ **Secure Token** - 32-byte random token, hashed SHA256  
✅ **24-hour Expiry** - Token hết hạn sau 24 giờ  
✅ **Resend Option** - User có thể request resend email  
✅ **Email Templates** - Professional HTML email templates  
✅ **Error Handling** - Detailed error messages  
✅ **Database Storage** - Token fields thêm vào User model

---

## Next Steps

- ✅ Email Verification - COMPLETED
- ⏳ Optional: Require email verification to login
- ⏳ Optional: Email change verification
- ⏳ Optional: Email preferences/notification settings
- ⏳ Posts management (create, read, update, delete)
