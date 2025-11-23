import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

/**
 * Enroll Student DTO
 *
 * Used to enroll a student in a class.
 */
export class EnrollStudentDto {
  @ApiProperty({
    description: 'Student user ID to enroll',
    example: 10,
  })
  @IsInt()
  @IsNotEmpty()
  studentId: number;
}
