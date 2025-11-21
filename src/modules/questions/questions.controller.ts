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
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto } from './dto';
import { Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '../../common/enums';

@ApiTags('Questions')
@ApiBearerAuth()
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new question',
    description: 'Create a new question with answer options for a level (requires Teacher, Center, or Agency role)',
  })
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponse({
    status: 201,
    description: 'Question created successfully with answer options',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Parent level not found' })
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all questions',
    description: 'Retrieves all active questions with answer options. Optionally filter by levelId',
  })
  @ApiResponse({
    status: 200,
    description: 'Questions retrieved successfully with answer options',
  })
  @ApiQuery({
    name: 'levelId',
    required: false,
    type: Number,
    description: 'Filter questions by level ID',
  })
  findAll(@Query('levelId', new ParseIntPipe({ optional: true })) levelId?: number) {
    return this.questionsService.findAll(levelId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a question by ID',
    description: 'Retrieves a specific question with all answer options',
  })
  @ApiResponse({
    status: 200,
    description: 'Question retrieved successfully with answer options',
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  @ApiOperation({
    summary: 'Update a question',
    description: 'Update question details and answer options (requires Teacher, Center, or Agency role)',
  })
  @ApiBody({ type: UpdateQuestionDto })
  @ApiResponse({
    status: 200,
    description: 'Question updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENCY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a question',
    description: 'Delete a question (requires Agency role only - will cascade delete all answer options)',
  })
  @ApiResponse({ status: 204, description: 'Question deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only Agency can delete questions' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.remove(id);
  }
}
