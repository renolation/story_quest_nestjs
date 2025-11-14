# API Design Guidelines

Complete guide for designing and implementing RESTful APIs in the Story Quest NestJS backend.

---

## 🎯 Core Principles

### 1. RESTful Design
- Use standard HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Resource-based URLs (nouns, not verbs)
- Proper HTTP status codes
- Stateless communication

### 2. Consistency
- Uniform naming conventions
- Standardized response formats
- Predictable error handling
- Consistent pagination

### 3. Security
- Authentication required by default
- Role-based authorization
- Input validation on all endpoints
- Rate limiting

### 4. Developer Experience
- Comprehensive Swagger documentation
- Clear error messages
- Predictable behaviors
- Versioned APIs

---

## 🌐 URL Structure

### Base URL
```
https://api.storyquest.com/api/v1
```

**Local Development:**
```
http://localhost:3000/api/v1
```

### Resource Naming

#### ✅ Good Examples
```
GET    /api/v1/chapters
GET    /api/v1/chapters/:id
POST   /api/v1/chapters
PATCH  /api/v1/chapters/:id
DELETE /api/v1/chapters/:id
```

#### ❌ Bad Examples
```
GET /getChapters          # No verbs in URLs
GET /api/v1/Chapter       # Use lowercase, plural
POST /api/v1/chapter/new  # Use POST /chapters instead
```

### Nested Resources

#### When to Use Nested Routes
Use when the child resource can't exist without the parent:

```
GET /api/v1/chapters/:chapterId/units
GET /api/v1/units/:unitId/levels
GET /api/v1/levels/:levelId/questions
```

#### When to Use Query Parameters
Use when filtering or optional relationships:

```
GET /api/v1/units?chapterId=1
GET /api/v1/levels?unitId=5
GET /api/v1/questions?levelId=10
```

### ID Format
- **Type:** Integer (auto-increment)
- **Example:** `/api/v1/chapters/1`, `/api/v1/users/42`
- **Validation:** Use `ParseIntPipe` in controllers

---

## 📋 HTTP Methods

### GET - Retrieve Resources

**Single Resource:**
```typescript
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.service.findOne(id);
}
```

**Collection:**
```typescript
@Get()
async findAll(@Query() paginationDto: PaginationDto) {
  return this.service.findAll(paginationDto);
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Resource doesn't exist
- `401 Unauthorized` - Authentication required

### POST - Create Resources

```typescript
@Post()
@HttpCode(201)
async create(@Body() createDto: CreateChapterDto) {
  return this.service.create(createDto);
}
```

**Status Codes:**
- `201 Created` - Resource created successfully
- `400 Bad Request` - Validation error
- `409 Conflict` - Duplicate resource

### PATCH - Partial Update

```typescript
@Patch(':id')
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateDto: UpdateChapterDto
) {
  return this.service.update(id, updateDto);
}
```

**Status Codes:**
- `200 OK` - Updated successfully
- `404 Not Found` - Resource doesn't exist
- `400 Bad Request` - Validation error

### DELETE - Remove Resources

```typescript
@Delete(':id')
@HttpCode(204)
async remove(@Param('id', ParseIntPipe) id: number) {
  await this.service.remove(id);
}
```

**Status Codes:**
- `204 No Content` - Deleted successfully
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Can't delete (has dependencies)

---

## 📊 Response Format

### Success Response Structure

#### Single Resource
```json
{
  "id": 1,
  "title": "Basic Greetings",
  "description": "Learn basic greetings",
  "orderIndex": 1,
  "isActive": true,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

#### Collection (with Pagination)
```json
{
  "data": [
    { "id": 1, "title": "Chapter 1" },
    { "id": 2, "title": "Chapter 2" }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### With Progress Data
```json
{
  "id": 1,
  "title": "Basic Greetings",
  "progress": {
    "totalUnits": 5,
    "completedUnits": 3,
    "averageScore": 84.5,
    "lastAccessedAt": "2025-01-15T10:30:00Z"
  }
}
```

### Error Response Structure

#### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "orderIndex must be a number"
  ],
  "error": "Bad Request"
}
```

#### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Chapter with ID 999 not found",
  "error": "Not Found"
}
```

#### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Email already registered",
  "error": "Conflict"
}
```

#### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Forbidden (403)
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

---

## 🔍 Query Parameters

### Pagination

**Parameters:**
```typescript
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
}
```

**Usage:**
```
GET /api/v1/chapters?page=2&limit=10
```

### Filtering

**By ID:**
```
GET /api/v1/units?chapterId=1
GET /api/v1/levels?unitId=5
```

**By Status:**
```
GET /api/v1/chapters?isActive=true
```

### Sorting

```
GET /api/v1/chapters?orderBy=orderIndex&order=ASC
GET /api/v1/users?orderBy=createdAt&order=DESC
```

**Implementation:**
```typescript
@Get()
async findAll(
  @Query('orderBy') orderBy: string = 'createdAt',
  @Query('order') order: 'ASC' | 'DESC' = 'DESC'
) {
  return this.service.findAll({ orderBy, order });
}
```

### Search

```
GET /api/v1/chapters?search=greeting
```

### Including Relations

```
GET /api/v1/chapters?includeUnits=true
GET /api/v1/units?includeLevels=true
GET /api/v1/levels?includeQuestions=true
```

**Implementation:**
```typescript
@Get(':id')
async findOne(
  @Param('id', ParseIntPipe) id: number,
  @Query('includeUnits') includeUnits?: string
) {
  const relations = includeUnits === 'true' ? ['units'] : [];
  return this.service.findOne(id, { relations });
}
```

---

## 🔐 Authentication & Authorization

### Authentication Header

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

**Example:**
```bash
curl -H "Authorization: Bearer eyJhbGci..." \
  http://localhost:3000/api/v1/chapters
```

### Public Endpoints

Use `@Public()` decorator:
```typescript
@Public()
@Get('health')
async health() {
  return { status: 'ok' };
}
```

### Role-Based Access

Use `@Roles()` decorator with `RolesGuard`:

```typescript
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Post()
async create(@Body() dto: CreateChapterDto) {
  return this.service.create(dto);
}
```

**Role Hierarchy:**
```
ADMIN > TEACHER > STUDENT
```

### Get Current User

Use `@CurrentUser()` decorator:
```typescript
@Get('me')
async getProfile(@CurrentUser() user: any) {
  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
}
```

---

## ✅ Input Validation

### DTO Validation

**Create DTO Example:**
```typescript
export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @ApiProperty({ example: 'Basic Greetings' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Learn basic English greetings' })
  description: string;

  @IsInt()
  @Min(0)
  @ApiProperty({ example: 1 })
  orderIndex: number;

  @IsUrl()
  @IsOptional()
  @ApiProperty({ required: false })
  thumbnailUrl?: string;
}
```

**Update DTO (Partial):**
```typescript
export class UpdateChapterDto extends PartialType(CreateChapterDto) {}
```

### Common Validators

```typescript
// String validation
@IsString()
@IsNotEmpty()
@MinLength(3)
@MaxLength(100)

// Number validation
@IsInt()
@Min(0)
@Max(100)

// Email validation
@IsEmail()

// URL validation
@IsUrl()

// Enum validation
@IsEnum(UserRole)

// Optional fields
@IsOptional()

// Array validation
@IsArray()
@ArrayMinSize(1)

// Nested object validation
@ValidateNested()
@Type(() => AddressDto)

// Custom validation
@Match('password', { message: 'Passwords must match' })
confirmPassword: string;
```

---

## 📝 Swagger Documentation

### Controller Documentation

```typescript
@ApiTags('Chapters')
@ApiBearerAuth()
@Controller('chapters')
export class ChaptersController {

  @Get()
  @ApiOperation({ summary: 'Get all chapters with progress' })
  @ApiResponse({
    status: 200,
    description: 'Chapters retrieved successfully',
    type: [ChapterResponseDto]
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'includeUnits', required: false, type: Boolean })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('includeUnits') includeUnits?: string,
    @CurrentUser() user?: any
  ) {
    return this.chaptersService.findAll(user?.id, paginationDto, includeUnits);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new chapter (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Chapter created successfully',
    type: ChapterResponseDto
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiBody({ type: CreateChapterDto })
  async create(@Body() createChapterDto: CreateChapterDto) {
    return this.chaptersService.create(createChapterDto);
  }
}
```

### DTO Documentation

```typescript
export class ChapterResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Basic Greetings' })
  title: string;

  @ApiProperty({ example: 'Learn basic greetings' })
  description: string;

  @ApiProperty({ example: 'https://example.com/thumb.jpg' })
  thumbnailUrl: string;

  @ApiProperty({ example: 1 })
  orderIndex: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: ChapterProgressDto, nullable: true })
  progress?: ChapterProgressDto | null;
}
```

---

## 🔢 HTTP Status Codes

### Success Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE |

### Client Error Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `400` | Bad Request | Validation error, malformed request |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Authenticated but insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource, constraint violation |
| `422` | Unprocessable Entity | Business logic error |
| `429` | Too Many Requests | Rate limit exceeded |

### Server Error Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `500` | Internal Server Error | Unexpected server error |
| `502` | Bad Gateway | External service error |
| `503` | Service Unavailable | Temporary downtime |

---

## 📄 Pagination Best Practices

### Implementation

```typescript
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

async function paginate<T>(
  repository: Repository<T>,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<T>> {
  const [data, total] = await repository.findAndCount({
    skip: (page - 1) * limit,
    take: limit
  });

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
}
```

### Default Values

- **Default Page:** 1
- **Default Limit:** 20
- **Max Limit:** 100

---

## 🚦 Rate Limiting

### Configuration

```typescript
// Global rate limit
@Throttle(100, 60) // 100 requests per 60 seconds
export class AppController {}

// Stricter for expensive operations
@Throttle(5, 3600) // 5 requests per hour
@Post('ai/generate-story')
async generateStory() {}

// Public endpoints
@Throttle(10, 60) // 10 requests per minute
@Public()
@Post('auth/login')
async login() {}
```

### Rate Limit Response

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642345678
```

**Error Response (429):**
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

---

## 🎨 Naming Conventions

### URLs
- **Lowercase:** `/api/v1/chapters`
- **Plural:** `/api/v1/users`, not `/api/v1/user`
- **Kebab-case:** `/api/v1/student-progress`

### DTOs
- **Create:** `CreateChapterDto`
- **Update:** `UpdateChapterDto`
- **Response:** `ChapterResponseDto`
- **Request:** `LoginRequestDto`

### Entities
- **Singular:** `User`, `Chapter`, `Level`
- **PascalCase:** `StudentLevelAttempt`

### Services
- **Plural:** `ChaptersService`, `UsersService`
- **Suffix:** Always end with `Service`

### Controllers
- **Plural:** `ChaptersController`, `UnitsController`
- **Suffix:** Always end with `Controller`

---

## 🔄 Versioning

### URL Versioning
```
/api/v1/chapters
/api/v2/chapters
```

### Breaking Changes
Require new version when:
- Removing endpoints
- Changing response structure
- Modifying required fields
- Changing authentication method

### Non-Breaking Changes
Can stay in same version:
- Adding new endpoints
- Adding optional fields
- Adding new query parameters
- Bug fixes

---

## ⚡ Performance Optimization

### N+1 Query Prevention

**❌ Bad (N+1 Problem):**
```typescript
const chapters = await this.chaptersRepository.find();
for (const chapter of chapters) {
  chapter.progress = await this.getProgress(chapter.id);
}
```

**✅ Good (Batch Query):**
```typescript
const chapters = await this.chaptersRepository.find();
const chapterIds = chapters.map(c => c.id);
const progresses = await this.getProgressBatch(chapterIds);
const progressMap = new Map(progresses.map(p => [p.chapterId, p]));
chapters.forEach(c => c.progress = progressMap.get(c.id));
```

### Caching Strategy

```typescript
// Cache frequently accessed data
@UseInterceptors(CacheInterceptor)
@CacheTTL(300) // 5 minutes
@Get()
async findAll() {
  return this.service.findAll();
}

// Redis cache keys
'chapters:all'              => TTL: 1 hour
'chapter:{id}'              => TTL: 1 hour
'progress:student:{id}'     => TTL: 5 minutes
```

### Database Indexes

Ensure proper indexes exist:
```sql
-- Primary keys (auto-indexed)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_units_chapter ON units(chapter_id);
CREATE INDEX idx_levels_unit ON levels(unit_id);
CREATE INDEX idx_questions_level ON questions(level_id);
CREATE INDEX idx_student_progress ON student_level_attempts(student_id, level_id);
```

---

## 📊 API Endpoint Patterns

### Complete CRUD Example

```typescript
@ApiTags('Chapters')
@ApiBearerAuth()
@Controller('chapters')
export class ChaptersController {

  // LIST - Get all chapters
  @Get()
  @ApiOperation({ summary: 'Get all chapters' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() user?: any
  ) {
    return this.chaptersService.findAll(user?.id, paginationDto);
  }

  // READ - Get single chapter
  @Get(':id')
  @ApiOperation({ summary: 'Get chapter by ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: any
  ) {
    return this.chaptersService.findOne(id, user?.id);
  }

  // CREATE - Create new chapter
  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(201)
  @ApiOperation({ summary: 'Create chapter (Admin only)' })
  async create(@Body() createDto: CreateChapterDto) {
    return this.chaptersService.create(createDto);
  }

  // UPDATE - Update existing chapter
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update chapter (Admin only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateChapterDto
  ) {
    return this.chaptersService.update(id, updateDto);
  }

  // DELETE - Remove chapter
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete chapter (Admin only)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.chaptersService.remove(id);
  }
}
```

---

## 🧪 Testing API Endpoints

### cURL Examples

```bash
# GET request
curl http://localhost:3000/api/v1/chapters

# GET with auth
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/chapters

# POST request
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"New Chapter","description":"Description","orderIndex":1}' \
  http://localhost:3000/api/v1/chapters

# PATCH request
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Updated Title"}' \
  http://localhost:3000/api/v1/chapters/1

# DELETE request
curl -X DELETE \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/chapters/1
```

### JavaScript/TypeScript

```typescript
const API_URL = 'http://localhost:3000/api/v1';
const token = 'your_jwt_token';

// GET request
const chapters = await fetch(`${API_URL}/chapters`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(res => res.json());

// POST request
const newChapter = await fetch(`${API_URL}/chapters`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'New Chapter',
    description: 'Description',
    orderIndex: 1
  })
}).then(res => res.json());
```

---

## 📚 Related Documentation

- [Project Structure](./PROJECT_STRUCTURE.md)
- [API Endpoints Reference](./API_ENDPOINTS_WITH_PROGRESS.md)
- [Authentication Guide](./AUTH_README.md)
- [Progress Tracking](./PROGRESS_TRACKING_IMPLEMENTATION.md)

---

**Swagger Documentation:** http://localhost:3000/api/docs

**Last Updated:** 2025-01-13
**Status:** ✅ Complete and Production-Ready
