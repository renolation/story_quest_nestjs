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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import {
  CreateTeacherDto,
  UpdateTeacherDto,
  TeacherResponseDto,
  PaginatedTeachersResponseDto,
} from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';
import { TeacherStatus } from './entities/teacher.entity';
import { plainToInstance } from 'class-transformer';

/**
 * Teachers Controller
 *
 * Manages teacher CRUD operations with role-based access control.
 *
 * Key Features:
 * 1. Role-based teacher creation:
 *    - AGENCY creates teacher → Must specify centerId
 *    - CENTER creates teacher → centerId auto-filled from their center
 * 2. Access control enforced at service layer
 */
@ApiTags('teachers')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  /**
   * Create a new teacher
   *
   * AGENCY: Must provide centerId (can create for any center)
   * CENTER: centerId is auto-filled (creates for their own center)
   */
  @Post()
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new teacher',
    description: `
      Create a new teacher with role-based center assignment:

      **AGENCY role:**
      - MUST provide centerId
      - Can create teacher for ANY center

      **CENTER role:**
      - centerId is AUTO-FILLED from their own center
      - Can ONLY create teachers for their own center
      - If centerId is provided in request, it will be ignored/validated

      Process:
      1. Creates User account with TEACHER role
      2. Creates Teacher profile linked to user
      3. Assigns to specified center
    `,
  })
  @ApiBody({ type: CreateTeacherDto })
  @ApiResponse({
    status: 201,
    description: 'Teacher created successfully',
    type: TeacherResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or missing centerId (for AGENCY)',
    schema: {
      example: {
        statusCode: 400,
        message: 'AGENCY must specify centerId when creating a teacher',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - CENTER trying to create for different center',
  })
  @ApiResponse({
    status: 404,
    description: 'Center or Branch not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Email or username already exists',
  })
  async create(
    @Body() createTeacherDto: CreateTeacherDto,
    @CurrentUser() user: User,
  ): Promise<TeacherResponseDto> {
    const teacher = await this.teachersService.create(createTeacherDto, user);

    return plainToInstance(
      TeacherResponseDto,
      {
        ...teacher,
        createdAt: teacher.createdAt.toISOString(),
        updatedAt: teacher.updatedAt.toISOString(),
      },
      { excludeExtraneousValues: true },
    );
  }

  /**
   * Get all teachers with pagination
   *
   * AGENCY: View all teachers (can filter by centerId)
   * CENTER: View own center's teachers only
   */
  @Get()
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @ApiOperation({
    summary: 'Get all teachers',
    description: `
      Retrieve a paginated list of teachers with role-based filtering:

      **AGENCY role:**
      - View ALL teachers across all centers
      - Can filter by centerId

      **CENTER role:**
      - View ONLY their own center's teachers
      - centerId filter is ignored (always their own center)
    `,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
    example: 20,
  })
  @ApiQuery({
    name: 'centerId',
    required: false,
    type: Number,
    description: 'Filter by center ID (AGENCY only)',
    example: 1,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TeacherStatus,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name, email, or username',
  })
  @ApiResponse({
    status: 200,
    description: 'Teachers retrieved successfully',
    type: PaginatedTeachersResponseDto,
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('centerId') centerId?: number,
    @Query('status') status?: TeacherStatus,
    @Query('search') search?: string,
    @CurrentUser() user?: User,
  ): Promise<PaginatedTeachersResponseDto> {
    return this.teachersService.findAll(
      page,
      limit,
      centerId,
      status,
      search,
      user,
    );
  }

  /**
   * Get a single teacher by ID
   *
   * AGENCY: View any teacher
   * CENTER: View own center's teachers only
   * TEACHER: View own profile only
   */
  @Get(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get teacher by ID',
    description: `
      Retrieve a single teacher by ID with role-based access:

      **AGENCY role:** View any teacher
      **CENTER role:** View own center's teachers only
      **TEACHER role:** View own profile only
    `,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Teacher ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Teacher retrieved successfully',
    type: TeacherResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot view this teacher',
  })
  @ApiResponse({
    status: 404,
    description: 'Teacher not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ): Promise<TeacherResponseDto> {
    const teacher = await this.teachersService.findOne(id, user);

    return plainToInstance(
      TeacherResponseDto,
      {
        ...teacher,
        createdAt: teacher.createdAt.toISOString(),
        updatedAt: teacher.updatedAt.toISOString(),
      },
      { excludeExtraneousValues: true },
    );
  }

  /**
   * Update a teacher
   *
   * AGENCY: Update any teacher
   * CENTER: Update own center's teachers only
   * TEACHER: Update own profile only (limited fields)
   */
  @Patch(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Update teacher',
    description: `
      Update a teacher with role-based permissions:

      **AGENCY role:** Update any teacher
      **CENTER role:** Update own center's teachers only
      **TEACHER role:** Update own profile only

      Note: Cannot change user_id or center_id after creation
    `,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Teacher ID',
    example: 1,
  })
  @ApiBody({ type: UpdateTeacherDto })
  @ApiResponse({
    status: 200,
    description: 'Teacher updated successfully',
    type: TeacherResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot update this teacher',
  })
  @ApiResponse({
    status: 404,
    description: 'Teacher or Branch not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @CurrentUser() user?: User,
  ): Promise<TeacherResponseDto> {
    const teacher = await this.teachersService.update(id, updateTeacherDto, user);

    return plainToInstance(
      TeacherResponseDto,
      {
        ...teacher,
        createdAt: teacher.createdAt.toISOString(),
        updatedAt: teacher.updatedAt.toISOString(),
      },
      { excludeExtraneousValues: true },
    );
  }

  /**
   * Delete a teacher (soft delete)
   *
   * AGENCY: Delete any teacher
   * CENTER: Delete own center's teachers only
   */
  @Delete(':id')
  @Roles(UserRole.AGENCY, UserRole.CENTER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete teacher',
    description: `
      Soft delete a teacher by setting status to inactive:

      **AGENCY role:** Delete any teacher
      **CENTER role:** Delete own center's teachers only
    `,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Teacher ID',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Teacher deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot delete this teacher',
  })
  @ApiResponse({
    status: 404,
    description: 'Teacher not found',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ): Promise<void> {
    await this.teachersService.remove(id, user);
  }

  /**
   * Get classes assigned to a teacher
   *
   * AGENCY: View classes for any teacher
   * CENTER: View classes for teachers in own center
   * TEACHER: View own assigned classes only
   */
  @Get(':id/classes')
  @Roles(UserRole.AGENCY, UserRole.CENTER, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get teacher classes',
    description: `
      Get all classes assigned to a teacher:

      **AGENCY role:** View classes for any teacher
      **CENTER role:** View classes for teachers in own center
      **TEACHER role:** View own assigned classes only
    `,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Teacher ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Teacher classes retrieved successfully',
  })
  async getTeacherClasses(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ) {
    return await this.teachersService.getTeacherClasses(id, user);
  }

  /**
   * Get students for a teacher (grouped by class)
   *
   * AGENCY: View students for any teacher
   * CENTER: View students for teachers in own center
   * TEACHER: View own students only
   */
  @Get(':id/students')
  @Roles(UserRole.AGENCY, UserRole.CENTER, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get teacher students',
    description: `
      Get all students for a teacher, grouped by class:

      **AGENCY role:** View students for any teacher
      **CENTER role:** View students for teachers in own center
      **TEACHER role:** View own students only
    `,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Teacher ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Teacher students retrieved successfully (grouped by class)',
  })
  async getTeacherStudents(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ) {
    return await this.teachersService.getTeacherStudents(id, user);
  }

  /**
   * Get all unique students for a teacher (flattened list)
   *
   * AGENCY: View students for any teacher
   * CENTER: View students for teachers in own center
   * TEACHER: View own students only
   */
  @Get(':id/students/list')
  @Roles(UserRole.AGENCY, UserRole.CENTER, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get teacher students list',
    description: `
      Get all unique students for a teacher as a flattened list:

      **AGENCY role:** View students for any teacher
      **CENTER role:** View students for teachers in own center
      **TEACHER role:** View own students only
    `,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Teacher ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Teacher students list retrieved successfully',
  })
  async getTeacherStudentsList(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ) {
    return await this.teachersService.getTeacherStudentsList(id, user);
  }
}
