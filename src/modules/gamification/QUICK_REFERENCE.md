# Gamification Module - Quick Reference

## Entity Overview

### 1. Achievement
**Purpose:** Define available badges/achievements
**Table:** `achievements`
**Key Fields:** code (unique), title, tier, pointsReward

### 2. StudentAchievement
**Purpose:** Track unlocked achievements per student
**Table:** `student_achievements`
**Key Constraint:** Unique (studentId, achievementId)

### 3. StudentPoint
**Purpose:** Track cumulative points and streaks
**Table:** `student_points`
**Key Constraint:** One record per student (unique studentId)

### 4. PointTransaction
**Purpose:** Audit trail for all point changes
**Table:** `point_transactions`
**Key Fields:** points (can be negative), reason, referenceId

### 5. DailyGoal
**Purpose:** Track daily learning goals
**Table:** `daily_goals`
**Key Fields:** targetWords, completedWords, targetMinutes

---

## DTO Quick Guide

### Creating Achievement
```typescript
import { CreateAchievementDto, AchievementTier } from '@/modules/gamification/dto';

const dto: CreateAchievementDto = {
  code: 'first_level_complete',
  title: 'First Victory',
  description: 'Complete your first level',
  pointsReward: 50,
  tier: AchievementTier.BRONZE,
};
```

### Unlocking Achievement
```typescript
import { UnlockAchievementDto } from '@/modules/gamification/dto';

const dto: UnlockAchievementDto = {
  achievementCode: 'first_level_complete',
  studentId: 123,
};
```

### Awarding Points
```typescript
import { AwardPointsDto, PointReason } from '@/modules/gamification/dto';

const dto: AwardPointsDto = {
  studentId: 123,
  points: 100,
  reason: PointReason.PERFECT_SCORE,
  referenceId: 42, // levelId
  notes: 'Perfect score on Level 5',
};
```

### Querying Leaderboard
```typescript
import { LeaderboardQueryDto, LeaderboardPeriod } from '@/modules/gamification/dto';

const query: LeaderboardQueryDto = {
  period: LeaderboardPeriod.WEEKLY,
  limit: 50,
  offset: 0,
};
```

---

## Enums

### AchievementTier
```typescript
enum AchievementTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}
```

### PointReason
```typescript
enum PointReason {
  LEVEL_COMPLETE = 'level_complete',
  ACHIEVEMENT_UNLOCK = 'achievement_unlock',
  PERFECT_SCORE = 'perfect_score',
  STREAK_BONUS = 'streak_bonus',
  DAILY_LOGIN = 'daily_login',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
}
```

### LeaderboardPeriod
```typescript
enum LeaderboardPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'alltime',
}
```

---

## Import Paths

### Entities
```typescript
import {
  Achievement,
  StudentAchievement,
  StudentPoint,
  PointTransaction,
  DailyGoal,
} from '@/modules/gamification/entities';
```

### DTOs
```typescript
import {
  CreateAchievementDto,
  UpdateAchievementDto,
  UnlockAchievementDto,
  AwardPointsDto,
  LeaderboardQueryDto,
  StudentStatsResponseDto,
  LeaderboardEntryResponseDto,
} from '@/modules/gamification/dto';
```

### Enums
```typescript
import { AchievementTier } from '@/modules/gamification/dto/create-achievement.dto';
import { PointReason } from '@/modules/gamification/dto/award-points.dto';
import { LeaderboardPeriod } from '@/modules/gamification/dto/leaderboard-query.dto';
```

---

## Database Relationships

```
User (students)
  ↓ (one-to-many)
StudentAchievement
  ↓ (many-to-one)
Achievement

User (students)
  ↓ (one-to-one)
StudentPoint

User (students)
  ↓ (one-to-many)
PointTransaction

User (students)
  ↓ (one-to-many)
DailyGoal
```

---

## Common Queries

### Get Student Stats
```typescript
// Find student points
const studentPoints = await studentPointRepository.findOne({
  where: { studentId: 123 },
});

// Count achievements
const achievementCount = await studentAchievementRepository.count({
  where: { studentId: 123 },
});
```

### Get Point History
```typescript
const transactions = await pointTransactionRepository.find({
  where: { studentId: 123 },
  order: { createdAt: 'DESC' },
  take: 50,
});
```

### Check Achievement Unlocked
```typescript
const exists = await studentAchievementRepository.findOne({
  where: {
    studentId: 123,
    achievementId: 5,
  },
});
```

### Calculate Leaderboard
```typescript
const leaderboard = await studentPointRepository
  .createQueryBuilder('sp')
  .leftJoinAndSelect('sp.student', 'user')
  .orderBy('sp.totalPoints', 'DESC')
  .take(100)
  .getMany();
```

---

## Validation Rules

### CreateAchievementDto
- ✓ code: max 100 chars, unique
- ✓ title: max 255 chars
- ✓ description: required
- ✓ iconUrl: max 500 chars (optional)
- ✓ pointsReward: min 0
- ✓ tier: enum (bronze/silver/gold/platinum)

### AwardPointsDto
- ✓ studentId: integer
- ✓ points: integer (can be negative)
- ✓ reason: enum (6 options)
- ✓ referenceId: integer (optional)
- ✓ notes: string (optional)

### LeaderboardQueryDto
- ✓ period: enum (optional, default: alltime)
- ✓ limit: 1-500 (default: 100)
- ✓ offset: min 0 (default: 0)

---

## Business Logic Reminders

### Achievement Unlocking
- Check if already unlocked (unique constraint)
- Award points from achievement.pointsReward
- Create point transaction for audit trail
- Return unlocked achievement details

### Point Awarding
- Update student_points.totalPoints
- Create point_transaction record
- Update streak if applicable
- Check for achievement unlock triggers

### Streak Calculation
- Compare lastActivityDate with today
- If consecutive day: increment currentStreak
- If gap: reset currentStreak to 1
- Update longestStreak if current exceeds it
- Award streak bonus points (milestone days)

### Leaderboard Generation
- Order by totalPoints DESC
- Filter by period (created_at for transactions)
- Paginate results (limit, offset)
- Include achievement count per student
- Optional: anonymize for public view

---

## API Endpoints (Future Implementation)

### Student Endpoints (Mobile App)
```
GET    /api/v1/students/me/achievements        # My achievements
GET    /api/v1/students/me/points              # My points & stats
GET    /api/v1/students/me/transactions        # My point history
GET    /api/v1/leaderboard                     # Public leaderboard
```

### Admin Endpoints (Web Dashboard)
```
POST   /api/v1/achievements                    # Create achievement
GET    /api/v1/achievements                    # List achievements
PATCH  /api/v1/achievements/:id                # Update achievement
DELETE /api/v1/achievements/:id                # Delete achievement
POST   /api/v1/points/award                    # Award/deduct points (admin)
```

### Teacher Endpoints (Web Dashboard)
```
GET    /api/v1/students/:id/achievements       # View student achievements
GET    /api/v1/students/:id/points             # View student points
```

---

## Testing Checklist

### Unit Tests
- [ ] Achievement creation validation
- [ ] Unique achievement code enforcement
- [ ] Point transaction creation
- [ ] Streak calculation logic
- [ ] Leaderboard ranking

### Integration Tests
- [ ] Unlock achievement flow
- [ ] Award points flow
- [ ] Duplicate achievement prevention
- [ ] Point balance calculation
- [ ] Leaderboard query performance

### E2E Tests
- [ ] POST /achievements (admin only)
- [ ] POST /achievements/unlock
- [ ] GET /students/:id/stats
- [ ] GET /leaderboard
- [ ] Point transaction audit trail

---

## Performance Tips

1. **Use Indexes:** All foreign keys are indexed
2. **Batch Queries:** Load achievements in bulk for multiple students
3. **Cache Leaderboard:** 5-minute TTL for frequently accessed leaderboards
4. **Paginate History:** Use limit/offset for point transactions
5. **Eager Loading:** Load relations only when needed

---

## Security Considerations

### Authorization
- Students: Read own data only
- Teachers: Read assigned students' data
- Centers: Read center students' analytics
- Agency: Full CRUD + manual adjustments

### Data Privacy
- Leaderboard: Use usernames (optional), not full names
- Point transactions: Visible to student and admins only
- Achievement data: Public within app context

### Input Validation
- All DTOs use class-validator
- Enum validation for tier/reason/period
- Integer validation for IDs
- String length limits enforced

---

## Migration Commands

```bash
# Generate migration
npm run migration:generate -- -n GamificationTables

# Run migration
npm run migration:run

# Revert migration
npm run migration:revert
```

---

**Last Updated:** 2025-11-21
**Status:** Database Layer Complete
