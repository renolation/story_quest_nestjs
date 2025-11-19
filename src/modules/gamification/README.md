# Gamification Module

**Phase**: 4
**Status**: 🔲 TODO
**Priority**: MEDIUM

## Purpose
Implement gamification features: achievements, points, streaks, and daily goals to increase student engagement.

## Features
- [ ] Achievement system (badges, milestones)
- [ ] Points accumulation and tracking
- [ ] Streak tracking (consecutive days)
- [ ] Daily goals management (words, minutes)
- [ ] Leaderboards (class, center, global)
- [ ] Level-up system with rewards
- [ ] Achievement unlocking logic
- [ ] Bonus points for streaks

## Entities
- **Achievement**: Achievement definitions
- **StudentAchievement**: Student progress toward achievements
- **StudentPoints**: Total points and streaks
- **DailyGoal**: Daily learning goals

## Dependencies
- Progress module (for points calculation)
- Users module (for student data)

## Implementation Order
1. Create entities and DTOs
2. Implement achievement definition service
3. Create points tracking service
4. Implement streak calculation (cron job)
5. Create daily goals service
6. Implement achievement unlocking logic
7. Create leaderboard queries
8. Add REST endpoints

## API Endpoints
- `GET /gamification/achievements` - List all achievements
- `GET /gamification/achievements/me` - Get my achievements with progress
- `GET /gamification/points/me` - Get my points and streaks
- `GET /gamification/daily-goals/me` - Get my daily goals
- `PATCH /gamification/daily-goals/me` - Update my daily goal targets
- `GET /gamification/leaderboard` - Get leaderboard (class/center/global)

## Business Logic
- Auto-unlock achievements when progress >= required threshold
- Calculate streaks daily (cron at midnight)
- Reset streaks if no activity for 1 day
- Award bonus points for 7-day, 30-day, 100-day streaks
- Update daily goals progress in real-time

## Testing
- [ ] Unit tests for achievement unlocking
- [ ] Unit tests for streak calculation
- [ ] Integration tests for points accumulation
- [ ] E2E tests for complete gamification flow
- [ ] Test leaderboard queries performance
