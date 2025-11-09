#!/bin/bash

# Test script for change password endpoint
# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:4000/api/v1"
TEST_EMAIL="test-user-$(date +%s)@example.com"
TEST_USERNAME="testuser$(date +%s)"
TEST_PASSWORD="Password123!"
NEW_PASSWORD="NewPassword456!"

echo "=========================================="
echo "Change Password API Test"
echo "=========================================="
echo ""

# Step 1: Register a new user
echo -e "${YELLOW}Step 1: Registering new user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"$TEST_USERNAME\",
    \"password\": \"$TEST_PASSWORD\",
    \"fullName\": \"Test User\",
    \"role\": \"student\"
  }")

echo "$REGISTER_RESPONSE" | jq '.'

ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Failed to register user${NC}"
  exit 1
fi

echo -e "${GREEN}✅ User registered successfully${NC}"
echo "Access Token: $ACCESS_TOKEN"
echo ""

# Step 2: Verify login with original password
echo -e "${YELLOW}Step 2: Logging in with original password...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"identifier\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "$LOGIN_RESPONSE" | jq '.'
echo -e "${GREEN}✅ Login successful with original password${NC}"
echo ""

# Step 3: Test change password with invalid current password (should fail)
echo -e "${YELLOW}Step 3: Testing change password with INVALID current password (should fail)...${NC}"
INVALID_CHANGE=$(curl -s -X PATCH "$API_URL/auth/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"currentPassword\": \"WrongPassword123!\",
    \"newPassword\": \"$NEW_PASSWORD\",
    \"confirmPassword\": \"$NEW_PASSWORD\"
  }")

echo "$INVALID_CHANGE" | jq '.'

if echo "$INVALID_CHANGE" | grep -q "Current password is incorrect"; then
  echo -e "${GREEN}✅ Correctly rejected invalid current password${NC}"
else
  echo -e "${RED}❌ Should have rejected invalid current password${NC}"
fi
echo ""

# Step 4: Test change password with mismatched passwords (should fail)
echo -e "${YELLOW}Step 4: Testing change password with MISMATCHED passwords (should fail)...${NC}"
MISMATCH_CHANGE=$(curl -s -X PATCH "$API_URL/auth/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"currentPassword\": \"$TEST_PASSWORD\",
    \"newPassword\": \"$NEW_PASSWORD\",
    \"confirmPassword\": \"DifferentPassword789!\"
  }")

echo "$MISMATCH_CHANGE" | jq '.'

if echo "$MISMATCH_CHANGE" | grep -q "Passwords do not match"; then
  echo -e "${GREEN}✅ Correctly rejected mismatched passwords${NC}"
else
  echo -e "${RED}❌ Should have rejected mismatched passwords${NC}"
fi
echo ""

# Step 5: Test change password with short password (should fail)
echo -e "${YELLOW}Step 5: Testing change password with SHORT password (should fail)...${NC}"
SHORT_CHANGE=$(curl -s -X PATCH "$API_URL/auth/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"currentPassword\": \"$TEST_PASSWORD\",
    \"newPassword\": \"12345\",
    \"confirmPassword\": \"12345\"
  }")

echo "$SHORT_CHANGE" | jq '.'

if echo "$SHORT_CHANGE" | grep -q "at least 6 characters"; then
  echo -e "${GREEN}✅ Correctly rejected short password${NC}"
else
  echo -e "${RED}❌ Should have rejected short password${NC}"
fi
echo ""

# Step 6: Test change password with valid data (should succeed)
echo -e "${YELLOW}Step 6: Changing password with VALID data...${NC}"
CHANGE_RESPONSE=$(curl -s -X PATCH "$API_URL/auth/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"currentPassword\": \"$TEST_PASSWORD\",
    \"newPassword\": \"$NEW_PASSWORD\",
    \"confirmPassword\": \"$NEW_PASSWORD\"
  }")

echo "$CHANGE_RESPONSE" | jq '.'

if echo "$CHANGE_RESPONSE" | grep -q "Password changed successfully"; then
  echo -e "${GREEN}✅ Password changed successfully${NC}"
else
  echo -e "${RED}❌ Failed to change password${NC}"
  exit 1
fi
echo ""

# Step 7: Verify old password no longer works
echo -e "${YELLOW}Step 7: Verifying old password no longer works...${NC}"
OLD_PASSWORD_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"identifier\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "$OLD_PASSWORD_LOGIN" | jq '.'

if echo "$OLD_PASSWORD_LOGIN" | grep -q "Unauthorized\|Invalid credentials"; then
  echo -e "${GREEN}✅ Old password correctly rejected${NC}"
else
  echo -e "${RED}❌ Old password should be rejected${NC}"
fi
echo ""

# Step 8: Verify new password works
echo -e "${YELLOW}Step 8: Verifying new password works...${NC}"
NEW_PASSWORD_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"identifier\": \"$TEST_EMAIL\",
    \"password\": \"$NEW_PASSWORD\"
  }")

echo "$NEW_PASSWORD_LOGIN" | jq '.'

NEW_ACCESS_TOKEN=$(echo "$NEW_PASSWORD_LOGIN" | jq -r '.access_token')

if [ "$NEW_ACCESS_TOKEN" != "null" ] && [ -n "$NEW_ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✅ Successfully logged in with new password${NC}"
else
  echo -e "${RED}❌ Failed to login with new password${NC}"
  exit 1
fi
echo ""

# Step 9: Test without authentication (should fail)
echo -e "${YELLOW}Step 9: Testing change password WITHOUT authentication (should fail)...${NC}"
NO_AUTH_CHANGE=$(curl -s -X PATCH "$API_URL/auth/change-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"currentPassword\": \"$NEW_PASSWORD\",
    \"newPassword\": \"AnotherPassword789!\",
    \"confirmPassword\": \"AnotherPassword789!\"
  }")

echo "$NO_AUTH_CHANGE" | jq '.'

if echo "$NO_AUTH_CHANGE" | grep -q "Unauthorized"; then
  echo -e "${GREEN}✅ Correctly rejected unauthenticated request${NC}"
else
  echo -e "${RED}❌ Should have rejected unauthenticated request${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✅ All tests passed successfully!${NC}"
echo "=========================================="
