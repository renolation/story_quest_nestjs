# Grades Module

**Phase**: 7
**Status**: 🔲 TODO
**Priority**: LOW (After Flutter MVP)

## Purpose
Manage grade levels (3, 4, 5) for student classification.

## Features
- [ ] List all grades
- [ ] Grade-based content filtering

## Entities
- **Grade**: Grade level definitions (3, 4, 5)

## Dependencies
- None (static lookup table)

## Implementation Order
1. Create entity
2. Create seed data (grades 3, 4, 5)
3. Add REST endpoint

## API Endpoints
- `GET /grades` - List all grades

## Seed Data
```sql
INSERT INTO grades (grade_level, description) VALUES
  (3, 'Grade 3 - Ages 8-9'),
  (4, 'Grade 4 - Ages 9-10'),
  (5, 'Grade 5 - Ages 10-11');
```

## Testing
- [ ] Test grade listing
- [ ] Test seed data migration
