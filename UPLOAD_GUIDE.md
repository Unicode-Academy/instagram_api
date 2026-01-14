# Image Upload Guide

## Cài đặt

Đã cài đặt:

- `multer` - File upload middleware
- `@types/multer` - TypeScript types

## Tính năng

- ✅ Upload ảnh đại diện (profile picture)
- ✅ Xóa ảnh đại diện cũ khi upload ảnh mới
- ✅ Xóa ảnh đại diện hoàn toàn
- ✅ Giới hạn file size: 5MB
- ✅ Hỗ trợ: JPEG, PNG, GIF, WebP
- ✅ Lưu trữ local trong `/uploads` folder
- ✅ Auto delete on error
- ✅ Unique filename generation

## API Endpoint

### Upload Profile Picture

**PATCH** `/api/users/profile`

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Form Data:**

```
fullName: "John Doe" (text)
bio: "Software Engineer" (text)
profilePicture: <file> (binary)
```

**Response (200):**

```json
{
  "message": "Profile updated successfully",
  "data": {
    "_id": "...",
    "email": "user@example.com",
    "username": "username",
    "fullName": "John Doe",
    "bio": "Software Engineer",
    "profilePicture": "/uploads/profilePicture-1705234567890-123456789.jpg",
    "isVerified": false,
    "createdAt": "2024-01-14T...",
    "updatedAt": "2024-01-14T..."
  },
  "success": true
}
```

## Cách sử dụng

### 1. Upload/Cập nhật ảnh đại diện

**PATCH** `/api/users/profile`

Với cURL:

```bash
curl -X PATCH http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer {accessToken}" \
  -F "fullName=John Doe" \
  -F "bio=Software Engineer" \
  -F "profilePicture=@/path/to/image.jpg"
```

**Tính năng:** Ảnh cũ sẽ tự động bị xóa khỏi filesystem!

### 2. Xóa ảnh đại diện khi cập nhật thông tin

Thêm `deleteProfilePicture: true` vào form data:

```bash
curl -X PATCH http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer {accessToken}" \
  -F "fullName=John Doe" \
  -F "bio=Software Engineer" \
  -F "deleteProfilePicture=true"
```

Response:

```json
{
  "message": "Profile updated successfully",
  "data": {
    "_id": "...",
    "profilePicture": null,
    ...
  },
  "success": true
}
```

### 3. Xóa ảnh đại diện hoàn toàn (Endpoint riêng)

**DELETE** `/api/users/profile/picture`

Với cURL:

```bash
curl -X DELETE http://localhost:5000/api/users/profile/picture \
  -H "Authorization: Bearer {accessToken}"
```

Response:

```json
{
  "message": "Profile picture deleted successfully",
  "data": {
    "_id": "...",
    "profilePicture": null,
    ...
  },
  "success": true
}
```

### Với JavaScript/Axios

#### Upload ảnh mới

```javascript
const formData = new FormData();
formData.append("fullName", "John Doe");
formData.append("bio", "Software Engineer");
formData.append("profilePicture", imageFile);

const response = await axios.patch(
  "http://localhost:5000/api/users/profile",
  formData,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  }
);
console.log(response.data); // Ảnh cũ tự động bị xóa
```

#### Xóa ảnh khi cập nhật

```javascript
const formData = new FormData();
formData.append("fullName", "John Doe");
formData.append("bio", "Software Engineer");
formData.append("deleteProfilePicture", "true");

const response = await axios.patch(
  "http://localhost:5000/api/users/profile",
  formData,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  }
);
```

#### Xóa ảnh (DELETE endpoint)

```javascript
const response = await axios.delete(
  "http://localhost:5000/api/users/profile/picture",
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);
console.log(response.data); // Ảnh đã xóa
```

### Với Postman

#### Upload ảnh

1. Set method: **PATCH**
2. URL: `http://localhost:5000/api/users/profile`
3. Tab **Headers** → Add `Authorization: Bearer {accessToken}`
4. Tab **Body** → Select **form-data**
5. Add fields:
   - `fullName` (text): "John Doe"
   - `bio` (text): "Software Engineer"
   - `profilePicture` (file): Select image file

#### Xóa ảnh

1. Set method: **DELETE**
2. URL: `http://localhost:5000/api/users/profile/picture`
3. Tab **Headers** → Add `Authorization: Bearer {accessToken}`

## File Storage

### Local Storage (Current)

Files lưu tại: `/Applications/Work/Coding/instagram_api/uploads/`

Filename format: `{fieldname}-{timestamp}-{random}.{ext}`

Ví dụ: `profilePicture-1705234567890-123456789.jpg`

URL format: `http://localhost:5000/uploads/profilePicture-1705234567890-123456789.jpg`

### Folder Structure

```
instagram_api/
├── uploads/
│   ├── profilePicture-1705234567890-123456789.jpg
│   ├── profilePicture-1705234570000-987654321.jpg
│   └── ...
└── src/
```

## File Requirements

| Property   | Limit                |
| ---------- | -------------------- |
| Max Size   | 5MB                  |
| Formats    | JPEG, PNG, GIF, WebP |
| Field Name | profilePicture       |

## Error Handling

### File too large

**Status:** 413

```json
{
  "message": "File too large",
  "success": false
}
```

### Invalid file type

**Status:** 400

```json
{
  "message": "Only image files are allowed (jpeg, png, gif, webp)",
  "success": false
}
```

### Missing Authorization

**Status:** 401

```json
{
  "message": "Unauthorized",
  "success": false
}
```

## Triển khai lên Production

### Option 1: AWS S3

```typescript
import aws from "aws-sdk";
import multerS3 from "multer-s3";

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const upload = multerS3({
  s3,
  bucket: process.env.AWS_BUCKET_NAME,
  key: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
```

### Option 2: Cloudinary

```typescript
import cloudinary from "cloudinary";
import multerCloudinary from "multer-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multerCloudinary(),
});
```

### Option 3: Google Cloud Storage

```typescript
import { Storage } from "@google-cloud/storage";
import multerGcs from "multer-google-storage";

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE,
});

const upload = multer({
  storage: multerGcs.storageEngine({
    bucket: process.env.GCP_BUCKET,
  }),
});
```

## Bảo mật

- ✅ File filter - Chỉ cho phép image formats
- ✅ File size limit - 5MB max
- ✅ Unique filename - Tránh collision
- ✅ Directory isolation - Lưu trong /uploads
- ✅ Authentication required - JWT middleware
- ✅ Error cleanup - Auto delete on failure

## Performance Tips

1. **Resize Images** - Dùng `sharp` package
2. **Compress** - Giảm file size
3. **Cache** - Browser caching headers
4. **CDN** - Dùng CDN cho static files
5. **Cleanup** - Delete old files periodically

## Troubleshooting

### Folder not found

```bash
mkdir -p /Applications/Work/Coding/instagram_api/uploads
chmod 755 /Applications/Work/Coding/instagram_api/uploads
```

### Permission denied

```bash
sudo chown -R $(whoami) /Applications/Work/Coding/instagram_api/uploads
```

### File too large error

- Check `limits.fileSize` in upload.ts (currently 5MB)
- Adjust if needed

### CORS errors

- Make sure CORS is enabled in index.ts
- Check `Access-Control-Allow-Origin` header

## Next Steps

- [ ] Add image compression/resizing
- [ ] Implement cloud storage (AWS/Cloudinary)
- [ ] Add image gallery for posts
- [ ] Add video upload support
- [ ] Add image cropping/editing
- [ ] Implement image caching strategy
