# Forgot Password Feature - Implementation Summary

## ✅ Completed Tasks

### 1. Email Service (`src/services/email.service.ts`) - NEW FILE

- **Purpose:** Handle email sending with nodemailer
- **Methods:**
  - `sendEmail()` - Generic email sender
  - `sendPasswordResetEmail()` - Send password reset link
  - `sendPasswordChangeConfirmation()` - Send confirmation email
- **Configuration:** Uses environment variables (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM)

### 2. Updated Auth Service (`src/services/auth.service.ts`)

- **New Methods:**
  - `forgotPassword(email)` - Generate reset token, save to DB with 1-hour expiry, send email
  - `resetPassword(token, newPassword)` - Verify token, update password, send confirmation
- **Imports Added:**
  - `emailService` - For sending emails
  - `crypto` - For generating and hashing reset tokens

### 3. Updated Auth Controller (`src/controllers/auth.controller.ts`)

- **New Methods:**
  - `forgotPassword(req, res)` - Handle POST /forgot-password request
  - `resetPassword(req, res)` - Handle POST /reset-password/:token request
- **Validation:** Email validation, password strength check, token validation

### 4. Updated Auth Routes (`src/routes/auth.route.ts`)

- **New Public Routes:**
  - `POST /api/auth/forgot-password` - Request password reset
  - `POST /api/auth/reset-password/:token` - Reset password with token

### 5. Updated User Model (`src/models/User.ts`)

- **New Schema Fields:**
  - `resetPasswordToken` - Hash của token gửi qua email (String | null)
  - `resetPasswordExpiry` - Expiry time của token (Date | null)
- **Interface Updated:** Added optional null-able types cho reset fields

### 6. Environment Configuration (`.env.example`)

- **New Variables:**
  ```
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_SECURE=false
  EMAIL_USER=your_email@gmail.com
  EMAIL_PASSWORD=your_app_password_here
  EMAIL_FROM=noreply@instagram-api.com
  ```

### 7. Documentation (`FORGOT_PASSWORD_GUIDE.md`) - NEW FILE

- Complete API documentation
- Email configuration guide (Gmail, SendGrid)
- Example flows and cURL commands
- Error handling guide
- Postman collection example

---

## API Endpoints

### Forgot Password

```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password

```
POST /api/auth/reset-password/:token
Content-Type: application/json

{
  "newPassword": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

---

## How It Works

### Step 1: User requests password reset

1. Frontend sends email to `/api/auth/forgot-password`
2. Backend generates 32-byte random token
3. Token được hash SHA256 và save vào database
4. Email gửi link: `http://localhost:3000/reset-password/{TOKEN}`
5. Token hết hạn sau 1 giờ

### Step 2: User clicks reset link

1. Frontend extract token từ URL
2. User nhập password mới
3. Frontend call `/api/auth/reset-password/{TOKEN}`

### Step 3: Backend processes reset

1. Hash token nhận được
2. Tìm user với matching token hash
3. Kiểm tra token còn hiệu lực
4. Hash password mới với bcryptjs
5. Save password, clear token fields
6. Gửi confirmation email

---

## Security Implementation

✅ **Token Security:**

- Random 32-byte token generated với `crypto.randomBytes()`
- Token được hash trước khi save (SHA256)
- Token hết hạn 1 giờ
- Token auto-delete sau reset thành công

✅ **Password Security:**

- Mật khẩu hash với bcryptjs (10 rounds)
- Min 8 ký tự, 1 uppercase, 1 number, 1 special char
- Không thể reuse token nhiều lần

✅ **Email Security:**

- Email address validation trước send
- Reset link chứa token, không password
- Confirmation email khi password đổi thành công

---

## Testing

### Test Forgot Password

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Test Reset Password

```bash
curl -X POST http://localhost:5000/api/auth/reset-password/your_token_here \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }'
```

---

## Dependencies

- **nodemailer** (6.9.7+) - Email sending
- **@types/nodemailer** - TypeScript types
- **crypto** - Native Node.js module (for token generation)
- **bcryptjs** - Already installed (password hashing)

---

## Environment Setup

### Gmail Setup

1. Enable 2-factor authentication: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Copy 16-char password to `.env` EMAIL_PASSWORD
4. Use settings from FORGOT_PASSWORD_GUIDE.md

### Other Email Services

- SendGrid, Mailgun, AWS SES - See FORGOT_PASSWORD_GUIDE.md

---

## Files Modified

| File                                 | Changes                                                  |
| ------------------------------------ | -------------------------------------------------------- |
| `src/services/email.service.ts`      | ✨ NEW - Email service                                   |
| `src/services/auth.service.ts`       | ✏️ Added forgotPassword() & resetPassword()              |
| `src/controllers/auth.controller.ts` | ✏️ Added forgotPassword() & resetPassword() handlers     |
| `src/routes/auth.route.ts`           | ✏️ Added 2 new routes                                    |
| `src/models/User.ts`                 | ✏️ Added resetPasswordToken & resetPasswordExpiry fields |
| `.env.example`                       | ✏️ Added EMAIL\_\* variables                             |
| `FORGOT_PASSWORD_GUIDE.md`           | ✨ NEW - Documentation                                   |

---

## Verification

✅ TypeScript compilation: PASSED (no errors)  
✅ All dependencies installed: PASSED  
✅ Email service created: PASSED  
✅ Routes added: PASSED  
✅ Documentation: PASSED

---

## Next Steps

- Set up email service credentials in `.env`
- Test forgot password flow with Postman or cURL
- Setup frontend reset-password page
- Add email verification for new signups
- Consider adding 2FA for additional security

---

## Support

For questions or issues, refer to:

- [FORGOT_PASSWORD_GUIDE.md](FORGOT_PASSWORD_GUIDE.md) - Complete API guide
- [API_EXAMPLES.md](API_EXAMPLES.md) - More cURL examples
- [ENV_GUIDE.md](ENV_GUIDE.md) - Environment configuration
