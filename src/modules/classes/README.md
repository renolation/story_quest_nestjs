# Classes Module

**Phase**: 7
**Status**: 🔲 TODO
**Priority**: LOW (After Flutter MVP)

## Purpose
Manage teaching classes and student enrollments.

## Features
- [ ] CRUD operations for classes
- [ ] Assign teacher to class
- [ ] Enroll/unenroll students
- [ ] List students in a class
- [ ] Class capacity management (max students)
- [ ] Class analytics and reports
- [ ] Grade-level association

## Entities
- **Class**: Class details with teacher assignment
- **StudentClass**: Student-class enrollment junction table

## Dependencies
- Branches module
- Grades module
- Users module (teachers and students)

## Implementation Order
1. Create entities and DTOs
2. Implement classes service with CRUD
3. Add teacher assignment logic
4. Implement student enrollment service
5. Add capacity validation
6. Create analytics queries
7. Add REST endpoints with role guards

## API Endpoints

### Center Endpoints
- `GET /center/classes` - List classes in own center
- `POST /center/classes` - Create new class
- `GET /center/classes/:id` - Get class details
- `PATCH /center/classes/:id` - Update class
- `DELETE /center/classes/:id` - Delete class
- `POST /center/classes/:id/students` - Enroll student
- `DELETE /center/classes/:id/students/:studentId` - Unenroll student
- `GET /center/classes/:id/students` - List students in class

### Teacher Endpoints (Read-only)
- `GET /teacher/classes` - List assigned classes
- `GET /teacher/classes/:id/students` - List students in assigned class

## Access Control
- **AGENCY role**: Full access to all classes
- **CENTER role**: CRUD on classes in own center's branches
- **TEACHER role**: Read-only access to assigned classes

## Business Logic
- Validate max student capacity before enrollment
- Teacher must have 'teacher' role
- Class must belong to a valid branch
- Students can be enrolled in multiple classes

## Testing
- [ ] Unit tests for class service
- [ ] Test enrollment with capacity limits
- [ ] Test role-based access control
- [ ] Integration tests for CRUD operations
- [ ] E2E tests for class management
