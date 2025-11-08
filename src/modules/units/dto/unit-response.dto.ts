import { ApiProperty } from '@nestjs/swagger';
import { UnitProgressDto } from '../../progress/dto/unit-progress.dto';

export class UnitResponseDto {
  @ApiProperty({ description: 'Unit unique identifier', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Unit title', example: 'Greeting Friends' })
  title: string;

  @ApiProperty({ description: 'Unit description', example: 'Learn how to greet friends' })
  description: string;

  @ApiProperty({ description: 'Parent chapter ID', example: 'uuid' })
  chapterId: string;

  @ApiProperty({ description: 'Unit order index within chapter', example: 1 })
  orderIndex: number;

  @ApiProperty({ description: 'Whether unit is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Unit creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Unit last update timestamp' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Nested levels (if includeLevels=true)',
    required: false,
    type: 'array',
  })
  levels?: any[];

  @ApiProperty({
    description: 'Student progress for this unit (null if no progress yet)',
    type: UnitProgressDto,
    nullable: true,
    required: false,
  })
  progress?: UnitProgressDto | null;
}
