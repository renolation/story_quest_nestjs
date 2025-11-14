# NestJS Backend API Expert Guidelines

## 🎯 App Overview
Story Quest is an English learning app designed for students in grades 3–5 (ages 8–11), especially those living in rural areas of Vietnam. The backend provides secure API endpoints, manages user data, tracks learning progress, handles AI story generation, and ensures safe content delivery for children.

The backend's primary responsibilities include:
- **Authentication & Authorization**: JWT-based authentication with role-based access control
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

## 📚 Complete Documentation

### 📁 [Project Structure](./docs/PROJECT_STRUCTURE.md)
Complete guide to the folder structure, module organization, and file architecture.

**Topics covered:**
- Directory structure and organization
- Module breakdown (auth, users, chapters, units, levels, questions, progress, etc.)
- Entity relationships and database schema
- Common resources (decorators, guards, interceptors, pipes)
- Design patterns and best practices

### 🌐 [API Design Guidelines](./docs/API_DESIGN_GUIDELINES.md)
Comprehensive guide for designing and implementing RESTful APIs.

**Topics covered:**
- RESTful conventions and URL structure
- HTTP methods and status codes
- Request/response formats
- Pagination and filtering
- Authentication and authorization
- Swagger documentation
- Rate limiting
- Performance optimization

### 🔐 [Authentication System](./docs/AUTH_README.md)
Complete JWT authentication implementation with role-based access control.

**Topics covered:**
- JWT strategy and token structure
- Login and registration flows
- Password hashing and security
- Role-based authorization (Admin, Teacher, Student)
- Guards and decorators
- Testing and troubleshooting

### 📊 [Progress Tracking](./docs/PROGRESS_TRACKING_IMPLEMENTATION.md)
User progress tracking system for chapters, units, and levels.

**Topics covered:**
- Progress service implementation
- Response DTOs with progress data
- Performance optimization (batch queries)
- Progress calculation logic
- Database schema for tracking

### 📖 [API Endpoints Reference](./docs/API_ENDPOINTS_WITH_PROGRESS.md)
Complete API endpoint documentation with examples.

**Topics covered:**
- All available endpoints
- Request/response examples
- Query parameters
- Error responses
- cURL and JavaScript examples
- TypeScript interfaces

### 👤 [User Management](./docs/USER_CREATION_IMPLEMENTATION.md)
User creation workflow with validation and security.

**Topics covered:**
- User registration implementation
- Email/username uniqueness validation
- Password hashing
- Role assignment
- Error handling

### 🔑 [Password Management](./docs/CHANGE_PASSWORD_IMPLEMENTATION.md)
Secure password change functionality.

**Topics covered:**
- Change password endpoint
- Current password verification
- Custom validation decorators
- Security best practices

### 🔢 [Database Migration](./docs/UUID_TO_INT_MIGRATION_SUMMARY.md)
UUID to INT primary key migration details.

**Topics covered:**
- Migration strategy
- Entity updates
- DTO and service changes
- Performance improvements
- Testing and verification

### 🐳 [Docker Deployment](./docs/DOCKER.md)
Production Docker setup and deployment guide.

**Topics covered:**
- Docker configuration
- Multi-stage builds
- Environment variables
- Common commands
- Troubleshooting

### 📊 [Web Dashboard Requirements](./docs/WEB_DASHBOARD_REQUIREMENTS.md)
Complete requirements for the multi-role web dashboard system.

**Topics covered:**
- 4 role types: Center, Teacher, Reviewer, Agency
- Dashboard analytics and reporting
- Content management & marketplace
- Study abroad portal (AI-powered)
- Database schema extensions (30+ new tables)
- AI features integration

### 🛠️ [Web Dashboard Implementation Guide](./docs/WEB_DASHBOARD_IMPLEMENTATION_GUIDE.md)
Step-by-step implementation guide following **exact existing code patterns**.

**Topics covered:**
- Entity, DTO, Service, Controller patterns
- Complete code examples (Centers module)
- Module implementation checklist
- Phase-by-phase implementation plan (10 weeks)
- Migration creation guide

---

## 🗄️ Database Schema Overview

### Primary Key Format
**IMPORTANT:** All tables use **INTEGER (auto-increment)** primary keys, not UUID.

```typescript
@PrimaryGeneratedColumn()
id: number;  // NOT string, NOT UUID
```

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
1. **Integer Primary Keys**: All tables use auto-increment integers for performance
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
  sub: number;        // User ID (INTEGER)
  email: string;
  username: string;
  role: UserRole;
  iat: number;        // Issued at
  exp: number;        // Expiration
}

// Token expiration
ACCESS_TOKEN_EXPIRY = '90d';    // 90 days (3 months)
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

## 🌐 API Quick Reference

### RESTful Conventions
```typescript
// Resource naming (plural, kebab-case)
GET    /api/v1/chapters                    // List all chapters
GET    /api/v1/chapters/:id                // Get chapter by ID (ID is INTEGER)
POST   /api/v1/chapters                    // Create chapter
PATCH  /api/v1/chapters/:id                // Update chapter
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

// Auth endpoints
POST   /api/v1/auth/register               // Student registration
POST   /api/v1/auth/login                  // Login
POST   /api/v1/auth/refresh                // Refresh token
POST   /api/v1/auth/logout                 // Logout
GET    /api/v1/auth/me                     // Get current user
PATCH  /api/v1/auth/change-password        // Change password
```

### ID Format Examples
```typescript
// ✅ Correct - Use integers
GET /api/v1/chapters/1
GET /api/v1/units/42
GET /api/v1/users/123

// ❌ Wrong - Don't use UUIDs
GET /api/v1/chapters/550e8400-e29b-41d4-a716-446655440000
```

### Response Format Standards
```typescript
// Success response
{
  "id": 1,                    // INTEGER, not string
  "title": "Basic Greetings",
  "description": "Learn basic greetings",
  "progress": {
    "totalUnits": 5,
    "completedUnits": 3,
    "averageScore": 84.0
  }
}

// Error response
{
  "statusCode": 404,
  "message": "Chapter with ID 1 not found",
  "error": "Not Found"
}

// Status codes
200 - OK (successful GET, PUT, PATCH)
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

---

## 📝 Code Style & Conventions

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
const JWT_EXPIRY_SECONDS = 7776000; // 90 days

// Interfaces: PascalCase
interface JwtPayload {}

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

### Controller Parameter Types
```typescript
// ✅ Correct - Use ParseIntPipe for ID parameters
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.service.findOne(id);
}

// ❌ Wrong - Don't use ParseUUIDPipe
@Get(':id')
async findOne(@Param('id', ParseUUIDPipe) id: string) { // WRONG!
  return this.service.findOne(id);
}
```

### DTO Validation for IDs
```typescript
// ✅ Correct - Use @IsInt() for ID fields
export class CreateUnitDto {
  @IsInt()
  @ApiProperty({ example: 1 })
  chapterId: number;
}

// ❌ Wrong - Don't use @IsUUID()
export class CreateUnitDto {
  @IsUUID()  // WRONG!
  chapterId: string;  // WRONG!
}
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
```

### Database Query Optimization
```typescript
// N+1 Problem Prevention
// ❌ Bad: Makes N queries
for (const chapter of chapters) {
  chapter.progress = await this.getProgress(chapter.id);
}

// ✅ Good: Batch query
const chapterIds = chapters.map(c => c.id);
const progresses = await this.getProgressBatch(chapterIds);
const progressMap = new Map(progresses.map(p => [p.chapterId, p]));
chapters.forEach(c => c.progress = progressMap.get(c.id));

// Use eager loading for relations
await this.chaptersRepository.find({
  relations: ['units', 'units.levels'],
  where: { isActive: true },
  order: { orderIndex: 'ASC' }
});
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
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Service testing example
describe('ChaptersService', () => {
  let service: ChaptersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChaptersService, /* ... */]
    }).compile();

    service = module.get<ChaptersService>(ChaptersService);
  });

  it('should return chapter with integer ID', async () => {
    const result = await service.findOne(1);
    expect(result.id).toBe(1);
    expect(typeof result.id).toBe('number');
  });
});
```

### E2E Tests
```typescript
// API testing example
describe('Chapters API (e2e)', () => {
  it('GET /chapters returns array with integer IDs', () => {
    return request(app.getHttpServer())
      .get('/api/v1/chapters')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(typeof res.body[0].id).toBe('number');
      });
  });
});
```

---

## 🔒 Security Best Practices

### Input Validation
```typescript
// DTO validation with class-validator
class CreateQuestionDto {
  @IsInt()
  levelId: number;  // INTEGER, not UUID

  @IsEnum(QuestionType)
  questionType: QuestionType;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  questionText: string;

  @IsInt()
  @Min(1)
  @Max(100)
  points: number;
}
```

### SQL Injection Prevention
```typescript
// ✅ SAFE - TypeORM parameterized queries
await this.repository.findOne({
  where: { id: userId }  // Integer parameter
});

// ❌ UNSAFE - Never concatenate user input
await this.repository.query(
  `SELECT * FROM users WHERE id = ${userId}`  // WRONG!
);
```

### COPPA Compliance (Child Safety)
```typescript
// Data minimization
- Collect ONLY necessary data
- Use integer IDs (more secure than sequential UUIDs for internal use)
- Store audio temporarily (max 24 hours)
- No location tracking
- No behavioral advertising
- Parental consent required for students under 13
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

# JWT
JWT_SECRET=super_secret_key_change_in_production
JWT_EXPIRES_IN=90d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
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

### Docker Commands
```bash
# Build and start
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f api

# Stop container
docker-compose -f docker-compose.dev.yml down

# Run migrations in container
docker-compose -f docker-compose.dev.yml exec api npm run migration:run
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
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
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

### Monitoring
- **Sentry**: Real-time error tracking
- **Winston**: Structured logging
- **Health Checks**: Database, Redis, external APIs
- **Performance**: API response time, query performance

### Backup Strategy
```bash
# Automated daily PostgreSQL backups
pg_dump -U postgres english_app > backup_$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup_*.sql s3://backups/database/
```

### Maintenance Tasks
- [ ] Weekly: Review error logs and fix critical issues
- [ ] Monthly: Database optimization (VACUUM, ANALYZE)
- [ ] Monthly: Security updates for dependencies
- [ ] Quarterly: Performance audit and optimization
- [ ] Quarterly: Security penetration testing
- [ ] Yearly: Major version upgrades

---

## 🎓 Quick Start Checklist

### For New Developers
1. ✅ Read [Project Structure](./docs/PROJECT_STRUCTURE.md)
2. ✅ Review [API Design Guidelines](./docs/API_DESIGN_GUIDELINES.md)
3. ✅ Understand [Authentication System](./docs/AUTH_README.md)
4. ✅ Study the database schema (Integer IDs, not UUIDs)
5. ✅ Review code style conventions (ParseIntPipe, @IsInt())
6. ✅ Set up local development environment
7. ✅ Run migrations and seed data
8. ✅ Test API endpoints with Swagger UI

### For Code Reviews
1. ✅ Verify integer IDs used (not UUIDs)
2. ✅ Check ParseIntPipe used for ID parameters
3. ✅ Ensure @IsInt() used in DTOs for ID fields
4. ✅ Verify proper error handling
5. ✅ Check authentication/authorization
6. ✅ Review input validation
7. ✅ Ensure Swagger documentation
8. ✅ Verify no N+1 query problems

---

## 🔗 Additional Resources

### Swagger Documentation
- **Local**: http://localhost:3000/api/docs
- **Production**: https://api.storyquest.com/api/docs

### Related Documentation
- [Project Structure](./docs/PROJECT_STRUCTURE.md) - Complete folder structure
- [API Design Guidelines](./docs/API_DESIGN_GUIDELINES.md) - API standards
- [Authentication](./docs/AUTH_README.md) - Auth system details
- [Progress Tracking](./docs/PROGRESS_TRACKING_IMPLEMENTATION.md) - Progress features
- [API Reference](./docs/API_ENDPOINTS_WITH_PROGRESS.md) - All endpoints
- [User Management](./docs/USER_CREATION_IMPLEMENTATION.md) - User creation
- [Password Management](./docs/CHANGE_PASSWORD_IMPLEMENTATION.md) - Password changes
- [Database Migration](./docs/UUID_TO_INT_MIGRATION_SUMMARY.md) - INT migration
- [Docker Setup](./docs/DOCKER.md) - Deployment guide

### External Links
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Passport.js](http://www.passportjs.org/)

---

**Remember**: This backend serves children's education. Prioritize **security**, **privacy**, **reliability**, and **performance**. Every API should be designed with child safety and COPPA compliance in mind.

**IMPORTANT DATABASE NOTE**: All primary keys and foreign keys are **INTEGERS (auto-increment)**, not UUIDs. Always use `ParseIntPipe` in controllers and `@IsInt()` in DTOs.

Happy coding! 🚀🔒🎓

---

**Last Updated:** 2025-01-13
**Version:** 2.0
**Status:** ✅ Production Ready
