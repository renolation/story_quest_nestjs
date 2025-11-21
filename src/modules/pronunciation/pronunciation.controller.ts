import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PronunciationService } from './pronunciation.service';
import { CreatePronunciationAttemptDto } from './dto/create-pronunciation-attempt.dto';
import { UpdatePronunciationAttemptDto } from './dto/update-pronunciation-attempt.dto';
import { PronunciationHistoryQueryDto } from './dto/pronunciation-history-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

/**
 * Pronunciation Controller
 *
 * Architecture Note:
 * - Speech recognition is CLIENT-SIDE (mobile app uses native speech APIs)
 * - Backend only stores pronunciation attempts with client-calculated scores
 * - Students can only access their own attempts
 * - All endpoints require STUDENT role authentication
 */
@ApiTags('Pronunciation')
@ApiBearerAuth()
@Controller('pronunciation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class PronunciationController {
  constructor(private readonly pronunciationService: PronunciationService) {}

  @Post('attempts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create pronunciation attempt',
    description:
      'Record a new pronunciation attempt with client-calculated scores (Student role only)',
  })
  @ApiBody({ type: CreatePronunciationAttemptDto })
  @ApiResponse({
    status: 201,
    description: 'Pronunciation attempt created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
  async create(
    @CurrentUser() user: any,
    @Body() createDto: CreatePronunciationAttemptDto,
  ) {
    return this.pronunciationService.create(user.id, createDto);
  }

  @Get('attempts')
  @ApiOperation({
    summary: 'Get my pronunciation history',
    description:
      'Retrieve pronunciation attempt history for the authenticated student with optional filters (Student role only)',
  })
  @ApiQuery({
    name: 'levelId',
    required: false,
    type: Number,
    description: 'Filter by level ID',
  })
  @ApiQuery({
    name: 'questionId',
    required: false,
    type: Number,
    description: 'Filter by question ID',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of records to return',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Pronunciation attempts retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
  async findAll(
    @CurrentUser() user: any,
    @Query() query: PronunciationHistoryQueryDto,
  ) {
    return this.pronunciationService.findAllByStudent(user.id, query);
  }

  @Get('attempts/:id')
  @ApiOperation({
    summary: 'Get specific pronunciation attempt',
    description:
      'Retrieve a specific pronunciation attempt by ID (Student role only - can only access own attempts)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Pronunciation attempt ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Pronunciation attempt retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Student role required or attempt belongs to another student',
  })
  @ApiResponse({
    status: 404,
    description: 'Pronunciation attempt not found',
  })
  async findOne(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.pronunciationService.findOne(id, user.id);
  }

  @Patch('attempts/:id')
  @ApiOperation({
    summary: 'Update pronunciation attempt',
    description:
      'Update a pronunciation attempt with additional scores or recognized text (Student role only - can only update own attempts)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Pronunciation attempt ID',
  })
  @ApiBody({ type: UpdatePronunciationAttemptDto })
  @ApiResponse({
    status: 200,
    description: 'Pronunciation attempt updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Student role required or attempt belongs to another student',
  })
  @ApiResponse({
    status: 404,
    description: 'Pronunciation attempt not found',
  })
  async update(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePronunciationAttemptDto,
  ) {
    return this.pronunciationService.update(id, user.id, updateDto);
  }

  @Get('best-score/:questionId')
  @ApiOperation({
    summary: 'Get best pronunciation score for a question',
    description:
      'Retrieve the best pronunciation score achieved for a specific question (Student role only)',
  })
  @ApiParam({
    name: 'questionId',
    type: Number,
    description: 'Question ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Best score retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        questionId: { type: 'number', example: 5 },
        bestScore: { type: 'number', example: 87.5, nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
  async getBestScore(
    @CurrentUser() user: any,
    @Param('questionId', ParseIntPipe) questionId: number,
  ) {
    const bestScore = await this.pronunciationService.getBestScore(
      user.id,
      questionId,
    );
    return { questionId, bestScore };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get pronunciation attempt statistics',
    description:
      'Retrieve statistics about pronunciation attempts for the authenticated student (Student role only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalAttempts: { type: 'number', example: 42 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
  async getStats(@CurrentUser() user: any) {
    const totalAttempts = await this.pronunciationService.getAttemptCount(
      user.id,
    );
    return { totalAttempts };
  }
}
