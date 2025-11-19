import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherNote } from './entities/teacher-note.entity';
import { TeacherNotesController } from './teacher-notes.controller';
import { TeacherNotesService } from './teacher-notes.service';

/**
 * PHASE 7 - TEACHER NOTES MODULE - TODO
 *
 * Allows teachers to add observations and notes about students.
 *
 * Features to implement:
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
@Module({
  imports: [TypeOrmModule.forFeature([TeacherNote])],
  controllers: [TeacherNotesController],
  providers: [TeacherNotesService],
  exports: [TeacherNotesService],
})
export class TeacherNotesModule {}
