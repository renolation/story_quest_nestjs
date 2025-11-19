# Pronunciation Module

**Phase**: 3
**Status**: 🔲 TODO
**Priority**: HIGH

## Purpose
Enable students to practice pronunciation with real-time feedback using speech recognition.

## Features
- [ ] Record pronunciation attempts with audio storage
- [ ] Speech-to-text validation using Google Cloud Speech API
- [ ] Pronunciation accuracy scoring (0-100)
- [ ] Practice history tracking
- [ ] Audio file management (temporary storage, auto-cleanup)

## Entities
- **PronunciationAttempt**: Stores pronunciation practice records

## Dependencies
- Auth module (for user context)
- External: Google Cloud Speech-to-Text API
- External: AWS S3 / Cloudflare R2 for audio storage

## Implementation Order
1. Create entities and DTOs
2. Implement audio upload service (S3)
3. Integrate Google Cloud Speech-to-Text
4. Implement pronunciation scoring algorithm
5. Create REST endpoints
6. Add audio cleanup cron job (delete after 24 hours)

## API Endpoints
- `POST /pronunciation/attempts` - Record pronunciation attempt
- `GET /pronunciation/attempts/me` - Get my practice history
- `GET /pronunciation/attempts/:id` - Get specific attempt details

## External Services Configuration
```bash
# .env
GOOGLE_CLOUD_SPEECH_API_KEY=your-key
AWS_S3_BUCKET=story-quest-audio
```

## Testing
- [ ] Unit tests for pronunciation service
- [ ] Integration tests with mocked Speech API
- [ ] E2E tests for complete flow
- [ ] Test audio file cleanup
