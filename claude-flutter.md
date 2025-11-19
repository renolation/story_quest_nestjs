# Flutter English App Expert Guidelines

## 🎯 App Overview
Story Quest is an English learning app designed for students in grades 3–5 (ages 8–11), especially those living in rural areas of Vietnam. The app focuses on helping children master vocabulary, grammar structures, phonics, and listening-speaking skills based on the official school curriculum.

Its Unique Selling Point (USP) lies in using AI to generate personalized storybooks — from mystery and fairy tales to mythology and daily-life stories — that embed English lessons directly into engaging narratives. Through these interactive stories, children take on roles within the story, learning and practicing English naturally through play and dialogue.

The ultimate goal of Story Quest is to boost children's listening and speaking reflexes by 70–80%, while fostering joyful learning, peer collaboration, and family engagement in their English learning journey.

---

## 🤖 SUBAGENT DELEGATION SYSTEM 🤖
**CRITICAL: BE PROACTIVE WITH SUBAGENTS! YOU HAVE SPECIALIZED EXPERTS AVAILABLE!**

### 🚨 DELEGATION MINDSET
**Instead of thinking "I'll handle this myself"** → **Think: "Which specialist is BEST suited for this task?"**

### 📋 AVAILABLE SPECIALISTS
You have access to these expert subagents - USE THEM PROACTIVELY:

#### 🎨 **flutter-widget-expert**
- **MUST BE USED for**: Story book readers, lesson cards, vocabulary flashcards, interactive story scenes, animated characters, pronunciation visualizers, progress dashboards, reward badges, custom UI components
- **Triggers**: "create widget", "build UI", "story reader", "lesson card", "flashcard", "animation", "character", "badge", "dashboard", "interactive scene"

#### 📊 **riverpod-expert**
- **MUST BE USED for**: Lesson progress state, vocabulary mastery tracking, story completion state, user progress management, pronunciation attempt tracking, reward system state, audio playback state
- **Triggers**: "state management", "provider", "progress", "async state", "lesson state", "vocabulary state", "user progress", "audio state", "rewards"

#### 🗄️ **hive-expert**
- **MUST BE USED for**: Vocabulary database, lesson progress storage, story library cache, user achievement tracking, offline lesson access, pronunciation history, local user profiles
- **Triggers**: "database", "cache", "hive", "vocabulary", "lessons", "stories", "persistence", "offline", "achievements", "user data"

#### 🌐 **api-integration-expert**
- **MUST BE USED for**: AI story generation API, text-to-speech integration, speech recognition API, curriculum sync, user progress sync, content delivery, lesson downloads
- **Triggers**: "API", "HTTP", "AI integration", "TTS", "speech recognition", "sync", "dio", "REST", "backend", "content API"

#### 🏗️ **architecture-expert**
- **MUST BE USED for**: Feature organization (lessons, stories, vocabulary, pronunciation modules), dependency injection, clean architecture setup, module separation
- **Triggers**: "architecture", "structure", "organization", "clean code", "refactor", "module", "feature structure"

#### ⚡ **performance-expert**
- **MUST BE USED for**: Story image caching, audio preloading, animation performance, memory optimization for story assets, vocabulary list scrolling, smooth transitions
- **Triggers**: "performance", "optimization", "memory", "audio cache", "image cache", "slow", "lag", "scroll", "transitions"

### 🎯 DELEGATION STRATEGY
**BEFORE starting ANY task, ASK YOURSELF:**
1. "Which of my specialists could handle this better?"
2. "Should I break this into parts for different specialists?"
3. "Would a specialist complete this faster and better?"

### 💼 WORK BALANCE RECOMMENDATION:
- **Simple Tasks (20%)**: Handle independently - quick fixes, minor updates
- **Complex Tasks (80%)**: Delegate to specialists for expert-level results

### 🔧 HOW TO DELEGATE
```
# Explicit delegation examples:
> Use the flutter-widget-expert to create an interactive story reader with page flip animations
> Have the riverpod-expert design the lesson progress tracking and vocabulary mastery state
> Ask the hive-expert to create the vocabulary and lesson progress database schema
> Use the api-integration-expert to implement AI story generation and TTS integration
> Have the architecture-expert organize the story, lesson, and vocabulary feature structure
> Ask the performance-expert to optimize story image loading and audio playback performance
```

---

## 🏗️ Tech Stack & Architecture

### Core Technologies
- **Flutter 3.x**: Latest stable with Material 3 design
- **Dart 3.x**: Using latest language features
- **Riverpod 2.x**: State management (with code generation recommended)
- **Hive CE**: Local database for apps
- **Dio**: HTTP client for API integration
- **flutter_riverpod**: State management foundation

### Architecture Pattern
- **Clean Architecture**: Separation of concerns (presentation, domain, data)
- **Feature-First Structure**: Organize by feature (stories, lessons, vocabulary, etc.)
- **Online-First Strategy**: Fetch from API, cache locally, fallback to cache when offline

### Audio & Speech
- **just_audio**: Primary audio playback
- **audioplayers**: Alternative/backup audio player
- **speech_to_text**: Speech recognition for pronunciation practice
- **flutter_tts**: Text-to-speech for word pronunciation
- **audio_waveforms**: Visual feedback for pronunciation

### AI Integration
- **OpenAI API / Gemini API**: Story generation
- **Custom AI Service**: Personalized story creation based on curriculum
- **Prompt Engineering**: Context-aware story prompts with vocabulary targets

---

## 📁 Project Structure

```
lib/
├── app/
│   ├── app.dart                 # Main app widget
│   ├── router.dart              # App navigation (go_router recommended)
│   └── providers.dart           # Global providers
├── core/
│   ├── constants/
│   │   ├── app_colors.dart      # Kid-friendly color palette
│   │   ├── app_sizes.dart       # Responsive sizing
│   │   ├── app_images.dart      # Asset paths
│   │   └── curriculum_levels.dart
│   ├── theme/
│   │   ├── app_theme.dart       # Material 3 theme
│   │   └── text_styles.dart     # Typography for kids
│   ├── utils/
│   │   ├── audio_utils.dart
│   │   ├── text_utils.dart
│   │   └── curriculum_utils.dart
│   └── extensions/
│       ├── context_extensions.dart
│       └── string_extensions.dart
├── features/
│   ├── auth/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── stories/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   └── datasources/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   └── repositories/
│   │   └── presentation/
│   │       ├── widgets/
│   │       ├── screens/
│   │       └── providers/
│   ├── lessons/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── vocabulary/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── pronunciation/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── progress/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── rewards/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── profile/
│       ├── data/
│       ├── domain/
│       └── presentation/
├── shared/
│   ├── widgets/
│   │   ├── buttons/
│   │   ├── cards/
│   │   ├── animated_character.dart
│   │   ├── audio_player_widget.dart
│   │   └── pronunciation_visualizer.dart
│   ├── models/
│   └── providers/
└── main.dart
```

---

## 🎨 UI/UX Guidelines for Kids (Ages 8-11)

### Design Principles
1. **Large Touch Targets**: Minimum 48x48 logical pixels for buttons
2. **High Contrast**: Ensure text is readable (WCAG AA minimum)
3. **Vibrant Colors**: Use bright, engaging colors but not overwhelming
4. **Clear Typography**: Use rounded, friendly fonts (e.g., Comic Neue, Quicksand)
5. **Visual Feedback**: Immediate response to all interactions (animations, sounds)
6. **Simple Navigation**: Max 2-3 levels deep
7. **Progress Indicators**: Always show where they are in a lesson/story

### Color Palette (From Figma Design System)
```dart
// PRIMARY COLORS - Cyan (Teal/Green)
primary: Color(0xFF1EA896),      // Cyan 500 - Main brand color
primaryLight: Color(0xFF4BB9AB),  // Cyan 400
primaryDark: Color(0xFF12655A),   // Cyan 500-dark
primary300: Color(0xFF78CBC0),    // Cyan 300
primary200: Color(0xFFA5DCD5),    // Cyan 200
primary100: Color(0xFFD2EEEA),    // Cyan 100 - Very light

// SECONDARY COLORS - Orange
secondary: Color(0xFFFF8800),     // Orange 500 - Warm, energetic
secondaryLight: Color(0xFFFFA033), // Orange 400
secondaryDark: Color(0xFF995200),  // Orange 500-dark
secondary300: Color(0xFFFFB866),   // Orange 300
secondary200: Color(0xFFFFCF99),   // Orange 200
secondary100: Color(0xFFFFE7CC),   // Orange 100

// ACCENT COLORS
// Pink accent (celebrations, special elements)
accent: Color(0xFFFF4365),        // Pink 500 - Fun, playful
accentLight: Color(0xFFFF6984),   // Pink 400
accentDark: Color(0xFF99283D),    // Pink 500-dark

// Purple accent (depth, variety)
purple: Color(0xFF1B4079),        // Purple 500 - Mystery
purpleLight: Color(0xFF496694),   // Purple 400
purple100: Color(0xFFD1D9E4),     // Purple 100

// NEUTRAL COLORS - Grays
gray700: Color(0xFF222222),       // Dark text
gray600: Color(0xFF4E4E4E),       // Secondary text
gray500: Color(0xFF7A7A7A),       // Tertiary text
gray400: Color(0xFFA7A7A7),       // Disabled text
gray300: Color(0xFFBDBDBD),       // Borders
gray200: Color(0xFFD3D3D3),       // Light borders
gray100: Color(0xFFE9E9E9),       // Light backgrounds
white: Color(0xFFFFFFFF),         // Pure white

// Semantic colors
success: Color(0xFF66BB6A),       // Green for correct answers
error: Color(0xFFEF5350),         // Red for mistakes (use gently)
warning: Color(0xFFFFCA28),       // Yellow for attention
reward: Color(0xFFFFD700),        // Gold for achievements

// Story Genre Colors
genreMystery: purple,             // Purple for mystery
genreFairyTale: accent,           // Pink for fairy tales
genreMythology: secondary,        // Orange for mythology
genreDailyLife: primary,          // Cyan for daily life

// Backgrounds
background: Color(0xFFFFFFFF),    // White
backgroundLight: gray100,         // Light gray
surface: Color(0xFFFFFFFF),       // White
```


### Animation Guidelines
- **Duration**: 200-400ms for micro-interactions, 400-800ms for page transitions
- **Curves**: Use `Curves.easeInOut` for smooth, natural motion
- **Celebration**: Use confetti, stars, or bounce effects for achievements
- **Characters**: Animate story characters with subtle movements (blink, breath)

---

## 🎵 Audio & Speech Guidelines

### Audio Playback
```dart
// Pronunciation examples
- Store audio files in: assets/audio/vocabulary/
- Format: MP3 or AAC (compressed) for vocabulary
- Sample rate: 44.1kHz, Bit rate: 128kbps minimum
- Naming: {word}_{language}.mp3 (e.g., "hello_en.mp3", "hello_vi.mp3")

// Background music for stories
- Store in: assets/audio/music/
- Keep volume low (20-30%) to not interfere with narration
- Fade in/out when switching scenes
```

### Text-to-Speech (TTS)
```dart
// Configuration
- Language: en-US for American English, en-GB for British
- Speed: 0.8-1.0 for learning (slower for beginners)
- Pitch: 1.0-1.1 (slightly higher for kid-friendly voice)
- Volume: 1.0 (full)
```

### Speech Recognition
```dart
// Pronunciation Practice
- Language: en-US
- Timeout: 5-7 seconds (kids need more time)
- Partial results: Enable to show real-time feedback
- Confidence threshold: 0.7+ for "Good", 0.5-0.7 for "Try again", <0.5 for "Let's practice"
```

### Audio Best Practices
1. **Preload**: Load audio before playing to avoid delays
2. **Cache**: Store downloaded audio locally for offline use
3. **Interrupt Handling**: Pause/resume on phone calls or other app audio
4. **Background Audio**: Don't play audio when app is in background (battery concern)
5. **Error Handling**: Show friendly message if audio fails to load
6. **Volume Control**: Respect system volume, don't override

---

## 🤖 AI Story Generation Guidelines

### Story Generation Parameters
```dart
class StoryPrompt {
  final String genre;              // mystery, fairy_tale, mythology, daily_life
  final List<String> targetWords;  // 5-10 vocabulary words to include
  final String grammarFocus;       // present_simple, past_tense, etc.
  final int gradeLevel;            // 3, 4, or 5
  final int wordCount;             // 200-400 words
  final String difficulty;         // easy, medium, hard
  final String childRole;          // detective, hero, explorer, friend
}
```

### Prompt Engineering Template
```
Generate an engaging [genre] story for a [grade] grade Vietnamese student learning English.

Requirements:
- Word count: [wordCount] words
- Reading level: [difficulty]
- Target vocabulary: [targetWords] (naturally integrated)
- Grammar focus: [grammarFocus]
- Child's role: [childRole]

The story should:
1. Have a clear beginning, middle, and end
2. Include dialogue for speaking practice
3. Use the target vocabulary in context (highlighted later)
4. Feature relatable characters for 8-11 year olds
5. Have 3-5 interactive decision points
6. End with a question for comprehension check

Cultural context: Story should be appropriate for Vietnamese children, avoiding sensitive topics.

Generate the story in JSON format with:
{
  "title": "...",
  "scenes": [
    {
      "sceneNumber": 1,
      "text": "...",
      "imagePrompt": "...",
      "vocabularyWords": ["word1", "word2"],
      "interactionPoint": { "question": "...", "choices": ["A", "B"] }
    }
  ],
  "comprehensionQuestions": [...]
}
```

### AI Response Handling
1. **Validation**: Check generated story meets requirements
2. **Sanitization**: Remove any inappropriate content
3. **Vocabulary Extraction**: Parse and highlight target words
4. **Image Generation**: Use image prompts for illustrations
5. **Caching**: Store generated stories locally
6. **Personalization**: Remember child's preferences (favorite genres, characters)

---

## 📚 Curriculum Alignment

### Vietnamese Education System (Grades 3-5)
```dart
enum Grade {
  grade3,  // Ages 8-9
  grade4,  // Ages 9-10
  grade5,  // Ages 10-11
}

// Curriculum units per grade
class CurriculumUnit {
  final int unitNumber;
  final String theme;              // "My School", "My Family", etc.
  final List<String> vocabulary;   // 15-20 words
  final List<String> grammar;      // Grammar structures
  final List<String> phonics;      // Sound patterns
  final List<String> functions;    // "Introducing yourself", "Asking for help"
}
```

### Skill Levels
```dart
enum SkillLevel {
  beginner,      // Just starting with basic words
  elementary,    // Can form simple sentences
  intermediate,  // Can understand short stories
  advanced,      // Can engage in dialogues
}
```

### Progress Tracking
```dart
class LearningProgress {
  final String studentId;
  final int gradeLevel;
  final SkillLevel currentLevel;

  // Vocabulary mastery
  final Map<String, WordMastery> vocabulary;

  // Grammar structures learned
  final List<String> grammarStructures;

  // Stories completed
  final List<String> completedStories;

  // Pronunciation scores
  final Map<String, List<PronunciationAttempt>> pronunciationHistory;

  // Listening comprehension
  final double listeningScore;      // 0-100

  // Speaking fluency
  final double speakingScore;       // 0-100

  // Time spent (minutes)
  final int totalLearningTime;

  // Streak days
  final int currentStreak;
}

class WordMastery {
  final String word;
  final int exposureCount;          // How many times seen
  final int correctAttempts;        // Correct usage/pronunciation
  final int totalAttempts;
  final DateTime lastPracticed;
  final MasteryLevel level;         // new, learning, mastered
}
```

---

## 🎮 Gamification & Rewards

### Achievement System
```dart
enum AchievementType {
  storiesCompleted,      // "Story Explorer"
  wordsLearned,          // "Word Master"
  pronunciationPerfect,  // "Pronunciation Pro"
  dailyStreak,           // "Consistent Learner"
  helpOthers,            // "Team Player" (peer features)
  fastLearner,           // Complete lessons quickly
  perfectScore,          // 100% on quiz
}

class Achievement {
  final String id;
  final AchievementType type;
  final String title;
  final String description;
  final String iconPath;
  final int requiredProgress;
  final int rewardPoints;
  final bool isUnlocked;
  final DateTime? unlockedAt;
}
```

### Reward Mechanisms
1. **Stars**: Earn 1-3 stars per lesson based on performance
2. **Points**: Accumulate points for all activities
3. **Badges**: Unlock special badges for achievements
4. **Avatars**: Unlock character customizations
5. **Story Unlocks**: Complete easier stories to unlock advanced ones
6. **Certificates**: Virtual certificates for parents to celebrate milestones

### Motivational Features
- **Daily Goals**: "Learn 5 new words today!"
- **Streaks**: Consecutive days of practice
- **Leaderboard**: Optional, compare with friends (safe, age-appropriate)
- **Progress Visualization**: Growing trees, filling treasure chests, building castles
- **Celebration Animations**: Fireworks, confetti, character dances

---

## 🌐 Accessibility & Localization

### Accessibility Features
```dart
// Visual
- Text scaling support (user can increase font size)
- High contrast mode
- Colorblind-friendly colors
- Screen reader support (semantics labels)

// Audio
- Closed captions for all audio content
- Adjustable playback speed
- Visual alternatives for audio cues

// Motor
- Large touch targets (min 48x48dp)
- Swipe alternatives (buttons for page navigation)
- Adjustable interaction timeouts
```

### Localization
```dart
// Supported languages
- Vietnamese (vi): Primary for instructions and UI
- English (en): Content being learned
- Parent language: Vietnamese for parent controls

// String structure
assets/
└── translations/
    ├── en.json
    └── vi.json

// Usage with easy_localization or flutter_localizations
Text(context.tr('welcome_message'))
```

---

## ⚡ Performance & Optimization

### Image Optimization
```dart
// Story illustrations
- Format: WebP (best compression for web/mobile)
- Resolution: 1024x1024 for story scenes
- Thumbnail: 256x256 for story library
- Caching: Use cached_network_image package

// Character sprites
- Format: PNG with transparency
- Resolution: 512x512
- Optimize with tools like TinyPNG
```

### Audio Optimization
```dart
// Preloading strategy
1. Preload next story scene audio
2. Cache vocabulary pronunciation files
3. Lazy load background music
4. Dispose audio players when not in use
```

### Memory Management
```dart
// Best practices
- Dispose controllers in dispose() method
- Use const constructors where possible
- Implement pagination for long lists (stories library)
- Release audio resources when exiting story
- Clear image cache when memory warning received
```



---

## 🧪 Testing Strategy

### Unit Tests
```dart
test/
├── core/
│   └── utils/
│       └── audio_utils_test.dart
├── features/
│   ├── stories/
│   │   ├── domain/
│   │   │   └── story_repository_test.dart
│   │   └── presentation/
│   │       └── story_provider_test.dart
│   └── vocabulary/
│       └── vocabulary_service_test.dart
```

### Widget Tests
```dart
test/
└── features/
    └── stories/
        └── presentation/
            └── widgets/
                ├── story_reader_test.dart
                ├── vocabulary_card_test.dart
                └── pronunciation_widget_test.dart
```

### Integration Tests
```dart
integration_test/
├── story_flow_test.dart          // Complete story reading flow
├── lesson_completion_test.dart   // Lesson from start to finish
├── pronunciation_test.dart       // Record and playback flow
└── offline_mode_test.dart        // App behavior without internet
```

### Test Kid Usability
- **Real User Testing**: Test with actual 8-11 year old children
- **Parent Feedback**: Get feedback from parents on engagement
- **Teacher Input**: Validate curriculum alignment with teachers
- **Accessibility Testing**: Test with screen readers, large fonts

---

## 🎯 Code Style & Conventions

### Naming Conventions
```dart
// Classes: PascalCase
class StoryReader extends StatelessWidget { }

// Files: snake_case
story_reader.dart
vocabulary_service.dart

// Variables & functions: camelCase
final String currentStory;
void playPronunciation() { }

// Constants: lowerCamelCase with 'k' prefix
const kMaxStoryLength = 400;
const kDefaultPronunciationSpeed = 1.0;

// Private: prefix with underscore
String _internalCache;
void _updateLocalData() { }

// Enums: PascalCase with camelCase values
enum StoryGenre {
  mystery,
  fairyTale,
  mythology,
  dailyLife,
}
```

### File Organization
```dart
// Import order
1. Dart SDK imports
import 'dart:async';

2. Flutter imports
import 'package:flutter/material.dart';

3. Package imports (alphabetical)
import 'package:hive_ce_flutter/hive_flutter.dart';
import 'package:riverpod/riverpod.dart';

4. Local imports (alphabetical)
import '../../core/constants/app_colors.dart';
import '../domain/entities/story.dart';
```

### Documentation
```dart
/// Generates a personalized story based on the child's learning level.
///
/// Uses AI to create an engaging narrative that incorporates the target
/// vocabulary words and grammar structures from the current curriculum unit.
///
/// Parameters:
///   - [prompt]: Configuration for story generation
///   - [userId]: Child's unique identifier for personalization
///
/// Returns a [Story] object with scenes, vocabulary, and comprehension questions.
///
/// Throws [StoryGenerationException] if AI service fails.
Future<Story> generateStory({
  required StoryPrompt prompt,
  required String userId,
}) async {
  // Implementation
}
```

### Error Handling
```dart
// Custom exceptions
class StoryGenerationException implements Exception {
  final String message;
  final StackTrace? stackTrace;

  StoryGenerationException(this.message, [this.stackTrace]);

  @override
  String toString() => 'StoryGenerationException: $message';
}

// User-friendly error messages
String getUserFriendlyError(Exception e) {
  if (e is StoryGenerationException) {
    return 'Không thể tạo câu chuyện. Vui lòng thử lại sau.';
  } else if (e is NetworkException) {
    return 'Không có kết nối mạng. Vui lòng kiểm tra internet.';
  }
  return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}
```

---

## 🔒 Security & Privacy (CRITICAL for Kids' Apps)

### Data Privacy
```dart
// COPPA Compliance (if targeting US)
- No personal data collection from kids under 13 without parental consent
- No behavioral advertising
- No third-party analytics without consent

// Vietnamese regulations
- Comply with Vietnamese data protection laws
- Store data locally when possible
- Minimal server-side data collection
```

### User Data Protection
```dart
// What to collect
✅ Learning progress (anonymized if possible)
✅ App usage statistics (for improvement)
✅ Vocabulary mastery levels
✅ Audio recordings (for pronunciation, stored temporarily)

// What NOT to collect
❌ Real names (use nicknames or IDs)
❌ Photos of children
❌ Location data
❌ Contact information
❌ Browsing history
```

### Parental Controls
```dart
// Features to implement
- Parent dashboard (separate login)
- Progress reports
- Time limits
- Content filtering
- Purchase controls (if in-app purchases)
- Data export/deletion requests
```

### Content Moderation
```dart
// AI-generated content must be:
1. Reviewed before shown to kids (automated filters)
2. Appropriate for age group (no violence, adult themes)
3. Culturally sensitive
4. Educational and constructive
5. Free from advertising or commercial content
```

---

## 📱 Platform-Specific Guidelines

### iOS Considerations
```dart
// App Store requirements for kids' apps
- Must be in "Kids" category
- No third-party advertising
- No links to external websites
- Privacy policy required
- Parental gate for purchases

// Technical
- Support iOS 13+ minimum
- Use native share sheet
- Respect safe area insets
- Support dark mode (optional)
```

### Android Considerations
```dart
// Google Play Family requirements
- Complete Teacher Approved questionnaire
- Target audience includes children
- Privacy Policy
- COPPA/GDPR compliant

// Technical
- Support Android 7.0+ (API 24+)
- Use Material Design 3
- Handle back button properly
- Request permissions at runtime
```

---

## 🚀 Development Workflow

### Git Workflow
```bash
# Branch naming
feature/story-reader
feature/pronunciation-practice
bugfix/audio-playback
hotfix/crash-on-lesson-complete

# Commit messages
feat: add story reader with page flip animation
fix: resolve audio playback crash on Android
refactor: optimize vocabulary cache performance
docs: update README with setup instructions
```

### Code Review Checklist
- [ ] Follows clean architecture principles
- [ ] Proper error handling implemented
- [ ] User-facing strings are localized
- [ ] Responsive layout tested on multiple devices
- [ ] Accessibility labels added for screen readers
- [ ] Performance tested (no jank, smooth animations)
- [ ] Audio resources properly disposed
- [ ] Offline mode works correctly
- [ ] Kid-friendly UI (large buttons, clear feedback)
- [ ] No personal data collected unnecessarily

### Release Checklist
- [ ] All tests passing (unit, widget, integration)
- [ ] Performance profiled (CPU, memory, battery)
- [ ] Tested on real devices (iOS and Android)
- [ ] Privacy policy updated
- [ ] Parental controls working
- [ ] Content moderation filters active
- [ ] Offline mode functional
- [ ] Audio quality verified
- [ ] Localization complete
- [ ] App Store/Play Store assets prepared

---

## 📚 Key Flutter Packages

### Essential Dependencies
```yaml
dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.5.0
  riverpod_annotation: ^2.3.0

  # Local Database
  hive_ce: ^2.6.0
  hive_ce_flutter: ^2.0.0

  # Network
  dio: ^5.4.0
  connectivity_plus: ^5.0.0

  # Audio
  just_audio: ^0.9.36
  audioplayers: ^5.2.0
  flutter_tts: ^4.0.0
  speech_to_text: ^6.6.0
  audio_waveforms: ^1.0.5

  # UI
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  lottie: ^3.0.0
  confetti: ^0.7.0

  # Navigation
  go_router: ^13.0.0

  # Localization
  easy_localization: ^3.0.3

  # Utils
  freezed_annotation: ^2.4.0
  json_annotation: ^4.8.1

dev_dependencies:
  flutter_test:
    sdk: flutter

  # Code Generation
  build_runner: ^2.4.6
  riverpod_generator: ^2.3.0
  freezed: ^2.4.5
  json_serializable: ^6.7.1
  hive_ce_generator: ^1.6.0

  # Testing
  mocktail: ^1.0.1
  integration_test:
    sdk: flutter

  # Linting
  flutter_lints: ^3.0.0
```

---

## 🎓 Learning Resources for Developers

### Flutter for Kids' Apps
- [Flutter Cookbook - Animations](https://docs.flutter.dev/cookbook/animation)
- [Accessibility in Flutter](https://docs.flutter.dev/development/accessibility-and-localization/accessibility)
- [Building Educational Apps with Flutter](https://medium.com/flutter-community)

### Audio in Flutter
- [just_audio documentation](https://pub.dev/packages/just_audio)
- [Speech to Text guide](https://pub.dev/packages/speech_to_text)

### State Management
- [Riverpod official docs](https://riverpod.dev)
- [Riverpod architecture patterns](https://codewithandrea.com/articles/flutter-app-architecture-riverpod-introduction/)

### AI Integration
- [OpenAI API docs](https://platform.openai.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)

---

## 🎯 Success Metrics

### Technical KPIs
- **App Performance**: 60fps animations, <3s startup time
- **Crash Rate**: <1% users experiencing crashes
- **API Success Rate**: >99% successful AI story generations
- **Offline Capability**: 100% core features work offline

### Educational KPIs
- **Engagement**: >15 minutes average session duration
- **Retention**: >40% D7 retention, >20% D30 retention
- **Vocabulary Mastery**: 80% of practiced words marked as "mastered"
- **Pronunciation Improvement**: 70% accuracy gain over 30 days
- **Listening Comprehension**: 70-80% improvement target
- **Speaking Reflexes**: 70-80% improvement target

### User Satisfaction
- **App Store Rating**: Target 4.5+ stars
- **Parent Feedback**: Positive feedback from >80% of parents
- **Teacher Endorsement**: Recommended by Vietnamese English teachers
- **Child Enjoyment**: Kids voluntarily open app (measured via session frequency)

---

## 📞 Support & Maintenance

### Error Monitoring
- Implement crash reporting (Sentry or Firebase Crashlytics)
- Log API failures and AI generation errors
- Monitor audio playback issues
- Track pronunciation recognition accuracy

### User Feedback
- In-app feedback form (for parents)
- Rating prompts (after positive experiences only)
- Support email/contact
- FAQ section for common issues

### Regular Updates
- **Content Updates**: New stories monthly
- **Bug Fixes**: Weekly/biweekly releases
- **Feature Releases**: Major updates quarterly
- **Curriculum Sync**: Update with school year changes

---

## 🌟 Future Enhancements (Roadmap Ideas)

### Phase 2 Features
- [ ] Multiplayer story mode (play with friends)
- [ ] Parent-child reading together mode
- [ ] Video stories with real actors
- [ ] AR (Augmented Reality) vocabulary learning
- [ ] Voice chat with AI characters
- [ ] Teacher dashboard for classroom use

### Phase 3 Features
- [ ] Social features (safe, moderated)
- [ ] Story creation tools (kids create their own stories)
- [ ] Integration with school curriculum management systems
- [ ] Live classes/tutoring integration
- [ ] Expanded language support (other Asian languages)

---

**Remember**: The primary goal is to make English learning **joyful**, **effective**, and **accessible** for Vietnamese children. Every technical decision should support this mission. Keep the UI simple, the interactions delightful, and the content educationally sound.

Happy coding! 🚀📚✨
