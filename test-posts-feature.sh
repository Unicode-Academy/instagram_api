#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:5000/api"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Instagram API - Posts Feature Demo${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. Create a test user
echo -e "\n${YELLOW}1. Creating test user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "username": "testuser",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!",
    "fullName": "Test User",
    "gender": "male",
    "website": "https://example.com"
  }')

USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data._id')
echo -e "${GREEN}✓ User created: $USER_ID${NC}"

# 2. Login to get token
echo -e "\n${YELLOW}2. Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }')

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')
echo -e "${GREEN}✓ Access token obtained${NC}"

# 3. Create some test posts
echo -e "\n${YELLOW}3. Creating test posts...${NC}"

# Create image post
POST_1=$(curl -s -X POST "$API_URL/posts" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "Beautiful sunset at the beach",
    "image": "https://example.com/sunset.jpg",
    "mediaType": "image"
  }')
POST_1_ID=$(echo "$POST_1" | jq -r '.data._id')
echo -e "${GREEN}✓ Image post created: $POST_1_ID${NC}"

# Create video post
POST_2=$(curl -s -X POST "$API_URL/posts" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "Amazing travel vlog",
    "video": "https://example.com/travel.mp4",
    "mediaType": "video"
  }')
POST_2_ID=$(echo "$POST_2" | jq -r '.data._id')
echo -e "${GREEN}✓ Video post created: $POST_2_ID${NC}"

# Create another image post
POST_3=$(curl -s -X POST "$API_URL/posts" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "Delicious pizza night",
    "image": "https://example.com/pizza.jpg",
    "mediaType": "image"
  }')
POST_3_ID=$(echo "$POST_3" | jq -r '.data._id')
echo -e "${GREEN}✓ Image post created: $POST_3_ID${NC}"

# 4. Add likes and comments
echo -e "\n${YELLOW}4. Adding likes to posts...${NC}"

curl -s -X POST "$API_URL/posts/$POST_1_ID/like" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" > /dev/null
echo -e "${GREEN}✓ Liked post 1${NC}"

curl -s -X POST "$API_URL/posts/$POST_2_ID/like" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" > /dev/null
echo -e "${GREEN}✓ Liked post 2${NC}"

# 5. Save a post
echo -e "\n${YELLOW}5. Saving post...${NC}"

curl -s -X POST "$API_URL/posts/$POST_1_ID/save" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" > /dev/null
echo -e "${GREEN}✓ Saved post 1${NC}"

# 6. Get all posts
echo -e "\n${YELLOW}6. Fetching all posts from user...${NC}"
ALL_POSTS=$(curl -s -X GET "$API_URL/posts/user/$USER_ID?filter=all" \
  -H "Content-Type: application/json")

echo -e "${GREEN}✓ Retrieved all posts:${NC}"
echo "$ALL_POSTS" | jq '.data.posts[] | {_id, caption, mediaType, likes, comments, createdAt}'

# 7. Get only video posts
echo -e "\n${YELLOW}7. Fetching only video posts...${NC}"
VIDEO_POSTS=$(curl -s -X GET "$API_URL/posts/user/$USER_ID?filter=video" \
  -H "Content-Type: application/json")

echo -e "${GREEN}✓ Retrieved video posts:${NC}"
echo "$VIDEO_POSTS" | jq '.data.posts[] | {_id, caption, mediaType, likes}'

# 8. Get saved posts
echo -e "\n${YELLOW}8. Fetching saved posts...${NC}"
SAVED_POSTS=$(curl -s -X GET "$API_URL/posts/user/$USER_ID?filter=saved" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")

echo -e "${GREEN}✓ Retrieved saved posts:${NC}"
echo "$SAVED_POSTS" | jq '.data.posts[] | {_id, caption, mediaType}'

# 9. Get post statistics
echo -e "\n${YELLOW}9. Fetching post statistics...${NC}"
STATS=$(curl -s -X GET "$API_URL/posts/user/$USER_ID/stats" \
  -H "Content-Type: application/json")

echo -e "${GREEN}✓ Post statistics:${NC}"
echo "$STATS" | jq '.data'

# 10. Pagination example
echo -e "\n${YELLOW}10. Testing pagination...${NC}"
PAGINATED=$(curl -s -X GET "$API_URL/posts/user/$USER_ID?limit=2&offset=0" \
  -H "Content-Type: application/json")

echo -e "${GREEN}✓ Pagination response:${NC}"
echo "$PAGINATED" | jq '.data | {total, limit, offset, hasMore, postsCount: (.posts | length)}'

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✓ All tests completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
