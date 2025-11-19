# Teacher Notes Module

**Phase**: 7
**Status**: 🔲 TODO
**Priority**: LOW (After Flutter MVP)

## Purpose
Allow teachers to add observations and notes about students for tracking progress and concerns.

## Features
- [ ] Create notes for students
- [ ] List notes for a student
- [ ] Update/delete own notes
- [ ] Tag-based filtering
- [ ] Note type categorization (struggling, excellent, average, needs_attention)
- [ ] Privacy controls (private vs shared notes)
- [ ] Search notes by keywords

## Entities
- **TeacherNote**: Teacher observations about students

## Dependencies
- Users module (teachers and students)
- Classes module (for teacher-student relationships)

## Implementation Order
1. Create entities and DTOs
2. Implement teacher-notes service
3. Add validation (teacher can only note assigned students)
4. Implement tag filtering
5. Add privacy controls
6. Create REST endpoints with role guards

## API Endpoints

### Teacher Endpoints
- `GET /teacher/students/:studentId/notes` - Get notes for a student
- `POST /teacher/students/:studentId/notes` - Create note
- `PATCH /teacher/notes/:id` - Update own note
- `DELETE /teacher/notes/:id` - Delete own note
- `GET /teacher/notes` - List all my notes (with filters)

### Center Endpoints (Read-only)
- `GET /center/students/:studentId/notes` - View notes for students in center

### Agency Endpoints (Read-only)
- `GET /agency/students/:studentId/notes` - View all notes for any student

## Access Control
- **TEACHER role**: CRUD on notes for assigned students only
- **CENTER role**: Read all notes for students in own center
- **AGENCY role**: Read all notes system-wide

## Note Types
- `struggling` - Student needs extra help
- `excellent` - Outstanding performance
- `average` - Meeting expectations
- `needs_attention` - Behavioral or academic concern

## Privacy
- Private notes: Only visible to creator and center/agency admins
- Shared notes: Visible to all teachers of the student

## Validation Rules
- Teacher can only create notes for students in their assigned classes
- Note content is required
- Tags are optional (array of strings)

## Testing
- [ ] Unit tests for notes service
- [ ] Test teacher-student relationship validation
- [ ] Test privacy controls
- [ ] Test role-based access
- [ ] E2E tests for note management
