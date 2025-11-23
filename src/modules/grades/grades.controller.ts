import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { CreateGradeDto, UpdateGradeDto, GradeResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { plainToInstance } from 'class-transformer';

/**
 * Grades Controller
 *
 * Manages grade levels (3, 4, 5) for the English learning app.
 * Public endpoints for viewing, AGENCY-only for management.
 */
@ApiTags('grades')
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCY)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new grade level (AGENCY only)' })
  @ApiResponse({
    status: 201,
    description: 'Grade created successfully',
    type: GradeResponseDto,
  })
  async create(@Body() createGradeDto: CreateGradeDto): Promise<GradeResponseDto> {
    const grade = await this.gradesService.create(createGradeDto);
    return plainToInstance(
      GradeResponseDto,
      {
        ...grade,
        createdAt: grade.createdAt.toISOString(),
      },
      { excludeExtraneousValues: true },
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all grade levels (public)' })
  @ApiResponse({
    status: 200,
    description: 'List of all grades',
    type: [GradeResponseDto],
  })
  async findAll(): Promise<GradeResponseDto[]> {
    const grades = await this.gradesService.findAll();
    return grades.map((grade) =>
      plainToInstance(
        GradeResponseDto,
        {
          ...grade,
          createdAt: grade.createdAt.toISOString(),
        },
        { excludeExtraneousValues: true },
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a grade by ID (public)' })
  @ApiResponse({
    status: 200,
    description: 'Grade details',
    type: GradeResponseDto,
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<GradeResponseDto> {
    const grade = await this.gradesService.findOne(id);
    return plainToInstance(
      GradeResponseDto,
      {
        ...grade,
        createdAt: grade.createdAt.toISOString(),
      },
      { excludeExtraneousValues: true },
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a grade (AGENCY only)' })
  @ApiResponse({
    status: 200,
    description: 'Grade updated successfully',
    type: GradeResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGradeDto: UpdateGradeDto,
  ): Promise<GradeResponseDto> {
    const grade = await this.gradesService.update(id, updateGradeDto);
    return plainToInstance(
      GradeResponseDto,
      {
        ...grade,
        createdAt: grade.createdAt.toISOString(),
      },
      { excludeExtraneousValues: true },
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENCY)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a grade (AGENCY only)' })
  @ApiResponse({ status: 204, description: 'Grade deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.gradesService.remove(id);
  }
}
