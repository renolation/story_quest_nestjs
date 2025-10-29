export class ChapterResponseDto {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  units?: any[];
}
