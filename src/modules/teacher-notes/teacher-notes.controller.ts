import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TeacherNotesService } from './teacher-notes.service';

/**
 * Teacher Notes Controller
 *
 * Phase: 7
 * Status: 🔲 TODO - Placeholder only
 * Priority: MEDIUM
 *
 * Endpoints to implement:
 * - GET /api/v1/teacher-notes - List notes (filtered by role)
 * - GET /api/v1/teacher-notes/:id - Get note details
 * - POST /api/v1/teacher-notes - Create note for student (TEACHER)
 * - PATCH /api/v1/teacher-notes/:id - Update own note (TEACHER)
 * - DELETE /api/v1/teacher-notes/:id - Delete own note (TEACHER)
 * - GET /api/v1/teacher-notes/student/:studentId - Get all notes for a student
 */
@ApiTags('teacher-notes')
@Controller('teacher-notes')
export class TeacherNotesController {
  constructor(private readonly teacherNotesService: TeacherNotesService) {}

  // TODO: Implement endpoints in Phase 7
}
