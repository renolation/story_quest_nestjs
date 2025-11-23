#!/bin/bash

BASE_URL="http://localhost:4000/api/v1"
PASSWORD="Test123456"

echo "========================================="
echo "CLASSES, GRADES & TEACHER-STUDENT TESTING"
echo "========================================="
echo ""

# Step 1: Login as AGENCY user
echo "Step 1: Login as AGENCY user (agency_test)..."
AGENCY_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"agency_test\",\"password\":\"$PASSWORD\"}")

AGENCY_TOKEN=$(echo "$AGENCY_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$AGENCY_TOKEN" ]; then
  echo "❌ Failed to login as AGENCY"
  exit 1
fi

echo "✅ AGENCY Token obtained"
echo ""

# Step 2: Login as CENTER user
echo "Step 2: Login as CENTER user (center_test)..."
CENTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"center_test\",\"password\":\"$PASSWORD\"}")

CENTER_TOKEN=$(echo "$CENTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$CENTER_TOKEN" ]; then
  echo "❌ Failed to login as CENTER"
  exit 1
fi

echo "✅ CENTER Token obtained"
echo ""

# =========================================
# TEST GRADES MODULE
# =========================================
echo "========================================="
echo "GRADES MODULE TESTS"
echo "========================================="

echo "Test 1: GET /grades - List all grades (public)"
curl -s -X GET "$BASE_URL/grades" | python3 -m json.tool
echo ""
echo ""

# =========================================
# TEST CLASSES MODULE
# =========================================
echo "========================================="
echo "CLASSES MODULE TESTS"
echo "========================================="

echo "Test 2: AGENCY creates class for branch 1, grade 3"
CREATE_CLASS_RESPONSE=$(curl -s -X POST "$BASE_URL/classes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGENCY_TOKEN" \
  -d '{
    "branchId": 1,
    "gradeId": 1,
    "name": "Grade 3 Class A",
    "teacherId": 210,
    "maxStudents": 25
  }')

echo "$CREATE_CLASS_RESPONSE" | python3 -m json.tool
CLASS_ID=$(echo "$CREATE_CLASS_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)
echo ""
echo ""

echo "Test 3: CENTER tries to create class for branch not in their center"
echo "Expected: ❌ FAIL - Branch does not belong to your center"
curl -s -X POST "$BASE_URL/classes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CENTER_TOKEN" \
  -d '{
    "branchId": 999,
    "gradeId": 2,
    "name": "Grade 4 Class B",
    "maxStudents": 30
  }' | python3 -m json.tool
echo ""
echo ""

echo "Test 4: GET /classes - List all classes as AGENCY"
curl -s -X GET "$BASE_URL/classes?page=1&limit=10" \
  -H "Authorization: Bearer $AGENCY_TOKEN" | python3 -m json.tool
echo ""
echo ""

# =========================================
# TEST STUDENT ENROLLMENT
# =========================================
echo "========================================="
echo "STUDENT ENROLLMENT TESTS"
echo "========================================="

if [ ! -z "$CLASS_ID" ]; then
  echo "Test 5: Create a student user for enrollment"
  STUDENT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "student1@example.com",
      "username": "student1",
      "password": "Password123",
      "fullName": "Test Student One",
      "role": "student"
    }')

  STUDENT_ID=$(echo "$STUDENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)

  if [ ! -z "$STUDENT_ID" ]; then
    echo "✅ Student created with ID: $STUDENT_ID"
    echo ""

    echo "Test 6: AGENCY enrolls student in class"
    curl -s -X POST "$BASE_URL/classes/$CLASS_ID/students" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AGENCY_TOKEN" \
      -d "{\"studentId\": $STUDENT_ID}" | python3 -m json.tool
    echo ""
    echo ""

    echo "Test 7: GET /classes/:id/students - List students in class"
    curl -s -X GET "$BASE_URL/classes/$CLASS_ID/students" \
      -H "Authorization: Bearer $AGENCY_TOKEN" | python3 -m json.tool
    echo ""
    echo ""
  else
    echo "⚠️  Student already exists or failed to create"
    echo ""
  fi
fi

# =========================================
# TEST TEACHER-STUDENT RELATIONSHIPS
# =========================================
echo "========================================="
echo "TEACHER-STUDENT RELATIONSHIP TESTS"
echo "========================================="

TEACHER_ID=210  # Teacher created by agency in previous tests

echo "Test 8: GET /teachers/:id/classes - Get teacher's assigned classes"
curl -s -X GET "$BASE_URL/teachers/$TEACHER_ID/classes" \
  -H "Authorization: Bearer $AGENCY_TOKEN" | python3 -m json.tool
echo ""
echo ""

echo "Test 9: GET /teachers/:id/students - Get teacher's students (grouped by class)"
curl -s -X GET "$BASE_URL/teachers/$TEACHER_ID/students" \
  -H "Authorization: Bearer $AGENCY_TOKEN" | python3 -m json.tool
echo ""
echo ""

echo "Test 10: GET /teachers/:id/students/list - Get teacher's students (flattened list)"
curl -s -X GET "$BASE_URL/teachers/$TEACHER_ID/students/list" \
  -H "Authorization: Bearer $AGENCY_TOKEN" | python3 -m json.tool
echo ""
echo ""

echo "========================================="
echo "✅ ALL TESTS COMPLETED"
echo "========================================="
