# Day 2 Plan - Database Seeding & API Testing

**Date**: 2025-11-19
**Status**: 🚀 **IN PROGRESS**
**Duration**: 8 hours (Full work day)

---

## 📋 Day 2 Overview

Building on Day 1's successful module structure and database schema, Day 2 focuses on:
1. **Populating the database** with comprehensive sample data
2. **Testing all API endpoints** to verify functionality
3. **Documenting API responses** for frontend integration

---

## 🎯 Day 2 Objectives

### Morning Session (4 hours): Database Seeding
- Create TypeORM seeding infrastructure
- Generate realistic sample data for all 32 tables
- Test data integrity and relationships
- Verify foreign key constraints

### Afternoon Session (4 hours): API Testing
- Create comprehensive API test collection (Postman/REST Client)
- Test all Phase 1 endpoints (Auth, Chapters, Units, Levels, Questions, Progress)
- Document request/response examples
- Verify authentication and authorization flows
- Test error handling

---

## 📦 Morning: Database Seeding (4 hours)

### Task 1: Setup Seeding Infrastructure (30 min)

**Goal**: Create reusable seeding scripts using TypeORM

**Files to Create**:
```
src/database/
├── seeds/
│   ├── seed.ts                    # Main seeder entry point
│   ├── 1-users.seed.ts            # Seed users (5 roles)
│   ├── 2-chapters.seed.ts         # Seed chapters
│   ├── 3-units.seed.ts            # Seed units
│   ├── 4-levels.seed.ts           # Seed levels
│   ├── 5-questions.seed.ts        # Seed questions + answer options
│   └── 6-progress.seed.ts         # Seed progress data
└── seeders.config.ts              # Seeder configuration
```

**Implementation Steps**:
1. Install seeding dependencies: `@faker-js/faker` for realistic data
2. Create base seeder class with TypeORM connection
3. Add npm script: `"seed:run": "ts-node src/database/seeds/seed.ts"`
4. Add reset script: `"seed:reset": "npm run seed:run -- --reset"`

---

### Task 2: Seed Users Table (30 min)

**Goal**: Create users for all 5 roles with realistic data

**Sample Data Requirements**:

| Role | Count | Purpose |
|------|-------|---------|
| AGENCY | 1 | Super admin account |
| CENTER | 3 | Different organization admins |
| TEACHER | 5 | Instructors from various centers |
| REVIEWER | 2 | Content moderators |
| STUDENT | 20 | Test students for progress tracking |

**Content Structure**:
- 4 chapters
- 4 units per chapter (16 total)
- 4 levels per unit (64 total)
- 10 questions per level (640 total)
- 4 answer options per question (2560 total)

**User Schema**:
```typescript
{
  email: 'agency@storyquest.com',
  username: 'agency_admin',
  password: 'Password123',  // Hashed with bcrypt
  fullName: 'Agency Administrator',
  role: 'agency',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

**Test Credentials** (for manual testing):
- Agency: `agency@storyquest.com` / `Password123`
- Center: `center1@storyquest.com` / `Password123`
- Teacher: `teacher1@storyquest.com` / `Password123`
- Reviewer: `reviewer1@storyquest.com` / `Password123`
- Student: `student1@test.com` / `Password123`

---

### Task 3: Seed Content Tables (90 min)

**Goal**: Create learning content hierarchy

#### Chapters (4 chapters)
```typescript
[
  { title: 'Greetings & Introductions', description: 'Learn basic greetings', orderIndex: 1 },
  { title: 'Numbers & Counting', description: 'Count from 1 to 100', orderIndex: 2 },
  { title: 'Colors & Shapes', description: 'Identify colors and shapes', orderIndex: 3 },
  { title: 'Family & Friends', description: 'Talk about family members', orderIndex: 4 }
]
```

#### Units (4 units per chapter = 16 units)
```typescript
Chapter 1 → Units:
  - Unit 1: "Hello & Goodbye" (4 levels)
  - Unit 2: "My Name Is..." (4 levels)
  - Unit 3: "How Are You?" (4 levels)
  - Unit 4: "Nice to Meet You" (4 levels)
```

#### Levels (4 levels per unit = 64 levels)
```typescript
Unit 1 → Levels:
  - Level 1: "Beginner - Basic Hello" (timeLimit: 60, passingScore: 70)
  - Level 2: "Easy - Greeting Friends" (timeLimit: 90, passingScore: 75)
  - Level 3: "Medium - Formal Greetings" (timeLimit: 120, passingScore: 80)
  - Level 4: "Hard - Advanced Conversations" (timeLimit: 150, passingScore: 85)
```

#### Questions (10 questions per level = 640 questions)
```typescript
{
  levelId: 1,
  questionType: 'select_right_answer',
  questionText: 'What is the correct greeting?',
  audioUrl: 'https://storage.example.com/audio/hello.mp3',
  imageUrl: 'https://storage.example.com/images/greeting.jpg',
  points: 10,
  orderIndex: 1,
  answerOptions: [
    { optionText: 'Hello', isCorrect: true, orderIndex: 1 },
    { optionText: 'Goodbye', isCorrect: false, orderIndex: 2 },
    { optionText: 'Maybe', isCorrect: false, orderIndex: 3 },
    { optionText: 'Thanks', isCorrect: false, orderIndex: 4 }
  ]
}
```

**Question Type Distribution**:
- 40% `select_right_answer` (multiple choice)
- 30% `fill_in_blank` (type the answer)
- 20% `sort_words` (arrange words in order)
- 10% `talk_to_speech_compare` (pronunciation)

---

### Task 4: Seed Progress Data (60 min)

**Goal**: Create realistic student progress for testing

**Progress Requirements**:

1. **Student Level Attempts** (500+ attempts)
   - Mix of completed and in-progress levels
   - Various scores (50-100)
   - Different time spent values
   - Some failed attempts (score < passingScore)

2. **Student Question Answers** (~5000 records)
   - Link to level attempts
   - Mix of correct/incorrect answers
   - Points earned tracking

3. **Student Unit Progress** (auto-calculated)
   - Track completed levels per unit
   - Calculate average scores

4. **Student Chapter Progress** (auto-calculated)
   - Track completed units per chapter
   - Calculate overall chapter progress

**Sample Progress Scenarios**:
- Student 1: Completed Chapter 1 (100%), working on Chapter 2 (40%)
- Student 2: Just started, completed 2 levels in Chapter 1
- Student 3: Advanced learner, completed Chapters 1-3, working on Chapter 4
- Student 4-20: Various progress stages for realistic testing

---

### Task 5: Verify Data Integrity (30 min)

**Verification Checklist**:

- [ ] All foreign keys properly linked
- [ ] No orphaned records
- [ ] Cascade deletes work correctly
- [ ] Order indexes are sequential
- [ ] Scores are within valid ranges (0-100)
- [ ] Timestamps are realistic
- [ ] User passwords are hashed
- [ ] User roles are valid enum values
- [ ] Question types are valid enum values
- [ ] At least one correct answer per question

**SQL Verification Queries**:
```sql
-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'chapters', COUNT(*) FROM chapters
UNION ALL
SELECT 'units', COUNT(*) FROM units
UNION ALL
SELECT 'levels', COUNT(*) FROM levels
UNION ALL
SELECT 'questions', COUNT(*) FROM questions
UNION ALL
SELECT 'answer_options', COUNT(*) FROM answer_options
UNION ALL
SELECT 'student_level_attempts', COUNT(*) FROM student_level_attempts
UNION ALL
SELECT 'student_question_answers', COUNT(*) FROM student_question_answers;

-- Verify foreign key relationships
SELECT COUNT(*) FROM units WHERE chapter_id NOT IN (SELECT id FROM chapters); -- Should be 0
SELECT COUNT(*) FROM levels WHERE unit_id NOT IN (SELECT id FROM units); -- Should be 0
SELECT COUNT(*) FROM questions WHERE level_id NOT IN (SELECT id FROM levels); -- Should be 0

-- Verify at least one correct answer per question
SELECT q.id, q.question_text
FROM questions q
WHERE NOT EXISTS (
  SELECT 1 FROM answer_options ao
  WHERE ao.question_id = q.id AND ao.is_correct = true
); -- Should return empty
```

---

## 🧪 Afternoon: API Testing (4 hours)

### Task 6: Setup API Testing Tools (30 min)

**Option A: Postman Collection**
- Install Postman Desktop or use web version
- Create new collection: "Story Quest API - Phase 1"
- Setup environment variables

**Option B: REST Client (VS Code)**
- Install "REST Client" extension
- Create `api-tests/` folder
- Create `.http` files for each module

**Environment Variables** (both tools):
```
BASE_URL=http://localhost:3000/api/v1
AGENCY_TOKEN=<will be set after login>
CENTER_TOKEN=<will be set after login>
TEACHER_TOKEN=<will be set after login>
STUDENT_TOKEN=<will be set after login>
```

---

### Task 7: Test Authentication Endpoints (45 min)

**Endpoints to Test**:

#### 1. Health Check
```http
GET {{BASE_URL}}/auth/health
```
Expected: `200 OK` with `{ status: 'ok' }`

#### 2. Register New User
```http
POST {{BASE_URL}}/auth/register
Content-Type: application/json

{
  "email": "newstudent@test.com",
  "username": "newstudent123",
  "password": "Password123",
  "fullName": "New Student",
  "role": "student"
}
```
Expected: `201 Created` with user object + JWT token

#### 3. Login (All Roles)
```http
POST {{BASE_URL}}/auth/login
Content-Type: application/json

{
  "identifier": "student1@test.com",
  "password": "Password123"
}
```
Expected: `200 OK` with JWT token

**Test Matrix**:
- [ ] Student login successful
- [ ] Teacher login successful
- [ ] Center login successful
- [ ] Agency login successful
- [ ] Reviewer login successful
- [ ] Invalid credentials return 401
- [ ] Missing fields return 400
- [ ] Weak password rejected

#### 4. Get Current User
```http
GET {{BASE_URL}}/auth/me
Authorization: Bearer {{STUDENT_TOKEN}}
```
Expected: `200 OK` with user profile

#### 5. Change Password
```http
PATCH {{BASE_URL}}/auth/change-password
Authorization: Bearer {{STUDENT_TOKEN}}
Content-Type: application/json

{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456"
}
```
Expected: `200 OK` with success message

---

### Task 8: Test Content Endpoints (60 min)

#### Chapters API

**1. Get All Chapters**
```http
GET {{BASE_URL}}/chapters
Authorization: Bearer {{STUDENT_TOKEN}}
```
Expected: Array of chapters with `orderIndex` sorting

**2. Get Chapter by ID**
```http
GET {{BASE_URL}}/chapters/1
Authorization: Bearer {{STUDENT_TOKEN}}
```
Expected: Chapter object with units array

**3. Create Chapter (Teacher/Admin only)**
```http
POST {{BASE_URL}}/chapters
Authorization: Bearer {{TEACHER_TOKEN}}
Content-Type: application/json

{
  "title": "Test Chapter",
  "description": "Testing chapter creation",
  "orderIndex": 99
}
```
Expected: `201 Created` or `403 Forbidden` (if role not allowed)

**4. Update Chapter**
```http
PATCH {{BASE_URL}}/chapters/1
Authorization: Bearer {{TEACHER_TOKEN}}
Content-Type: application/json

{
  "title": "Updated Title"
}
```

**5. Delete Chapter**
```http
DELETE {{BASE_URL}}/chapters/99
Authorization: Bearer {{TEACHER_TOKEN}}
```

#### Units API (similar tests)
- GET `/units` - List all units
- GET `/units/:id` - Get unit with levels
- POST `/units` - Create unit
- PATCH `/units/:id` - Update unit
- DELETE `/units/:id` - Delete unit

#### Levels API (similar tests)
- GET `/levels` - List all levels
- GET `/levels/:id` - Get level with questions
- POST `/levels` - Create level
- PATCH `/levels/:id` - Update level
- DELETE `/levels/:id` - Delete level

#### Questions API (similar tests)
- GET `/questions` - List all questions
- GET `/questions/:id` - Get question with answer options
- POST `/questions` - Create question
- PATCH `/questions/:id` - Update question
- DELETE `/questions/:id` - Delete question

---

### Task 9: Test Progress Tracking Endpoints (60 min)

**1. Get Student Progress Summary**
```http
GET {{BASE_URL}}/progress/me
Authorization: Bearer {{STUDENT_TOKEN}}
```
Expected: Complete progress overview with chapters, units, levels

**2. Start Level Attempt**
```http
POST {{BASE_URL}}/progress/levels/1/start
Authorization: Bearer {{STUDENT_TOKEN}}
```
Expected: `201 Created` with attempt object

**3. Submit Answer**
```http
POST {{BASE_URL}}/progress/questions/1/answer
Authorization: Bearer {{STUDENT_TOKEN}}
Content-Type: application/json

{
  "attemptId": 1,
  "selectedOptionId": 2,
  "timeSpent": 15
}
```
Expected: Immediate feedback with `isCorrect` and `pointsEarned`

**4. Complete Level**
```http
POST {{BASE_URL}}/progress/levels/1/complete
Authorization: Bearer {{STUDENT_TOKEN}}
Content-Type: application/json

{
  "attemptId": 1,
  "finalScore": 85,
  "totalTimeSpent": 120
}
```
Expected: Level completion summary with pass/fail status

**5. Get Chapter Progress**
```http
GET {{BASE_URL}}/progress/chapters/1
Authorization: Bearer {{STUDENT_TOKEN}}
```
Expected: Chapter progress with unit breakdown

**6. Get Unit Progress**
```http
GET {{BASE_URL}}/progress/units/1
Authorization: Bearer {{STUDENT_TOKEN}}
```
Expected: Unit progress with level details

---

### Task 10: Test Authorization & Error Handling (45 min)

**Authorization Tests**:

1. **No Token**
```http
GET {{BASE_URL}}/chapters
# No Authorization header
```
Expected: `401 Unauthorized`

2. **Invalid Token**
```http
GET {{BASE_URL}}/chapters
Authorization: Bearer invalid_token_here
```
Expected: `401 Unauthorized`

3. **Wrong Role**
```http
POST {{BASE_URL}}/chapters
Authorization: Bearer {{STUDENT_TOKEN}}
# Students shouldn't create chapters
```
Expected: `403 Forbidden`

**Error Handling Tests**:

1. **Invalid ID**
```http
GET {{BASE_URL}}/chapters/99999
Authorization: Bearer {{STUDENT_TOKEN}}
```
Expected: `404 Not Found`

2. **Validation Errors**
```http
POST {{BASE_URL}}/auth/register
Content-Type: application/json

{
  "email": "invalid-email",
  "username": "ab",
  "password": "123"
}
```
Expected: `400 Bad Request` with validation error details

3. **Missing Required Fields**
```http
POST {{BASE_URL}}/chapters
Authorization: Bearer {{TEACHER_TOKEN}}
Content-Type: application/json

{
  "title": "Only Title"
}
```
Expected: `400 Bad Request`

---

### Task 11: Document API Responses (30 min)

**Create**: `docs/API_TEST_RESULTS.md`

Document each endpoint with:
- Request method and URL
- Required headers
- Request body example
- Success response example
- Error response examples
- Notes and observations

**Example Template**:
```markdown
## POST /api/v1/auth/register

**Description**: Register a new user account

**Authentication**: None (public endpoint)

**Request Body**:
```json
{
  "email": "student@test.com",
  "username": "student123",
  "password": "Password123",
  "fullName": "Test Student",
  "role": "student"
}
```

**Success Response** (201 Created):
```json
{
  "user": {
    "id": 1,
    "email": "student@test.com",
    "username": "student123",
    "fullName": "Test Student",
    "role": "student",
    "isActive": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- `400` - Validation failed (weak password, invalid email)
- `409` - Email or username already exists
```

---

## ✅ Day 2 Completion Checklist

### Morning: Database Seeding
- [ ] Seeding infrastructure created
- [ ] 31 users seeded (1 agency, 3 centers, 5 teachers, 2 reviewers, 20 students)
- [ ] 10 chapters seeded
- [ ] 40 units seeded (3-5 per chapter)
- [ ] 150 levels seeded (3-5 per unit)
- [ ] 1000+ questions seeded with answer options
- [ ] 500+ student level attempts seeded
- [ ] 5000+ student question answers seeded
- [ ] Data integrity verified (foreign keys, constraints)
- [ ] Test credentials documented

### Afternoon: API Testing
- [ ] API testing tool setup (Postman or REST Client)
- [ ] Auth endpoints tested (register, login, me, change-password)
- [ ] Chapters CRUD tested
- [ ] Units CRUD tested
- [ ] Levels CRUD tested
- [ ] Questions CRUD tested
- [ ] Progress tracking tested (start, answer, complete)
- [ ] Authorization verified (role-based access)
- [ ] Error handling verified (401, 403, 404, 400)
- [ ] API responses documented

---

## 📊 Expected Outcomes

By end of Day 2, you will have:

1. **Fully Populated Database**
   - 31 users across 5 roles
   - 10 chapters → 40 units → 150 levels → 1000+ questions
   - Realistic student progress data
   - All relationships properly established

2. **Tested API**
   - All Phase 1 endpoints verified working
   - Authentication flow confirmed
   - Authorization rules enforced
   - Error handling validated

3. **Documentation**
   - API test collection (Postman/REST Client)
   - API response examples documented
   - Test credentials list
   - Known issues log (if any)

4. **Development Confidence**
   - Backend API proven stable
   - Ready for frontend integration
   - Data models validated with real data
   - Performance baseline established

---

## 🚀 Day 3 Preview

With database seeded and APIs tested, Day 3 will focus on:
- Flutter mobile app minimal setup
- React web dashboard minimal setup
- API integration testing from both clients
- Documentation for frontend developers

---

**Created**: 2025-11-19
**Status**: Ready to Execute
**Time Estimate**: 8 hours
**Prerequisites**: ✅ Day 1 Complete (Module structure + Database schema)
