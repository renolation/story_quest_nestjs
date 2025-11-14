# Week 1: Complete Project Preparation & Scaffolding

## 🎯 Goal
Set up the entire project structure with placeholder modules, folders, and TODO markers for all features. By the end of Week 1, the project will have:
- ✅ Complete folder structure for NestJS, Flutter, and React
- ✅ All module placeholders with TODO comments
- ✅ Database schema for all phases (migrations ready)
- ✅ Basic configuration files
- ✅ Development environment setup

**Strategy**: Create everything as placeholders first, implement later phase by phase.

---

## 📅 Day-by-Day Plan

### **DAY 1: NestJS Backend Structure**
**Duration**: 8 hours

#### Morning (4 hours): Database Schema - ALL PHASES

Create complete database schema with ALL tables for all phases, even if not used immediately.

**File**: `migrations/001-complete-schema.sql`

```sql
-- =============================================================================
-- PHASE 1: CORE FOUNDATION
-- =============================================================================

-- Users table (all 5 roles)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'student',
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  date_of_birth DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_role CHECK (role IN ('agency', 'center', 'teacher', 'reviewer', 'student'))
);

-- Chapters table
CREATE TABLE chapters (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  thumbnail_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Units table
CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  thumbnail_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Levels table
CREATE TABLE levels (
  id SERIAL PRIMARY KEY,
  unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  time_limit INTEGER, -- seconds
  passing_score INTEGER DEFAULT 70,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
  question_type VARCHAR(50) NOT NULL,
  question_text TEXT NOT NULL,
  audio_url VARCHAR(500),
  image_url VARCHAR(500),
  points INTEGER DEFAULT 10,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_question_type CHECK (
    question_type IN ('fill_in_blank', 'talk_to_speech_compare', 'sort_words', 'select_right_answer')
  )
);

-- Answer Options table
CREATE TABLE answer_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- PHASE 2: PROGRESS TRACKING
-- =============================================================================

-- Student Level Attempts
CREATE TABLE student_level_attempts (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  max_score INTEGER NOT NULL,
  time_spent INTEGER, -- seconds
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_score CHECK (score >= 0 AND score <= max_score)
);

-- Student Question Answers
CREATE TABLE student_question_answers (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER REFERENCES student_level_attempts(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  student_answer TEXT,
  is_correct BOOLEAN DEFAULT false,
  points_earned INTEGER DEFAULT 0,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Unit Progress
CREATE TABLE student_unit_progress (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
  completed_levels INTEGER DEFAULT 0,
  total_levels INTEGER NOT NULL,
  average_score DECIMAL(5,2) DEFAULT 0,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, unit_id)
);

-- Student Chapter Progress
CREATE TABLE student_chapter_progress (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  completed_units INTEGER DEFAULT 0,
  total_units INTEGER NOT NULL,
  average_score DECIMAL(5,2) DEFAULT 0,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, chapter_id)
);

-- =============================================================================
-- PHASE 3: AUDIO & PRONUNCIATION
-- =============================================================================

-- Pronunciation Attempts
CREATE TABLE pronunciation_attempts (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  word VARCHAR(255) NOT NULL,
  audio_url VARCHAR(500), -- recorded audio
  transcription TEXT, -- what they said
  accuracy_score DECIMAL(5,2), -- 0-100
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vocabulary Words (for TTS)
CREATE TABLE vocabulary_words (
  id SERIAL PRIMARY KEY,
  word VARCHAR(255) UNIQUE NOT NULL,
  definition TEXT,
  example_sentence TEXT,
  audio_url VARCHAR(500), -- TTS generated
  phonetic VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- PHASE 4: GAMIFICATION
-- =============================================================================

-- Achievements
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  achievement_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  required_progress INTEGER,
  reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Achievements
CREATE TABLE student_achievements (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, achievement_id)
);

-- Student Points
CREATE TABLE student_points (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0, -- consecutive days
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id)
);

-- Daily Goals
CREATE TABLE daily_goals (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  goal_date DATE NOT NULL,
  target_words INTEGER DEFAULT 5,
  completed_words INTEGER DEFAULT 0,
  target_minutes INTEGER DEFAULT 15,
  completed_minutes INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, goal_date)
);

-- =============================================================================
-- PHASE 5: AI STORIES
-- =============================================================================

-- Stories
CREATE TABLE stories (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  genre VARCHAR(50), -- mystery, fairy_tale, mythology, daily_life
  difficulty VARCHAR(20), -- easy, medium, hard
  grade_level INTEGER,
  total_word_count INTEGER,
  thumbnail_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story Scenes
CREATE TABLE story_scenes (
  id SERIAL PRIMARY KEY,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  scene_text TEXT NOT NULL,
  image_url VARCHAR(500),
  audio_url VARCHAR(500), -- narration
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story Vocabulary (words used in story)
CREATE TABLE story_vocabulary (
  id SERIAL PRIMARY KEY,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  scene_id INTEGER REFERENCES story_scenes(id) ON DELETE CASCADE,
  word VARCHAR(255) NOT NULL,
  definition TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story Comprehension Questions
CREATE TABLE story_comprehension_questions (
  id SERIAL PRIMARY KEY,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  options TEXT[], -- array of options
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Story Progress
CREATE TABLE student_story_progress (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  current_scene INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, story_id)
);

-- =============================================================================
-- PHASE 7: WEB DASHBOARD (ADMIN/TEACHER)
-- =============================================================================

-- Centers (Organizations)
CREATE TABLE centers (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  logo_url VARCHAR(500),
  business_license VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_center_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Branches
CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  center_id INTEGER REFERENCES centers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grades
CREATE TABLE grades (
  id SERIAL PRIMARY KEY,
  grade_level INTEGER NOT NULL, -- 3, 4, 5
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(grade_level)
);

-- Classes
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
  grade_id INTEGER REFERENCES grades(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  max_students INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Class Assignments
CREATE TABLE student_classes (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, class_id)
);

-- Teacher Notes (Teachers can add notes about students)
CREATE TABLE teacher_notes (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  note_type VARCHAR(50), -- struggling, excellent, average, needs_attention
  content TEXT NOT NULL,
  tags TEXT[], -- array of tags
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Giftcodes (Trial codes for students)
CREATE TABLE giftcodes (
  id SERIAL PRIMARY KEY,
  center_id INTEGER REFERENCES centers(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  code_type VARCHAR(20) NOT NULL, -- trial, discount, full_access
  duration_days INTEGER NOT NULL,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP NOT NULL,
  valid_to TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_code_type CHECK (code_type IN ('trial', 'discount', 'full_access'))
);

-- Giftcode Usage
CREATE TABLE giftcode_usage (
  id SERIAL PRIMARY KEY,
  giftcode_id INTEGER REFERENCES giftcodes(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(giftcode_id, student_id)
);

-- Curriculum Content (Teacher-created content)
CREATE TABLE curriculum_content (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50), -- lesson, homework, quiz
  status VARCHAR(20) DEFAULT 'draft', -- draft, pending_review, approved, rejected
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_content_status CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected'))
);

-- Homework Assignments
CREATE TABLE homework_assignments (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Homework Submissions
CREATE TABLE homework_submissions (
  id SERIAL PRIMARY KEY,
  homework_id INTEGER REFERENCES homework_assignments(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_url VARCHAR(500),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP,
  grade INTEGER,
  feedback TEXT,
  UNIQUE(homework_id, student_id)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Content
CREATE INDEX idx_chapters_order ON chapters(order_index);
CREATE INDEX idx_units_chapter ON units(chapter_id);
CREATE INDEX idx_units_order ON units(order_index);
CREATE INDEX idx_levels_unit ON levels(unit_id);
CREATE INDEX idx_levels_order ON levels(order_index);
CREATE INDEX idx_questions_level ON questions(level_id);
CREATE INDEX idx_questions_order ON questions(order_index);
CREATE INDEX idx_answer_options_question ON answer_options(question_id);

-- Progress
CREATE INDEX idx_attempts_student ON student_level_attempts(student_id);
CREATE INDEX idx_attempts_level ON student_level_attempts(level_id);
CREATE INDEX idx_answers_attempt ON student_question_answers(attempt_id);
CREATE INDEX idx_unit_progress_student ON student_unit_progress(student_id);
CREATE INDEX idx_chapter_progress_student ON student_chapter_progress(student_id);

-- Pronunciation
CREATE INDEX idx_pronunciation_student ON pronunciation_attempts(student_id);

-- Gamification
CREATE INDEX idx_student_achievements_student ON student_achievements(student_id);
CREATE INDEX idx_student_points_student ON student_points(student_id);
CREATE INDEX idx_daily_goals_student ON daily_goals(student_id);
CREATE INDEX idx_daily_goals_date ON daily_goals(goal_date);

-- Stories
CREATE INDEX idx_stories_student ON stories(student_id);
CREATE INDEX idx_story_scenes_story ON story_scenes(story_id);
CREATE INDEX idx_story_vocabulary_story ON story_vocabulary(story_id);
CREATE INDEX idx_story_progress_student ON student_story_progress(student_id);

-- Admin/Teacher
CREATE INDEX idx_branches_center ON branches(center_id);
CREATE INDEX idx_classes_branch ON classes(branch_id);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_student_classes_student ON student_classes(student_id);
CREATE INDEX idx_student_classes_class ON student_classes(class_id);
CREATE INDEX idx_teacher_notes_teacher ON teacher_notes(teacher_id);
CREATE INDEX idx_teacher_notes_student ON teacher_notes(student_id);
CREATE INDEX idx_giftcodes_center ON giftcodes(center_id);
CREATE INDEX idx_giftcode_usage_student ON giftcode_usage(student_id);
CREATE INDEX idx_curriculum_teacher ON curriculum_content(teacher_id);
CREATE INDEX idx_homework_class ON homework_assignments(class_id);
CREATE INDEX idx_submissions_homework ON homework_submissions(homework_id);
CREATE INDEX idx_submissions_student ON homework_submissions(student_id);
```

**Task**: Run migration
```bash
npm run migration:create -- -n CompleteSchema
# Copy SQL above into migration file
npm run migration:run
```

---

#### Afternoon (4 hours): NestJS Module Structure - ALL PLACEHOLDERS

Create complete module structure with TODO placeholders.

**File Structure**:
```
src/
├── modules/
│   ├── auth/                    # PHASE 1 - IMPLEMENT FIRST
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── users/                   # PHASE 1
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   │
│   ├── chapters/                # PHASE 1
│   │   ├── entities/
│   │   │   └── chapter.entity.ts
│   │   ├── dto/
│   │   │   ├── create-chapter.dto.ts
│   │   │   └── update-chapter.dto.ts
│   │   ├── chapters.controller.ts
│   │   ├── chapters.service.ts
│   │   └── chapters.module.ts
│   │
│   ├── units/                   # PHASE 1
│   │   └── [similar structure]
│   │
│   ├── levels/                  # PHASE 1
│   │   └── [similar structure]
│   │
│   ├── questions/               # PHASE 1
│   │   └── [similar structure]
│   │
│   ├── progress/                # PHASE 2 - TODO
│   │   ├── entities/
│   │   │   ├── student-level-attempt.entity.ts
│   │   │   ├── student-question-answer.entity.ts
│   │   │   ├── student-unit-progress.entity.ts
│   │   │   └── student-chapter-progress.entity.ts
│   │   ├── dto/
│   │   │   ├── start-level.dto.ts
│   │   │   ├── submit-answer.dto.ts
│   │   │   └── complete-level.dto.ts
│   │   ├── progress.controller.ts
│   │   ├── progress.service.ts
│   │   └── progress.module.ts
│   │
│   ├── pronunciation/           # PHASE 3 - TODO
│   │   ├── entities/
│   │   │   └── pronunciation-attempt.entity.ts
│   │   ├── dto/
│   │   │   └── validate-pronunciation.dto.ts
│   │   ├── services/
│   │   │   ├── tts.service.ts
│   │   │   └── speech-recognition.service.ts
│   │   ├── pronunciation.controller.ts
│   │   ├── pronunciation.service.ts
│   │   └── pronunciation.module.ts
│   │
│   ├── vocabulary/              # PHASE 3 - TODO
│   │   ├── entities/
│   │   │   └── vocabulary-word.entity.ts
│   │   ├── dto/
│   │   │   ├── create-word.dto.ts
│   │   │   └── update-word.dto.ts
│   │   ├── vocabulary.controller.ts
│   │   ├── vocabulary.service.ts
│   │   └── vocabulary.module.ts
│   │
│   ├── gamification/            # PHASE 4 - TODO
│   │   ├── entities/
│   │   │   ├── achievement.entity.ts
│   │   │   ├── student-achievement.entity.ts
│   │   │   ├── student-points.entity.ts
│   │   │   └── daily-goal.entity.ts
│   │   ├── dto/
│   │   │   ├── create-achievement.dto.ts
│   │   │   └── update-daily-goal.dto.ts
│   │   ├── gamification.controller.ts
│   │   ├── gamification.service.ts
│   │   └── gamification.module.ts
│   │
│   ├── stories/                 # PHASE 5 - TODO
│   │   ├── entities/
│   │   │   ├── story.entity.ts
│   │   │   ├── story-scene.entity.ts
│   │   │   ├── story-vocabulary.entity.ts
│   │   │   ├── story-comprehension-question.entity.ts
│   │   │   └── student-story-progress.entity.ts
│   │   ├── dto/
│   │   │   ├── generate-story.dto.ts
│   │   │   └── update-story-progress.dto.ts
│   │   ├── services/
│   │   │   ├── ai-story-generator.service.ts
│   │   │   └── content-moderation.service.ts
│   │   ├── stories.controller.ts
│   │   ├── stories.service.ts
│   │   └── stories.module.ts
│   │
│   ├── centers/                 # PHASE 7 - TODO (Web Dashboard)
│   │   ├── entities/
│   │   │   └── center.entity.ts
│   │   ├── dto/
│   │   │   ├── create-center.dto.ts
│   │   │   └── update-center.dto.ts
│   │   ├── centers.controller.ts
│   │   ├── centers.service.ts
│   │   └── centers.module.ts
│   │
│   ├── branches/                # PHASE 7 - TODO (Web Dashboard)
│   │   └── [similar structure]
│   │
│   ├── classes/                 # PHASE 7 - TODO (Web Dashboard)
│   │   └── [similar structure]
│   │
│   ├── teacher-notes/           # PHASE 7 - TODO (Web Dashboard)
│   │   └── [similar structure]
│   │
│   ├── giftcodes/               # PHASE 7 - TODO (Web Dashboard)
│   │   └── [similar structure]
│   │
│   ├── curriculum/              # PHASE 7 - TODO (Web Dashboard)
│   │   └── [similar structure]
│   │
│   └── homework/                # PHASE 7 - TODO (Web Dashboard)
│       └── [similar structure]
```

**Action Items**:
1. Create all folders
2. Add `.gitkeep` files to empty folders
3. Add `README.md` in each module folder with TODO description

**Example Module README**:
```markdown
# Progress Module

**Phase**: 2
**Status**: 🔲 TODO
**Priority**: HIGH

## Purpose
Track student progress through levels, units, and chapters.

## Features
- [ ] Start level attempt
- [ ] Submit question answers
- [ ] Complete level
- [ ] Calculate scores
- [ ] Update unit/chapter progress
- [ ] Get student progress summary

## Dependencies
- Auth module (for user context)
- Levels module (for level data)
- Questions module (for answer validation)

## Implementation Order
1. Create entities (student_level_attempts, etc.)
2. Create DTOs (start-level, submit-answer, complete-level)
3. Implement progress.service.ts (business logic)
4. Create progress.controller.ts (API endpoints)
5. Add to app.module.ts

## API Endpoints
- POST /progress/levels/:id/start
- POST /progress/questions/:id/answer
- POST /progress/levels/:id/complete
- GET /progress/me

## Testing
- [ ] Unit tests for service
- [ ] Integration tests for controller
- [ ] E2E tests for full flow
```

---

### **DAY 2: Flutter Project Structure**
**Duration**: 8 hours

#### Morning (4 hours): Flutter Project Setup & Folder Structure

**1. Initialize Flutter Project**
```bash
flutter create story_quest_mobile --org com.storyquest
cd story_quest_mobile
```

**2. Add ALL Dependencies (Even for Future Phases)**

**File**: `pubspec.yaml`
```yaml
name: story_quest_mobile
description: English learning app for Vietnamese students (Grades 3-5)
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # State Management (PHASE 1)
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.5

  # Local Database (PHASE 1)
  hive_ce: ^2.6.0
  hive_ce_flutter: ^2.1.0

  # Network (PHASE 1)
  dio: ^5.4.3+1
  connectivity_plus: ^6.0.3
  pretty_dio_logger: ^1.4.0

  # Secure Storage (PHASE 1)
  flutter_secure_storage: ^9.2.2
  shared_preferences: ^2.2.3

  # Serialization (PHASE 1)
  freezed_annotation: ^2.4.1
  json_annotation: ^4.9.0

  # Navigation (PHASE 1)
  go_router: ^14.1.4

  # UI Components (PHASE 1)
  cached_network_image: ^3.3.1
  shimmer: ^3.0.0
  flutter_svg: ^2.0.10+1

  # Audio (PHASE 3 - TODO)
  just_audio: ^0.9.38
  audioplayers: ^6.0.0
  flutter_tts: ^4.0.2
  speech_to_text: ^6.6.2
  audio_waveforms: ^1.0.5
  permission_handler: ^11.3.1

  # Animations (PHASE 4 - TODO)
  lottie: ^3.1.2
  confetti: ^0.7.0
  flutter_animate: ^4.5.0

  # Charts (PHASE 4 - TODO)
  fl_chart: ^0.68.0

  # Image Processing (PHASE 5 - TODO)
  image_picker: ^1.1.2
  photo_view: ^0.15.0

  # Localization (PHASE 6 - TODO)
  intl: ^0.19.0
  easy_localization: ^3.0.7

  # Utils
  logger: ^2.3.0
  equatable: ^2.0.5
  path_provider: ^2.1.3

dev_dependencies:
  flutter_test:
    sdk: flutter

  # Code Generation
  build_runner: ^2.4.9
  riverpod_generator: ^2.4.0
  freezed: ^2.5.2
  json_serializable: ^6.8.0
  hive_ce_generator: ^1.6.0

  # Linting
  flutter_lints: ^4.0.0

  # Testing
  mocktail: ^1.0.4
  integration_test:
    sdk: flutter

flutter:
  uses-material-design: true

  # Assets (Placeholders for all phases)
  assets:
    # Images
    - assets/images/
    - assets/images/logo/
    - assets/images/icons/
    - assets/images/characters/
    - assets/images/badges/

    # Audio (PHASE 3)
    - assets/audio/
    - assets/audio/vocabulary/
    - assets/audio/music/
    - assets/audio/sfx/

    # Animations (PHASE 4)
    - assets/animations/
    - assets/animations/celebrations/

    # Translations (PHASE 6)
    - assets/translations/

  # Fonts
  fonts:
    - family: Quicksand
      fonts:
        - asset: assets/fonts/Quicksand-Regular.ttf
        - asset: assets/fonts/Quicksand-Bold.ttf
          weight: 700
```

**3. Create Complete Folder Structure**

**File**: `lib/` structure
```
lib/
├── app/
│   ├── app.dart                     # Main app widget (PHASE 1)
│   ├── router.dart                  # go_router configuration (PHASE 1)
│   └── providers.dart               # Global providers (PHASE 1)
│
├── core/
│   ├── constants/
│   │   ├── app_colors.dart          # Color palette (PHASE 1)
│   │   ├── app_sizes.dart           # Responsive sizing (PHASE 1)
│   │   ├── app_images.dart          # Asset paths (PHASE 1)
│   │   ├── api_endpoints.dart       # API URLs (PHASE 1)
│   │   └── curriculum_levels.dart   # Grade definitions (PHASE 1)
│   │
│   ├── theme/
│   │   ├── app_theme.dart           # Material 3 theme (PHASE 1)
│   │   └── text_styles.dart         # Typography (PHASE 1)
│   │
│   ├── utils/
│   │   ├── validators.dart          # Form validators (PHASE 1)
│   │   ├── audio_utils.dart         # Audio helpers (PHASE 3 - TODO)
│   │   ├── date_utils.dart          # Date formatting (PHASE 1)
│   │   └── logger.dart              # Logging utility (PHASE 1)
│   │
│   ├── extensions/
│   │   ├── context_extensions.dart  # BuildContext extensions (PHASE 1)
│   │   ├── string_extensions.dart   # String helpers (PHASE 1)
│   │   └── widget_extensions.dart   # Widget helpers (PHASE 1)
│   │
│   ├── network/
│   │   ├── dio_client.dart          # Dio instance (PHASE 1)
│   │   ├── api_interceptors.dart    # Auth/logging interceptors (PHASE 1)
│   │   └── api_error_handler.dart   # Error handling (PHASE 1)
│   │
│   └── storage/
│       ├── secure_storage.dart      # Token storage (PHASE 1)
│       ├── hive_storage.dart        # Local DB (PHASE 1)
│       └── cache_manager.dart       # Cache strategy (PHASE 6 - TODO)
│
├── features/
│   ├── auth/                        # PHASE 1 - IMPLEMENT FIRST
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   ├── user_model.dart
│   │   │   │   ├── login_response.dart
│   │   │   │   └── register_request.dart
│   │   │   ├── datasources/
│   │   │   │   ├── auth_local_datasource.dart
│   │   │   │   └── auth_remote_datasource.dart
│   │   │   └── repositories/
│   │   │       └── auth_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.dart
│   │   │   └── repositories/
│   │   │       └── auth_repository.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── login_screen.dart
│   │       │   ├── register_screen.dart
│   │       │   └── splash_screen.dart
│   │       ├── widgets/
│   │       │   ├── login_form.dart
│   │       │   └── register_form.dart
│   │       └── providers/
│   │           └── auth_provider.dart
│   │
│   ├── content/                     # PHASE 1 - Chapters/Units/Levels
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   ├── chapter_model.dart
│   │   │   │   ├── unit_model.dart
│   │   │   │   ├── level_model.dart
│   │   │   │   └── question_model.dart
│   │   │   ├── datasources/
│   │   │   │   ├── content_local_datasource.dart
│   │   │   │   └── content_remote_datasource.dart
│   │   │   └── repositories/
│   │   │       └── content_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── chapter.dart
│   │   │   │   ├── unit.dart
│   │   │   │   ├── level.dart
│   │   │   │   └── question.dart
│   │   │   └── repositories/
│   │   │       └── content_repository.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── chapters_list_screen.dart
│   │       │   ├── units_list_screen.dart
│   │       │   ├── levels_list_screen.dart
│   │       │   └── question_viewer_screen.dart
│   │       ├── widgets/
│   │       │   ├── chapter_card.dart
│   │       │   ├── unit_card.dart
│   │       │   ├── level_card.dart
│   │       │   └── question_card.dart
│   │       └── providers/
│   │           ├── chapters_provider.dart
│   │           ├── units_provider.dart
│   │           ├── levels_provider.dart
│   │           └── questions_provider.dart
│   │
│   ├── lessons/                     # PHASE 2 - TODO (Interactive Learning)
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   ├── level_attempt_model.dart
│   │   │   │   └── question_answer_model.dart
│   │   │   ├── datasources/
│   │   │   │   ├── lessons_local_datasource.dart
│   │   │   │   └── lessons_remote_datasource.dart
│   │   │   └── repositories/
│   │   │       └── lessons_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── level_attempt.dart
│   │   │   │   └── question_answer.dart
│   │   │   └── repositories/
│   │   │       └── lessons_repository.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── level_screen.dart
│   │       │   ├── level_results_screen.dart
│   │       │   └── question_screen.dart
│   │       ├── widgets/
│   │       │   ├── fill_in_blank_widget.dart
│   │       │   ├── select_answer_widget.dart
│   │       │   ├── sort_words_widget.dart
│   │       │   ├── talk_to_speech_widget.dart # PHASE 3
│   │       │   ├── question_progress_bar.dart
│   │       │   └── answer_feedback_dialog.dart
│   │       └── providers/
│   │           ├── level_provider.dart
│   │           └── question_answer_provider.dart
│   │
│   ├── progress/                    # PHASE 2 - TODO
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   ├── student_progress_model.dart
│   │   │   │   ├── chapter_progress_model.dart
│   │   │   │   └── unit_progress_model.dart
│   │   │   ├── datasources/
│   │   │   │   ├── progress_local_datasource.dart
│   │   │   │   └── progress_remote_datasource.dart
│   │   │   └── repositories/
│   │   │       └── progress_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── student_progress.dart
│   │   │   │   └── chapter_progress.dart
│   │   │   └── repositories/
│   │   │       └── progress_repository.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── progress_dashboard_screen.dart
│   │       │   └── chapter_progress_screen.dart
│   │       ├── widgets/
│   │       │   ├── progress_chart.dart
│   │       │   ├── stat_card.dart
│   │       │   └── progress_linear_indicator.dart
│   │       └── providers/
│   │           └── progress_provider.dart
│   │
│   ├── pronunciation/               # PHASE 3 - TODO
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   ├── pronunciation_attempt_model.dart
│   │   │   │   └── vocabulary_word_model.dart
│   │   │   ├── datasources/
│   │   │   │   ├── pronunciation_local_datasource.dart
│   │   │   │   └── pronunciation_remote_datasource.dart
│   │   │   └── repositories/
│   │   │       └── pronunciation_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── pronunciation_attempt.dart
│   │   │   │   └── vocabulary_word.dart
│   │   │   └── repositories/
│   │   │       └── pronunciation_repository.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── pronunciation_practice_screen.dart
│   │       │   └── vocabulary_detail_screen.dart
│   │       ├── widgets/
│   │       │   ├── audio_player_widget.dart
│   │       │   ├── record_button_widget.dart
│   │       │   ├── pronunciation_visualizer.dart
│   │       │   └── pronunciation_feedback_widget.dart
│   │       ├── providers/
│   │       │   ├── pronunciation_provider.dart
│   │       │   ├── audio_player_provider.dart
│   │       │   └── speech_recognition_provider.dart
│   │       └── services/
│   │           ├── audio_service.dart
│   │           ├── tts_service.dart
│   │           └── speech_recognition_service.dart
│   │
│   ├── gamification/                # PHASE 4 - TODO
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   ├── achievement_model.dart
│   │   │   │   ├── student_points_model.dart
│   │   │   │   └── daily_goal_model.dart
│   │   │   ├── datasources/
│   │   │   │   ├── gamification_local_datasource.dart
│   │   │   │   └── gamification_remote_datasource.dart
│   │   │   └── repositories/
│   │   │       └── gamification_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── achievement.dart
│   │   │   │   ├── student_points.dart
│   │   │   │   └── daily_goal.dart
│   │   │   └── repositories/
│   │   │       └── gamification_repository.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── achievements_screen.dart
│   │       │   ├── leaderboard_screen.dart
│   │       │   └── daily_goals_screen.dart
│   │       ├── widgets/
│   │       │   ├── achievement_badge.dart
│   │       │   ├── points_display.dart
│   │       │   ├── streak_counter.dart
│   │       │   ├── celebration_animation.dart
│   │       │   └── level_up_dialog.dart
│   │       └── providers/
│   │           ├── achievements_provider.dart
│   │           └── points_provider.dart
│   │
│   ├── stories/                     # PHASE 5 - TODO
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   ├── story_model.dart
│   │   │   │   ├── story_scene_model.dart
│   │   │   │   └── story_progress_model.dart
│   │   │   ├── datasources/
│   │   │   │   ├── stories_local_datasource.dart
│   │   │   │   └── stories_remote_datasource.dart
│   │   │   └── repositories/
│   │   │       └── stories_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── story.dart
│   │   │   │   ├── story_scene.dart
│   │   │   │   └── story_progress.dart
│   │   │   └── repositories/
│   │   │       └── stories_repository.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── stories_library_screen.dart
│   │       │   ├── story_generation_screen.dart
│   │       │   ├── story_reader_screen.dart
│   │       │   └── story_comprehension_screen.dart
│   │       ├── widgets/
│   │       │   ├── story_card.dart
│   │       │   ├── story_scene_widget.dart
│   │       │   ├── page_flip_animation.dart
│   │       │   ├── vocabulary_highlight.dart
│   │       │   └── story_generation_loader.dart
│   │       └── providers/
│   │           ├── stories_provider.dart
│   │           ├── story_generation_provider.dart
│   │           └── story_reader_provider.dart
│   │
│   ├── profile/                     # PHASE 1
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   └── user_profile_model.dart
│   │   │   ├── datasources/
│   │   │   │   └── profile_remote_datasource.dart
│   │   │   └── repositories/
│   │   │       └── profile_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user_profile.dart
│   │   │   └── repositories/
│   │   │       └── profile_repository.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── profile_screen.dart
│   │       │   └── edit_profile_screen.dart
│   │       ├── widgets/
│   │       │   ├── profile_avatar.dart
│   │       │   └── profile_info_card.dart
│   │       └── providers/
│   │           └── profile_provider.dart
│   │
│   └── home/                        # PHASE 1
│       └── presentation/
│           ├── screens/
│           │   └── home_screen.dart
│           └── widgets/
│               ├── bottom_nav_bar.dart
│               ├── home_app_bar.dart
│               └── featured_content_carousel.dart
│
├── shared/
│   └── widgets/
│       ├── buttons/
│       │   ├── primary_button.dart
│       │   ├── secondary_button.dart
│       │   └── icon_button_widget.dart
│       ├── cards/
│       │   ├── content_card.dart
│       │   ├── info_card.dart
│       │   └── stats_card.dart
│       ├── loading/
│       │   ├── loading_spinner.dart
│       │   ├── loading_overlay.dart
│       │   └── skeleton_loader.dart
│       ├── errors/
│       │   ├── error_widget.dart
│       │   └── empty_state_widget.dart
│       ├── dialogs/
│       │   ├── confirmation_dialog.dart
│       │   └── info_dialog.dart
│       └── inputs/
│           ├── custom_text_field.dart
│           └── custom_dropdown.dart
│
└── main.dart                        # App entry point (PHASE 1)
```

**Action Items**:
1. Create all folders
2. Run `flutter pub get`
3. Run code generation: `flutter pub run build_runner build --delete-conflicting-outputs`
4. Add README.md in each feature folder with TODO description

**Example Feature README**:
```markdown
# Pronunciation Feature

**Phase**: 3
**Status**: 🔲 TODO
**Priority**: HIGH

## Purpose
Enable students to practice pronunciation with real-time feedback.

## Features
- [ ] Text-to-Speech (TTS) for vocabulary words
- [ ] Speech Recognition for student pronunciation
- [ ] Audio waveform visualization
- [ ] Pronunciation accuracy scoring
- [ ] Practice history tracking

## Dependencies
- `just_audio` package
- `flutter_tts` package
- `speech_to_text` package
- `audio_waveforms` package
- `permission_handler` package

## Permissions Required
- Android: `RECORD_AUDIO`, `INTERNET`
- iOS: `NSMicrophoneUsageDescription`

## Implementation Order
1. Set up audio permissions
2. Implement TTS service
3. Implement Speech Recognition service
4. Create pronunciation practice UI
5. Integrate with backend API

## Screens
- `pronunciation_practice_screen.dart` - Main practice screen
- `vocabulary_detail_screen.dart` - Word details with audio

## Providers
- `pronunciation_provider.dart` - Main state management
- `audio_player_provider.dart` - Audio playback state
- `speech_recognition_provider.dart` - Speech recognition state

## Testing
- [ ] Unit tests for services
- [ ] Widget tests for UI
- [ ] Integration tests for full flow
- [ ] Test on real devices (iOS & Android)
```

---

#### Afternoon (4 hours): Create Placeholder Files with TODOs

**Create placeholder files for ALL features with TODO comments**

**Example Placeholder File**:
```dart
// lib/features/pronunciation/presentation/screens/pronunciation_practice_screen.dart

import 'package:flutter/material.dart';

/// PHASE 3 - PRONUNCIATION PRACTICE
///
/// TODO: Implement pronunciation practice screen
///
/// Features to implement:
/// - [ ] Text-to-Speech audio playback
/// - [ ] Speech recognition recording
/// - [ ] Real-time audio waveform visualization
/// - [ ] Pronunciation accuracy feedback
/// - [ ] Practice history display
///
/// Dependencies:
/// - PronunciationProvider (Riverpod)
/// - AudioPlayerProvider (Riverpod)
/// - SpeechRecognitionProvider (Riverpod)
///
/// UI Components needed:
/// - Audio player widget
/// - Record button widget
/// - Waveform visualizer
/// - Feedback display widget
///
/// Reference Design:
/// - See Figma: [Pronunciation Practice Screen]
/// - Color scheme: Primary cyan (#1EA896)
///
/// Implementation Steps:
/// 1. Request microphone permission
/// 2. Set up TTS service
/// 3. Set up speech recognition service
/// 4. Build UI with audio controls
/// 5. Integrate with backend API
/// 6. Add local caching for offline mode
///
/// Testing Checklist:
/// - [ ] Permissions work on Android
/// - [ ] Permissions work on iOS
/// - [ ] Audio plays correctly
/// - [ ] Recording works
/// - [ ] Feedback displays correctly
/// - [ ] Offline mode works
class PronunciationPracticeScreen extends StatelessWidget {
  const PronunciationPracticeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pronunciation Practice'),
        backgroundColor: const Color(0xFF1EA896),
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.construction,
              size: 64,
              color: Colors.grey,
            ),
            SizedBox(height: 16),
            Text(
              'PHASE 3 - TODO',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Pronunciation Practice',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
            ),
            SizedBox(height: 24),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                'This feature will be implemented in Phase 3.\n\n'
                'Features:\n'
                '- Text-to-Speech\n'
                '- Speech Recognition\n'
                '- Audio Visualization\n'
                '- Pronunciation Feedback',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

**Repeat for ALL feature screens across all phases.**

---

### **DAY 3: React Web Dashboard Structure**
**Duration**: 8 hours

#### Morning (4 hours): React Project Setup

**1. Initialize React Project with Vite**
```bash
cd ..  # Go back to root
npm create vite@latest story_quest_web_dashboard -- --template react-ts
cd story_quest_web_dashboard
```

**2. Add ALL Dependencies (Even for Future Phases)**

**File**: `package.json`
```json
{
  "name": "story-quest-web-dashboard",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",

    "@tanstack/react-query": "^5.51.1",
    "@tanstack/react-query-devtools": "^5.51.1",

    "zustand": "^4.5.4",

    "react-router-dom": "^6.24.1",

    "antd": "^5.19.1",

    "axios": "^1.7.2",

    "react-hook-form": "^7.52.1",
    "zod": "^3.23.8",
    "@hookform/resolvers": "^3.9.0",

    "date-fns": "^3.6.0",

    "recharts": "^2.12.7",

    "i18next": "^23.12.2",
    "react-i18next": "^14.1.2",

    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/lodash": "^4.17.7",

    "@vitejs/plugin-react": "^4.3.1",

    "typescript": "^5.5.3",

    "vite": "^5.3.3",

    "eslint": "^8.57.0",
    "@typescript-eslint/eslint-plugin": "^7.16.0",
    "@typescript-eslint/parser": "^7.16.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.7",

    "vitest": "^1.6.0",
    "@vitest/ui": "^1.6.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/user-event": "^14.5.2",

    "msw": "^2.3.1",

    "prettier": "^3.3.2"
  }
}
```

**3. Install Dependencies**
```bash
npm install
```

---

#### Afternoon (4 hours): React Folder Structure

**File**: `src/` structure
```
src/
├── main.tsx                         # App entry point
├── App.tsx                          # Root component
├── vite-env.d.ts                    # Vite type definitions
│
├── config/
│   ├── constants.ts                 # App constants
│   ├── env.ts                       # Environment variables
│   └── routes.ts                    # Route constants
│
├── types/
│   ├── api.types.ts                 # API response types
│   ├── user.types.ts                # User & role types
│   ├── center.types.ts              # Center domain types
│   ├── teacher.types.ts             # Teacher domain types
│   ├── student.types.ts             # Student domain types
│   ├── content.types.ts             # Content types
│   └── index.ts                     # Type exports
│
├── api/
│   ├── client.ts                    # Axios instance & interceptors
│   ├── endpoints.ts                 # API endpoint constants
│   ├── auth.api.ts                  # Auth API calls
│   ├── center.api.ts                # Center API calls (PHASE 7 - TODO)
│   ├── teacher.api.ts               # Teacher API calls (PHASE 7 - TODO)
│   ├── student.api.ts               # Student API calls (Read-only)
│   ├── curriculum.api.ts            # Curriculum API calls (PHASE 7 - TODO)
│   ├── giftcode.api.ts              # Giftcode API calls (PHASE 7 - TODO)
│   └── index.ts                     # API exports
│
├── hooks/
│   ├── useAuth.ts                   # Authentication hook (PHASE 1)
│   ├── useCurrentUser.ts            # Current user hook (PHASE 1)
│   ├── usePermission.ts             # Permission check hook (PHASE 1)
│   ├── useDebounce.ts               # Debounce hook (PHASE 1)
│   ├── useLocalStorage.ts           # Local storage hook (PHASE 1)
│   └── queries/
│       ├── useStudents.ts           # Student queries (Read-only)
│       ├── useCenters.ts            # Center queries (PHASE 7 - TODO)
│       ├── useClasses.ts            # Class queries (PHASE 7 - TODO)
│       ├── useTeachers.ts           # Teacher queries (PHASE 7 - TODO)
│       ├── useGiftcodes.ts          # Giftcode queries (PHASE 7 - TODO)
│       └── index.ts                 # Query hook exports
│
├── stores/
│   ├── authStore.ts                 # Auth state (Zustand) (PHASE 1)
│   ├── uiStore.ts                   # UI state (sidebar, theme) (PHASE 1)
│   └── index.ts                     # Store exports
│
├── components/
│   ├── common/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Modal/
│   │   ├── Table/
│   │   ├── Card/
│   │   ├── Loading/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── LoadingOverlay.tsx
│   │   │   └── index.ts
│   │   └── ErrorBoundary/
│   │       ├── ErrorBoundary.tsx
│   │       └── index.ts
│   │
│   ├── layout/
│   │   ├── DashboardLayout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── index.ts
│   │   ├── AuthLayout/
│   │   │   ├── AuthLayout.tsx
│   │   │   └── index.ts
│   │   └── ProtectedRoute/
│   │       ├── ProtectedRoute.tsx
│   │       ├── RoleGuard.tsx
│   │       └── index.ts
│   │
│   ├── forms/
│   │   ├── LoginForm/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LoginForm.schema.ts  # Zod schema
│   │   │   └── index.ts
│   │   ├── StudentForm/             # PHASE 7 - TODO
│   │   ├── ClassForm/               # PHASE 7 - TODO
│   │   ├── CenterForm/              # PHASE 7 - TODO
│   │   └── CurriculumForm/          # PHASE 7 - TODO
│   │
│   └── features/
│       ├── dashboard/
│       │   ├── StatCard.tsx
│       │   ├── ProgressChart.tsx
│       │   └── RecentActivity.tsx
│       ├── students/                # Read-only student monitoring
│       │   ├── StudentList.tsx
│       │   ├── StudentDetail.tsx
│       │   ├── StudentProgress.tsx
│       │   └── StudentNotes.tsx
│       ├── centers/                 # PHASE 7 - TODO
│       │   ├── CenterList.tsx
│       │   ├── CenterDetail.tsx
│       │   └── BranchManagement.tsx
│       ├── classes/                 # PHASE 7 - TODO
│       │   ├── ClassList.tsx
│       │   ├── ClassDetail.tsx
│       │   └── ClassAssignment.tsx
│       ├── teachers/                # PHASE 7 - TODO
│       │   ├── TeacherList.tsx
│       │   └── TeacherDetail.tsx
│       ├── giftcodes/               # PHASE 7 - TODO
│       │   ├── GiftcodeList.tsx
│       │   └── GiftcodeForm.tsx
│       └── curriculum/              # PHASE 7 - TODO
│           ├── CurriculumList.tsx
│           ├── CurriculumEditor.tsx
│           └── ContentReview.tsx
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx            # PHASE 1
│   │   ├── ForgotPasswordPage.tsx
│   │   └── ResetPasswordPage.tsx
│   │
│   ├── agency/                      # PHASE 7 - TODO (Super Admin)
│   │   ├── AgencyDashboard.tsx
│   │   ├── CenterManagement.tsx
│   │   ├── ContentReview.tsx
│   │   ├── MarketplaceManagement.tsx
│   │   ├── StudentAnalytics.tsx
│   │   ├── EventManagement.tsx
│   │   └── StudyAbroadManagement.tsx
│   │
│   ├── center/                      # PHASE 7 - TODO (Org Admin)
│   │   ├── CenterDashboard.tsx
│   │   ├── BranchManagement.tsx
│   │   ├── ClassManagement.tsx
│   │   ├── TeacherManagement.tsx
│   │   ├── StudentList.tsx          # Read-only + giftcodes
│   │   ├── CurriculumManagement.tsx
│   │   ├── Reports.tsx
│   │   ├── GiftcodeManagement.tsx
│   │   └── Settings.tsx
│   │
│   ├── teacher/                     # PHASE 7 - TODO (Instructor)
│   │   ├── TeacherDashboard.tsx
│   │   ├── MyStudents.tsx           # Read-only + notes
│   │   ├── StudentNotes.tsx
│   │   ├── MyCurriculum.tsx
│   │   ├── HomeworkManagement.tsx
│   │   ├── ContentCreation.tsx
│   │   └── Reports.tsx
│   │
│   ├── reviewer/                    # PHASE 7 - TODO (Content Moderator)
│   │   ├── ReviewerDashboard.tsx
│   │   ├── ReviewQueue.tsx
│   │   ├── ReviewDetail.tsx
│   │   ├── ReviewHistory.tsx
│   │   └── ChatSupport.tsx
│   │
│   ├── common/
│   │   ├── NotFoundPage.tsx
│   │   ├── UnauthorizedPage.tsx
│   │   └── ErrorPage.tsx
│   │
│   └── index.ts
│
├── routes/
│   ├── index.tsx                    # Main router (PHASE 1)
│   ├── AgencyRoutes.tsx             # PHASE 7 - TODO
│   ├── CenterRoutes.tsx             # PHASE 7 - TODO
│   ├── TeacherRoutes.tsx            # PHASE 7 - TODO
│   └── ReviewerRoutes.tsx           # PHASE 7 - TODO
│
├── utils/
│   ├── auth.utils.ts                # JWT decode, token management (PHASE 1)
│   ├── date.utils.ts                # Date formatting helpers (PHASE 1)
│   ├── number.utils.ts              # Number formatting (PHASE 1)
│   ├── validation.utils.ts          # Validation helpers (PHASE 1)
│   ├── storage.utils.ts             # Local/Session storage (PHASE 1)
│   └── permission.utils.ts          # Permission check utilities (PHASE 1)
│
├── styles/
│   ├── global.css                   # Global styles (PHASE 1)
│   ├── variables.css                # CSS variables (PHASE 1)
│   ├── theme.ts                     # Ant Design theme config (PHASE 1)
│   └── animations.css               # Animation keyframes (PHASE 1)
│
└── tests/
    ├── setup.ts                     # Test setup
    ├── mocks/
    │   ├── handlers.ts              # MSW handlers
    │   └── data.ts                  # Mock data
    └── utils.tsx                    # Test utilities
```

**Action Items**:
1. Create all folders
2. Add `.gitkeep` files to empty folders
3. Add README.md in each route folder with TODO description

**Example Route README**:
```markdown
# Center Routes (Organization Admin)

**Phase**: 7
**Status**: 🔲 TODO
**Priority**: MEDIUM (After Flutter MVP)

## Purpose
Admin panel for center administrators to manage branches, classes, teachers, and view student analytics.

## Routes
- `/center/dashboard` - Main dashboard with stats
- `/center/branches` - Branch management (CRUD)
- `/center/classes` - Class management (CRUD)
- `/center/teachers` - Teacher management (view, add, edit)
- `/center/students` - Student list (READ-ONLY + giftcode assignment)
- `/center/curriculum` - Curriculum marketplace
- `/center/reports` - Center-specific reports
- `/center/giftcodes` - Giftcode management
- `/center/settings` - Center settings

## Permissions
- Role: `center`
- Can manage own center data only
- Cannot edit student data directly (read-only)
- Can create giftcodes for trial access

## Features
- [ ] Dashboard with center KPIs
- [ ] Branch CRUD operations
- [ ] Class CRUD operations
- [ ] Teacher management (invite, assign classes)
- [ ] Student list with progress (read-only)
- [ ] Giftcode generation and management
- [ ] Report generation (PDF export)
- [ ] Curriculum marketplace browsing

## Implementation Order
1. Set up center routes in router
2. Create CenterLayout with sidebar
3. Implement dashboard with stats
4. Create branch management pages
5. Create class management pages
6. Create teacher management pages
7. Create student list (read-only)
8. Create giftcode management
9. Create reports page

## Dependencies
- Center API endpoints (backend)
- Branch API endpoints (backend)
- Class API endpoints (backend)
- Giftcode API endpoints (backend)

## Testing
- [ ] Unit tests for components
- [ ] Integration tests for forms
- [ ] E2E tests for full workflows
- [ ] Permission tests (role-based access)
```

---

### **DAY 4: Configuration Files & Environment Setup**
**Duration**: 8 hours

#### All Day: Configuration for All Projects

**1. NestJS Configuration**

**File**: `.env.example`
```env
# Environment
NODE_ENV=development

# Server
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=story_quest_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=90d
JWT_REFRESH_EXPIRES_IN=7d

# Redis (PHASE 6 - TODO)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OpenAI (PHASE 5 - TODO)
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4

# Google Cloud (PHASE 3 - TODO)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_TTS_API_KEY=your-tts-key
GOOGLE_CLOUD_SPEECH_API_KEY=your-speech-key

# AWS S3 (PHASE 3 - TODO)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=story-quest-assets
AWS_REGION=us-east-1

# Firebase (PHASE 3 - TODO)
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-firebase-key
FIREBASE_CLIENT_EMAIL=your-firebase-email

# Sentry (PHASE 6 - TODO)
SENTRY_DSN=your-sentry-dsn

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

**File**: `docker-compose.dev.yml`
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: story_quest_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: story_quest_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - story_quest_network

  # Redis (PHASE 6 - TODO)
  redis:
    image: redis:7-alpine
    container_name: story_quest_redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    networks:
      - story_quest_network

  # NestJS API
  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: story_quest_api
    environment:
      NODE_ENV: development
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: postgres
      DB_DATABASE: story_quest_db
      REDIS_HOST: redis
      REDIS_PORT: 6379
    ports:
      - '3000:3000'
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
    networks:
      - story_quest_network
    command: npm run start:dev

volumes:
  postgres_data:
  redis_data:

networks:
  story_quest_network:
    driver: bridge
```

---

**2. Flutter Configuration**

**File**: `android/app/src/main/AndroidManifest.xml`
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Permissions for PHASE 1 -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>

    <!-- Permissions for PHASE 3 - TODO (Audio) -->
    <uses-permission android:name="android.permission.RECORD_AUDIO"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>

    <!-- Permissions for PHASE 5 - TODO (Camera for AI images) -->
    <uses-permission android:name="android.permission.CAMERA"/>

    <application
        android:label="Story Quest"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher">

        <!-- TODO: Add activity configuration -->

    </application>
</manifest>
```

**File**: `lib/core/config/env_config.dart`
```dart
/// Environment Configuration
///
/// TODO: Update API URLs for production
class EnvConfig {
  // API URLs
  static const String devApiUrl = 'http://localhost:3000/api/v1';
  static const String prodApiUrl = 'https://api.storyquest.com/api/v1';

  // Current environment
  static const bool isDevelopment = true;

  // Get current API URL
  static String get apiUrl => isDevelopment ? devApiUrl : prodApiUrl;

  // Timeout durations
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // PHASE 5 - TODO: AI Configuration
  // static const String openaiApiKey = 'YOUR_KEY_HERE';

  // PHASE 3 - TODO: Google Cloud Configuration
  // static const String googleCloudProjectId = 'YOUR_PROJECT_ID';

  // PHASE 6 - TODO: Sentry Configuration
  // static const String sentryDsn = 'YOUR_SENTRY_DSN';
}
```

---

**3. React Configuration**

**File**: `.env.development`
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Story Quest Dashboard
VITE_APP_VERSION=1.0.0
```

**File**: `.env.production`
```env
VITE_API_BASE_URL=https://api.storyquest.com/api/v1
VITE_APP_NAME=Story Quest Dashboard
VITE_APP_VERSION=1.0.0
```

**File**: `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

---

### **DAY 5: Testing Setup & Documentation**
**Duration**: 8 hours

#### Morning (4 hours): Testing Configuration for All Projects

**1. NestJS Testing**

**File**: `test/jest-e2e.json`
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

**File**: `test/app.e2e-spec.ts` (Example test)
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```

---

**2. Flutter Testing**

**File**: `test/widget_test.dart` (Example)
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Counter increments smoke test', (WidgetTester tester) async {
    // TODO: Add widget tests for each screen
    // Example test structure
  });
}
```

**File**: `integration_test/app_test.dart` (Example)
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('end-to-end test', () {
    testWidgets('Login flow test', (WidgetTester tester) async {
      // TODO: Add E2E test for login flow
    });

    // PHASE 2 - TODO
    testWidgets('Complete level flow test', (WidgetTester tester) async {
      // TODO: Add E2E test for completing a level
    });

    // PHASE 3 - TODO
    testWidgets('Pronunciation practice flow test', (WidgetTester tester) async {
      // TODO: Add E2E test for pronunciation practice
    });
  });
}
```

---

**3. React Testing**

**File**: `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**File**: `src/tests/setup.ts`
```typescript
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

---

#### Afternoon (4 hours): Documentation

**Create comprehensive README files for each project**

**File**: `story_quest_nestjs/README.md`
```markdown
# Story Quest - NestJS Backend

English learning platform API for Vietnamese students (Grades 3-5).

## 📋 Project Status

| Phase | Status | Priority |
|-------|--------|----------|
| Phase 1: Foundation | 🔲 TODO | HIGH |
| Phase 2: Progress | 🔲 TODO | HIGH |
| Phase 3: Audio/Speech | 🔲 TODO | HIGH |
| Phase 4: Gamification | 🔲 TODO | MEDIUM |
| Phase 5: AI Stories | 🔲 TODO | MEDIUM |
| Phase 6: Polish | 🔲 TODO | LOW |
| Phase 7: Web Dashboard | 🔲 TODO | LOW |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Installation
\`\`\`bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database credentials

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
\`\`\`

### Docker Setup (Recommended)
\`\`\`bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f api

# Stop services
docker-compose -f docker-compose.dev.yml down
\`\`\`

## 📚 Documentation

See [docs/](./docs/) folder for detailed documentation:
- [IMPLEMENTATION_ROADMAP.md](./docs/IMPLEMENTATION_ROADMAP.md) - Complete implementation plan
- [WEEK_1_PREPARATION_PLAN.md](./docs/WEEK_1_PREPARATION_PLAN.md) - Week 1 setup guide
- [API_DESIGN_GUIDELINES.md](./docs/API_DESIGN_GUIDELINES.md) - API standards
- [AUTH_README.md](./docs/AUTH_README.md) - Authentication details

## 🧪 Testing

\`\`\`bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
\`\`\`

## 📦 Project Structure

See [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)

## 🔐 Environment Variables

See [.env.example](./.env.example) for all required environment variables.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License

MIT
```

---

**Repeat similar READMEs for Flutter and React projects.**

---

## 🎯 End of Week 1 Deliverables

### ✅ Checklist

#### NestJS Backend
- [ ] Complete database schema created (all 40+ tables)
- [ ] All module folders created with placeholders
- [ ] Environment configuration files ready
- [ ] Docker setup complete
- [ ] Testing framework configured
- [ ] README and documentation complete
- [ ] Git repository initialized
- [ ] All TODOs marked with phase numbers

#### Flutter Mobile
- [ ] Complete project structure created
- [ ] All dependencies added to pubspec.yaml
- [ ] All feature folders with placeholders
- [ ] Asset folders created
- [ ] Environment configuration ready
- [ ] Permissions configured
- [ ] Testing framework configured
- [ ] README and documentation complete
- [ ] Git repository initialized
- [ ] All TODOs marked with phase numbers

#### React Web
- [ ] Complete project structure created
- [ ] All dependencies added to package.json
- [ ] All route folders with placeholders
- [ ] Component library structure ready
- [ ] Environment configuration ready
- [ ] Testing framework configured
- [ ] README and documentation complete
- [ ] Git repository initialized
- [ ] All TODOs marked with phase numbers

#### Documentation
- [ ] Complete implementation roadmap
- [ ] Week 1 preparation plan
- [ ] API design guidelines
- [ ] Database schema documentation
- [ ] Testing strategy documented
- [ ] Deployment guides created

---

## 📅 What Happens After Week 1?

### Week 2 Onwards: Phase-by-Phase Implementation

Follow the [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) to implement each phase:

1. **Week 2**: Phase 1 - Auth + Content Browsing
2. **Weeks 3-5**: Phase 2 - Interactive Learning
3. **Weeks 6-7**: Phase 3 - Audio & Pronunciation
4. **Week 8**: Phase 4 - Gamification
5. **Weeks 9-11**: Phase 5 - AI Stories
6. **Week 12**: Phase 6 - Polish & Optimization
7. **Weeks 13-20**: Phase 7 - Web Dashboard

---

## 🎓 Summary

By the end of Week 1, you will have:
✅ **100% of project structure** ready
✅ **All placeholders** with TODO comments
✅ **All documentation** in place
✅ **Complete database schema** (all tables created)
✅ **All dependencies** installed
✅ **Development environment** configured
✅ **Clear roadmap** to follow

**You can start Phase 1 implementation immediately after Week 1!**

---

**Next Steps**: Start implementing Phase 1 (Auth + Content Browsing) following the detailed steps in IMPLEMENTATION_ROADMAP.md.
