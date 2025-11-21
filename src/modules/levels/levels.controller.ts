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
import { LevelsService } from './levels.service';
import { CreateLevelDto, UpdateLevelDto, LevelResponseDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '../../common/enums';

@ApiTags('Levels')
@ApiBearerAuth()
@Controller('levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new level',
    description: 'Create a new level within a unit with time limits and passing score (requires Teacher, Center, or Agency role)',
  })
  @ApiBody({ type: CreateLevelDto })
  @ApiResponse({
    status: 201,
    description: 'Level created successfully',
    type: LevelResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Parent unit not found' })
  create(@Body() createLevelDto: CreateLevelDto) {
    return this.levelsService.create(createLevelDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all levels with user progress',
    description: 'Retrieves levels with the authenticated user\'s progress data. Optionally filter by unitId',
  })
  @ApiResponse({
    status: 200,
    description: 'Levels retrieved successfully with progress',
    type: [LevelResponseDto],
  })
  @ApiQuery({
    name: 'unitId',
    required: false,
    type: String,
    description: 'Filter levels by unit ID',
  })
  @ApiQuery({
    name: 'includeQuestions',
    required: false,
    type: String,
    description: 'Set to "true" to include nested questions',
  })
  findAll(
    @CurrentUser() user: any,
    @Query('unitId', new ParseIntPipe({ optional: true })) unitId?: number,
    @Query('includeQuestions') includeQuestions?: string,
  ): Promise<LevelResponseDto[]> {
    return this.levelsService.findAll(user.id, unitId, includeQuestions === 'true');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a level by ID with user progress',
    description: 'Retrieves a specific level with the authenticated user\'s progress data',
  })
  @ApiResponse({
    status: 200,
    description: 'Level retrieved successfully with progress',
    type: LevelResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Level not found' })
  @ApiQuery({
    name: 'includeQuestions',
    required: false,
    type: String,
    description: 'Set to "true" to include nested questions',
  })
  findOne(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Query('includeQuestions') includeQuestions?: string,
  ): Promise<LevelResponseDto> {
    return this.levelsService.findOne(id, user.id, includeQuestions === 'true');
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  @ApiOperation({
    summary: 'Update a level',
    description: 'Update level details including time limits and passing score (requires Teacher, Center, or Agency role)',
  })
  @ApiBody({ type: UpdateLevelDto })
  @ApiResponse({
    status: 200,
    description: 'Level updated successfully',
    type: LevelResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Level not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLevelDto: UpdateLevelDto,
  ) {
    return this.levelsService.update(id, updateLevelDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENCY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a level',
    description: 'Delete a level (requires Agency role only - will cascade delete all questions and answer options)',
  })
  @ApiResponse({ status: 204, description: 'Level deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only Agency can delete levels' })
  @ApiResponse({ status: 404, description: 'Level not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.levelsService.remove(id);
  }
}
