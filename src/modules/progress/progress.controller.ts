import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { StartLevelDto } from './dto/start-level.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { CompleteLevelDto } from './dto/complete-level.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Progress')
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('levels/:id/start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start a level attempt',
    description: 'Creates a new level attempt for the authenticated student',
  })
  @ApiResponse({
    status: 201,
    description: 'Level attempt started successfully',
  })
  @ApiResponse({ status: 404, description: 'Level not found' })
  startLevel(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) levelId: number,
  ) {
    return this.progressService.startLevel(user.id, levelId);
  }

  @Post('questions/:id/answer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit an answer to a question',
    description: 'Records student answer and calculates correctness',
  })
  @ApiResponse({
    status: 201,
    description: 'Answer submitted successfully',
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete a level attempt',
    description: 'Marks a level as completed and updates progress',
  })
  @ApiResponse({
    status: 200,
    description: 'Level completed successfully',
  })
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
    description: 'Retrieves overall progress for the authenticated student',
  })
  @ApiResponse({
    status: 200,
    description: 'Progress retrieved successfully',
  })
  getMyProgress(@CurrentUser() user: any) {
    return this.progressService.getStudentProgress(user.id);
  }

  @Get('chapters/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get chapter progress',
    description: 'Retrieves chapter-specific progress',
  })
  @ApiResponse({
    status: 200,
    description: 'Chapter progress retrieved successfully',
  })
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
    description: 'Retrieves unit-specific progress',
  })
  @ApiResponse({
    status: 200,
    description: 'Unit progress retrieved successfully',
  })
  getUnitProgress(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) unitId: number,
  ) {
    return this.progressService.getUnitProgress(user.id, unitId);
  }
}
