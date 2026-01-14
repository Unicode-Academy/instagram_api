# Forgot Password API Guide

Hướng dẫn sử dụng API quên mật khẩu (Forgot Password & Reset Password)

## Overview

Tính năng này cung cấp 2 endpoint chính:

1. **POST /api/auth/forgot-password** - Gửi email reset link
2. **POST /api/auth/reset-password/:token** - Reset password bằng token

## API Endpoints

### 1. Forgot Password

Gửi email chứa link reset password cho user

**Endpoint:** `POST /api/auth/forgot-password`

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
  "message": "Password reset link sent to your email",
  "data": null
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "User not found with this email",
  "errors": null
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Postman:**

```
Method: POST
URL: http://localhost:5000/api/auth/forgot-password
Body (JSON):
{
  "email": "user@example.com"
}
```

---

### 2. Reset Password

Reset password sử dụng token từ email

**Endpoint:** `POST /api/auth/reset-password/:token`

**URL Parameters:**

- `token` - Reset token từ email link (required)

**Request Body:**

```json
{
  "newPassword": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": null
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid or expired reset token",
  "errors": null
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/auth/reset-password/abc123def456... \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!"
  }'
```

**Postman:**

```
Method: POST
URL: http://localhost:5000/api/auth/reset-password/abc123def456...
Body (JSON):
{
  "newPassword": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

---

## Validation Rules

### Forgot Password

- `email` - Phải là email hợp lệ, user phải tồn tại

### Reset Password

- `newPassword` - Phải đáp ứng yêu cầu:
  - Tối thiểu 8 ký tự
  - Chứa ít nhất 1 chữ số
  - Chứa ít nhất 1 chữ in hoa
  - Chứa ít nhất 1 ký tự đặc biệt (!@#$%^&\*)
- `confirmPassword` - Phải khớp với `newPassword`

---

## Email Configuration

Để gửi email, cần cấu hình SMTP trong `.env`:

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

### Setup với Gmail

1. **Tạo App Password:**
   - Truy cập https://myaccount.google.com/apppasswords
   - Chọn "Mail" và "Windows Computer" (hoặc device của bạn)
   - Google sẽ generate một 16-ký tự password
   - Copy password này vào `EMAIL_PASSWORD` trong `.env`

2. **Sử dụng Gmail:**
   - `EMAIL_HOST=smtp.gmail.com`
   - `EMAIL_PORT=587`
   - `EMAIL_SECURE=false`
   - `EMAIL_USER=your_email@gmail.com`
   - `EMAIL_PASSWORD=app_password_16_chars`

### Setup với SendGrid

1. **Tạo API Key:**
   - Truy cập https://app.sendgrid.com/settings/api_keys
   - Tạo API key mới

2. **Cấu hình:**
   - `EMAIL_HOST=smtp.sendgrid.net`
   - `EMAIL_PORT=587`
   - `EMAIL_SECURE=false`
   - `EMAIL_USER=apikey`
   - `EMAIL_PASSWORD=SG.your_api_key_here`

---

## Password Reset Token

- **Token Type:** 32-byte hexadecimal string
- **Validity:** 1 hour (3600 seconds)
- **Storage:** Token được hash SHA256 trước khi lưu vào database
- **Auto-deletion:** Token tự động xóa khi:
  - User reset password thành công
  - Token hết hạn (1 giờ)

---

## Example Flow

### Step 1: User quên mật khẩu

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**User nhận email với link:**

```
http://localhost:3000/reset-password/abc123def456xyz...
```

### Step 2: User mở link và nhập password mới

Frontend sẽ extract token từ URL và call endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/reset-password/abc123def456xyz... \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewSecurePassword123!",
    "confirmPassword": "NewSecurePassword123!"
  }'
```

### Step 3: Password reset thành công

User nhận xác nhận email và có thể login với password mới.

---

## Error Handling

### Common Errors

| Error                          | Cause                           | Solution                    |
| ------------------------------ | ------------------------------- | --------------------------- |
| User not found with this email | Email không tồn tại             | Kiểm tra email đã đúng      |
| Invalid or expired reset token | Token hết hạn hoặc không hợp lệ | Request forgot-password mới |
| Passwords do not match         | confirmPassword không match     | Đảm bảo password khớp       |
| Password must be strong        | Password không đủ mạnh          | Xem validation rules        |
| Email configuration error      | Email service không hoạt động   | Kiểm tra .env SMTP settings |

---

## Security Features

✅ **Password Hashing** - Sử dụng bcryptjs (10 rounds)  
✅ **Token Hashing** - Reset token được hash SHA256  
✅ **Token Expiry** - Reset token hết hạn sau 1 giờ  
✅ **Email Verification** - Email được gửi trước reset  
✅ **Confirmation Email** - Email xác nhận khi password đã đổi  
✅ **Input Validation** - Validation email và password strength

---

## Troubleshooting

### Email không được gửi

1. Kiểm tra `.env` SMTP settings
2. Kiểm tra email app password (nếu dùng Gmail)
3. Kiểm tra firewall không chặn port 587

### Token hết hạn quá nhanh

1. Token có hiệu lực 1 giờ theo mặc định
2. Để thay đổi, edit `src/services/auth.service.ts` dòng 177:
   ```typescript
   user.resetPasswordExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
   ```

### Password requirement quá khắt

1. Edit `src/utils/validation.ts` để thay đổi yêu cầu password
2. Hoặc submit issue nếu yêu cầu không hợp lý

---

## Testing

### Postman Collection

```json
{
  "info": {
    "name": "Instagram API - Password Reset",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Forgot Password",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"user@example.com\"\n}"
        },
        "url": {
          "raw": "{{BASE_URL}}/api/auth/forgot-password",
          "host": ["{{BASE_URL}}"],
          "path": ["api", "auth", "forgot-password"]
        }
      }
    },
    {
      "name": "Reset Password",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"newPassword\": \"NewSecurePassword123!\",\n  \"confirmPassword\": \"NewSecurePassword123!\"\n}"
        },
        "url": {
          "raw": "{{BASE_URL}}/api/auth/reset-password/{{RESET_TOKEN}}",
          "host": ["{{BASE_URL}}"],
          "path": ["api", "auth", "reset-password", "{{RESET_TOKEN}}"]
        }
      }
    }
  ]
}
```

---

## Next Steps

- ✅ Forgot Password API - COMPLETED
- ⏳ Email verification on signup
- ⏳ Two-factor authentication
- ⏳ Account security settings
