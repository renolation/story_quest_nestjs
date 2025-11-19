# Curriculum Module

**Phase**: 7
**Status**: 🔲 TODO
**Priority**: LOW (After Flutter MVP)

## Purpose
Teacher-created curriculum content with review workflow and marketplace.

## Features
- [ ] Create/edit curriculum content (teachers)
- [ ] Submit content for review
- [ ] Review workflow (approve/reject by reviewers)
- [ ] Curriculum marketplace/library
- [ ] Content search and filtering
- [ ] Content versioning
- [ ] Content ratings and feedback

## Entities
- **CurriculumContent**: Teacher-created lesson content

## Dependencies
- Users module (teachers, reviewers)

## Implementation Order
1. Create entities and DTOs
2. Implement curriculum service with CRUD
3. Add status transition logic (draft -> pending -> approved/rejected)
4. Create review workflow service
5. Implement marketplace listing with filters
6. Add REST endpoints with role guards

## API Endpoints

### Teacher Endpoints
- `GET /teacher/curriculum` - List own curriculum content
- `POST /teacher/curriculum` - Create new content
- `GET /teacher/curriculum/:id` - Get content details
- `PATCH /teacher/curriculum/:id` - Update content (only if draft/rejected)
- `DELETE /teacher/curriculum/:id` - Delete content
- `POST /teacher/curriculum/:id/submit` - Submit for review

### Reviewer Endpoints
- `GET /reviewer/queue` - List pending content for review
- `GET /reviewer/queue/:id` - View content details
- `POST /reviewer/queue/:id/approve` - Approve content
- `POST /reviewer/queue/:id/reject` - Reject with feedback
- `GET /reviewer/history` - View review history

### Center/Agency Endpoints (Marketplace)
- `GET /marketplace/curriculum` - Browse approved content
- `GET /marketplace/curriculum/:id` - View content details

## Content Status Workflow
```
draft (teacher creates)
  ↓ (teacher submits)
pending_review (reviewer reviews)
  ↓ (reviewer approves)     ↓ (reviewer rejects)
approved                    rejected
  ↓                            ↓
(available in marketplace)  (back to teacher for revision)
```

## Content Types
- `lesson` - Teaching material
- `homework` - Homework assignment template
- `quiz` - Assessment/quiz

## Access Control
- **TEACHER role**: CRUD on own content
- **REVIEWER role**: Review pending content, approve/reject
- **CENTER role**: Browse and view approved content
- **AGENCY role**: Full access + analytics

## Validation Rules
- Title is required
- Content type must be valid enum value
- Only draft/rejected content can be edited
- Only pending content can be reviewed

## Testing
- [ ] Unit tests for curriculum service
- [ ] Test status transition workflow
- [ ] Test role-based access control
- [ ] Integration tests for review workflow
- [ ] E2E tests for complete content lifecycle
