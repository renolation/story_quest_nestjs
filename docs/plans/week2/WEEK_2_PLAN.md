# Week 2: Phase 1 Backend Implementation - Auth & Content Management

**Date**: 2025-11-21
**Duration**: 5 days (40 hours)
**Focus**: NestJS Backend Only
**Goal**: Complete Phase 1 implementation with fully functional authentication and content management APIs

---

## 🎯 Week 2 Overview

Building on Week 1's solid foundation (19 modules, 32 database tables, seeded data), Week 2 focuses on **implementing Phase 1 features** with production-ready code.

### Phase 1 Scope
- ✅ **Week 1**: Structure & scaffolding
- 🚀 **Week 2**: Full implementation
- 🧪 **Week 2**: Comprehensive testing

### Key Deliverables
By end of Week 2, you will have:
1. **Working Authentication System** - Register, login, JWT tokens, role-based access
2. **Complete Content Management** - CRUD for chapters, units, levels, questions
3. **Progress Tracking** - Student learning progress with real-time updates
4. **API Documentation** - Swagger UI with examples
5. **E2E Tests** - Automated testing suite
6. **Production-Ready Code** - Error handling, validation, logging

---

## 📅 Day-by-Day Breakdown

### **Day 1 (Monday): Authentication System** 🔐
**Duration**: 8 hours | **Priority**: CRITICAL

#### Morning (4 hours): Core Auth Implementation

**Task 1.1: Complete Auth Service (90 min)**

Implement all authentication business logic in `src/modules/auth/auth.service.ts`:

```typescript
// Key methods to implement:
async register(dto: RegisterDto): Promise<AuthResponse>
async login(dto: LoginDto): Promise<AuthResponse>
async validateUser(identifier: string, password: string): Promise<User | null>
async refreshToken(refreshToken: string): Promise<AuthResponse>
async changePassword(userId: number, dto: ChangePasswordDto): Promise<void>
async logout(userId: number): Promise<void>
```

**Implementation Requirements:**
- Password hashing with bcrypt (10 salt rounds)
- Email/username uniqueness validation
- JWT token generation (90-day access, 7-day refresh)
- Password strength validation (min 8 chars, uppercase, lowercase, number)
- Proper error handling with custom exceptions

**Task 1.2: Complete Auth Controller (60 min)**

Implement all auth endpoints in `src/modules/auth/auth.controller.ts`:

```typescript
@Controller('auth')
export class AuthController {
  @Post('register')
  @Public()
  async register(@Body() dto: RegisterDto): Promise<AuthResponse>

  @Post('login')
  @Public()
  async login(@Body() dto: LoginDto): Promise<AuthResponse>

  @Post('refresh')
  @Public()
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<AuthResponse>

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: User): Promise<UserResponse>

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto
  ): Promise<MessageResponse>

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: User): Promise<MessageResponse>
}
```

**Task 1.3: JWT Strategy Configuration (30 min)**

Complete `src/modules/auth/strategies/jwt.strategy.ts`:

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
}
```

**Task 1.4: Auth DTOs with Validation (40 min)**

Implement comprehensive DTOs with class-validator decorators:

**Files:**
- `register.dto.ts` - Registration with email, username, password, fullName, role
- `login.dto.ts` - Login with identifier (email or username) + password
- `refresh-token.dto.ts` - Refresh token validation
- `change-password.dto.ts` - Current password + new password with @Match decorator
- Response DTOs for consistent API responses

---

#### Afternoon (4 hours): Users Module & Testing

**Task 1.5: Users Service Implementation (90 min)**

Complete `src/modules/users/users.service.ts`:

```typescript
async findById(id: number): Promise<User | null>
async findByEmail(email: string): Promise<User | null>
async findByUsername(username: string): Promise<User | null>
async findByIdentifier(identifier: string): Promise<User | null>
async create(dto: CreateUserDto): Promise<User>
async update(id: number, dto: UpdateUserDto): Promise<User>
async updatePassword(id: number, hashedPassword: string): Promise<void>
async softDelete(id: number): Promise<void>
async findAll(filters: UserFilterDto): Promise<PaginatedResponse<User>>
```

**Features:**
- Repository pattern with TypeORM
- Password hashing before save
- Query optimization with indexes
- Pagination and filtering
- Soft delete support

**Task 1.6: Users Controller (60 min)**

Implement user management endpoints:

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get('me')
  async getProfile(@CurrentUser() user: User): Promise<UserResponse>

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto
  ): Promise<UserResponse>

  @Get()
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  async findAll(@Query() filters: UserFilterDto): Promise<PaginatedResponse<User>>

  @Get(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER, UserRole.TEACHER)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponse>
}
```

**Task 1.7: Auth Unit Tests (60 min)**

Create `auth.service.spec.ts` with tests for:
- Successful registration
- Duplicate email/username rejection
- Valid login
- Invalid credentials rejection
- Password hashing verification
- JWT token generation
- Token refresh

**Task 1.8: Auth E2E Tests (30 min)**

Create `auth.e2e-spec.ts` with full flow tests:
- Register → Login → Get Profile → Change Password → Logout
- Invalid token handling
- Role-based access verification

---

### **Day 2 (Tuesday): Content Management - Chapters & Units** 📚
**Duration**: 8 hours | **Priority**: HIGH

#### Morning (4 hours): Chapters Module

**Task 2.1: Chapters Service (90 min)**

Complete `src/modules/chapters/chapters.service.ts`:

```typescript
async findAll(userId: number, userRole: UserRole): Promise<ChapterWithProgress[]>
async findById(id: number): Promise<Chapter>
async create(dto: CreateChapterDto): Promise<Chapter>
async update(id: number, dto: UpdateChapterDto): Promise<Chapter>
async delete(id: number): Promise<void>
async reorder(reorderDto: ReorderChaptersDto): Promise<void>
async getChapterWithUnits(id: number): Promise<ChapterDetailResponse>
```

**Advanced Features:**
- Include student progress when fetching chapters
- Order by `orderIndex` ascending
- Validate order index uniqueness
- Eager load units for detail view
- Support filtering by status/visibility

**Task 2.2: Chapters Controller (60 min)**

```typescript
@Controller('chapters')
@UseGuards(JwtAuthGuard)
export class ChaptersController {
  @Get()
  async findAll(@CurrentUser() user: User): Promise<ChapterWithProgress[]>

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ChapterDetailResponse>

  @Post()
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  async create(@Body() dto: CreateChapterDto): Promise<Chapter>

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChapterDto
  ): Promise<Chapter>

  @Delete(':id')
  @Roles(UserRole.AGENCY)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<MessageResponse>

  @Patch('reorder')
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  async reorder(@Body() dto: ReorderChaptersDto): Promise<MessageResponse>
}
```

**Task 2.3: Chapter DTOs (30 min)**

Create comprehensive DTOs:
- `CreateChapterDto` - title, description, orderIndex, imageUrl
- `UpdateChapterDto` - Partial update
- `ReorderChaptersDto` - Array of {id, orderIndex}
- `ChapterWithProgress` - Include student progress data
- `ChapterDetailResponse` - Chapter with units and progress

**Task 2.4: Chapters Tests (60 min)**

Unit tests + E2E tests covering:
- CRUD operations
- Order index validation
- Duplicate order rejection
- Role-based access (students read-only, teachers can create/edit)
- Progress data inclusion

---

#### Afternoon (4 hours): Units Module

**Task 2.5: Units Service (90 min)**

Complete `src/modules/units/units.service.ts`:

```typescript
async findAll(): Promise<Unit[]>
async findByChapterId(chapterId: number): Promise<Unit[]>
async findById(id: number): Promise<Unit>
async create(dto: CreateUnitDto): Promise<Unit>
async update(id: number, dto: UpdateUnitDto): Promise<Unit>
async delete(id: number): Promise<void>
async getUnitWithLevels(id: number): Promise<UnitDetailResponse>
```

**Implementation:**
- Validate `chapterId` exists before creating unit
- Enforce order index per chapter (not global)
- Include levels count in list view
- Calculate unit completion percentage
- Support filtering by chapter

**Task 2.6: Units Controller (60 min)**

```typescript
@Controller('units')
@UseGuards(JwtAuthGuard)
export class UnitsController {
  @Get()
  async findAll(@Query('chapterId', ParseIntPipe) chapterId?: number): Promise<Unit[]>

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UnitDetailResponse>

  @Post()
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  async create(@Body() dto: CreateUnitDto): Promise<Unit>

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUnitDto
  ): Promise<Unit>

  @Delete(':id')
  @Roles(UserRole.AGENCY)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<MessageResponse>
}
```

**Task 2.7: Units Tests (90 min)**

Comprehensive tests:
- Create unit with valid chapter
- Reject invalid chapter ID
- Order index validation per chapter
- Cascade delete (when chapter deleted, units should be deleted)
- Progress calculation accuracy

---

### **Day 3 (Wednesday): Content Management - Levels & Questions** 🎮
**Duration**: 8 hours | **Priority**: HIGH

#### Morning (4 hours): Levels Module

**Task 3.1: Levels Service (120 min)**

Complete `src/modules/levels/levels.service.ts`:

```typescript
async findAll(): Promise<Level[]>
async findByUnitId(unitId: number): Promise<Level[]>
async findById(id: number): Promise<Level>
async create(dto: CreateLevelDto): Promise<Level>
async update(id: number, dto: UpdateLevelDto): Promise<Level>
async delete(id: number): Promise<void>
async getLevelWithQuestions(id: number): Promise<LevelDetailResponse>
async checkLevelUnlocked(userId: number, levelId: number): Promise<boolean>
```

**Advanced Features:**
- Level unlocking logic (must complete previous level first)
- Include attempt history for students
- Calculate best score, average score, attempts count
- Support level types (lesson, practice, test)
- Time limit validation (must be > 0)
- Passing score validation (0-100)

**Task 3.2: Levels Controller (60 min)**

```typescript
@Controller('levels')
@UseGuards(JwtAuthGuard)
export class LevelsController {
  @Get()
  async findAll(
    @Query('unitId', ParseIntPipe) unitId?: number
  ): Promise<Level[]>

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User
  ): Promise<LevelDetailResponse>

  @Post()
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  async create(@Body() dto: CreateLevelDto): Promise<Level>

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLevelDto
  ): Promise<Level>

  @Delete(':id')
  @Roles(UserRole.AGENCY)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<MessageResponse>

  @Get(':id/unlock-status')
  async checkUnlockStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User
  ): Promise<UnlockStatusResponse>
}
```

**Task 3.3: Levels Tests (60 min)**

Test coverage:
- Level creation with valid unit
- Time limit validation
- Passing score range (0-100)
- Unlock logic (sequential completion)
- Best score tracking
- Attempts count accuracy

---

#### Afternoon (4 hours): Questions Module

**Task 3.4: Questions Service (120 min)**

Complete `src/modules/questions/questions.service.ts`:

```typescript
async findAll(): Promise<Question[]>
async findByLevelId(levelId: number): Promise<Question[]>
async findById(id: number): Promise<Question>
async create(dto: CreateQuestionDto): Promise<Question>
async update(id: number, dto: UpdateQuestionDto): Promise<Question>
async delete(id: number): Promise<void>
async createWithOptions(dto: CreateQuestionWithOptionsDto): Promise<Question>
async validateAnswer(questionId: number, selectedOptionId: number): Promise<boolean>
```

**Complex Features:**
- Create question with answer options in one transaction
- Validate at least one correct answer exists
- Support 4 question types:
  - `select_right_answer` - Multiple choice
  - `fill_in_blank` - Text input
  - `sort_words` - Arrange words
  - `talk_to_speech_compare` - Pronunciation
- Handle question-specific data (audio URL, image URL, placement)
- Points validation (must be positive)

**Task 3.5: Questions Controller (60 min)**

```typescript
@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  @Get()
  async findAll(
    @Query('levelId', ParseIntPipe) levelId?: number
  ): Promise<Question[]>

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<QuestionDetailResponse>

  @Post()
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  async create(@Body() dto: CreateQuestionWithOptionsDto): Promise<Question>

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuestionDto
  ): Promise<Question>

  @Delete(':id')
  @Roles(UserRole.AGENCY)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<MessageResponse>

  @Post(':id/validate-answer')
  async validateAnswer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ValidateAnswerDto
  ): Promise<AnswerValidationResponse>
}
```

**Task 3.6: Questions Tests (60 min)**

Critical tests:
- Create question with multiple answer options
- Ensure at least one correct answer
- Answer validation (correct/incorrect)
- Points calculation
- Question type enum validation
- Cascade delete (delete question → delete answer options)

---

### **Day 4 (Thursday): Progress Tracking System** 📊
**Duration**: 8 hours | **Priority**: CRITICAL

#### Morning (4 hours): Core Progress Logic

**Task 4.1: Progress Service Implementation (150 min)**

Complete `src/modules/progress/progress.service.ts` with complex business logic:

```typescript
// Level Attempt Management
async startLevelAttempt(userId: number, levelId: number): Promise<StudentLevelAttempt>
async submitAnswer(dto: SubmitAnswerDto): Promise<AnswerResult>
async completeLevel(dto: CompleteLevelDto): Promise<LevelCompletionResult>

// Progress Retrieval
async getStudentProgress(userId: number): Promise<StudentProgressSummary>
async getChapterProgress(userId: number, chapterId: number): Promise<ChapterProgress>
async getUnitProgress(userId: number, unitId: number): Promise<UnitProgress>
async getLevelProgress(userId: number, levelId: number): Promise<LevelProgress>

// Progress Calculation
async calculateUnitProgress(userId: number, unitId: number): Promise<void>
async calculateChapterProgress(userId: number, chapterId: number): Promise<void>
async recalculateAllProgress(userId: number): Promise<void>
```

**Complex Business Rules:**

1. **Starting Level Attempt:**
   - Check if level is unlocked (previous level completed)
   - Check if student has active attempt (don't create duplicate)
   - Create `StudentLevelAttempt` with `startedAt` timestamp
   - Return attempt ID for subsequent answer submissions

2. **Submitting Answers:**
   - Validate attempt exists and belongs to user
   - Validate question belongs to the level
   - Check if answer already submitted (prevent double submission)
   - Validate answer correctness
   - Calculate points earned
   - Save `StudentQuestionAnswer` record
   - Return immediate feedback (correct/incorrect, points)

3. **Completing Level:**
   - Calculate final score (sum of points / total possible points × 100)
   - Calculate time spent (completedAt - startedAt)
   - Determine pass/fail (score >= passingScore)
   - Update `StudentLevelAttempt` with completion data
   - Update unit progress (recalculate completed levels, average score)
   - Update chapter progress (recalculate completed units, average score)
   - Unlock next level if passed
   - Award achievements if applicable (Phase 4, placeholder for now)

**Task 4.2: Progress DTOs (30 min)**

Create comprehensive DTOs:
- `StartLevelDto` - levelId
- `SubmitAnswerDto` - attemptId, questionId, selectedOptionId (or userAnswer for fill-in-blank)
- `CompleteLevelDto` - attemptId
- Response DTOs with nested progress data

**Task 4.3: Progress Entity Updates (30 min)**

Ensure all 4 progress entities are properly configured:
- `StudentLevelAttempt` - Relationships to user, level, answers
- `StudentQuestionAnswer` - Relationships to user, attempt, question
- `StudentUnitProgress` - Auto-calculated fields
- `StudentChapterProgress` - Auto-calculated fields

---

#### Afternoon (4 hours): Progress API & Testing

**Task 4.4: Progress Controller (90 min)**

```typescript
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  // Level attempt management
  @Post('levels/:id/start')
  async startLevel(
    @Param('id', ParseIntPipe) levelId: number,
    @CurrentUser() user: User
  ): Promise<StartLevelResponse>

  @Post('questions/:id/answer')
  async submitAnswer(
    @Param('id', ParseIntPipe) questionId: number,
    @Body() dto: SubmitAnswerDto,
    @CurrentUser() user: User
  ): Promise<AnswerResult>

  @Post('levels/:id/complete')
  async completeLevel(
    @Param('id', ParseIntPipe) levelId: number,
    @Body() dto: CompleteLevelDto,
    @CurrentUser() user: User
  ): Promise<LevelCompletionResult>

  // Progress retrieval
  @Get('me')
  async getMyProgress(@CurrentUser() user: User): Promise<StudentProgressSummary>

  @Get('chapters/:id')
  async getChapterProgress(
    @Param('id', ParseIntPipe) chapterId: number,
    @CurrentUser() user: User
  ): Promise<ChapterProgress>

  @Get('units/:id')
  async getUnitProgress(
    @Param('id', ParseIntPipe) unitId: number,
    @CurrentUser() user: User
  ): Promise<UnitProgress>

  @Get('levels/:id')
  async getLevelProgress(
    @Param('id', ParseIntPipe) levelId: number,
    @CurrentUser() user: User
  ): Promise<LevelProgress>

  // Admin endpoints
  @Get('students/:id')
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  async getStudentProgress(
    @Param('id', ParseIntPipe) studentId: number
  ): Promise<StudentProgressSummary>
}
```

**Task 4.5: Progress Unit Tests (90 min)**

Test all business logic:
- Start level attempt (success, already started, level locked)
- Submit answer (correct answer, incorrect answer, duplicate submission)
- Complete level (pass, fail, score calculation, time tracking)
- Progress calculation (unit progress, chapter progress)
- Unlock logic (sequential level completion)

**Task 4.6: Progress E2E Tests (60 min)**

Full user flow tests:
- Complete learning journey: Start level → Answer all questions → Complete level → Check progress
- Failed attempt flow: Submit wrong answers → Fail level → Retry allowed
- Progress aggregation: Complete multiple levels → Verify unit/chapter progress updates

---

### **Day 5 (Friday): API Documentation, Testing & Polish** 📝
**Duration**: 8 hours | **Priority**: HIGH

#### Morning (4 hours): Swagger Documentation & API Testing

**Task 5.1: Swagger Configuration (60 min)**

Complete `src/main.ts` with comprehensive Swagger setup:

```typescript
const config = new DocumentBuilder()
  .setTitle('Story Quest API')
  .setDescription('English Learning Platform for Vietnamese Students (Grades 3-5)')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .addTag('Authentication', 'User registration, login, and JWT management')
  .addTag('Users', 'User profile and management')
  .addTag('Chapters', 'Top-level curriculum organization')
  .addTag('Units', 'Chapter sub-topics')
  .addTag('Levels', 'Individual lessons with unlock logic')
  .addTag('Questions', 'Learning activities with 4 question types')
  .addTag('Progress', 'Student progress tracking and completion')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: {
    persistAuthorization: true, // Keep auth between page refreshes
  },
});
```

**Task 5.2: Swagger Decorators for All Endpoints (90 min)**

Add comprehensive Swagger decorators to all controllers:

```typescript
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register new user account' })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: AuthResponse })
  @ApiResponse({ status: 400, description: 'Validation error or weak password' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    // ...
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login with email/username and password' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponse })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    // ...
  }

  // ... more endpoints
}
```

**Apply to all modules**: Auth, Users, Chapters, Units, Levels, Questions, Progress

**Task 5.3: Create REST Client Test Collection (90 min)**

Create `api-tests/phase1.http` with all endpoints:

```http
### Environment Variables
@baseUrl = http://localhost:3000/api/v1
@studentToken = {{login.response.body.accessToken}}
@teacherToken = {{teacherLogin.response.body.accessToken}}

### Health Check
GET {{baseUrl}}/auth/health

### Register Student
# @name register
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "teststudent@example.com",
  "username": "teststudent",
  "password": "Password123",
  "fullName": "Test Student",
  "role": "student"
}

### Login as Student
# @name login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "identifier": "student1@test.com",
  "password": "Password123"
}

### Get Current User
GET {{baseUrl}}/auth/me
Authorization: Bearer {{studentToken}}

### Get All Chapters
GET {{baseUrl}}/chapters
Authorization: Bearer {{studentToken}}

### Get Chapter Details
GET {{baseUrl}}/chapters/1
Authorization: Bearer {{studentToken}}

### Start Level Attempt
POST {{baseUrl}}/progress/levels/1/start
Authorization: Bearer {{studentToken}}

### Submit Answer
POST {{baseUrl}}/progress/questions/1/answer
Authorization: Bearer {{studentToken}}
Content-Type: application/json

{
  "attemptId": 1,
  "selectedOptionId": 2
}

### Complete Level
POST {{baseUrl}}/progress/levels/1/complete
Authorization: Bearer {{studentToken}}
Content-Type: application/json

{
  "attemptId": 1
}

### Get My Progress
GET {{baseUrl}}/progress/me
Authorization: Bearer {{studentToken}}
```

**Add 50+ endpoint tests** covering all CRUD operations, auth flows, progress tracking.

---

#### Afternoon (4 hours): Testing, Error Handling & Documentation

**Task 5.4: Global Exception Handling (60 min)**

Enhance exception filters for production readiness:

```typescript
// Create custom exceptions
export class BusinessLogicException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class LevelLockedException extends BusinessLogicException {
  constructor(levelId: number) {
    super(`Level ${levelId} is locked. Complete the previous level first.`);
  }
}

export class DuplicateAttemptException extends BusinessLogicException {
  constructor() {
    super('An active attempt already exists for this level.');
  }
}

// Apply to all services where applicable
```

**Task 5.5: Request Validation Enhancement (60 min)**

Add advanced validation:
- Custom validators for business rules
- Sanitization for text inputs (XSS prevention)
- File upload validation (image/audio URLs)
- Regex patterns for usernames, emails
- Min/max constraints for scores, time limits

**Task 5.6: Logging System (60 min)**

Implement structured logging:

```typescript
// Create Winston logger
import * as winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Use in services
logger.info('User registered', { userId, email });
logger.error('Failed to complete level', { error, userId, levelId });
```

**Task 5.7: Final API Documentation (60 min)**

Create `docs/plans/week2/API_IMPLEMENTATION_GUIDE.md`:

Document:
- All implemented endpoints with examples
- Request/response schemas
- Authentication flow diagram
- Progress tracking flow diagram
- Error codes and meanings
- Rate limiting rules (if implemented)
- Common use cases with code examples

---

## ✅ Week 2 Completion Checklist

### Day 1: Authentication ✅
- [ ] Auth service with register, login, token management
- [ ] Auth controller with 6 endpoints
- [ ] JWT strategy configured
- [ ] Users service with CRUD operations
- [ ] Users controller with profile management
- [ ] Password hashing and validation
- [ ] Auth unit tests (10+ tests)
- [ ] Auth E2E tests (5+ scenarios)

### Day 2: Content Management (Chapters & Units) ✅
- [ ] Chapters service with CRUD + reordering
- [ ] Chapters controller with role-based access
- [ ] Chapters DTOs with progress data
- [ ] Chapters tests (unit + E2E)
- [ ] Units service with CRUD
- [ ] Units controller
- [ ] Units tests
- [ ] Chapter-Unit relationship validated

### Day 3: Content Management (Levels & Questions) ✅
- [ ] Levels service with unlock logic
- [ ] Levels controller
- [ ] Levels tests covering unlock scenarios
- [ ] Questions service with answer validation
- [ ] Questions controller
- [ ] Question-AnswerOption relationship
- [ ] Questions tests (4 question types)

### Day 4: Progress Tracking ✅
- [ ] Progress service with complex business logic
- [ ] Start level attempt
- [ ] Submit answer with immediate feedback
- [ ] Complete level with score calculation
- [ ] Progress calculation (unit, chapter)
- [ ] Progress controller (8+ endpoints)
- [ ] Progress unit tests (15+ tests)
- [ ] Progress E2E tests (full learning journey)

### Day 5: Documentation & Polish ✅
- [ ] Swagger configuration complete
- [ ] All endpoints documented with @Api decorators
- [ ] REST Client test collection (50+ tests)
- [ ] Custom exception classes
- [ ] Global exception filter enhanced
- [ ] Request validation improved
- [ ] Winston logging implemented
- [ ] API implementation guide created

---

## 📊 Expected Metrics (End of Week 2)

| Metric | Target | Description |
|--------|--------|-------------|
| **API Endpoints** | 40+ | All Phase 1 CRUD + auth + progress |
| **Unit Tests** | 100+ | Service layer coverage |
| **E2E Tests** | 30+ | Full integration tests |
| **Test Coverage** | 80%+ | Code coverage |
| **Swagger Endpoints** | 40+ | All documented |
| **REST Client Tests** | 50+ | Manual testing suite |
| **DTO Classes** | 50+ | Request/response schemas |
| **Custom Exceptions** | 10+ | Business logic errors |
| **Response Time** | <200ms | 95th percentile |

---

## 🗄️ Database State (End of Week 2)

From Week 1 seeding:
- ✅ 31 users (all roles)
- ✅ 10 chapters
- ✅ 45 units
- ✅ 135 levels
- ✅ 999 questions
- ✅ ~3996 answer options

Week 2 will add:
- 🆕 500+ student level attempts
- 🆕 5000+ student question answers
- 🆕 Unit progress records
- 🆕 Chapter progress records

**All data ready for frontend integration!**

---

## 🧪 Testing Strategy

### Unit Tests
Focus on service layer business logic:
- Input validation
- Business rule enforcement
- Error handling
- Edge cases

### Integration Tests
Focus on database interactions:
- Repository queries
- Relationships
- Transactions
- Cascade operations

### E2E Tests
Focus on full API flows:
- Authentication flow
- CRUD operations
- Progress tracking journey
- Authorization rules
- Error responses

**Test Coverage Goal**: 80%+ for all services

---

## 🚀 Performance Optimization

### Database Queries
- Use eager loading for common relationships
- Add indexes on foreign keys
- Implement query pagination
- Use QueryBuilder for complex queries

### API Response Times
- Target: <200ms for 95th percentile
- Implement basic caching for static content (chapters, units)
- Use database connection pooling
- Optimize DTO transformations

### Validation
- Use class-validator pipes
- Fail fast on validation errors
- Cache validation results where possible

---

## 🔒 Security Implementation

### Authentication
- ✅ Bcrypt password hashing (10 rounds)
- ✅ JWT tokens with 90-day expiry
- ✅ Refresh token rotation
- ✅ Token blacklisting on logout (optional)

### Authorization
- ✅ Role-based guards on all endpoints
- ✅ Resource ownership validation
- ✅ Proper HTTP status codes (401, 403)

### Input Validation
- ✅ DTO validation with class-validator
- ✅ SQL injection prevention (TypeORM parameterized queries)
- ✅ XSS prevention (input sanitization)
- ✅ Rate limiting (optional, can defer to Phase 6)

### Data Protection
- ✅ Password hashing before storage
- ✅ Sensitive fields excluded from responses
- ✅ HTTPS enforcement (production)

---

## 📁 Key Files to Create/Update

### New Files (Week 2)
1. `auth.service.ts` - Complete implementation
2. `auth.controller.ts` - All endpoints
3. `users.service.ts` - Complete implementation
4. `chapters.service.ts` - Complete implementation
5. `units.service.ts` - Complete implementation
6. `levels.service.ts` - Complete implementation
7. `questions.service.ts` - Complete implementation
8. `progress.service.ts` - Complex business logic
9. 50+ DTO files (create, update, response)
10. 10+ spec.ts files (unit tests)
11. 5+ e2e-spec.ts files
12. `api-tests/phase1.http` - REST Client collection
13. `docs/plans/week2/API_IMPLEMENTATION_GUIDE.md`
14. Custom exception classes (10+ files)

### Updated Files
1. All entity files - Add relationships
2. All module.ts files - Add providers
3. `main.ts` - Swagger config, logging
4. `app.module.ts` - Global filters, pipes
5. `.env.example` - Add new variables

**Total**: 100+ files created/modified

---

## 💡 Best Practices to Follow

### Code Organization
- Keep services focused (single responsibility)
- Use DTOs for all requests/responses
- Consistent naming conventions
- Proper TypeScript typing (no `any`)

### Error Handling
- Use custom exception classes
- Provide meaningful error messages
- Include error context (userId, resourceId)
- Log errors with Winston

### Testing
- Test business logic thoroughly
- Mock external dependencies
- Use realistic test data
- Test both success and failure paths

### Documentation
- Add JSDoc comments to complex methods
- Document business rules in code
- Keep Swagger docs updated
- Maintain API examples

---

## 🔗 Resources & References

### NestJS Documentation
- [Controllers](https://docs.nestjs.com/controllers)
- [Services & Providers](https://docs.nestjs.com/providers)
- [Guards](https://docs.nestjs.com/guards)
- [Pipes & Validation](https://docs.nestjs.com/pipes)
- [Exception Filters](https://docs.nestjs.com/exception-filters)
- [Testing](https://docs.nestjs.com/fundamentals/testing)

### TypeORM Documentation
- [Relations](https://typeorm.io/relations)
- [Query Builder](https://typeorm.io/select-query-builder)
- [Transactions](https://typeorm.io/transactions)

### Project Documentation
- Main Guide: `/CLAUDE.md`
- Week 1 Summary: `/docs/plans/week1/WEEK_1_COMPLETION_SUMMARY.md`
- API Guidelines: `/docs/summary/API_DESIGN_GUIDELINES.md`
- Database Schema: `/docs/summary/DATABASE_SCHEMA.md`

---

## 🎯 Success Criteria

Week 2 is considered complete when:

1. ✅ All 40+ API endpoints implemented and working
2. ✅ 100+ unit tests passing
3. ✅ 30+ E2E tests passing
4. ✅ Test coverage >80%
5. ✅ Swagger documentation complete
6. ✅ REST Client test collection created
7. ✅ All business logic validated with tests
8. ✅ Error handling comprehensive
9. ✅ Logging system operational
10. ✅ API documentation guide created

**Final Validation**: Complete a full student learning journey via API:
```
Register → Login → Get Chapters → Get Units → Get Levels →
Start Level → Answer Questions → Complete Level → Check Progress
```

All steps must work without errors!

---

## 🚀 Week 3 Preview

With Week 2 complete, Week 3 will focus on:
- Flutter mobile app integration
- API consumption from Flutter
- Offline data caching
- Push notifications setup
- React web dashboard initialization

**Week 2 deliverables ensure**: The backend API is production-ready, fully tested, and ready for frontend integration!

---

**Created**: 2025-11-21
**Duration**: 5 days (40 hours)
**Status**: Ready to Execute
**Prerequisites**: ✅ Week 1 Complete (Database seeded, modules scaffolded)
