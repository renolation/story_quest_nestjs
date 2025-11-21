import { IsArray, IsInt, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ChapterOrderItem {
  @ApiProperty({
    description: 'Chapter ID',
    example: 1,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'New order index for this chapter',
    example: 1,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  orderIndex: number;
}

export class ReorderChaptersDto {
  @ApiProperty({
    description: 'Array of chapter IDs with their new order indexes',
    type: [ChapterOrderItem],
    example: [
      { id: 1, orderIndex: 0 },
      { id: 2, orderIndex: 1 },
      { id: 3, orderIndex: 2 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChapterOrderItem)
  chapters: ChapterOrderItem[];
}
