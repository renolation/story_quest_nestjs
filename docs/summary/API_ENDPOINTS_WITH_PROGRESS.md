# API Endpoints with Progress Tracking

## Authentication Required
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Chapters API

### Get All Chapters
```http
GET /api/v1/chapters
```

**Query Parameters:**
- `includeUnits` (optional) - Set to `"true"` to include nested units

**Response Example:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Basic Greetings",
    "description": "Learn basic greetings in English",
    "thumbnailUrl": "https://example.com/chapter.jpg",
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "progress": {
      "totalUnits": 5,
      "completedUnits": 3,
      "totalPointsAvailable": 500,
      "totalPointsEarned": 420,
      "averageScore": 84.0,
      "lastAccessedAt": "2025-01-15T10:30:00Z"
    }
  }
]
```

**With includeUnits:**
```http
GET /api/v1/chapters?includeUnits=true
```
Returns chapters with nested `units` array.

---

### Get Single Chapter
```http
GET /api/v1/chapters/:id
```

**Example:**
```http
GET /api/v1/chapters/550e8400-e29b-41d4-a716-446655440000
```

**Response:** Same as above, single chapter object

**Query Parameters:**
- `includeUnits` (optional) - Set to `"true"` to include nested units

---

### Create Chapter (Admin Only)
```http
POST /api/v1/chapters
Content-Type: application/json

{
  "title": "New Chapter",
  "description": "Chapter description",
  "thumbnailUrl": "https://example.com/thumb.jpg",
  "orderIndex": 1
}
```

---

### Update Chapter (Admin Only)
```http
PATCH /api/v1/chapters/:id
Content-Type: application/json

{
  "title": "Updated Title"
}
```

---

### Delete Chapter (Admin Only)
```http
DELETE /api/v1/chapters/:id
```
Returns: 204 No Content

---

## Units API

### Get All Units
```http
GET /api/v1/units
```

**Query Parameters:**
- `chapterId` (optional) - Filter units by chapter ID
- `includeLevels` (optional) - Set to `"true"` to include nested levels

**Response Example:**
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "title": "Greeting Friends",
    "description": "Learn how to greet friends",
    "chapterId": "550e8400-e29b-41d4-a716-446655440000",
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "progress": {
      "totalLevels": 10,
      "completedLevels": 7,
      "totalPointsAvailable": 100,
      "totalPointsEarned": 85,
      "averageScore": 85.0,
      "lastAccessedAt": "2025-01-15T14:20:00Z"
    }
  }
]
```

**Filter by Chapter:**
```http
GET /api/v1/units?chapterId=550e8400-e29b-41d4-a716-446655440000
```

**With nested levels:**
```http
GET /api/v1/units?includeLevels=true
```

---

### Get Single Unit
```http
GET /api/v1/units/:id
```

**Example:**
```http
GET /api/v1/units/660e8400-e29b-41d4-a716-446655440000
```

**Query Parameters:**
- `includeLevels` (optional) - Set to `"true"` to include nested levels

---

### Create Unit (Admin Only)
```http
POST /api/v1/units
Content-Type: application/json

{
  "chapterId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "New Unit",
  "description": "Unit description",
  "orderIndex": 1
}
```

---

### Update Unit (Admin Only)
```http
PATCH /api/v1/units/:id
Content-Type: application/json

{
  "title": "Updated Title"
}
```

---

### Delete Unit (Admin Only)
```http
DELETE /api/v1/units/:id
```
Returns: 204 No Content

---

## Levels API

### Get All Levels
```http
GET /api/v1/levels
```

**Query Parameters:**
- `unitId` (optional) - Filter levels by unit ID
- `includeQuestions` (optional) - Set to `"true"` to include nested questions

**Response Example:**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "title": "Practice Hello",
    "description": "Practice saying hello",
    "unitId": "660e8400-e29b-41d4-a716-446655440000",
    "orderIndex": 1,
    "timeLimitSeconds": 300,
    "passingScore": 70,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "progress": {
      "attemptCount": 3,
      "bestScore": 95,
      "bestPointsEarned": 95,
      "isPassed": true,
      "isCompleted": true,
      "lastAttemptAt": "2025-01-15T16:45:00Z"
    }
  }
]
```

**Filter by Unit:**
```http
GET /api/v1/levels?unitId=660e8400-e29b-41d4-a716-446655440000
```

**With nested questions:**
```http
GET /api/v1/levels?includeQuestions=true
```

---

### Get Single Level
```http
GET /api/v1/levels/:id
```

**Example:**
```http
GET /api/v1/levels/770e8400-e29b-41d4-a716-446655440000
```

**Query Parameters:**
- `includeQuestions` (optional) - Set to `"true"` to include nested questions

---

### Create Level (Admin Only)
```http
POST /api/v1/levels
Content-Type: application/json

{
  "unitId": "660e8400-e29b-41d4-a716-446655440000",
  "title": "New Level",
  "description": "Level description",
  "orderIndex": 1,
  "timeLimitSeconds": 300,
  "passingScore": 70
}
```

---

### Update Level (Admin Only)
```http
PATCH /api/v1/levels/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "passingScore": 75
}
```

---

### Delete Level (Admin Only)
```http
DELETE /api/v1/levels/:id
```
Returns: 204 No Content

---

## Progress Field Details

### Chapter Progress
| Field | Type | Description |
|-------|------|-------------|
| `totalUnits` | number | Total number of units in the chapter |
| `completedUnits` | number | Number of units the student has completed |
| `totalPointsAvailable` | number | Maximum points available across all units |
| `totalPointsEarned` | number | Points earned by the student |
| `averageScore` | number | Average score percentage (0-100) |
| `lastAccessedAt` | Date\|null | Last time student accessed this chapter |

### Unit Progress
| Field | Type | Description |
|-------|------|-------------|
| `totalLevels` | number | Total number of levels in the unit |
| `completedLevels` | number | Number of levels the student has completed |
| `totalPointsAvailable` | number | Maximum points available across all levels |
| `totalPointsEarned` | number | Points earned by the student |
| `averageScore` | number | Average score percentage (0-100) |
| `lastAccessedAt` | Date\|null | Last time student accessed this unit |

### Level Progress
| Field | Type | Description |
|-------|------|-------------|
| `attemptCount` | number | Total number of attempts by the student |
| `bestScore` | number | Highest score achieved (0-100) |
| `bestPointsEarned` | number | Points earned in the best attempt |
| `isPassed` | boolean | Whether student passed (score >= passingScore) |
| `isCompleted` | boolean | Whether student completed at least one attempt |
| `lastAttemptAt` | Date\|null | Timestamp of the most recent attempt |

---

## Progress States

### No Progress (null)
When a student has never accessed content, `progress` will be `null`:
```json
{
  "id": "...",
  "title": "Advanced Grammar",
  "progress": null
}
```

### In Progress
When a student has started but not completed:
```json
{
  "progress": {
    "totalLevels": 10,
    "completedLevels": 5,
    "averageScore": 75.5,
    ...
  }
}
```

### Completed
When all content is finished:
```json
{
  "progress": {
    "totalLevels": 10,
    "completedLevels": 10,
    "averageScore": 85.0,
    ...
  }
}
```

---

## Error Responses

### 401 Unauthorized
Missing or invalid JWT token:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
Resource doesn't exist:
```json
{
  "statusCode": 404,
  "message": "Chapter with ID xxx not found"
}
```

### 400 Bad Request
Invalid UUID format:
```json
{
  "statusCode": 400,
  "message": "Validation failed (uuid is expected)"
}
```

---

## cURL Examples

### Get Chapters with Auth
```bash
curl -X GET \
  http://localhost:3000/api/v1/chapters \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Chapter with Units
```bash
curl -X GET \
  "http://localhost:3000/api/v1/chapters/CHAPTER_ID?includeUnits=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Units by Chapter
```bash
curl -X GET \
  "http://localhost:3000/api/v1/units?chapterId=CHAPTER_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Levels by Unit
```bash
curl -X GET \
  "http://localhost:3000/api/v1/levels?unitId=UNIT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## JavaScript/TypeScript Examples

### Using Fetch API
```typescript
const token = 'YOUR_JWT_TOKEN';

// Get all chapters with progress
const response = await fetch('http://localhost:3000/api/v1/chapters', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const chapters = await response.json();

// Get chapter with nested units
const chapterResponse = await fetch(
  `http://localhost:3000/api/v1/chapters/${chapterId}?includeUnits=true`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
const chapter = await chapterResponse.json();
```

### Using Axios
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get chapters
const { data: chapters } = await api.get('/chapters');

// Get units for a chapter
const { data: units } = await api.get('/units', {
  params: { chapterId: 'CHAPTER_ID' }
});

// Get levels for a unit
const { data: levels } = await api.get('/levels', {
  params: {
    unitId: 'UNIT_ID',
    includeQuestions: 'true'
  }
});
```

---

## TypeScript Interfaces

```typescript
interface ChapterProgress {
  totalUnits: number;
  completedUnits: number;
  totalPointsAvailable: number;
  totalPointsEarned: number;
  averageScore: number;
  lastAccessedAt: Date | null;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  units?: Unit[];
  progress?: ChapterProgress | null;
}

interface UnitProgress {
  totalLevels: number;
  completedLevels: number;
  totalPointsAvailable: number;
  totalPointsEarned: number;
  averageScore: number;
  lastAccessedAt: Date | null;
}

interface Unit {
  id: string;
  title: string;
  description: string;
  chapterId: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  levels?: Level[];
  progress?: UnitProgress | null;
}

interface LevelProgress {
  attemptCount: number;
  bestScore: number;
  bestPointsEarned: number;
  isPassed: boolean;
  isCompleted: boolean;
  lastAttemptAt: Date | null;
}

interface Level {
  id: string;
  title: string;
  description: string;
  unitId: string;
  orderIndex: number;
  timeLimitSeconds: number;
  passingScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  questions?: Question[];
  progress?: LevelProgress | null;
}
```

---

## Swagger/OpenAPI Documentation

Visit the interactive API documentation at:
```
http://localhost:3000/api/docs
```

Features:
- Try out endpoints directly in the browser
- See request/response schemas
- Authenticate with JWT token (click "Authorize" button)
- View all available endpoints organized by tags

---

## Performance Considerations

### Batch Operations
The API uses batch queries to avoid N+1 problems:
- Fetching 100 chapters = 2 database queries (not 101)
- One query for chapters, one query for all progresses

### Recommended Practices
1. **Pagination**: Request only needed pages (implement if required)
2. **Selective Loading**: Use `includeUnits`/`includeLevels` only when needed
3. **Caching**: Consider caching responses on the client side
4. **Debouncing**: For real-time updates, debounce requests

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are RFC 4122 compliant
- Progress is calculated on-the-fly for the authenticated user
- Teachers/admins may see `null` progress (student-specific feature)
- All numeric scores are percentages (0-100)
