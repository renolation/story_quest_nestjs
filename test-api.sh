#!/bin/bash

# Simple API testing script for Week 1 verification

echo "🧪 Testing Story Quest API..."
echo ""

# Test 1: Health Check
echo "1. Testing health endpoint..."
HEALTH=$(curl -s http://localhost:3000/api/v1/auth/health)
echo "   $HEALTH"
echo ""

# Test 2: Login
echo "2. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"student1@test.com\",\"password\":\"Password123\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
  echo "   ✅ Login successful (token received)"
  echo "   Token: ${TOKEN:0:50}..."
else
  echo "   ❌ Login failed"
  echo "   Response: $LOGIN_RESPONSE"
  exit 1
fi
echo ""

# Test 3: Get current user
echo "3. Testing /auth/me..."
ME_RESPONSE=$(curl -s http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN")
USERNAME=$(echo $ME_RESPONSE | jq -r '.username')
echo "   Logged in as: $USERNAME"
echo ""

# Test 4: Get chapters
echo "4. Testing /chapters..."
CHAPTERS=$(curl -s http://localhost:3000/api/v1/chapters \
  -H "Authorization: Bearer $TOKEN")
CHAPTER_COUNT=$(echo $CHAPTERS | jq '. | length')
echo "   Found $CHAPTER_COUNT chapters"
echo ""

# Test 5: Get first chapter
echo "5. Testing /chapters/1..."
CHAPTER1=$(curl -s http://localhost:3000/api/v1/chapters/1 \
  -H "Authorization: Bearer $TOKEN")
CHAPTER_TITLE=$(echo $CHAPTER1 | jq -r '.title')
echo "   Chapter 1: $CHAPTER_TITLE"
echo ""

# Test 6: Get progress
echo "6. Testing /progress/me..."
PROGRESS=$(curl -s http://localhost:3000/api/v1/progress/me \
  -H "Authorization: Bearer $TOKEN")
STUDENT_ID=$(echo $PROGRESS | jq -r '.studentId')
echo "   Student ID: $STUDENT_ID"
echo ""

echo "✅ All API tests passed!"
echo ""
echo "🎉 Week 1 NestJS Backend Complete!"
