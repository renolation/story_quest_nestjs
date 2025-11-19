# Progress Module

**Phase**: 2
**Status**: 🔲 TODO
**Priority**: HIGH
**Depends on**: Auth, Chapters, Units, Levels, Questions

## Purpose
Track student progress through levels, units, and chapters with real-time score calculation and progress updates.

## Features
- [ ] Start level attempt (create attempt record)
- [ ] Submit question answers (validate and score)
- [ ] Complete level (calculate final score)
- [ ] Update unit/chapter progress aggregates
- [ ] Get student progress summary
- [ ] Track time spent on levels

## API Endpoints
- `POST /api/v1/progress/levels/:id/start` - Start a level attempt
- `POST /api/v1/progress/questions/:id/answer` - Submit answer for a question
- `POST /api/v1/progress/levels/:id/complete` - Complete a level attempt
- `GET /api/v1/progress/me` - Get my progress summary

## Database Tables
- `student_level_attempts` - Stores each attempt at completing a level
- `student_question_answers` - Individual question responses with scores
- `student_unit_progress` - Aggregated unit-level progress
- `student_chapter_progress` - Aggregated chapter-level progress

## Implementation Order
1. Create all 4 entity files with TypeORM decorators
2. Create DTOs with class-validator decorators (start-level, submit-answer, complete-level)
3. Implement progress.service.ts (business logic for scoring and progress calculation)
4. Create progress.controller.ts (API endpoints with guards)
5. Add ProgressModule to app.module.ts imports
6. Test endpoints with Postman/Insomnia

## Key Business Logic

### Score Calculation
- Each question has a `points` value
- Student earns points based on correctness
- Final score = sum of all points earned
- Percentage = (earned points / max points) * 100
- Passing score threshold (default: 70%)

### Progress Updates
- After completing a level, update `student_unit_progress`
- Calculate completed levels count and average score
- Update `student_chapter_progress` based on unit progress
- Use transactions to ensure data consistency

## Testing Checklist
- [ ] Unit tests for score calculation logic
- [ ] Unit tests for progress update logic
- [ ] Integration tests for progress.service.ts
- [ ] E2E tests for full level completion flow
- [ ] Performance test with concurrent level attempts
- [ ] Test edge cases (incomplete attempts, retries)

## Related Documentation
- [Progress Tracking Implementation](../../../docs/PROGRESS_TRACKING_IMPLEMENTATION.md)
- [API Endpoints with Progress](../../../docs/API_ENDPOINTS_WITH_PROGRESS.md)
- [Implementation Roadmap - Phase 2](../../../docs/IMPLEMENTATION_ROADMAP.md#phase-2-core-learning-experience-weeks-3-5)
