# React Integration Guide - NestJS Backend Updates

**Date**: 2025-11-21  
**NestJS Version**: Week 3 Implementation  
**Status**: ✅ Ready for React Integration

---

## 🎯 Overview

This guide documents the latest NestJS backend updates and provides integration instructions for the React web dashboard. Recent updates include:

1. **Pronunciation Module** - Track pronunciation practice attempts (client-side speech processing)
2. **Gamification Module** - Achievements, points, streaks, and leaderboards
3. **Chapter Ownership Model** - Public chapters (AGENCY) vs Organization-specific chapters (CENTER)

---

## 📚 Chapter Ownership Model (NEW)

### **Two Types of Chapters**

The backend now supports two types of chapters with different visibility rules:

#### **1. Public Chapters**
- **Created by**: AGENCY (super admin)
- **Visibility**: Available to ALL students across all organizations
- **Database**: `center_id = NULL`, `is_public = true`
- **Use case**: Standard curriculum content

#### **2. Organization-Specific Chapters**
- **Created by**: CENTER (organization admin)
- **Visibility**: Available ONLY to students in that specific organization
- **Database**: `center_id = <center_id>`, `is_public = false`
- **Use case**: Custom curriculum for specific organizations

### **Content Hierarchy**

```
Chapter (created by AGENCY or CENTER)
  ├── center_id: NULL (public) or <center_id> (org-specific)
  ├── is_public: true (public) or false (org-specific)
  └── Units (created by TEACHER, CENTER, or AGENCY)
      └── Levels (created by TEACHER, CENTER, or AGENCY)
          └── Questions (created by TEACHER, CENTER, or AGENCY)
```

**Important**: Once a chapter is created, units/levels/questions can be added by teachers, but **only AGENCY and CENTER can create chapters**.

### **API Endpoints for Chapter Management**

#### **AGENCY - Public Chapter Management**
```typescript
// List all chapters (public + all org-specific)
GET /api/v1/agency/chapters

// Create PUBLIC chapter
POST /api/v1/agency/chapters
{
  "title": "Basic Greetings",
  "description": "Learn basic greetings",
  "orderIndex": 1,
  "isPublic": true,
  "centerId": null  // Must be null for public chapters
}

// Update any chapter
PATCH /api/v1/agency/chapters/:id

// Delete any chapter
DELETE /api/v1/agency/chapters/:id
```

#### **CENTER - Organization-Specific Chapter Management**
```typescript
// List own organization chapters + public chapters
GET /api/v1/center/chapters

// Create ORGANIZATION-SPECIFIC chapter
POST /api/v1/center/chapters
{
  "title": "Custom Chapter for Our Organization",
  "description": "Organization-specific content",
  "orderIndex": 1,
  "isPublic": false,
  "centerId": <current_user_center_id>  // Automatically set by backend
}

// Update own organization chapter
PATCH /api/v1/center/chapters/:id

// Delete own organization chapter
DELETE /api/v1/center/chapters/:id
```

#### **STUDENT - Chapter Access (Mobile App)**
```typescript
// List chapters (public + own organization)
GET /api/v1/chapters
// Backend automatically filters:
// - All public chapters (center_id = NULL, is_public = true)
// - Own organization chapters (center_id = student's center_id)

// Get chapter details
GET /api/v1/chapters/:id
```

### **TypeScript Types**

```typescript
// Chapter type
interface Chapter {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  orderIndex: number;
  isActive: boolean;
  centerId: number | null;  // NULL for public chapters
  isPublic: boolean;        // true for public, false for org-specific
  createdAt: string;
  updatedAt: string;

  // Relations
  center?: Center | null;
  units?: Unit[];
}

// Create chapter DTO (AGENCY)
interface CreatePublicChapterDto {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  orderIndex: number;
  isPublic: true;         // Must be true for public
  centerId: null;         // Must be null for public
}

// Create chapter DTO (CENTER)
interface CreateOrgChapterDto {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  orderIndex: number;
  isPublic: false;        // Must be false for org-specific
  // centerId automatically set by backend from user's organization
}
```

### **React Query Hooks**

```typescript
// src/hooks/queries/useChapters.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

// Get chapters based on user role
export const useChapters = () => {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['chapters', currentUser?.role],
    queryFn: async () => {
      // Endpoint varies by role
      if (currentUser?.role === 'agency') {
        return getAgencyChaptersApi();  // GET /api/v1/agency/chapters
      } else if (currentUser?.role === 'center') {
        return getCenterChaptersApi();  // GET /api/v1/center/chapters
      } else if (currentUser?.role === 'student') {
        return getStudentChaptersApi(); // GET /api/v1/chapters
      }
      throw new Error('Invalid role');
    },
  });
};

// Create public chapter (AGENCY only)
export const useCreatePublicChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePublicChapterDto) =>
      createPublicChapterApi(data), // POST /api/v1/agency/chapters
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
  });
};

// Create org chapter (CENTER only)
export const useCreateOrgChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrgChapterDto) =>
      createOrgChapterApi(data), // POST /api/v1/center/chapters
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
  });
};
```

### **React Components**

```typescript
// src/pages/agency/ChapterManagement.tsx
import { useChapters, useCreatePublicChapter } from '@/hooks/queries/useChapters';

export const AgencyChapterManagement = () => {
  const { data: chapters, isLoading } = useChapters();
  const createChapter = useCreatePublicChapter();

  const handleCreatePublicChapter = async (formData) => {
    await createChapter.mutateAsync({
      ...formData,
      isPublic: true,
      centerId: null,  // Public chapters have no center
    });
  };

  return (
    <div>
      <h1>Chapter Management (All Chapters)</h1>
      <Button onClick={() => setShowCreateModal(true)}>
        Create Public Chapter
      </Button>

      <Table
        dataSource={chapters}
        columns={[
          { title: 'ID', dataIndex: 'id' },
          { title: 'Title', dataIndex: 'title' },
          {
            title: 'Type',
            render: (_, record) =>
              record.isPublic ? (
                <Tag color="blue">Public</Tag>
              ) : (
                <Tag color="green">
                  Org: {record.center?.name || 'Unknown'}
                </Tag>
              )
          },
          { title: 'Order', dataIndex: 'orderIndex' },
          // ... actions
        ]}
      />
    </div>
  );
};
```

```typescript
// src/pages/center/ChapterManagement.tsx
import { useChapters, useCreateOrgChapter } from '@/hooks/queries/useChapters';

export const CenterChapterManagement = () => {
  const { data: chapters, isLoading } = useChapters();
  const createChapter = useCreateOrgChapter();

  const handleCreateOrgChapter = async (formData) => {
    await createChapter.mutateAsync({
      ...formData,
      isPublic: false,  // Org-specific
      // centerId automatically set by backend
    });
  };

  return (
    <div>
      <h1>Chapter Management (My Organization + Public)</h1>
      <Button onClick={() => setShowCreateModal(true)}>
        Create Organization Chapter
      </Button>

      <Table
        dataSource={chapters}
        columns={[
          { title: 'ID', dataIndex: 'id' },
          { title: 'Title', dataIndex: 'title' },
          {
            title: 'Type',
            render: (_, record) =>
              record.isPublic ? (
                <Tag color="blue">Public (View Only)</Tag>
              ) : (
                <Tag color="green">My Organization</Tag>
              )
          },
          {
            title: 'Actions',
            render: (_, record) => (
              record.isPublic ? (
                <Text type="secondary">Read-only</Text>
              ) : (
                <Space>
                  <Button onClick={() => handleEdit(record)}>Edit</Button>
                  <Button danger onClick={() => handleDelete(record)}>Delete</Button>
                </Space>
              )
            )
          },
        ]}
      />
    </div>
  );
};
```

### **Database Migration**

A migration has been created: `1732250000000-AddChapterOwnership.ts`

Run the migration when database is available:
```bash
npm run migration:run
```

**Migration adds:**
- `center_id` column (nullable)
- `is_public` column (boolean, default false)
- Foreign key constraint to centers table
- Composite unique indexes for order_index per organization
- Check constraint: public chapters must have `center_id = NULL`
- Indexes for querying by center and public status

---

## 🏗️ Architecture Principles

### **IMPORTANT: Client-Side vs Server-Side Responsibilities**

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile App (Flutter)                  │
│  - Speech Recognition (client-side)                      │
│  - Speech-to-Text comparison                             │
│  - Score calculation                                      │
│  - TTS audio playback                                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ POST /pronunciation/attempts
                  │ (sends calculated scores)
                  ▼
┌─────────────────────────────────────────────────────────┐
│                    NestJS Backend                         │
│  - Stores pronunciation attempts                         │
│  - Tracks reference text                                 │
│  - Stores client-calculated scores                       │
│  - NO TTS/Speech Recognition                             │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ GET /pronunciation/attempts
                  │ (retrieves history)
                  ▼
┌─────────────────────────────────────────────────────────┐
│                React Web Dashboard                        │
│  - View pronunciation history (read-only)                │
│  - View student statistics                               │
│  - Display achievement progress                          │
│  - Manage gamification settings                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security & Role-Based Access

### **Two-Layer Security Architecture**

#### **Layer 1: Backend Guards (REAL SECURITY) ✅**
All endpoints are protected with NestJS Guards:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
@Get('pronunciation/attempts')
async getAttempts() {
  // Backend ALWAYS enforces this
  // Cannot be bypassed from React
}
```

#### **Layer 2: React UI Hiding (UX IMPROVEMENT) ✅**
Hide UI elements based on user role:

```tsx
// Hide features from students (they use mobile app)
{user.role === 'teacher' && (
  <Button onClick={viewPronunciationHistory}>
    View Student Pronunciation History
  </Button>
)}

// Hide admin-only features
{user.role === 'agency' && (
  <Button onClick={manageAchievements}>
    Manage Achievements
  </Button>
)}
```

**Key Point**: Even if someone bypasses React hiding (inspect element, console), the backend will reject unauthorized requests with `403 Forbidden`.

---

## 📊 Module 1: Pronunciation Module

### **Purpose**
Track student pronunciation practice attempts with client-calculated scores. Backend provides reference text; mobile app handles speech recognition.

### **Database Schema**

```sql
CREATE TABLE pronunciation_attempts (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  reference_text TEXT NOT NULL,
  recognized_text TEXT,
  pronunciation_score DECIMAL(5,2), -- 0-100
  accuracy_score DECIMAL(5,2),      -- 0-100
  fluency_score DECIMAL(5,2),       -- 0-100
  completeness_score DECIMAL(5,2),  -- 0-100
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **API Endpoints**

#### **1. Create Pronunciation Attempt**
```http
POST /api/v1/pronunciation/attempts
Authorization: Bearer <student_jwt>
Content-Type: application/json

{
  "questionId": 5,
  "referenceText": "Hello, how are you?",
  "recognizedText": "Hello, how are you?",
  "pronunciationScore": 87.5,
  "accuracyScore": 90.0,
  "fluencyScore": 85.0,
  "completenessScore": 88.0
}
```

**Response:**
```json
{
  "id": 42,
  "studentId": 1,
  "questionId": 5,
  "referenceText": "Hello, how are you?",
  "recognizedText": "Hello, how are you?",
  "pronunciationScore": 87.5,
  "accuracyScore": 90.0,
  "fluencyScore": 85.0,
  "completenessScore": 88.0,
  "createdAt": "2025-11-21T10:30:00Z",
  "updatedAt": "2025-11-21T10:30:00Z"
}
```

#### **2. Get Pronunciation History**
```http
GET /api/v1/pronunciation/attempts?questionId=5&limit=20&offset=0
Authorization: Bearer <student_jwt>
```

**Response:**
```json
[
  {
    "id": 42,
    "studentId": 1,
    "questionId": 5,
    "pronunciationScore": 87.5,
    "createdAt": "2025-11-21T10:30:00Z"
  },
  // ... more attempts
]
```

#### **3. Get Best Score for Question**
```http
GET /api/v1/pronunciation/best-score/5
Authorization: Bearer <student_jwt>
```

**Response:**
```json
{
  "questionId": 5,
  "bestScore": 92.5
}
```

#### **4. Get Pronunciation Statistics**
```http
GET /api/v1/pronunciation/stats
Authorization: Bearer <student_jwt>
```

**Response:**
```json
{
  "totalAttempts": 125
}
```

### **React TypeScript Types**

```typescript
// src/types/pronunciation.types.ts

export interface PronunciationAttempt {
  id: number;
  studentId: number;
  questionId: number;
  referenceText: string;
  recognizedText: string | null;
  pronunciationScore: number | null;
  accuracyScore: number | null;
  fluencyScore: number | null;
  completenessScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePronunciationAttemptDto {
  questionId: number;
  referenceText: string;
  recognizedText?: string;
  pronunciationScore?: number;
  accuracyScore?: number;
  fluencyScore?: number;
  completenessScore?: number;
}

export interface PronunciationHistoryQuery {
  levelId?: number;
  questionId?: number;
  limit?: number;
  offset?: number;
}

export interface BestScoreResponse {
  questionId: number;
  bestScore: number | null;
}

export interface PronunciationStatsResponse {
  totalAttempts: number;
}
```

### **React Query Hooks**

```typescript
// src/hooks/queries/usePronunciation.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getPronunciationAttemptsApi, 
  getBestScoreApi,
  getPronunciationStatsApi 
} from '@/api/pronunciation.api';
import type { PronunciationHistoryQuery } from '@/types';

// Query keys factory
export const pronunciationKeys = {
  all: ['pronunciation'] as const,
  attempts: () => [...pronunciationKeys.all, 'attempts'] as const,
  attemptsList: (filters: PronunciationHistoryQuery) => 
    [...pronunciationKeys.attempts(), filters] as const,
  bestScore: (questionId: number) => 
    [...pronunciationKeys.all, 'best-score', questionId] as const,
  stats: () => [...pronunciationKeys.all, 'stats'] as const,
};

// Get pronunciation attempts
export const usePronunciationAttempts = (params: PronunciationHistoryQuery) => {
  return useQuery({
    queryKey: pronunciationKeys.attemptsList(params),
    queryFn: () => getPronunciationAttemptsApi(params),
    enabled: !!params,
  });
};

// Get best score for question
export const useBestScore = (questionId: number) => {
  return useQuery({
    queryKey: pronunciationKeys.bestScore(questionId),
    queryFn: () => getBestScoreApi(questionId),
    enabled: !!questionId,
  });
};

// Get pronunciation stats
export const usePronunciationStats = () => {
  return useQuery({
    queryKey: pronunciationKeys.stats(),
    queryFn: getPronunciationStatsApi,
  });
};
```

### **API Client Functions**

```typescript
// src/api/pronunciation.api.ts
import { apiClient } from './client';
import type { 
  PronunciationAttempt, 
  PronunciationHistoryQuery,
  BestScoreResponse,
  PronunciationStatsResponse
} from '@/types';

export const getPronunciationAttemptsApi = async (
  params: PronunciationHistoryQuery
): Promise<PronunciationAttempt[]> => {
  const response = await apiClient.get('/pronunciation/attempts', { params });
  return response.data;
};

export const getBestScoreApi = async (
  questionId: number
): Promise<BestScoreResponse> => {
  const response = await apiClient.get(`/pronunciation/best-score/${questionId}`);
  return response.data;
};

export const getPronunciationStatsApi = async (): Promise<PronunciationStatsResponse> => {
  const response = await apiClient.get('/pronunciation/stats');
  return response.data;
};
```

### **React Component Example**

```tsx
// src/pages/teacher/StudentPronunciationHistory.tsx
import { Table, Card, Statistic, Row, Col } from 'antd';
import { usePronunciationAttempts, usePronunciationStats } from '@/hooks/queries/usePronunciation';
import type { PronunciationAttempt } from '@/types';

export const StudentPronunciationHistory = ({ studentId }: { studentId: number }) => {
  const { data: attempts, isLoading } = usePronunciationAttempts({ 
    limit: 50 
  });
  
  const { data: stats } = usePronunciationStats();

  const columns = [
    {
      title: 'Question ID',
      dataIndex: 'questionId',
      key: 'questionId',
    },
    {
      title: 'Reference Text',
      dataIndex: 'referenceText',
      key: 'referenceText',
      ellipsis: true,
    },
    {
      title: 'Overall Score',
      dataIndex: 'pronunciationScore',
      key: 'pronunciationScore',
      render: (score: number | null) => score ? `${score.toFixed(1)}%` : 'N/A',
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracyScore',
      key: 'accuracyScore',
      render: (score: number | null) => score ? `${score.toFixed(1)}%` : 'N/A',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Total Attempts" 
              value={stats?.totalAttempts || 0} 
            />
          </Card>
        </Col>
      </Row>

      <Card title="Pronunciation History">
        <Table
          columns={columns}
          dataSource={attempts}
          loading={isLoading}
          rowKey="id"
        />
      </Card>
    </div>
  );
};
```

### **Role-Based Access in React**

```tsx
// Teachers can view student pronunciation history
{user.role === 'teacher' && (
  <Route 
    path="students/:id/pronunciation" 
    element={<StudentPronunciationHistory />} 
  />
)}

// Students use mobile app only (web shows message)
{user.role === 'student' && (
  <Alert 
    type="info" 
    message="Please use the mobile app to practice pronunciation"
  />
)}
```

---

## 🎮 Module 2: Gamification Module

### **Purpose**
Motivate students with achievements, points, streaks, and leaderboards. Backend tracks all gamification data; React displays stats and manages achievement definitions.

### **Database Schema**

```sql
-- Achievements definition
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  code VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon_url VARCHAR(500),
  points_reward INTEGER DEFAULT 0,
  tier VARCHAR(50) CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Student unlocked achievements
CREATE TABLE student_achievements (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (student_id, achievement_id)
);

-- Student points and streaks
CREATE TABLE student_points (
  id SERIAL PRIMARY KEY,
  student_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Point transaction audit trail
CREATE TABLE point_transactions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason VARCHAR(100) CHECK (reason IN ('level_complete', 'achievement_unlock', 'perfect_score', 'streak_bonus', 'daily_login', 'admin_adjustment')),
  reference_id INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **API Endpoints**

#### **Achievement Endpoints**

**1. Unlock Achievement (Student)**
```http
POST /api/v1/gamification/achievements/unlock
Authorization: Bearer <student_jwt>
Content-Type: application/json

{
  "achievementCode": "first_level_complete",
  "studentId": 1
}
```

**Response:**
```json
{
  "id": 10,
  "studentId": 1,
  "achievementId": 2,
  "achievement": {
    "id": 2,
    "code": "first_level_complete",
    "title": "First Victory",
    "description": "Complete your first level",
    "pointsReward": 25,
    "tier": "bronze",
    "iconUrl": "/icons/achievements/first_victory.png"
  },
  "unlockedAt": "2025-11-21T10:30:00Z"
}
```

**2. Get My Achievements (Student)**
```http
GET /api/v1/gamification/achievements/me
Authorization: Bearer <student_jwt>
```

**Response:**
```json
[
  {
    "id": 10,
    "achievementId": 2,
    "achievement": {
      "code": "first_level_complete",
      "title": "First Victory",
      "pointsReward": 25,
      "tier": "bronze"
    },
    "unlockedAt": "2025-11-21T10:30:00Z"
  }
]
```

**3. Get All Available Achievements**
```http
GET /api/v1/gamification/achievements
Authorization: Bearer <jwt>
```

**Response:**
```json
[
  {
    "id": 1,
    "code": "first_login",
    "title": "Welcome Aboard!",
    "description": "Log in for the first time",
    "pointsReward": 10,
    "tier": "bronze",
    "iconUrl": "/icons/achievements/first_login.png",
    "isActive": true
  }
]
```

**4. Get Achievement Progress (Student)**
```http
GET /api/v1/gamification/achievements/progress
Authorization: Bearer <student_jwt>
```

**Response:**
```json
{
  "unlocked": 8,
  "total": 20,
  "percentage": 40.0
}
```

#### **Points Endpoints**

**1. Award Points**
```http
POST /api/v1/gamification/points/award
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "studentId": 1,
  "points": 50,
  "reason": "level_complete",
  "referenceId": 12,
  "notes": "Completed Level 12 with high score"
}
```

**Roles**: `STUDENT` (self-award), `TEACHER`, `AGENCY` (award to others)

**Response:**
```json
{
  "id": 150,
  "studentId": 1,
  "points": 50,
  "reason": "level_complete",
  "referenceId": 12,
  "notes": "Completed Level 12 with high score",
  "createdAt": "2025-11-21T10:30:00Z"
}
```

**2. Get My Stats (Student)**
```http
GET /api/v1/gamification/stats/me
Authorization: Bearer <student_jwt>
```

**Response:**
```json
{
  "totalPoints": 1250,
  "currentStreak": 7,
  "longestStreak": 15,
  "achievementsCount": 8,
  "rank": 42
}
```

**3. Update Streak (Student)**
```http
POST /api/v1/gamification/streak/update
Authorization: Bearer <student_jwt>
```

**Response:**
```json
{
  "message": "Streak updated successfully"
}
```

#### **Leaderboard Endpoints**

**1. Get Leaderboard**
```http
GET /api/v1/gamification/leaderboard?period=weekly&limit=10&offset=0
Authorization: Bearer <jwt>
```

**Query Parameters:**
- `period`: `daily` | `weekly` | `monthly` | `alltime` (default: `alltime`)
- `limit`: 1-500 (default: 100)
- `offset`: for pagination (default: 0)

**Response:**
```json
[
  {
    "rank": 1,
    "studentId": 5,
    "studentName": "Nguyen Van A",
    "totalPoints": 5000,
    "achievementsCount": 15
  },
  {
    "rank": 2,
    "studentId": 12,
    "studentName": "Tran Thi B",
    "totalPoints": 4800,
    "achievementsCount": 14
  }
]
```

**2. Get My Rank (Student)**
```http
GET /api/v1/gamification/rank/me
Authorization: Bearer <student_jwt>
```

**Response:**
```json
{
  "rank": 42,
  "message": "You are ranked #42"
}
```

### **React TypeScript Types**

```typescript
// src/types/gamification.types.ts

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type PointReason = 
  | 'level_complete' 
  | 'achievement_unlock' 
  | 'perfect_score' 
  | 'streak_bonus' 
  | 'daily_login' 
  | 'admin_adjustment';

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'alltime';

export interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  iconUrl: string | null;
  pointsReward: number;
  tier: AchievementTier;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAchievement {
  id: number;
  studentId: number;
  achievementId: number;
  achievement: Achievement;
  unlockedAt: string;
  createdAt: string;
}

export interface StudentStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  achievementsCount: number;
  rank: number;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: number;
  studentName?: string;
  totalPoints: number;
  achievementsCount: number;
}

export interface PointTransaction {
  id: number;
  studentId: number;
  points: number;
  reason: PointReason;
  referenceId: number | null;
  notes: string | null;
  createdAt: string;
}

export interface UnlockAchievementDto {
  achievementCode: string;
  studentId: number;
}

export interface AwardPointsDto {
  studentId: number;
  points: number;
  reason: PointReason;
  referenceId?: number;
  notes?: string;
}

export interface LeaderboardQuery {
  period?: LeaderboardPeriod;
  limit?: number;
  offset?: number;
}

export interface AchievementProgress {
  unlocked: number;
  total: number;
  percentage: number;
}
```

### **React Query Hooks**

```typescript
// src/hooks/queries/useGamification.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAchievementsApi,
  getStudentAchievementsApi,
  unlockAchievementApi,
  getStudentStatsApi,
  getLeaderboardApi,
  getMyRankApi,
  awardPointsApi,
  updateStreakApi,
} from '@/api/gamification.api';
import type { LeaderboardQuery, UnlockAchievementDto, AwardPointsDto } from '@/types';

// Query keys factory
export const gamificationKeys = {
  all: ['gamification'] as const,
  achievements: () => [...gamificationKeys.all, 'achievements'] as const,
  studentAchievements: (studentId?: number) => 
    [...gamificationKeys.all, 'student-achievements', studentId] as const,
  stats: (studentId?: number) => 
    [...gamificationKeys.all, 'stats', studentId] as const,
  leaderboard: (query: LeaderboardQuery) => 
    [...gamificationKeys.all, 'leaderboard', query] as const,
  rank: (studentId?: number) => 
    [...gamificationKeys.all, 'rank', studentId] as const,
};

// Get all achievements
export const useAchievements = () => {
  return useQuery({
    queryKey: gamificationKeys.achievements(),
    queryFn: getAchievementsApi,
  });
};

// Get student's unlocked achievements
export const useStudentAchievements = (studentId?: number) => {
  return useQuery({
    queryKey: gamificationKeys.studentAchievements(studentId),
    queryFn: getStudentAchievementsApi,
  });
};

// Get student stats
export const useStudentStats = (studentId?: number) => {
  return useQuery({
    queryKey: gamificationKeys.stats(studentId),
    queryFn: getStudentStatsApi,
  });
};

// Get leaderboard
export const useLeaderboard = (query: LeaderboardQuery = {}) => {
  return useQuery({
    queryKey: gamificationKeys.leaderboard(query),
    queryFn: () => getLeaderboardApi(query),
  });
};

// Get my rank
export const useMyRank = () => {
  return useQuery({
    queryKey: gamificationKeys.rank(),
    queryFn: getMyRankApi,
  });
};

// Unlock achievement mutation
export const useUnlockAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UnlockAchievementDto) => unlockAchievementApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.studentAchievements() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.stats() });
    },
  });
};

// Award points mutation
export const useAwardPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AwardPointsDto) => awardPointsApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.stats() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.leaderboard({}) });
    },
  });
};

// Update streak mutation
export const useUpdateStreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStreakApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.stats() });
    },
  });
};
```

### **API Client Functions**

```typescript
// src/api/gamification.api.ts
import { apiClient } from './client';
import type {
  Achievement,
  StudentAchievement,
  StudentStats,
  LeaderboardEntry,
  LeaderboardQuery,
  UnlockAchievementDto,
  AwardPointsDto,
  AchievementProgress,
} from '@/types';

export const getAchievementsApi = async (): Promise<Achievement[]> => {
  const response = await apiClient.get('/gamification/achievements');
  return response.data;
};

export const getStudentAchievementsApi = async (): Promise<StudentAchievement[]> => {
  const response = await apiClient.get('/gamification/achievements/me');
  return response.data;
};

export const getAchievementProgressApi = async (): Promise<AchievementProgress> => {
  const response = await apiClient.get('/gamification/achievements/progress');
  return response.data;
};

export const unlockAchievementApi = async (
  data: UnlockAchievementDto
): Promise<StudentAchievement> => {
  const response = await apiClient.post('/gamification/achievements/unlock', data);
  return response.data;
};

export const getStudentStatsApi = async (): Promise<StudentStats> => {
  const response = await apiClient.get('/gamification/stats/me');
  return response.data;
};

export const awardPointsApi = async (data: AwardPointsDto): Promise<any> => {
  const response = await apiClient.post('/gamification/points/award', data);
  return response.data;
};

export const updateStreakApi = async (): Promise<void> => {
  await apiClient.post('/gamification/streak/update');
};

export const getLeaderboardApi = async (
  query: LeaderboardQuery
): Promise<LeaderboardEntry[]> => {
  const response = await apiClient.get('/gamification/leaderboard', { params: query });
  return response.data;
};

export const getMyRankApi = async (): Promise<{ rank: number; message: string }> => {
  const response = await apiClient.get('/gamification/rank/me');
  return response.data;
};
```

### **React Component Examples**

#### **1. Student Stats Dashboard**

```tsx
// src/components/features/gamification/StudentStatsCard.tsx
import { Card, Row, Col, Statistic, Progress, Badge } from 'antd';
import { TrophyOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';
import { useStudentStats, useAchievementProgress } from '@/hooks/queries/useGamification';

export const StudentStatsCard = () => {
  const { data: stats, isLoading } = useStudentStats();
  const { data: progress } = useAchievementProgress();

  return (
    <Card loading={isLoading} title="Your Stats">
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic
            title="Total Points"
            value={stats?.totalPoints || 0}
            prefix={<StarOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Current Streak"
            value={stats?.currentStreak || 0}
            suffix="days"
            prefix={<FireOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Rank"
            value={`#${stats?.rank || 0}`}
            prefix={<TrophyOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
      </Row>

      {progress && (
        <div style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 8 }}>
            <Badge count={progress.unlocked} showZero>
              <span>Achievements Progress</span>
            </Badge>
            <span style={{ float: 'right' }}>
              {progress.unlocked} / {progress.total}
            </span>
          </div>
          <Progress 
            percent={progress.percentage} 
            status="active"
            strokeColor="#52c41a"
          />
        </div>
      )}
    </Card>
  );
};
```

#### **2. Leaderboard Component**

```tsx
// src/components/features/gamification/Leaderboard.tsx
import { Card, Table, Tag, Select, Space } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useLeaderboard } from '@/hooks/queries/useGamification';
import type { LeaderboardPeriod, LeaderboardEntry } from '@/types';

export const Leaderboard = () => {
  const [period, setPeriod] = useState<LeaderboardPeriod>('alltime');
  const { data: leaderboard, isLoading } = useLeaderboard({ 
    period, 
    limit: 100 
  });

  const columns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => {
        if (rank === 1) return <Tag color="gold">🥇 {rank}</Tag>;
        if (rank === 2) return <Tag color="silver">🥈 {rank}</Tag>;
        if (rank === 3) return <Tag color="bronze">🥉 {rank}</Tag>;
        return rank;
      },
    },
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (name: string) => name || 'Anonymous',
    },
    {
      title: 'Points',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      render: (points: number) => (
        <Space>
          <TrophyOutlined style={{ color: '#faad14' }} />
          {points.toLocaleString()}
        </Space>
      ),
    },
    {
      title: 'Achievements',
      dataIndex: 'achievementsCount',
      key: 'achievementsCount',
      width: 120,
    },
  ];

  return (
    <Card 
      title="Leaderboard"
      extra={
        <Select
          value={period}
          onChange={setPeriod}
          style={{ width: 120 }}
          options={[
            { label: 'All Time', value: 'alltime' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Daily', value: 'daily' },
          ]}
        />
      }
    >
      <Table
        columns={columns}
        dataSource={leaderboard}
        loading={isLoading}
        rowKey="studentId"
        pagination={false}
      />
    </Card>
  );
};
```

#### **3. Achievement Gallery**

```tsx
// src/components/features/gamification/AchievementGallery.tsx
import { Card, Row, Col, Badge, Tooltip, Typography } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAchievements, useStudentAchievements } from '@/hooks/queries/useGamification';
import type { Achievement } from '@/types';

const { Text } = Typography;

export const AchievementGallery = () => {
  const { data: allAchievements } = useAchievements();
  const { data: unlockedAchievements } = useStudentAchievements();

  const unlockedIds = new Set(
    unlockedAchievements?.map(a => a.achievementId) || []
  );

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return '#cd7f32';
      case 'silver': return '#c0c0c0';
      case 'gold': return '#ffd700';
      case 'platinum': return '#e5e4e2';
      default: return '#8c8c8c';
    }
  };

  return (
    <Card title="Achievements">
      <Row gutter={[16, 16]}>
        {allAchievements?.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          
          return (
            <Col xs={12} sm={8} md={6} lg={4} key={achievement.id}>
              <Tooltip title={achievement.description}>
                <Card
                  hoverable
                  style={{
                    textAlign: 'center',
                    opacity: isUnlocked ? 1 : 0.5,
                    borderColor: getTierColor(achievement.tier),
                    borderWidth: 2,
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <Badge
                    count={isUnlocked ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <LockOutlined />}
                    offset={[-10, 10]}
                  >
                    <div
                      style={{
                        fontSize: 48,
                        marginBottom: 8,
                        filter: isUnlocked ? 'none' : 'grayscale(100%)',
                      }}
                    >
                      {achievement.iconUrl ? (
                        <img 
                          src={achievement.iconUrl} 
                          alt={achievement.title}
                          style={{ width: 64, height: 64 }}
                        />
                      ) : (
                        '🏆'
                      )}
                    </div>
                  </Badge>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>
                    {achievement.title}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {achievement.pointsReward} points
                  </Text>
                </Card>
              </Tooltip>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
};
```

### **Role-Based Access in React**

```tsx
// Teachers/Centers can view student gamification stats
{(user.role === 'teacher' || user.role === 'center') && (
  <>
    <Route path="students/:id/stats" element={<StudentStatsCard />} />
    <Route path="leaderboard" element={<Leaderboard />} />
  </>
)}

// Agency can manage achievements (create/edit)
{user.role === 'agency' && (
  <Route path="achievements/manage" element={<AchievementManagement />} />
)}

// Students use mobile app for earning achievements
{user.role === 'student' && (
  <Alert 
    type="info" 
    message="Use the mobile app to earn achievements and points!"
  />
)}
```

---

## 🎨 UI/UX Best Practices

### **1. Loading States**
```tsx
const { data, isLoading, error } = useStudentStats();

if (isLoading) return <Skeleton active />;
if (error) return <Alert type="error" message="Failed to load stats" />;
```

### **2. Error Handling**
```tsx
import { message } from 'antd';
import { handleApiError } from '@/utils/errorHandler';

const mutation = useUnlockAchievement();

const handleUnlock = async (code: string) => {
  try {
    await mutation.mutateAsync({ achievementCode: code, studentId: user.id });
    message.success('Achievement unlocked! 🎉');
  } catch (error) {
    handleApiError(error);
  }
};
```

### **3. Optimistic Updates**
```tsx
const queryClient = useQueryClient();

const mutation = useAwardPoints({
  onMutate: async (newPoints) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: gamificationKeys.stats() });

    // Snapshot previous value
    const previousStats = queryClient.getQueryData(gamificationKeys.stats());

    // Optimistically update
    queryClient.setQueryData(gamificationKeys.stats(), (old: any) => ({
      ...old,
      totalPoints: old.totalPoints + newPoints.points,
    }));

    return { previousStats };
  },
  onError: (err, newPoints, context) => {
    // Rollback on error
    queryClient.setQueryData(gamificationKeys.stats(), context.previousStats);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: gamificationKeys.stats() });
  },
});
```

### **4. Real-time Updates (Optional)**
```tsx
// Poll for leaderboard updates every 30 seconds
const { data } = useLeaderboard(
  { period: 'daily', limit: 10 },
  {
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  }
);
```

---

## 🔄 Common Integration Patterns

### **Pattern 1: Teacher Viewing Student Progress**
```tsx
// src/pages/teacher/StudentDetail.tsx
import { Tabs } from 'antd';
import { StudentPronunciationHistory } from '@/components/features/pronunciation';
import { StudentStatsCard } from '@/components/features/gamification';

export const StudentDetail = () => {
  const { studentId } = useParams();

  return (
    <Tabs
      items={[
        {
          key: 'overview',
          label: 'Overview',
          children: <StudentOverview studentId={studentId} />,
        },
        {
          key: 'pronunciation',
          label: 'Pronunciation Practice',
          children: <StudentPronunciationHistory studentId={studentId} />,
        },
        {
          key: 'gamification',
          label: 'Achievements & Stats',
          children: <StudentStatsCard studentId={studentId} />,
        },
      ]}
    />
  );
};
```

### **Pattern 2: Center Dashboard Analytics**
```tsx
// src/pages/center/CenterDashboard.tsx
import { Row, Col } from 'antd';
import { Leaderboard } from '@/components/features/gamification';

export const CenterDashboard = () => {
  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Leaderboard />
      </Col>
      <Col span={12}>
        <TopPronunciationScores />
      </Col>
      <Col span={12}>
        <RecentAchievements />
      </Col>
    </Row>
  );
};
```

### **Pattern 3: Agency Achievement Management**
```tsx
// src/pages/agency/AchievementManagement.tsx (Agency only)
import { Table, Button, Form, Input, Select } from 'antd';
import { useAchievements } from '@/hooks/queries/useGamification';
import { usePermission } from '@/hooks/usePermission';

export const AchievementManagement = () => {
  const { can } = usePermission();
  const { data: achievements } = useAchievements();

  // Only Agency can create/edit achievements
  if (!can('achievements', 'create')) {
    return <Alert type="warning" message="Access denied" />;
  }

  return (
    <div>
      <Button type="primary" onClick={() => setShowCreateModal(true)}>
        Create Achievement
      </Button>
      <Table dataSource={achievements} />
    </div>
  );
};
```

---

## 🚨 Error Scenarios & Handling

### **Common Error Responses**

#### **1. Unauthorized (401)**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**React Handling:**
```tsx
// Axios interceptor already handles 401 and redirects to login
// No additional handling needed in components
```

#### **2. Forbidden (403)**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

**React Handling:**
```tsx
// Show access denied message
if (error.response?.status === 403) {
  return <Result status="403" title="Access Denied" />;
}
```

#### **3. Not Found (404)**
```json
{
  "statusCode": 404,
  "message": "Achievement with code 'invalid_code' not found",
  "error": "Not Found"
}
```

**React Handling:**
```tsx
message.error('Achievement not found');
```

#### **4. Conflict (409)**
```json
{
  "statusCode": 409,
  "message": "Achievement already unlocked",
  "error": "Conflict"
}
```

**React Handling:**
```tsx
message.warning('You already unlocked this achievement');
```

---

## 📝 Testing Guide

### **Unit Testing Hooks**
```typescript
// src/hooks/queries/useGamification.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStudentStats } from './useGamification';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useStudentStats', () => {
  it('fetches student stats successfully', async () => {
    const { result } = renderHook(() => useStudentStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      totalPoints: 1250,
      currentStreak: 7,
      rank: 42,
    });
  });
});
```

### **Component Testing**
```typescript
// src/components/features/gamification/Leaderboard.test.tsx
import { render, screen } from '@testing-library/react';
import { Leaderboard } from './Leaderboard';

describe('Leaderboard', () => {
  it('renders leaderboard with top students', async () => {
    render(<Leaderboard />);

    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
      expect(screen.getByText('5000')).toBeInTheDocument();
    });
  });
});
```

---

## 🎯 Summary Checklist

### **React Developer Tasks**

- [ ] **TypeScript Types**
  - [ ] Add pronunciation types to `src/types/pronunciation.types.ts`
  - [ ] Add gamification types to `src/types/gamification.types.ts`

- [ ] **API Client**
  - [ ] Create `src/api/pronunciation.api.ts`
  - [ ] Create `src/api/gamification.api.ts`

- [ ] **React Query Hooks**
  - [ ] Create `src/hooks/queries/usePronunciation.ts`
  - [ ] Create `src/hooks/queries/useGamification.ts`

- [ ] **Components**
  - [ ] StudentPronunciationHistory component
  - [ ] StudentStatsCard component
  - [ ] Leaderboard component
  - [ ] AchievementGallery component

- [ ] **Routes**
  - [ ] Add pronunciation routes (Teacher role)
  - [ ] Add gamification routes (All roles with proper guards)

- [ ] **Role-Based UI Hiding**
  - [ ] Hide pronunciation features from students (mobile-only)
  - [ ] Hide achievement management from non-agency roles
  - [ ] Show appropriate features per role

- [ ] **Error Handling**
  - [ ] Handle 401/403/404/409 errors gracefully
  - [ ] Show user-friendly error messages

- [ ] **Testing**
  - [ ] Unit tests for hooks
  - [ ] Component tests
  - [ ] E2E tests for critical flows

---

## 🔗 Additional Resources

- **NestJS Backend Documentation**: See `CLAUDE.md` for complete API reference
- **Week 3 Implementation**: See `WEEK3_IMPLEMENTATION_SUMMARY.md` for technical details
- **Achievement Seed Data**: See `src/database/seeds/seed-achievements.ts` for 20 sample achievements

---

**Last Updated**: 2025-11-21  
**Backend Version**: Week 3  
**Status**: ✅ Production Ready

Happy coding! 🚀
