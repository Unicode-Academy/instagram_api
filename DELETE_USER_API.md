# Delete User by Email API

**Status:** ✅ Development Utility Endpoint  
**Purpose:** Delete user account by email without authentication (for error handling & testing)  
**Security Note:** ⚠️ This is a development endpoint - should be protected/removed in production

---

## Endpoint

### Delete User by Email

```
POST /api/auth/delete-user-by-email
Content-Type: application/json
```

**Description:** Delete a user account completely by email address. This endpoint is useful for:

- Error handling & cleanup
- Testing & development
- Removing test accounts
- Database maintenance

---

## Request

### Body

```json
{
  "email": "user@example.com"
}
```

### Parameters

- `email` (string, required) - User email address to delete

---

## Response

### Success (200)

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

### Error - Invalid Email (400)

```json
{
  "success": false,
  "message": "Valid email is required",
  "errors": null
}
```

### Error - User Not Found (400)

```json
{
  "success": false,
  "message": "User not found with this email",
  "errors": null
}
```

---

## Examples

### cURL

```bash
curl -X POST http://localhost:5000/api/auth/delete-user-by-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Postman

```
Method: POST
URL: http://localhost:5000/api/auth/delete-user-by-email

Header:
Content-Type: application/json

Body (JSON):
{
  "email": "user@example.com"
}
```

### JavaScript/Fetch

```javascript
fetch("http://localhost:5000/api/auth/delete-user-by-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
  }),
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### Python

```python
import requests

response = requests.post(
  'http://localhost:5000/api/auth/delete-user-by-email',
  json={'email': 'user@example.com'}
)

print(response.json())
```

---

## What Gets Deleted

When a user is deleted, the following are removed:

✅ **User Profile**

- Email
- Username
- Password
- Full name
- Gender
- Website
- Bio
- Verification status
- All verification tokens
- All password reset tokens

✅ **User Files**

- Profile picture from filesystem
- Auto-cleanup of orphaned files

✅ **User Sessions**

- Refresh tokens from Redis
- All active sessions invalidated

✅ **Database Entry**

- Complete user record deleted from MongoDB

---

## Validation

### Email Validation

- Must be a valid email format
- Examples:
  - ✅ `user@example.com` - Valid
  - ❌ `invalid-email` - Invalid
  - ❌ `user@` - Invalid
  - ❌ `@example.com` - Invalid

### User Existence

- User must exist in database
- If not found, returns error

---

## Use Cases

### 1. Testing & Development

```bash
# Create a test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPassword123!"
  }'

# ... run tests ...

# Cleanup
curl -X POST http://localhost:5000/api/auth/delete-user-by-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 2. Error Handling

If something goes wrong during development:

```bash
# Delete the problematic user
curl -X POST http://localhost:5000/api/auth/delete-user-by-email \
  -H "Content-Type: application/json" \
  -d '{"email": "problematic@example.com"}'
```

### 3. Database Cleanup

```bash
# Delete duplicate or old test accounts
curl -X POST http://localhost:5000/api/auth/delete-user-by-email \
  -H "Content-Type: application/json" \
  -d '{"email": "old-test@example.com"}'
```

---

## Implementation Details

### Code Flow

1. **Receive Request**
   - Extract email from request body
   - Validate email format

2. **Find User**
   - Search database for user with email
   - If not found, throw error

3. **Delete Profile Picture**
   - Check if user has profile picture
   - Delete file from filesystem
   - Continue even if file deletion fails

4. **Clear Sessions**
   - Remove refresh tokens from Redis
   - Invalidate all user sessions

5. **Delete User Record**
   - Remove user from MongoDB
   - Complete deletion

6. **Return Success**
   - Send confirmation response

### Error Handling

- Try/catch blocks for file deletion
- Continues deletion even if file removal fails
- Proper error messages for debugging

---

## Database Operations

### Files Modified

- [src/services/auth.service.ts](src/services/auth.service.ts) - Added `deleteUserByEmail()` method
- [src/controllers/auth.controller.ts](src/controllers/auth.controller.ts) - Added handler
- [src/routes/auth.route.ts](src/routes/auth.route.ts) - Added route

### Methods Added

**Auth Service:**

```typescript
async deleteUserByEmail(email: string): Promise<void>
```

**Auth Controller:**

```typescript
async deleteUserByEmail(req: Request, res: Response): Promise<void>
```

---

## Security Considerations

### ⚠️ Important

This endpoint is **NOT AUTHENTICATED** because it's designed for development/testing. In production, you should:

1. **Protect This Endpoint**
   - Add authentication middleware
   - Require admin role
   - Add rate limiting
   - Log all deletions

2. **Production Implementation**

```typescript
// Add authentication
authRouter.post(
  "/delete-user-by-email",
  authenticate,
  adminOnly, // Add admin check
  (req, res) => authController.deleteUserByEmail(req, res)
);
```

3. **Audit Trail**
   - Log who deleted which user
   - Log timestamp
   - Log reason (if provided)

4. **Soft Delete Option**
   - Consider soft delete instead of hard delete
   - Mark user as `deleted: true` instead of removing
   - Preserve data for audit purposes

---

## Testing Checklist

- [ ] Test with valid email
- [ ] Test with invalid email format
- [ ] Test with non-existent user email
- [ ] Verify profile picture deleted
- [ ] Verify user record removed from database
- [ ] Verify refresh tokens cleared from Redis
- [ ] Verify login fails after deletion
- [ ] Test error handling

---

## Related Endpoints

| Endpoint                       | Method | Purpose                   |
| ------------------------------ | ------ | ------------------------- |
| /api/auth/register             | POST   | Create user               |
| /api/auth/login                | POST   | User login                |
| /api/auth/logout               | POST   | Logout (protected)        |
| /api/auth/delete-user-by-email | POST   | Delete user (dev utility) |
| /api/users/profile             | GET    | Get profile (protected)   |
| /api/users/:userId             | GET    | Get user by ID            |

---

## Troubleshooting

### Error: "User not found with this email"

- Check email spelling
- Verify user exists in database
- Try different email format

### Error: "Valid email is required"

- Verify email format is correct
- Example: `name@domain.com`
- Check for spaces or special characters

### User not fully deleted?

- Check if profile picture deletion failed (logged in console)
- Verify MongoDB connection
- Check Redis connection for token removal
- Review error logs

---

## Next Steps

### Production Deployment

1. Add authentication middleware
2. Add admin role verification
3. Add audit logging
4. Consider soft delete approach
5. Set rate limits
6. Document access restrictions

### Future Enhancements

- [ ] Batch delete users
- [ ] Conditional deletion (if created before date)
- [ ] Archive user data before deletion
- [ ] Admin dashboard for user management
- [ ] User account deactivation (soft delete)
- [ ] Data export before deletion

---

## Summary

✅ Delete user by email endpoint implemented  
✅ Automatic file cleanup  
✅ Redis session cleanup  
✅ Database record deletion  
✅ Error handling  
✅ TypeScript compilation successful

⚠️ **For development/testing only** - Protect in production!
