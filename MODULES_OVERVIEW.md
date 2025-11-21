# Story Quest NestJS - Modules Overview

## 📋 All Modules Summary

This document provides a complete overview of all backend modules organized by implementation phase.

---

## ✅ PHASE 1: CORE FOUNDATION (COMPLETED)

### 1. Auth Module
**Path**: `src/modules/auth/`
**Status**: ✅ Implemented
**Purpose**: JWT authentication with role-based access control
- Login/register endpoints
- JWT token generation and validation
- Role-based guards (5 roles: AGENCY, CENTER, TEACHER, REVIEWER, STUDENT)

### 2. Users Module
**Path**: `src/modules/users/`
**Status**: ✅ Implemented
**Purpose**: User management for all roles
- User CRUD operations
- Password management
- Role assignment

### 3. Chapters Module
**Path**: `src/modules/chapters/`
**Status**: ✅ Implemented
**Purpose**: Top-level content organization
- Chapter CRUD operations
- Ordering and activation

### 4. Units Module
**Path**: `src/modules/units/`
**Status**: ✅ Implemented
**Purpose**: Content sections within chapters
- Unit CRUD operations
- Chapter association

### 5. Levels Module
**Path**: `src/modules/levels/`
**Status**: ✅ Implemented
**Purpose**: Individual learning levels within units
- Level CRUD operations
- Time limits and passing scores

### 6. Questions Module
**Path**: `src/modules/questions/`
**Status**: ✅ Implemented
**Purpose**: Questions and answer options for levels
- Question CRUD operations
- 4 question types support
- Answer options management

---

## ✅ PHASE 2: PROGRESS TRACKING (COMPLETED)

### 7. Progress Module
**Path**: `src/modules/progress/`
**Status**: ✅ Implemented
**Purpose**: Student learning progress tracking
**Entities**:
- `StudentLevelAttempt` - Level completion tracking
- `StudentQuestionAnswer` - Individual question answers
- `StudentUnitProgress` - Unit-level progress aggregation
- `StudentChapterProgress` - Chapter-level progress aggregation

---

## 🔲 PHASE 3: PRONUNCIATION (TODO)

> **⚠️ ARCHITECTURE UPDATE (2025-11-21):**
> - Speech/pronunciation handled **client-side** in mobile app. Backend provides reference text only.
> - **Vocabulary module REMOVED** - vocabulary managed within questions, not as separate module.

### 8. Pronunciation Module
**Path**: `src/modules/pronunciation/`
**Status**: 🔲 TODO
**Purpose**: Pronunciation practice tracking (client-side speech comparison)
**Entities**:
- `PronunciationAttempt` - Pronunciation practice records
**External Services**:
- None (client-side implementation)
**See**: [pronunciation/README.md](./src/modules/pronunciation/README.md)

---

## 🔲 PHASE 4: GAMIFICATION (TODO)

### 10. Gamification Module
**Path**: `src/modules/gamification/`
**Status**: 🔲 TODO
**Purpose**: Achievements, points, streaks, daily goals
**Entities**:
- `Achievement` - Achievement definitions
- `StudentAchievement` - Student achievement progress
- `StudentPoints` - Points and streaks tracking
- `DailyGoal` - Daily learning goals
**See**: [gamification/README.md](./src/modules/gamification/README.md)

---

## 🔲 PHASE 5: AI STORIES (TODO)

### 11. Stories Module
**Path**: `src/modules/stories/`
**Status**: 🔲 TODO
**Purpose**: AI-generated stories for reading comprehension
**Entities**:
- `Story` - AI-generated story metadata
- `StoryScene` - Story pages/scenes
- `StoryVocabulary` - Vocabulary used in stories
- `StoryComprehensionQuestion` - Reading comprehension tests
- `StudentStoryProgress` - Reading progress tracking
**External Services**:
- OpenAI/Gemini API for story generation
- Content moderation API
- Google Cloud TTS for narration
**See**: [stories/README.md](./src/modules/stories/README.md)

---

## 🔲 PHASE 7: WEB DASHBOARD (TODO)

### 12. Centers Module
**Path**: `src/modules/centers/`
**Status**: 🔲 TODO
**Purpose**: Organization/center management
**Entities**:
- `Center` - Center details and configuration
**Access**: AGENCY (full), CENTER (own data)
**See**: [centers/README.md](./src/modules/centers/README.md)

### 13. Branches Module
**Path**: `src/modules/branches/`
**Status**: 🔲 TODO
**Purpose**: Physical branch locations
**Entities**:
- `Branch` - Branch location details
**Access**: AGENCY (all), CENTER (own branches)
**See**: [branches/README.md](./src/modules/branches/README.md)

### 14. Grades Module
**Path**: `src/modules/grades/`
**Status**: 🔲 TODO
**Purpose**: Grade level definitions (3, 4, 5)
**Entities**:
- `Grade` - Grade level metadata
**See**: [grades/README.md](./src/modules/grades/README.md)

### 15. Classes Module
**Path**: `src/modules/classes/`
**Status**: 🔲 TODO
**Purpose**: Teaching classes and student enrollment
**Entities**:
- `Class` - Class details with teacher assignment
- `StudentClass` - Student enrollment tracking
**Access**: AGENCY (all), CENTER (own), TEACHER (assigned)
**See**: [classes/README.md](./src/modules/classes/README.md)

### 16. Teacher Notes Module
**Path**: `src/modules/teacher-notes/`
**Status**: 🔲 TODO
**Purpose**: Teacher observations about students
**Entities**:
- `TeacherNote` - Notes with tags and privacy
**Access**: TEACHER (own notes), CENTER/AGENCY (read-only)
**See**: [teacher-notes/README.md](./src/modules/teacher-notes/README.md)

### 17. Giftcodes Module
**Path**: `src/modules/giftcodes/`
**Status**: 🔲 TODO
**Purpose**: Trial codes and access management
**Entities**:
- `Giftcode` - Code details and validity
- `GiftcodeUsage` - Redemption tracking
**Access**: AGENCY (all), CENTER (own codes)
**See**: [giftcodes/README.md](./src/modules/giftcodes/README.md)

### 18. Curriculum Module
**Path**: `src/modules/curriculum/`
**Status**: 🔲 TODO
**Purpose**: Teacher-created content with review workflow
**Entities**:
- `CurriculumContent` - Lesson content with approval status
**Access**: TEACHER (create), REVIEWER (approve/reject), CENTER/AGENCY (browse)
**See**: [curriculum/README.md](./src/modules/curriculum/README.md)

### 19. Homework Module
**Path**: `src/modules/homework/`
**Status**: 🔲 TODO
**Purpose**: Homework assignments and submissions
**Entities**:
- `HomeworkAssignment` - Teacher-created homework
- `HomeworkSubmission` - Student submissions with grades
**Access**: TEACHER (create/grade), STUDENT (submit), CENTER (analytics)
**See**: [homework/README.md](./src/modules/homework/README.md)

---

## 📊 Module Statistics

| Phase | Status | Module Count | Entities Count |
|-------|--------|--------------|----------------|
| Phase 1 | ✅ Complete | 6 | 8 |
| Phase 2 | ✅ Complete | 1 | 4 |
| Phase 3 | 🔲 TODO | 2 | 2 |
| Phase 4 | 🔲 TODO | 1 | 4 |
| Phase 5 | 🔲 TODO | 1 | 5 |
| Phase 7 | 🔲 TODO | 8 | 10 |
| **Total** | - | **19** | **33** |

---

## 🗄️ Database Tables Summary

### Completed Tables (Phase 1-2)
1. `users` - All user roles
2. `chapters` - Top-level content
3. `units` - Chapter sections
4. `levels` - Learning levels
5. `questions` - Level questions
6. `answer_options` - Question answers
7. `student_level_attempts` - Level completion
8. `student_question_answers` - Question responses
9. `student_unit_progress` - Unit progress
10. `student_chapter_progress` - Chapter progress

### TODO Tables (Phase 3-7)
11. `pronunciation_attempts` - Phase 3
12. `vocabulary_words` - Phase 3
13. `achievements` - Phase 4
14. `student_achievements` - Phase 4
15. `student_points` - Phase 4
16. `daily_goals` - Phase 4
17. `stories` - Phase 5
18. `story_scenes` - Phase 5
19. `story_vocabulary` - Phase 5
20. `story_comprehension_questions` - Phase 5
21. `student_story_progress` - Phase 5
22. `centers` - Phase 7
23. `branches` - Phase 7
24. `grades` - Phase 7
25. `classes` - Phase 7
26. `student_classes` - Phase 7
27. `teacher_notes` - Phase 7
28. `giftcodes` - Phase 7
29. `giftcode_usage` - Phase 7
30. `curriculum_content` - Phase 7
31. `homework_assignments` - Phase 7
32. `homework_submissions` - Phase 7

**Total Database Tables**: 32

---

## 🚀 Next Steps

### Immediate Priority (Phase 3)
1. Implement Pronunciation module (client-side speech comparison tracking)
2. ~~Implement Vocabulary module~~ ❌ **REMOVED** (vocabulary managed in questions)
3. ~~Integrate Google Cloud Speech & TTS APIs~~ ❌ **REMOVED** (client-side)
4. ~~Set up AWS S3 for audio storage~~ ❌ **REMOVED** (client-side)

### Medium Priority (Phase 4-5)
1. Implement Gamification module
2. Implement Stories module with AI integration
3. Set up OpenAI/Gemini API
4. Implement content moderation

### Low Priority (Phase 7)
1. Implement all Web Dashboard modules (8 modules)
2. Set up role-based access control for web roles
3. Build admin analytics and reporting

---

## 📚 Documentation

Each module has a detailed README file with:
- Purpose and features
- Entity definitions
- API endpoints
- Access control rules
- Implementation order
- Testing checklist

See individual README files in each module directory for details.

---

**Last Updated**: 2025-11-19
**Total Modules**: 19
**Total Entities**: 33
**Status**: Week 1 Preparation Complete ✅
