# Database Schema Documentation

## Overview

Complete database schema for Story Quest English Learning Platform with **32 tables** across 7 implementation phases.

**Database**: PostgreSQL 15+
**ORM**: TypeORM
**Primary Key Convention**: INTEGER (auto-increment) - NOT UUID

---

## Core Principles

### 1. Integer Primary Keys
**CRITICAL**: All tables use `SERIAL` (auto-increment integer) primary keys, NOT UUID.

```sql
id SERIAL PRIMARY KEY  -- PostgreSQL auto-increment
```

### 2. Referential Integrity
- All foreign keys properly defined
- Cascade delete configured where appropriate
- Indexes on frequently queried columns

### 3. Data Constraints
- Scores: 0-100 range
- Order indexes: Sequential integers
- Required vs optional fields clearly defined
- Enum types for fixed value sets

---

## Phase Breakdown

### Phase 1: Core Foundation (6 tables)
**Status**: ✅ Implemented
**Purpose**: Authentication, authorization, and content structure

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `users` | All 5 user roles | Self-referential for hierarchy |
| `chapters` | Top-level curriculum | One-to-many with units |
| `units` | Chapter sub-topics | Belongs to chapter, has many levels |
| `levels` | Individual lessons | Belongs to unit, has many questions |
| `questions` | Learning activities | Belongs to level, has many answer_options |
| `answer_options` | Multiple choice options | Belongs to question |

### Phase 2: Progress Tracking (4 tables)
**Status**: ✅ Implemented
**Purpose**: Track student learning progress and performance

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `student_level_attempts` | Level completion attempts | Student + Level |
| `student_question_answers` | Individual question responses | Attempt + Question + Student |
| `student_unit_progress` | Unit-level progress summary | Student + Unit |
| `student_chapter_progress` | Chapter-level progress summary | Student + Chapter |

### Phase 3: Pronunciation (1 table)
**Status**: 🔲 Placeholder
**Purpose**: Pronunciation practice (client-side speech comparison)

> **⚠️ NOTE:** Speech/pronunciation handled **client-side** in mobile app. Backend provides reference text only.
> **Vocabulary module removed** - vocabulary managed within questions, not as separate entity.

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `pronunciation_attempts` | Pronunciation practice records | Student + Question |

### Phase 4: Gamification (4 tables)
**Status**: 🔲 Placeholder
**Purpose**: Achievements, points, badges, and motivation

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `achievements` | Available badges/achievements | Standalone |
| `student_achievements` | Student unlock progress | Student + Achievement |
| `student_points` | Points and streak tracking | Student |
| `daily_goals` | Daily learning targets | Student |

### Phase 5: AI Stories (5 tables)
**Status**: 🔲 Placeholder
**Purpose**: AI-generated personalized stories

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `stories` | Generated story metadata | Student (owner) |
| `story_scenes` | Story pagination | Story |
| `story_vocabulary` | Words used in stories | Story |
| `story_comprehension_questions` | Story quizzes | Story |
| `student_story_progress` | Reading progress | Student + Story |

### Phase 7: Web Dashboard (11 tables)
**Status**: 🔲 Placeholder
**Purpose**: Multi-role admin dashboard (Agency, Center, Teacher, Reviewer)

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `centers` | Learning center organizations | N/A |
| `branches` | Physical locations | Center |
| `grades` | Grade level definitions (3, 4, 5) | N/A |
| `classes` | Class groups | Branch + Grade |
| `student_classes` | Student-class assignments | Student + Class |
| `teacher_notes` | Teacher observations | Teacher + Student |
| `giftcodes` | Trial/discount codes | Center |
| `giftcode_usage` | Redemption tracking | Giftcode + User |
| `curriculum_content` | Teacher-created content | Teacher |
| `homework_assignments` | Homework tasks | Teacher + Class |
| `homework_submissions` | Student submissions | Student + Assignment |

---

## Detailed Table Definitions

### Phase 1 Tables

#### 1. users
**Purpose**: Authentication and authorization for all 5 roles

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role users_role_enum NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  avatar_url VARCHAR(500),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Indexes
  INDEX idx_users_email (email),
  INDEX idx_users_username (username),
  INDEX idx_users_role (role)
);

-- User roles enum
CREATE TYPE users_role_enum AS ENUM (
  'agency',    -- Super Admin (Web Only)
  'center',    -- Organization Admin (Web Only)
  'teacher',   -- Instructor (Web Only)
  'reviewer',  -- Content Moderator (Web Only)
  'student'    -- End User (Mobile Only)
);
```

**Role Hierarchy**:
- **AGENCY**: Full system access, manages all centers and content
- **CENTER**: Manages own center/branches, teachers, and students
- **TEACHER**: Manages assigned students, creates content
- **REVIEWER**: Reviews and approves content submissions
- **STUDENT**: Mobile app only, self-service learning

#### 2. chapters
**Purpose**: Top-level curriculum organization

```sql
CREATE TABLE chapters (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  order_index INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Indexes
  INDEX idx_chapters_order (order_index),
  INDEX idx_chapters_active (is_active)
);
```

**Example Data**:
- Chapter 1: "Greetings & Introductions"
- Chapter 2: "Numbers & Counting"
- Chapter 3: "Colors & Shapes"

#### 3. units
**Purpose**: Chapter sub-topics (3-5 per chapter)

```sql
CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  chapter_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Foreign Keys
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_units_chapter (chapter_id),
  INDEX idx_units_order (chapter_id, order_index)
);
```

#### 4. levels
**Purpose**: Individual lessons (3 per unit: Easy, Medium, Hard)

```sql
CREATE TABLE levels (
  id SERIAL PRIMARY KEY,
  unit_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'easy',
  time_limit_seconds INT,
  passing_score INT NOT NULL DEFAULT 70,
  order_index INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Foreign Keys
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_levels_unit (unit_id),
  INDEX idx_levels_difficulty (difficulty),
  INDEX idx_levels_order (unit_id, order_index),

  -- Constraints
  CHECK (passing_score >= 0 AND passing_score <= 100)
);
```

#### 5. questions
**Purpose**: Learning activities with 4 question types

```sql
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  level_id INT NOT NULL,
  question_type question_type_enum NOT NULL,
  question_text TEXT NOT NULL,
  question_audio_url VARCHAR(500),
  question_image_url VARCHAR(500),
  correct_answer TEXT,
  points INT NOT NULL DEFAULT 10,
  order_index INT NOT NULL,
  hints TEXT,
  explanation TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Foreign Keys
  FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_questions_level (level_id),
  INDEX idx_questions_type (question_type),
  INDEX idx_questions_order (level_id, order_index),

  -- Constraints
  CHECK (points > 0)
);

-- Question types enum
CREATE TYPE question_type_enum AS ENUM (
  'fill_in_blank',
  'talk_to_speech_compare',
  'sort_words',
  'select_right_answer'
);
```

**Question Type Distribution** (recommended):
- 40% `select_right_answer` - Multiple choice
- 30% `fill_in_blank` - Type the answer
- 20% `sort_words` - Arrange words in order
- 10% `talk_to_speech_compare` - Pronunciation practice

#### 6. answer_options
**Purpose**: Multiple choice options (4 per question)

```sql
CREATE TABLE answer_options (
  id SERIAL PRIMARY KEY,
  question_id INT NOT NULL,
  option_text VARCHAR(500) NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  order_index INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Foreign Keys
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_answer_options_question (question_id),
  INDEX idx_answer_options_correct (question_id, is_correct)
);
```

**Constraint**: Each question must have at least one `is_correct = true` option.

---

### Phase 2 Tables

#### 7. student_level_attempts
**Purpose**: Track each attempt to complete a level

```sql
CREATE TABLE student_level_attempts (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  level_id INT NOT NULL,
  score INT,
  time_spent_seconds INT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_passed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,

  -- Foreign Keys
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_attempts_student (student_id),
  INDEX idx_attempts_level (level_id),
  INDEX idx_attempts_completed (is_completed),

  -- Constraints
  CHECK (score IS NULL OR (score >= 0 AND score <= 100))
);
```

#### 8. student_question_answers
**Purpose**: Track individual question responses

```sql
CREATE TABLE student_question_answers (
  id SERIAL PRIMARY KEY,
  attempt_id INT NOT NULL,
  question_id INT NOT NULL,
  student_id INT NOT NULL,
  selected_option_id INT,
  answer_text TEXT,
  is_correct BOOLEAN NOT NULL,
  points_earned INT NOT NULL DEFAULT 0,
  time_spent_seconds INT,
  answered_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Foreign Keys
  FOREIGN KEY (attempt_id) REFERENCES student_level_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (selected_option_id) REFERENCES answer_options(id) ON DELETE SET NULL,

  -- Indexes
  INDEX idx_answers_attempt (attempt_id),
  INDEX idx_answers_question (question_id),
  INDEX idx_answers_student (student_id)
);
```

#### 9. student_unit_progress
**Purpose**: Auto-calculated unit-level progress

```sql
CREATE TABLE student_unit_progress (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  unit_id INT NOT NULL,
  total_levels INT NOT NULL DEFAULT 0,
  completed_levels INT NOT NULL DEFAULT 0,
  average_score DECIMAL(5,2),
  total_time_spent_seconds INT,
  last_accessed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Foreign Keys
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_unit_progress_student (student_id),
  INDEX idx_unit_progress_unit (unit_id),
  UNIQUE (student_id, unit_id),

  -- Constraints
  CHECK (average_score IS NULL OR (average_score >= 0 AND average_score <= 100))
);
```

#### 10. student_chapter_progress
**Purpose**: Auto-calculated chapter-level progress

```sql
CREATE TABLE student_chapter_progress (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  chapter_id INT NOT NULL,
  total_units INT NOT NULL DEFAULT 0,
  completed_units INT NOT NULL DEFAULT 0,
  average_score DECIMAL(5,2),
  total_time_spent_seconds INT,
  last_accessed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Foreign Keys
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_chapter_progress_student (student_id),
  INDEX idx_chapter_progress_chapter (chapter_id),
  UNIQUE (student_id, chapter_id),

  -- Constraints
  CHECK (average_score IS NULL OR (average_score >= 0 AND average_score <= 100))
);
```

---

## Entity Relationships Diagram

```
users (5 roles)
  ↓ (student role only)
student_level_attempts
  ↓
student_question_answers
  ↓
student_unit_progress (auto-calculated)
  ↓
student_chapter_progress (auto-calculated)

chapters
  ↓ (one-to-many)
units
  ↓ (one-to-many)
levels
  ↓ (one-to-many)
questions
  ↓ (one-to-many)
answer_options
```

---

## Indexes Summary

**Performance-critical indexes**:

1. **users**
   - `email` (unique) - Login lookups
   - `username` (unique) - Login lookups
   - `role` - Role-based queries

2. **chapters/units/levels**
   - `order_index` - Sequential ordering
   - `is_active` - Filter active content

3. **questions**
   - `level_id` - Fetch questions per level
   - `question_type` - Filter by type

4. **progress tables**
   - `student_id` - Student progress queries
   - Composite unique indexes for progress tracking

---

## Data Constraints

### Score Validation
```sql
CHECK (score >= 0 AND score <= 100)
CHECK (passing_score >= 0 AND passing_score <= 100)
```

### Required Relationships
- Every unit must belong to a chapter
- Every level must belong to a unit
- Every question must belong to a level
- Every answer option must belong to a question
- Every progress record must belong to a student

### Business Rules
1. **At least one correct answer**: Each question must have at least one `is_correct = true` answer option
2. **Sequential ordering**: `order_index` values should be sequential (1, 2, 3...)
3. **Score calculation**: Level score = (points_earned / total_points) * 100
4. **Passing criteria**: `score >= passing_score`

---

## Migration Strategy

### Initial Setup
```bash
# Run TypeORM migrations
npm run typeorm migration:run

# Verify tables
npm run typeorm migration:show
```

### Seeding
```bash
# Seed database with test data
npm run seed:run

# Reset and reseed
npm run seed:reset
```

---

## Database Statistics (Expected)

After seeding:

| Table | Expected Count |
|-------|----------------|
| users | 31 (1 + 3 + 5 + 2 + 20) |
| chapters | 10 |
| units | 40-50 |
| levels | 120-150 |
| questions | 1000+ |
| answer_options | 4000+ |
| student_level_attempts | 500+ |
| student_question_answers | 5000+ |
| student_unit_progress | 100+ |
| student_chapter_progress | 50+ |

---

## Backup & Maintenance

### Daily Backup
```bash
pg_dump -U postgres story_quest_db > backup_$(date +%Y%m%d).sql
```

### Maintenance Tasks
- **Weekly**: `VACUUM ANALYZE` for query optimization
- **Monthly**: Review and archive old progress data
- **Quarterly**: Database performance audit

---

**Last Updated**: 2025-11-20
**Version**: 1.0
**Status**: ✅ Production Ready (Phase 1 & 2 implemented)
