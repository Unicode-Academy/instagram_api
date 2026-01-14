#!/bin/bash

# Test script for Post File Upload functionality
# Make sure the server is running on http://localhost:5000

BASE_URL="http://localhost:5000/api"
AUTH_TOKEN="" # You need to get a valid JWT token

echo "=== POST UPLOAD TEST SCRIPT ==="
echo ""

# Step 1: Login to get token (if you need to)
echo "1. Getting authentication token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

AUTH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo "Token: $AUTH_TOKEN"
echo ""

# Step 2: Create test image (minimal 1x1 PNG)
echo "2. Creating test image file..."
python3 << 'EOF'
import base64

# Minimal 1x1 red pixel PNG
png_data = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
)

with open("/tmp/test-image.png", "wb") as f:
    f.write(png_data)

print("✓ Test image created: /tmp/test-image.png")
EOF
echo ""

# Step 3: Upload image post
echo "3. Creating image post with file upload..."
IMAGE_RESPONSE=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -F "file=@/tmp/test-image.png" \
  -F "caption=My awesome image!")

echo "Response:"
echo $IMAGE_RESPONSE | python3 -m json.tool 2>/dev/null || echo $IMAGE_RESPONSE
echo ""

# Step 4: Create test video (minimal)
echo "4. Creating test video file..."
python3 << 'EOF'
# Create a minimal MP4 file (just the moov box)
import struct

with open("/tmp/test-video.mp4", "wb") as f:
    # Minimal MP4 structure
    f.write(b'\x00\x00\x00\x20ftypisom')
    f.write(b'\x00' * 16)
    f.write(b'\x00\x00\x00\x08mdat')

print("✓ Test video created: /tmp/test-video.mp4")
EOF
echo ""

# Step 5: Upload video post
echo "5. Creating video post with file upload..."
VIDEO_RESPONSE=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -F "file=@/tmp/test-video.mp4" \
  -F "caption=Check out this video!")

echo "Response:"
echo $VIDEO_RESPONSE | python3 -m json.tool 2>/dev/null || echo $VIDEO_RESPONSE
echo ""

# Cleanup
rm -f /tmp/test-image.png /tmp/test-video.mp4

echo "=== TEST COMPLETE ==="
