# Week 1: Complete Project Preparation & Scaffolding

## 🎯 Goal
Set up the entire project structure with a **focus-driven approach**: create complete scaffolding for NestJS backend only, with all database tables and module placeholders. Flutter and React will be initialized but kept minimal.

By the end of Week 1:
- ✅ **NestJS Backend**: Complete folder structure, all database tables, module placeholders
- ✅ **Flutter Mobile**: Basic initialization (minimal setup)
- ✅ **React Web**: Basic initialization (minimal setup)
- ✅ Development environment fully configured
- ✅ Documentation complete

**Strategy**: Build NestJS foundation first since both clients depend on the API. Create everything as placeholders with TODO markers for implementation later.

---

## 📅 Day-by-Day Plan

### **DAY 1: NestJS Backend - Complete Database Schema**
**Duration**: 8 hours | **Priority**: CRITICAL

#### Morning (4 hours): Database Schema - ALL TABLES

Create complete database schema with ALL tables for all phases at once. This ensures referential integrity from the start.

**File**: `src/database/migrations/001-complete-schema.ts`

**Tables to Create**:

**PHASE 1: Core Foundation (5 tables)**
- `users` - All 5 roles (agency, center, teacher, reviewer, student)
- `chapters` - Top-level curriculum organization
- `units` - Chapter sub-topics
- `levels` - Individual lessons
- `questions` - Learning activities with 4 types
- `answer_options` - Multiple choice options

**PHASE 2: Progress Tracking (4 tables)**
- `student_level_attempts` - Level completion attempts
- `student_question_answers` - Individual question responses
- `student_unit_progress` - Unit-level progress summary
- `student_chapter_progress` - Chapter-level progress summary

**PHASE 3: Audio & Pronunciation (2 tables)**
- `pronunciation_attempts` - Speech practice records
- `vocabulary_words` - Words with TTS audio URLs

**PHASE 4: Gamification (4 tables)**
- `achievements` - Available badges/achievements
- `student_achievements` - Student unlock progress
- `student_points` - Points and streak tracking
- `daily_goals` - Daily learning targets

**PHASE 5: AI Stories (5 tables)**
- `stories` - Generated story metadata
- `story_scenes` - Story pagination
- `story_vocabulary` - Words used in stories
- `story_comprehension_questions` - Story quizzes
- `student_story_progress` - Reading progress

**PHASE 7: Web Dashboard (12 tables)**
- `centers` - Learning center organizations
- `branches` - Physical locations
- `grades` - Grade level definitions (3, 4, 5)
- `classes` - Class groups
- `student_classes` - Student-class assignments
- `teacher_notes` - Teacher observations
- `giftcodes` - Trial/discount codes
- `giftcode_usage` - Redemption tracking
- `curriculum_content` - Teacher-created content
- `homework_assignments` - Homework tasks
- `homework_submissions` - Student submissions

**Total: 32 tables + comprehensive indexes**

#### Migration Command

```bash
# Generate migration file
npm run typeorm migration:create src/database/migrations/CompleteSchema

# Edit migration file with all table definitions

# Run migration
npm run typeorm migration:run

# Verify
npm run typeorm migration:show
```

**Key Database Principles**:
- ✅ **INTEGER Primary Keys**: All IDs are auto-increment integers (NOT UUIDs)
- ✅ **Cascade Deletes**: Proper ON DELETE CASCADE relationships
- ✅ **Indexes**: Performance-optimized for common queries
- ✅ **Constraints**: Data integrity checks (scores 0-100, positive values)
- ✅ **Role Validation**: Database triggers ensure valid user roles

**Deliverable**: Complete database schema with all 32 tables created and migrated.

---

#### Afternoon (4 hours): NestJS Module Structure - ALL PLACEHOLDERS

Create complete module structure with TODO placeholders for future implementation.

**File Structure**:
```
src/
├── common/                          # Shared resources
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── public.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   └── filters/
│       └── http-exception.filter.ts
│
├── config/
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── app.config.ts
│
├── database/
│   └── migrations/
│       └── 001-complete-schema.ts
│
├── modules/
│   ├── auth/                        # PHASE 1 - IMPLEMENT FIRST
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   └── change-password.dto.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── users/                       # PHASE 1
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   │
│   ├── chapters/                    # PHASE 1
│   │   ├── entities/
│   │   │   └── chapter.entity.ts
│   │   ├── dto/
│   │   │   ├── create-chapter.dto.ts
│   │   │   └── update-chapter.dto.ts
│   │   ├── chapters.controller.ts
│   │   ├── chapters.service.ts
│   │   └── chapters.module.ts
│   │
│   ├── units/                       # PHASE 1
│   │   └── [similar structure]
│   │
│   ├── levels/                      # PHASE 1
│   │   └── [similar structure]
│   │
│   ├── questions/                   # PHASE 1
│   │   ├── entities/
│   │   │   ├── question.entity.ts
│   │   │   └── answer-option.entity.ts
│   │   └── [similar structure]
│   │
│   ├── progress/                    # PHASE 2 - TODO
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
│   ├── pronunciation/               # PHASE 3 - TODO
│   │   ├── entities/
│   │   │   └── pronunciation-attempt.entity.ts
│   │   ├── services/
│   │   │   ├── tts.service.ts
│   │   │   └── speech-recognition.service.ts
│   │   └── [similar structure]
│   │
│   ├── vocabulary/                  # PHASE 3 - TODO
│   │   ├── entities/
│   │   │   └── vocabulary-word.entity.ts
│   │   └── [similar structure]
│   │
│   ├── gamification/                # PHASE 4 - TODO
│   │   ├── entities/
│   │   │   ├── achievement.entity.ts
│   │   │   ├── student-achievement.entity.ts
│   │   │   ├── student-points.entity.ts
│   │   │   └── daily-goal.entity.ts
│   │   └── [similar structure]
│   │
│   ├── stories/                     # PHASE 5 - TODO
│   │   ├── entities/
│   │   │   ├── story.entity.ts
│   │   │   ├── story-scene.entity.ts
│   │   │   ├── story-vocabulary.entity.ts
│   │   │   ├── story-comprehension-question.entity.ts
│   │   │   └── student-story-progress.entity.ts
│   │   ├── services/
│   │   │   ├── ai-story-generator.service.ts
│   │   │   └── content-moderation.service.ts
│   │   └── [similar structure]
│   │
│   ├── centers/                     # PHASE 7 - TODO (Web Dashboard)
│   │   ├── entities/
│   │   │   └── center.entity.ts
│   │   └── [similar structure]
│   │
│   ├── branches/                    # PHASE 7 - TODO
│   ├── classes/                     # PHASE 7 - TODO
│   ├── teacher-notes/               # PHASE 7 - TODO
│   ├── giftcodes/                   # PHASE 7 - TODO
│   ├── curriculum/                  # PHASE 7 - TODO
│   └── homework/                    # PHASE 7 - TODO
│
├── app.module.ts
└── main.ts
```

**Action Items**:
1. Create all folders with correct naming
2. Add `README.md` in each module folder with phase info and TODO descriptions
3. Create placeholder entity files with basic structure
4. Add `.gitkeep` files to preserve empty directories

**Example Module README**:
```markdown
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
- POST /progress/levels/:id/start
- POST /progress/questions/:id/answer
- POST /progress/levels/:id/complete
- GET /progress/me

## Database Tables
- student_level_attempts
- student_question_answers
- student_unit_progress
- student_chapter_progress

## Implementation Order
1. Create all 4 entity files with TypeORM decorators
2. Create DTOs with class-validator decorators
3. Implement progress.service.ts (business logic)
4. Create progress.controller.ts (API endpoints)
5. Add to app.module.ts imports
6. Test with Postman/Insomnia

## Testing Checklist
- [ ] Unit tests for service methods
- [ ] Integration tests for controllers
- [ ] E2E tests for full level completion flow
- [ ] Performance test with concurrent attempts
```

**Deliverable**: Complete NestJS module structure with placeholders and documentation.

---

### **DAY 2: NestJS Configuration & Environment Setup**
**Duration**: 8 hours

#### Morning (4 hours): Configuration Files

**1. Environment Configuration**

**File**: `.env.example`
```env
# Environment
NODE_ENV=development

# Server
PORT=4000
API_PREFIX=api/v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=story_quest_db
DB_SYNC=false
DB_LOGGING=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-chars
JWT_EXPIRES_IN=90d
JWT_REFRESH_EXPIRES_IN=7d

# Redis (PHASE 6 - TODO)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OpenAI (PHASE 5 - TODO)
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-mini

# Google Cloud (PHASE 3 - TODO)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_TTS_API_KEY=your-tts-key
GOOGLE_CLOUD_SPEECH_API_KEY=your-speech-key

# AWS S3 (PHASE 3 - TODO)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=story-quest-assets
AWS_REGION=us-east-1

# Sentry (PHASE 6 - TODO)
SENTRY_DSN=your-sentry-dsn

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

**2. TypeORM Configuration**

**File**: `src/config/database.config.ts`
```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get<boolean>('DB_SYNC', false),
  logging: configService.get<boolean>('DB_LOGGING', false),
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsRun: false,
});
```

**3. Docker Setup**

**File**: `docker-compose.dev.yml`
```yaml
version: '3.8'

services:
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

  redis:
    image: redis:7-alpine
    container_name: story_quest_redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    networks:
      - story_quest_network

volumes:
  postgres_data:
  redis_data:

networks:
  story_quest_network:
    driver: bridge
```

**Deliverable**: All configuration files ready for development.

---

#### Afternoon (4 hours): Testing & Documentation Setup

**1. Testing Configuration**

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

**File**: `test/app.e2e-spec.ts`
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET) - Health check', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200);
  });

  // TODO: Add more E2E tests for each phase
});
```

**2. Root README**

**File**: `README.md`
```markdown
# Story Quest - NestJS Backend API

English learning platform backend for Vietnamese students (Grades 3-5, ages 8-11).

## 🎯 Multi-Client Architecture

This backend serves **TWO client types**:
1. **Flutter Mobile App** (Student role) - PRIMARY FOCUS
2. **React Web Dashboard** (4 admin roles: Agency, Center, Teacher, Reviewer)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (optional, for Phase 6)
- Docker & Docker Compose (recommended)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database credentials

# Start database with Docker
docker-compose -f docker-compose.dev.yml up -d postgres

# Run migrations
npm run typeorm migration:run

# Start development server
npm run start:dev
```

### Docker Setup (Recommended)

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## 📊 Project Status

| Phase | Status | Priority | Timeline |
|-------|--------|----------|----------|
| Phase 1: Foundation | 🔲 Not Started | HIGH | Weeks 1-2 |
| Phase 2: Learning | 🔲 Not Started | HIGH | Weeks 3-5 |
| Phase 3: Audio/Speech | 🔲 Not Started | HIGH | Weeks 6-7 |
| Phase 4: Gamification | 🔲 Not Started | MEDIUM | Week 8 |
| Phase 5: AI Stories | 🔲 Not Started | MEDIUM | Weeks 9-11 |
| Phase 6: Polish | 🔲 Not Started | LOW | Week 12 |
| Phase 7: Web Dashboard | 🔲 Not Started | LOW | Weeks 13-20 |

## 📚 Documentation

- [Implementation Roadmap](./docs/IMPLEMENTATION_ROADMAP.md) - Complete phase-by-phase plan
- [API Design Guidelines](./docs/API_DESIGN_GUIDELINES.md) - API standards
- [Authentication Guide](./docs/AUTH_README.md) - JWT auth details
- [Database Schema](./docs/DATABASE_SCHEMA.md) - All 32 tables
- [Project Structure](./docs/PROJECT_STRUCTURE.md) - Folder organization

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 API Documentation

Once the server is running:
- **Swagger UI**: http://localhost:4000/api/docs
- **Swagger JSON**: http://localhost:4000/api/docs-json

## 🗄️ Database

### Migrations

```bash
# Generate migration
npm run typeorm migration:generate src/database/migrations/MigrationName

# Run migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert

# Show migration status
npm run typeorm migration:show
```

### Schema Overview

**32 Tables Total**:
- **Phase 1**: 6 tables (users, chapters, units, levels, questions, answer_options)
- **Phase 2**: 4 tables (progress tracking)
- **Phase 3**: 2 tables (pronunciation & vocabulary)
- **Phase 4**: 4 tables (gamification)
- **Phase 5**: 5 tables (AI stories)
- **Phase 7**: 11 tables (web dashboard)

## 🔐 Authentication

- **JWT Strategy**: 90-day access tokens, 7-day refresh tokens
- **5 User Roles**: agency, center, teacher, reviewer, student
- **Role-Based Access Control (RBAC)**: Endpoint-level guards
- **COPPA Compliant**: Child-safe data handling

## 🎯 Key Principles

1. **Integer IDs**: All primary/foreign keys use auto-increment integers (NOT UUIDs)
2. **Security First**: Children's education platform - prioritize security & privacy
3. **Clean Architecture**: Controllers → Services → Repositories pattern
4. **API Consistency**: RESTful conventions, unified response formats
5. **Performance**: Query optimization, caching (Phase 6), rate limiting

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Check documentation in `/docs` folder
- Review Swagger API documentation

## 📄 License

MIT

---

**Last Updated**: 2025-01-19
**Version**: 1.0.0
**Status**: ✅ Week 1 Complete - Ready for Phase 1 Implementation
```

**Deliverable**: Complete testing setup and comprehensive documentation.

---

### **DAY 3: Flutter & React Minimal Initialization**
**Duration**: 8 hours

#### Morning (4 hours): Flutter Basic Setup

**Purpose**: Initialize Flutter project with minimal structure. Full implementation happens in Phase 1.

```bash
# Create Flutter project
flutter create story_quest_mobile --org com.storyquest
cd story_quest_mobile
```

**Add Core Dependencies Only**:

**File**: `pubspec.yaml`
```yaml
name: story_quest_mobile
description: English learning app for Vietnamese students
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.5

  # Network
  dio: ^5.4.3+1

  # Storage
  flutter_secure_storage: ^9.2.2
  hive_ce: ^2.6.0
  hive_ce_flutter: ^2.1.0

  # Navigation
  go_router: ^14.1.4

  # Serialization
  freezed_annotation: ^2.4.1
  json_annotation: ^4.9.0

dev_dependencies:
  flutter_test:
    sdk: flutter

  build_runner: ^2.4.9
  riverpod_generator: ^2.4.0
  freezed: ^2.5.2
  json_serializable: ^6.8.0
  hive_ce_generator: ^1.6.0
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
```

**Minimal Folder Structure**:
```
lib/
├── app/
│   └── app.dart
├── core/
│   ├── constants/
│   │   └── api_endpoints.dart
│   └── theme/
│       └── app_theme.dart
├── features/
│   └── auth/
│       └── README.md (TODO: Phase 1)
└── main.dart
```

**File**: `lib/core/constants/api_endpoints.dart`
```dart
class ApiEndpoints {
  // TODO: Phase 1 - Update with production URL
  static const String baseUrl = 'http://localhost:4000/api/v1';

  // Auth endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refresh = '/auth/refresh';
  static const String me = '/auth/me';
}
```

**File**: `lib/main.dart`
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  runApp(
    const ProviderScope(
      child: StoryQuestApp(),
    ),
  );
}

class StoryQuestApp extends StatelessWidget {
  const StoryQuestApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Story Quest',
      theme: ThemeData(
        primaryColor: const Color(0xFF1EA896),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1EA896),
        ),
        useMaterial3: true,
      ),
      home: Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.book,
                size: 100,
                color: Color(0xFF1EA896),
              ),
              const SizedBox(height: 24),
              const Text(
                'Story Quest',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1EA896),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Phase 1 - Coming Soon',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

**Deliverable**: Flutter project initialized, runs successfully with placeholder screen.

---

#### Afternoon (4 hours): React Basic Setup

**Purpose**: Initialize React project with minimal structure. Full implementation happens in Phase 7.

```bash
# Create React project
npm create vite@latest story_quest_web -- --template react-ts
cd story_quest_web
```

**Add Core Dependencies Only**:

**File**: `package.json`
```json
{
  "name": "story-quest-web",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.24.1",
    "axios": "^1.7.2",
    "antd": "^5.19.1",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.3.3"
  }
}
```

**Minimal Folder Structure**:
```
src/
├── config/
│   └── constants.ts
├── pages/
│   └── LoginPage.tsx
├── App.tsx
└── main.tsx
```

**File**: `src/config/constants.ts`
```typescript
export const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:4000/api/v1'
  : 'https://api.storyquest.com/api/v1';

export const APP_NAME = 'Story Quest Dashboard';
```

**File**: `src/pages/LoginPage.tsx`
```typescript
import React from 'react';

export const LoginPage: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <h1 style={{ fontSize: '48px', color: '#1EA896' }}>
        Story Quest Dashboard
      </h1>
      <p style={{ fontSize: '18px', color: '#666' }}>
        Phase 7 - Coming Soon
      </p>
      <p style={{ fontSize: '14px', color: '#999' }}>
        Multi-role admin panel for Agency, Center, Teacher, and Reviewer roles
      </p>
    </div>
  );
};
```

**File**: `src/App.tsx`
```typescript
import { LoginPage } from './pages/LoginPage';

function App() {
  return <LoginPage />;
}

export default App;
```

**Deliverable**: React project initialized, runs successfully with placeholder screen.

---

### **DAY 4: CI/CD & Git Setup**
**Duration**: 8 hours

#### Morning (4 hours): Git Repository Setup

**1. Create `.gitignore`**

**File**: `.gitignore`
```
# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/
out/

# Environment variables
.env
.env.local
.env.production

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
coverage/
.nyc_output/

# TypeORM
ormconfig.json

# Docker
docker-compose.override.yml
```

**2. Initialize Git**

```bash
# In NestJS root
git init
git add .
git commit -m "Initial commit: NestJS backend with complete database schema"

# Create GitHub repository (via web UI)
# Then connect local to remote
git remote add origin https://github.com/yourusername/story-quest-backend.git
git branch -M main
git push -u origin main
```

**3. Create Branches**

```bash
# Create development branch
git checkout -b develop

# Create phase branches
git checkout -b phase-1-foundation
git checkout -b phase-2-learning
git checkout -b phase-3-audio
git checkout -b phase-4-gamification
git checkout -b phase-5-ai-stories
git checkout -b phase-6-polish
git checkout -b phase-7-web-dashboard

# Return to main
git checkout main
```

**Deliverable**: Git repository initialized with branching strategy.

---

#### Afternoon (4 hours): GitHub Actions CI/CD

**File**: `.github/workflows/ci.yml`
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop, 'phase-*']
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: story_quest_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test

      - name: Run e2e tests
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USERNAME: postgres
          DB_PASSWORD: postgres
          DB_DATABASE: story_quest_test
          JWT_SECRET: test-secret-key-for-ci-pipeline
        run: npm run test:e2e

      - name: Build application
        run: npm run build

  build-docker:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker image
        run: docker build -t story-quest-api:${{ github.sha }} .
```

**File**: `Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY .. .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/main"]
```

**Deliverable**: CI/CD pipeline configured and tested.

---

### **DAY 5: Final Documentation & Testing**
**Duration**: 8 hours

#### Morning (4 hours): Create Comprehensive Documentation

**1. Database Schema Documentation**

**File**: `docs/DATABASE_SCHEMA.md`
```markdown
# Database Schema Documentation

## Overview
Complete database schema for Story Quest with 32 tables across 7 phases.

## Primary Key Convention
**CRITICAL**: All tables use **INTEGER (auto-increment)** primary keys, NOT UUID.

```sql
id SERIAL PRIMARY KEY  -- PostgreSQL auto-increment
```

## Phase Breakdown

### Phase 1: Core Foundation (6 tables)
[Detailed table schemas...]

### Phase 2: Progress Tracking (4 tables)
[Detailed table schemas...]

[Continue for all phases...]

## Relationships Diagram
[ASCII or Mermaid diagram showing all relationships]

## Indexes
[List of all performance indexes]

## Constraints
[List of all data integrity constraints]
```

**2. API Endpoints Documentation Template**

**File**: `docs/API_ENDPOINTS_TEMPLATE.md`
```markdown
# API Endpoints Reference

## Authentication Endpoints

### POST /api/v1/auth/register
Register new student (mobile only)

**Request Body:**
```json
{
  "email": "student@example.com",
  "username": "student123",
  "password": "Password123!",
  "fullName": "Nguyễn Văn An",
  "phone": "0123456789",
  "dateOfBirth": "2015-06-15"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "email": "student@example.com",
    "username": "student123",
    "fullName": "Nguyễn Văn An",
    "role": "student",
    "isActive": true
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

[Continue with all endpoints...]
```

**3. Implementation Checklist**

**File**: `docs/IMPLEMENTATION_CHECKLIST.md`
```markdown
# Implementation Checklist

## Week 1: Preparation ✅
- [x] Database schema created (32 tables)
- [x] NestJS module structure scaffolded
- [x] Flutter project initialized
- [x] React project initialized
- [x] Git repository set up
- [x] CI/CD pipeline configured
- [x] Documentation complete

## Phase 1: Foundation (Weeks 1-2) 🔲
### Backend
- [ ] User entity with STUDENT role
- [ ] Auth module (register, login, refresh, me)
- [ ] JWT strategy and guards
- [ ] Chapters CRUD API
- [ ] Units CRUD API
- [ ] Levels CRUD API
- [ ] Questions CRUD API
- [ ] Swagger documentation

### Flutter
- [ ] Auth screens (login, register)
- [ ] Token storage (secure)
- [ ] API client setup (Dio)
- [ ] Chapters list screen
- [ ] Units list screen
- [ ] Levels list screen
- [ ] Question viewer (basic)

[Continue for all phases...]
```

**Deliverable**: Complete documentation suite ready.

---

#### Afternoon (4 hours): End-to-End Testing

**Test all setups:**

```bash
# 1. Test NestJS backend
cd nestjs
docker-compose -f docker-compose.dev.yml up -d
npm run start:dev
# Should start successfully on http://localhost:4000

# 2. Test database connection
npm run typeorm migration:show
# Should show migration status

# 3. Test Flutter
cd ../story_quest_mobile
flutter doctor
flutter run
# Should show placeholder screen

# 4. Test React
cd ../story_quest_web
npm run dev
# Should start on http://localhost:5173

# 5. Test CI/CD
# Make a commit and push to trigger GitHub Actions
git add .
git commit -m "Week 1 complete: All scaffolding ready"
git push origin main
# Check GitHub Actions tab for build status
```

**Deliverable**: All systems tested and working.

---

## 🎯 End of Week 1 Deliverables

### ✅ Checklist

#### NestJS Backend ✅
- [x] Complete database schema (32 tables) created and migrated
- [x] All module folders scaffolded with README files
- [x] Entity files created with basic TypeORM structure
- [x] Environment configuration files ready
- [x] Docker setup complete (PostgreSQL + Redis)
- [x] Testing framework configured
- [x] Swagger setup ready
- [x] Git repository initialized
- [x] CI/CD pipeline working
- [x] All TODOs marked with phase numbers

#### Flutter Mobile ✅
- [x] Project initialized with core dependencies
- [x] Minimal folder structure created
- [x] API endpoints configured
- [x] Theme setup ready
- [x] Runs successfully with placeholder
- [x] Git repository initialized

#### React Web ✅
- [x] Project initialized with Vite + TypeScript
- [x] Core dependencies added
- [x] Minimal folder structure created
- [x] API configuration ready
- [x] Runs successfully with placeholder
- [x] Git repository initialized

#### Documentation ✅
- [x] Complete implementation roadmap
- [x] Week 1 preparation plan
- [x] Database schema documentation
- [x] API endpoints template
- [x] Implementation checklist
- [x] Testing guide
- [x] README files in all modules

---

## 📅 What Happens After Week 1?

### Week 2 Onwards: Phase-by-Phase Implementation

Follow the **IMPLEMENTATION_ROADMAP.md** to implement each phase:

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

✅ **Complete NestJS foundation** with all 32 database tables
✅ **All module placeholders** with clear TODO markers
✅ **Flutter & React** initialized and ready for implementation
✅ **Complete documentation** for all phases
✅ **Working CI/CD pipeline** for automated testing
✅ **Git branching strategy** for organized development
✅ **Clear roadmap** to follow step-by-step

**You can immediately start Phase 1 implementation!**

---

**Key Success Factors**:
- 🎯 **Focus on NestJS first** - Both clients depend on the API
- 📋 **Database schema complete upfront** - No schema changes mid-phase
- 📝 **Documentation as you go** - README in every module
- 🔄 **Test continuously** - Don't skip CI/CD setup
- 🚀 **Iterate quickly** - Phase 1 starts right after Week 1

---

**Next Steps**: Start implementing **Phase 1 (Auth + Content Browsing)** following the detailed steps in `IMPLEMENTATION_ROADMAP.md`.

---

**Last Updated**: 2025-01-19
**Version**: 2.0
**Status**: ✅ Ready for Implementation
