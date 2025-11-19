# Vocabulary Module

**Phase**: 3
**Status**: 🔲 TODO
**Priority**: HIGH

## Purpose
Manage vocabulary words with TTS-generated audio for pronunciation practice.

## Features
- [ ] CRUD operations for vocabulary words
- [ ] Text-to-Speech audio generation (Google Cloud TTS)
- [ ] Phonetic notation support
- [ ] Example sentences
- [ ] Audio caching for performance
- [ ] Word search and filtering

## Entities
- **VocabularyWord**: Stores vocabulary with definitions and TTS audio

## Dependencies
- External: Google Cloud Text-to-Speech API
- External: AWS S3 for audio storage

## Implementation Order
1. Create entities and DTOs
2. Implement TTS service integration
3. Create vocabulary service with CRUD operations
4. Add audio generation on word creation
5. Implement caching for frequently accessed words
6. Create REST endpoints with pagination

## API Endpoints
- `GET /vocabulary/words` - List vocabulary (paginated, searchable)
- `GET /vocabulary/words/:id` - Get word details with audio
- `POST /vocabulary/words` - Create word (admin/teacher only)
- `PATCH /vocabulary/words/:id` - Update word
- `DELETE /vocabulary/words/:id` - Delete word

## External Services Configuration
```bash
# .env
GOOGLE_CLOUD_TTS_API_KEY=your-key
AWS_S3_BUCKET=story-quest-audio
```

## Testing
- [ ] Unit tests for vocabulary service
- [ ] Integration tests with mocked TTS API
- [ ] Test audio generation and caching
- [ ] E2E tests for CRUD operations
