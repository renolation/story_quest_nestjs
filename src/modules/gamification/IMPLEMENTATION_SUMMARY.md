# Gamification Module - Database Layer Implementation

## Overview
The Gamification Module provides a comprehensive system to motivate students through achievements, points, badges, streaks, and leaderboards. This implementation follows NestJS best practices and integrates seamlessly with the existing codebase.

## Entities Created/Updated

### 1. Achievement Entity
**File:** `src/modules/gamification/entities/achievement.entity.ts`

Defines available achievements that students can unlock.

**Fields:**
- `id` (number, PK): Auto-increment primary key
- `code` (string, unique): Unique identifier (e.g., 'first_level_complete')
- `title` (string): Display name (e.g., 'First Victory')
- `description` (text): How to unlock the achievement
- `iconUrl` (string, nullable): Badge image URL
- `pointsReward` (number): Points awarded on unlock (default: 0)
- `tier` (enum): bronze | silver | gold | platinum
- `isActive` (boolean): Can be disabled by admins (default: true)
- `createdAt` (timestamp): Creation date
- `updatedAt` (timestamp): Last update date

**Indexes:**
- Unique index on `code`

---

### 2. StudentAchievement Entity
**File:** `src/modules/gamification/entities/student-achievement.entity.ts`

Tracks which achievements students have unlocked.

**Fields:**
- `id` (number, PK): Auto-increment primary key
- `studentId` (number, FK): References `users.id`
- `achievementId` (number, FK): References `achievements.id`
- `unlockedAt` (timestamp): When achievement was earned
- `createdAt` (timestamp): Record creation date

**Relationships:**
- Many-to-One with User (CASCADE on delete)
- Many-to-One with Achievement (CASCADE on delete)

**Indexes:**
- Unique composite index on `[studentId, achievementId]` (prevents duplicates)

---

### 3. StudentPoint Entity
**File:** `src/modules/gamification/entities/student-points.entity.ts`

Tracks cumulative points and streaks for each student (one record per student).

**Fields:**
- `id` (number, PK): Auto-increment primary key
- `studentId` (number, FK, unique): References `users.id`
- `totalPoints` (number): Lifetime accumulated points (default: 0)
- `currentStreak` (number): Current consecutive days (default: 0)
- `longestStreak` (number): Best streak achieved (default: 0)
- `lastActivityDate` (date, nullable): For streak calculation
- `createdAt` (timestamp): Creation date
- `updatedAt` (timestamp): Last update date

**Relationships:**
- One-to-One with User (CASCADE on delete)

**Indexes:**
- Unique index on `studentId`

---

### 4. PointTransaction Entity (NEW)
**File:** `src/modules/gamification/entities/point-transaction.entity.ts`

Audit trail for all point awards and deductions.

**Fields:**
- `id` (number, PK): Auto-increment primary key
- `studentId` (number, FK): References `users.id`
- `points` (number): Amount (positive = award, negative = deduction)
- `reason` (enum): Why points were changed
  - `level_complete`
  - `achievement_unlock`
  - `perfect_score`
  - `streak_bonus`
  - `daily_login`
  - `admin_adjustment`
- `referenceId` (number, nullable): Related entity ID (level, achievement, etc.)
- `notes` (text, nullable): Optional description
- `createdAt` (timestamp): Transaction date

**Relationships:**
- Many-to-One with User (CASCADE on delete)

**Indexes:**
- Index on `studentId` (for filtering by student)
- Index on `createdAt` (for time-based queries)

---

### 5. DailyGoal Entity (Existing)
**File:** `src/modules/gamification/entities/daily-goal.entity.ts`

Tracks daily learning goals (maintained from existing implementation).

---

## DTOs Created

### Achievement DTOs

#### CreateAchievementDto
**File:** `src/modules/gamification/dto/create-achievement.dto.ts`

Used for creating new achievements.

**Fields:**
- `code` (string, required, max 100): Unique achievement code
- `title` (string, required, max 255): Display name
- `description` (string, required): How to unlock
- `iconUrl` (string, optional, max 500): Badge image URL
- `pointsReward` (number, required, min 0): Points awarded
- `tier` (enum, required): bronze | silver | gold | platinum

**Validation:**
- All required fields validated with class-validator
- Swagger documentation included

#### UpdateAchievementDto
**File:** `src/modules/gamification/dto/update-achievement.dto.ts`

Extends `PartialType(CreateAchievementDto)` for updating achievements.

---

### Student Achievement DTOs

#### UnlockAchievementDto
**File:** `src/modules/gamification/dto/unlock-achievement.dto.ts`

Used for unlocking achievements for students.

**Fields:**
- `achievementCode` (string, required): Code of achievement to unlock
- `studentId` (number, required): Student who earned it

---

### Point DTOs

#### AwardPointsDto
**File:** `src/modules/gamification/dto/award-points.dto.ts`

Used for awarding or deducting points.

**Fields:**
- `studentId` (number, required): Student to receive points
- `points` (number, required): Amount (positive or negative)
- `reason` (enum, required): Transaction reason
- `referenceId` (number, optional): Related entity ID
- `notes` (string, optional): Description

**Enums:**
- `PointReason`: Defines valid transaction reasons

#### LeaderboardQueryDto
**File:** `src/modules/gamification/dto/leaderboard-query.dto.ts`

Query parameters for leaderboard retrieval.

**Fields:**
- `period` (enum, optional): daily | weekly | monthly | alltime (default: alltime)
- `limit` (number, optional, 1-500): Max entries (default: 100)
- `offset` (number, optional, min 0): Pagination offset (default: 0)

---

### Response DTOs

#### StudentStatsResponseDto
**File:** `src/modules/gamification/dto/student-stats-response.dto.ts`

Student gamification statistics.

**Fields:**
- `totalPoints` (number): Lifetime points
- `currentStreak` (number): Current consecutive days
- `longestStreak` (number): Best streak
- `achievementsCount` (number): Total unlocked achievements
- `rank` (number, optional): Leaderboard position

#### LeaderboardEntryResponseDto
**File:** `src/modules/gamification/dto/leaderboard-entry-response.dto.ts`

Single leaderboard entry.

**Fields:**
- `rank` (number): Position
- `studentId` (number): Student ID
- `studentName` (string, optional): Display name
- `totalPoints` (number): Points earned
- `achievementsCount` (number): Achievements unlocked

---

## Database Schema

### Table: achievements
```sql
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon_url VARCHAR(500),
  points_reward INT DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_achievements_code ON achievements(code);
```

### Table: student_achievements
```sql
CREATE TABLE student_achievements (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, achievement_id)
);

CREATE INDEX idx_student_achievements_student ON student_achievements(student_id);
CREATE INDEX idx_student_achievements_achievement ON student_achievements(achievement_id);
```

### Table: student_points
```sql
CREATE TABLE student_points (
  id SERIAL PRIMARY KEY,
  student_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_points INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_student_points_student ON student_points(student_id);
```

### Table: point_transactions
```sql
CREATE TABLE point_transactions (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INT NOT NULL,
  reason VARCHAR(50) NOT NULL CHECK (reason IN (
    'level_complete',
    'achievement_unlock',
    'perfect_score',
    'streak_bonus',
    'daily_login',
    'admin_adjustment'
  )),
  reference_id INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_point_transactions_student ON point_transactions(student_id);
CREATE INDEX idx_point_transactions_created ON point_transactions(created_at);
```

---

## Module Configuration

### Updated Files

#### gamification.module.ts
**Changes:**
- Added `PointTransaction` entity to TypeORM imports
- Updated entity name from `StudentPoints` to `StudentPoint`
- Updated module documentation

#### gamification.service.ts
**Changes:**
- Added `PointTransaction` repository injection
- Updated entity name from `StudentPoints` to `StudentPoint`
- Repository variable renamed to `studentPointRepository`

---

## Export Structure

### entities/index.ts
```typescript
export * from './achievement.entity';
export * from './student-achievement.entity';
export * from './student-points.entity';
export * from './point-transaction.entity';
export * from './daily-goal.entity';
```

### dto/index.ts
```typescript
// Achievement DTOs
export * from './create-achievement.dto';
export * from './update-achievement.dto';
export * from './unlock-achievement.dto';

// Point DTOs
export * from './award-points.dto';
export * from './leaderboard-query.dto';

// Response DTOs
export * from './student-stats-response.dto';
export * from './leaderboard-entry-response.dto';
```

---

## Usage Examples

### 1. Create Achievement
```typescript
const achievement: CreateAchievementDto = {
  code: 'first_level_complete',
  title: 'First Victory',
  description: 'Complete your first level successfully',
  pointsReward: 50,
  tier: AchievementTier.BRONZE,
  iconUrl: 'https://cdn.example.com/badges/first-victory.png',
};
```

### 2. Unlock Achievement
```typescript
const unlock: UnlockAchievementDto = {
  achievementCode: 'first_level_complete',
  studentId: 123,
};
```

### 3. Award Points
```typescript
const award: AwardPointsDto = {
  studentId: 123,
  points: 100,
  reason: PointReason.PERFECT_SCORE,
  referenceId: 42, // levelId
  notes: 'Perfect score on Level 5',
};
```

### 4. Query Leaderboard
```typescript
const query: LeaderboardQueryDto = {
  period: LeaderboardPeriod.WEEKLY,
  limit: 50,
  offset: 0,
};
```

---

## Next Steps

### Service Implementation
The database layer is now complete. Next steps include:

1. **Service Methods** (gamification.service.ts):
   - `createAchievement(dto: CreateAchievementDto)`
   - `unlockAchievement(dto: UnlockAchievementDto)`
   - `awardPoints(dto: AwardPointsDto)`
   - `getStudentStats(studentId: number)`
   - `getLeaderboard(query: LeaderboardQueryDto)`
   - `updateStreak(studentId: number)`
   - `checkAndUnlockAchievements(studentId: number)`

2. **Controller Endpoints** (gamification.controller.ts):
   - `POST /api/v1/achievements` - Create achievement (ADMIN)
   - `GET /api/v1/achievements` - List achievements
   - `POST /api/v1/achievements/unlock` - Unlock achievement
   - `POST /api/v1/points/award` - Award points (ADMIN)
   - `GET /api/v1/students/:id/stats` - Get student stats
   - `GET /api/v1/leaderboard` - Get leaderboard

3. **Database Migration**:
   - Create migration for new/updated tables
   - Run migration to create schema
   - Seed initial achievement data

4. **Testing**:
   - Unit tests for service methods
   - E2E tests for API endpoints
   - Test achievement unlock logic
   - Test point transaction audit trail

---

## Validation Rules Summary

### CreateAchievementDto
- `code`: Required, string, max 100 chars, unique
- `title`: Required, string, max 255 chars
- `description`: Required, string
- `iconUrl`: Optional, string, max 500 chars
- `pointsReward`: Required, integer, min 0
- `tier`: Required, enum (bronze/silver/gold/platinum)

### UnlockAchievementDto
- `achievementCode`: Required, string
- `studentId`: Required, integer

### AwardPointsDto
- `studentId`: Required, integer
- `points`: Required, integer (positive or negative)
- `reason`: Required, enum
- `referenceId`: Optional, integer
- `notes`: Optional, string

### LeaderboardQueryDto
- `period`: Optional, enum (daily/weekly/monthly/alltime), default: alltime
- `limit`: Optional, integer, min 1, max 500, default 100
- `offset`: Optional, integer, min 0, default 0

---

## Integration Points

### With Progress Module
- Trigger achievement checks after level completion
- Award points for perfect scores
- Track learning milestones

### With Users Module
- Link all gamification data to student users
- Display badges on user profiles
- Show leaderboard rankings

### With Auth Module
- Protect admin endpoints (achievement creation, point adjustments)
- Student endpoints for viewing own stats
- Public leaderboard access

---

## Business Logic Considerations

### Achievement Unlock Triggers
- First level complete
- Perfect score (100%)
- Streak milestones (7, 14, 30 days)
- Total points milestones (100, 500, 1000, 5000)
- Total levels completed (10, 50, 100)
- Chapter completion
- Unit completion

### Point Awards
- Level completion: 10-50 points (based on difficulty)
- Perfect score bonus: 50 points
- Achievement unlock: varies by achievement
- Streak bonuses: 10 points per day
- Daily login: 5 points

### Streak Calculation
- Increment on daily activity (any level completion)
- Reset if no activity for 24+ hours
- Update `longestStreak` if current exceeds it
- Award bonus points for streak milestones

---

## Performance Considerations

### Indexes
- `achievements.code` (unique) - Fast lookup by code
- `student_achievements.[studentId, achievementId]` (unique composite) - Prevent duplicates
- `student_points.studentId` (unique) - One record per student
- `point_transactions.studentId` - Filter by student
- `point_transactions.createdAt` - Time-based queries

### Caching Strategy (Future)
- Cache frequently accessed achievements list
- Cache leaderboard results (TTL: 5 minutes)
- Invalidate student stats cache on point changes

### Query Optimization
- Use batch queries for leaderboard calculation
- Eager load relations where needed
- Paginate transaction history
- Index foreign keys for join performance

---

## Compliance & Security

### Data Privacy (COPPA)
- Leaderboard: Use student IDs, not full names (optional display names)
- Point transactions: Audit trail for transparency
- Achievement data: Public within app context

### Authorization
- Students: View own stats, leaderboard (read-only)
- Teachers: View student stats (read-only)
- Centers: View analytics (read-only)
- Agency: Full CRUD on achievements, manual point adjustments

---

## File Structure Summary

```
src/modules/gamification/
├── entities/
│   ├── achievement.entity.ts (UPDATED)
│   ├── student-achievement.entity.ts (UPDATED)
│   ├── student-points.entity.ts (UPDATED - renamed class to StudentPoint)
│   ├── point-transaction.entity.ts (NEW)
│   ├── daily-goal.entity.ts (EXISTING)
│   └── index.ts (NEW)
├── dto/
│   ├── create-achievement.dto.ts (NEW)
│   ├── update-achievement.dto.ts (NEW)
│   ├── unlock-achievement.dto.ts (NEW)
│   ├── award-points.dto.ts (NEW)
│   ├── leaderboard-query.dto.ts (NEW)
│   ├── student-stats-response.dto.ts (NEW)
│   ├── leaderboard-entry-response.dto.ts (NEW)
│   └── index.ts (NEW)
├── gamification.module.ts (UPDATED)
├── gamification.service.ts (UPDATED)
├── gamification.controller.ts (EXISTING - needs implementation)
├── README.md (EXISTING)
└── IMPLEMENTATION_SUMMARY.md (THIS FILE)
```

---

## Status

**Database Layer: ✅ COMPLETE**

All entities and DTOs have been created following NestJS best practices and existing codebase patterns. The module compiles successfully without errors.

**Next Phase: Service & Controller Implementation**

---

**Last Updated:** 2025-11-21
**Version:** 1.0
**Status:** Database Layer Complete
