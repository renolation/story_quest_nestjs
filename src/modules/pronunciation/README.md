# Pronunciation Module

**Phase**: 3
**Status**: 🔲 TODO
**Priority**: HIGH

> **⚠️ ARCHITECTURE UPDATE (2025-11-21):**
> Speech recognition is now handled **client-side** in the mobile app (Flutter).
> Backend provides **reference text only** for client-side speech comparison.
> **No server-side TTS or Speech Recognition API needed.**

## Purpose
Provide reference text for students to practice pronunciation using client-side speech-to-text comparison.

## Features
- [ ] Store reference text for pronunciation questions
- [ ] Track pronunciation practice attempts
- [ ] Store student scores (calculated client-side)
- [ ] Practice history tracking

## Entities
- **PronunciationAttempt**: Stores pronunciation practice records with client-calculated scores

## Dependencies
- Auth module (for user context)
- Questions module (for reference text)

## Implementation Order
1. Create entities and DTOs
2. Implement pronunciation attempt tracking service
3. Create REST endpoints for storing attempts
4. Add endpoints for retrieving practice history

## API Endpoints
- `POST /pronunciation/attempts` - Record pronunciation attempt (with client-calculated score)
- `GET /pronunciation/attempts/me` - Get my practice history
- `GET /pronunciation/attempts/:id` - Get specific attempt details

## Testing
- [ ] Unit tests for pronunciation service
- [ ] E2E tests for complete flow
- [ ] Test attempt tracking and retrieval
