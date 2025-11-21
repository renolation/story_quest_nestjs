# Week 3: Advanced Features & Performance Optimization

**Date**: 2025-11-25 to 2025-11-29
**Duration**: 5 days (40 hours)
**Focus**: Phase 3-4 Features + Performance + Production Readiness
**Goal**: Implement pronunciation, vocabulary, gamification modules + Redis caching + performance optimization

> **⚠️ ARCHITECTURE UPDATE (2025-11-21):**
>
> **Speech/Pronunciation Implementation Changed:**
> - ❌ ~~Server-side TTS (Google Cloud TTS)~~ - **REMOVED**
> - ❌ ~~Server-side Speech Recognition API~~ - **REMOVED**
> - ✅ **Client-side speech-to-text comparison** - Mobile app handles speech recognition
> - ✅ **Backend provides reference text only** - For client-side comparison
>
> **What this means:**
> - Backend stores reference text for pronunciation questions
> - Mobile app (Flutter) handles speech capture and comparison
> - No external TTS/Speech Recognition API integration needed
> - Pronunciation module simplified to text delivery only

---

## 🎯 Week 3 Overview

Building on Week 2's solid Phase 1 implementation (Auth, Content Management, Progress Tracking with 400+ tests), Week 3 expands the backend with **advanced features** and **performance optimizations** to prepare for production deployment.

### What We Have (Week 1-2)
- ✅ **Week 1**: Complete structure (19 modules, 32 tables, seeded data)
- ✅ **Week 2**: Phase 1 implementation (Auth, Chapters, Units, Levels, Questions, Progress)
- ✅ 400+ tests passing, 0 TypeScript errors
- ✅ Complete Swagger documentation
- ✅ 30+ API endpoints fully functional

### Week 3 Objectives
By end of Week 3, you will have:
1. **Pronunciation Module** - Reference text delivery for client-side speech comparison
2. ~~**Vocabulary Module**~~ - ❌ **REMOVED** (not needed - vocabulary managed in questions)
3. **Gamification Module** - Achievements, points, badges, leaderboards
4. **Redis Caching** - Performance optimization for content APIs
5. **Rate Limiting** - API protection and throttling
6. **Performance Optimization** - Query optimization, indexing, N+1 prevention
7. **Production Readiness** - Docker, CI/CD, monitoring setup

---

## 📅 Day-by-Day Breakdown

### **Day 1 (Monday): Pronunciation Module** 🎤
**Duration**: 8 hours | **Priority**: HIGH

#### Morning (4 hours): Core Pronunciation Features

**Task 1.1: Pronunciation Service Implementation (120 min)**

Complete `src/modules/pronunciation/pronunciation.service.ts`:

```typescript
// Key methods to implement:
async createPronunciationAttempt(dto: CreatePronunciationAttemptDto): Promise<PronunciationAttempt>
async evaluatePronunciation(attemptId: number, audioUrl: string): Promise<PronunciationResult>
async getPronunciationHistory(userId: number, levelId?: number): Promise<PronunciationAttempt[]>
async getBestPronunciationScore(userId: number, questionId: number): Promise<number>
async getTextToSpeech(text: string, voice?: string): Promise<TTSResponse>
```

**Integration Requirements:**
- **Google Cloud TTS API** for text-to-speech generation
- **Speech Recognition API** for pronunciation scoring
- Audio file storage (AWS S3 or Cloudflare R2)
- Pronunciation scoring algorithm (0-100)
- Support multiple voices (male, female, child)
- Handle audio format conversion (webm → mp3)

**Task 1.2: Pronunciation Entity & DTOs (60 min)**

Update `pronunciation-attempt.entity.ts`:
```typescript
@Entity('pronunciation_attempts')
export class PronunciationAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ name: 'question_id' })
  questionId: number;

  @Column({ name: 'audio_url', nullable: true })
  audioUrl: string;

  @Column({ name: 'reference_text' })
  referenceText: string;

  @Column({ name: 'recognized_text', nullable: true })
  recognizedText: string;

  @Column({ name: 'pronunciation_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  pronunciationScore: number;

  @Column({ name: 'accuracy_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  accuracyScore: number;

  @Column({ name: 'fluency_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  fluencyScore: number;

  @Column({ name: 'completeness_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  completenessScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

Create DTOs:
- `CreatePronunciationAttemptDto`
- `EvaluatePronunciationDto`
- `PronunciationResultDto`
- `TTSRequestDto`
- `TTSResponseDto`

**Task 1.3: External API Integration (60 min)**

Create `src/common/services/tts.service.ts`:
```typescript
@Injectable()
export class TTSService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async generateSpeech(text: string, voice: string = 'en-US-Neural2-F'): Promise<string> {
    // Google Cloud TTS API integration
    // Return audio URL
  }

  async recognizeSpeech(audioUrl: string, referenceText: string): Promise<SpeechRecognitionResult> {
    // Google Speech-to-Text API integration
    // Return recognized text + pronunciation scores
  }
}
```

---

#### Afternoon (4 hours): Pronunciation API & Testing

**Task 1.4: Pronunciation Controller (90 min)**

Complete `src/modules/pronunciation/pronunciation.controller.ts`:

```typescript
@Controller('pronunciation')
@UseGuards(JwtAuthGuard)
@ApiTags('Pronunciation')
export class PronunciationController {
  @Post('attempts')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Create pronunciation attempt' })
  async createAttempt(
    @Body() dto: CreatePronunciationAttemptDto,
    @CurrentUser() user: User,
  ): Promise<PronunciationAttempt>

  @Post('evaluate/:id')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Evaluate pronunciation attempt with audio' })
  async evaluateAttempt(
    @Param('id', ParseIntPipe) attemptId: number,
    @Body() dto: EvaluatePronunciationDto,
    @CurrentUser() user: User,
  ): Promise<PronunciationResult>

  @Get('history')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get pronunciation history' })
  async getHistory(
    @CurrentUser() user: User,
    @Query('levelId', ParseIntPipe) levelId?: number,
  ): Promise<PronunciationAttempt[]>

  @Get('best-score/:questionId')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get best pronunciation score for question' })
  async getBestScore(
    @Param('questionId', ParseIntPipe) questionId: number,
    @CurrentUser() user: User,
  ): Promise<BestScoreResponse>

  @Post('tts')
  @ApiOperation({ summary: 'Generate text-to-speech audio' })
  async generateTTS(
    @Body() dto: TTSRequestDto,
  ): Promise<TTSResponse>
}
```

**Task 1.5: Pronunciation Tests (90 min)**

Create comprehensive tests:

**Unit Tests** (`pronunciation.service.spec.ts`):
- Create pronunciation attempt
- Evaluate pronunciation with scoring
- Get pronunciation history
- Best score calculation
- TTS generation
- Speech recognition

**E2E Tests** (`pronunciation.e2e-spec.ts`):
- Complete pronunciation flow (create → evaluate → check results)
- TTS generation for various texts
- History retrieval with filters
- Role-based access (students only)

**Task 1.6: REST Client Tests (60 min)**

Create `api-tests/pronunciation.http`:
```http
### Create Pronunciation Attempt
POST {{baseUrl}}/pronunciation/attempts
Authorization: Bearer {{studentToken}}
Content-Type: application/json

{
  "questionId": 1,
  "referenceText": "Hello, how are you?"
}

### Evaluate Pronunciation
POST {{baseUrl}}/pronunciation/evaluate/1
Authorization: Bearer {{studentToken}}
Content-Type: application/json

{
  "audioUrl": "https://storage.example.com/audio/recording.webm"
}

### Get Pronunciation History
GET {{baseUrl}}/pronunciation/history?levelId=1
Authorization: Bearer {{studentToken}}

### Generate TTS
POST {{baseUrl}}/pronunciation/tts
Authorization: Bearer {{studentToken}}
Content-Type: application/json

{
  "text": "Hello, how are you?",
  "voice": "en-US-Neural2-F"
}
```

---

### **Day 2 (Tuesday): Vocabulary Module** 📚
**Duration**: 8 hours | **Priority**: MEDIUM

#### Morning (4 hours): Vocabulary Features

**Task 2.1: Vocabulary Service Implementation (120 min)**

Complete `src/modules/vocabulary/vocabulary.service.ts`:

```typescript
async createVocabularyWord(dto: CreateVocabularyWordDto): Promise<VocabularyWord>
async findAll(filters: VocabularyFilterDto): Promise<PaginatedResponse<VocabularyWord>>
async findById(id: number): Promise<VocabularyWord>
async findByChapterId(chapterId: number): Promise<VocabularyWord[]>
async findByUnitId(unitId: number): Promise<VocabularyWord[]>
async update(id: number, dto: UpdateVocabularyWordDto): Promise<VocabularyWord>
async delete(id: number): Promise<void>
async generateAudioForWord(wordId: number): Promise<string>
async getUserVocabularyProgress(userId: number): Promise<VocabularyProgressSummary>
async markWordAsLearned(userId: number, wordId: number): Promise<void>
```

**Features:**
- Support multiple word categories (noun, verb, adjective, etc.)
- Difficulty levels (beginner, intermediate, advanced)
- Audio URL generation via TTS
- Example sentences with translations
- Image URLs for visual learning
- User-specific vocabulary tracking (learned/unlearned)

**Task 2.2: Vocabulary Entity & DTOs (60 min)**

Update `vocabulary-word.entity.ts`:
```typescript
@Entity('vocabulary_words')
export class VocabularyWord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  word: string;

  @Column()
  translation: string; // Vietnamese translation

  @Column({ type: 'enum', enum: WordCategory })
  category: WordCategory;

  @Column({ type: 'enum', enum: DifficultyLevel })
  difficulty: DifficultyLevel;

  @Column({ name: 'phonetic_spelling', nullable: true })
  phoneticSpelling: string;

  @Column({ name: 'audio_url', nullable: true })
  audioUrl: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'example_sentence', nullable: true })
  exampleSentence: string;

  @Column({ name: 'example_translation', nullable: true })
  exampleTranslation: string;

  @ManyToOne(() => Chapter, { nullable: true })
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapter;

  @Column({ name: 'chapter_id', nullable: true })
  chapterId: number;

  @ManyToOne(() => Unit, { nullable: true })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column({ name: 'unit_id', nullable: true })
  unitId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

Create enums:
```typescript
export enum WordCategory {
  NOUN = 'noun',
  VERB = 'verb',
  ADJECTIVE = 'adjective',
  ADVERB = 'adverb',
  PRONOUN = 'pronoun',
  PREPOSITION = 'preposition',
  CONJUNCTION = 'conjunction',
  INTERJECTION = 'interjection',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}
```

**Task 2.3: User Vocabulary Progress Tracking (60 min)**

Create `user-vocabulary-progress.entity.ts`:
```typescript
@Entity('user_vocabulary_progress')
export class UserVocabularyProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => VocabularyWord)
  @JoinColumn({ name: 'word_id' })
  word: VocabularyWord;

  @Column({ name: 'word_id' })
  wordId: number;

  @Column({ name: 'is_learned', default: false })
  isLearned: boolean;

  @Column({ name: 'times_practiced', default: 0 })
  timesPracticed: number;

  @Column({ name: 'last_practiced_at', nullable: true })
  lastPracticedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

---

#### Afternoon (4 hours): Vocabulary API & Testing

**Task 2.4: Vocabulary Controller (90 min)**

Complete `src/modules/vocabulary/vocabulary.controller.ts`:

```typescript
@Controller('vocabulary')
@UseGuards(JwtAuthGuard)
@ApiTags('Vocabulary')
export class VocabularyController {
  @Get()
  @ApiOperation({ summary: 'Get all vocabulary words with filters' })
  async findAll(
    @Query() filters: VocabularyFilterDto,
  ): Promise<PaginatedResponse<VocabularyWord>>

  @Get(':id')
  @ApiOperation({ summary: 'Get vocabulary word by ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VocabularyWord>

  @Get('chapter/:chapterId')
  @ApiOperation({ summary: 'Get vocabulary by chapter' })
  async findByChapter(
    @Param('chapterId', ParseIntPipe) chapterId: number,
  ): Promise<VocabularyWord[]>

  @Get('unit/:unitId')
  @ApiOperation({ summary: 'Get vocabulary by unit' })
  async findByUnit(
    @Param('unitId', ParseIntPipe) unitId: number,
  ): Promise<VocabularyWord[]>

  @Post()
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  @ApiOperation({ summary: 'Create vocabulary word' })
  async create(
    @Body() dto: CreateVocabularyWordDto,
  ): Promise<VocabularyWord>

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  @ApiOperation({ summary: 'Update vocabulary word' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVocabularyWordDto,
  ): Promise<VocabularyWord>

  @Delete(':id')
  @Roles(UserRole.AGENCY)
  @ApiOperation({ summary: 'Delete vocabulary word' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MessageResponse>

  @Post(':id/generate-audio')
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  @ApiOperation({ summary: 'Generate TTS audio for word' })
  async generateAudio(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AudioGenerationResponse>

  @Get('user/progress')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get user vocabulary progress' })
  async getUserProgress(
    @CurrentUser() user: User,
  ): Promise<VocabularyProgressSummary>

  @Post(':id/mark-learned')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Mark word as learned' })
  async markAsLearned(
    @Param('id', ParseIntPipe) wordId: number,
    @CurrentUser() user: User,
  ): Promise<MessageResponse>
}
```

**Task 2.5: Vocabulary Tests (90 min)**

**Unit Tests** (`vocabulary.service.spec.ts`):
- CRUD operations
- Filtering by chapter/unit
- Audio generation
- User progress tracking
- Mark word as learned

**E2E Tests** (`vocabulary.e2e-spec.ts`):
- Get vocabulary by chapter
- Filter by difficulty/category
- Mark words as learned
- Progress tracking
- Role-based access

**Task 2.6: Vocabulary Seeder (60 min)**

Create `src/database/seeds/vocabulary-seeder.ts`:
- Seed 200+ vocabulary words
- Distribute across all chapters
- Include translations, phonetics, examples
- Generate audio URLs via TTS
- Realistic difficulty distribution

---

### **Day 3 (Wednesday): Gamification Module** 🏆
**Duration**: 8 hours | **Priority**: HIGH

#### Morning (4 hours): Achievements & Points System

**Task 3.1: Gamification Service Implementation (120 min)**

Complete `src/modules/gamification/gamification.service.ts`:

```typescript
// Achievements
async createAchievement(dto: CreateAchievementDto): Promise<Achievement>
async findAllAchievements(): Promise<Achievement[]>
async getUserAchievements(userId: number): Promise<UserAchievementResponse[]>
async unlockAchievement(userId: number, achievementId: number): Promise<StudentAchievement>
async checkAndUnlockAchievements(userId: number): Promise<Achievement[]>

// Points & Streaks
async getStudentPoints(userId: number): Promise<StudentPoints>
async addPoints(userId: number, points: number, reason: string): Promise<StudentPoints>
async updateStreak(userId: number): Promise<StudentPoints>
async resetStreak(userId: number): Promise<void>

// Leaderboards
async getGlobalLeaderboard(limit: number): Promise<LeaderboardEntry[]>
async getChapterLeaderboard(chapterId: number, limit: number): Promise<LeaderboardEntry[]>
async getUserRank(userId: number): Promise<RankResponse>

// Daily Goals
async getDailyGoals(userId: number): Promise<DailyGoal[]>
async updateDailyGoalProgress(userId: number, goalType: GoalType, progress: number): Promise<void>
async checkDailyGoalsCompletion(userId: number): Promise<DailyGoal[]>
```

**Features:**
- Achievement system with categories (first_login, complete_10_levels, perfect_score, etc.)
- Points tracking with history
- Streak tracking (daily login streak, practice streak)
- Global and chapter-specific leaderboards
- Daily goals with automatic reset
- Achievement unlocking based on triggers

**Task 3.2: Gamification Entities & DTOs (60 min)**

Update entities:

**Achievement Entity:**
```typescript
@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ name: 'icon_url' })
  iconUrl: string;

  @Column({ name: 'points_reward' })
  pointsReward: number;

  @Column({ type: 'enum', enum: AchievementCategory })
  category: AchievementCategory;

  @Column({ type: 'enum', enum: AchievementTrigger })
  trigger: AchievementTrigger;

  @Column({ name: 'trigger_threshold' })
  triggerThreshold: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

**Student Points Entity:**
```typescript
@Entity('student_points')
export class StudentPoints {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'student_id', unique: true })
  studentId: number;

  @Column({ name: 'total_points', default: 0 })
  totalPoints: number;

  @Column({ name: 'current_streak', default: 0 })
  currentStreak: number;

  @Column({ name: 'longest_streak', default: 0 })
  longestStreak: number;

  @Column({ name: 'last_activity_date', nullable: true })
  lastActivityDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

Create enums:
```typescript
export enum AchievementCategory {
  LEARNING = 'learning',
  SOCIAL = 'social',
  STREAK = 'streak',
  MASTERY = 'mastery',
  MILESTONE = 'milestone',
}

export enum AchievementTrigger {
  COMPLETE_LEVELS = 'complete_levels',
  PERFECT_SCORE = 'perfect_score',
  DAILY_STREAK = 'daily_streak',
  TOTAL_POINTS = 'total_points',
  CHAPTER_COMPLETE = 'chapter_complete',
}

export enum GoalType {
  COMPLETE_LEVELS = 'complete_levels',
  EARN_POINTS = 'earn_points',
  PRACTICE_PRONUNCIATION = 'practice_pronunciation',
  LEARN_VOCABULARY = 'learn_vocabulary',
}
```

**Task 3.3: Gamification Event System (60 min)**

Create event-driven achievement unlocking:

```typescript
// src/modules/gamification/events/gamification.events.ts
export class LevelCompletedEvent {
  constructor(
    public readonly userId: number,
    public readonly levelId: number,
    public readonly score: number,
    public readonly isPerfect: boolean,
  ) {}
}

export class ChapterCompletedEvent {
  constructor(
    public readonly userId: number,
    public readonly chapterId: number,
  ) {}
}

// In progress.service.ts
this.eventEmitter.emit('level.completed', new LevelCompletedEvent(...));
```

---

#### Afternoon (4 hours): Gamification API & Testing

**Task 3.4: Gamification Controller (90 min)**

Complete `src/modules/gamification/gamification.controller.ts`:

```typescript
@Controller('gamification')
@UseGuards(JwtAuthGuard)
@ApiTags('Gamification')
export class GamificationController {
  // Achievements
  @Get('achievements')
  @ApiOperation({ summary: 'Get all available achievements' })
  async getAllAchievements(): Promise<Achievement[]>

  @Get('achievements/me')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get user achievements' })
  async getUserAchievements(
    @CurrentUser() user: User,
  ): Promise<UserAchievementResponse[]>

  // Points & Streaks
  @Get('points/me')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get user points and streak' })
  async getMyPoints(
    @CurrentUser() user: User,
  ): Promise<StudentPoints>

  // Leaderboards
  @Get('leaderboard/global')
  @ApiOperation({ summary: 'Get global leaderboard' })
  async getGlobalLeaderboard(
    @Query('limit', ParseIntPipe) limit: number = 50,
  ): Promise<LeaderboardEntry[]>

  @Get('leaderboard/chapter/:chapterId')
  @ApiOperation({ summary: 'Get chapter leaderboard' })
  async getChapterLeaderboard(
    @Param('chapterId', ParseIntPipe) chapterId: number,
    @Query('limit', ParseIntPipe) limit: number = 50,
  ): Promise<LeaderboardEntry[]>

  @Get('rank/me')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get user rank' })
  async getMyRank(
    @CurrentUser() user: User,
  ): Promise<RankResponse>

  // Daily Goals
  @Get('goals/daily')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get daily goals' })
  async getDailyGoals(
    @CurrentUser() user: User,
  ): Promise<DailyGoal[]>

  // Admin
  @Post('achievements')
  @Roles(UserRole.AGENCY)
  @ApiOperation({ summary: 'Create achievement' })
  async createAchievement(
    @Body() dto: CreateAchievementDto,
  ): Promise<Achievement>
}
```

**Task 3.5: Gamification Tests (90 min)**

**Unit Tests** (`gamification.service.spec.ts`):
- Achievement creation
- Points calculation
- Streak tracking (daily login)
- Leaderboard generation
- Achievement unlocking logic
- Daily goals reset

**E2E Tests** (`gamification.e2e-spec.ts`):
- Complete level → unlock achievements
- Check leaderboard updates
- Verify points awarded
- Test streak tracking
- Daily goals completion

**Task 3.6: Achievement Seeder (60 min)**

Create achievement definitions:
- First Login (5 points)
- Complete 10 Levels (50 points)
- Complete First Chapter (100 points)
- 7-Day Streak (200 points)
- Perfect Score (25 points)
- 1000 Total Points (150 points)
- 30+ more achievements

---

### **Day 4 (Thursday): Redis Caching & Performance** ⚡
**Duration**: 8 hours | **Priority**: CRITICAL

#### Morning (4 hours): Redis Setup & Caching Strategy

**Task 4.1: Redis Configuration (60 min)**

**Install Dependencies:**
```bash
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store redis
npm install -D @types/cache-manager @types/cache-manager-redis-store
```

**Configure Redis Module:**

Create `src/config/redis.config.ts`:
```typescript
import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

export const redisConfig = (configService: ConfigService): CacheModuleOptions => ({
  store: redisStore,
  host: configService.get<string>('REDIS_HOST', 'localhost'),
  port: configService.get<number>('REDIS_PORT', 6379),
  password: configService.get<string>('REDIS_PASSWORD'),
  ttl: configService.get<number>('CACHE_TTL', 3600), // 1 hour default
  max: 100, // Max items in cache
});
```

Update `app.module.ts`:
```typescript
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: redisConfig,
      inject: [ConfigService],
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

**Task 4.2: Caching Strategy Implementation (120 min)**

**Create Cache Service:**

`src/common/services/cache.service.ts`:
```typescript
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Generic cache methods
  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, { ttl });
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  // Specific cache patterns
  getCacheKey(prefix: string, ...args: (string | number)[]): string {
    return `${prefix}:${args.join(':')}`;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    // Invalidate all keys matching pattern
  }
}
```

**Cache Keys Strategy:**
```typescript
// Content caching (long TTL: 1 hour)
'chapters:all' => All chapters
'chapters:{id}' => Single chapter
'units:chapter:{id}' => Units in chapter
'levels:unit:{id}' => Levels in unit
'questions:level:{id}' => Questions in level
'vocabulary:chapter:{id}' => Vocabulary by chapter

// User-specific (short TTL: 5 minutes)
'progress:user:{id}' => User progress summary
'achievements:user:{id}' => User achievements
'points:user:{id}' => User points

// Leaderboards (medium TTL: 15 minutes)
'leaderboard:global' => Global leaderboard
'leaderboard:chapter:{id}' => Chapter leaderboard
```

**Task 4.3: Implement Caching in Services (60 min)**

**Update Chapters Service:**
```typescript
@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter)
    private chaptersRepository: Repository<Chapter>,
    private cacheService: CacheService,
  ) {}

  async findAll(): Promise<Chapter[]> {
    const cacheKey = this.cacheService.getCacheKey('chapters', 'all');

    // Try cache first
    const cached = await this.cacheService.get<Chapter[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const chapters = await this.chaptersRepository.find({
      order: { orderIndex: 'ASC' },
    });

    // Store in cache (1 hour)
    await this.cacheService.set(cacheKey, chapters, 3600);

    return chapters;
  }

  async create(dto: CreateChapterDto): Promise<Chapter> {
    const chapter = await this.chaptersRepository.save(dto);

    // Invalidate cache
    await this.cacheService.del(this.cacheService.getCacheKey('chapters', 'all'));

    return chapter;
  }

  async update(id: number, dto: UpdateChapterDto): Promise<Chapter> {
    await this.chaptersRepository.update(id, dto);

    // Invalidate caches
    await this.cacheService.del(this.cacheService.getCacheKey('chapters', 'all'));
    await this.cacheService.del(this.cacheService.getCacheKey('chapters', id));

    return this.findById(id);
  }
}
```

**Apply caching to:**
- Chapters service
- Units service
- Levels service
- Questions service
- Vocabulary service
- Gamification service (leaderboards)

---

#### Afternoon (4 hours): Rate Limiting & Query Optimization

**Task 4.4: Rate Limiting Setup (90 min)**

**Install Dependencies:**
```bash
npm install @nestjs/throttler
```

**Configure Throttler:**

Update `app.module.ts`:
```typescript
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // 60 seconds
      limit: 100, // 100 requests per ttl
    }),
    // ... other modules
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

**Custom Rate Limiting:**

Create `src/common/guards/custom-throttler.guard.ts`:
```typescript
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Rate limit by user ID if authenticated
    if (req.user && req.user.id) {
      return `user:${req.user.id}`;
    }
    // Rate limit by IP if not authenticated
    return req.ip;
  }

  protected async getRateLimitConfig(context: ExecutionContext): Promise<{ ttl: number; limit: number }> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Different limits for different roles
    if (user?.role === UserRole.AGENCY) {
      return { ttl: 60, limit: 1000 }; // 1000 req/min for admins
    } else if (user?.role === UserRole.STUDENT) {
      return { ttl: 60, limit: 100 }; // 100 req/min for students
    }

    // Default for anonymous users
    return { ttl: 60, limit: 20 }; // 20 req/min
  }
}
```

**Apply rate limiting:**
```typescript
// Aggressive limiting for expensive operations
@Throttle(5, 60) // 5 requests per minute
@Post('pronunciation/evaluate/:id')
async evaluatePronunciation() {}

// Standard limiting for read operations
@Throttle(100, 60) // 100 requests per minute
@Get('chapters')
async getChapters() {}
```

**Task 4.5: Database Query Optimization (90 min)**

**Prevent N+1 Queries:**

Update services to use eager loading:
```typescript
// Bad: N+1 problem
async getChaptersWithUnits(): Promise<Chapter[]> {
  const chapters = await this.chaptersRepository.find();
  for (const chapter of chapters) {
    chapter.units = await this.unitsRepository.find({ where: { chapterId: chapter.id } });
  }
  return chapters;
}

// Good: Single query with join
async getChaptersWithUnits(): Promise<Chapter[]> {
  return await this.chaptersRepository.find({
    relations: ['units'],
    order: { orderIndex: 'ASC', units: { orderIndex: 'ASC' } },
  });
}
```

**Optimize Progress Queries:**
```typescript
// Use QueryBuilder for complex aggregations
async getStudentProgressSummary(userId: number): Promise<ProgressSummary> {
  const query = this.levelAttemptsRepository
    .createQueryBuilder('attempt')
    .select([
      'COUNT(DISTINCT attempt.levelId) as completedLevels',
      'AVG(attempt.score) as averageScore',
      'SUM(attempt.pointsEarned) as totalPoints',
    ])
    .where('attempt.studentId = :userId', { userId })
    .andWhere('attempt.isCompleted = :isCompleted', { isCompleted: true });

  return await query.getRawOne();
}
```

**Add Database Indexes:**

Create migration for indexes:
```typescript
// 1234567890-AddPerformanceIndexes.ts
export class AddPerformanceIndexes1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Index on foreign keys
    await queryRunner.createIndex('units', 'idx_units_chapter_id', ['chapter_id']);
    await queryRunner.createIndex('levels', 'idx_levels_unit_id', ['unit_id']);
    await queryRunner.createIndex('questions', 'idx_questions_level_id', ['level_id']);

    // Composite indexes for common queries
    await queryRunner.createIndex('student_level_attempts', 'idx_attempts_student_level', ['student_id', 'level_id']);
    await queryRunner.createIndex('student_points', 'idx_points_total', ['total_points']);

    // Index for ordering
    await queryRunner.createIndex('chapters', 'idx_chapters_order', ['order_index']);
    await queryRunner.createIndex('units', 'idx_units_order', ['chapter_id', 'order_index']);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
  }
}
```

**Task 4.6: Performance Testing (60 min)**

Create `test/performance.e2e-spec.ts`:
```typescript
describe('Performance Tests', () => {
  it('should load chapters list in <50ms', async () => {
    const start = Date.now();
    await request(app.getHttpServer())
      .get('/api/v1/chapters')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(50);
  });

  it('should handle 100 concurrent requests', async () => {
    const promises = Array.from({ length: 100 }, () =>
      request(app.getHttpServer())
        .get('/api/v1/chapters')
        .set('Authorization', `Bearer ${token}`)
    );
    const results = await Promise.all(promises);
    expect(results.every(r => r.status === 200)).toBe(true);
  });

  it('should utilize cache (second request faster)', async () => {
    // First request (no cache)
    const start1 = Date.now();
    await request(app.getHttpServer())
      .get('/api/v1/chapters')
      .set('Authorization', `Bearer ${token}`);
    const duration1 = Date.now() - start1;

    // Second request (with cache)
    const start2 = Date.now();
    await request(app.getHttpServer())
      .get('/api/v1/chapters')
      .set('Authorization', `Bearer ${token}`);
    const duration2 = Date.now() - start2;

    expect(duration2).toBeLessThan(duration1 / 2);
  });
});
```

---

### **Day 5 (Friday): Production Readiness & CI/CD** 🚀
**Duration**: 8 hours | **Priority**: HIGH

#### Morning (4 hours): Docker & Deployment

**Task 5.1: Docker Configuration (90 min)**

**Create `Dockerfile`:**
```dockerfile
# Multi-stage build for optimal image size
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/main.js"]
```

**Create `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=${DB_DATABASE}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${DB_USERNAME}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_DATABASE}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

**Create `.dockerignore`:**
```
node_modules
npm-debug.log
dist
.git
.gitignore
README.md
.env
.env.local
.env.*.local
coverage
.nyc_output
test
docs
```

**Task 5.2: CI/CD Pipeline Setup (90 min)**

**Create `.github/workflows/ci.yml`:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USERNAME: test
          DB_PASSWORD: test
          DB_DATABASE: test_db
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          JWT_SECRET: test-secret-key

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USERNAME: test
          DB_PASSWORD: test
          DB_DATABASE: test_db
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          JWT_SECRET: test-secret-key

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Build Docker image
        run: docker build -t story-quest-api:${{ github.sha }} .

      - name: Run Docker container test
        run: |
          docker run -d --name test-api story-quest-api:${{ github.sha }}
          sleep 10
          docker logs test-api

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to production
        run: echo "Deploy to production server"
        # Add deployment steps here
```

**Task 5.3: Environment Configuration (60 min)**

**Create `.env.example`:**
```bash
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=story_quest

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_TTL=3600

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=90d
REFRESH_TOKEN_EXPIRES_IN=7d

# External APIs
GOOGLE_CLOUD_TTS_API_KEY=your_google_cloud_api_key
GOOGLE_CLOUD_PROJECT_ID=your_project_id

# Storage
AWS_S3_BUCKET=story-quest-audio
AWS_S3_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Logging
LOG_LEVEL=info
SENTRY_DSN=
```

---

#### Afternoon (4 hours): Monitoring, Logging & Documentation

**Task 5.4: Monitoring & Health Checks (90 min)**

**Create Health Check Module:**

`src/modules/health/health.module.ts`:
```typescript
@Module({
  imports: [
    TerminusModule,
    HttpModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
```

`src/modules/health/health.controller.ts`:
```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      // Database health
      () => this.db.pingCheck('database'),

      // Redis health
      () => this.redis.checkHealth('redis', {
        type: 'redis',
        url: process.env.REDIS_URL,
      }),

      // Memory health
      () => this.health.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB

      // Disk health
      () => this.health.checkDisk('storage', {
        thresholdPercent: 0.9,
        path: '/',
      }),
    ]);
  }

  @Get('liveness')
  @HealthCheck()
  async liveness() {
    // Simple liveness probe
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('readiness')
  @HealthCheck()
  async readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.checkHealth('redis'),
    ]);
  }
}
```

**Task 5.5: Structured Logging Enhancement (90 min)**

**Install Winston:**
```bash
npm install winston nest-winston
```

**Create Logger Module:**

`src/common/logger/logger.module.ts`:
```typescript
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          return `${timestamp} [${context}] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        }),
      ),
    }),

    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
```

**Use Logger in Services:**
```typescript
@Injectable()
export class ChaptersService {
  private readonly logger = new Logger(ChaptersService.name);

  async create(dto: CreateChapterDto): Promise<Chapter> {
    this.logger.log(`Creating chapter: ${dto.title}`);

    try {
      const chapter = await this.chaptersRepository.save(dto);
      this.logger.log(`Chapter created successfully: ${chapter.id}`);
      return chapter;
    } catch (error) {
      this.logger.error(`Failed to create chapter: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

**Task 5.6: API Metrics & Monitoring (60 min)**

**Install Prometheus:**
```bash
npm install @willsoto/nestjs-prometheus prom-client
```

**Configure Prometheus:**

`src/app.module.ts`:
```typescript
@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      path: '/metrics',
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

**Create Custom Metrics:**
```typescript
// src/common/metrics/custom-metrics.ts
import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

export const httpRequestCounter = makeCounterProvider({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const httpRequestDuration = makeHistogramProvider({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
});

export const cacheHitRate = makeCounterProvider({
  name: 'cache_hit_total',
  help: 'Total number of cache hits',
  labelNames: ['key_prefix'],
});
```

**Task 5.7: Week 3 Final Documentation (60 min)**

Create `docs/plans/week3/WEEK_3_IMPLEMENTATION_GUIDE.md`:

Document:
- Redis caching strategy with examples
- Rate limiting configuration
- Performance optimization techniques
- Docker deployment guide
- CI/CD pipeline setup
- Monitoring and health checks
- All new module endpoints with examples

---

## ✅ Week 3 Completion Checklist

### Day 1: Pronunciation Module ✅
- [ ] Pronunciation service with TTS integration
- [ ] Google Cloud TTS API integration
- [ ] Speech recognition API integration
- [ ] Pronunciation attempt entity
- [ ] Pronunciation controller with 5+ endpoints
- [ ] Pronunciation DTOs
- [ ] Unit tests (15+ tests)
- [ ] E2E tests (10+ scenarios)
- [ ] REST Client tests

### Day 2: Vocabulary Module ✅
- [ ] Vocabulary service with CRUD operations
- [ ] Vocabulary word entity with categories
- [ ] User vocabulary progress tracking
- [ ] Audio generation for words
- [ ] Vocabulary controller with 10+ endpoints
- [ ] Vocabulary DTOs
- [ ] Vocabulary seeder (200+ words)
- [ ] Unit tests (15+ tests)
- [ ] E2E tests (10+ scenarios)

### Day 3: Gamification Module ✅
- [ ] Gamification service (achievements, points, streaks)
- [ ] Achievement entity and unlocking logic
- [ ] Student points entity with streak tracking
- [ ] Leaderboard generation (global + chapter)
- [ ] Daily goals system
- [ ] Event-driven achievement unlocking
- [ ] Gamification controller with 8+ endpoints
- [ ] Achievement seeder (30+ achievements)
- [ ] Unit tests (20+ tests)
- [ ] E2E tests (15+ scenarios)

### Day 4: Redis & Performance ✅
- [ ] Redis module configuration
- [ ] Cache service with generic methods
- [ ] Caching implemented in 5+ modules
- [ ] Cache invalidation strategy
- [ ] Rate limiting with @nestjs/throttler
- [ ] Custom rate limiting by role
- [ ] Database query optimization (N+1 prevention)
- [ ] Database indexes added
- [ ] Performance tests
- [ ] Cache hit rate monitoring

### Day 5: Production Readiness ✅
- [ ] Dockerfile (multi-stage build)
- [ ] docker-compose.yml (API + PostgreSQL + Redis)
- [ ] GitHub Actions CI/CD pipeline
- [ ] Environment configuration (.env.example)
- [ ] Health check endpoints (/health, /liveness, /readiness)
- [ ] Winston structured logging
- [ ] Prometheus metrics integration
- [ ] Week 3 implementation guide
- [ ] All tests passing (500+ tests)

---

## 📊 Expected Metrics (End of Week 3)

| Metric | Week 2 | Week 3 Target | Growth |
|--------|--------|---------------|--------|
| **API Endpoints** | 30+ | 55+ | +83% |
| **Total Tests** | 400+ | 550+ | +38% |
| **Modules Implemented** | 6 | 9 | +50% |
| **Response Time (cached)** | <100ms | <20ms | 80% faster |
| **Test Coverage** | 85% | 85%+ | Maintained |
| **Docker Images** | 0 | 2 | New |
| **CI/CD Pipelines** | 0 | 1 | New |

---

## 🗄️ Database State (End of Week 3)

**Existing Data (Week 1-2):**
- ✅ 31 users (all 5 roles)
- ✅ 10 chapters
- ✅ 45 units
- ✅ 135 levels
- ✅ 999 questions
- ✅ ~3996 answer options
- ✅ 500+ level attempts
- ✅ 5000+ question answers

**Week 3 Will Add:**
- 🆕 200+ vocabulary words
- 🆕 30+ achievements
- 🆕 Student points records (all students)
- 🆕 Student achievements (unlocked)
- 🆕 Daily goals (per student)
- 🆕 Pronunciation attempts
- 🆕 User vocabulary progress

**Total Records**: 15,000+ records

---

## 🚀 Performance Targets

### API Response Times (95th percentile)
- **Without Cache**: <100ms
- **With Cache**: <20ms
- **Database Queries**: <30ms
- **External APIs (TTS)**: <500ms

### Caching
- **Cache Hit Rate**: >80%
- **Cache Invalidation**: <10ms
- **Redis Connection Pool**: 10 connections

### Scalability
- **Concurrent Users**: 1000+ simultaneous
- **Requests Per Second**: 500+ RPS
- **Database Connections**: 50 pool size

---

## 🔒 Production Readiness Checklist

### Infrastructure ✅
- [ ] Docker containerization
- [ ] docker-compose for local development
- [ ] Multi-stage builds for optimization
- [ ] Non-root user in containers
- [ ] Health checks in Docker

### CI/CD ✅
- [ ] Automated testing on push
- [ ] Linting in pipeline
- [ ] Code coverage reporting
- [ ] Docker image builds
- [ ] Automated deployment (staging)

### Monitoring ✅
- [ ] Health check endpoints
- [ ] Prometheus metrics
- [ ] Winston structured logging
- [ ] Error tracking (Sentry optional)
- [ ] Performance monitoring

### Security ✅
- [ ] Rate limiting by role
- [ ] Input validation comprehensive
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CORS configuration
- [ ] Helmet security headers

### Performance ✅
- [ ] Redis caching implemented
- [ ] Database indexes optimized
- [ ] N+1 queries eliminated
- [ ] Query optimization
- [ ] Connection pooling

---

## 💡 Best Practices Established

### Caching Strategy
1. **Long TTL (1 hour)** for static content (chapters, units, levels)
2. **Short TTL (5 min)** for user-specific data (progress, achievements)
3. **Medium TTL (15 min)** for leaderboards
4. **Invalidate on write** operations (create, update, delete)
5. **Prefix-based** cache keys for easy invalidation

### Rate Limiting
1. **Role-based limits** (admin: 1000/min, student: 100/min)
2. **Endpoint-specific limits** (expensive operations: 5/min)
3. **Track by user ID** when authenticated, IP when anonymous
4. **Graceful degradation** with proper error messages

### Performance Optimization
1. **Eager loading** for common relationships
2. **Batch queries** instead of loops
3. **Database indexes** on foreign keys and ordering columns
4. **QueryBuilder** for complex aggregations
5. **Connection pooling** for database

---

## 📁 Key Files Created (Week 3)

### New Modules (3 modules)
1. `src/modules/pronunciation/` (8 files)
2. `src/modules/vocabulary/` (8 files)
3. `src/modules/gamification/` (12 files)

### Infrastructure (10+ files)
1. `Dockerfile`
2. `docker-compose.yml`
3. `.dockerignore`
4. `.github/workflows/ci.yml`
5. `src/config/redis.config.ts`
6. `src/common/services/cache.service.ts`
7. `src/common/services/tts.service.ts`
8. `src/modules/health/health.controller.ts`
9. `src/common/logger/logger.module.ts`
10. `src/common/metrics/custom-metrics.ts`

### Tests (30+ files)
- Unit tests for 3 new modules (45+ tests)
- E2E tests for 3 new modules (35+ tests)
- Performance tests
- REST Client tests

### Documentation (5+ files)
- Week 3 implementation guide
- Redis caching documentation
- Performance optimization guide
- Docker deployment guide
- CI/CD pipeline documentation

**Total**: 80+ files created/modified

---

## 🔗 Resources & References

### External APIs
- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech/docs)
- [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text/docs)
- [AWS S3 SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html)

### NestJS
- [Caching](https://docs.nestjs.com/techniques/caching)
- [Rate Limiting](https://docs.nestjs.com/security/rate-limiting)
- [Health Checks](https://docs.nestjs.com/recipes/terminus)
- [Logging](https://docs.nestjs.com/techniques/logger)

### DevOps
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Prometheus](https://prometheus.io/docs/introduction/overview/)

---

## 🎯 Success Criteria

Week 3 is complete when:

1. ✅ All 3 new modules (pronunciation, vocabulary, gamification) fully implemented
2. ✅ Redis caching operational with >80% hit rate
3. ✅ Rate limiting enforced on all endpoints
4. ✅ 550+ tests passing (unit + E2E)
5. ✅ Docker containers running successfully
6. ✅ CI/CD pipeline operational
7. ✅ Health checks returning 200 OK
8. ✅ Performance targets met (<20ms with cache)
9. ✅ All documentation complete
10. ✅ 0 TypeScript errors

**Final Validation**: Complete gamified learning journey:
```
Register → Login → View Leaderboard → Complete Level →
Earn Points → Unlock Achievement → Practice Pronunciation →
Learn Vocabulary → Check Progress → View Rank
```

All steps must work with proper caching and performance!

---

## 🚀 Week 4 Preview

With Week 3 complete, Week 4 will focus on:
- **AI Story Generation** (OpenAI/Gemini integration)
- **Content Moderation** (child-safe story filtering)
- **Advanced Testing** (load testing, stress testing)
- **Flutter Mobile App** (initial integration)
- **Real-time Features** (WebSocket for live progress)

**Week 3 deliverables ensure**: The backend is production-ready with advanced features, caching, monitoring, and full CI/CD pipeline!

---

**Created**: 2025-11-25
**Duration**: 5 days (40 hours)
**Status**: Ready to Execute
**Prerequisites**: ✅ Week 1-2 Complete (400+ tests, 0 errors, Phase 1 fully functional)
