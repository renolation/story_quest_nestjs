# API Testing Guide

**Story Quest English Learning API - Week 2 Implementation**

This guide provides comprehensive instructions for testing the Story Quest API endpoints implemented during Week 2 (Days 2-5), including authentication, content management, and progress tracking.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Content Management APIs](#content-management-apis)
4. [Progress Tracking APIs](#progress-tracking-apis)
5. [Testing with REST Client](#testing-with-rest-client)
6. [Testing with cURL](#testing-with-curl)
7. [Common Error Responses](#common-error-responses)
8. [Best Practices](#best-practices)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- PostgreSQL 15+ running
- Redis (optional, for caching)

### Setup

```bash
# Install dependencies
npm install

# Run database migrations
npm run migration:run

# Seed the database (optional)
npm run seed:run

# Start the development server
npm run start:dev
```

The API will be available at:
- **Base URL**: `http://localhost:4000/api/v1`
- **Swagger Docs**: `http://localhost:4000/api/docs`

---

## 🔐 Authentication

All endpoints (except registration and login) require JWT authentication.

### 1. Register a New User

**Endpoint**: `POST /api/v1/auth/register`

**Request Body**:
```json
{
  "email": "student@example.com",
  "username": "student123",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "role": "student"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "email": "student@example.com",
  "username": "student123",
  "fullName": "John Doe",
  "role": "student",
  "createdAt": "2025-01-21T10:00:00.000Z",
  "updatedAt": "2025-01-21T10:00:00.000Z"
}
```

**Available Roles**:
- `student` - End users (mobile app)
- `teacher` - Instructors (web dashboard)
- `center` - Organization admins (web dashboard)
- `agency` - Super admins (web dashboard)
- `reviewer` - Content moderators (web dashboard)

### 2. Login

**Endpoint**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "username": "student123",
    "role": "student"
  }
}
```

**Important**: Save the `access_token` for use in subsequent requests.

### 3. Using the JWT Token

Include the token in the `Authorization` header for all protected endpoints:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📚 Content Management APIs

### Chapters

#### Get All Chapters

**Endpoint**: `GET /api/v1/chapters`

**Query Parameters**:
- `includeUnits` (optional): Set to `"true"` to include nested units

**Example Request**:
```bash
curl -X GET "http://localhost:4000/api/v1/chapters?includeUnits=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "title": "Basic Greetings",
    "description": "Learn basic greetings in English",
    "thumbnailUrl": "https://example.com/thumb.jpg",
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-01-21T10:00:00.000Z",
    "updatedAt": "2025-01-21T10:00:00.000Z",
    "progress": {
      "totalUnits": 5,
      "completedUnits": 3,
      "averageScore": 85.5
    },
    "units": [
      {
        "id": 1,
        "title": "Unit 1: Hello",
        "description": "Introduction to greetings",
        "chapterId": 1,
        "orderIndex": 1
      }
    ]
  }
]
```

#### Create Chapter (Teacher/Center/Agency only)

**Endpoint**: `POST /api/v1/chapters`

**Request Body**:
```json
{
  "title": "Advanced Grammar",
  "description": "Master advanced grammar concepts",
  "thumbnailUrl": "https://example.com/grammar-thumb.jpg",
  "orderIndex": 2
}
```

**Response** (201 Created):
```json
{
  "id": 2,
  "title": "Advanced Grammar",
  "description": "Master advanced grammar concepts",
  "thumbnailUrl": "https://example.com/grammar-thumb.jpg",
  "orderIndex": 2,
  "isActive": true,
  "createdAt": "2025-01-21T11:00:00.000Z",
  "updatedAt": "2025-01-21T11:00:00.000Z"
}
```

#### Update Chapter (Teacher/Center/Agency only)

**Endpoint**: `PATCH /api/v1/chapters/:id`

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### Delete Chapter (Agency only)

**Endpoint**: `DELETE /api/v1/chapters/:id`

**Response**: 204 No Content

**Note**: Cascade deletes all units, levels, questions, and answer options.

#### Bulk Reorder Chapters (Teacher/Center/Agency only)

**Endpoint**: `PATCH /api/v1/chapters/reorder/bulk`

**Request Body**:
```json
{
  "chapters": [
    { "id": 1, "orderIndex": 2 },
    { "id": 2, "orderIndex": 1 },
    { "id": 3, "orderIndex": 0 }
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Chapters reordered successfully"
}
```

---

### Units

#### Get All Units

**Endpoint**: `GET /api/v1/units`

**Query Parameters**:
- `chapterId` (optional): Filter units by chapter ID
- `includeLevels` (optional): Set to `"true"` to include nested levels

**Example Request**:
```bash
curl -X GET "http://localhost:4000/api/v1/units?chapterId=1&includeLevels=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create Unit (Teacher/Center/Agency only)

**Endpoint**: `POST /api/v1/units`

**Request Body**:
```json
{
  "title": "Unit 2: Introductions",
  "description": "Learn how to introduce yourself",
  "chapterId": 1,
  "orderIndex": 2
}
```

**Response** (201 Created):
```json
{
  "id": 2,
  "title": "Unit 2: Introductions",
  "description": "Learn how to introduce yourself",
  "chapterId": 1,
  "orderIndex": 2,
  "isActive": true,
  "createdAt": "2025-01-21T11:30:00.000Z",
  "updatedAt": "2025-01-21T11:30:00.000Z"
}
```

---

### Levels

#### Get All Levels

**Endpoint**: `GET /api/v1/levels`

**Query Parameters**:
- `unitId` (optional): Filter levels by unit ID
- `includeQuestions` (optional): Set to `"true"` to include nested questions

#### Create Level (Teacher/Center/Agency only)

**Endpoint**: `POST /api/v1/levels`

**Request Body**:
```json
{
  "title": "Level 1: Basic Hello",
  "description": "Practice saying hello",
  "unitId": 1,
  "orderIndex": 1,
  "timeLimitSeconds": 300,
  "passingScore": 70,
  "totalPoints": 100
}
```

**Field Constraints**:
- `passingScore`: 0-100 (percentage)
- `timeLimitSeconds`: Minimum 1 second
- `totalPoints`: Minimum 1 point

**Response** (201 Created):
```json
{
  "id": 1,
  "title": "Level 1: Basic Hello",
  "description": "Practice saying hello",
  "unitId": 1,
  "orderIndex": 1,
  "timeLimitSeconds": 300,
  "passingScore": 70,
  "totalPoints": 100,
  "isActive": true,
  "createdAt": "2025-01-21T12:00:00.000Z",
  "updatedAt": "2025-01-21T12:00:00.000Z"
}
```

---

### Questions

#### Get All Questions

**Endpoint**: `GET /api/v1/questions`

**Query Parameters**:
- `levelId` (optional): Filter questions by level ID

#### Create Question (Teacher/Center/Agency only)

**Endpoint**: `POST /api/v1/questions`

**Question Types**:
- `select_right_answer` - Multiple choice
- `fill_in_blank` - Fill in the blank
- `sort_words` - Word arrangement
- `talk_to_speech_compare` - Speech practice

**Request Body** (Multiple Choice Example):
```json
{
  "levelId": 1,
  "questionType": "select_right_answer",
  "questionText": "What is the correct greeting?",
  "questionAudioUrl": "https://example.com/audio/q1.mp3",
  "questionImageUrl": "https://example.com/images/greeting.jpg",
  "points": 10,
  "orderIndex": 1,
  "placementPosition": "top_left",
  "answerOptions": [
    {
      "optionText": "Hello",
      "isCorrect": true,
      "orderIndex": 1
    },
    {
      "optionText": "Goodbye",
      "isCorrect": false,
      "orderIndex": 2
    },
    {
      "optionText": "Thank you",
      "isCorrect": false,
      "orderIndex": 3
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "levelId": 1,
  "questionType": "select_right_answer",
  "questionText": "What is the correct greeting?",
  "questionAudioUrl": "https://example.com/audio/q1.mp3",
  "questionImageUrl": "https://example.com/images/greeting.jpg",
  "points": 10,
  "orderIndex": 1,
  "placementPosition": "top_left",
  "createdAt": "2025-01-21T12:30:00.000Z",
  "updatedAt": "2025-01-21T12:30:00.000Z",
  "answerOptions": [
    {
      "id": 1,
      "questionId": 1,
      "optionText": "Hello",
      "isCorrect": true,
      "orderIndex": 1
    },
    {
      "id": 2,
      "questionId": 1,
      "optionText": "Goodbye",
      "isCorrect": false,
      "orderIndex": 2
    },
    {
      "id": 3,
      "questionId": 1,
      "optionText": "Thank you",
      "isCorrect": false,
      "orderIndex": 3
    }
  ]
}
```

---

## 🎯 Progress Tracking APIs

**Note**: Progress operations (start, submit, complete) are STUDENT-ONLY. Other roles can only view progress.

### Complete Learning Workflow

#### 1. Start a Level Attempt (Student only)

**Endpoint**: `POST /api/v1/progress/levels/:id/start`

**Example**:
```bash
curl -X POST "http://localhost:4000/api/v1/progress/levels/1/start" \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

**Response** (201 Created):
```json
{
  "id": 1,
  "studentId": 1,
  "levelId": 1,
  "startedAt": "2025-01-21T13:00:00.000Z",
  "isCompleted": false
}
```

#### 2. Submit Answer to a Question (Student only)

**Endpoint**: `POST /api/v1/progress/questions/:id/answer`

**Request Body** (Multiple Choice):
```json
{
  "attemptId": 1,
  "selectedOptionId": 1,
  "isCorrect": true,
  "pointsEarned": 10,
  "timeSpentSeconds": 15
}
```

**Request Body** (Fill in Blank):
```json
{
  "attemptId": 1,
  "answerText": "Hello",
  "isCorrect": true,
  "pointsEarned": 15,
  "timeSpentSeconds": 20
}
```

**Request Body** (Speech Practice):
```json
{
  "attemptId": 1,
  "answerAudioUrl": "https://storage.example.com/student-audio/attempt1-q1.mp3",
  "isCorrect": true,
  "pointsEarned": 20,
  "timeSpentSeconds": 30
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "attemptId": 1,
  "questionId": 1,
  "selectedOptionId": 1,
  "isCorrect": true,
  "pointsEarned": 10,
  "timeSpentSeconds": 15,
  "answeredAt": "2025-01-21T13:02:00.000Z"
}
```

#### 3. Complete Level (Student only)

**Endpoint**: `POST /api/v1/progress/levels/:id/complete`

**Request Body**:
```json
{
  "attemptId": 1,
  "score": 85,
  "pointsEarned": 85,
  "isPassed": true,
  "timeSpentSeconds": 180
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "studentId": 1,
  "levelId": 1,
  "score": 85,
  "pointsEarned": 85,
  "isPassed": true,
  "timeSpentSeconds": 180,
  "isCompleted": true,
  "completedAt": "2025-01-21T13:05:00.000Z"
}
```

#### 4. Get Overall Progress

**Endpoint**: `GET /api/v1/progress/me`

**Response** (200 OK):
```json
{
  "studentId": 1,
  "totalChapters": 3,
  "completedChapters": 1,
  "totalUnits": 10,
  "completedUnits": 5,
  "totalLevelAttempts": 15,
  "completedLevels": 12,
  "passedLevels": 10,
  "averageScore": 84.5,
  "totalPointsEarned": 850,
  "chapterProgress": [
    {
      "chapterId": 1,
      "totalUnits": 5,
      "completedUnits": 5,
      "averageScore": 88.0
    }
  ],
  "unitProgress": [
    {
      "unitId": 1,
      "totalLevels": 3,
      "completedLevels": 3,
      "averageScore": 90.0
    }
  ]
}
```

#### 5. Get Chapter Progress

**Endpoint**: `GET /api/v1/progress/chapters/:id`

**Response** (200 OK):
```json
{
  "chapterId": 1,
  "totalUnits": 5,
  "completedUnits": 5,
  "averageScore": 88.0,
  "lastAccessedAt": "2025-01-21T13:05:00.000Z"
}
```

#### 6. Get Unit Progress

**Endpoint**: `GET /api/v1/progress/units/:id`

**Response** (200 OK):
```json
{
  "unitId": 1,
  "totalLevels": 3,
  "completedLevels": 3,
  "averageScore": 90.0,
  "lastAccessedAt": "2025-01-21T13:05:00.000Z"
}
```

---

## 🧪 Testing with REST Client

All REST Client test files are available in the `api-tests/` directory:

### Available Test Files

1. **api-tests/auth.http** - Authentication tests (login, register, change password)
2. **api-tests/chapters-units.http** - Chapters and Units CRUD tests (44 test cases)
3. **api-tests/levels-questions.http** - Levels and Questions CRUD tests (44 test cases)
4. **api-tests/progress.http** - Progress tracking tests (33 test cases)

### Setup

1. Install the REST Client extension in VS Code
2. Open any `.http` file
3. Update the token variables at the top:
   ```
   @studentToken = your_student_token_here
   @teacherToken = your_teacher_token_here
   @centerToken = your_center_token_here
   @agencyToken = your_agency_token_here
   ```
4. Click "Send Request" above any test case

---

## 🌐 Testing with cURL

### Get All Chapters

```bash
curl -X GET "http://localhost:4000/api/v1/chapters" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Create a Chapter (Teacher/Center/Agency)

```bash
curl -X POST "http://localhost:4000/api/v1/chapters" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Chapter",
    "description": "Chapter description",
    "orderIndex": 1
  }'
```

### Start a Level (Student)

```bash
curl -X POST "http://localhost:4000/api/v1/progress/levels/1/start" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

---

## ❌ Common Error Responses

### 400 Bad Request - Validation Error

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

### 401 Unauthorized - Missing or Invalid Token

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden - Insufficient Permissions

```json
{
  "statusCode": 403,
  "message": "Forbidden - Only Agency can delete chapters",
  "error": "Forbidden"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Chapter with ID 999 not found",
  "error": "Not Found"
}
```

### 409 Conflict - Duplicate Resource

```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

---

## ✅ Best Practices

### 1. Always Use Integer IDs

All IDs in the system are **integers** (auto-increment), NOT UUIDs.

✅ **Correct**:
```
GET /api/v1/chapters/1
GET /api/v1/units/42
```

❌ **Wrong**:
```
GET /api/v1/chapters/550e8400-e29b-41d4-a716-446655440000
```

### 2. Role-Based Access Control

Understand which roles can perform which operations:

| Operation | Student | Teacher | Center | Agency | Reviewer |
|-----------|---------|---------|--------|--------|----------|
| **GET** (Read) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **POST/PATCH** (Create/Update) | ❌ | ✅ | ✅ | ✅ | ❌ |
| **DELETE** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Progress Operations** | ✅ | ❌ | ❌ | ❌ | ❌ |

### 3. Optional Query Parameters

Use query parameters to control response data:
- `includeUnits=true` - Include nested units in chapter response
- `includeLevels=true` - Include nested levels in unit response
- `includeQuestions=true` - Include nested questions in level response
- `chapterId=1` - Filter units by chapter
- `unitId=1` - Filter levels by unit
- `levelId=1` - Filter questions by level

### 4. Nested Relations

When creating questions with answer options, include them in the same request:

```json
{
  "questionText": "Select the correct answer",
  "answerOptions": [
    { "optionText": "Option A", "isCorrect": true, "orderIndex": 1 },
    { "optionText": "Option B", "isCorrect": false, "orderIndex": 2 }
  ]
}
```

### 5. Progress Tracking Workflow

Always follow this sequence:
1. `POST /progress/levels/:id/start` - Start attempt (creates attemptId)
2. `POST /progress/questions/:id/answer` - Submit answers (use attemptId)
3. `POST /progress/levels/:id/complete` - Mark as complete (use attemptId)
4. `GET /progress/me` - Verify progress was tracked

### 6. Testing Tips

- Use separate user accounts for each role
- Test both success and error cases
- Verify cascade deletes work correctly
- Check that integer IDs are returned (not strings or UUIDs)
- Test filtering and optional parameters
- Verify progress calculations are accurate

---

## 📊 Test Coverage Summary

### Unit Tests
- **Total Test Suites**: 8
- **Total Tests**: 258
- **Chapters**: 43 tests
- **Units**: 51 tests
- **Levels**: 57 tests
- **Questions**: 49 tests
- **Progress**: 58 tests

### E2E Tests
- **Total Test Suites**: 7
- **Total Tests**: 160+
- **Authentication**: 20+ tests
- **Chapters**: 28 tests
- **Units**: 25 tests
- **Levels**: 25 tests
- **Questions**: 24 tests
- **Progress**: 18 tests
- **Integration**: 40+ tests

### REST Client Tests
- **auth.http**: Authentication workflows
- **chapters-units.http**: 44 test cases
- **levels-questions.http**: 44 test cases
- **progress.http**: 33 test cases
- **Total**: 121+ manual test scenarios

---

## 🎯 Quick Start Testing

### 1. Run All Unit Tests

```bash
npm test
```

### 2. Run All E2E Tests

```bash
npm run test:e2e
```

### 3. Run Tests with Coverage

```bash
npm run test:cov
```

### 4. Run Specific Module Tests

```bash
# Unit tests for specific module
npm test -- chapters.service.spec.ts
npm test -- chapters.controller.spec.ts

# E2E tests for specific module
npm run test:e2e -- chapters.e2e-spec.ts
```

---

## 📚 Additional Resources

- **Swagger UI**: `http://localhost:4000/api/docs`
- **API Endpoints Reference**: `/docs/summary/API_ENDPOINTS_WITH_PROGRESS.md`
- **Authentication Guide**: `/docs/summary/AUTH_README.md`
- **Database Schema**: `/docs/summary/DATABASE_SCHEMA.md`
- **Project Structure**: `/docs/summary/PROJECT_STRUCTURE.md`

---

**Generated**: 2025-01-21
**Version**: 1.0
**Week**: 2 - Day 5 Completion
