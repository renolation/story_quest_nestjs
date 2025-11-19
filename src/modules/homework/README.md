# Homework Module

**Phase**: 7
**Status**: 🔲 TODO
**Priority**: LOW (After Flutter MVP)

## Purpose
Manage homework assignments and student submissions with grading.

## Features
- [ ] Create homework assignments (teachers)
- [ ] Assign to specific classes
- [ ] Student submission tracking
- [ ] Grading and feedback
- [ ] Due date management
- [ ] Late submission handling
- [ ] Submission statistics
- [ ] File upload support

## Entities
- **HomeworkAssignment**: Homework created by teachers
- **HomeworkSubmission**: Student submissions with grades

## Dependencies
- Users module (teachers and students)
- Classes module
- External: AWS S3 for file uploads (optional)

## Implementation Order
1. Create entities and DTOs
2. Implement homework service with CRUD
3. Add submission service
4. Implement grading logic
5. Add file upload integration (S3)
6. Create statistics queries
7. Add REST endpoints with role guards

## API Endpoints

### Teacher Endpoints
- `GET /teacher/homework` - List own homework assignments
- `POST /teacher/homework` - Create homework assignment
- `GET /teacher/homework/:id` - Get homework details
- `PATCH /teacher/homework/:id` - Update homework
- `DELETE /teacher/homework/:id` - Delete homework
- `GET /teacher/homework/:id/submissions` - List submissions
- `POST /teacher/homework/submissions/:id/grade` - Grade submission

### Student Endpoints
- `GET /students/homework` - List assigned homework
- `GET /students/homework/:id` - View homework details
- `POST /students/homework/:id/submit` - Submit homework
- `GET /students/homework/submissions` - View own submissions
- `GET /students/homework/submissions/:id` - View submission details

### Center Endpoints (Analytics)
- `GET /center/homework/statistics` - Homework completion statistics

## Submission Types
- Text submission (`submissionText`)
- File upload (`fileUrl` - PDF, images, documents)
- Both text and file

## Grading
- Grade: 0-100
- Feedback: Text comments from teacher
- Graded timestamp: Auto-set when teacher grades

## Late Submission Handling
- Track if submission is after due date
- Display late indicator
- Optional: Penalty calculation (configurable)

## Workflow
```
1. Teacher creates homework for class
2. Students view assigned homework
3. Students submit before due date
4. Teacher reviews and grades submissions
5. Students view grades and feedback
```

## Access Control
- **TEACHER role**: CRUD on assignments for own classes, grade submissions
- **STUDENT role**: View assigned homework, submit, view own grades
- **CENTER role**: View statistics for center

## Validation Rules
- Teacher can only create homework for assigned classes
- Students can only submit once per homework (unique constraint)
- File size limits (10MB max)
- Supported file types: PDF, images, Word documents

## Testing
- [ ] Unit tests for homework service
- [ ] Test submission validation
- [ ] Test grading logic
- [ ] Test late submission detection
- [ ] Test file upload integration
- [ ] E2E tests for complete homework lifecycle
