#!/bin/bash

# Delete User by Email - Test Script
# Usage: ./test-delete-user.sh <email>

if [ -z "$1" ]; then
  echo "Usage: ./test-delete-user.sh <email>"
  echo "Example: ./test-delete-user.sh test@example.com"
  exit 1
fi

EMAIL=$1
BASE_URL="http://localhost:5000"

echo "🗑️  Deleting user with email: $EMAIL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X POST "${BASE_URL}/api/auth/delete-user-by-email" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\"}" \
  -w "\n"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deletion request sent"
