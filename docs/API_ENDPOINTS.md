# API Endpoints Reference

## Base URL

```
Development: http://localhost:3000/api/v1
Production: https://api.storyquest.com/api/v1
```

## Swagger Documentation

Interactive API documentation available at:
- **Development**: http://localhost:3000/api/docs
- **Swagger JSON**: http://localhost:3000/api/docs-json

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## Phase 1: Core Foundation

### Authentication Endpoints

#### POST /auth/register
Register a new student account (public endpoint - mobile app only).

**Request Body:**
```json
{
  "email": "student@example.com",
  "username": "student123",
  "password": "Password123!",
  "fullName": "Nguyễn Văn An",
  "phone": "0123456789",
  "dateOfBirth": "2015-06-15"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "email": "student@example.com",
    "username": "student123",
    "fullName": "Nguyễn Văn An",
    "role": "student",
    "isActive": true,
    "createdAt": "2025-11-20T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Validation failed (weak password, invalid email)
- `409` - Email or username already exists

---

#### POST /auth/login
Login with email/username and password.

**Request Body:**
```json
{
  "identifier": "student1@test.com",
  "password": "Password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "student1@test.com",
    "username": "student1",
    "fullName": "Student One",
    "role": "student",
    "isActive": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401` - Invalid credentials
- `400` - Missing identifier or password

---

#### GET /auth/me
Get current authenticated user profile.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "student1@test.com",
  "username": "student1",
  "fullName": "Student One",
  "role": "student",
  "phone": "0123456789",
  "avatarUrl": null,
  "isActive": true,
  "createdAt": "2025-11-20T10:00:00.000Z"
}
```

**Error Responses:**
- `401` - Unauthorized (invalid or missing token)

---

#### PATCH /auth/change-password
Change user password.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400` - Validation failed (weak new password)
- `401` - Current password incorrect
- `401` - Unauthorized

---

#### POST /auth/users
Create a new user (hierarchical permissions - web dashboard only).

**Allowed Roles**:
- AGENCY can create: CENTER, TEACHER, REVIEWER, STUDENT
- CENTER can create: TEACHER, STUDENT
- TEACHER can create: STUDENT

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "teacher1@center.com",
  "username": "teacher1",
  "password": "Password123!",
  "fullName": "Teacher Name",
  "role": "teacher"
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "email": "teacher1@center.com",
  "username": "teacher1",
  "fullName": "Teacher Name",
  "role": "teacher",
  "isActive": true,
  "createdAt": "2025-11-20T10:00:00.000Z"
}
```

**Error Responses:**
- `403` - Forbidden (insufficient permissions)
- `409` - Email or username already exists

---

#### GET /auth/health
Health check endpoint (public).

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T10:25:10.082Z",
  "service": "authentication"
}
```

---

### Chapters Endpoints

#### GET /chapters
Get all chapters with optional progress data.

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `includeProgress` (boolean, optional) - Include user progress data

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Greetings & Introductions",
    "description": "Learn basic greetings and introductions",
    "thumbnailUrl": "https://storage.example.com/chapters/1.jpg",
    "orderIndex": 1,
    "isActive": true,
    "progress": {
      "totalUnits": 5,
      "completedUnits": 3,
      "averageScore": 84.5,
      "completionPercentage": 60
    }
  }
]
```

---

#### GET /chapters/:id
Get a single chapter by ID with units.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Greetings & Introductions",
  "description": "Learn basic greetings",
  "thumbnailUrl": "https://storage.example.com/chapters/1.jpg",
  "orderIndex": 1,
  "isActive": true,
  "units": [
    {
      "id": 1,
      "title": "Hello & Goodbye",
      "description": "Basic greetings",
      "orderIndex": 1,
      "levelCount": 3
    }
  ],
  "progress": {
    "totalUnits": 5,
    "completedUnits": 3,
    "averageScore": 84.5
  }
}
```

**Error Responses:**
- `404` - Chapter not found

---

#### POST /chapters
Create a new chapter (teacher/admin only).

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Chapter",
  "description": "Chapter description",
  "thumbnailUrl": "https://storage.example.com/chapters/new.jpg",
  "orderIndex": 11
}
```

**Response:** `201 Created`
```json
{
  "id": 11,
  "title": "New Chapter",
  "description": "Chapter description",
  "thumbnailUrl": "https://storage.example.com/chapters/new.jpg",
  "orderIndex": 11,
  "isActive": true,
  "createdAt": "2025-11-20T10:00:00.000Z"
}
```

**Error Responses:**
- `403` - Forbidden (insufficient permissions)
- `400` - Validation failed

---

#### PATCH /chapters/:id
Update a chapter (teacher/admin only).

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Updated Title",
  "description": "Updated description",
  "updatedAt": "2025-11-20T11:00:00.000Z"
}
```

---

#### DELETE /chapters/:id
Delete a chapter (admin only).

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `204 No Content`

**Error Responses:**
- `403` - Forbidden
- `404` - Chapter not found

---

### Units Endpoints

#### GET /units
Get all units or filter by chapter.

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `chapterId` (integer, optional) - Filter by chapter

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "chapterId": 1,
    "title": "Hello & Goodbye",
    "description": "Basic greetings",
    "orderIndex": 1,
    "isActive": true,
    "levelCount": 3,
    "progress": {
      "totalLevels": 3,
      "completedLevels": 2,
      "averageScore": 85.0
    }
  }
]
```

---

#### GET /units/:id
Get a single unit with levels.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "chapterId": 1,
  "title": "Hello & Goodbye",
  "description": "Basic greetings",
  "orderIndex": 1,
  "isActive": true,
  "levels": [
    {
      "id": 1,
      "title": "Easy - Basic Hello",
      "difficulty": "easy",
      "timeLimitSeconds": 60,
      "passingScore": 70,
      "questionCount": 8,
      "orderIndex": 1
    }
  ]
}
```

---

#### POST /units
Create a new unit (teacher/admin only).

**Request Body:**
```json
{
  "chapterId": 1,
  "title": "New Unit",
  "description": "Unit description",
  "orderIndex": 6
}
```

**Response:** `201 Created`

---

#### PATCH /units/:id
Update a unit (teacher/admin only).

**Response:** `200 OK`

---

#### DELETE /units/:id
Delete a unit (admin only).

**Response:** `204 No Content`

---

### Levels Endpoints

#### GET /levels
Get all levels or filter by unit.

**Query Parameters:**
- `unitId` (integer, optional)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "unitId": 1,
    "title": "Easy - Basic Hello",
    "description": "Learn basic hello phrases",
    "difficulty": "easy",
    "timeLimitSeconds": 60,
    "passingScore": 70,
    "orderIndex": 1,
    "questionCount": 8,
    "isActive": true
  }
]
```

---

#### GET /levels/:id
Get a single level with questions.

**Response:** `200 OK`
```json
{
  "id": 1,
  "unitId": 1,
  "title": "Easy - Basic Hello",
  "difficulty": "easy",
  "timeLimitSeconds": 60,
  "passingScore": 70,
  "questions": [
    {
      "id": 1,
      "questionType": "select_right_answer",
      "questionText": "What is the correct greeting?",
      "questionAudioUrl": "https://storage.example.com/audio/hello.mp3",
      "questionImageUrl": "https://storage.example.com/images/greeting.jpg",
      "points": 10,
      "orderIndex": 1,
      "answerOptions": [
        {
          "id": 1,
          "optionText": "Hello",
          "isCorrect": true,
          "orderIndex": 1
        },
        {
          "id": 2,
          "optionText": "Goodbye",
          "isCorrect": false,
          "orderIndex": 2
        }
      ]
    }
  ]
}
```

---

#### POST /levels
Create a new level (teacher/admin only).

**Request Body:**
```json
{
  "unitId": 1,
  "title": "Hard - Advanced Greetings",
  "description": "Advanced greeting scenarios",
  "difficulty": "hard",
  "timeLimitSeconds": 120,
  "passingScore": 80,
  "orderIndex": 4
}
```

**Response:** `201 Created`

---

### Questions Endpoints

#### GET /questions
Get all questions or filter by level.

**Query Parameters:**
- `levelId` (integer, optional)

**Response:** `200 OK`

---

#### GET /questions/:id
Get a single question with answer options.

**Response:** `200 OK`

---

#### POST /questions
Create a new question (teacher/admin only).

**Request Body:**
```json
{
  "levelId": 1,
  "questionType": "select_right_answer",
  "questionText": "Choose the correct word",
  "questionAudioUrl": "https://storage.example.com/audio/q1.mp3",
  "points": 10,
  "orderIndex": 9,
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
    }
  ]
}
```

**Response:** `201 Created`

---

## Phase 2: Progress Tracking

### Progress Endpoints

#### POST /progress/levels/:id/start
Start a new level attempt.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "studentId": 1,
  "levelId": 1,
  "isCompleted": false,
  "isPassed": false,
  "startedAt": "2025-11-20T10:00:00.000Z"
}
```

---

#### POST /progress/questions/:id/answer
Submit an answer to a question.

**Request Body:**
```json
{
  "attemptId": 1,
  "selectedOptionId": 2,
  "timeSpentSeconds": 15
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "questionId": 1,
  "isCorrect": true,
  "pointsEarned": 10,
  "feedback": "Correct! Great job!"
}
```

---

#### POST /progress/levels/:id/complete
Complete a level attempt.

**Request Body:**
```json
{
  "attemptId": 1,
  "finalScore": 85,
  "totalTimeSpentSeconds": 120
}
```

**Response:** `200 OK`
```json
{
  "attemptId": 1,
  "levelId": 1,
  "score": 85,
  "passed": true,
  "passingScore": 70,
  "completedAt": "2025-11-20T10:02:00.000Z",
  "message": "Congratulations! You passed this level!"
}
```

---

#### GET /progress/me
Get current student's complete progress summary.

**Response:** `200 OK`
```json
{
  "studentId": 1,
  "totalChapters": 10,
  "completedChapters": 2,
  "overallAverageScore": 82.5,
  "totalTimeSpentSeconds": 7200,
  "chapters": [
    {
      "chapterId": 1,
      "title": "Greetings & Introductions",
      "completedUnits": 4,
      "totalUnits": 5,
      "averageScore": 84.0,
      "progress": 80
    }
  ]
}
```

---

#### GET /progress/chapters/:id
Get progress for a specific chapter.

**Response:** `200 OK`
```json
{
  "chapterId": 1,
  "studentId": 1,
  "totalUnits": 5,
  "completedUnits": 4,
  "averageScore": 84.0,
  "units": [
    {
      "unitId": 1,
      "title": "Hello & Goodbye",
      "completedLevels": 3,
      "totalLevels": 3,
      "averageScore": 90.0
    }
  ]
}
```

---

#### GET /progress/units/:id
Get progress for a specific unit.

**Response:** `200 OK`
```json
{
  "unitId": 1,
  "studentId": 1,
  "totalLevels": 3,
  "completedLevels": 3,
  "averageScore": 90.0,
  "levels": [
    {
      "levelId": 1,
      "title": "Easy - Basic Hello",
      "attempts": 2,
      "bestScore": 95,
      "passed": true
    }
  ]
}
```

---

## Common Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful (GET, PUT, PATCH) |
| 201 | Created | Resource created successfully (POST) |
| 204 | No Content | Resource deleted successfully (DELETE) |
| 400 | Bad Request | Validation error or malformed request |
| 401 | Unauthorized | Authentication required or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (email/username exists) |
| 422 | Unprocessable Entity | Business logic error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

---

## Rate Limiting

Default rate limits:
- **Public endpoints**: 10 requests per minute
- **Authenticated endpoints**: 100 requests per minute
- **AI endpoints** (Phase 5): 5 requests per hour

---

## Pagination

For endpoints that return lists, pagination is supported:

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)

**Response Headers:**
```http
X-Total-Count: 150
X-Page: 1
X-Per-Page: 20
X-Total-Pages: 8
```

---

## Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"student1@test.com","password":"Password123"}'

# Get chapters (with token)
curl -X GET http://localhost:3000/api/v1/chapters \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using REST Client (VS Code)

See `api-tests/` folder for `.http` files with all endpoints.

---

**Last Updated**: 2025-11-20
**Version**: 1.0
**Status**: ✅ Phase 1 & 2 Complete
