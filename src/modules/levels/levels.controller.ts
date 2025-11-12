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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LevelsService } from './levels.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { LevelResponseDto } from './dto/level-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Levels')
@ApiBearerAuth()
@Controller('levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLevelDto: UpdateLevelDto,
  ) {
    return this.levelsService.update(id, updateLevelDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.levelsService.remove(id);
  }
}
