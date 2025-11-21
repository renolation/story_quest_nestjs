import { PartialType } from '@nestjs/swagger';
import { CreatePronunciationAttemptDto } from './create-pronunciation-attempt.dto';

/**
 * DTO for updating pronunciation attempt records
 *
 * Extends CreatePronunciationAttemptDto with all fields optional
 * Allows partial updates to pronunciation attempts
 */
export class UpdatePronunciationAttemptDto extends PartialType(
  CreatePronunciationAttemptDto,
) {}
