# Stories Module

**Phase**: 5
**Status**: 🔲 TODO
**Priority**: MEDIUM

## Purpose
AI-powered story generation and reading comprehension features for personalized learning.

## Features
- [ ] AI story generation (OpenAI/Gemini)
- [ ] Story scene management
- [ ] Vocabulary extraction from stories
- [ ] Reading comprehension questions
- [ ] Story progress tracking
- [ ] TTS narration generation
- [ ] Content moderation for child safety
- [ ] Multiple genres (mystery, fairy tale, mythology, daily life)
- [ ] Difficulty levels (easy, medium, hard)
- [ ] Grade-level appropriate content

## Entities
- **Story**: AI-generated stories
- **StoryScene**: Individual pages/scenes
- **StoryVocabulary**: Words used in stories
- **StoryComprehensionQuestion**: Reading comprehension tests
- **StudentStoryProgress**: Progress tracking

## Dependencies
- Users module (for student association)
- External: OpenAI/Gemini API
- External: Content moderation API
- External: Google Cloud TTS
- External: AWS S3 for images/audio

## Implementation Order
1. Create entities and DTOs
2. Integrate OpenAI/Gemini API
3. Implement content moderation service
4. Create story generation service
5. Implement vocabulary extraction
6. Generate comprehension questions
7. Add TTS narration generation
8. Create progress tracking service
9. Add REST endpoints

## API Endpoints
- `POST /stories/generate` - Generate new story (student preferences)
- `GET /stories/me` - Get my story library
- `GET /stories/:id` - Get story details with scenes
- `GET /stories/:id/scenes` - Get story scenes (paginated)
- `POST /stories/:id/progress` - Update reading progress
- `GET /stories/:id/comprehension` - Get comprehension questions
- `POST /stories/:id/comprehension/answer` - Submit answers

## AI Story Generation
```typescript
// Example prompt structure
const prompt = `
Generate a ${difficulty} ${genre} story for grade ${gradeLevel} students.
Word count: ${wordCount}
Theme: ${theme}
Educational focus: ${educationalFocus}

Requirements:
- Age-appropriate content (8-11 years old)
- Vietnamese cultural context
- Include 10-15 new vocabulary words
- Create 5 comprehension questions
`;
```

## Safety & Moderation
- All AI-generated content must pass moderation
- Filter inappropriate themes, violence, adult content
- COPPA compliance for child safety
- Parent/teacher review option

## Testing
- [ ] Unit tests for story generation
- [ ] Integration tests with mocked AI API
- [ ] Test content moderation filtering
- [ ] E2E tests for complete story flow
- [ ] Test TTS generation
- [ ] Performance tests (AI API rate limiting)
