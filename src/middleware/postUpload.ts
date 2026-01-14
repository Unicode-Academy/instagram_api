import multer, { StorageEngine, FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Create uploads directory for posts if it doesn't exist
const postsUploadDir = path.join(__dirname, "../../uploads/posts");
if (!fs.existsSync(postsUploadDir)) {
  fs.mkdirSync(postsUploadDir, { recursive: true });
}

// Configure storage for posts
const postStorage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, postsUploadDir);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter - allow both images and videos
const postFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedImageMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const allowedVideoMimes = [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
  ];

  const allAllowedMimes = [...allowedImageMimes, ...allowedVideoMimes];

  if (allAllowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image files (jpeg, png, gif, webp) and video files (mp4, mov, avi, webm) are allowed"
      )
    );
  }
};

// Create multer instance for posts
export const postUpload = multer({
  storage: postStorage,
  fileFilter: postFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
});

// Helper function to get post file URL
export const getPostFileUrl = (filename: string): string => {
  return `/uploads/posts/${filename}`;
};

// Helper function to delete post file
export const deletePostFile = (filename: string): boolean => {
  try {
    const filePath = path.join(postsUploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting post file:", error);
    return false;
  }
};

// Helper to extract filename from URL
export const extractFilenameFromUrl = (url: string): string => {
  // Extract filename from URL like /uploads/posts/image-123456.jpg
  const match = url.match(/\/uploads\/posts\/(.+)$/);
  return match ? match[1] : "";
};
