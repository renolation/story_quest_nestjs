import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherNote } from './entities/teacher-note.entity';

/**
 * Teacher Notes Service
 *
 * Phase: 7
 * Status: 🔲 TODO - Placeholder only
 * Priority: MEDIUM
 *
 * Business logic to implement:
 * - Create notes for students
 * - List notes for a student
 * - Update/delete own notes
 * - Tag-based filtering
 * - Note type categorization
 * - Privacy controls (private vs shared notes)
 *
 * Access Control:
 * - TEACHER role: CRUD on notes for assigned students only
 * - CENTER role: Read all notes for students in own center
 * - AGENCY role: Read all notes
 */
@Injectable()
export class TeacherNotesService {
  constructor(
    @InjectRepository(TeacherNote)
    private teacherNoteRepository: Repository<TeacherNote>,
  ) {}

  // TODO: Implement service methods in Phase 7
}
