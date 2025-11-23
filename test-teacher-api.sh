#!/bin/bash

BASE_URL="http://localhost:4000/api/v1"
PASSWORD="Test123456"

echo "========================================="
echo "TEACHER CREATION ROLE-BASED TESTING"
echo "========================================="
echo ""

# Step 1: Login as AGENCY user
echo "Step 1: Login as AGENCY user (agency_test)..."
AGENCY_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"agency_test\",\"password\":\"$PASSWORD\"}")

AGENCY_TOKEN=$(echo "$AGENCY_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$AGENCY_TOKEN" ]; then
  echo "❌ Failed to login as AGENCY. Response:"
  echo "$AGENCY_RESPONSE" | python3 -m json.tool
  exit 1
fi

echo "✅ AGENCY Token: ${AGENCY_TOKEN:0:50}..."
echo ""

# Step 2: Login as CENTER user
echo "Step 2: Login as CENTER user (center_test)..."
CENTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"center_test\",\"password\":\"$PASSWORD\"}")

CENTER_TOKEN=$(echo "$CENTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$CENTER_TOKEN" ]; then
  echo "❌ Failed to login as CENTER. Response:"
  echo "$CENTER_RESPONSE" | python3 -m json.tool
  exit 1
fi

echo "✅ CENTER Token: ${CENTER_TOKEN:0:50}..."
echo ""

# Test 1: AGENCY creates teacher WITH centerId (should succeed)
echo "========================================="
echo "Test 1: AGENCY creates teacher (WITH centerId=1)"
echo "Expected: ✅ SUCCESS"
echo "========================================="
curl -s -X POST "$BASE_URL/teachers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGENCY_TOKEN" \
  -d '{
    "email": "teacher_by_agency@example.com",
    "username": "teacher_by_agency",
    "password": "Password123",
    "fullName": "Teacher Created by Agency",
    "centerId": 1,
    "specialization": "English Literature"
  }' | python3 -m json.tool
echo ""
echo ""

# Test 2: AGENCY creates teacher WITHOUT centerId (should fail)
echo "========================================="
echo "Test 2: AGENCY creates teacher (WITHOUT centerId)"
echo "Expected: ❌ FAIL - 'AGENCY must specify centerId'"
echo "========================================="
curl -s -X POST "$BASE_URL/teachers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGENCY_TOKEN" \
  -d '{
    "email": "teacher_no_center@example.com",
    "username": "teacher_no_center",
    "password": "Password123",
    "fullName": "Teacher Without Center"
  }' | python3 -m json.tool
echo ""
echo ""

# Test 3: CENTER creates teacher WITHOUT centerId (should succeed - auto-filled)
echo "========================================="
echo "Test 3: CENTER creates teacher (WITHOUT centerId)"
echo "Expected: ✅ SUCCESS - centerId auto-filled"
echo "========================================="
curl -s -X POST "$BASE_URL/teachers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CENTER_TOKEN" \
  -d '{
    "email": "teacher_by_center@example.com",
    "username": "teacher_by_center",
    "password": "Password123",
    "fullName": "Teacher Created by Center",
    "specialization": "Mathematics"
  }' | python3 -m json.tool
echo ""
echo ""

# Test 4: CENTER tries to create teacher for different center (should fail)
echo "========================================="
echo "Test 4: CENTER creates teacher for DIFFERENT center (centerId=999)"
echo "Expected: ❌ FAIL - 'CENTER can only create teachers for their own center'"
echo "========================================="
curl -s -X POST "$BASE_URL/teachers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CENTER_TOKEN" \
  -d '{
    "email": "teacher_wrong_center@example.com",
    "username": "teacher_wrong_center",
    "password": "Password123",
    "fullName": "Teacher Different Center",
    "centerId": 999
  }' | python3 -m json.tool
echo ""
echo ""

# Test 5: List all teachers as AGENCY
echo "========================================="
echo "Test 5: List all teachers as AGENCY"
echo "========================================="
curl -s -X GET "$BASE_URL/teachers?page=1&limit=10" \
  -H "Authorization: Bearer $AGENCY_TOKEN" | python3 -m json.tool
echo ""
echo ""

echo "========================================="
echo "✅ ALL TESTS COMPLETED"
echo "========================================="
