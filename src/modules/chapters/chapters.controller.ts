import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto, UpdateChapterDto, ChapterResponseDto, ReorderChaptersDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '../../common/enums';

@ApiTags('Chapters')
@ApiBearerAuth()
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new chapter',
    description: 'Create a new chapter (requires Teacher, Center, or Agency role)',
  })
  @ApiBody({ type: CreateChapterDto })
  @ApiResponse({
    status: 201,
    description: 'Chapter created successfully',
    type: ChapterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Chapter with this orderIndex already exists' })
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
    @Param('id', ParseIntPipe) id: number,
    @Query('includeUnits') includeUnits?: string,
  ): Promise<ChapterResponseDto> {
    return this.chaptersService.findOne(id, user.id, includeUnits === 'true');
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  @ApiOperation({
    summary: 'Update a chapter',
    description: 'Update chapter details (requires Teacher, Center, or Agency role)',
  })
  @ApiBody({ type: UpdateChapterDto })
  @ApiResponse({
    status: 200,
    description: 'Chapter updated successfully',
    type: ChapterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Chapter not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChapterDto: UpdateChapterDto,
  ) {
    return this.chaptersService.update(id, updateChapterDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENCY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a chapter',
    description: 'Delete a chapter (requires Agency role only - will cascade delete all units, levels, questions)',
  })
  @ApiResponse({ status: 204, description: 'Chapter deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only Agency can delete chapters' })
  @ApiResponse({ status: 404, description: 'Chapter not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.chaptersService.remove(id);
  }

  @Patch('reorder/bulk')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reorder chapters',
    description: 'Update the order of multiple chapters at once (requires Teacher, Center, or Agency role)',
  })
  @ApiBody({ type: ReorderChaptersDto })
  @ApiResponse({
    status: 200,
    description: 'Chapters reordered successfully',
    schema: {
      example: {
        success: true,
        message: 'Chapters reordered successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'One or more chapters not found' })
  async reorder(@Body() reorderDto: ReorderChaptersDto) {
    await this.chaptersService.reorder(reorderDto.chapters);
    return {
      success: true,
      message: 'Chapters reordered successfully',
    };
  }
}
