#!/bin/bash

BASE_URL="http://localhost:4000/api/v1"

echo "========================================="
echo "TEACHER CREATION ROLE-BASED TESTING"
echo "========================================="
echo ""

# Step 1: Login as SUPER ADMIN (AGENCY role with is_super_admin=true)
echo "Step 1: Login as SUPER ADMIN..."
SUPER_ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"superadmin","password":"Password123"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin).get('accessToken', ''))")

if [ -z "$SUPER_ADMIN_TOKEN" ]; then
  echo "❌ Failed to get super admin token. Trying different password..."
  SUPER_ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"identifier":"superadmin","password":"SuperSecurePassword123"}' | \
    python3 -c "import sys, json; print(json.load(sys.stdin).get('accessToken', ''))")
fi

echo "Super Admin Token: ${SUPER_ADMIN_TOKEN:0:50}..."
echo ""

# Step 2: Login as CENTER user
echo "Step 2: Login as CENTER user..."
CENTER_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"gmail_abc","password":"Password123"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin).get('accessToken', ''))")

if [ -z "$CENTER_TOKEN" ]; then
  echo "❌ Failed to get center token. Trying different password..."
  CENTER_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"identifier":"abc@gmail.com","password":"Password123"}' | \
    python3 -c "import sys, json; print(json.load(sys.stdin).get('accessToken', ''))")
fi

echo "Center Token: ${CENTER_TOKEN:0:50}..."
echo ""

# Test 3: AGENCY creates teacher WITH centerId (should succeed)
echo "========================================="
echo "Test 3: AGENCY creates teacher (WITH centerId)"
echo "Expected: SUCCESS"
echo "========================================="
curl -s -X POST "$BASE_URL/teachers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -d '{
    "email": "teacher_agency1@example.com",
    "username": "teacher_agency1",
    "password": "Password123",
    "fullName": "Teacher Created by Agency",
    "centerId": 1,
    "specialization": "English Literature"
  }' | python3 -m json.tool
echo ""

# Test 4: AGENCY creates teacher WITHOUT centerId (should fail)
echo "========================================="
echo "Test 4: AGENCY creates teacher (WITHOUT centerId)"
echo "Expected: FAIL with 'AGENCY must specify centerId'"
echo "========================================="
curl -s -X POST "$BASE_URL/teachers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -d '{
    "email": "teacher_agency2@example.com",
    "username": "teacher_agency2",
    "password": "Password123",
    "fullName": "Teacher Without Center"
  }' | python3 -m json.tool
echo ""

# Test 5: CENTER creates teacher WITHOUT centerId (should succeed - auto-filled)
echo "========================================="
echo "Test 5: CENTER creates teacher (WITHOUT centerId)"
echo "Expected: SUCCESS - centerId auto-filled from CENTER user"
echo "========================================="
curl -s -X POST "$BASE_URL/teachers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CENTER_TOKEN" \
  -d '{
    "email": "teacher_center1@example.com",
    "username": "teacher_center1",
    "password": "Password123",
    "fullName": "Teacher Created by Center",
    "specialization": "Mathematics"
  }' | python3 -m json.tool
echo ""

# Test 6: CENTER tries to create teacher for different center (should fail)
echo "========================================="
echo "Test 6: CENTER creates teacher for DIFFERENT center"
echo "Expected: FAIL with 'CENTER can only create teachers for their own center'"
echo "========================================="
curl -s -X POST "$BASE_URL/teachers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CENTER_TOKEN" \
  -d '{
    "email": "teacher_center2@example.com",
    "username": "teacher_center2",
    "password": "Password123",
    "fullName": "Teacher Different Center",
    "centerId": 999
  }' | python3 -m json.tool
echo ""

# Test 7: List all teachers as AGENCY
echo "========================================="
echo "Test 7: List all teachers as AGENCY"
echo "========================================="
curl -s -X GET "$BASE_URL/teachers" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | python3 -m json.tool
echo ""

echo "========================================="
echo "TESTS COMPLETED"
echo "========================================="
