# Project Structure

## Overview
This document describes the complete folder structure and architecture of the Story Quest NestJS backend API.

---

## 📁 Root Directory Structure

```
/
├── src/                        # Application source code
├── test/                       # E2E test files
├── docs/                       # Documentation files
├── dist/                       # Compiled output (generated)
├── node_modules/              # Dependencies (generated)
├── .env                        # Environment variables (not in git)
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── nest-cli.json              # NestJS CLI configuration
├── Dockerfile                 # Docker container definition
├── docker-compose.dev.yml     # Docker compose for deployment
└── README.md                  # Project overview
```

---

## 📂 Source Code Structure (`/src`)

```
src/
├── main.ts                      # Application entry point
├── app.module.ts                # Root module
├── config/                      # Configuration files
├── common/                      # Shared resources
├── modules/                     # Feature modules
└── database/                    # Database migrations & seeds
```

---

## ⚙️ Configuration (`/src/config`)

Configuration files for various services and integrations:

```
config/
├── database.config.ts           # PostgreSQL connection settings
├── jwt.config.ts                # JWT authentication config
├── redis.config.ts              # Redis cache configuration
├── aws.config.ts                # AWS S3 file storage
└── ai.config.ts                 # OpenAI/Gemini API settings
```

**Purpose:**
- Centralized configuration management
- Environment variable loading
- Type-safe configuration objects
- Easy to test and mock

---

## 🔧 Common Resources (`/src/common`)

Shared utilities, decorators, guards, and interfaces used across the application:

```
common/
├── decorators/
│   ├── index.ts                     # Export all decorators
│   ├── roles.decorator.ts           # @Roles() for RBAC
│   ├── current-user.decorator.ts    # @CurrentUser() to get authenticated user
│   ├── public.decorator.ts          # @Public() to bypass auth
│   └── match.decorator.ts           # @Match() for password confirmation
│
├── guards/
│   ├── jwt-auth.guard.ts            # Global JWT authentication
│   ├── local-auth.guard.ts          # Username/password guard
│   ├── roles.guard.ts               # Role-based authorization
│   └── throttle.guard.ts            # Rate limiting guard
│
├── interceptors/
│   ├── logging.interceptor.ts       # Request/response logging
│   ├── transform.interceptor.ts     # Response transformation
│   └── cache.interceptor.ts         # Response caching
│
├── pipes/
│   ├── validation.pipe.ts           # Global validation pipe
│   └── parse-int.pipe.ts            # Parse integer parameters
│
├── filters/
│   ├── http-exception.filter.ts     # HTTP error handler
│   └── all-exceptions.filter.ts     # Global exception handler
│
├── constants/
│   ├── roles.constant.ts            # User roles enum
│   ├── question-types.constant.ts   # Question type enum
│   └── placement-positions.constant.ts  # UI placement enum
│
└── interfaces/
    ├── jwt-payload.interface.ts     # JWT token payload type
    └── pagination.interface.ts      # Pagination metadata type
```

---

## 🏗️ Feature Modules (`/src/modules`)

Each module represents a feature domain with its own controllers, services, entities, and DTOs:

### Authentication Module (`auth/`)

```
modules/auth/
├── auth.module.ts               # Module definition
├── auth.controller.ts           # Auth endpoints
├── auth.service.ts              # Auth business logic
├── strategies/
│   ├── jwt.strategy.ts          # JWT token validation
│   └── local.strategy.ts        # Email/password validation
└── dto/
    ├── index.ts                 # Export all DTOs
    ├── login.dto.ts             # Login request
    ├── register.dto.ts          # Registration request
    ├── change-password.dto.ts   # Password change request
    └── auth-response.dto.ts     # Auth response format
```

**Endpoints:**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user
- `PATCH /auth/change-password` - Change password
- `GET /auth/health` - Health check (public)

---

### Users Module (`users/`)

```
modules/users/
├── users.module.ts              # Module definition
├── users.controller.ts          # User CRUD endpoints
├── users.service.ts             # User business logic
├── entities/
│   └── user.entity.ts           # User database entity
├── dto/
│   ├── index.ts                 # Export all DTOs
│   ├── create-user.dto.ts       # User creation
│   ├── update-user.dto.ts       # User update
│   └── user-response.dto.ts     # User response format
└── repositories/
    └── users.repository.ts      # Custom user queries
```

**Entity Fields:**
- `id` (INT, Primary Key, Auto-increment)
- `email` (VARCHAR, Unique, Indexed)
- `username` (VARCHAR, Unique)
- `passwordHash` (VARCHAR, Not exposed in API)
- `fullName` (VARCHAR)
- `role` (ENUM: student, teacher, admin)
- `avatarUrl` (VARCHAR, Optional)
- `isActive` (BOOLEAN, Default: true)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

---

### Chapters Module (`chapters/`)

```
modules/chapters/
├── chapters.module.ts           # Module definition
├── chapters.controller.ts       # Chapter CRUD endpoints
├── chapters.service.ts          # Chapter business logic
├── entities/
│   └── chapter.entity.ts        # Chapter database entity
└── dto/
    ├── create-chapter.dto.ts    # Chapter creation
    ├── update-chapter.dto.ts    # Chapter update
    └── chapter-response.dto.ts  # Chapter with progress
```

**Entity Fields:**
- `id` (INT, Primary Key)
- `title` (VARCHAR)
- `description` (TEXT)
- `thumbnailUrl` (VARCHAR)
- `orderIndex` (INT, for ordering)
- `isActive` (BOOLEAN)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

**Relationships:**
- One-to-many with Units

---

### Units Module (`units/`)

```
modules/units/
├── units.module.ts              # Module definition
├── units.controller.ts          # Unit CRUD endpoints
├── units.service.ts             # Unit business logic
├── entities/
│   └── unit.entity.ts           # Unit database entity
└── dto/
    ├── create-unit.dto.ts       # Unit creation
    ├── update-unit.dto.ts       # Unit update
    └── unit-response.dto.ts     # Unit with progress
```

**Entity Fields:**
- `id` (INT, Primary Key)
- `chapterId` (INT, Foreign Key → chapters.id)
- `title` (VARCHAR)
- `description` (TEXT)
- `orderIndex` (INT)
- `isActive` (BOOLEAN)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

**Relationships:**
- Many-to-one with Chapter
- One-to-many with Levels

---

### Levels Module (`levels/`)

```
modules/levels/
├── levels.module.ts             # Module definition
├── levels.controller.ts         # Level CRUD endpoints
├── levels.service.ts            # Level business logic
├── entities/
│   └── level.entity.ts          # Level database entity
└── dto/
    ├── create-level.dto.ts      # Level creation
    ├── update-level.dto.ts      # Level update
    └── level-response.dto.ts    # Level with progress
```

**Entity Fields:**
- `id` (INT, Primary Key)
- `unitId` (INT, Foreign Key → units.id)
- `title` (VARCHAR)
- `description` (TEXT)
- `orderIndex` (INT)
- `timeLimitSeconds` (INT)
- `passingScore` (INT, 0-100)
- `isActive` (BOOLEAN)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

**Relationships:**
- Many-to-one with Unit
- One-to-many with Questions

---

### Questions Module (`questions/`)

```
modules/questions/
├── questions.module.ts          # Module definition
├── questions.controller.ts      # Question CRUD endpoints
├── questions.service.ts         # Question business logic
├── entities/
│   ├── question.entity.ts       # Question entity
│   └── answer-option.entity.ts  # Answer options entity
└── dto/
    ├── create-question.dto.ts        # Question creation
    ├── create-answer-option.dto.ts   # Answer option creation
    └── question-response.dto.ts      # Question with options
```

**Question Entity Fields:**
- `id` (INT, Primary Key)
- `levelId` (INT, Foreign Key → levels.id)
- `questionType` (ENUM: fill_in_blank, talk_to_speech_compare, sort_words, select_right_answer)
- `questionText` (TEXT)
- `questionAudioUrl` (VARCHAR, Optional)
- `correctAnswer` (VARCHAR, Optional, for fill-in-blank)
- `correctAnswerAudioUrl` (VARCHAR, Optional)
- `points` (INT)
- `orderIndex` (INT)
- `placementPosition` (ENUM: top_left, top_right, bottom_left, bottom_right, Optional)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

**Answer Option Entity Fields:**
- `id` (INT, Primary Key)
- `questionId` (INT, Foreign Key → questions.id)
- `optionText` (VARCHAR)
- `optionAudioUrl` (VARCHAR, Optional)
- `isCorrect` (BOOLEAN)
- `orderIndex` (INT)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

---

### Progress Module (`progress/`)

```
modules/progress/
├── progress.module.ts           # Module definition
├── progress.controller.ts       # Progress endpoints
├── progress.service.ts          # Progress tracking logic
├── entities/
│   ├── student-level-attempt.entity.ts       # Individual level attempts
│   ├── student-question-answer.entity.ts     # Answer records
│   ├── student-unit-progress.entity.ts       # Aggregated unit progress
│   └── student-chapter-progress.entity.ts    # Aggregated chapter progress
└── dto/
    ├── start-level-attempt.dto.ts       # Start level
    ├── submit-answer.dto.ts             # Submit answer
    ├── complete-level.dto.ts            # Complete level
    ├── progress-summary.dto.ts          # Progress overview
    ├── chapter-progress.dto.ts          # Chapter progress
    ├── unit-progress.dto.ts             # Unit progress
    └── level-progress.dto.ts            # Level progress
```

**Student Level Attempt Fields:**
- `id` (INT, Primary Key)
- `studentId` (INT, Foreign Key → users.id)
- `levelId` (INT, Foreign Key → levels.id)
- `score` (INT, 0-100)
- `pointsEarned` (INT)
- `timeSpentSeconds` (INT)
- `isCompleted` (BOOLEAN)
- `isPassed` (BOOLEAN)
- `startedAt` (TIMESTAMP)
- `completedAt` (TIMESTAMP, Nullable)

**Student Question Answer Fields:**
- `id` (INT, Primary Key)
- `attemptId` (INT, Foreign Key → student_level_attempts.id)
- `questionId` (INT, Foreign Key → questions.id)
- `studentId` (INT, Foreign Key → users.id)
- `selectedOptionId` (INT, Foreign Key → answer_options.id, Nullable)
- `answerText` (VARCHAR, Nullable, for fill-in-blank)
- `answerAudioUrl` (VARCHAR, Nullable, for speech)
- `isCorrect` (BOOLEAN)
- `pointsEarned` (INT)
- `timeSpentSeconds` (INT)
- `answeredAt` (TIMESTAMP)

---

### Stories Module (`stories/`)

```
modules/stories/
├── stories.module.ts            # Module definition
├── stories.controller.ts        # Story endpoints
├── stories.service.ts           # Story management
├── ai-story-generator.service.ts # AI integration
├── entities/
│   └── story.entity.ts          # Story entity
└── dto/
    ├── generate-story.dto.ts    # Story generation params
    └── story-response.dto.ts    # Story with scenes
```

---

### Teachers Module (`teachers/`)

```
modules/teachers/
├── teachers.module.ts           # Module definition
├── teachers.controller.ts       # Teacher-specific endpoints
├── teachers.service.ts          # Teacher operations
├── entities/
│   └── teacher-student.entity.ts # Teacher-student relationships
└── dto/
    ├── assign-student.dto.ts         # Assign student to teacher
    └── student-list-response.dto.ts  # Student list with progress
```

---

### Analytics Module (`analytics/`)

```
modules/analytics/
├── analytics.module.ts          # Module definition
├── analytics.controller.ts      # Analytics endpoints
├── analytics.service.ts         # Analytics calculations
└── dto/
    ├── learning-stats.dto.ts         # Learning statistics
    └── performance-report.dto.ts     # Performance metrics
```

---

### Storage Module (`storage/`)

```
modules/storage/
├── storage.module.ts            # Module definition
├── storage.service.ts           # File upload/download
└── dto/
    └── upload-file.dto.ts       # File upload metadata
```

**Features:**
- AWS S3 / Cloudflare R2 integration
- Audio file storage
- Image upload
- Secure URL generation

---

### Notifications Module (`notifications/`)

```
modules/notifications/
├── notifications.module.ts      # Module definition
├── notifications.service.ts     # Push notifications
└── dto/
    └── send-notification.dto.ts # Notification payload
```

**Features:**
- Firebase Cloud Messaging
- Push notifications to mobile apps
- In-app notifications

---

### Health Module (`health/`)

```
modules/health/
├── health.module.ts             # Module definition
└── health.controller.ts         # Health check endpoints
```

**Endpoints:**
- `GET /health` - Overall health
- Database connectivity check
- Redis connectivity check
- External API health

---

## 🗄️ Database (`/src/database`)

```
database/
├── migrations/
│   ├── 1736688000000-ChangeIdFromUuidToInt.ts  # UUID to INT migration
│   └── *.ts                     # Other migrations
└── seeds/
    └── *.ts                     # Seed data scripts
```

**Migration Commands:**
```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert

# Show migration status
npm run migration:show
```

---

## 📊 Database Schema Summary

### Core Tables
- `users` - User accounts (students, teachers, admins)
- `chapters` - Top-level curriculum organization
- `units` - Chapter subdivisions
- `levels` - Learning activities within units
- `questions` - Individual questions in levels
- `answer_options` - Multiple choice options

### Progress Tracking Tables
- `student_level_attempts` - Individual level attempts
- `student_question_answers` - Answer records
- `student_unit_progress` - Aggregated unit progress
- `student_chapter_progress` - Aggregated chapter progress

### Relationship Tables
- `teacher_students` - Teacher-student assignments

### Story Tables
- `stories` - AI-generated stories
- `story_scenes` - Story scene content

---

## 🎯 Key Design Patterns

### 1. Feature Module Pattern
Each domain (auth, users, chapters, etc.) is a self-contained module with:
- Controller (API endpoints)
- Service (business logic)
- Entity (database model)
- DTOs (data validation)
- Repository (optional, for complex queries)

### 2. Dependency Injection
All services are injectable and follow NestJS DI principles:
```typescript
@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter)
    private readonly chaptersRepository: Repository<Chapter>,
    private readonly progressService: ProgressService,
  ) {}
}
```

### 3. Repository Pattern
Custom repositories for complex queries:
```typescript
@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    // Custom query logic
  }
}
```

### 4. DTO Validation
All inputs validated with class-validator:
```typescript
export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(0)
  orderIndex: number;
}
```

### 5. Response Transformation
Consistent response format:
```typescript
{
  "id": 1,
  "title": "Basic Greetings",
  "progress": {
    "completedUnits": 3,
    "totalUnits": 5
  }
}
```

---

## 🔒 Security Architecture

### Authentication Flow
```
1. User sends credentials
2. LocalStrategy validates email/password
3. AuthService generates JWT token
4. JWT includes: { sub, email, username, role }
5. Client stores token
6. Future requests include: Authorization: Bearer <token>
7. JwtAuthGuard validates token
8. JwtStrategy verifies user still exists and is active
9. Request proceeds with user context
```

### Authorization Flow
```
1. Request arrives with JWT token
2. JwtAuthGuard validates token
3. RolesGuard checks user role
4. @Roles decorator specifies allowed roles
5. If authorized, request proceeds
6. If not, 403 Forbidden returned
```

---

## 📝 Code Organization Best Practices

### Naming Conventions
- **Files:** kebab-case (`user.entity.ts`, `create-user.dto.ts`)
- **Classes:** PascalCase (`UserEntity`, `CreateUserDto`)
- **Variables/Functions:** camelCase (`currentUser`, `findById()`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_LOGIN_ATTEMPTS`)

### Import Order
1. Node.js built-in modules
2. External packages
3. Internal modules (absolute imports)
4. Relative imports

### Module Exports
```typescript
// Good: Export from index
export * from './dto';
export * from './entities';

// Then import like:
import { CreateUserDto } from './users/dto';
```

---

## 🧪 Testing Structure

```
test/
├── app.e2e-spec.ts              # End-to-end tests
├── auth.e2e-spec.ts             # Auth flow tests
├── chapters.e2e-spec.ts         # Chapter API tests
└── jest-e2e.json                # E2E test configuration
```

**Test Commands:**
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

---

## 📦 Build Output (`/dist`)

Compiled TypeScript output (generated by `npm run build`):

```
dist/
├── main.js                      # Entry point
├── app.module.js                # Root module
├── config/                      # Compiled config
├── common/                      # Compiled common
├── modules/                     # Compiled modules
└── database/                    # Compiled migrations
```

---

## 🚀 Deployment Structure

### Docker Files
- `Dockerfile` - Multi-stage production build
- `docker-compose.dev.yml` - Development deployment
- `.dockerignore` - Files to exclude from Docker build

### Production Build
```bash
# Build application
npm run build

# Start production server
npm run start:prod

# Docker deployment
docker-compose -f docker-compose.dev.yml up -d --build
```

---

## 📚 Documentation Files (`/docs`)

- `PROJECT_STRUCTURE.md` - This file
- `API_DESIGN_GUIDELINES.md` - API standards and conventions
- `AUTH_README.md` - Authentication system documentation
- `PROGRESS_TRACKING_IMPLEMENTATION.md` - Progress tracking details
- `API_ENDPOINTS_WITH_PROGRESS.md` - Complete API reference
- `USER_CREATION_IMPLEMENTATION.md` - User registration flow
- `CHANGE_PASSWORD_IMPLEMENTATION.md` - Password change implementation
- `UUID_TO_INT_MIGRATION_SUMMARY.md` - Database migration details
- `DOCKER.md` - Docker deployment guide

---

## 🔗 Related Documentation

- [API Design Guidelines](API_DESIGN_GUIDELINES.md)
- [Main Guidelines](../CLAUDE.md)
- [Progress Tracking](PROGRESS_TRACKING_IMPLEMENTATION.md)
- [Authentication](AUTH_README.md)

---

**Last Updated:** 2025-01-13
**Status:** ✅ Complete and Up-to-date
