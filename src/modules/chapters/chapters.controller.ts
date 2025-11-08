import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { ChapterResponseDto } from './dto/chapter-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Chapters')
@ApiBearerAuth()
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createChapterDto: CreateChapterDto) {
    return this.chaptersService.create(createChapterDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all chapters with user progress',
    description: 'Retrieves all active chapters with the authenticated user\'s progress data',
  })
  @ApiResponse({
    status: 200,
    description: 'Chapters retrieved successfully with progress',
    type: [ChapterResponseDto],
  })
  @ApiQuery({
    name: 'includeUnits',
    required: false,
    type: String,
    description: 'Set to "true" to include nested units',
  })
  findAll(
    @CurrentUser() user: any,
    @Query('includeUnits') includeUnits?: string,
  ): Promise<ChapterResponseDto[]> {
    return this.chaptersService.findAll(user.id, includeUnits === 'true');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a chapter by ID with user progress',
    description: 'Retrieves a specific chapter with the authenticated user\'s progress data',
  })
  @ApiResponse({
    status: 200,
    description: 'Chapter retrieved successfully with progress',
    type: ChapterResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Chapter not found' })
  @ApiQuery({
    name: 'includeUnits',
    required: false,
    type: String,
    description: 'Set to "true" to include nested units',
  })
  findOne(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeUnits') includeUnits?: string,
  ): Promise<ChapterResponseDto> {
    return this.chaptersService.findOne(id, user.id, includeUnits === 'true');
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateChapterDto: UpdateChapterDto,
  ) {
    return this.chaptersService.update(id, updateChapterDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.chaptersService.remove(id);
  }
}
