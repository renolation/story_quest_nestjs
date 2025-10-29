# NestJS Backend API Expert Guidelines

## 🎯 App Overview
Story Quest is an English learning app designed for students in grades 3–5 (ages 8–11), especially those living in rural areas of Vietnam. The backend provides secure API endpoints, manages user data, tracks learning progress, handles AI story generation, and ensures safe content delivery for children.

The backend's primary responsibilities include:
- **Authentication & Authorization**: Secure JWT-based authentication for students, teachers, and admins
- **Content Management**: Chapters, Units, Levels, and Questions CRUD operations
- **Progress Tracking**: Real-time monitoring of student learning progress and achievements
- **AI Integration**: Story generation using OpenAI/Gemini APIs with content moderation
- **Speech Services**: Text-to-Speech and pronunciation validation
- **Analytics & Reporting**: Learning metrics for students, teachers, and parents
- **COPPA Compliance**: Child-safe data handling and privacy protection

---

## 🤖 SUBAGENT DELEGATION SYSTEM 🤖
**CRITICAL: BE PROACTIVE WITH SUBAGENTS! YOU HAVE SPECIALIZED EXPERTS AVAILABLE!**

### 🚨 DELEGATION MINDSET
**Instead of thinking "I'll handle this myself"** → **Think: "Which specialist is BEST suited for this task?"**

### 📋 AVAILABLE SPECIALISTS

#### 🗄️ **nestjs-database-expert**
- **MUST BE USED for**: TypeORM entities, database migrations, relationships (one-to-many, many-to-many), repositories, query optimization, database transactions, progress tracking data models
- **Triggers**: "entity", "database", "migration", "repository", "TypeORM", "relationships", "query", "progress tracking", "student data"

#### 🔐 **nestjs-auth-expert**
- **MUST BE USED for**: JWT authentication, passport strategies, guards, role-based access control (RBAC), password hashing, refresh tokens, session management, COPPA-compliant auth
- **Triggers**: "authentication", "JWT", "guard", "passport", "authorization", "RBAC", "login", "security", "token", "role-based"

#### 🏗️ **nestjs-architecture-expert**
- **MUST BE USED for**: Module organization, dependency injection, clean architecture, design patterns, service layers, feature structuring, DTOs, exception filters, interceptors
- **Triggers**: "architecture", "module", "dependency injection", "structure", "design pattern", "service", "clean code", "organization"

#### 💳 **nestjs-subscription-expert**
- **MUST BE USED for**: In-app purchase verification, App Store/Play Store API integration, subscription management, webhook handling, receipt validation, subscription business logic
- **Triggers**: "subscription", "IAP", "in-app purchase", "App Store", "Play Store", "receipt validation", "subscription management"

#### 🌐 **nestjs-api-expert**
- **MUST BE USED for**: REST API controllers, DTOs, validation pipes, Swagger documentation, request/response handling, pagination, filtering, sorting, API versioning
- **Triggers**: "controller", "API endpoint", "DTO", "validation", "Swagger", "REST", "HTTP", "request", "response"

#### ⚡ **nestjs-performance-expert**
- **MUST BE USED for**: Caching (Redis), query optimization, rate limiting, compression, API performance, database indexing, response time optimization, background jobs (Bull)
- **Triggers**: "performance", "cache", "Redis", "optimization", "rate limiting", "slow query", "background job", "Bull queue"

### 🎯 DELEGATION STRATEGY
**BEFORE starting ANY task, ASK YOURSELF:**
1. "Which of my specialists could handle this better?"
2. "Should I break this into parts for different specialists?"
3. "Would a specialist complete this faster and better?"

### 💼 WORK BALANCE RECOMMENDATION:
- **Simple Tasks (20%)**: Handle independently - quick fixes, minor updates
- **Complex Tasks (80%)**: Delegate to specialists for expert-level results

### 🔧 HOW TO DELEGATE
```
# Explicit delegation examples:
> Use the nestjs-database-expert to create TypeORM entities for chapters, units, levels, and questions
> Have the nestjs-auth-expert implement JWT authentication with role-based guards
> Ask the nestjs-architecture-expert to structure the modules following clean architecture
> Use the nestjs-api-expert to create REST endpoints with Swagger documentation
> Have the nestjs-performance-expert implement Redis caching for frequently accessed content
> Ask the nestjs-subscription-expert to integrate App Store/Play Store subscription verification
```

---

## 🏗️ Tech Stack & Architecture

### Core Technologies
- **Node.js 20+**: LTS version for production stability
- **NestJS 10+**: Progressive Node.js framework
- **TypeScript 5+**: Strict mode enabled
- **PostgreSQL 15+**: Primary relational database
- **Redis**: Caching and session management
- **TypeORM**: Database ORM with migrations
- **Passport.js**: Authentication middleware
- **JWT**: Stateless authentication
- **Class Validator**: DTO validation
- **Class Transformer**: Object transformation

### Architecture Pattern
- **Clean Architecture**: Separation of concerns (controllers, services, repositories)
- **Feature-First Structure**: Organize by domain (auth, users, chapters, progress, etc.)
- **CQRS Pattern**: Command/Query separation for complex operations
- **Repository Pattern**: Data access abstraction
- **Dependency Injection**: Built-in NestJS DI container

### External Services
- **OpenAI API / Gemini API**: AI story generation
- **AWS S3 / Cloudflare R2**: File storage (audio, images)
- **Google Cloud TTS**: Text-to-speech generation
- **Firebase Cloud Messaging**: Push notifications
- **Sentry**: Error monitoring and logging
- **Stripe / In-App Purchase**: Payment processing (premium features)

---

## 📁 Project Structure

```
src/
├── main.ts                      # Application entry point
├── app.module.ts                # Root module
├── config/
│   ├── database.config.ts       # Database configuration
│   ├── jwt.config.ts            # JWT configuration
│   ├── redis.config.ts          # Redis configuration
│   ├── aws.config.ts            # AWS S3 configuration
│   └── ai.config.ts             # AI service configuration
├── common/
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   ├── current-user.decorator.ts
│   │   └── public.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── throttle.guard.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   ├── transform.interceptor.ts
│   │   └── cache.interceptor.ts
│   ├── pipes/
│   │   ├── validation.pipe.ts
│   │   └── parse-uuid.pipe.ts
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   └── all-exceptions.filter.ts
│   ├── constants/
│   │   ├── roles.constant.ts
│   │   ├── question-types.constant.ts
│   │   └── placement-positions.constant.ts
│   └── interfaces/
│       ├── jwt-payload.interface.ts
│       └── pagination.interface.ts
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       ├── register.dto.ts
│   │       └── refresh-token.dto.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── user-response.dto.ts
│   │   └── repositories/
│   │       └── users.repository.ts
│   ├── chapters/
│   │   ├── chapters.module.ts
│   │   ├── chapters.controller.ts
│   │   ├── chapters.service.ts
│   │   ├── entities/
│   │   │   └── chapter.entity.ts
│   │   └── dto/
│   │       ├── create-chapter.dto.ts
│   │       └── update-chapter.dto.ts
│   ├── units/
│   │   ├── units.module.ts
│   │   ├── units.controller.ts
│   │   ├── units.service.ts
│   │   ├── entities/
│   │   │   └── unit.entity.ts
│   │   └── dto/
│   │       ├── create-unit.dto.ts
│   │       └── update-unit.dto.ts
│   ├── levels/
│   │   ├── levels.module.ts
│   │   ├── levels.controller.ts
│   │   ├── levels.service.ts
│   │   ├── entities/
│   │   │   └── level.entity.ts
│   │   └── dto/
│   │       ├── create-level.dto.ts
│   │       └── update-level.dto.ts
│   ├── questions/
│   │   ├── questions.module.ts
│   │   ├── questions.controller.ts
│   │   ├── questions.service.ts
│   │   ├── entities/
│   │   │   ├── question.entity.ts
│   │   │   └── answer-option.entity.ts
│   │   └── dto/
│   │       ├── create-question.dto.ts
│   │       ├── create-answer-option.dto.ts
│   │       └── question-response.dto.ts
│   ├── progress/
│   │   ├── progress.module.ts
│   │   ├── progress.controller.ts
│   │   ├── progress.service.ts
│   │   ├── entities/
│   │   │   ├── student-level-attempt.entity.ts
│   │   │   ├── student-question-answer.entity.ts
│   │   │   ├── student-unit-progress.entity.ts
│   │   │   └── student-chapter-progress.entity.ts
│   │   └── dto/
│   │       ├── start-level-attempt.dto.ts
│   │       ├── submit-answer.dto.ts
│   │       ├── complete-level.dto.ts
│   │       └── progress-summary.dto.ts
│   ├── stories/
│   │   ├── stories.module.ts
│   │   ├── stories.controller.ts
│   │   ├── stories.service.ts
│   │   ├── ai-story-generator.service.ts
│   │   ├── entities/
│   │   │   └── story.entity.ts
│   │   └── dto/
│   │       ├── generate-story.dto.ts
│   │       └── story-response.dto.ts
│   ├── teachers/
│   │   ├── teachers.module.ts
│   │   ├── teachers.controller.ts
│   │   ├── teachers.service.ts
│   │   ├── entities/
│   │   │   └── teacher-student.entity.ts
│   │   └── dto/
│   │       ├── assign-student.dto.ts
│   │       └── student-list-response.dto.ts
│   ├── analytics/
│   │   ├── analytics.module.ts
│   │   ├── analytics.controller.ts
│   │   ├── analytics.service.ts
│   │   └── dto/
│   │       ├── learning-stats.dto.ts
│   │       └── performance-report.dto.ts
│   ├── storage/
│   │   ├── storage.module.ts
│   │   ├── storage.service.ts
│   │   └── dto/
│   │       └── upload-file.dto.ts
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   ├── notifications.service.ts
│   │   └── dto/
│   │       └── send-notification.dto.ts
│   └── health/
│       ├── health.module.ts
│       └── health.controller.ts
└── database/
    ├── migrations/
    │   └── *.ts
    └── seeds/
        └── *.ts
```

---

## 🗄️ Database Schema Overview

### Entity Relationship Structure
```
users (admin, teacher, student)
  ↓ (one-to-many)
teacher_students (teacher-student relationships)
  ↓
chapters (order_index)
  ↓ (one-to-many)
units (chapter_id, order_index)
  ↓ (one-to-many)
levels (unit_id, order_index, time_limit, passing_score)
  ↓ (one-to-many)
questions (level_id, question_type, points)
  ↓ (one-to-many)
answer_options (question_id, is_correct)

student_level_attempts (student_id, level_id, score, time_spent)
  ↓ (one-to-many)
student_question_answers (attempt_id, question_id, is_correct, points_earned)

student_unit_progress (student_id, unit_id, completed_levels, average_score)
student_chapter_progress (student_id, chapter_id, completed_units, average_score)
```

### Key Enums
```typescript
// User roles
enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student'
}

// Question types
enum QuestionType {
  FILL_IN_BLANK = 'fill_in_blank',
  TALK_TO_SPEECH_COMPARE = 'talk_to_speech_compare',
  SORT_WORDS = 'sort_words',
  SELECT_RIGHT_ANSWER = 'select_right_answer'
}

// Placement positions
enum PlacementPosition {
  TOP_LEFT = 'top_left',
  TOP_RIGHT = 'top_right',
  BOTTOM_LEFT = 'bottom_left',
  BOTTOM_RIGHT = 'bottom_right'
}
```

### Critical Database Features
1. **UUID Primary Keys**: All tables use UUIDs for security
2. **Cascade Deletes**: Proper foreign key relationships with cascading
3. **Indexes**: Optimized for query performance on frequently accessed fields
4. **Triggers**: Auto-update timestamps, role validation
5. **Constraints**: Data integrity checks (scores 0-100, positive values)
6. **Role Validation**: Database-level triggers ensure correct user roles

---

## 🔐 Authentication & Authorization

### JWT Strategy
```typescript
// JWT Payload structure
interface JwtPayload {
  sub: string;        // User ID (UUID)
  email: string;
  username: string;
  role: UserRole;
  iat: number;        // Issued at
  exp: number;        // Expiration
}

// Token expiration
ACCESS_TOKEN_EXPIRY = '15m';    // 15 minutes
REFRESH_TOKEN_EXPIRY = '7d';    // 7 days
```

### Role-Based Access Control (RBAC)
```typescript
// Role hierarchy
ADMIN    > TEACHER > STUDENT
  ↓          ↓         ↓
All     Assigned   Own data
access   students    only

// Guards implementation
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
export class TeachersController {
  // Only teachers and admins can access
}
```

### Security Best Practices
```typescript
// Password hashing
- Use bcrypt with 10 salt rounds
- Never store plain text passwords
- Implement password strength validation

// Token security
- Store refresh tokens in httpOnly cookies
- Implement token blacklisting for logout
- Rotate refresh tokens on use
- Use short-lived access tokens

// Child safety (COPPA compliance)
- No personal data collection without consent
- Parental controls for students under 13
- Data minimization principle
- Secure audio recording storage (temporary only)
```

---

## 🌐 API Design Guidelines

### RESTful Conventions
```typescript
// Resource naming (plural, kebab-case)
GET    /api/v1/chapters                    // List all chapters
GET    /api/v1/chapters/:id                // Get chapter by ID
POST   /api/v1/chapters                    // Create chapter
PUT    /api/v1/chapters/:id                // Update chapter
DELETE /api/v1/chapters/:id                // Delete chapter

// Nested resources
GET    /api/v1/chapters/:id/units          // Get units in chapter
GET    /api/v1/units/:id/levels            // Get levels in unit
GET    /api/v1/levels/:id/questions        // Get questions in level

// Progress tracking
POST   /api/v1/progress/levels/:id/start   // Start level attempt
POST   /api/v1/progress/questions/:id/answer // Submit answer
POST   /api/v1/progress/levels/:id/complete // Complete level
GET    /api/v1/progress/me                 // Get my progress
GET    /api/v1/progress/students/:id       // Get student progress (teachers)

// Auth endpoints
POST   /api/v1/auth/register               // Student registration
POST   /api/v1/auth/login                  // Login
POST   /api/v1/auth/refresh                // Refresh token
POST   /api/v1/auth/logout                 // Logout
GET    /api/v1/auth/me                     // Get current user
```

### Response Format Standards
```typescript
// Success response
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}

// Status codes
200 - OK (successful GET, PUT)
201 - Created (successful POST)
204 - No Content (successful DELETE)
400 - Bad Request (validation error)
401 - Unauthorized (authentication required)
403 - Forbidden (insufficient permissions)
404 - Not Found (resource doesn't exist)
409 - Conflict (duplicate resource)
422 - Unprocessable Entity (business logic error)
429 - Too Many Requests (rate limit exceeded)
500 - Internal Server Error
```

### Pagination & Filtering
```typescript
// Query parameters
GET /api/v1/chapters?page=1&limit=20&orderBy=order_index&order=ASC&search=basic

// DTO implementation
class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  orderBy?: string = 'created_at';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsString()
  search?: string;
}
```

### Swagger Documentation
```typescript
// Controller documentation
@ApiTags('Chapters')
@ApiBearerAuth()
@Controller('chapters')
export class ChaptersController {

  @Get()
  @ApiOperation({ summary: 'Get all chapters' })
  @ApiResponse({ status: 200, description: 'Chapters retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() paginationDto: PaginationDto) {
    // Implementation
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new chapter' })
  @ApiResponse({ status: 201, description: 'Chapter created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBody({ type: CreateChapterDto })
  async create(@Body() createChapterDto: CreateChapterDto) {
    // Implementation
  }
}
```

---

## 📊 Progress Tracking System

### Level Attempt Flow
```typescript
// 1. Start level attempt
POST /api/v1/progress/levels/:levelId/start
Request: {
  "studentId": "uuid"
}
Response: {
  "attemptId": "uuid",
  "levelId": "uuid",
  "questions": [...],
  "timeLimit": 300,
  "totalPoints": 100,
  "startedAt": "2025-01-15T10:00:00Z"
}

// 2. Submit individual answers
POST /api/v1/progress/questions/:questionId/answer
Request: {
  "attemptId": "uuid",
  "selectedOptionId": "uuid",  // for multiple choice
  "answerText": "hello",       // for fill-in-blank
  "answerAudioUrl": "...",     // for speech
  "timeSpentSeconds": 12
}
Response: {
  "isCorrect": true,
  "pointsEarned": 10,
  "feedback": "Great job!",
  "explanation": "..."
}

// 3. Complete level
POST /api/v1/progress/levels/:levelId/complete
Request: {
  "attemptId": "uuid"
}
Response: {
  "score": 85,
  "totalPointsEarned": 85,
  "timeSpentSeconds": 240,
  "isPassed": true,
  "correctAnswers": 8,
  "totalQuestions": 10,
  "achievements": [...]
}
```

### Progress Summary Calculation
```typescript
// Auto-update on level completion
- Update student_level_attempts
- Aggregate into student_unit_progress
- Aggregate into student_chapter_progress
- Calculate average scores
- Update completion percentages
- Update last_accessed_at timestamps

// Caching strategy
- Cache progress summaries in Redis (TTL: 5 minutes)
- Invalidate cache on new completions
- Cache key pattern: `progress:student:{studentId}:unit:{unitId}`
```

---

## 🤖 AI Story Generation

### Story Generation Prompt Engineering
```typescript
interface GenerateStoryDto {
  genre: 'mystery' | 'fairy_tale' | 'mythology' | 'daily_life';
  targetWords: string[];         // 5-10 vocabulary words
  grammarFocus: string;          // e.g., "present_simple"
  gradeLevel: 3 | 4 | 5;
  wordCount: number;             // 200-400
  difficulty: 'easy' | 'medium' | 'hard';
  childRole: string;             // "detective", "hero", etc.
}

// AI service integration
class AIStoryGeneratorService {
  async generateStory(prompt: GenerateStoryDto): Promise<Story> {
    const systemPrompt = `You are a children's story writer specializing in English education for Vietnamese students.`;

    const userPrompt = `
      Generate an engaging ${prompt.genre} story for grade ${prompt.gradeLevel}.

      Requirements:
      - Word count: ${prompt.wordCount} words
      - Difficulty: ${prompt.difficulty}
      - Target vocabulary: ${prompt.targetWords.join(', ')}
      - Grammar focus: ${prompt.grammarFocus}
      - Child's role: ${prompt.childRole}

      The story should:
      1. Have clear beginning, middle, and end
      2. Include dialogue for speaking practice
      3. Use target vocabulary naturally
      4. Feature relatable characters for 8-11 year olds
      5. Have 3-5 interactive decision points
      6. End with comprehension questions

      Return JSON format:
      {
        "title": "...",
        "scenes": [
          {
            "sceneNumber": 1,
            "text": "...",
            "imagePrompt": "...",
            "vocabularyWords": ["word1", "word2"],
            "interactionPoint": {
              "question": "...",
              "choices": ["A", "B"]
            }
          }
        ],
        "comprehensionQuestions": [...]
      }
    `;

    // Call OpenAI/Gemini API
    const response = await this.aiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Content moderation
    await this.moderateContent(response);

    // Parse and store story
    return this.parseAndStoreStory(response);
  }

  async moderateContent(content: string): Promise<void> {
    // Check for inappropriate content
    // Age-appropriate validation
    // Cultural sensitivity check
    // Educational value verification
  }
}
```

### Content Moderation Rules
```typescript
// Content filtering
const BLOCKED_TOPICS = [
  'violence', 'weapons', 'adult themes',
  'political', 'religious extremism', 'drugs'
];

const REQUIRED_ELEMENTS = [
  'educational value',
  'age-appropriate language',
  'positive messaging',
  'cultural sensitivity'
];

// Automated checks
- Run AI moderation API
- Check against blocked word list
- Validate vocabulary complexity
- Ensure educational alignment
- Review for COPPA compliance
```

---

## ⚡ Performance Optimization

### Caching Strategy
```typescript
// Redis cache patterns
'chapter:all' => All chapters list (TTL: 1 hour)
'chapter:{id}' => Single chapter (TTL: 1 hour)
'unit:chapter:{id}' => Units in chapter (TTL: 30 min)
'level:unit:{id}' => Levels in unit (TTL: 30 min)
'questions:level:{id}' => Questions in level (TTL: 1 hour)
'progress:student:{id}' => Student progress summary (TTL: 5 min)
'leaderboard:unit:{id}' => Unit leaderboard (TTL: 15 min)

// Cache invalidation
- Invalidate on content updates (chapters, units, levels)
- Invalidate progress on submission
- Use cache tags for bulk invalidation
- Implement cache warming for popular content
```

### Database Query Optimization
```typescript
// Use eager loading for relations
await this.chaptersRepository.find({
  relations: ['units', 'units.levels'],
  where: { isActive: true },
  order: { orderIndex: 'ASC' }
});

// Implement database indexes (already in schema)
- idx_users_role
- idx_users_email
- idx_chapters_order
- idx_units_chapter
- idx_levels_unit
- idx_questions_level
- idx_student_level_attempts_student
- idx_student_question_answers_attempt

// Query optimization
- Use select specific fields
- Implement pagination
- Use raw queries for complex aggregations
- Enable query result caching
```

### Rate Limiting
```typescript
// Throttle configuration
@Throttle(10, 60) // 10 requests per 60 seconds
export class PublicController {}

@Throttle(100, 60) // 100 requests per minute for authenticated
export class ProtectedController {}

// AI API rate limiting
@Throttle(5, 3600) // 5 story generations per hour
async generateStory() {}

// Speech recognition rate limiting
@Throttle(30, 60) // 30 pronunciation attempts per minute
async validatePronunciation() {}
```

### Response Compression
```typescript
// Enable gzip compression
import * as compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6
}));
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Example: Progress service test
describe('ProgressService', () => {
  let service: ProgressService;
  let repository: Repository<StudentLevelAttempt>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: getRepositoryToken(StudentLevelAttempt),
          useClass: Repository
        }
      ]
    }).compile();

    service = module.get<ProgressService>(ProgressService);
    repository = module.get(getRepositoryToken(StudentLevelAttempt));
  });

  describe('startLevelAttempt', () => {
    it('should create a new level attempt', async () => {
      const dto = { studentId: 'uuid', levelId: 'uuid' };
      const result = await service.startLevelAttempt(dto);

      expect(result).toBeDefined();
      expect(result.studentId).toBe(dto.studentId);
      expect(result.isCompleted).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('should calculate score correctly', () => {
      const score = service.calculateScore(8, 10); // 8 correct out of 10
      expect(score).toBe(80);
    });
  });
});
```

### Integration Tests
```typescript
// Example: E2E test for level completion flow
describe('Level Completion Flow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login and get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'student@test.com', password: 'password123' })
      .expect(200);

    authToken = loginResponse.body.data.accessToken;
  });

  it('should complete full level attempt flow', async () => {
    // 1. Start level attempt
    const startResponse = await request(app.getHttpServer())
      .post('/progress/levels/level-uuid/start')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

    const attemptId = startResponse.body.data.attemptId;

    // 2. Submit answers
    const questions = startResponse.body.data.questions;
    for (const question of questions) {
      await request(app.getHttpServer())
        .post(`/progress/questions/${question.id}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          attemptId,
          selectedOptionId: question.answerOptions[0].id,
          timeSpentSeconds: 10
        })
        .expect(201);
    }

    // 3. Complete level
    const completeResponse = await request(app.getHttpServer())
      .post('/progress/levels/level-uuid/complete')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ attemptId })
      .expect(200);

    expect(completeResponse.body.data.score).toBeGreaterThanOrEqual(0);
    expect(completeResponse.body.data.isCompleted).toBe(true);
  });
});
```

### Testing Checklist
- [ ] Unit tests for all services (>80% coverage)
- [ ] Integration tests for critical flows
- [ ] E2E tests for user journeys
- [ ] Database migration tests
- [ ] Authentication/authorization tests
- [ ] API validation tests
- [ ] Error handling tests
- [ ] Performance tests (load testing)
- [ ] Security tests (penetration testing)

---

## 🔒 Security Best Practices

### Input Validation
```typescript
// DTO validation with class-validator
class CreateQuestionDto {
  @IsNotEmpty()
  @IsUUID()
  levelId: string;

  @IsEnum(QuestionType)
  questionType: QuestionType;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  questionText: string;

  @IsOptional()
  @IsUrl()
  questionAudioUrl?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  points: number;
}

// Sanitize user input
import * as sanitizeHtml from 'sanitize-html';

const cleanText = sanitizeHtml(userInput, {
  allowedTags: [],
  allowedAttributes: {}
});
```

### SQL Injection Prevention
```typescript
// Use TypeORM parameterized queries
// NEVER concatenate user input into queries

// ✅ SAFE
await this.repository.findOne({
  where: { email: userEmail }
});

// ❌ UNSAFE
await this.repository.query(
  `SELECT * FROM users WHERE email = '${userEmail}'`
);
```

### XSS Prevention
```typescript
// Helmet for security headers
import helmet from 'helmet';
app.use(helmet());

// CORS configuration
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

### COPPA Compliance (Child Safety)
```typescript
// Data minimization
- Collect ONLY necessary data
- Use anonymous IDs instead of real names
- Store audio temporarily (max 24 hours)
- No location tracking
- No behavioral advertising

// Parental consent
- Require parental email for student accounts
- Send verification email to parents
- Implement parental dashboard
- Allow data export/deletion requests

// Secure data storage
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement audit logging
- Regular security audits
```

---

## 🚀 Deployment & DevOps

### Environment Configuration
```bash
# .env.example
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=secure_password
DB_DATABASE=english_app

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=super_secret_key_change_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=english-app-storage

# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4

# Gemini
GEMINI_API_KEY=

# Google Cloud TTS
GOOGLE_APPLICATION_CREDENTIALS=

# Sentry
SENTRY_DSN=

# Rate limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# CORS
ALLOWED_ORIGINS=https://app.storyquest.com,https://admin.storyquest.com
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: english_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: myregistry/english-api:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deploy to AWS ECS, Kubernetes, or your platform
```

### Database Migrations
```bash
# Generate migration
npm run migration:generate -- -n CreateUsersTable

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert

# Show migrations
npm run migration:show
```

---

## 📚 Key NestJS Packages

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.1.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/jwt": "^10.1.0",
    "@nestjs/swagger": "^7.1.0",
    "@nestjs/throttler": "^5.0.0",
    "@nestjs/cache-manager": "^2.1.0",
    "@nestjs/bull": "^10.0.0",

    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "redis": "^4.6.0",
    "cache-manager": "^5.2.0",
    "cache-manager-redis-store": "^3.0.0",

    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "@nestjs/jwt": "^10.1.0",
    "bcrypt": "^5.1.1",

    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",

    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "sanitize-html": "^2.11.0",

    "openai": "^4.20.0",
    "@google-cloud/text-to-speech": "^5.0.0",
    "aws-sdk": "^2.1500.0",

    "@sentry/node": "^7.85.0",
    "winston": "^3.11.0",

    "bull": "^4.12.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.17",
    "@types/passport-jwt": "^3.0.9",
    "@types/bcrypt": "^5.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "prettier": "^3.0.0",
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "typescript": "^5.1.3"
  }
}
```

---

## 🎯 Code Style & Conventions

### Naming Conventions
```typescript
// Classes: PascalCase
class UserService {}
class CreateUserDto {}

// Files: kebab-case
user.service.ts
create-user.dto.ts
jwt-auth.guard.ts

// Variables & functions: camelCase
const currentUser = ...;
async function generateStory() {}

// Constants: UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5;
const JWT_EXPIRY_SECONDS = 900;

// Interfaces: PascalCase with 'I' prefix (optional)
interface JwtPayload {}
interface IUserRepository {}

// Enums: PascalCase with UPPER_CASE values
enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student'
}
```

### File Organization
```typescript
// Import order
1. Node.js built-in modules
import { join } from 'path';

2. External packages
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

3. Internal modules (absolute imports)
import { User } from '@/modules/users/entities/user.entity';
import { JwtPayload } from '@/common/interfaces/jwt-payload.interface';

4. Relative imports
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './repositories/users.repository';
```

### Documentation
```typescript
/**
 * Service responsible for managing user progress tracking
 * including level attempts, question answers, and progress summaries.
 */
@Injectable()
export class ProgressService {

  /**
   * Starts a new level attempt for a student
   *
   * @param studentId - UUID of the student
   * @param levelId - UUID of the level
   * @returns Created attempt with questions and metadata
   * @throws NotFoundException if level doesn't exist
   * @throws BadRequestException if student has incomplete attempt
   */
  async startLevelAttempt(
    studentId: string,
    levelId: string
  ): Promise<StudentLevelAttempt> {
    // Implementation
  }
}
```

---

## 📊 Monitoring & Logging

### Logging Strategy
```typescript
// Winston logger configuration
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context }) => {
          return `${timestamp} [${context}] ${level}: ${message}`;
        })
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.json()
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.json()
    })
  ]
});

// Usage in services
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async createUser(dto: CreateUserDto) {
    this.logger.log(`Creating user: ${dto.email}`);
    try {
      // Logic
      this.logger.log(`User created successfully: ${user.id}`);
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### Error Monitoring
```typescript
// Sentry integration
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

// Custom exception filter
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Log to Sentry
    Sentry.captureException(exception);

    // Return response
    response.status(status).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
}
```

### Health Checks
```typescript
// Health check controller
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
      () => this.checkExternalAPI()
    ]);
  }

  private async checkExternalAPI(): Promise<HealthIndicatorResult> {
    // Check OpenAI/Gemini API health
    return { externalAPI: { status: 'up' } };
  }
}
```

---

## 🎯 Success Metrics

### Technical KPIs
- **API Response Time**: <200ms for 95th percentile
- **Database Query Time**: <50ms average
- **Uptime**: 99.9% availability
- **Error Rate**: <0.1% of requests
- **Cache Hit Rate**: >80% for frequently accessed data

### Business KPIs
- **User Registration**: Track new student/teacher sign-ups
- **Level Completion Rate**: % of started levels that are completed
- **Average Score**: Track learning effectiveness
- **Time to Complete**: Monitor engagement duration
- **API Usage**: Track feature adoption

---

## 📞 Support & Maintenance

### Error Monitoring
- Sentry for real-time error tracking
- Winston for structured logging
- CloudWatch/Datadog for infrastructure monitoring
- API performance monitoring with New Relic/AppSignal

### Backup Strategy
```bash
# Automated daily PostgreSQL backups
pg_dump -U postgres english_app > backup_$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup_*.sql s3://backups/database/

# Retention: 30 days daily, 12 weeks weekly, 12 months monthly
```

### Maintenance Tasks
- [ ] Weekly: Review error logs and fix critical issues
- [ ] Monthly: Database optimization (VACUUM, ANALYZE)
- [ ] Monthly: Security updates for dependencies
- [ ] Quarterly: Performance audit and optimization
- [ ] Quarterly: Security penetration testing
- [ ] Yearly: Major version upgrades

---

**Remember**: This backend serves children's education. Prioritize **security**, **privacy**, **reliability**, and **performance**. Every API should be designed with child safety and COPPA compliance in mind.

Happy coding! 🚀🔒🎓
