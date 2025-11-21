import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { StartLevelDto, SubmitAnswerDto, CompleteLevelDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '../../common/enums';

@ApiTags('Progress')
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('levels/:id/start')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start a level attempt',
    description: 'Creates a new level attempt for the authenticated student (Student role only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Level attempt started successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only students can start levels' })
  @ApiResponse({ status: 404, description: 'Level not found' })
  startLevel(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) levelId: number,
  ) {
    return this.progressService.startLevel(user.id, levelId);
  }

  @Post('questions/:id/answer')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit an answer to a question',
    description: 'Records student answer and calculates correctness (Student role only)',
  })
  @ApiBody({ type: SubmitAnswerDto })
  @ApiResponse({
    status: 201,
    description: 'Answer submitted successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only students can submit answers' })
  @ApiResponse({ status: 404, description: 'Question or attempt not found' })
  submitAnswer(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) questionId: number,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ) {
    return this.progressService.submitAnswer(
      user.id,
      questionId,
      submitAnswerDto,
    );
  }

  @Post('levels/:id/complete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete a level attempt',
    description: 'Marks a level as completed and updates progress (Student role only)',
  })
  @ApiBody({ type: CompleteLevelDto })
  @ApiResponse({
    status: 200,
    description: 'Level completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only students can complete levels' })
  @ApiResponse({ status: 404, description: 'Level attempt not found' })
  completeLevel(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) levelId: number,
    @Body() completeLevelDto: CompleteLevelDto,
  ) {
    return this.progressService.completeLevel(
      user.id,
      levelId,
      completeLevelDto,
    );
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my learning progress',
    description: 'Retrieves overall progress summary for the authenticated student including chapters, units, and level attempts',
  })
  @ApiResponse({
    status: 200,
    description: 'Progress retrieved successfully with detailed statistics',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  getMyProgress(@CurrentUser() user: any) {
    return this.progressService.getStudentProgress(user.id);
  }

  @Get('chapters/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get chapter progress',
    description: 'Retrieves chapter-specific progress including completed units and average score',
  })
  @ApiResponse({
    status: 200,
    description: 'Chapter progress retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Chapter not found or no progress data' })
  getChapterProgress(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) chapterId: number,
  ) {
    return this.progressService.getChapterProgress(user.id, chapterId);
  }

  @Get('units/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get unit progress',
    description: 'Retrieves unit-specific progress including completed levels and average score',
  })
  @ApiResponse({
    status: 200,
    description: 'Unit progress retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Unit not found or no progress data' })
  getUnitProgress(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) unitId: number,
  ) {
    return this.progressService.getUnitProgress(user.id, unitId);
  }
}
